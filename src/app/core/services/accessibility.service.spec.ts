import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AccessibilityService } from './accessibility.service';

describe('AccessibilityService', () => {
  let service: AccessibilityService;
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

    document.documentElement.className = '';
    document.documentElement.style.cssText = '';

    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessibilityService);
  });

  it('should have default preferences', () => {
    const prefs = service.prefs();
    expect(prefs.fontSize).toBe('default');
    expect(prefs.highContrast).toBe(false);
    expect(prefs.reducedMotion).toBe(false);
    expect(prefs.wideSpacing).toBe(false);
  });

  it('should increase font size', () => {
    service.increaseFontSize();
    expect(service.prefs().fontSize).toBe('large');
  });

  it('should increase font size through all levels', () => {
    service.increaseFontSize(); // large
    service.increaseFontSize(); // x-large
    service.increaseFontSize(); // xx-large
    expect(service.prefs().fontSize).toBe('xx-large');
  });

  it('should not increase beyond xx-large', () => {
    service.increaseFontSize();
    service.increaseFontSize();
    service.increaseFontSize();
    service.increaseFontSize(); // should stay at xx-large
    expect(service.prefs().fontSize).toBe('xx-large');
  });

  it('should decrease font size', () => {
    service.increaseFontSize(); // large
    service.decreaseFontSize(); // default
    expect(service.prefs().fontSize).toBe('default');
  });

  it('should not decrease below default', () => {
    service.decreaseFontSize();
    expect(service.prefs().fontSize).toBe('default');
  });

  it('should toggle high contrast', () => {
    service.toggleHighContrast();
    expect(service.prefs().highContrast).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });

  it('should toggle reduced motion', () => {
    service.toggleReducedMotion();
    expect(service.prefs().reducedMotion).toBe(true);
    expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
  });

  it('should toggle wide spacing', () => {
    service.toggleWideSpacing();
    expect(service.prefs().wideSpacing).toBe(true);
    expect(document.documentElement.classList.contains('wide-spacing')).toBe(true);
  });

  it('should reset all preferences', () => {
    service.increaseFontSize();
    service.toggleHighContrast();
    service.toggleReducedMotion();
    service.toggleWideSpacing();
    service.resetAll();
    const prefs = service.prefs();
    expect(prefs.fontSize).toBe('default');
    expect(prefs.highContrast).toBe(false);
    expect(prefs.reducedMotion).toBe(false);
    expect(prefs.wideSpacing).toBe(false);
  });

  it('should report canIncrease/canDecrease', () => {
    expect(service.canIncrease()).toBe(true);
    expect(service.canDecrease()).toBe(false);
    service.increaseFontSize();
    expect(service.canIncrease()).toBe(true);
    expect(service.canDecrease()).toBe(true);
  });

  it('should return font size label', () => {
    expect(service.getFontSizeLabel()).toBe('Default');
    service.increaseFontSize();
    expect(service.getFontSizeLabel()).toBe('Large');
  });

  it('should persist to localStorage', () => {
    service.toggleHighContrast();
    const raw = mockStore['pd-gallery-a11y'];
    expect(raw).toBeDefined();
    const stored = JSON.parse(raw);
    expect(stored.highContrast).toBe(true);
  });

  it('should load from localStorage', () => {
    mockStore['pd-gallery-a11y'] = JSON.stringify({
      fontSize: 'large',
      highContrast: true,
      reducedMotion: false,
      wideSpacing: false,
    });
    const fresh = new AccessibilityService();
    expect(fresh.prefs().fontSize).toBe('large');
    expect(fresh.prefs().highContrast).toBe(true);
  });

  it('should panel open signal default to false', () => {
    expect(service.panelOpen()).toBe(false);
  });
});
