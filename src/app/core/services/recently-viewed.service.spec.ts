import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RecentlyViewedService } from './recently-viewed.service';

describe('RecentlyViewedService', () => {
  let service: RecentlyViewedService;
  let mockStore: Record<string, string>;

  beforeEach(() => {
    mockStore = {};
    const mockStorage: Storage = {
      length: 0,
      clear: () => { mockStore = {}; },
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, value: string) => { mockStore[key] = value; },
      removeItem: (key: string) => { delete mockStore[key]; },
      key: () => null,
    };
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true, configurable: true });

    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentlyViewedService);
    service['ids'].set([]);
  });

  it('should start empty', () => {
    expect(service.ids()).toEqual([]);
  });

  it('should add an artwork id', () => {
    service.add(100);
    expect(service.ids()).toEqual([100]);
  });

  it('should prepend new ids', () => {
    service.add(100);
    service.add(200);
    expect(service.ids()[0]).toBe(200);
    expect(service.ids()[1]).toBe(100);
  });

  it('should move duplicate to front', () => {
    service.add(100);
    service.add(200);
    service.add(100);
    expect(service.ids()).toEqual([100, 200]);
  });

  it('should limit to 12 items', () => {
    for (let i = 0; i < 15; i++) {
      service.add(i);
    }
    expect(service.ids().length).toBe(12);
    expect(service.ids()[0]).toBe(14);
  });

  it('should persist to localStorage', () => {
    service.add(100);
    const raw = mockStore['pd-gallery-recent'];
    expect(raw).toBeDefined();
    expect(JSON.parse(raw)).toEqual([100]);
  });

  it('should load from localStorage', () => {
    mockStore['pd-gallery-recent'] = JSON.stringify([10, 20, 30]);
    const fresh = new RecentlyViewedService();
    expect(fresh.ids()).toEqual([10, 20, 30]);
  });
});
