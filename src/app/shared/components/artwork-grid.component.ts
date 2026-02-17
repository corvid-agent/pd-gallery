import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ArtworkCardComponent } from './artwork-card.component';
import type { ArtworkSummary } from '../../core/models/artwork.model';

@Component({
  selector: 'app-artwork-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ArtworkCardComponent],
  template: `
    <div class="grid" role="list" aria-label="Artwork list">
      @for (artwork of artworks(); track artwork.id) {
        <div role="listitem">
          <app-artwork-card [artwork]="artwork" />
        </div>
      } @empty {
        <div class="grid__empty">
          <p class="grid__empty-text">No artworks found matching your criteria.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--space-lg) var(--space-md);
    }
    .grid > * {
      min-width: 0;
    }
    .grid__empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--space-3xl) var(--space-lg);
    }
    .grid__empty-text {
      color: var(--text-tertiary);
      font-size: 1.05rem;
    }
    @media (min-width: 1200px) {
      .grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }
    }
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: var(--space-md) var(--space-sm);
      }
    }
    @media (max-width: 480px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-md) var(--space-sm);
      }
    }
    @media (max-width: 360px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-sm);
      }
    }
  `],
})
export class ArtworkGridComponent {
  readonly artworks = input.required<ArtworkSummary[]>();
}
