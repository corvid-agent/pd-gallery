import { Component, ChangeDetectionStrategy, inject, OnInit, input, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CatalogService } from '../../core/services/catalog.service';
import { ArtworkGridComponent } from '../../shared/components/artwork-grid.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';

@Component({
  selector: 'app-department',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ArtworkGridComponent, SkeletonGridComponent],
  template: `
    <div class="department container">
      <h1>{{ name() }}</h1>
      @if (catalog.totalResults() > 0) {
        <p class="department__count">{{ catalog.totalResults() | number }} artworks</p>
      }

      @if (catalog.loading()) {
        <app-skeleton-grid />
      } @else {
        <app-artwork-grid [artworks]="catalog.results()" />
        @if (catalog.results().length > 0 && hasMore()) {
          <div class="department__pagination">
            @if (currentPage() > 1) {
              <button class="btn-secondary" (click)="prevPage()">Previous</button>
            }
            <span class="department__page-info">Page {{ currentPage() }}</span>
            <button class="btn-secondary" (click)="nextPage()">Next Page</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .department { padding-top: var(--space-xl); padding-bottom: var(--space-xl); }
    .department__count { color: var(--text-tertiary); font-size: 0.9rem; margin: 0 0 var(--space-lg); }
    .department__pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-lg); margin-top: var(--space-2xl); }
    .department__page-info { color: var(--text-tertiary); font-size: 0.9rem; }
  `],
})
export class DepartmentComponent implements OnInit {
  readonly name = input.required<string>();
  protected readonly catalog = inject(CatalogService);
  readonly currentPage = signal(1);
  readonly hasMore = computed(() => this.catalog.results().length >= 24);

  ngOnInit(): void {
    this.catalog.loadByDepartment(this.name());
  }

  nextPage(): void {
    this.currentPage.update((p) => p + 1);
    this.catalog.loadByDepartment(this.name(), this.currentPage());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevPage(): void {
    this.currentPage.update((p) => Math.max(1, p - 1));
    this.catalog.loadByDepartment(this.name(), this.currentPage());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
