import { describe, it, expect, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { KeyboardNavDirective } from './keyboard-nav.directive';

@Component({
  template: `
    <div appKeyboardNav>
      <div class="grid" role="list">
        <a href="#" id="item-0">Item 0</a>
        <a href="#" id="item-1">Item 1</a>
        <a href="#" id="item-2">Item 2</a>
        <a href="#" id="item-3">Item 3</a>
      </div>
    </div>
  `,
  imports: [KeyboardNavDirective],
})
class TestHostComponent {}

describe('KeyboardNavDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let container: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    container = fixture.nativeElement.querySelector('[appKeyboardNav]');
  });

  it('should create the directive', () => {
    expect(container).toBeTruthy();
  });

  it('should navigate right on ArrowRight', () => {
    const items = container.querySelectorAll('a');
    (items[0] as HTMLElement).focus();
    dispatch(container, 'ArrowRight');
    expect(document.activeElement).toBe(items[1]);
  });

  it('should navigate left on ArrowLeft', () => {
    const items = container.querySelectorAll('a');
    (items[1] as HTMLElement).focus();
    dispatch(container, 'ArrowLeft');
    expect(document.activeElement).toBe(items[0]);
  });

  it('should not go before first on ArrowLeft', () => {
    const items = container.querySelectorAll('a');
    (items[0] as HTMLElement).focus();
    dispatch(container, 'ArrowLeft');
    expect(document.activeElement).toBe(items[0]);
  });

  it('should go to first on Home', () => {
    const items = container.querySelectorAll('a');
    (items[2] as HTMLElement).focus();
    dispatch(container, 'Home');
    expect(document.activeElement).toBe(items[0]);
  });

  it('should go to last on End', () => {
    const items = container.querySelectorAll('a');
    (items[0] as HTMLElement).focus();
    dispatch(container, 'End');
    expect(document.activeElement).toBe(items[3]);
  });
});

function dispatch(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}
