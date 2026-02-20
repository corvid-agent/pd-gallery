import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../../core/services/collection.service';
import { CatalogService } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';
import type { ArtworkSummary, ArtInstituteArtworkRaw } from '../../core/models/artwork.model';
import type { Curation } from '../../core/models/collection.model';

const API_BASE = 'https://api.artic.edu/api/v1';
const SUMMARY_FIELDS =
  'id,title,artist_display,date_display,medium_display,image_id,is_public_domain,genre_titles,thumbnail';

@Component({
  selector: 'app-exhibition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    @if (viewingExhibition()) {
      <!-- Exhibition gallery view -->
      <div class="exhibit">
        <div class="exhibit__header">
          <button class="exhibit__back" (click)="closeExhibition()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>
          <h1 class="exhibit__title">{{ viewingExhibition()!.name }}</h1>
          <div class="exhibit__actions">
            <button class="btn-secondary btn-sm" (click)="shareExhibition(viewingExhibition()!)">Share</button>
          </div>
        </div>

        @if (galleryLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading exhibition...</p>
          </div>
        } @else if (galleryArtworks().length === 0) {
          <div class="empty-state">
            <p>This exhibition has no artworks yet.</p>
            <p class="empty-hint">Browse artworks and add them to this exhibition from the artwork detail page.</p>
          </div>
        } @else {
          <!-- Slideshow mode -->
          @if (slideshowMode()) {
            <div class="slideshow" (click)="nextSlide()" (keydown.ArrowRight)="nextSlide()" (keydown.ArrowLeft)="prevSlide()" (keydown.Escape)="slideshowMode.set(false)" tabindex="0">
              <button class="slideshow__close" (click)="slideshowMode.set(false); $event.stopPropagation()" aria-label="Close slideshow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <button class="slideshow__nav slideshow__nav--left" (click)="prevSlide(); $event.stopPropagation()" aria-label="Previous slide">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              @if (currentSlide(); as slide) {
                <img
                  class="slideshow__img"
                  [src]="catalog.iiifUrl(slide.imageId!, 1686)"
                  [alt]="slide.thumbnail?.altText || slide.title"
                  loading="eager"
                />
                <div class="slideshow__info">
                  <h2>{{ slide.title }}</h2>
                  <p>{{ slide.artistDisplay }}</p>
                  <p class="slideshow__date">{{ slide.dateDisplay }}</p>
                </div>
                <div class="slideshow__counter">{{ slideIndex() + 1 }} / {{ galleryArtworks().length }}</div>
              }
              <button class="slideshow__nav slideshow__nav--right" (click)="nextSlide(); $event.stopPropagation()" aria-label="Next slide">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          }

          <!-- Gallery grid -->
          <div class="exhibit__controls">
            <span class="exhibit__count">{{ galleryArtworks().length }} artworks</span>
            <button class="btn-primary btn-sm" (click)="startSlideshow()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Slideshow
            </button>
          </div>
          <div class="exhibit__grid">
            @for (artwork of galleryArtworks(); track artwork.id) {
              <div class="exhibit__card" (click)="goToArtwork(artwork.id)">
                @if (artwork.imageId) {
                  <img
                    class="exhibit__card-img"
                    [src]="catalog.iiifUrl(artwork.imageId, 400)"
                    [alt]="artwork.thumbnail?.altText || artwork.title"
                    loading="lazy"
                  />
                } @else {
                  <div class="exhibit__card-placeholder">No Image</div>
                }
                <div class="exhibit__card-info">
                  <h3>{{ artwork.title }}</h3>
                  <p>{{ artwork.artistDisplay }}</p>
                </div>
                <button
                  class="exhibit__card-remove"
                  (click)="removeFromExhibition(viewingExhibition()!.id, artwork.id); $event.stopPropagation()"
                  aria-label="Remove from exhibition"
                  title="Remove from exhibition"
                >&times;</button>
              </div>
            }
          </div>
        }
      </div>
    } @else {
      <!-- Exhibition list view -->
      <div class="exhibitions container">
        <div class="exhibitions__header">
          <h1>Exhibitions</h1>
          <p class="exhibitions__subtitle">Curate your own virtual exhibitions by selecting artworks.</p>
        </div>

        @if (sharedArtworks().length > 0) {
          <div class="shared-exhibit">
            <h2 class="shared-exhibit__title">Shared Exhibition</h2>
            <p class="shared-exhibit__hint">This exhibition was shared with you. Save it to your collection to keep it.</p>
            <button class="btn-primary btn-sm" (click)="saveSharedExhibition()">Save to My Exhibitions</button>
            <div class="exhibit__grid" style="margin-top: var(--space-lg)">
              @for (artwork of sharedArtworks(); track artwork.id) {
                <div class="exhibit__card" (click)="goToArtwork(artwork.id)">
                  @if (artwork.imageId) {
                    <img class="exhibit__card-img" [src]="catalog.iiifUrl(artwork.imageId, 400)" [alt]="artwork.title" loading="lazy" />
                  }
                  <div class="exhibit__card-info">
                    <h3>{{ artwork.title }}</h3>
                    <p>{{ artwork.artistDisplay }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <div class="exhibitions__create">
          <form (ngSubmit)="createExhibition()" class="create-form">
            <input
              class="create-form__input"
              type="text"
              placeholder="New exhibition name..."
              [(ngModel)]="newName"
              name="name"
              maxlength="80"
              aria-label="Exhibition name"
            />
            <button class="btn-primary btn-sm" type="submit" [disabled]="!newName().trim()">Create</button>
          </form>
        </div>

        @if (exhibitions().length === 0) {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="m2 17 5-5 4 4 4-6 7 7"/><circle cx="15.5" cy="7.5" r="1.5"/></svg>
            <p>No exhibitions yet.</p>
            <p class="empty-hint">Create one above and add artworks while browsing the collection.</p>
          </div>
        } @else {
          <div class="exhibitions__list">
            @for (ex of exhibitions(); track ex.id) {
              <div class="exhibition-card" (click)="openExhibition(ex)">
                <div class="exhibition-card__preview">
                  @if (ex.artworkIds.length > 0) {
                    @for (id of ex.artworkIds.slice(0, 3); track id) {
                      <div class="exhibition-card__thumb" [style.background-image]="'url(' + catalog.iiifUrl(id + '', 200) + ')'"></div>
                    }
                  } @else {
                    <div class="exhibition-card__empty">Empty</div>
                  }
                </div>
                <div class="exhibition-card__info">
                  <h3>{{ ex.name }}</h3>
                  <p>{{ ex.artworkIds.length }} artwork{{ ex.artworkIds.length !== 1 ? 's' : '' }}</p>
                </div>
                <div class="exhibition-card__actions" (click)="$event.stopPropagation()">
                  <button class="btn-icon" (click)="shareExhibition(ex)" title="Share" aria-label="Share exhibition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  </button>
                  <button class="btn-icon btn-danger" (click)="deleteExhibition(ex.id)" title="Delete" aria-label="Delete exhibition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .exhibitions { padding: var(--space-xl) var(--space-lg); max-width: 960px; margin: 0 auto; }
    .exhibitions__header { margin-bottom: var(--space-xl); }
    .exhibitions__header h1 { font-size: 2rem; margin: 0 0 var(--space-xs); color: var(--text-primary); }
    .exhibitions__subtitle { color: var(--text-secondary); font-size: 1rem; margin: 0; }
    .exhibitions__create { margin-bottom: var(--space-xl); }
    .create-form { display: flex; gap: var(--space-sm); }
    .create-form__input {
      flex: 1; padding: var(--space-sm) var(--space-md); background: var(--bg-raised);
      border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary);
      font-size: 0.95rem;
    }
    .create-form__input::placeholder { color: var(--text-tertiary); }
    .create-form__input:focus { border-color: var(--accent-gold); outline: none; }
    .exhibitions__list { display: flex; flex-direction: column; gap: var(--space-md); }
    .exhibition-card {
      display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md);
      background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
      cursor: pointer; transition: background-color 0.2s, border-color 0.2s;
    }
    .exhibition-card:hover { background: var(--bg-hover); border-color: var(--border-bright); }
    .exhibition-card__preview { display: flex; gap: 4px; flex-shrink: 0; }
    .exhibition-card__thumb {
      width: 48px; height: 48px; border-radius: var(--radius-sm); background-size: cover;
      background-position: center; background-color: var(--bg-raised);
    }
    .exhibition-card__empty {
      width: 48px; height: 48px; border-radius: var(--radius-sm); background: var(--bg-raised);
      display: flex; align-items: center; justify-content: center; font-size: 0.7rem;
      color: var(--text-tertiary);
    }
    .exhibition-card__info { flex: 1; min-width: 0; }
    .exhibition-card__info h3 { font-size: 1rem; margin: 0 0 2px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .exhibition-card__info p { font-size: 0.85rem; color: var(--text-tertiary); margin: 0; }
    .exhibition-card__actions { display: flex; gap: var(--space-xs); flex-shrink: 0; }
    .btn-icon {
      width: 36px; height: 36px; min-width: 36px; min-height: 36px; border-radius: 50%;
      background: var(--bg-raised); border: 1px solid var(--border); color: var(--text-secondary);
      display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
    }
    .btn-icon:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--border-bright); }
    .btn-danger:hover { color: var(--color-error, #ef4444); border-color: var(--color-error, #ef4444); }
    .btn-primary {
      background: var(--accent-gold); color: var(--bg-deep); border: none; padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius); font-weight: 600; cursor: pointer; font-size: 0.85rem;
      display: inline-flex; align-items: center; gap: var(--space-xs); transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-secondary {
      background: var(--bg-raised); color: var(--text-primary); border: 1px solid var(--border);
      padding: var(--space-sm) var(--space-md); border-radius: var(--radius); font-weight: 600;
      cursor: pointer; font-size: 0.85rem; transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: var(--border-bright); background: var(--bg-hover); }
    .btn-sm { padding: 6px 14px; font-size: 0.8rem; }
    .empty-state {
      text-align: center; padding: var(--space-2xl) var(--space-lg); color: var(--text-tertiary);
      display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);
    }
    .empty-hint { font-size: 0.85rem; }
    .loading-state {
      text-align: center; padding: var(--space-2xl); color: var(--text-tertiary);
      display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
    }
    .spinner {
      width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--accent-gold);
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Exhibition view */
    .exhibit { padding: var(--space-lg); max-width: 1200px; margin: 0 auto; }
    .exhibit__header { display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-lg); flex-wrap: wrap; }
    .exhibit__back {
      display: flex; align-items: center; gap: 4px; background: none; border: none;
      color: var(--text-secondary); cursor: pointer; font-size: 0.9rem; padding: var(--space-xs);
      transition: color 0.2s;
    }
    .exhibit__back:hover { color: var(--text-primary); }
    .exhibit__title { flex: 1; font-size: 1.5rem; margin: 0; color: var(--text-primary); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .exhibit__controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md); }
    .exhibit__count { font-size: 0.875rem; color: var(--text-tertiary); }
    .exhibit__grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-md);
    }
    .exhibit__card {
      position: relative; background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden; cursor: pointer;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .exhibit__card:hover { transform: translateY(-2px); border-color: var(--border-bright); box-shadow: var(--shadow-md); }
    .exhibit__card-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; }
    .exhibit__card-placeholder {
      width: 100%; aspect-ratio: 4/3; background: var(--bg-raised); display: flex;
      align-items: center; justify-content: center; color: var(--text-tertiary); font-size: 0.875rem;
    }
    .exhibit__card-info { padding: var(--space-sm) var(--space-md); }
    .exhibit__card-info h3 { font-size: 0.875rem; margin: 0 0 2px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .exhibit__card-info p { font-size: 0.875rem; color: var(--text-tertiary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .exhibit__card-remove {
      position: absolute; top: 6px; right: 6px; width: 44px; height: 44px; border-radius: 50%;
      background: rgba(0,0,0,0.6); border: none; color: #fff; font-size: 1.1rem;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      opacity: 0; transition: opacity 0.2s;
    }
    .exhibit__card:hover .exhibit__card-remove { opacity: 1; }
    .exhibit__card-remove:hover { background: rgba(239,68,68,0.8); }

    /* Slideshow */
    .slideshow {
      position: fixed; inset: 0; background: #000; z-index: 300;
      display: flex; align-items: center; justify-content: center; outline: none;
    }
    .slideshow__close {
      position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1);
      border: none; color: #fff; width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      transition: background 0.2s; z-index: 2;
    }
    .slideshow__close:hover { background: rgba(255,255,255,0.2); }
    .slideshow__img { max-width: 80vw; max-height: 80vh; object-fit: contain; border-radius: 4px; }
    .slideshow__info {
      position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
      text-align: center; color: #fff; max-width: 600px;
    }
    .slideshow__info h2 { font-size: 1.3rem; margin: 0 0 4px; text-shadow: 0 2px 8px rgba(0,0,0,0.8); }
    .slideshow__info p { font-size: 0.9rem; margin: 0; opacity: 0.8; text-shadow: 0 1px 4px rgba(0,0,0,0.8); }
    .slideshow__date { font-size: 0.875rem !important; opacity: 0.6 !important; }
    .slideshow__counter {
      position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,0.6); font-size: 0.875rem; font-weight: 600;
    }
    .slideshow__nav {
      position: absolute; top: 50%; transform: translateY(-50%); width: 48px; height: 64px;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      color: rgba(255,255,255,0.5); transition: color 0.2s; border: none; background: none; padding: 0;
    }
    .slideshow__nav:hover { color: #fff; }
    .slideshow__nav--left { left: 16px; }
    .slideshow__nav--right { right: 16px; }

    /* Shared exhibition */
    .shared-exhibit { margin-bottom: var(--space-2xl); padding: var(--space-lg); background: var(--bg-surface); border: 1px solid var(--accent-gold-dim, var(--border)); border-radius: var(--radius-lg); }
    .shared-exhibit__title { font-size: 1.3rem; margin: 0 0 var(--space-xs); color: var(--accent-gold); }
    .shared-exhibit__hint { font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 var(--space-md); }

    @media (max-width: 768px) {
      .exhibitions { padding: var(--space-lg) var(--space-md); }
      .exhibit { padding: var(--space-md); }
      .exhibit__grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-sm); }
      .exhibit__header { gap: var(--space-sm); }
      .exhibit__title { font-size: 1.2rem; }
      .create-form { flex-direction: column; }
    }
  `],
})
export class ExhibitionComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly collection = inject(CollectionService);
  readonly catalog = inject(CatalogService);
  private readonly notifications = inject(NotificationService);

  readonly exhibitions = this.collection.curations;
  readonly viewingExhibition = signal<Curation | null>(null);
  readonly galleryArtworks = signal<ArtworkSummary[]>([]);
  readonly galleryLoading = signal(false);
  readonly slideshowMode = signal(false);
  readonly slideIndex = signal(0);
  readonly sharedArtworks = signal<ArtworkSummary[]>([]);
  readonly newName = signal('');

  readonly currentSlide = computed(() => {
    const artworks = this.galleryArtworks();
    const idx = this.slideIndex();
    return artworks[idx] ?? null;
  });

  private sharedIds: number[] = [];

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const idsParam = params.get('ids');
    if (idsParam) {
      this.sharedIds = idsParam.split(',').map((s) => parseInt(s, 10)).filter((n) => !isNaN(n));
      if (this.sharedIds.length > 0) {
        this.loadArtworks(this.sharedIds, (artworks) => this.sharedArtworks.set(artworks));
      }
    }

    const exId = this.route.snapshot.params['id'];
    if (exId) {
      const ex = this.exhibitions().find((e) => e.id === exId);
      if (ex) {
        this.openExhibition(ex);
      }
    }
  }

  ngOnDestroy(): void {
    this.slideshowMode.set(false);
  }

  createExhibition(): void {
    const name = this.newName().trim();
    if (!name) return;
    this.collection.createCuration(name);
    this.newName.set('');
    this.notifications.show(`Exhibition "${name}" created`, 'success');
  }

  deleteExhibition(id: string): void {
    this.collection.deleteCuration(id);
    this.notifications.show('Exhibition deleted', 'info');
  }

  openExhibition(ex: Curation): void {
    this.viewingExhibition.set(ex);
    if (ex.artworkIds.length > 0) {
      this.galleryLoading.set(true);
      this.loadArtworks(ex.artworkIds, (artworks) => {
        this.galleryArtworks.set(artworks);
        this.galleryLoading.set(false);
      });
    } else {
      this.galleryArtworks.set([]);
    }
  }

  closeExhibition(): void {
    this.viewingExhibition.set(null);
    this.galleryArtworks.set([]);
    this.slideshowMode.set(false);
  }

  removeFromExhibition(curationId: string, artworkId: number): void {
    this.collection.removeFromCuration(curationId, artworkId);
    this.galleryArtworks.update((list) => list.filter((a) => a.id !== artworkId));
    this.notifications.show('Removed from exhibition', 'info');
  }

  shareExhibition(ex: Curation): void {
    if (ex.artworkIds.length === 0) {
      this.notifications.show('Add artworks before sharing', 'info');
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}?ids=${ex.artworkIds.join(',')}`;
    navigator.clipboard.writeText(url).then(
      () => this.notifications.show('Share link copied to clipboard!', 'success'),
      () => this.notifications.show('Could not copy link', 'error'),
    );
  }

  saveSharedExhibition(): void {
    if (this.sharedIds.length === 0) return;
    const ex = this.collection.createCuration('Shared Exhibition');
    for (const id of this.sharedIds) {
      this.collection.addToCuration(ex.id, id);
    }
    this.sharedArtworks.set([]);
    this.sharedIds = [];
    this.notifications.show('Exhibition saved to your collection!', 'success');
    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
  }

  startSlideshow(): void {
    this.slideIndex.set(0);
    this.slideshowMode.set(true);
  }

  nextSlide(): void {
    const len = this.galleryArtworks().length;
    if (len === 0) return;
    this.slideIndex.update((i) => (i + 1) % len);
  }

  prevSlide(): void {
    const len = this.galleryArtworks().length;
    if (len === 0) return;
    this.slideIndex.update((i) => (i - 1 + len) % len);
  }

  goToArtwork(id: number): void {
    this.router.navigate(['/artwork', id]);
  }

  private loadArtworks(ids: number[], cb: (artworks: ArtworkSummary[]) => void): void {
    this.http
      .get<{ data: ArtInstituteArtworkRaw[] }>(
        `${API_BASE}/artworks?ids=${ids.join(',')}&fields=${SUMMARY_FIELDS}`
      )
      .subscribe({
        next: (res) => {
          cb(
            res.data.map((raw) => ({
              id: raw.id,
              title: raw.title,
              artistDisplay: raw.artist_display ?? '',
              dateDisplay: raw.date_display ?? '',
              mediumDisplay: raw.medium_display ?? '',
              imageId: raw.image_id,
              isPublicDomain: raw.is_public_domain,
              genres: raw.genre_titles ?? [],
              thumbnail: raw.thumbnail
                ? { width: raw.thumbnail.width, height: raw.thumbnail.height, altText: raw.thumbnail.alt_text ?? '' }
                : null,
            }))
          );
        },
        error: () => {
          cb([]);
          this.notifications.show('Failed to load artworks', 'error');
        },
      });
  }
}
