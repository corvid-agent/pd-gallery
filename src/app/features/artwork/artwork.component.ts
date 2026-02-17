import { Component, ChangeDetectionStrategy, inject, OnInit, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-artwork',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoadingSpinnerComponent, TruncatePipe],
  template: `
    @if (catalog.loading()) {
      <app-loading-spinner />
    } @else if (catalog.error()) {
      <div class="error container" role="alert">
        <p>{{ catalog.error() }}</p>
        <button class="btn-primary" (click)="load()">Retry</button>
      </div>
    } @else if (catalog.detail(); as artwork) {
      <div class="artwork container">
        <div class="artwork__layout">
          <div class="artwork__image-wrap">
            @if (artwork.imageId && !imageFailed()) {
              <img
                class="artwork__image"
                [src]="catalog.iiifUrl(artwork.imageId, 1686)"
                [alt]="artwork.thumbnail?.altText || artwork.title"
                (error)="imageFailed.set(true)"
              />
            } @else {
              <div class="artwork__no-image">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <p>{{ artwork.title }}</p>
              </div>
            }
          </div>
          <div class="artwork__details">
            <h1 class="artwork__title">{{ artwork.title }}</h1>
            @if (artwork.artistDisplay) {
              <p class="artwork__artist">{{ artwork.artistDisplay }}</p>
            }
            @if (artwork.dateDisplay) {
              <p class="artwork__date">{{ artwork.dateDisplay }}</p>
            }

            <div class="artwork__actions">
              <button
                class="btn-secondary artwork__action-btn"
                (click)="toggleFavorite()"
                [class.artwork__action-btn--active]="collection.isFavorite(artwork.id)"
              >
                @if (collection.isFavorite(artwork.id)) {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  Favorited
                } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  Favorite
                }
              </button>
              @if (artwork.imageId) {
                <a class="btn-secondary artwork__action-btn" [href]="catalog.iiifUrl(artwork.imageId, 3000)" target="_blank" rel="noopener" aria-label="Download full resolution image (opens in new tab)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download
                </a>
              }
            </div>

            <dl class="artwork__meta">
              @if (artwork.mediumDisplay) {
                <div class="artwork__meta-row">
                  <dt>Medium</dt>
                  <dd>{{ artwork.mediumDisplay }}</dd>
                </div>
              }
              @if (artwork.dimensions) {
                <div class="artwork__meta-row">
                  <dt>Dimensions</dt>
                  <dd>{{ artwork.dimensions }}</dd>
                </div>
              }
              @if (artwork.department) {
                <div class="artwork__meta-row">
                  <dt>Department</dt>
                  <dd><a [routerLink]="['/department', artwork.department]">{{ artwork.department }}</a></dd>
                </div>
              }
              @if (artwork.classification) {
                <div class="artwork__meta-row">
                  <dt>Classification</dt>
                  <dd>{{ artwork.classification }}</dd>
                </div>
              }
              @if (artwork.placeOfOrigin) {
                <div class="artwork__meta-row">
                  <dt>Origin</dt>
                  <dd>{{ artwork.placeOfOrigin }}</dd>
                </div>
              }
              @if (artwork.styleTitle) {
                <div class="artwork__meta-row">
                  <dt>Style</dt>
                  <dd>{{ artwork.styleTitle }}</dd>
                </div>
              }
              @if (artwork.creditLine) {
                <div class="artwork__meta-row">
                  <dt>Credit</dt>
                  <dd>{{ artwork.creditLine }}</dd>
                </div>
              }
              @if (artwork.galleryTitle) {
                <div class="artwork__meta-row">
                  <dt>Gallery</dt>
                  <dd>{{ artwork.galleryTitle }}</dd>
                </div>
              }
            </dl>

            @if (artwork.description) {
              <div class="artwork__description">
                <h3>About this work</h3>
                <div [innerHTML]="artwork.description"></div>
              </div>
            }

            @if (artwork.provenanceText) {
              <div class="artwork__provenance">
                <h3>Provenance</h3>
                <p>{{ artwork.provenanceText | truncate:500 }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .artwork { padding: var(--space-xl) var(--space-lg); }
    .artwork__layout {
      display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2xl); align-items: start;
      background-color: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl);
      padding: var(--space-xl);
    }
    .artwork__image-wrap { position: sticky; top: 80px; }
    .artwork__image { width: 100%; height: auto; border-radius: var(--radius-lg); box-shadow: var(--shadow-artwork); }
    .artwork__no-image {
      aspect-ratio: 4/3; background: var(--bg-raised); border-radius: var(--radius-lg);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-sm);
      color: var(--text-tertiary); padding: var(--space-lg); text-align: center;
    }
    .artwork__no-image p { margin: 0; font-size: 0.9rem; }
    .artwork__title { font-size: 2rem; margin: 0 0 var(--space-sm); }
    .artwork__artist { font-size: 1.1rem; color: var(--text-secondary); margin: 0 0 var(--space-xs); white-space: pre-line; }
    .artwork__date { font-size: 0.95rem; color: var(--text-tertiary); margin: 0 0 var(--space-lg); }
    .artwork__actions { display: flex; gap: var(--space-sm); flex-wrap: wrap; margin-bottom: var(--space-xl); }
    .artwork__action-btn { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-lg); text-decoration: none; font-size: 0.9rem; }
    .artwork__action-btn--active { border-color: #e53e3e; color: #e53e3e; }
    .artwork__meta { margin: 0 0 var(--space-xl); }
    .artwork__meta-row { display: flex; gap: var(--space-md); padding: var(--space-sm) 0; border-bottom: 1px solid var(--border); }
    .artwork__meta-row dt { flex: 0 0 120px; color: var(--text-tertiary); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .artwork__meta-row dd { margin: 0; color: var(--text-primary); font-size: 0.95rem; }
    .artwork__description { margin-bottom: var(--space-xl); }
    .artwork__description h3 { font-size: 1.1rem; margin-bottom: var(--space-sm); }
    .artwork__description div { color: var(--text-secondary); line-height: 1.7; }
    .artwork__provenance h3 { font-size: 1.1rem; margin-bottom: var(--space-sm); }
    .artwork__provenance p { color: var(--text-secondary); line-height: 1.6; font-size: 0.9rem; }
    .error { text-align: center; padding: var(--space-3xl); color: var(--text-secondary); }
    @media (max-width: 768px) {
      .artwork__layout { grid-template-columns: 1fr; gap: var(--space-xl); }
      .artwork__image-wrap { position: static; }
      .artwork__title { font-size: 1.5rem; }
      .artwork__meta-row { flex-direction: column; gap: 2px; }
      .artwork__meta-row dt { flex: none; }
    }
  `],
})
export class ArtworkComponent implements OnInit {
  readonly id = input.required<string>();
  protected readonly catalog = inject(CatalogService);
  protected readonly collection = inject(CollectionService);
  private readonly recentlyViewed = inject(RecentlyViewedService);
  private readonly notifications = inject(NotificationService);
  readonly imageFailed = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const numId = Number(this.id());
    if (!isNaN(numId)) {
      this.catalog.getDetail(numId);
      this.recentlyViewed.add(numId);
      this.collection.addToHistory(numId);
    }
  }

  toggleFavorite(): void {
    const artwork = this.catalog.detail();
    if (!artwork) return;
    const wasFavorite = this.collection.isFavorite(artwork.id);
    this.collection.toggleFavorite(artwork.id);
    this.notifications.show(
      wasFavorite ? 'Removed from favorites' : `Added "${artwork.title}" to favorites`,
      wasFavorite ? 'info' : 'success'
    );
  }
}
