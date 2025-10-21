#!/usr/bin/env node

/**
 * Upload test data to Railway S3 bucket
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configure S3 client for Railway
const s3Client = new S3Client({
  endpoint: 'https://b1.us-east-1.storage.railway.app',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'QERZ1Q1LAZGEWOY3KAUK',
    secretAccessKey: 'cYdzceH8qpVycs7znWKzOevdp76Y20u0GmdlEali'
  },
  forcePathStyle: true
});

async function uploadTestData() {
  const bucketName = 'stackable-foodbox-kqa9-zq';

  console.log('📤 Uploading test data to Railway S3');
  console.log('=' .repeat(40));

  // Test data samples
  const testFiles = [
    {
      key: 'test/sample-data.json',
      content: JSON.stringify([
        { id: 1, name: 'Alice', department: 'Engineering' },
        { id: 2, name: 'Bob', department: 'Marketing' },
        { id: 3, name: 'Charlie', department: 'Sales' }
      ], null, 2),
      contentType: 'application/json'
    },
    {
      key: 'test/sample.csv',
      content: 'id,name,department\n1,Alice,Engineering\n2,Bob,Marketing\n3,Charlie,Sales',
      contentType: 'text/csv'
    },
    {
      key: 'test/readme.txt',
      content: 'This is a test file for Railway S3 integration.\nCreated on: ' + new Date().toISOString(),
      contentType: 'text/plain'
    }
  ];

  for (const file of testFiles) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: file.key,
        Body: file.content,
        ContentType: file.contentType
      });

      await s3Client.send(command);
      console.log(`✅ Uploaded: ${file.key} (${file.content.length} bytes)`);
    } catch (error) {
      console.error(`❌ Failed to upload ${file.key}:`, error.message);
    }
  }

  console.log('\n✨ Test data upload complete!');
  console.log('Run "node list-s3-bucket.js" to see the uploaded files.');
}

uploadTestData();