import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LazyImageDirective } from '../directives/lazy-image.directive';
import { CollectionService } from '../../core/services/collection.service';
import { CatalogService } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';
import type { ArtworkSummary } from '../../core/models/artwork.model';

@Component({
  selector: 'app-artwork-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LazyImageDirective, RouterLink],
  template: `
    <a class="card" [routerLink]="['/artwork', artwork().id]">
      <div class="card__image-wrap">
        @if (artwork().imageId && !imgFailed()) {
          <img appLazyImage [src]="catalog.iiifUrl(artwork().imageId!, 843)" [alt]="artwork().thumbnail?.altText || artwork().title" [class.loaded]="imgLoaded()" (load)="onImageLoad()" (error)="imgFailed.set(true)" />
        } @else {
          <div class="card__placeholder">
            <span class="card__placeholder-title">{{ artwork().title }}</span>
            @if (artwork().artistDisplay) {
              <span class="card__placeholder-artist">{{ artwork().artistDisplay }}</span>
            }
          </div>
        }
        <div class="card__overlay" aria-hidden="true">
          @if (artwork().genres.length > 0) {
            <span class="card__genre">{{ artwork().genres[0] }}</span>
          }
        </div>
        @if (collection.isFavorite(artwork().id)) {
          <span class="card__heart" aria-label="Favorited">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
        }
        <div class="card__actions">
          <button
            class="card__action"
            [attr.aria-label]="collection.isFavorite(artwork().id) ? 'Remove from favorites' : 'Add to favorites'"
            (click)="toggleFavorite($event)"
          >
            @if (collection.isFavorite(artwork().id)) {
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            } @else {
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
          </button>
        </div>
      </div>
      <div class="card__info">
        <h3 class="card__title">{{ artwork().title }}</h3>
        <div class="card__meta">
          @if (artwork().artistDisplay) {
            <span class="card__artist">{{ artwork().artistDisplay }}</span>
          }
          @if (artwork().dateDisplay) {
            <span class="card__date">{{ artwork().dateDisplay }}</span>
          }
        </div>
      </div>
    </a>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 0;
    }
    .card {
      display: block;
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      cursor: pointer;
      background: transparent;
    }
    @media (hover: hover) and (pointer: fine) {
      .card:hover {
        transform: translateY(-6px) scale(1.02);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
      }
      .card:hover .card__image-wrap {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--accent-gold);
      }
      .card:hover .card__image-wrap img {
        transform: scale(1.05);
      }
    }
    .card__image-wrap {
      position: relative;
      aspect-ratio: 4 / 3;
      background-color: var(--bg-raised);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-artwork);
    }
    .card__image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease, filter 0.4s ease;
      filter: blur(8px);
    }
    .card__image-wrap img.loaded {
      filter: blur(0);
    }
    .card__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: var(--space-lg);
      text-align: center;
      background: linear-gradient(170deg, #1a1a1a 0%, #222 40%, #1a1a1a 100%);
    }
    .card__placeholder-title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card__placeholder-artist {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      font-style: italic;
    }
    .card__overlay {
      position: absolute;
      top: var(--space-sm);
      left: var(--space-sm);
      right: var(--space-sm);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      pointer-events: none;
    }
    .card__genre {
      background-color: rgba(0, 0, 0, 0.75);
      color: var(--accent-gold);
      font-size: 0.875rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      backdrop-filter: blur(4px);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .card__heart {
      position: absolute;
      bottom: var(--space-sm);
      right: var(--space-sm);
      color: #e53e3e;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
      pointer-events: none;
    }
    .card__actions {
      position: absolute;
      bottom: var(--space-sm);
      left: var(--space-sm);
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: auto;
      z-index: 2;
    }
    @media (hover: hover) and (pointer: fine) {
      .card:hover .card__actions { opacity: 1; }
    }
    @media (hover: none) {
      .card__actions { opacity: 1; }
    }
    .card__action {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: background-color 0.2s, border-color 0.2s, transform 0.15s;
    }
    .card__action:hover {
      background: var(--accent-gold);
      border-color: var(--accent-gold);
      color: var(--bg-deep);
      transform: scale(1.15);
    }
    .card__info {
      padding: 10px 4px 4px;
    }
    .card__title {
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0 0 2px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      color: var(--text-primary);
      line-height: 1.3;
    }
    .card__meta {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .card__artist {
      color: var(--text-secondary);
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card__date {
      color: var(--text-tertiary);
      font-size: 0.875rem;
    }
    @media (max-width: 480px) {
      .card__title { -webkit-line-clamp: 1; font-size: 0.875rem; }
      .card__genre { padding: 2px 6px; }
      .card__info { padding: 6px 2px 2px; }
    }
    @media (max-width: 360px) {
      .card__overlay { top: var(--space-xs); left: var(--space-xs); right: var(--space-xs); }
      .card__action svg { width: 12px; height: 12px; }
      .card__heart svg { width: 12px; height: 12px; }
    }
  `],
})
export class ArtworkCardComponent {
  readonly artwork = input.required<ArtworkSummary>();
  readonly imgFailed = signal(false);
  readonly imgLoaded = signal(false);
  protected readonly catalog = inject(CatalogService);
  protected readonly collection = inject(CollectionService);
  private readonly notifications = inject(NotificationService);

  onImageLoad(): void {
    this.imgLoaded.set(true);
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const a = this.artwork();
    const wasFavorite = this.collection.isFavorite(a.id);
    this.collection.toggleFavorite(a.id);
    this.notifications.show(
      wasFavorite ? 'Removed from favorites' : `Added "${a.title}" to favorites`,
      wasFavorite ? 'info' : 'success'
    );
  }
}
