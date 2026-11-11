#!/usr/bin/env node
/**
 * Post-build prerender for SEO / social previews.
 *
 * CRA serves one index.html for every route, so crawlers and link-preview bots
 * (which don't run JS) see the homepage title/canonical on every URL. This script
 * runs after `react-scripts build` and writes per-route HTML files whose <head>
 * carries the correct title, description, canonical, OG/Twitter tags and JSON-LD,
 * plus a small crawlable content block inside #root (React's createRoot replaces it).
 *
 * - Reads public data only, from the v_school_profile view (hidden=false applied), with the anon key.
 * - Fail-soft: if env is missing or Supabase is unreachable, logs a warning, keeps the
 *   static sitemap, and exits 0 so deploys are never blocked.
 * - Only <head> tags are replaced; hashed bundle <script>/<link> tags stay intact.
 */
const fs = require('fs')
const path = require('path')

const SITE = 'https://the-locker-room.app'
const BUILD = path.join(__dirname, '..', 'build')
const PAGE_SIZE = 1000 // PostgREST default max-rows
const MAX_ROWS = 20000 // safety cap

const DEFAULT_TITLE = 'The Locker Room — Verified Athlete Reviews of College Sports Programs'

const STATIC_ROUTES = [
  { path: '/', title: DEFAULT_TITLE, description: null },
  {
    path: '/directory',
    title: 'College Athletic Programs Directory — The Locker Room',
    description: 'Browse 1,000+ college athletic programs by sport, gender, and state. Read verified, anonymous student-athlete reviews of coaching, facilities, culture, and equity.',
  },
  {
    path: '/explore',
    title: 'Explore Student-Athlete Reviews — The Locker Room',
    description: 'Read anonymous, .edu-verified reviews from college athletes about coaching, facilities, team culture, academic balance, support, and equity.',
  },
  {
    path: '/college-comparison',
    title: 'Compare College Athletic Programs — The Locker Room',
    description: 'Compare college athletic programs side by side on coaching, facilities, culture, balance, support, and equity using verified athlete reviews.',
  },
  { path: '/privacy', title: 'Privacy Policy — The Locker Room', description: 'How The Locker Room protects student-athlete anonymity and handles personal data.' },
  { path: '/terms', title: 'Terms of Service — The Locker Room', description: 'Terms of service for The Locker Room, the verified athlete-review platform.' },
]

// ── helpers ────────────────────────────────────────────────────────────────
const escHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// JSON safe for embedding in <script>: escape <, >, & and line separators
const jsonForScript = (obj) =>
  JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`, 'i')
  const tag = `<meta ${attr}="${key}" content="${escHtml(value)}"/>`
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `${tag}</head>`)
}

function renderPage(template, { url, title, description, image, jsonLd, body }) {
  let html = template
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escHtml(title)}</title>`)
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escHtml(url)}"/>`)
  if (description) {
    html = setMeta(html, 'name', 'description', description)
    html = setMeta(html, 'property', 'og:description', description)
    html = setMeta(html, 'name', 'twitter:description', description)
  }
  html = setMeta(html, 'property', 'og:title', title)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'name', 'twitter:title', title)
  if (image) {
    html = setMeta(html, 'property', 'og:image', image)
    html = setMeta(html, 'name', 'twitter:image', image)
  }
  if (jsonLd) {
    html = html.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
      `<script type="application/ld+json">${jsonForScript(jsonLd)}</script>`
    )
  }
  if (body) {
    html = html.replace(/<div id="root"><\/div>/, `<div id="root">${body}</div>`)
  }
  return html
}

function writeRoute(routePath, html) {
  const dir = path.join(BUILD, routePath)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
}

