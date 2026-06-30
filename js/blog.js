/* ============================================================
   BLOG landing — Spaces by MTC
   Reads blog-data.json (single source of truth) and renders the
   card grid and pagination (Prev / 1 2 3 ... / Next).
   ============================================================ */
(function () {
  'use strict';

  var PAGE_SIZE = 6;
  var state = { posts: [], page: 1 };

  var els = {
    grid: document.getElementById('blogGrid'),
    pagination: document.getElementById('blogPagination')
  };

  if (!els.grid) return;

  function fmtDate(iso) {
    try {
      return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch (e) { return iso; }
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cardHTML(post) {
    var meta = '<span>' + esc(fmtDate(post.publishDate)) + '</span>' +
      '<span class="dot"></span><span>' + esc(post.readTime || '') + '</span>';
    return '' +
      '<a class="blog-card" href="' + esc(post.slug) + '/">' +
      '  <div class="blog-card__media">' +
      '    <img src="' + esc(post.coverImage || post.heroImage) + '" alt="' + esc(post.title) + '" loading="lazy" decoding="async">' +
      '    <span class="blog-card__cat">' + esc(post.category) + '</span>' +
      '  </div>' +
      '  <div class="blog-card__body">' +
      '    <div class="blog-card__meta">' + meta + '</div>' +
      '    <h3 class="blog-card__title">' + esc(post.title) + '</h3>' +
      '    <p class="blog-card__excerpt">' + esc(post.excerpt) + '</p>' +
      '    <span class="blog-card__more">Read More &rarr;</span>' +
      '  </div>' +
      '</a>';
  }

  function renderGrid() {
    if (!state.posts.length) {
      els.grid.innerHTML = '<p class="blog-empty">No articles published yet. Please check back soon.</p>';
      return;
    }
    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = state.posts.slice(start, start + PAGE_SIZE);
    els.grid.innerHTML = pageItems.map(cardHTML).join('');
  }

  function pageList(current, total) {
    var out = [];
    if (total <= 7) {
      for (var i = 1; i <= total; i++) out.push(i);
      return out;
    }
    out.push(1);
    if (current > 3) out.push('…');
    var s = Math.max(2, current - 1), e = Math.min(total - 1, current + 1);
    for (var j = s; j <= e; j++) out.push(j);
    if (current < total - 2) out.push('…');
    out.push(total);
    return out;
  }

  function renderPagination() {
    if (!els.pagination) return;
    var total = Math.max(1, Math.ceil(state.posts.length / PAGE_SIZE));
    if (total <= 1) { els.pagination.innerHTML = ''; return; }
    var html = '';
    html += '<button class="blog-page-btn" data-rel="prev"' + (state.page === 1 ? ' disabled' : '') + '>Prev</button>';
    pageList(state.page, total).forEach(function (p) {
      if (p === '…') { html += '<span class="blog-page-ellipsis">…</span>'; return; }
      html += '<button class="blog-page-btn' + (p === state.page ? ' is-active' : '') + '" data-page="' + p + '">' + p + '</button>';
    });
    html += '<button class="blog-page-btn" data-rel="next"' + (state.page === total ? ' disabled' : '') + '>Next</button>';
    els.pagination.innerHTML = html;
  }

  function bind() {
    if (!els.pagination) return;
    els.pagination.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      var total = Math.max(1, Math.ceil(state.posts.length / PAGE_SIZE));
      if (btn.dataset.rel === 'prev') state.page = Math.max(1, state.page - 1);
      else if (btn.dataset.rel === 'next') state.page = Math.min(total, state.page + 1);
      else if (btn.dataset.page) state.page = parseInt(btn.dataset.page, 10);
      renderGrid();
      renderPagination();
      var top = document.querySelector('.blog-section');
      if (top) window.scrollTo({ top: top.offsetTop - 80, behavior: 'smooth' });
    });
  }

  function sortPosts(posts) {
    return posts.slice().sort(function (a, b) {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (b.publishDate || '').localeCompare(a.publishDate || '');
    });
  }

  fetch('blog-data.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      state.posts = sortPosts(data.posts || []);
      bind();
      renderGrid();
      renderPagination();
    })
    .catch(function (err) {
      els.grid.innerHTML = '<p class="blog-empty">Unable to load articles right now. Please refresh the page.</p>';
      console.error('Blog data failed to load:', err);
    });
})();
