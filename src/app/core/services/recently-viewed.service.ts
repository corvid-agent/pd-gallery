import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'pd-gallery-recent';
const MAX_ITEMS = 12;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  readonly ids = signal<number[]>(this.load());

  add(artworkId: number): void {
    this.ids.update((list) => {
      const filtered = list.filter((id) => id !== artworkId);
      return [artworkId, ...filtered].slice(0, MAX_ITEMS);
    });
    this.save();
  }

  private save(): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids())); } catch { /* noop */ }
  }

  private load(): number[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* noop */ }
    return [];
  }
}
