import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="not-found container">
      <h1 class="not-found__title">Page Not Found</h1>
      <p class="not-found__text">The artwork you're looking for may have been moved to another gallery.</p>
      <a routerLink="/home" class="btn-primary not-found__btn">Return to Gallery</a>
    </div>
  `,
  styles: [`
    .not-found {
      text-align: center; padding: var(--space-3xl) var(--space-lg);
      min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .not-found__title { font-size: 2.4rem; color: var(--accent-gold); margin-bottom: var(--space-md); }
    .not-found__text { color: var(--text-secondary); font-size: 1.1rem; margin: 0 0 var(--space-xl); }
    .not-found__btn { display: inline-flex; align-items: center; padding: var(--space-md) var(--space-2xl); text-decoration: none; border-radius: var(--radius-lg); }
  `],
})
export class NotFoundComponent {}
