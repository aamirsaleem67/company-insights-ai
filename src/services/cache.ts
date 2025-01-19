interface CacheItem {
  data: unknown;
  timestamp: number;
}

class CacheService {
  private cache: Map<string, CacheItem>;
  private readonly TTL: number = 1000 * 60 * 60; // 1 hour

  constructor() {
    this.cache = new Map();
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

export default new CacheService();
