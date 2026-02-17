import { Component, ChangeDetectionStrategy, inject, OnInit, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ArtworkGridComponent } from '../../shared/components/artwork-grid.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import type { ArtworkSummary, ArtInstituteArtworkRaw } from '../../core/models/artwork.model';
import { CatalogService } from '../../core/services/catalog.service';

@Component({
  selector: 'app-artist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ArtworkGridComponent, SkeletonGridComponent, LoadingSpinnerComponent],
  template: `
    <div class="artist container">
      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <h1 class="artist__name">{{ artistName() }}</h1>
        @if (artistDates()) {
          <p class="artist__dates">{{ artistDates() }}</p>
        }
        @if (artistDescription()) {
          <p class="artist__bio">{{ artistDescription() }}</p>
        }

        <h2 class="artist__works-title">Works by this artist</h2>
        @if (artworksLoading()) {
          <app-skeleton-grid />
        } @else {
          <app-artwork-grid [artworks]="artworks()" />
        }
      }
    </div>
  `,
  styles: [`
    .artist { padding-top: var(--space-xl); padding-bottom: var(--space-xl); }
    .artist__name { margin-bottom: var(--space-xs); }
    .artist__dates { color: var(--text-tertiary); font-size: 1rem; margin: 0 0 var(--space-md); }
    .artist__bio { color: var(--text-secondary); line-height: 1.7; margin: 0 0 var(--space-2xl); max-width: 700px; }
    .artist__works-title { margin-bottom: var(--space-lg); }
  `],
})
export class ArtistComponent implements OnInit {
  readonly id = input.required<string>();
  private readonly http = inject(HttpClient);
  protected readonly catalog = inject(CatalogService);

  readonly loading = signal(true);
  readonly artworksLoading = signal(true);
  readonly artistName = signal('');
  readonly artistDates = signal('');
  readonly artistDescription = signal('');
  readonly artworks = signal<ArtworkSummary[]>([]);

  ngOnInit(): void {
    const numId = Number(this.id());
    if (isNaN(numId)) return;

    this.http.get<{ data: { id: number; title: string; birth_date: number | null; death_date: number | null; description: string | null } }>(
      `https://api.artic.edu/api/v1/agents/${numId}?fields=id,title,birth_date,death_date,description`
    ).subscribe({
      next: (res) => {
        const a = res.data;
        this.artistName.set(a.title);
        if (a.birth_date || a.death_date) {
          this.artistDates.set(`${a.birth_date ?? '?'} – ${a.death_date ?? 'present'}`);
        }
        if (a.description) {
          this.artistDescription.set(a.description.replace(/<[^>]+>/g, ''));
        }
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });

    this.http.get<{ data: ArtInstituteArtworkRaw[] }>(
      `https://api.artic.edu/api/v1/artworks/search?query[term][artist_id]=${numId}&fields=id,title,artist_display,date_display,medium_display,image_id,is_public_domain,genre_titles,thumbnail&limit=24&query[term][is_public_domain]=true`
    ).subscribe({
      next: (res) => {
        this.artworks.set(res.data.map((raw) => ({
          id: raw.id, title: raw.title, artistDisplay: raw.artist_display ?? '',
          dateDisplay: raw.date_display ?? '', mediumDisplay: raw.medium_display ?? '',
          imageId: raw.image_id, isPublicDomain: raw.is_public_domain,
          genres: raw.genre_titles ?? [],
          thumbnail: raw.thumbnail ? { width: raw.thumbnail.width, height: raw.thumbnail.height, altText: raw.thumbnail.alt_text ?? '' } : null,
        })));
        this.artworksLoading.set(false);
      },
      error: () => { this.artworksLoading.set(false); },
    });
  }
}
