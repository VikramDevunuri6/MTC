/* ============================================================
   Blog static-site generator — Spaces by MTC
   Reads blog/blog-data.json (single source of truth) and emits:
     blog/index.html              -> clean URL /blog/
     blog/<slug>/index.html       -> clean URL /blog/<slug>/
   Each detail page is fully baked (content + SEO + JSON-LD) so
   it is crawlable and fast, while blogs stay data-driven:
   edit the JSON, re-run `node tools/build-blog.js`.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'blog', 'blog-data.json'), 'utf8'));
const SITE = DATA.site;
const POSTS = DATA.posts.slice().sort((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return (b.publishDate || '').localeCompare(a.publishDate || '');
});

/* ---------- helpers ---------- */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const slugify = (s) => String(s).toLowerCase().trim()
  .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
const fmtDate = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};
const abs = (p) => (/^https?:/.test(p) ? p : SITE.baseUrl + p);

/* ---------- shared chrome (nav, drawer, footer) ---------- */
function head(opts) {
  // opts: { title, description, canonical, ogImage, ogType, jsonld[], keywords }
  const jsonld = (opts.jsonld || []).map((o) =>
    `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.description)}">
${opts.keywords ? `<meta name="keywords" content="${esc(opts.keywords)}">` : ''}
<link rel="canonical" href="${esc(opts.canonical)}">
<meta property="og:type" content="${opts.ogType || 'website'}">
<meta property="og:site_name" content="Spaces by MTC">
<meta property="og:title" content="${esc(opts.title)}">
<meta property="og:description" content="${esc(opts.description)}">
<meta property="og:url" content="${esc(opts.canonical)}">
<meta property="og:image" content="${esc(abs(opts.ogImage))}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(opts.title)}">
<meta name="twitter:description" content="${esc(opts.description)}">
<meta name="twitter:image" content="${esc(abs(opts.ogImage))}">
<link rel="icon" type="image/png" href="/images/MTClogo/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/responsive.css">
<link rel="stylesheet" href="/css/blog.css">
${jsonld}
</head>
<body class="blog-page">`;
}

const NAV = `
<!-- MOBILE NAV DRAWER -->
<div class="mobile-nav-drawer" id="mobileNavDrawer">
  <button class="mobile-nav-close" id="mobileNavClose" aria-label="Close menu">&#10005;</button>
  <a href="/index.html#projects" class="mobile-nav-link">Projects</a>
  <a href="/index.html#services" class="mobile-nav-link">Services</a>
  <a href="/index.html#factory" class="mobile-nav-link">Process</a>
  <a href="/index.html#experience" class="mobile-nav-link">Experience Center</a>
  <a href="/index.html#leadership" class="mobile-nav-link">About</a>
  <a href="/blog/" class="mobile-nav-link active">Blog</a>
  <a href="/client-expectation.html" class="mobile-nav-link">Client Form</a>
  <a href="/index.html#booking" class="mobile-nav-cta mobile-nav-link">Book Consultation</a>
</div>
<!-- NAVIGATION -->
<nav id="nav">
  <a href="/" class="nav-logo"><img src="/images/MTClogo/Artboard 1 (1).png" alt="MTC Spaces Logo"></a>
  <ul class="nav-links">
    <li><a href="/index.html#projects">Projects</a></li>
    <li><a href="/index.html#services">Services</a></li>
    <li><a href="/index.html#factory">Process</a></li>
    <li><a href="/index.html#experience">Experience Center</a></li>
    <li><a href="/index.html#leadership">About</a></li>
    <li><a href="/blog/" class="active">Blog</a></li>
    <li><a href="/client-expectation.html">Client Form</a></li>
  </ul>
  <a href="/index.html#booking" class="nav-cta">Book Consultation</a>
  <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">
    <span class="toggle-bar"></span><span class="toggle-bar"></span>
  </button>
</nav>`;

const FOOTER = `
<!-- FOOTER -->
<footer>
  <section id="footer-premium">
    <div class="footer-container">
      <div class="footer-column">
        <h4>Explore</h4>
        <div class="footer-links-grid">
          <a href="/index.html#projects">Projects</a>
          <a href="/index.html#services">Services</a>
          <a href="/index.html#factory">Process</a>
          <a href="/index.html#experience">Experience Center</a>
          <a href="/index.html#leadership">About</a>
          <a href="/blog/">Blog</a>
          <a href="/client-expectation.html">Client Form</a>
          <a href="/index.html#booking">Book Consultation</a>
        </div>
      </div>
      <div class="footer-column">
        <h4>Locations</h4>
        <div class="footer-links-grid">
          <a href="https://www.google.com/search?q=One+Golden+Mile+Kokapet" target="_blank" rel="noopener">Experience Center</a>
          <a href="https://www.google.com/search?q=MTC+Bespoke+Furniture" target="_blank" rel="noopener">Factory Address</a>
        </div>
      </div>
      <div class="footer-column">
        <h4>Join Our Community</h4>
        <div class="footer-social">
          <a href="https://www.instagram.com/spacesbymtc" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="https://in.pinterest.com/leadgenspaces/_pins/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><i class="fa-brands fa-pinterest-p"></i></a>
          <a href="https://youtube.com/@spacesbymtc-c5b" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          <a href="https://www.facebook.com/profile.php?id=61572797996431&rdid=3EgUEQSTM7LBRROV&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1L4Fu4kMkK%2F#" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="https://www.linkedin.com/company/spacesbymtc/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
          <a href="https://x.com/SpacesByMTC" target="_blank" rel="noopener noreferrer" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
        </div>
        <div class="footer-contact">
          <p><i class="fa-solid fa-envelope"></i> <a href="mailto:admin@mtcspaces.com">admin@mtcspaces.com</a></p>
          <p><i class="fa-solid fa-globe"></i> <a href="https://www.mtcspaces.com" target="_blank" rel="noopener">www.mtcspaces.com</a></p>
          <p><i class="fa-solid fa-phone"></i> <a href="tel:09063275385">09063275385</a></p>
          <p><i class="fa-solid fa-location-dot"></i> 1st Floor, One Golden Mile Rd,<br>Kokapet, Hyderabad,<br>Telangana 500075</p>
        </div>
      </div>
      <span>&copy; 2026 MTC Spaces. All Rights Reserved.</span>
    </div>
  </section>
</footer>
<script src="/js/main.js"></script>`;

/* ---------- content blocks -> HTML + TOC ---------- */
function renderBlocks(blocks) {
  const toc = [];
  const html = blocks.map((b) => {
    switch (b.type) {
      case 'h2': {
        const id = slugify(b.text);
        toc.push({ id, text: b.text });
        return `<h2 id="${id}">${esc(b.text)}</h2>`;
      }
      case 'h3': return `<h3>${esc(b.text)}</h3>`;
      case 'p': return `<p>${esc(b.text)}</p>`;
      case 'ul': return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
      case 'ol': return `<ol>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>`;
      case 'quote':
        return `<blockquote>${esc(b.text)}${b.cite ? `<cite>${esc(b.cite)}</cite>` : ''}</blockquote>`;
      case 'highlight':
        return `<div class="highlight-box">${b.title ? `<h4>${esc(b.title)}</h4>` : ''}<p>${esc(b.text)}</p></div>`;
      case 'image':
        return `<figure><img src="${esc(b.src)}" alt="${esc(b.alt || '')}" loading="lazy" decoding="async">${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
      case 'table': {
        const thead = `<thead><tr>${b.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
        return `<div class="article-table-wrap"><table>${thead}${tbody}</table></div>`;
      }
      default: return '';
    }
  }).join('\n');
  return { html, toc };
}

/* ---------- card (used in related) ---------- */
function cardHTML(post, hrefPrefix) {
  return `<a class="blog-card" href="${hrefPrefix}${esc(post.slug)}/">
  <div class="blog-card__media">
    <img src="${esc(post.coverImage || post.heroImage)}" alt="${esc(post.title)}" loading="lazy" decoding="async">
    <span class="blog-card__cat">${esc(post.category)}</span>
  </div>
  <div class="blog-card__body">
    <div class="blog-card__meta"><span>${esc(fmtDate(post.publishDate))}</span><span class="dot"></span><span>${esc(post.readTime || '')}</span></div>
    <h3 class="blog-card__title">${esc(post.title)}</h3>
    <p class="blog-card__excerpt">${esc(post.excerpt)}</p>
    <span class="blog-card__more">Read More &rarr;</span>
  </div>
</a>`;
}

/* ---------- CTA ---------- */
const CTA = `
<section class="blog-cta">
  <div class="blog-cta__inner">
    <div class="blog-label on-dark center">Spaces by MTC</div>
    <h2 class="blog-cta__title">Let's design a space that <em>feels like you</em></h2>
    <p class="blog-cta__text">Book a free design consultation and see your home in 3D before a single nail is hammered &mdash; backed by an in-house factory and a 12-year workmanship warranty.</p>
    <div class="blog-cta__actions">
      <a href="/index.html#booking" class="btn-primary">Book Consultation</a>
      <a href="/client-expectation.html" class="btn-primary" style="background:transparent;color:var(--ivory);border:1px solid rgba(247,242,234,0.4);">Contact Spaces by MTC</a>
    </div>
  </div>
</section>`;

/* ============================================================
   LANDING PAGE  ->  blog/index.html
   ============================================================ */
function buildLanding() {
  const canonical = SITE.baseUrl + '/blog/';
  const jsonld = [{
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: SITE.blogTitle + ' — ' + SITE.name,
    description: SITE.blogSubtitle,
    url: canonical,
    publisher: {
      '@type': 'Organization', name: SITE.name,
      logo: { '@type': 'ImageObject', url: abs('/images/MTClogo/Artboard 1 (1).png') }
    },
    blogPost: POSTS.map((p) => ({
      '@type': 'BlogPosting', headline: p.title,
      url: SITE.baseUrl + '/blog/' + p.slug + '/',
      datePublished: p.publishDate, image: abs(p.coverImage || p.heroImage)
    }))
  }];

  const html = head({
    title: SITE.blogTitle + ' | ' + SITE.name,
    description: SITE.blogSubtitle,
    canonical, ogImage: SITE.blogHeroImage, ogType: 'website', jsonld
  }) + NAV + `
<main class="blog-main">
  <header class="blog-hero">
    <img class="blog-hero__bg" src="${esc(SITE.blogHeroImage)}" alt="Spaces by MTC interiors" fetchpriority="high">
    <div class="blog-hero__overlay"></div>
    <div class="blog-hero__inner">
      <div class="blog-label on-dark">${esc(SITE.name)} &middot; Journal</div>
      <h1 class="blog-hero__title">${esc(SITE.blogTitle)}</h1>
      <p class="blog-hero__sub">${esc(SITE.blogSubtitle)}</p>
    </div>
  </header>

  <section class="blog-section">
    <div class="blog-shell">
      <div class="blog-grid" id="blogGrid"></div>
      <div class="blog-pagination" id="blogPagination" role="navigation" aria-label="Blog pagination"></div>
    </div>
  </section>
</main>` + FOOTER + `
<script src="/js/blog.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(ROOT, 'blog', 'index.html'), html);
  console.log('  wrote blog/index.html');
}

/* ============================================================
   DETAIL PAGE  ->  blog/<slug>/index.html
   ============================================================ */
function buildPost(post) {
  const canonical = SITE.baseUrl + '/blog/' + post.slug + '/';
  const { html: bodyHTML, toc } = renderBlocks(post.content);

  const related = POSTS.filter((p) => p.slug !== post.slug && (p.categories || [p.category])
    .some((c) => (post.categories || [post.category]).indexOf(c) !== -1));
  const relatedList = (related.length ? related : POSTS.filter((p) => p.slug !== post.slug)).slice(0, 3);

  const tocHTML = toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('');

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      headline: post.title,
      description: post.seoDescription || post.excerpt,
      image: [abs(post.coverImage || post.heroImage)],
      datePublished: post.publishDate,
      dateModified: post.publishDate,
      keywords: (post.keywords || []).join(', '),
      articleSection: post.category,
      author: { '@type': 'Organization', name: post.author || SITE.name, url: SITE.baseUrl },
      publisher: {
        '@type': 'Organization', name: SITE.name,
        logo: { '@type': 'ImageObject', url: abs('/images/MTClogo/Artboard 1 (1).png') }
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl + '/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE.baseUrl + '/blog/' },
        { '@type': 'ListItem', position: 3, name: post.title, item: canonical }
      ]
    }
  ];

  const html = head({
    title: post.seoTitle || (post.title + ' | ' + SITE.name),
    description: post.seoDescription || post.excerpt,
    canonical, ogImage: post.coverImage || post.heroImage, ogType: 'article',
    keywords: (post.keywords || []).join(', '), jsonld
  }) + NAV + `
<main class="blog-main">
  <header class="blog-hero">
    <img class="blog-hero__bg" src="${esc(post.heroImage || post.coverImage)}" alt="${esc(post.title)}" fetchpriority="high">
    <div class="blog-hero__overlay"></div>
    <div class="blog-hero__inner">
      <div class="blog-label on-dark">${esc(post.category)}</div>
      <h1 class="blog-hero__title">${esc(post.title)}</h1>
      <p class="blog-hero__sub">${esc(fmtDate(post.publishDate))} &nbsp;&middot;&nbsp; ${esc(post.readTime || '')} &nbsp;&middot;&nbsp; ${esc(post.author || SITE.name)}</p>
    </div>
  </header>

  <div class="blog-article">
    <div class="blog-article__main">
      <div class="article-breadcrumb" role="navigation" aria-label="Breadcrumb">
        <a href="/">Home</a><span class="sep">/</span><a href="/blog/">Blog</a><span class="sep">/</span>${esc(post.category)}
      </div>
      <details class="toc-mobile">
        <summary>On this page</summary>
        <ul>${tocHTML}</ul>
      </details>
      <div class="article-body">
${bodyHTML}
      </div>
    </div>
    <aside class="article-aside">
      <div class="toc-desktop" role="navigation" aria-label="Table of contents">
        <h4>On this page</h4>
        <ul>${tocHTML}</ul>
      </div>
    </aside>
  </div>

  <section class="blog-related">
    <div class="blog-related__head">
      <div class="blog-label">Keep reading</div>
      <h2 class="blog-related__title">Related articles</h2>
    </div>
    <div class="blog-grid">
      ${relatedList.map((p) => cardHTML(p, '/blog/')).join('\n      ')}
    </div>
  </section>
${CTA}
</main>` + FOOTER + `
<script>
/* TOC scrollspy + smooth anchor offset for fixed nav */
(function(){
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc-desktop a'));
  var heads = links.map(function(a){ return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  if(!heads.length) return;
  function onScroll(){
    var y = window.scrollY + 140, active = heads[0];
    heads.forEach(function(h){ if(h.offsetTop <= y) active = h; });
    links.forEach(function(a){ a.classList.toggle('is-active', a.getAttribute('href') === '#' + active.id); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
</script>
</body>
</html>`;

  const dir = path.join(ROOT, 'blog', post.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('  wrote blog/' + post.slug + '/index.html');
}

/* ---------- run ---------- */
console.log('Building blog (' + POSTS.length + ' posts)...');
buildLanding();
POSTS.forEach(buildPost);
console.log('Done.');
