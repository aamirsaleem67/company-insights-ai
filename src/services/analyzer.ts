import type ScraperService from './scraper';
import type OpenAIService from './openai';

class AnalyzerService {
  constructor(
    private scraperService: ScraperService,
    private openaiService: typeof OpenAIService
  ) {}

  async analyzeCompanyWebsite(companyUrl: string, position: string): Promise<string> {
    const scrapedData = await this.scraperService.scrapeCompanyContent(companyUrl);

    let combinedContent = `Main Page Content:\n${scrapedData.mainContent}\n\n`;

    Object.entries(scrapedData.relevantPages).forEach(([pageType, content]) => {
      combinedContent += `${pageType} Content:\n${content}\n\n`;
    });

    return this.openaiService.analyzeCompany(combinedContent, position.trim().toLowerCase());
  }
}

export default AnalyzerService;