async function fetchSchools() {
  const base = process.env.REACT_APP_SUPABASE_URL
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY
  if (!base || !key) throw new Error('REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY not set')
  const cols = 'slug,institution_name,state_cd,classification_name,sanction_name,logo_url,programs'
  const rows = []
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const res = await fetch(`${base}/rest/v1/v_school_profile?select=${cols}&order=slug.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + PAGE_SIZE - 1}` },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok && res.status !== 206) throw new Error(`Supabase HTTP ${res.status}`)
    const page = await res.json()
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
  }
  return rows.filter((r) => r.slug && /^[a-z0-9-]+$/.test(r.slug) && r.institution_name)
}

function schoolPage(template, s) {
  const name = s.institution_name
  const url = `${SITE}/school/${s.slug}`
  const sports = Array.isArray(s.programs) ? [...new Set(s.programs.map((p) => p.sport).filter(Boolean))] : []
  const meta = [s.classification_name, s.state_cd].filter(Boolean).join(', ')
  const title = `${name} Athletics Reviews — The Locker Room`
  const description =
    `Anonymous, verified student-athlete reviews of ${name}${meta ? ` (${meta})` : ''} athletic programs: ` +
    `coaching, facilities, culture, balance, support, and equity${sports.length ? ` across ${sports.length} sports` : ''}.`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollegeOrUniversity',
        name,
        url,
        ...(s.logo_url ? { logo: s.logo_url } : {}),
        ...(s.state_cd ? { address: { '@type': 'PostalAddress', addressRegion: s.state_cd, addressCountry: 'US' } } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Programs', item: `${SITE}/directory` },
          { '@type': 'ListItem', position: 2, name, item: url },
        ],
      },
    ],
  }
  const body =
    `<main><h1>${escHtml(name)} Athletics Reviews</h1>` +
    `<p>${escHtml([s.classification_name, s.sanction_name, s.state_cd].filter(Boolean).join(' · '))}</p>` +
    (sports.length ? `<h2>Sports programs</h2><ul>${sports.map((x) => `<li>${escHtml(x)}</li>`).join('')}</ul>` : '') +
    `<p><a href="/directory">Browse all programs</a></p></main>`
  return renderPage(template, { url, title, description, jsonLd, body })
}

function sitemap(urls) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${escHtml(u)}</loc></url>`).join('\n') +
    '\n</urlset>\n'
  )
}

async function main() {
  const templatePath = path.join(BUILD, 'index.html')
  if (!fs.existsSync(templatePath)) {
    console.warn('[prerender] build/index.html not found; skipping.')
    return
  }
  const template = fs.readFileSync(templatePath, 'utf8')

  // Static routes (always written; no network needed)
  for (const r of STATIC_ROUTES) {
    if (r.path === '/') continue
    writeRoute(r.path, renderPage(template, { url: `${SITE}${r.path}`, title: r.title, description: r.description }))
  }
  // Homepage: canonical with trailing slash already set in public/index.html

  let schools
  try {
    schools = await fetchSchools()
  } catch (err) {
    console.warn(`[prerender] WARNING: could not fetch schools (${err.message}). Keeping static sitemap; school pages fall back to SPA.`)
    return
  }
  if (!schools.length) {
    console.warn('[prerender] WARNING: 0 schools returned. Keeping static sitemap.')
    return
  }

  for (const s of schools) writeRoute(`/school/${s.slug}`, schoolPage(template, s))

  const urls = [
    `${SITE}/`,
    ...STATIC_ROUTES.filter((r) => r.path !== '/').map((r) => `${SITE}${r.path}`),
    ...schools.map((s) => `${SITE}/school/${s.slug}`),
  ]
  fs.writeFileSync(path.join(BUILD, 'sitemap.xml'), sitemap(urls))
  console.log(`[prerender] wrote ${STATIC_ROUTES.length - 1} static + ${schools.length} school pages; sitemap ${urls.length} URLs.`)
}

main().catch((err) => {
  console.warn(`[prerender] WARNING: unexpected error (${err.message}). Continuing without prerender.`)
  process.exit(0)
})
