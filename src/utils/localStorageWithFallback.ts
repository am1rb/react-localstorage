import type { StorageAPI } from '../types/StorageAPI';

export class LocalStorageWithFallback implements StorageAPI {
  private data: Map<string, string> = new Map();

  getItem(key: string): string | null {
    if (this.data.has(key)) {
      return this.data.get(key) ?? null;
    }

    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
      this.data.delete(key);
    } catch (error) {
      this.data.set(key, value);
      throw error;
    }
  }

  removeItem(key: string): void {
    this.data.delete(key);
    localStorage.removeItem(key);
  }

  clear(): void {
    this.data.clear();
    localStorage.clear();
  }

  refresh(key: string): void {
    this.data.delete(key);
  }

  fallback() {
    return {
      has: (key: string): boolean => {
        return this.data.has(key);
      },
    };
  }
}

export const localStorageWithFallback = new LocalStorageWithFallback();
