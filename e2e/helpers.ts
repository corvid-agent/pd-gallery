import { Page } from '@playwright/test';

const ARTWORK_MOCK = {
  id: 27992, title: 'A Sunday on La Grande Jatte', artist_display: 'Georges Seurat',
  date_display: '1884-1886', medium_display: 'Oil on canvas', image_id: 'test-id',
  is_public_domain: true, genre_titles: ['Landscape'], thumbnail: { alt_text: 'Test art' },
  description: '<p>Test description</p>', dimensions: '207.5 × 308.1 cm',
  credit_line: 'Helen Birch Bartlett Memorial Collection', department_title: 'Painting and Sculpture',
  artist_id: 12345, artist_title: 'Georges Seurat',
};

export async function mockArtAPI(page: Page) {
  // Block IIIF image requests to avoid timeouts
  await page.route('**/www.artic.edu/iiif/**', route =>
    route.fulfill({ status: 200, contentType: 'image/jpeg', body: Buffer.from('') })
  );

  await page.route('**/api.artic.edu/api/v1/agents/**', route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: { id: 12345, title: 'Georges Seurat', birth_date: 1859, death_date: 1891, description: 'Test artist' } }),
    })
  );

  // Single handler for all /artworks routes, dispatching based on URL
  await page.route('**/api.artic.edu/api/v1/artworks**', route => {
    const url = route.request().url();

    if (url.includes('/artworks/search')) {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          data: Array.from({ length: 12 }, (_, i) => ({ ...ARTWORK_MOCK, id: 27992 + i, title: `Artwork ${i + 1}` })),
          pagination: { total: 100, limit: 24, offset: 0, total_pages: 5, current_page: 1 },
        }),
      });
    }

    if (url.includes('/artworks?ids=')) {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          data: Array.from({ length: 12 }, (_, i) => ({ ...ARTWORK_MOCK, id: 27992 + i, title: `Featured ${i + 1}` })),
        }),
      });
    }

    // Individual artwork detail (e.g. /artworks/12345?fields=...)
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: ARTWORK_MOCK }),
    });
  });
}
