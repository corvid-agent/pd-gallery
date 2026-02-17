# PD Gallery

Explore over 130,000 public domain artworks from the Art Institute of Chicago. Browse masterpieces, build personal collections, and discover art across departments — all in a beautiful gallery-themed interface.

**Live:** [corvid-agent.github.io/pd-gallery](https://corvid-agent.github.io/pd-gallery/)

## Features

- **Browse & Search** — Search by title, artist, or keyword. Filter by department, sort by relevance, title, or date. Paginated results.
- **Artwork Detail** — High-resolution IIIF images, artist info, medium, dimensions, provenance, department, classification, credit line, and gallery location.
- **My Collection** — Favorites, recently viewed history, and custom curations with create/delete.
- **Featured Works** — Curated selection of iconic artworks on the home page.
- **Browse by Department** — Painting, Photography, Prints, Asian Art, Textiles, and more.
- **Curated Collections** — Impressionism, Ancient Egypt, Japanese Prints, Modern Abstract, Renaissance Masters.
- **Artist Pages** — Artist biography, dates, and full artwork catalog.
- **Accessibility** — Four font sizes, high contrast, reduced motion, wide spacing, keyboard navigation, screen reader support.
- **Themes** — Dark (default), warm (old gallery walls), and light (gallery white) with system preference detection.
- **Keyboard Shortcuts** — `/` to search, `?` for help, `Esc` to dismiss, arrow keys for grid navigation.
- **PWA** — Installable with offline fallback, API response caching, and IIIF image caching.

## Tech Stack

- **Framework:** Angular 21 (standalone components, signals, OnPush, lazy routes)
- **Styling:** CSS custom properties, gallery aesthetic (gold accents, Playfair Display headings)
- **Data:** [Art Institute of Chicago API](https://api.artic.edu/docs/) — no auth required, CORS enabled
- **Images:** IIIF (International Image Interoperability Framework)
- **Testing:** Vitest (129 tests)
- **Package Manager:** Bun
- **Deploy:** GitHub Pages via GitHub Actions

## Getting Started

```bash
bun install
bun run start
```

Open http://localhost:4200.

## Development

```bash
bun run start       # Dev server with hot reload
bun run test        # Unit tests (Vitest)
bun run build       # Production build → dist/pd-gallery
```

## Project Structure

```
src/
  app/
    core/          — Models, services (catalog, collection, theme, a11y), interceptors
    features/      — Route components (home, browse, artwork, collection, artist,
                     department, about, not-found)
    shared/        — Reusable components (artwork-card, artwork-grid, scroll-row,
                     skeleton-grid), directives (lazy-image, keyboard-nav, reveal),
                     pipes (truncate)
  styles.css       — Global styles, CSS variables, themes, responsive breakpoints
```

## Ecosystem

Part of the [corvid-agent](https://github.com/corvid-agent) ecosystem:

- [BW Cinema](https://corvid-agent.github.io/bw-cinema/) — Classic black & white film catalog
- [PD Audiobooks](https://corvid-agent.github.io/pd-audiobooks/) — Public domain audiobooks from LibriVox
- [Weather Dashboard](https://corvid-agent.github.io/weather-dashboard/) — Weather, air quality, and astronomy
- [Space Dashboard](https://corvid-agent.github.io/space-dashboard/) — NASA data, ISS tracker, Mars rovers

## License

MIT

All artwork data and images courtesy of the [Art Institute of Chicago](https://www.artic.edu/) via their public API. Images are public domain.
