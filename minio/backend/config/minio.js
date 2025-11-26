import { Client } from 'minio';

// Initialize MinIO client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Initialize buckets
export const initializeBuckets = async () => {
  const buckets = [
    process.env.MINIO_DOCUMENTS_BUCKET,
    process.env.MINIO_VIDEOS_BUCKET,
  ];

  try {
    for (const bucket of buckets) {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        console.log(`✅ Bucket created: ${bucket}`);
        
        // Set bucket policy to allow public read access
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
      } else {
        console.log(`✅ Bucket exists: ${bucket}`);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing buckets:', error.message);
    throw error;
  }
};

export default minioClient;
