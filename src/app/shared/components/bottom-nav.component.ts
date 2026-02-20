import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" aria-label="Mobile navigation">
      <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }" class="bottom-nav__item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </a>
      <a routerLink="/browse" routerLinkActive="active" class="bottom-nav__item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span>Browse</span>
      </a>
      <a routerLink="/collection" routerLinkActive="active" class="bottom-nav__item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span>Collection</span>
      </a>
      <a routerLink="/exhibitions" routerLinkActive="active" class="bottom-nav__item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="m2 17 5-5 4 4 4-6 7 7"/><circle cx="15.5" cy="7.5" r="1.5"/></svg>
        <span>Exhibits</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      display: none; position: fixed; bottom: 0; left: 0; right: 0;
      background-color: rgba(14, 14, 16, 0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid var(--border); z-index: 100;
      padding: var(--space-xs) 0; padding-bottom: env(safe-area-inset-bottom, 0);
    }
    @media (max-width: 768px) { .bottom-nav { display: flex; justify-content: space-around; } }
    .bottom-nav__item {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 6px 12px; color: var(--text-tertiary); text-decoration: none;
      font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
      transition: color 0.2s; min-width: 56px; min-height: 44px; justify-content: center;
      border-radius: var(--radius);
    }
    .bottom-nav__item:hover { color: var(--text-primary); }
    .bottom-nav__item.active { color: var(--accent-gold); }
    .bottom-nav__item.active svg { filter: drop-shadow(0 0 4px var(--accent-gold-dim)); }
    @media (max-width: 480px) {
      .bottom-nav__item svg { width: 20px; height: 20px; }
      .bottom-nav__item { padding: 6px 8px; }
    }
  `],
})
export class BottomNavComponent {}
