import puppeteer, { Browser, Page } from 'puppeteer';
import { ScrapedData, RawLink, RelavantLink } from '@/types';
import OpenAIService from './openai';

class ScraperService {
  private browserPromise: Promise<Browser>;
  private openaiService: typeof OpenAIService;

  constructor(openaiService: typeof OpenAIService) {
    this.openaiService = openaiService;
    this.browserPromise = puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
      ],
    });
  }

  async scrapeCompanyContent(url: string): Promise<ScrapedData> {
    const browser = await this.browserPromise;
    const maxConcurrentScrapes = 5;

    try {
      const mainPage = await this.setupPage(browser);
      await this.navigateToPage(mainPage, url);

      const [mainContent, allLinks] = await Promise.all([
        this.getPageContent(mainPage),
        this.getAllLinks(mainPage),
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

  private async setupPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.resourceType() === 'document') {
        req.continue();
      } else {
        req.abort();
      }
    });
    return page;
  }

  private async navigateToPage(page: Page, url: string): Promise<void> {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15000, // 15 seconds
    });
  }

  private async getPageContent(page: Page): Promise<string> {
    return await page.evaluate(() => document.body.innerText);
  }

  private async getAllLinks(page: Page): Promise<RawLink[]> {
    return await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .map(link => ({
          text: link.innerText.trim(),
          url: link.href,
        }))
        .filter(link => link.url.startsWith('http') && link.text.length);
    });
  }

  private async processBatch(
    browser: Browser,
    relevantLinks: RelavantLink[],
    batchSize: number
  ): Promise<Record<string, string>> {
    const pageContents: Record<string, string> = {};

    const createBatches = (): RelavantLink[][] => {
      const batches = [];
      for (let i = 0; i < relevantLinks.length; i += batchSize) {
        const batch = relevantLinks.slice(i, i + batchSize);
        batches.push(batch);
      }
      return batches;
    };

    const batches = createBatches();
    for (const batch of batches) {
      const batchPromises = batch.map(link =>
        this.scrapeUrl(browser, link.url).then(content => ({ type: link.type, content }))
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

  private async scrapeUrl(browser: Browser, url: string, maxRetries = 2): Promise<string> {
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
}

export default ScraperService;
