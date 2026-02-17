import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should start with empty results', () => {
    expect(service.results()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.totalResults()).toBe(0);
  });

  it('should generate IIIF URL', () => {
    const url = service.iiifUrl('abc123', 400);
    expect(url).toBe('https://www.artic.edu/iiif/2/abc123/full/400,/0/default.jpg');
  });

  it('should generate IIIF URL with default width', () => {
    const url = service.iiifUrl('abc123');
    expect(url).toBe('https://www.artic.edu/iiif/2/abc123/full/843,/0/default.jpg');
  });

  it('should search artworks', () => {
    service.search({ query: 'monet', page: 1, limit: 12 });
    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/search'));
    expect(req.request.url).toContain('q=monet');
    expect(req.request.url).toContain('limit=12');

    req.flush({
      data: [mockRawArtwork(1, 'Water Lilies')],
      pagination: { total: 1, current_page: 1, total_pages: 1, limit: 12, offset: 0, next_url: null },
    });

    expect(service.loading()).toBe(false);
    expect(service.results().length).toBe(1);
    expect(service.results()[0].title).toBe('Water Lilies');
    expect(service.totalResults()).toBe(1);
  });

  it('should search with department filter', () => {
    service.search({ department: 'Photography and Media' });

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/search'));
    expect(req.request.url).toContain('department_title');
    expect(req.request.url).toContain('Photography');

    req.flush({
      data: [],
      pagination: { total: 0, current_page: 1, total_pages: 0, limit: 24, offset: 0, next_url: null },
    });
  });

  it('should search with sort by title', () => {
    service.search({ sortBy: 'title' });

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/search'));
    expect(req.request.url).toContain('sort[title.keyword][order]=asc');

    req.flush({
      data: [],
      pagination: { total: 0, current_page: 1, total_pages: 0, limit: 24, offset: 0, next_url: null },
    });
  });

  it('should search with sort by date', () => {
    service.search({ sortBy: 'date' });

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/search'));
    expect(req.request.url).toContain('sort[date_start][order]=asc');

    req.flush({
      data: [],
      pagination: { total: 0, current_page: 1, total_pages: 0, limit: 24, offset: 0, next_url: null },
    });
  });

  it('should always filter public domain', () => {
    service.search({});

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/search'));
    expect(req.request.url).toContain('is_public_domain');

    req.flush({
      data: [],
      pagination: { total: 0, current_page: 1, total_pages: 0, limit: 24, offset: 0, next_url: null },
    });
  });

  it('should handle search errors', () => {
    service.search({ query: 'test' });

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/search'));
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeTruthy();
  });

  it('should get artwork detail', () => {
    service.getDetail(12345);
    expect(service.loading()).toBe(true);
    expect(service.detail()).toBeNull();

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/12345'));
    req.flush({ data: mockRawArtwork(12345, 'Starry Night', true) });

    expect(service.loading()).toBe(false);
    const detail = service.detail();
    expect(detail).not.toBeNull();
    expect(detail!.title).toBe('Starry Night');
    expect(detail!.department).toBe('Painting');
  });

  it('should handle detail errors', () => {
    service.getDetail(99999);

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/99999'));
    req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeTruthy();
  });

  it('should load featured artworks', () => {
    service.loadFeatured();

    const req = httpMock.expectOne((r) => r.url.includes('ids='));
    req.flush({
      data: [mockRawArtwork(27992, 'A Sunday'), mockRawArtwork(28560, 'Nighthawks')],
    });

    expect(service.featured().length).toBe(2);
    expect(service.featured()[0].title).toBe('A Sunday');
  });

  it('should load by department', () => {
    service.loadByDepartment('Asian Art');
    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/search'));
    expect(req.request.url).toContain('Asian');
    req.flush({
      data: [mockRawArtwork(1, 'Jade Vase')],
      pagination: { total: 100, current_page: 1, total_pages: 5, limit: 24, offset: 0, next_url: null },
    });

    expect(service.results()[0].title).toBe('Jade Vase');
  });

  it('should load artworks by ids', () => {
    service.loadArtworksByIds([1, 2, 3]);
    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url.includes('ids=1,2,3'));
    req.flush({
      data: [mockRawArtwork(1, 'A'), mockRawArtwork(2, 'B'), mockRawArtwork(3, 'C')],
    });

    expect(service.results().length).toBe(3);
    expect(service.loading()).toBe(false);
  });

  it('should handle empty ids array', () => {
    service.loadArtworksByIds([]);
    expect(service.results()).toEqual([]);
    httpMock.expectNone(() => true);
  });

  it('should map raw artwork to summary correctly', () => {
    service.search({ query: 'test' });

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/search'));
    req.flush({
      data: [{
        id: 1, title: 'Test Art', artist_display: 'Artist Name',
        date_display: '1900', medium_display: 'Oil on canvas',
        image_id: 'img1', is_public_domain: true,
        genre_titles: ['Landscape'], thumbnail: { width: 200, height: 150, alt_text: 'A landscape' },
      }],
      pagination: { total: 1, current_page: 1, total_pages: 1, limit: 24, offset: 0, next_url: null },
    });

    const artwork = service.results()[0];
    expect(artwork.id).toBe(1);
    expect(artwork.artistDisplay).toBe('Artist Name');
    expect(artwork.dateDisplay).toBe('1900');
    expect(artwork.mediumDisplay).toBe('Oil on canvas');
    expect(artwork.imageId).toBe('img1');
    expect(artwork.isPublicDomain).toBe(true);
    expect(artwork.genres).toEqual(['Landscape']);
    expect(artwork.thumbnail).toEqual({ width: 200, height: 150, altText: 'A landscape' });
  });

  it('should handle null fields in raw artwork', () => {
    service.search({ query: 'test' });

    const req = httpMock.expectOne((r) => r.url.includes('/artworks/search'));
    req.flush({
      data: [{
        id: 1, title: 'Untitled', artist_display: null,
        date_display: null, medium_display: null,
        image_id: null, is_public_domain: true,
        genre_titles: null, thumbnail: null,
      }],
      pagination: { total: 1, current_page: 1, total_pages: 1, limit: 24, offset: 0, next_url: null },
    });

    const artwork = service.results()[0];
    expect(artwork.artistDisplay).toBe('');
    expect(artwork.dateDisplay).toBe('');
    expect(artwork.mediumDisplay).toBe('');
    expect(artwork.imageId).toBeNull();
    expect(artwork.genres).toEqual([]);
    expect(artwork.thumbnail).toBeNull();
  });
});

function mockRawArtwork(id: number, title: string, detail = false) {
  const base: Record<string, unknown> = {
    id, title,
    artist_display: 'Test Artist',
    date_display: '1900',
    medium_display: 'Oil on canvas',
    image_id: `img-${id}`,
    is_public_domain: true,
    genre_titles: ['Painting'],
    thumbnail: { width: 200, height: 150, alt_text: `${title} thumbnail` },
  };
  if (detail) {
    Object.assign(base, {
      description: '<p>A masterpiece</p>',
      provenance_text: 'Collected in 1920',
      dimensions: '50 x 40 cm',
      credit_line: 'Gift of Mr. Smith',
      gallery_title: 'Gallery 240',
      department_title: 'Painting',
      classification_title: 'Oil painting',
      place_of_origin: 'France',
      style_title: 'Impressionism',
      colorfulness: 45.5,
      has_educational_resources: true,
      artist_id: 100,
      artist_title: 'Test Artist',
    });
  }
  return base;
}
