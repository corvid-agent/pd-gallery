import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

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
      imports: [HomeComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render hero title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.hero__title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Explore Masterpieces');
  });

  it('should render browse link', () => {
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('a');
    const browseLink = Array.from(links).find((a: unknown) => (a as HTMLAnchorElement).textContent?.includes('Browse'));
    expect(browseLink).toBeTruthy();
  });

  it('should have departments list', () => {
    expect(component.departments.length).toBeGreaterThan(0);
  });

  it('should have curated collections', () => {
    expect(component.curatedCollections.length).toBeGreaterThan(0);
  });

  it('should render department cards', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.dept-card');
    expect(cards.length).toBe(component.departments.length);
  });

  it('should render curation cards', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.curation-card');
    expect(cards.length).toBe(component.curatedCollections.length);
  });
});
