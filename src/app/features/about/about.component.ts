import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="about container">
      <h1>About PD Gallery</h1>

      <div class="about__content">
        <section class="about__section">
          <h2>What is PD Gallery?</h2>
          <p>
            PD Gallery is a free, open-source progressive web app for exploring public domain art
            from the Art Institute of Chicago's collection. With over 130,000 artworks available,
            you can browse, search, and build your own personal collections of masterpieces spanning
            thousands of years of human creativity.
          </p>
        </section>

        <section class="about__section">
          <h2>Features</h2>
          <ul class="about__features">
            <li><strong>Browse &amp; Search</strong> — Explore artworks by department, keyword, or curated collection</li>
            <li><strong>High-Resolution Images</strong> — View detailed IIIF images with zoom capability</li>
            <li><strong>Personal Collection</strong> — Save favorites and create custom curations</li>
            <li><strong>Offline Access</strong> — Works offline with cached content as a PWA</li>
            <li><strong>Accessibility</strong> — Adjustable text size, high contrast, and reduced motion</li>
            <li><strong>Keyboard Navigation</strong> — Press <kbd>/</kbd> to search, <kbd>?</kbd> for shortcuts</li>
          </ul>
        </section>

        <section class="about__section">
          <h2>Data Source</h2>
          <p>
            All artwork data and images are sourced from the
            <a href="https://api.artic.edu/docs/" target="_blank" rel="noopener">Art Institute of Chicago's public API</a>.
            Images are served via the <a href="https://iiif.io" target="_blank" rel="noopener">IIIF standard</a>.
            All featured artworks are in the public domain.
          </p>
        </section>

        <section class="about__section">
          <h2>Technology</h2>
          <p>
            Built with Angular, TypeScript, and Bun. Part of the
            <a href="https://corvid-agent.github.io/" target="_blank" rel="noopener">corvid-agent ecosystem</a>.
          </p>
        </section>
      </div>

      <div class="about__cta">
        <a routerLink="/browse" class="btn-primary">Start Exploring</a>
      </div>
    </div>
  `,
  styles: [`
    .about { padding-top: var(--space-xl); padding-bottom: var(--space-2xl); max-width: 720px; }
    .about__content { display: flex; flex-direction: column; gap: var(--space-2xl); }
    .about__section h2 { margin-bottom: var(--space-sm); }
    .about__section p { color: var(--text-secondary); line-height: 1.7; margin: 0; }
    .about__features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-sm); }
    .about__features li {
      padding: var(--space-sm) 0; border-bottom: 1px solid var(--border);
      color: var(--text-primary); font-size: 0.95rem; line-height: 1.5;
    }
    .about__features li:last-child { border-bottom: none; }
    .about__features strong { color: var(--accent-gold); }
    .about__features kbd {
      background: var(--bg-raised); border: 1px solid var(--border-bright); border-radius: var(--radius-sm);
      padding: 1px 6px; font-size: 0.85rem; color: var(--accent-gold);
    }
    .about__cta { margin-top: var(--space-2xl); text-align: center; }
    .about__cta a { display: inline-flex; align-items: center; padding: var(--space-md) var(--space-2xl); text-decoration: none; border-radius: var(--radius-lg); }
  `],
})
export class AboutComponent {}
