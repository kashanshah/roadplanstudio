import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("S3 credentials are not configured");
  }

  return new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: Boolean(endpoint),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function requireBucket() {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET is not configured");
  return bucket;
}

/** Create a short-lived pre-signed PUT URL for browser uploads. */
export async function createUploadUrl(key: string, contentType: string) {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: requireBucket(),
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
  const publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL?.replace(/\/$/, "");
  return {
    uploadUrl: url,
    publicUrl: publicBase ? `${publicBase}/${key}` : key,
    key,
  };
}

export async function deleteObject(key: string) {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: requireBucket(),
      Key: key,
    }),
  );
}
