import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LazyImageDirective } from './lazy-image.directive';

@Component({
  template: '<img appLazyImage src="https://test.com/image.jpg" alt="Test" />',
  imports: [LazyImageDirective],
})
class TestHostComponent {}

describe('LazyImageDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let observeSpy: ReturnType<typeof vi.fn>;
  let disconnectSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeSpy = vi.fn();
    disconnectSpy = vi.fn();

    class MockIntersectionObserver {
      constructor(public callback: IntersectionObserverCallback) {}
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = disconnectSpy;
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds: number[] = [];
      takeRecords() { return []; }
    }

    Object.defineProperty(window, 'IntersectionObserver', {
      value: MockIntersectionObserver,
      writable: true,
      configurable: true,
    });

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should create the directive', () => {
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
  });

  it('should set initial opacity to 0', () => {
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLElement;
    expect(img.style.opacity).toBe('0');
  });

  it('should set transition style', () => {
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLElement;
    expect(img.style.transition).toContain('opacity');
  });

  it('should store src in data-src and observe', () => {
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('data-src')).toBe('https://test.com/image.jpg');
    expect(observeSpy).toHaveBeenCalled();
  });

  it('should disconnect observer on destroy', () => {
    fixture.detectChanges();
    fixture.destroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
