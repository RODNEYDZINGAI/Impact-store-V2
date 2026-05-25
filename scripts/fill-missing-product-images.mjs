import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Load .env.local explicitly if dotenv/config didn't pick it up
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PRODUCTS = [
  { name: 'TP-Link Omada ER605 Gigabit VPN Router', query: 'TP-Link Omada ER605 Gigabit VPN Router product image South Africa', prefer: ['tp-link.com', 'miro.co.za', 'scoop.co.za', 'firstshop.co.za', 'takealot.com'] },
  { name: 'Synology DiskStation DS923+ 4-Bay NAS', query: 'Synology DiskStation DS923+ 4-Bay NAS product image South Africa', prefer: ['synology.com', 'firstshop.co.za', 'takealot.com', 'evetech.co.za', 'geewiz.co.za'] },
  { name: 'Lenovo ThinkPad E16 Gen 2 16-inch Business Laptop', query: 'Lenovo ThinkPad E16 Gen 2 16 inch product image South Africa', prefer: ['lenovo.com', 'firstshop.co.za', 'takealot.com', 'incredible.co.za', 'evetech.co.za'] },
  { name: 'Dell Latitude 5450 14-inch Business Laptop', query: 'Dell Latitude 5450 14 inch product image South Africa', prefer: ['dell.com', 'firstshop.co.za', 'takealot.com', 'incredible.co.za', 'evetech.co.za'] },
  { name: 'Samsung Galaxy Tab S10 FE 128GB Wi-Fi', query: 'Samsung Galaxy Tab S10 FE 128GB Wi-Fi product image South Africa', prefer: ['samsung.com', 'takealot.com', 'makro.co.za', 'incredible.co.za', 'hificorp.co.za'] },
  { name: 'Hikvision 8-Channel NVR', query: 'Hikvision DS-7608NXI-K2 8 channel NVR product image South Africa', prefer: ['hikvision.com', 'miro.co.za', 'takealot.com', 'geewiz.co.za', 'scoop.co.za'] },
  { name: 'ZKTeco K40 Pro Fingerprint Access Control', query: 'ZKTeco K40 Pro Fingerprint Access Control product image South Africa', prefer: ['zkteco.co.za', 'zkteco.eu', 'takealot.com', 'geewiz.co.za', 'miro.co.za'] },
  { name: 'Samsung T7 Portable SSD 1TB', query: 'Samsung T7 Portable SSD 1TB product image South Africa', prefer: ['samsung.com', 'takealot.com', 'makro.co.za', 'incredible.co.za', 'evetech.co.za'] },
];

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
}
function scoreResult(result, prefer) {
  const hay = `${result.title || ''} ${result.source || ''} ${result.link || ''} ${result.original || ''}`.toLowerCase();
  let score = 0;
  for (let i = 0; i < prefer.length; i++) {
    if (hay.includes(prefer[i])) score += 100 - i * 5;
  }
  if (/official|manufacturer|product/.test(hay)) score += 15;
  if (/logo|icon|manual|pdf|banner|review|youtube|pinterest|facebook|instagram/.test(hay)) score -= 60;
  if (/\.webp|\.jpg|\.jpeg|\.png/i.test(result.original || '')) score += 5;
  return score;
}

async function serpImages(item) {
  const params = new URLSearchParams({
    engine: 'google_images',
    q: item.query,
    api_key: process.env.SERPAPI_KEY,
    google_domain: 'google.co.za',
    gl: 'za',
    hl: 'en',
    safe: 'active',
  });
  const url = `https://serpapi.com/search.json?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SerpAPI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.images_results || [])
    .filter(r => r.original && /^https?:\/\//.test(r.original))
    .sort((a, b) => scoreResult(b, item.prefer) - scoreResult(a, item.prefer));
}

async function downloadImage(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
      'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const contentType = (res.headers.get('content-type') || '').split(';')[0].toLowerCase();
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 5000) throw new Error(`too small ${buffer.length}`);
  let ext = 'jpg';
  let ct = contentType;
  if (contentType.includes('png')) ext = 'png';
  else if (contentType.includes('webp')) ext = 'webp';
  else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
  else {
    // signature fallback
    if (buffer.subarray(0, 4).toString('hex') === '89504e47') { ext = 'png'; ct = 'image/png'; }
    else if (buffer.subarray(0, 3).toString('hex') === 'ffd8ff') { ext = 'jpg'; ct = 'image/jpeg'; }
    else if (buffer.subarray(8, 12).toString() === 'WEBP') { ext = 'webp'; ct = 'image/webp'; }
    else throw new Error(`unsupported content-type ${contentType}`);
  }
  if (!['jpg','png','webp'].includes(ext)) throw new Error(`unsupported ext ${ext}`);
  if (!ct || !ct.startsWith('image/')) ct = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return { buffer, ext, contentType: ct };
}

async function upload(slug, image) {
  const key = `products/${slug}/001.${image.ext}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: image.buffer,
    ContentType: image.contentType,
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

const report = [];
await mongoose.connect(process.env.MONGODB_URI);
await fs.mkdir('/tmp/impact-missing-product-images', { recursive: true });

for (const item of PRODUCTS) {
  const product = await Product.findOne({ name: item.name }).lean();
  if (!product) { report.push({ name: item.name, status: 'not-found' }); continue; }
  if (Array.isArray(product.images) && product.images.length) { report.push({ name: item.name, status: 'already-has-image', images: product.images }); continue; }
  console.log(`Searching: ${item.name}`);
  const results = await serpImages(item);
  let chosen = null;
  let lastErr = null;
  for (const r of results.slice(0, 12)) {
    try {
      const image = await downloadImage(r.original);
      const out = path.join('/tmp/impact-missing-product-images', `${product.slug}.${image.ext}`);
      await fs.writeFile(out, image.buffer);
      const publicUrl = await upload(product.slug, image);
      await Product.updateOne({ _id: product._id }, {
        $set: { images: [publicUrl] },
        $setOnInsert: {},
      });
      chosen = { source: r.source || hostOf(r.link || r.original), page: r.link, original: r.original, publicUrl, bytes: image.buffer.length, contentType: image.contentType, score: scoreResult(r, item.prefer) };
      console.log(`  OK ${publicUrl} from ${chosen.source}`);
      break;
    } catch (e) {
      lastErr = `${r.original}: ${e.message}`;
    }
  }
  if (chosen) report.push({ name: item.name, status: 'updated', ...chosen });
  else report.push({ name: item.name, status: 'failed', lastErr, candidates: results.slice(0, 5).map(r => ({source:r.source, link:r.link, original:r.original, score:scoreResult(r,item.prefer)})) });
}

await fs.writeFile('/tmp/impact-missing-product-images/report.json', JSON.stringify(report, null, 2));
console.log('\nREPORT');
console.log(JSON.stringify(report, null, 2));
await mongoose.disconnect();
