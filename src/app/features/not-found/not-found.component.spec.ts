import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display not found content', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Not Found');
  });

  it('should have link back to home', () => {
    const link = fixture.nativeElement.querySelector('a');
    expect(link).toBeTruthy();
  });
});
