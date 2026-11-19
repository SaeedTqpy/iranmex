import {publishedNews} from '../../lib/news.mjs';
import {listCompanies} from '../../lib/server/company-store.mjs';
import {getMountainTalks} from '../../lib/server/mountain-talk-store.mjs';

export const dynamic = 'force-dynamic';

const origin = 'https://imexexpo.ir';
const pages = ['/', '/about', '/events', '/exhibitors', '/visitors', '/contact',
  '/exhibition', '/news', '/registration', '/registration/booth',
  '/en', '/en/about', '/en/exhibition', '/en/news', '/en/registration/booth',
  '/ar', '/ar/about', '/ar/exhibition', '/ar/news', '/ar/registration/booth'];

export function GET() {
  const paths = [...pages,
    ...publishedNews().map(({slug}) => `/news/${encodeURIComponent(slug)}`),
    ...listCompanies().map(({slug}) => `/exhibition/${encodeURIComponent(slug)}`),
    ...getMountainTalks().items.map(({id}) => `/mountain-talk/${encodeURIComponent(id)}`),
  ];
  const entries = [...new Set(paths)].map(path => `<url><loc>${origin}${path}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
    headers: {'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=300'},
  });
}
