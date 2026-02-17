import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
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

    document.documentElement.removeAttribute('data-theme');

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should default to dark theme', () => {
    expect(service.theme()).toBe('dark');
  });

  it('should toggle to warm', () => {
    service.toggle();
    expect(service.theme()).toBe('warm');
    expect(document.documentElement.getAttribute('data-theme')).toBe('warm');
    expect(mockStore['pd-gallery-theme']).toBe('warm');
  });

  it('should toggle to light after warm', () => {
    service.toggle(); // dark → warm
    service.toggle(); // warm → light
    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(mockStore['pd-gallery-theme']).toBe('light');
  });

  it('should toggle back to dark after light', () => {
    service.toggle(); // dark → warm
    service.toggle(); // warm → light
    service.toggle(); // light → dark
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(mockStore['pd-gallery-theme']).toBe('dark');
  });

  it('should apply theme on init', () => {
    service.toggle(); // warm
    service.init();
    expect(document.documentElement.getAttribute('data-theme')).toBe('warm');
  });

  it('should set a specific theme', () => {
    service.setTheme('light');
    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should load warm from localStorage', () => {
    mockStore['pd-gallery-theme'] = 'warm';
    const fresh = new ThemeService();
    expect(fresh.theme()).toBe('warm');
  });
});
