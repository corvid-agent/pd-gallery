import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ArtworkSummary, ArtworkDetail, ArtInstituteSearchResponse, ArtInstituteArtworkRaw } from '../models/artwork.model';

const API_BASE = 'https://api.artic.edu/api/v1';
const IIIF_BASE = 'https://www.artic.edu/iiif/2';

const SUMMARY_FIELDS = 'id,title,artist_display,date_display,medium_display,image_id,is_public_domain,genre_titles,thumbnail';

const DETAIL_FIELDS = `${SUMMARY_FIELDS},description,provenance_text,dimensions,credit_line,gallery_title,department_title,classification_title,place_of_origin,style_title,colorfulness,has_educational_resources,artist_id,artist_title`;

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  readonly results = signal<ArtworkSummary[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly featured = signal<ArtworkSummary[]>([]);
  readonly detail = signal<ArtworkDetail | null>(null);
  readonly totalResults = signal(0);

  readonly iiifUrl = (imageId: string, width = 843) =>
    `${IIIF_BASE}/${imageId}/full/${width},/0/default.jpg`;

  search(params: {
    query?: string;
    department?: string;
    classification?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): void {
    this.loading.set(true);
    this.error.set(null);

    const { query, department, classification, sortBy, page = 1, limit = 24 } = params;
    const qParams: string[] = [`fields=${SUMMARY_FIELDS}`, `limit=${limit}`, `page=${page}`];

    qParams.push('query[term][is_public_domain]=true');
    if (query) {
      qParams.push(`q=${encodeURIComponent(query)}`);
    }
    if (department) {
      qParams.push(`query[term][department_title]=${encodeURIComponent(department)}`);
    }
    if (classification) {
      qParams.push(`query[term][classification_title]=${encodeURIComponent(classification)}`);
    }
    if (sortBy === 'title') {
      qParams.push('sort[title.keyword][order]=asc');
    } else if (sortBy === 'date') {
      qParams.push('sort[date_start][order]=asc');
    }

    this.http.get<ArtInstituteSearchResponse>(`${API_BASE}/artworks/search?${qParams.join('&')}`).subscribe({
      next: (res) => {
        this.results.set(res.data.map((raw) => this.mapSummary(raw)));
        this.totalResults.set(res.pagination.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load artworks');
        this.loading.set(false);
      },
    });
  }

  getDetail(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.detail.set(null);

    this.http.get<{ data: ArtInstituteArtworkRaw }>(`${API_BASE}/artworks/${id}?fields=${DETAIL_FIELDS}`).subscribe({
      next: (res) => {
        this.detail.set(this.mapDetail(res.data));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load artwork details');
        this.loading.set(false);
      },
    });
  }

  loadFeatured(): void {
    const curatedIds = [27992, 28560, 14598, 111628, 6565, 16568, 20684, 87479, 129884, 24306, 28067, 25865];
    this.http.get<{ data: ArtInstituteArtworkRaw[] }>(
      `${API_BASE}/artworks?ids=${curatedIds.join(',')}&fields=${SUMMARY_FIELDS}`
    ).subscribe({
      next: (res) => {
        this.featured.set(res.data.map((raw) => this.mapSummary(raw)));
      },
      error: () => { /* silent fail for featured */ },
    });
  }

  loadByDepartment(department: string, page = 1, limit = 24): void {
    this.search({ department, page, limit });
  }

  loadArtworksByIds(ids: number[]): void {
    if (ids.length === 0) { this.results.set([]); return; }
    this.loading.set(true);
    this.http.get<{ data: ArtInstituteArtworkRaw[] }>(
      `${API_BASE}/artworks?ids=${ids.join(',')}&fields=${SUMMARY_FIELDS}`
    ).subscribe({
      next: (res) => {
        this.results.set(res.data.map((raw) => this.mapSummary(raw)));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load artworks');
        this.loading.set(false);
      },
    });
  }

  private mapSummary(raw: ArtInstituteArtworkRaw): ArtworkSummary {
    return {
      id: raw.id,
      title: raw.title,
      artistDisplay: raw.artist_display ?? '',
      dateDisplay: raw.date_display ?? '',
      mediumDisplay: raw.medium_display ?? '',
      imageId: raw.image_id,
      isPublicDomain: raw.is_public_domain,
      genres: raw.genre_titles ?? [],
      thumbnail: raw.thumbnail ? { width: raw.thumbnail.width, height: raw.thumbnail.height, altText: raw.thumbnail.alt_text ?? '' } : null,
    };
  }

  private mapDetail(raw: ArtInstituteArtworkRaw): ArtworkDetail {
    return {
      ...this.mapSummary(raw),
      description: raw.description,
      provenanceText: raw.provenance_text,
      dimensions: raw.dimensions,
      creditLine: raw.credit_line,
      galleryTitle: raw.gallery_title,
      department: raw.department_title,
      classification: raw.classification_title,
      placeOfOrigin: raw.place_of_origin,
      styleTitle: raw.style_title,
      colorfulness: raw.colorfulness,
      hasEducationalResources: raw.has_educational_resources ?? false,
    };
  }
}
