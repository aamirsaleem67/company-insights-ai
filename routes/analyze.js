const express = require('express');
const router = express.Router();
const openaiService = require('../services/openai');
const ScraperService = require('../services/scraper');
const AnalyzerService = require('../services/analyzer');

const scraperService = new ScraperService(openaiService);
const analyzerService = new AnalyzerService(scraperService, openaiService);

router.post('/analyze', async (req, res) => {
  try {
    const { companyUrl, position } = req.body;

    if (!companyUrl || !position) {
      return res.status(400).json({ error: 'Company URL and position are required' });
    }

    const analysis = await analyzerService.analyzeCompanyWebsite(companyUrl, position);
    res.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze company' });
  }
});

module.exports = router; 