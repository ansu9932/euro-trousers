import { CreateBucketCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const bucket = process.env.MINIO_BUCKET ?? 'customs-documents';
const client = new S3Client({ endpoint: `http://${process.env.MINIO_ENDPOINT ?? 'localhost'}:${process.env.MINIO_PORT ?? '9000'}`, region: 'us-east-1', forcePathStyle: true, credentials: { accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'customs-minio', secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'customs-minio-local' } });
export async function ensureBucket() { try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
}
catch {
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
} }
export async function uploadObject(key, body, contentType) { await ensureBucket(); await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })); return key; }
export async function signedDownload(key) { return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 300 }); }
