const pdfParse = require('pdf-parse');
const fs = require('fs');

async function test() {
  try {
    // Test with one of the existing PDFs
    const pdfPath = './refinery-api/current-test.pdf';
    const dataBuffer = fs.readFileSync(pdfPath);

    console.log('Testing pdf-parse...');
    console.log('pdfParse type:', typeof pdfParse);
    console.log('pdfParse:', pdfParse);

    const data = await pdfParse(dataBuffer);
    console.log('✅ PDF parsed successfully!');
    console.log('Text length:', data.text.length);
    console.log('First 200 chars:', data.text.substring(0, 200));
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();
