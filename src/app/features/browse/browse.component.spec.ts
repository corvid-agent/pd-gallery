import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { BrowseComponent } from './browse.component';

describe('BrowseComponent', () => {
  let fixture: ComponentFixture<BrowseComponent>;
  let component: BrowseComponent;

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

    TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    });
    fixture = TestBed.createComponent(BrowseComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.browse__title');
    expect(title?.textContent).toContain('Browse Artworks');
  });

  it('should render search input', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.browse__search-input');
    expect(input).toBeTruthy();
  });

  it('should have departments list', () => {
    expect(component.departments.length).toBeGreaterThan(0);
  });

  it('should start on page 1', () => {
    expect(component.currentPage()).toBe(1);
  });

  it('should increment page on nextPage', () => {
    fixture.detectChanges();
    component.nextPage();
    expect(component.currentPage()).toBe(2);
  });

  it('should not go below page 1 on prevPage', () => {
    fixture.detectChanges();
    component.prevPage();
    expect(component.currentPage()).toBe(1);
  });

  it('should reset page on new search', () => {
    fixture.detectChanges();
    component.nextPage();
    component.doSearch();
    expect(component.currentPage()).toBe(1);
  });
});
