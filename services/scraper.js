const puppeteer = require('puppeteer');

class ScraperService {
  constructor(openaiService) {
    this.openaiService = openaiService;
    this.browserPromise = puppeteer.launch({ 
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials'
      ]
    });
  }

  async setupPage(browser) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'document') {
        req.continue();
      } else {
        req.abort();
      }
    });
    return page;
  }

  async navigateToPage(page, url) {
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 15000 
    });
  }

  async getPageContent(page) {
    return await page.evaluate(() => document.body.innerText);
  }

  async getAllLinks(page) {
    return await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.map(link => ({
        text: link.innerText.trim(),
        url: link.href
      })).filter(link => 
        link.url.startsWith('http') && 
        link.text.length > 0
      );
    });
  }

  async scrapeUrl(browser, url, maxRetries = 2) {
    const page = await this.setupPage(browser);
    try {
      await this.navigateToPage(page, url);
      return await this.getPageContent(page);
    } catch (error) {
      if (maxRetries > 0) {
        console.log(`Retrying ${url}, attempts left: ${maxRetries}`);
        return this.scrapeUrl(browser, url, maxRetries - 1);
      }
      console.error(`Error scraping ${url}:`, error);
      return '';
    } finally {
      await page.close();
    }
  }

  

  async processBatch(browser, relevantLinks, batchSize) {
    const pageContents = {};
    
    const createBatches = () => {
      const batches = [];
      for (let i = 0; i < relevantLinks.length; i += batchSize) {
        const batch = relevantLinks.slice(i, i + batchSize);
        batches.push(batch);
      }
      return batches;
    }


    const batches = createBatches();

    for (const batch of batches) {
      const batchPromises = batch.map(link => 
        this.scrapeUrl(browser, link.url)
          .then(content => ({ type: link.type, content }))
      );

      const results = await Promise.all(batchPromises);
      results.forEach(result => {
        if (result) {
          pageContents[result.type] = result.content;
        }
      });
    }

    return pageContents;
  }

  async scrapeCompanyWebPage(url) {
    const browser = await this.browserPromise;
    const maxConcurrentScrapes = 5;

    try {
      const mainPage = await this.setupPage(browser);
      await this.navigateToPage(mainPage, url);
      
      const [mainContent, allLinks] = await Promise.all([
        this.getPageContent(mainPage),
        this.getAllLinks(mainPage)
      ]);
      await mainPage.close();

      const { relevantLinks } = await this.openaiService.identifyRelevantLinks(allLinks, url);
      const pageContents = relevantLinks.length 
        ? await this.processBatch(browser, relevantLinks, maxConcurrentScrapes)
        : {};

      return { mainContent, relevantPages: pageContents };
    } catch (error) {
      console.error('Scraping error:', error);
      throw error;
    }
  }
}

module.exports = ScraperService; 