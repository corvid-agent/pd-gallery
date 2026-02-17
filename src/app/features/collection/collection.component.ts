import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../../core/services/collection.service';
import { NotificationService } from '../../core/services/notification.service';
import { ArtworkGridComponent } from '../../shared/components/artwork-grid.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { HttpClient } from '@angular/common/http';
import type { ArtworkSummary, ArtInstituteArtworkRaw } from '../../core/models/artwork.model';

type Tab = 'favorites' | 'history' | 'curations';

@Component({
  selector: 'app-collection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ArtworkGridComponent, SkeletonGridComponent],
  template: `
    <div class="collection container">
      <h1>My Collection</h1>

      <div class="collection__tabs" role="tablist" aria-label="Collection tabs">
        <button
          class="collection__tab"
          [class.active]="activeTab() === 'favorites'"
          (click)="setTab('favorites')"
          role="tab"
          id="tab-favorites"
          aria-controls="panel-favorites"
          [attr.aria-selected]="activeTab() === 'favorites'"
        >
          Favorites ({{ collection.favorites().length }})
        </button>
        <button
          class="collection__tab"
          [class.active]="activeTab() === 'history'"
          (click)="setTab('history')"
          role="tab"
          id="tab-history"
          aria-controls="panel-history"
          [attr.aria-selected]="activeTab() === 'history'"
        >
          Recently Viewed ({{ collection.viewHistory().length }})
        </button>
        <button
          class="collection__tab"
          [class.active]="activeTab() === 'curations'"
          (click)="setTab('curations')"
          role="tab"
          id="tab-curations"
          aria-controls="panel-curations"
          [attr.aria-selected]="activeTab() === 'curations'"
        >
          My Curations ({{ collection.curations().length }})
        </button>
      </div>

      @if (activeTab() === 'favorites') {
        <div role="tabpanel" id="panel-favorites" aria-labelledby="tab-favorites">
        @if (loading()) {
          <app-skeleton-grid [count]="6" />
        } @else if (favoriteArtworks().length === 0) {
          <div class="collection__empty" role="status">
            <p>No favorites yet. Browse artworks and tap the heart to add favorites.</p>
          </div>
        } @else {
          <app-artwork-grid [artworks]="favoriteArtworks()" />
        }
        </div>
      }

      @if (activeTab() === 'history') {
        <div role="tabpanel" id="panel-history" aria-labelledby="tab-history">
        @if (loading()) {
          <app-skeleton-grid [count]="6" />
        } @else if (historyArtworks().length === 0) {
          <div class="collection__empty" role="status">
            <p>No recently viewed artworks yet. Start browsing to build your history.</p>
          </div>
        } @else {
          <app-artwork-grid [artworks]="historyArtworks()" />
        }
        </div>
      }

      @if (activeTab() === 'curations') {
        <div class="collection__curations" role="tabpanel" id="panel-curations" aria-labelledby="tab-curations">
          <div class="collection__create-curation">
            <label for="curation-name-input" class="sr-only">New curation name</label>
            <input
              id="curation-name-input"
              class="collection__curation-input"
              type="text"
              placeholder="New curation name..."
              [(ngModel)]="newCurationName"
              name="curationName"
              (keydown.enter)="createCuration()"
            />
            <button class="btn-primary" (click)="createCuration()" [disabled]="!newCurationName().trim()">Create</button>
          </div>

          @if (collection.curations().length === 0) {
            <div class="collection__empty" role="status">
              <p>No curations yet. Create a named collection to organize your favorite artworks.</p>
            </div>
          } @else {
            @for (curation of collection.curations(); track curation.id) {
              <div class="curation-card">
                <div class="curation-card__header">
                  <h3 class="curation-card__name">{{ curation.name }}</h3>
                  <span class="curation-card__count">{{ curation.artworkIds.length }} works</span>
                  <button class="curation-card__delete" (click)="deleteCuration(curation.id)" aria-label="Delete curation">&times;</button>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .collection { padding-top: var(--space-xl); padding-bottom: var(--space-xl); }
    .collection__tabs { display: flex; gap: var(--space-xs); margin-bottom: var(--space-xl); border-bottom: 1px solid var(--border); padding-bottom: var(--space-xs); overflow-x: auto; }
    .collection__tab {
      background: none; border: none; padding: var(--space-sm) var(--space-lg); color: var(--text-tertiary);
      font-size: 0.9rem; font-weight: 600; cursor: pointer; border-radius: var(--radius) var(--radius) 0 0;
      transition: color 0.2s, background-color 0.2s; white-space: nowrap;
    }
    .collection__tab:hover { color: var(--text-primary); background: var(--bg-hover); }
    .collection__tab.active { color: var(--accent-gold); border-bottom: 2px solid var(--accent-gold); }
    .collection__empty { text-align: center; padding: var(--space-3xl); color: var(--text-tertiary); font-size: 1rem; }
    .collection__curations { display: flex; flex-direction: column; gap: var(--space-md); }
    .collection__create-curation { display: flex; gap: var(--space-sm); margin-bottom: var(--space-lg); }
    .collection__curation-input { flex: 1; }
    .curation-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-lg); }
    .curation-card__header { display: flex; align-items: center; gap: var(--space-md); }
    .curation-card__name { margin: 0; flex: 1; font-size: 1.1rem; }
    .curation-card__count { color: var(--text-tertiary); font-size: 0.85rem; }
    .curation-card__delete { background: none; border: none; color: var(--text-tertiary); font-size: 1.3rem; cursor: pointer; padding: 4px 8px; min-height: auto; min-width: auto; }
    .curation-card__delete:hover { color: var(--color-error); }
    @media (max-width: 480px) { .collection__create-curation { flex-direction: column; } }
  `],
})
export class CollectionComponent implements OnInit {
  protected readonly collection = inject(CollectionService);
  private readonly notifications = inject(NotificationService);
  private readonly http = inject(HttpClient);

  readonly activeTab = signal<Tab>('favorites');
  readonly loading = signal(false);
  readonly favoriteArtworks = signal<ArtworkSummary[]>([]);
  readonly historyArtworks = signal<ArtworkSummary[]>([]);
  readonly newCurationName = signal('');

  ngOnInit(): void {
    this.loadFavorites();
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'favorites') this.loadFavorites();
    if (tab === 'history') this.loadHistory();
  }

  createCuration(): void {
    const name = this.newCurationName().trim();
    if (!name) return;
    this.collection.createCuration(name);
    this.newCurationName.set('');
    this.notifications.show(`Created "${name}" curation`, 'success');
  }

  deleteCuration(id: string): void {
    this.collection.deleteCuration(id);
    this.notifications.show('Curation deleted', 'info');
  }

  private loadFavorites(): void {
    const ids = this.collection.favorites().map((f) => f.artworkId);
    this.loadArtworks(ids, this.favoriteArtworks);
  }

  private loadHistory(): void {
    const ids = this.collection.viewHistory().slice(0, 24).map((v) => v.artworkId);
    this.loadArtworks(ids, this.historyArtworks);
  }

  private loadArtworks(ids: number[], target: typeof this.favoriteArtworks): void {
    if (ids.length === 0) { target.set([]); return; }
    this.loading.set(true);
    this.http.get<{ data: ArtInstituteArtworkRaw[] }>(
      `https://api.artic.edu/api/v1/artworks?ids=${ids.join(',')}&fields=id,title,artist_display,date_display,medium_display,image_id,is_public_domain,genre_titles,thumbnail`
    ).subscribe({
      next: (res) => {
        target.set(res.data.map((raw) => ({
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
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }
}
