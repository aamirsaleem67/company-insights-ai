export interface AnalyzeRequestDto {
  companyUrl: string;
  position: string;
}

export interface ScrapedData {
  mainContent: string;
  relevantPages: Record<string, string>;
}

export interface RawLink {
  text: string;
  url: string;
}

export interface RelavantLink extends RawLink {
  type: string;
}

export interface RelevantLinksResponse {
  relevantLinks: RelavantLink[];
}
