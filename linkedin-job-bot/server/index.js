const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const cvParser = require('./services/cvParser');
const linkedinBot = require('./services/linkedinBot');
const aiService = require('./services/aiService');
const storage = require('./services/storage');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('/api/upload-cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let cvText = '';
    if (fileExtension === '.pdf') {
      cvText = await cvParser.parsePDF(filePath);
    } else if (fileExtension === '.docx' || fileExtension === '.doc') {
      cvText = await cvParser.parseDOCX(filePath);
    } else {
      await fs.unlink(filePath);
      return res.status(400).json({ error: 'Unsupported file format. Please upload PDF or DOCX' });
    }

    const parsedData = await aiService.parseCV(cvText);
    
    await storage.saveCV({
      originalName: req.file.originalname,
      parsedData,
      uploadDate: new Date().toISOString()
    });

    await fs.unlink(filePath);

    res.json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({ error: 'Failed to process CV: ' + error.message });
  }
});

app.post('/api/configure', async (req, res) => {
  try {
    const { jobPreferences, linkedinCredentials } = req.body;

    if (!jobPreferences || !linkedinCredentials) {
      return res.status(400).json({ error: 'Missing required configuration' });
    }

    await storage.saveConfig({
      jobPreferences,
      linkedinCredentials,
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Configuration error:', error);
    res.status(500).json({ error: 'Failed to save configuration: ' + error.message });
  }
});

app.post('/api/start-applications', async (req, res) => {
  try {
    const config = await storage.getConfig();
    const cvData = await storage.getCV();

    if (!config || !cvData) {
      return res.status(400).json({ error: 'Please upload CV and configure preferences first' });
    }

    res.json({ 
      success: true, 
      message: 'Application process started',
      sessionId: Date.now().toString()
    });

    linkedinBot.startApplicationProcess(config, cvData).catch(err => {
      console.error('Application process error:', err);
    });

  } catch (error) {
    console.error('Start applications error:', error);
    res.status(500).json({ error: 'Failed to start application process: ' + error.message });
  }
});

app.get('/api/applications', async (req, res) => {
  try {
    const applications = await storage.getApplications();
    res.json({ success: true, applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to retrieve applications: ' + error.message });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    const status = linkedinBot.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get status: ' + error.message });
  }
});

app.get('/api/cv', async (req, res) => {
  try {
    const cvData = await storage.getCV();
    res.json({ success: true, data: cvData });
  } catch (error) {
    console.error('Get CV error:', error);
    res.status(500).json({ error: 'Failed to retrieve CV: ' + error.message });
  }
});

app.get('/api/config', async (req, res) => {
  try {
    const config = await storage.getConfig();
    if (config && config.linkedinCredentials) {
      config.linkedinCredentials = { email: config.linkedinCredentials.email };
    }
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to retrieve configuration: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
