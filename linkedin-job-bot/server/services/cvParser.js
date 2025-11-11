const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;

async function parsePDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to parse PDF: ' + error.message);
  }
}

async function parseDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error('Failed to parse DOCX: ' + error.message);
  }
}

module.exports = {
  parsePDF,
  parseDOCX
};
