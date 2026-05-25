import mongoose from "mongoose";

/**
 * Auto-incrementing SKU generator using a MongoDB counter collection.
 *
 * Product SKUs:  IMS-000001, IMS-000002, …
 * Variant SKUs:  IMS-000001-V01, IMS-000001-V02, …
 */

interface ICounter {
  _id: string;
  seq: number;
}

const counterSchema = new mongoose.Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);

/**
 * Get the next sequential number for a given counter scope.
 */
async function getNextSeq(scope: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { _id: scope },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return doc!.seq;
}

/**
 * Generate a unique product SKU.
 * Format: `IMS-000001`
 */
export async function generateProductSku(): Promise<string> {
  const seq = await getNextSeq("product_sku");
  return `IMS-${String(seq).padStart(6, "0")}`;
}

/**
 * Generate a unique variant SKU for a given product SKU.
 * Format: `IMS-000001-V01`
 *
 * @param productSku  The parent product's SKU
 * @param variantIndex  0-based index of this variant (used as fallback)
 */
export async function generateVariantSku(
  productSku: string,
  variantIndex: number = 0
): Promise<string> {
  const seq = await getNextSeq(`variant_sku_${productSku}`);
  return `${productSku}-V${String(seq).padStart(2, "0")}`;
}
