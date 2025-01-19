import { OpenAI } from 'openai';
import { RawLink, RelavantLink, RelevantLinksResponse } from '@/types';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async identifyRelevantLinks(links: RawLink[], baseUrl: string): Promise<RelevantLinksResponse> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              "You are a research assistant helping job candidates learn about companies. Your task is to identify the most relevant pages that would help a candidate understand the company's business, culture, and work environment. Return a JSON object with categorized URLs.",
          },
          {
            role: 'user',
            content: `Analyze these links from ${baseUrl} and identify the most relevant pages for company research. Focus on pages about the company, products, careers, and culture. Do not include Terms of Service, Privacy Policy, email links, or other administrative pages. Return JSON with categorized URLs in this format: { "links": [{ "type": "about page", "url": "https://example.com/about" }] }\n\nLinks to analyze:\n${JSON.stringify(
              links,
              null,
              2
            )}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const parsedResponse = JSON.parse(response.choices[0].message.content || '') as {
        links: RelavantLink[];
      };

      if (!parsedResponse.links || !Array.isArray(parsedResponse.links)) {
        return { relevantLinks: [] };
      }

      const validLinks = parsedResponse.links.filter(
        (link): link is RelavantLink =>
          link &&
          typeof link === 'object' &&
          typeof link.type === 'string' &&
          typeof link.url === 'string'
      );

      return { relevantLinks: validLinks };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return { relevantLinks: [] };
    }
  }

  async analyzeCompany(scrapedContent: string, position: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              "You are a company research assistant helping job candidates prepare for interviews. Provide very concise summaries (2-3 sentences per section) without using any markdown formatting. Focus on the most relevant information for the candidate's position.",
          },
          {
            role: 'user',
            content: `Company information: ${scrapedContent}\nTarget position: ${position}\n\nProvide a brief analysis with these sections:\n1. Company Overview\n2. Key Products/Services\n3. Relevant Aspects for Position\n4. Company Culture\n5. Potential Interview Topics\n\nKeep each section very brief and focused on what's most important for the interview.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0].message.content ?? '';
      return content.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '');
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}

export default new OpenAIService();
