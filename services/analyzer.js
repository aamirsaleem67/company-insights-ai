class AnalyzerService {
  constructor(scraperService, openaiService) {
    this.scraperService = scraperService;
    this.openaiService = openaiService;
  }

  async analyzeCompanyWebsite(companyUrl, position) {
    const scrapedData = await this.scraperService.scrapeCompanyWebPage(companyUrl);
    
    let combinedContent = `Main Page Content:\n${scrapedData.mainContent}\n\n`;
    
    Object.entries(scrapedData.relevantPages).forEach(([pageType, content]) => {
      combinedContent += `${pageType} Content:\n${content}\n\n`;
    });

    const analysis = await this.openaiService.analyzeCompany(combinedContent, position);
    return analysis;
  }
}

module.exports = AnalyzerService; 