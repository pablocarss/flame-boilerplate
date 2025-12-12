import * as Minio from "minio";
import { prisma } from "./prisma";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "flame-uploads";

// Ensure bucket exists
export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    console.log(`Bucket ${BUCKET_NAME} created successfully`);
  }
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `${timestamp}-${randomString}.${extension}`;
}

// Upload file
export async function uploadFile(
  file: Buffer,
  originalName: string,
  mimeType: string,
  folder: string = "uploads",
  userId?: string
): Promise<{
  url: string;
  key: string;
  filename: string;
}> {
  await ensureBucket();

  const filename = generateFilename(originalName);
  const key = `${folder}/${filename}`;

  await minioClient.putObject(BUCKET_NAME, key, file, file.length, {
    "Content-Type": mimeType,
  });

  const url = await getPublicUrl(key);

  // Save to database
  await prisma.upload.create({
    data: {
      filename,
      originalName,
      mimeType,
      size: file.length,
      url,
      bucket: BUCKET_NAME,
      key,
      uploadedBy: userId,
    },
  });

  return { url, key, filename };
}

// Get public URL for a file
export async function getPublicUrl(key: string): Promise<string> {
  const protocol = process.env.MINIO_USE_SSL === "true" ? "https" : "http";
  const endpoint = process.env.MINIO_ENDPOINT || "localhost";
  const port = process.env.MINIO_PORT || "9000";

  return `${protocol}://${endpoint}:${port}/${BUCKET_NAME}/${key}`;
}

// Generate presigned URL for upload
export async function getPresignedUploadUrl(
  filename: string,
  folder: string = "uploads",
  expirySeconds: number = 3600
): Promise<{
  uploadUrl: string;
  key: string;
  publicUrl: string;
}> {
  await ensureBucket();

  const key = `${folder}/${generateFilename(filename)}`;

  const uploadUrl = await minioClient.presignedPutObject(
    BUCKET_NAME,
    key,
    expirySeconds
  );

  const publicUrl = await getPublicUrl(key);

  return { uploadUrl, key, publicUrl };
}

// Generate presigned URL for download
export async function getPresignedDownloadUrl(
  key: string,
  expirySeconds: number = 3600
): Promise<string> {
  return minioClient.presignedGetObject(BUCKET_NAME, key, expirySeconds);
}

// Delete file
export async function deleteFile(key: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, key);

  // Remove from database
  await prisma.upload.deleteMany({
    where: { key },
  });
}

// List files in a folder
export async function listFiles(
  folder: string = ""
): Promise<Array<{ name: string; size: number; lastModified: Date }>> {
  const objects: Array<{ name: string; size: number; lastModified: Date }> = [];

  const stream = minioClient.listObjects(BUCKET_NAME, folder, true);

  return new Promise((resolve, reject) => {
    stream.on("data", (obj) => {
      if (obj.name) {
        objects.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
        });
      }
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(objects));
  });
}

// Upload avatar
export async function uploadAvatar(
  file: Buffer,
  originalName: string,
  mimeType: string,
  userId: string
): Promise<string> {
  const { url } = await uploadFile(file, originalName, mimeType, "avatars", userId);
  return url;
}

export { minioClient, BUCKET_NAME };
