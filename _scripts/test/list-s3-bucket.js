#!/usr/bin/env node

/**
 * List contents of Railway S3 bucket
 */

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

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

async function listBucketContents() {
  const bucketName = 'stackable-foodbox-kqa9-zq';

  console.log(`📦 Listing contents of bucket: ${bucketName}`);
  console.log('=' .repeat(60));

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 100 // Limit to 100 objects for initial view
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log('\n🗂️  Bucket is empty');
      return;
    }

    console.log(`\n📁 Found ${response.Contents.length} objects:\n`);

    // Group files by directory
    const directories = {};
    const rootFiles = [];

    response.Contents.forEach(obj => {
      const parts = obj.Key.split('/');
      if (parts.length > 1) {
        const dir = parts[0];
        if (!directories[dir]) {
          directories[dir] = [];
        }
        directories[dir].push({
          name: parts.slice(1).join('/'),
          size: obj.Size,
          modified: obj.LastModified
        });
      } else {
        rootFiles.push({
          name: obj.Key,
          size: obj.Size,
          modified: obj.LastModified
        });
      }
    });

    // Display root files
    if (rootFiles.length > 0) {
      console.log('📄 Root files:');
      rootFiles.forEach(file => {
        console.log(`   - ${file.name} (${formatBytes(file.size)}) - ${formatDate(file.modified)}`);
      });
      console.log('');
    }

    // Display directories and their contents
    Object.keys(directories).sort().forEach(dir => {
      console.log(`📂 ${dir}/`);
      directories[dir].slice(0, 5).forEach(file => {
        console.log(`   - ${file.name} (${formatBytes(file.size)}) - ${formatDate(file.modified)}`);
      });
      if (directories[dir].length > 5) {
        console.log(`   ... and ${directories[dir].length - 5} more files`);
      }
      console.log('');
    });

    if (response.IsTruncated) {
      console.log(`\n⚠️  Showing first ${response.Contents.length} objects (more available)`);
    }

    // Show total size
    const totalSize = response.Contents.reduce((sum, obj) => sum + obj.Size, 0);
    console.log(`\n📊 Total size: ${formatBytes(totalSize)}`);
    console.log(`📈 Total objects: ${response.Contents.length}`);

  } catch (error) {
    console.error('\n❌ Error listing bucket contents:');
    console.error(error.message);

    if (error.name === 'AccessDenied') {
      console.error('\n⚠️  Check your AWS credentials in the script');
    }
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Check if AWS SDK is installed
try {
  require('@aws-sdk/client-s3');
  listBucketContents();
} catch (error) {
  console.log('📦 Installing AWS SDK...');
  const { execSync } = require('child_process');
  execSync('npm install @aws-sdk/client-s3', { stdio: 'inherit' });
  console.log('✅ AWS SDK installed. Please run the script again.');
}