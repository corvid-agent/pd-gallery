import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer" role="contentinfo">
      <div class="footer__inner container">
        <div class="footer__top">
          <span class="footer__brand">PD Gallery</span>
          <span class="footer__sep" aria-hidden="true">&mdash;</span>
          <span class="footer__tagline">Exploring masterpieces of world art</span>
        </div>
        <nav class="footer__nav" aria-label="Footer navigation">
          <div class="footer__nav-col">
            <h4 class="footer__nav-heading">Discover</h4>
            <a routerLink="/browse">Browse Artworks</a>
            <a routerLink="/department/Painting and Sculpture of Europe">Paintings</a>
            <a routerLink="/department/Photography and Media">Photography</a>
          </div>
          <div class="footer__nav-col">
            <h4 class="footer__nav-heading">Library</h4>
            <a routerLink="/collection">My Collection</a>
            <a routerLink="/about">About</a>
          </div>
          <div class="footer__nav-col footer__ecosystem">
            <h4 class="footer__nav-heading">Ecosystem</h4>
            <a href="https://corvid-agent.github.io/" target="_blank" rel="noopener">Home<span class="sr-only"> (opens in new tab)</span></a>
            <a href="https://corvid-agent.github.io/bw-cinema/" target="_blank" rel="noopener">BW Cinema<span class="sr-only"> (opens in new tab)</span></a>
            <a href="https://corvid-agent.github.io/pd-audiobooks/" target="_blank" rel="noopener">Audiobooks<span class="sr-only"> (opens in new tab)</span></a>
            <a href="https://corvid-agent.github.io/weather-dashboard/" target="_blank" rel="noopener">Weather<span class="sr-only"> (opens in new tab)</span></a>
            <a href="https://corvid-agent.github.io/space-dashboard/" target="_blank" rel="noopener">Space<span class="sr-only"> (opens in new tab)</span></a>
          </div>
        </nav>
        <div class="footer__departments">
          <h4 class="footer__nav-heading">Browse by Department</h4>
          <div class="footer__dept-links">
            @for (d of departments; track d) {
              <a class="footer__dept-link" [routerLink]="['/department', d]">{{ d }}</a>
            }
          </div>
        </div>
        <p class="footer__credits">
          Artwork data and images from the
          <a href="https://www.artic.edu" target="_blank" rel="noopener">Art Institute of Chicago<span class="sr-only"> (opens in new tab)</span></a>
          via their
          <a href="https://api.artic.edu/docs/" target="_blank" rel="noopener">public API<span class="sr-only"> (opens in new tab)</span></a>.
          All featured artworks are in the public domain.
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .footer { border-top: 1px solid var(--border); padding: var(--space-xl) 0; margin-top: var(--space-3xl); }
    .footer__inner { text-align: center; }
    .footer__top { display: flex; align-items: center; justify-content: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
    .footer__brand { font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .footer__sep { color: var(--text-tertiary); }
    .footer__tagline { color: var(--text-secondary); font-size: 0.9rem; }
    .footer__nav {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg);
      max-width: 480px; margin: 0 auto var(--space-xl); text-align: left;
    }
    .footer__nav-heading { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-tertiary); font-weight: 600; margin: 0 0 var(--space-sm); }
    .footer__nav-col { display: flex; flex-direction: column; gap: var(--space-xs); }
    .footer__nav-col a { font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
    .footer__nav-col a:hover { color: var(--accent-gold); }
    .footer__departments { max-width: 600px; margin: 0 auto var(--space-xl); text-align: center; }
    .footer__departments .footer__nav-heading { margin-bottom: var(--space-md); }
    .footer__dept-links { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-xs); }
    .footer__dept-link {
      font-size: 0.8rem; padding: 4px 12px; border: 1px solid var(--border); border-radius: 14px;
      color: var(--text-tertiary); text-decoration: none; transition: all 0.2s;
    }
    .footer__dept-link:hover { border-color: var(--accent-gold); color: var(--accent-gold); background-color: var(--accent-gold-dim); }
    .footer__credits { color: var(--text-tertiary); font-size: 0.85rem; margin: 0; }
    .footer__credits a { color: var(--text-secondary); }
    .footer__credits a:hover { color: var(--accent-gold); }
    @media (max-width: 768px) { .footer { padding-bottom: 100px; } }
    @media (max-width: 480px) { .footer__nav { grid-template-columns: 1fr; gap: var(--space-md); } }
  `],
})
export class FooterComponent {
  readonly departments = [
    'Painting and Sculpture of Europe',
    'Photography and Media',
    'Prints and Drawings',
    'Arts of the Americas',
    'Asian Art',
    'Textiles',
  ];
}
