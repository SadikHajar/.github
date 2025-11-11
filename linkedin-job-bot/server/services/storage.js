const fs = require('fs').promises;
const path = require('path');
const CryptoJS = require('crypto-js');

const DATA_DIR = path.join(__dirname, '../data');
const CV_FILE = path.join(DATA_DIR, 'cv.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function saveCV(cvData) {
  await ensureDataDir();
  await fs.writeFile(CV_FILE, JSON.stringify(cvData, null, 2));
}

async function getCV() {
  try {
    const data = await fs.readFile(CV_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveConfig(config) {
  await ensureDataDir();
  
  if (config.linkedinCredentials && config.linkedinCredentials.password) {
    config.linkedinCredentials.password = encrypt(config.linkedinCredentials.password);
  }
  
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function getConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    const config = JSON.parse(data);
    
    if (config.linkedinCredentials && config.linkedinCredentials.password) {
      config.linkedinCredentials.password = decrypt(config.linkedinCredentials.password);
    }
    
    return config;
  } catch {
    return null;
  }
}

async function saveApplication(application) {
  await ensureDataDir();
  
  let applications = [];
  try {
    const data = await fs.readFile(APPLICATIONS_FILE, 'utf8');
    applications = JSON.parse(data);
  } catch {
  }
  
  applications.unshift({
    ...application,
    id: Date.now().toString(),
    appliedAt: new Date().toISOString()
  });
  
  await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
}

async function getApplications() {
  try {
    const data = await fs.readFile(APPLICATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

module.exports = {
  saveCV,
  getCV,
  saveConfig,
  getConfig,
  saveApplication,
  getApplications
};
