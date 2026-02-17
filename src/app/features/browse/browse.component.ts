import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { ArtworkGridComponent } from '../../shared/components/artwork-grid.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';

const DEPARTMENTS = [
  'Painting and Sculpture of Europe',
  'Photography and Media',
  'Prints and Drawings',
  'Arts of the Americas',
  'Asian Art',
  'Textiles',
  'Architecture and Design',
  'Modern Art',
];

@Component({
  selector: 'app-browse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, ArtworkGridComponent, SkeletonGridComponent],
  template: `
    <div class="browse container">
      <h1 class="browse__title">Browse Artworks</h1>
      <div class="browse__controls">
        <form class="browse__search" (ngSubmit)="doSearch()" role="search">
          <svg class="browse__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            class="browse__search-input"
            type="search"
            placeholder="Search by title, artist, or keyword..."
            [(ngModel)]="query"
            name="q"
            aria-label="Search artworks"
          />
          <button class="browse__search-btn btn-primary" type="submit">Search</button>
        </form>
        <div class="browse__filters">
          <select class="browse__filter-select" [(ngModel)]="selectedDepartment" name="department" (change)="doSearch()" aria-label="Filter by department">
            <option value="">All Departments</option>
            @for (d of departments; track d) {
              <option [value]="d">{{ d }}</option>
            }
          </select>
          <select class="browse__filter-select" [(ngModel)]="sortBy" name="sort" (change)="doSearch()" aria-label="Sort by">
            <option value="">Relevance</option>
            <option value="title">Title A–Z</option>
            <option value="date">Date (oldest first)</option>
          </select>
        </div>
      </div>

      @if (catalog.loading()) {
        <app-skeleton-grid />
      } @else if (catalog.error()) {
        <div class="browse__error" role="alert">
          <p>{{ catalog.error() }}</p>
          <button class="btn-primary" (click)="doSearch()">Retry</button>
        </div>
      } @else {
        @if (catalog.totalResults() > 0) {
          <p class="browse__count" role="status" aria-live="polite">{{ catalog.totalResults() | number }} artworks found</p>
        }
        <app-artwork-grid [artworks]="catalog.results()" />
        @if (catalog.results().length > 0 && hasMore()) {
          <nav class="browse__pagination" aria-label="Pagination">
            @if (currentPage() > 1) {
              <button class="btn-secondary" (click)="prevPage()">Previous</button>
            }
            <span class="browse__page-info" aria-current="page">Page {{ currentPage() }}</span>
            <button class="btn-secondary" (click)="nextPage()">Next Page</button>
          </nav>
        }
      }
    </div>
  `,
  styles: [`
    .browse { padding-top: var(--space-xl); padding-bottom: var(--space-xl); }
    .browse__title { margin-bottom: var(--space-lg); }
    .browse__controls { margin-bottom: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-md); }
    .browse__search { display: flex; gap: var(--space-sm); position: relative; }
    .browse__search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); pointer-events: none; }
    .browse__search-input {
      flex: 1; padding-left: 40px; background: var(--bg-input); border: 1px solid var(--border);
      border-radius: var(--radius); color: var(--text-primary); font-size: 1rem;
    }
    .browse__search-input:focus { border-color: var(--accent-gold); outline: none; box-shadow: 0 0 0 3px var(--accent-gold-dim); }
    .browse__search-btn { padding: var(--space-sm) var(--space-xl); white-space: nowrap; }
    .browse__filters { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
    .browse__filter-select {
      flex: 1; min-width: 180px; padding: var(--space-sm) var(--space-md); background: var(--bg-input);
      border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary);
      font-size: 0.9rem; cursor: pointer;
    }
    .browse__filter-select:focus { border-color: var(--accent-gold); outline: none; }
    .browse__count { color: var(--text-tertiary); font-size: 0.9rem; margin: 0 0 var(--space-md); }
    .browse__error { text-align: center; padding: var(--space-2xl); color: var(--text-secondary); }
    .browse__pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-lg); margin-top: var(--space-2xl); }
    .browse__page-info { color: var(--text-tertiary); font-size: 0.9rem; }
    @media (max-width: 480px) {
      .browse__search { flex-direction: column; }
      .browse__search-btn { width: 100%; }
      .browse__filters { flex-direction: column; }
      .browse__filter-select { min-width: 0; }
    }
  `],
})
export class BrowseComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);

  readonly departments = DEPARTMENTS;
  readonly query = signal('');
  readonly selectedDepartment = signal('');
  readonly sortBy = signal('');
  readonly currentPage = signal(1);
  readonly hasMore = computed(() => this.catalog.results().length >= 24);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.query.set(params['q']);
      }
      if (params['department']) {
        this.selectedDepartment.set(params['department']);
      }
      this.doSearch();
    });
  }

  doSearch(): void {
    this.currentPage.set(1);
    this.loadPage();
  }

  nextPage(): void {
    this.currentPage.update((p) => p + 1);
    this.loadPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevPage(): void {
    this.currentPage.update((p) => Math.max(1, p - 1));
    this.loadPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadPage(): void {
    this.catalog.search({
      query: this.query() || undefined,
      department: this.selectedDepartment() || undefined,
      sortBy: this.sortBy() || undefined,
      page: this.currentPage(),
      limit: 24,
    });
  }
}
