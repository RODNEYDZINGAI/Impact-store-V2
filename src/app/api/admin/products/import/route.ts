import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as XLSX from "xlsx";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import {
  PRODUCT_IMPORT_HEADERS,
  ProductPayload,
  generateSlug,
  normalizeProductRow,
  validateProductInput,
} from "@/lib/product-validation";

type ImportStrategy = "create" | "update" | "upsert";
type ImportMode = "dry-run" | "commit";

interface ImportRowResult {
  row: number;
  sku?: string;
  slug?: string;
  name?: string;
  action?: "create" | "update";
  errors: string[];
  warnings: string[];
}

const MAX_IMPORT_BYTES = 4 * 1024 * 1024;
const MAX_IMPORT_ROWS = 500;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(session && session.user.role === "admin");
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = [
    Object.fromEntries(PRODUCT_IMPORT_HEADERS.map((header) => [header, header])),
    {
      sku: "LAP-DEL-7420",
      name: "Dell Latitude 7420",
      slug: "dell-latitude-7420",
      brand: "Dell",
      category: "Laptops",
      condition: "Refurbished",
      price: 8999,
      originalPrice: 10999,
      stock: 8,
      featured: "yes",
      published: "yes",
      subtitle: "Business laptop for teams",
      description: "A reliable Latitude laptop for office productivity and remote work.",
      images: "/impact/evp/laptops2.jpg, /impact/evp/laptops3.jpg, /impact/evp/laptops0.jpg",
      specs: "CPU:Intel Core i5;RAM:16GB;Storage:512GB SSD;Warranty:12 months",
    },
    {
      sku: "SEC-HIK-DS2",
      name: "Hikvision Dome Camera",
      slug: "hikvision-dome-camera",
      brand: "Hikvision",
      category: "Security & Access Control",
      condition: "New",
      price: 1499,
      originalPrice: "",
      stock: 20,
      featured: "no",
      published: "yes",
      subtitle: "Indoor surveillance camera",
      description: "Compact dome camera for office and retail security installations.",
      images: "https://your-r2-public-url.example/products/hikvision-dome/front.jpg, https://your-r2-public-url.example/products/hikvision-dome/side.jpg",
      specs: "Resolution:4MP;Lens:2.8mm;Use:Indoor",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [...PRODUCT_IMPORT_HEADERS],
    skipHeader: true,
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="impact-product-import-template.xlsx"',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const mode = normalizeMode(formData.get("mode"));
    const strategy = normalizeStrategy(formData.get("strategy"));
    const defaultPublished = String(formData.get("defaultPublished") ?? "true") !== "false";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Spreadsheet file is required" }, { status: 400 });
    }
    if (file.size > MAX_IMPORT_BYTES) {
      return NextResponse.json({ error: "Spreadsheet is too large. Maximum size is 4MB." }, { status: 400 });
    }

    const rows = await readSpreadsheet(file);
    if (!rows.length) {
      return NextResponse.json({ error: "Spreadsheet has no product rows" }, { status: 400 });
    }
    if (rows.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        { error: `Spreadsheet has ${rows.length} rows. Maximum allowed is ${MAX_IMPORT_ROWS}.` },
        { status: 400 }
      );
    }

    await dbConnect();

    const resultRows: ImportRowResult[] = [];
    const validRows: { row: number; product: ProductPayload; action: "create" | "update"; existingId?: string }[] = [];
    const seenSkus = new Map<string, number>();
    const seenSlugs = new Map<string, number>();

    for (const [index, rawRow] of rows.entries()) {
      const rowNumber = index + 2;
      const result = validateProductInput(rawRow, { defaultPublished });
      const rowResult: ImportRowResult = {
        row: rowNumber,
        errors: [...result.errors],
        warnings: [...result.warnings],
      };

      if (result.product) {
        const product = result.product;
        rowResult.sku = product.sku;
        rowResult.slug = product.slug;
        rowResult.name = product.name;

        if (product.sku) {
          const duplicateRow = seenSkus.get(product.sku);
          if (duplicateRow) rowResult.errors.push(`Duplicate SKU also appears on row ${duplicateRow}.`);
          seenSkus.set(product.sku, rowNumber);
        }

        const duplicateSlugRow = seenSlugs.get(product.slug);
        if (duplicateSlugRow) rowResult.errors.push(`Duplicate slug also appears on row ${duplicateSlugRow}.`);
        seenSlugs.set(product.slug, rowNumber);

        const existing = await findExistingProduct(product);
        if (strategy === "create" && existing) {
          rowResult.errors.push("Product already exists with this SKU or slug.");
        }
        if (strategy === "update" && !existing) {
          rowResult.errors.push("No existing product found for this SKU or slug.");
        }

        if (!rowResult.errors.length) {
          const action = existing ? "update" : "create";
          rowResult.action = action;
          validRows.push({
            row: rowNumber,
            product: action === "create" ? await prepareCreateProduct(product) : product,
            action,
            existingId: existing?._id.toString(),
          });
        }
      }

      resultRows.push(rowResult);
    }

    const summary = {
      totalRows: rows.length,
      validRows: validRows.length,
      errorRows: resultRows.filter((row) => row.errors.length > 0).length,
      warningRows: resultRows.filter((row) => row.warnings.length > 0).length,
      createRows: validRows.filter((row) => row.action === "create").length,
      updateRows: validRows.filter((row) => row.action === "update").length,
    };

    if (mode === "dry-run" || summary.errorRows > 0) {
      return NextResponse.json({ mode: "dry-run", strategy, summary, rows: resultRows });
    }

    const committed = { created: 0, updated: 0 };
    for (const row of validRows) {
      if (row.action === "update" && row.existingId) {
        await Product.findByIdAndUpdate(
          row.existingId,
          { $set: row.product },
          { runValidators: true }
        );
        committed.updated += 1;
      } else {
        await Product.create(row.product);
        committed.created += 1;
      }
    }

    return NextResponse.json({
      mode: "commit",
      strategy,
      summary: { ...summary, ...committed },
      rows: resultRows,
    });
  } catch (error) {
    console.error("Product import error:", error);
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 });
  }
}

async function readSpreadsheet(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
    raw: false,
  });

  return rows
    .map((row) => normalizeProductRow(row))
    .filter((row) => Object.values(row).some((value) => String(value).trim() !== ""));
}

async function findExistingProduct(product: ProductPayload) {
  const conditions: Record<string, string>[] = [{ slug: product.slug }];
  if (product.sku) conditions.unshift({ sku: product.sku });
  return Product.findOne({ $or: conditions }).select("_id").lean();
}

async function prepareCreateProduct(product: ProductPayload) {
  let slug = product.slug || generateSlug(product.name);
  if (!slug) slug = generateSlug(product.sku || product.name);

  const baseSlug = slug;
  let counter = 2;
  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return { ...product, slug };
}

function normalizeMode(value: FormDataEntryValue | null): ImportMode {
  return value === "commit" ? "commit" : "dry-run";
}

function normalizeStrategy(value: FormDataEntryValue | null): ImportStrategy {
  if (value === "update" || value === "upsert") return value;
  return "create";
}
