import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner" role="status" aria-label="Loading">
      <div class="spinner__ring"></div>
      <span class="sr-only">Loading...</span>
    </div>
  `,
  styles: [`
    .spinner {
      display: flex;
      justify-content: center;
      padding: var(--space-2xl);
    }
    .spinner__ring {
      width: 48px;
      height: 48px;
      border: 3px solid var(--border);
      border-top-color: var(--accent-gold);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinner__ring { animation: none; opacity: 0.6; }
    }
  `],
})
export class LoadingSpinnerComponent {}
