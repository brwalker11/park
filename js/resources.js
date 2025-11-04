(function () {
  const DATA_URL = '/data/resources.json';
  const DEFAULT_IMAGES = createFallbacks();
  const PAGE_SIZE = 9;

  const searchInput = document.getElementById('res-search');
  const filterButtons = Array.from(document.querySelectorAll('.res-chip'));
  const grid = document.getElementById('res-grid');
  const loadMoreBtn = document.getElementById('res-loadmore');
  const featuredSection = document.getElementById('res-featured');

  if (!grid) return;

  const state = {
    items: [],
    filtered: [],
    page: 1,
    filter: 'All',
    search: '',
    featuredSlug: ''
  };

  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load resources');
      return res.json();
    })
    .then((items) => {
      state.items = normaliseItems(items);
      state.items.sort(sortByDate);
      state.featuredSlug = renderFeatured(state.items);
      hydrateFilterFromQuery();
      updateActiveFilter();
      applyFilters();
    })
    .catch(() => {
      grid.innerHTML = '<p class="res-empty">Unable to load resources right now. Please try again shortly.</p>';
      if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
      }
    });

  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextFilter = btn.getAttribute('data-filter') || 'All';
      if (state.filter === nextFilter) return;
      state.filter = nextFilter;
      state.page = 1;
      updateActiveFilter();
      applyFilters();
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      state.page += 1;
      renderGrid();
      updateLoadMore();
    });
  }

  function normaliseItems(items) {
    return items.map((item) => {
      const clone = Object.assign({}, item);
      const category = clone.category && DEFAULT_IMAGES[clone.category] ? clone.category : 'Articles';
      clone.category = category;
      const image = normaliseImage(clone.thumbnail || clone.image, category);
      clone.thumbnail = image;
      clone.image = normaliseImage(clone.image, category);
      clone.category = category;
      clone.tags = Array.isArray(clone.tags) ? clone.tags : [];
      clone.excerpt = clone.excerpt || clone.description || '';
      clone._searchBlob = [clone.title, clone.description, clone.excerpt, clone.tags.join(' ')].join(' ').toLowerCase();
      clone._dateValue = clone.date ? Date.parse(clone.date) || 0 : 0;
      clone.url = buildArticleUrl(clone.slug);
      return clone;
    });
  }

  function sortByDate(a, b) {
    return (b._dateValue || 0) - (a._dateValue || 0);
  }

  function handleSearch(event) {
    state.search = (event.target.value || '').trim().toLowerCase();
    state.page = 1;
    applyFilters();
  }

  function applyFilters() {
    const shouldShowFeatured = Boolean(state.featuredSlug) && state.filter === 'All' && !state.search;
    toggleFeatured(shouldShowFeatured);

    state.filtered = state.items.filter((item) => {
      const matchesCategory = state.filter === 'All' || item.category === state.filter;
      const matchesSearch = !state.search || item._searchBlob.includes(state.search);
      const shouldExcludeFeatured = shouldShowFeatured && item.slug === state.featuredSlug;
      return matchesCategory && matchesSearch && !shouldExcludeFeatured;
    });
    renderGrid();
    updateLoadMore();
  }

  function renderFeatured(items) {
    if (!featuredSection) return '';
    const featuredSlot = featuredSection.querySelector('.container');
    if (!featuredSlot) return '';

    const featuredItem = items.find((item) => Boolean(item.featured));
    if (!featuredItem) {
      featuredSection.classList.add('is-hidden');
      return '';
    }

    featuredSection.classList.remove('is-hidden');
    featuredSection.classList.remove('is-collapsed');
    featuredSlot.innerHTML = '';
    const title = document.createElement('h2');
    title.id = 'featured-heading';
    title.className = 'res-featured-title';
    title.textContent = 'Featured';

    const card = buildCard(featuredItem, true);

    featuredSlot.appendChild(title);
    featuredSlot.appendChild(card);

    return featuredItem.slug;
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = '';

    const limit = state.page * PAGE_SIZE;
    const visible = state.filtered.slice(0, limit);

    if (!visible.length) {
      grid.innerHTML = '<p class="res-empty">No resources found. Adjust your filters or try a new search term.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    visible.forEach((item) => {
      fragment.appendChild(buildCard(item));
    });
    grid.appendChild(fragment);
  }

  function buildCard(item, isFeatured) {
    const article = document.createElement('article');
    article.className = 'res-card' + (isFeatured ? ' is-featured' : '');

    const linkWrapper = document.createElement('a');
    linkWrapper.className = 'res-thumb';
    linkWrapper.href = item.url;
    linkWrapper.setAttribute('aria-label', item.title);

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = item.thumbnail;
    img.alt = item.title;
    linkWrapper.appendChild(img);

    const body = document.createElement('div');
    body.className = 'res-body';

    const tag = document.createElement('span');
    tag.className = 'res-tag';
    tag.textContent = item.category;

    const heading = document.createElement('h3');
    heading.className = 'res-card-title';

    const titleLink = document.createElement('a');
    titleLink.href = item.url;
    titleLink.textContent = item.title;
    heading.appendChild(titleLink);

    const excerpt = document.createElement('p');
    excerpt.className = 'res-excerpt';
    excerpt.textContent = item.excerpt || item.description;

    const meta = document.createElement('div');
    meta.className = 'res-meta';

    const read = document.createElement('span');
    read.className = 'res-read';
    read.textContent = item.readTime;
    meta.appendChild(read);

    const cta = document.createElement('a');
    cta.className = 'res-link';
    cta.href = item.url;
    const ctaCopy = item.category === 'Case Studies' ? 'Read Case Study' : item.category === 'Guides' ? 'Read Guide' : 'Read Article';
    cta.textContent = ctaCopy;

    body.appendChild(tag);
    body.appendChild(heading);
    body.appendChild(excerpt);
    body.appendChild(meta);
    body.appendChild(cta);

    article.appendChild(linkWrapper);
    article.appendChild(body);

    return article;
  }

  function updateLoadMore() {
    if (!loadMoreBtn) return;
    const hasMore = state.filtered.length > state.page * PAGE_SIZE;
    loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
  }

  function updateActiveFilter() {
    filterButtons.forEach((btn) => {
      if ((btn.getAttribute('data-filter') || 'All') === state.filter) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      }
    });
  }

  function toggleFeatured(shouldShow) {
    if (!featuredSection) return;
    if (!state.featuredSlug) {
      featuredSection.classList.add('is-hidden');
      return;
    }
    featuredSection.classList.toggle('is-collapsed', !shouldShow);
  }

  function createFallbacks() {
    const entries = [
      ['Case Studies', '#273d9a', 'Case Study'],
      ['Guides', '#0a7c6b', 'Guide'],
      ['Articles', '#3b3a3f', 'Article']
    ];

    return entries.reduce((acc, [key, color, label]) => {
      const gradientId = `grad-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="${label}">` +
        `<defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color}" stop-opacity="0.95"/><stop offset="100%" stop-color="${color}" stop-opacity="0.7"/></linearGradient></defs>` +
        `<rect width="1200" height="800" fill="url(#${gradientId})"/>` +
        `<text x="50%" y="52%" fill="white" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="96" text-anchor="middle">${label}</text>` +
        `<text x="50%" y="64%" fill="white" fill-opacity="0.7" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-size="36" text-anchor="middle">Monetize Parking</text>` +
        `</svg>`;
      acc[key] = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
      return acc;
    }, {});
  }

  function normaliseImage(path, category) {
    if (path && path.startsWith('/images/')) return path;
    if (path && path.startsWith('http')) return path;
    if (path) return `/images/${path.replace(/^\/+/, '')}`;
    return DEFAULT_IMAGES[category] || DEFAULT_IMAGES.Articles;
  }

  function buildArticleUrl(slug) {
    return `/articles/${encodeURIComponent(slug)}/`;
  }

  function hydrateFilterFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (!category) return;
    const match = filterButtons.find((btn) => (btn.getAttribute('data-filter') || '').toLowerCase() === category.toLowerCase());
    if (match) {
      state.filter = match.getAttribute('data-filter') || 'All';
    }
  }
})();
