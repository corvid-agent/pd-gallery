import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { ArtworkCardComponent } from '../../shared/components/artwork-card.component';
import { ScrollRowComponent } from '../../shared/components/scroll-row.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import type { ArtworkSummary } from '../../core/models/artwork.model';
import { HttpClient } from '@angular/common/http';
import type { ArtInstituteSearchResponse, ArtInstituteArtworkRaw } from '../../core/models/artwork.model';

const DEPARTMENTS = [
  'Painting and Sculpture of Europe',
  'Photography and Media',
  'Prints and Drawings',
  'Arts of the Americas',
  'Asian Art',
  'Textiles',
];

const CURATED_COLLECTIONS = [
  { name: 'Impressionism', query: 'impressionism' },
  { name: 'Ancient Egypt', query: 'ancient egypt' },
  { name: 'Japanese Prints', query: 'japanese woodblock' },
  { name: 'Modern Abstract', query: 'abstract modern' },
  { name: 'Renaissance Masters', query: 'renaissance' },
];

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ArtworkCardComponent, ScrollRowComponent, SkeletonGridComponent, RevealDirective],
  template: `
    <section class="hero">
      <div class="hero__inner container">
        <h1 class="hero__title">Explore Masterpieces<br>of World Art</h1>
        <p class="hero__subtitle">Discover over 130,000 public domain artworks from the Art Institute of Chicago</p>
        <div class="hero__actions">
          <a routerLink="/browse" class="btn-primary hero__btn">Browse Collection</a>
          <a routerLink="/about" class="btn-secondary hero__btn">Learn More</a>
        </div>
      </div>
    </section>

    <div class="container">
      <section class="section" appReveal>
        <div class="section__header">
          <h2>Featured Works</h2>
        </div>
        @if (catalog.featured().length > 0) {
          <app-scroll-row>
            @for (artwork of catalog.featured(); track artwork.id) {
              <div class="scroll-card">
                <app-artwork-card [artwork]="artwork" />
              </div>
            }
          </app-scroll-row>
        } @else {
          <app-skeleton-grid [count]="6" />
        }
      </section>

      @if (recentArtworks().length > 0) {
        <section class="section" appReveal>
          <div class="section__header">
            <h2>Recently Viewed</h2>
          </div>
          <app-scroll-row>
            @for (artwork of recentArtworks(); track artwork.id) {
              <div class="scroll-card">
                <app-artwork-card [artwork]="artwork" />
              </div>
            }
          </app-scroll-row>
        </section>
      }

      <section class="section" appReveal>
        <div class="section__header">
          <h2>Browse by Department</h2>
        </div>
        <div class="departments">
          @for (dept of departments; track dept) {
            <a class="dept-card" [routerLink]="['/department', dept]">
              <span class="dept-card__name">{{ dept }}</span>
            </a>
          }
        </div>
      </section>

      <section class="section" appReveal>
        <div class="section__header">
          <h2>Curated Collections</h2>
        </div>
        <div class="curations">
          @for (c of curatedCollections; track c.name) {
            <a class="curation-card" [routerLink]="['/browse']" [queryParams]="{ q: c.query }">
              <span class="curation-card__name">{{ c.name }}</span>
              <span class="curation-card__arrow">&rarr;</span>
            </a>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero {
      padding: var(--space-3xl) 0; text-align: center;
      background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-deep) 100%);
      border-bottom: 1px solid var(--border);
    }
    .hero__title { font-size: 2.8rem; font-weight: 900; margin: 0 0 var(--space-md); line-height: 1.15; }
    .hero__subtitle { color: var(--text-secondary); font-size: 1.15rem; margin: 0 0 var(--space-xl); max-width: 520px; margin-left: auto; margin-right: auto; }
    .hero__actions { display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap; }
    .hero__btn { display: inline-flex; align-items: center; padding: var(--space-md) var(--space-xl); border-radius: var(--radius-lg); font-size: 1rem; text-decoration: none; }
    @media (max-width: 480px) { .hero__title { font-size: 2rem; } .hero__subtitle { font-size: 1rem; } .hero { padding: var(--space-2xl) 0; } }
    .section { margin-top: var(--space-2xl); }
    .section__header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: var(--space-lg); }
    .section__header h2 { margin: 0; }
    .scroll-card { min-width: 220px; max-width: 220px; scroll-snap-align: start; flex-shrink: 0; }
    @media (max-width: 480px) { .scroll-card { min-width: 160px; max-width: 160px; } }
    .departments { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-md); }
    .dept-card {
      display: flex; align-items: center; justify-content: center; padding: var(--space-xl) var(--space-lg);
      background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
      text-decoration: none; transition: all 0.2s; text-align: center;
    }
    .dept-card:hover { border-color: var(--accent-gold); background: var(--accent-gold-dim); }
    .dept-card__name { font-family: var(--font-heading); font-size: 1rem; font-weight: 600; color: var(--text-primary); }
    .dept-card:hover .dept-card__name { color: var(--accent-gold); }
    .curations { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-md); }
    .curation-card {
      display: flex; align-items: center; justify-content: space-between; padding: var(--space-lg) var(--space-xl);
      background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
      text-decoration: none; transition: all 0.2s;
    }
    .curation-card:hover { border-color: var(--accent-gold); background: var(--accent-gold-dim); }
    .curation-card__name { font-family: var(--font-heading); font-size: 1.05rem; font-weight: 600; color: var(--text-primary); }
    .curation-card:hover .curation-card__name { color: var(--accent-gold); }
    .curation-card__arrow { color: var(--text-tertiary); font-size: 1.2rem; transition: color 0.2s, transform 0.2s; }
    .curation-card:hover .curation-card__arrow { color: var(--accent-gold); transform: translateX(4px); }
    @media (max-width: 480px) { .departments, .curations { grid-template-columns: 1fr; } }
  `],
})
export class HomeComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly recentlyViewed = inject(RecentlyViewedService);
  private readonly http = inject(HttpClient);

  readonly departments = DEPARTMENTS;
  readonly curatedCollections = CURATED_COLLECTIONS;
  readonly recentArtworks = signal<ArtworkSummary[]>([]);

  ngOnInit(): void {
    this.catalog.loadFeatured();
    this.loadRecentlyViewed();
  }

  private loadRecentlyViewed(): void {
    const ids = this.recentlyViewed.ids();
    if (ids.length === 0) return;

    this.http.get<{ data: ArtInstituteArtworkRaw[] }>(
      `https://api.artic.edu/api/v1/artworks?ids=${ids.join(',')}&fields=id,title,artist_display,date_display,medium_display,image_id,is_public_domain,genre_titles,thumbnail`
    ).subscribe({
      next: (res) => {
        this.recentArtworks.set(res.data.map((raw) => ({
          id: raw.id,
          title: raw.title,
          artistDisplay: raw.artist_display ?? '',
          dateDisplay: raw.date_display ?? '',
          mediumDisplay: raw.medium_display ?? '',
          imageId: raw.image_id,
          isPublicDomain: raw.is_public_domain,
          genres: raw.genre_titles ?? [],
          thumbnail: raw.thumbnail ? { width: raw.thumbnail.width, height: raw.thumbnail.height, altText: raw.thumbnail.alt_text ?? '' } : null,
        })));
      },
    });
  }
}
