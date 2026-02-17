import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KeyboardShortcutsService } from './keyboard-shortcuts.service';
import { AccessibilityService } from './accessibility.service';

describe('KeyboardShortcutsService', () => {
  let service: KeyboardShortcutsService;
  let a11y: AccessibilityService;

  beforeEach(() => {
    const mockStorage: Storage = {
      length: 0,
      clear: () => {},
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      key: () => null,
    };
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true, configurable: true });

    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyboardShortcutsService);
    a11y = TestBed.inject(AccessibilityService);
    service.init();
  });

  it('should start with help closed', () => {
    expect(service.helpOpen()).toBe(false);
  });

  it('should toggle help on ? key', () => {
    dispatch('?');
    expect(service.helpOpen()).toBe(true);
    dispatch('?');
    expect(service.helpOpen()).toBe(false);
  });

  it('should close help on Escape', () => {
    service.helpOpen.set(true);
    dispatch('Escape');
    expect(service.helpOpen()).toBe(false);
  });

  it('should close a11y panel on Escape', () => {
    a11y.panelOpen.set(true);
    dispatch('Escape');
    expect(a11y.panelOpen()).toBe(false);
  });

  it('should focus search input on / key', () => {
    const input = document.createElement('input');
    input.id = 'search-input';
    document.body.appendChild(input);
    const focusSpy = vi.spyOn(input, 'focus');

    dispatch('/');
    expect(focusSpy).toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should not handle shortcuts when in input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    dispatch('?', input);
    expect(service.helpOpen()).toBe(false);

    document.body.removeChild(input);
  });
});

function dispatch(key: string, target: HTMLElement = document.body) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true });
  Object.defineProperty(event, 'target', { value: target, writable: false });
  document.dispatchEvent(event);
}
