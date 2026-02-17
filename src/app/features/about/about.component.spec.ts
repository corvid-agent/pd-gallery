import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should mention Art Institute of Chicago', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Art Institute of Chicago');
  });

  it('should have a heading', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1).toBeTruthy();
  });
});
