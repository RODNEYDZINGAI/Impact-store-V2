import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function testR2() {
  const bucket = process.env.R2_BUCKET_NAME!;
  console.log(`Testing R2 bucket: ${bucket}`);
  console.log(`Public URL: ${process.env.R2_PUBLIC_URL}`);
  console.log("---");

  // 1. List objects
  try {
    const list = await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 }));
    console.log("✅ LIST: Connected successfully");
    console.log(`   Objects in bucket: ${list.KeyCount || 0}`);
    if (list.Contents) {
      list.Contents.forEach((obj) => console.log(`   - ${obj.Key} (${obj.Size} bytes)`));
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.log("❌ LIST failed:", error.message);
    return;
  }

  // 2. Upload a test file
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: "_test-connection.txt",
      Body: "Impact Store R2 connection test - safe to delete",
      ContentType: "text/plain",
    }));
    console.log("✅ UPLOAD: Write access works");
  } catch (err: unknown) {
    const error = err as Error;
    console.log("❌ UPLOAD failed:", error.message);
    return;
  }

  // 3. Delete test file
  try {
    await client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: "_test-connection.txt",
    }));
    console.log("✅ DELETE: Delete access works");
  } catch (err: unknown) {
    const error = err as Error;
    console.log("❌ DELETE failed:", error.message);
  }

  console.log("---");
  console.log("🎉 R2 bucket is ready!");
}

testR2();
