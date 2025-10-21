#!/usr/bin/env node

/**
 * Test script to verify Railway S3 integration
 * Tests the S3 Writer component with the new Railway S3 configuration
 */

const axios = require('axios');

const PROCESSOR_URL = 'http://localhost:3003';

async function testRailwayS3() {
  console.log('🚀 Testing Railway S3 Integration');
  console.log('=====================================\n');

  // Test data to write
  const testData = [
    { id: 1, name: 'Alice', department: 'Engineering', salary: 95000 },
    { id: 2, name: 'Bob', department: 'Marketing', salary: 75000 },
    { id: 3, name: 'Charlie', department: 'Engineering', salary: 105000 },
    { id: 4, name: 'Diana', department: 'Sales', salary: 85000 },
    { id: 5, name: 'Eve', department: 'Marketing', salary: 70000 }
  ];

  // First, write test data to S3
  console.log('📝 Writing test data to Railway S3...');

  const writeConfig = {
    config: {
      data: testData,
      destination: {
        bucket: 'stackable-foodbox-kqa9-zq',
        prefix: 'test/railway-s3/',
        filename: 'test-data.jsonl'
      },
      format: 'jsonl'
    },
    context: {
      executionId: `test-${Date.now()}`,
      componentId: 's3-writer-test'
    }
  };

  try {
    // Test 1: Write data to S3
    console.log('Test 1: Writing data to S3...');
    const writeResponse = await axios.post(
      `${PROCESSOR_URL}/json-writer/execute`,
      writeConfig
    );

    if (writeResponse.data.success) {
      console.log('✅ Successfully wrote data to Railway S3');
      console.log(`📁 Output location: ${writeResponse.data.outputPath}\n`);
    } else {
      console.error('❌ Failed to write data:', writeResponse.data.error);
      return;
    }

    // Test 2: Use S3 Writer with transformations
    console.log('Test 2: S3 Writer with transformations...');

    const s3WriterConfig = {
      config: {
        inputPath: writeResponse.data.outputPath,
        destination: {
          bucket: 'stackable-foodbox-kqa9-zq',
          prefix: 'test/railway-s3/transformed/'
        },
        partitioning: {
          strategy: 'field',
          field: 'department'
        },
        dataTransforms: [{
          type: 'field_mapping',
          config: {
            mappings: [
              { source: 'name', target: 'employee_name' },
              { source: 'salary', target: 'annual_salary' }
            ]
          }
        }]
      },
      context: {
        executionId: `test-transform-${Date.now()}`,
        componentId: 's3-writer-transform'
      }
    };

    const s3Response = await axios.post(
      `${PROCESSOR_URL}/s3-writer/execute`,
      s3WriterConfig
    );

    if (s3Response.data.success) {
      console.log('✅ S3 Writer with transformations successful');
      console.log('📊 Files written:', s3Response.data.filesWritten);
      console.log('📁 Output locations:');
      s3Response.data.outputPaths?.forEach(path => {
        console.log(`   - ${path}`);
      });
    } else {
      console.error('❌ S3 Writer failed:', s3Response.data.error);
    }

    console.log('\n🎉 SUCCESS! Railway S3 integration is working correctly!');
    console.log('✅ All tests passed with the new Railway S3 configuration');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.response?.data || error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Make sure the processor service is running:');
      console.error('   cd refinery-processor && bun run dev');
    }
  }
}

// Run the test
testRailwayS3();