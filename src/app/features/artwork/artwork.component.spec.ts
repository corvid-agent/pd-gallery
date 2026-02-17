import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ArtworkComponent } from './artwork.component';

describe('ArtworkComponent', () => {
  let fixture: ComponentFixture<ArtworkComponent>;
  let component: ArtworkComponent;
  let httpMock: HttpTestingController;

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
      imports: [ArtworkComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    fixture = TestBed.createComponent(ArtworkComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.componentRef.setInput('id', '12345');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load detail on init', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne((r) => r.url.includes('/artworks/12345'));
    expect(req).toBeTruthy();
    req.flush({
      data: {
        id: 12345, title: 'Test Art', artist_display: 'Artist',
        date_display: '1900', medium_display: 'Oil',
        image_id: 'img1', is_public_domain: true,
        genre_titles: [], thumbnail: null,
        description: null, provenance_text: null, dimensions: null,
        credit_line: null, gallery_title: null, department_title: null,
        classification_title: null, place_of_origin: null,
        style_title: null, colorfulness: null, has_educational_resources: false,
      },
    });
  });

  it('should display artwork title after load', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne((r) => r.url.includes('/artworks/12345'));
    req.flush({
      data: {
        id: 12345, title: 'Mona Lisa', artist_display: 'Da Vinci',
        date_display: '1503', medium_display: 'Oil on poplar',
        image_id: 'img1', is_public_domain: true,
        genre_titles: ['Portrait'], thumbnail: null,
        description: '<p>Famous painting</p>', provenance_text: null,
        dimensions: '77 cm × 53 cm', credit_line: 'Louvre',
        gallery_title: null, department_title: 'Painting',
        classification_title: 'Oil', place_of_origin: 'Italy',
        style_title: 'Renaissance', colorfulness: 30,
        has_educational_resources: false,
      },
    });
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.artwork__title');
    expect(title?.textContent).toContain('Mona Lisa');
  });

  it('should toggle favorite', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne((r) => r.url.includes('/artworks/12345'));
    req.flush({
      data: {
        id: 12345, title: 'Test', artist_display: '',
        date_display: '', medium_display: '', image_id: null,
        is_public_domain: true, genre_titles: [], thumbnail: null,
        description: null, provenance_text: null, dimensions: null,
        credit_line: null, gallery_title: null, department_title: null,
        classification_title: null, place_of_origin: null,
        style_title: null, colorfulness: null, has_educational_resources: false,
      },
    });
    fixture.detectChanges();

    component.toggleFavorite();
    // Should not throw
    expect(component).toBeTruthy();
  });
});
