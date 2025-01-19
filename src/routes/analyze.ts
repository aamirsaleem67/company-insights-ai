import { Router } from 'express';
import openaiService from '../services/openai';
import ScraperService from '../services/scraper';
import AnalyzerService from '../services/analyzer';
import { AnalyzeRequestDto } from '@/types';

const router = Router();

const scraperService = new ScraperService(openaiService);
const analyzerService = new AnalyzerService(scraperService, openaiService);

router.post('/analyze', async (req, res) => {
  try {
    const { companyUrl, position } = req.body as AnalyzeRequestDto;

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

export default router;
