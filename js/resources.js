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
    featuredSlugs: []
  };

  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load resources');
      return res.json();
    })
    .then((items) => {
      state.items = normaliseItems(items);
      state.items.sort(sortByDate);
      state.featuredSlugs = renderFeatured(state.items);
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
      clone.type = clone.type || 'internal';
      clone.cta = clone.cta && typeof clone.cta === 'object' ? clone.cta : {};
      clone.excerpt = clone.excerpt || clone.description || '';
      clone.source = clone.source || '';
      clone.readTime = clone.readTime || '';
      clone.isExternal = clone.type === 'external' || Boolean(clone.cta.external);
      clone.priority = typeof clone.priority === 'number' ? clone.priority : 0;
      clone.is_featured = Boolean(clone.is_featured || clone.featured);
      clone.featured = clone.is_featured;
      clone.url = buildItemUrl(clone, clone.isExternal);
      clone.ctaText = clone.cta.text || '';
      clone._searchBlob = [clone.title, clone.description, clone.excerpt, clone.tags.join(' '), clone.source]
        .join(' ')
        .toLowerCase();
      clone._dateValue = clone.date ? Date.parse(clone.date) || 0 : 0;
      if (!clone.url && !clone.isExternal) {
        clone.url = buildArticleUrl(clone.slug);
      }
      return clone;
    });
  }

  function sortByDate(a, b) {
    return (b._dateValue || 0) - (a._dateValue || 0);
  }

  function sortByFeaturedPriority(a, b) {
    const priorityDiff = (b.priority || 0) - (a.priority || 0);
    if (priorityDiff !== 0) return priorityDiff;
    return (b._dateValue || 0) - (a._dateValue || 0);
  }

  function handleSearch(event) {
    state.search = (event.target.value || '').trim().toLowerCase();
    state.page = 1;
    applyFilters();
  }

  function applyFilters() {
    const shouldShowFeatured = state.featuredSlugs.length > 0 && state.filter === 'All' && !state.search;
    toggleFeatured(shouldShowFeatured);

    state.filtered = state.items.filter((item) => {
      const matchesCategory = state.filter === 'All' || item.category === state.filter;
      const matchesSearch = !state.search || item._searchBlob.includes(state.search);
      return matchesCategory && matchesSearch;
    });
    renderGrid();
    updateLoadMore();
  }

  function renderFeatured(items) {
    if (!featuredSection) return [];
    const featuredSlot = featuredSection.querySelector('.container');
    if (!featuredSlot) return [];

    const featuredItems = items.filter((item) => item.is_featured);

    if (!featuredItems.length) {
      featuredSlot.innerHTML = '';
      featuredSection.classList.add('is-hidden');
      return [];
    }

    featuredItems.sort(sortByFeaturedPriority);

    featuredSection.classList.remove('is-hidden');
    featuredSection.classList.remove('is-collapsed');
    featuredSlot.innerHTML = '';

    const title = document.createElement('h2');
    title.id = 'featured-heading';
    title.className = 'res-featured-title';
    title.textContent = 'Featured';

    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'res-carousel-wrapper';

    const carousel = document.createElement('div');
    carousel.className = 'res-carousel';
    carousel.id = 'res-carousel';

    featuredItems.forEach((item) => {
      const card = buildCard(item, true);
      carousel.appendChild(card);
    });

    carouselWrapper.appendChild(carousel);
    featuredSlot.appendChild(title);
    featuredSlot.appendChild(carouselWrapper);

    // Initialize auto-scroll after a short delay
    setTimeout(() => initCarouselAutoScroll(carousel), 2000);

    return featuredItems.map((item) => item.slug);
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
    linkWrapper.href = item.url || '#';
    linkWrapper.setAttribute('aria-label', item.title);
    decorateLink(linkWrapper, item);

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = item.thumbnail;
    img.alt = item.title;
    linkWrapper.appendChild(img);

    if (item.isExternal) {
      const badge = document.createElement('span');
      badge.className = 'res-badge res-badge-external';
      badge.textContent = 'External Feature';
      linkWrapper.appendChild(badge);
    }

    const body = document.createElement('div');
    body.className = 'res-body';

    const tag = document.createElement('span');
    tag.className = 'res-tag';
    tag.textContent = item.category;

    const heading = document.createElement('h3');
    heading.className = 'res-card-title';

    const titleLink = document.createElement('a');
    titleLink.href = item.url || '#';
    titleLink.textContent = item.title;
    decorateLink(titleLink, item);
    heading.appendChild(titleLink);

    const excerpt = document.createElement('p');
    excerpt.className = 'res-excerpt';
    excerpt.textContent = item.excerpt || item.description;

    const meta = document.createElement('div');
    meta.className = 'res-meta';

    if (item.readTime) {
      const read = document.createElement('span');
      read.className = 'res-read';
      read.textContent = item.readTime;
      meta.appendChild(read);
    }

    const cta = document.createElement('a');
    cta.className = 'res-link';
    cta.href = item.url || '#';
    cta.textContent = getCtaCopy(item);
    decorateLink(cta, item);

    body.appendChild(tag);
    body.appendChild(heading);
    body.appendChild(excerpt);
    if (item.source) {
      const source = document.createElement('p');
      source.className = 'res-source';
      source.textContent = `Published on ${item.source}`;
      body.appendChild(source);
    }
    if (meta.childElementCount) {
      body.appendChild(meta);
    }
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
    if (state.featuredSlugs.length === 0) {
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

  function buildItemUrl(item, isExternal) {
    if (isExternal) {
      if (item.cta && item.cta.url) return item.cta.url;
      if (typeof item.url === 'string' && item.url.startsWith('http')) return item.url;
      if (item.externalUrl) return item.externalUrl;
      if (item.content && item.content.startsWith('http')) return item.content;
      return '';
    }
    if (typeof item.url === 'string' && item.url.startsWith('/')) return item.url;
    if (item.content && item.content.startsWith('http')) return item.content;
    return buildArticleUrl(item.slug);
  }

  function buildArticleUrl(slug) {
    return `/articles/${encodeURIComponent(slug)}/`;
  }

  function getCtaCopy(item) {
    if (item.ctaText) return item.ctaText;
    if (item.isExternal && item.source) return `Read on ${item.source} →`;
    if (item.isExternal) return 'Read External Article';
    if (item.category === 'Case Studies') return 'Read Case Study';
    if (item.category === 'Guides') return 'Read Guide';
    return 'Read Article';
  }

  function decorateLink(link, item) {
    if (!link) return;
    if (item && item.isExternal) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
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

  function initCarouselAutoScroll(carousel) {
    if (!carousel) return;

    let isUserInteracting = false;
    let isPageScrolling = false;
    let currentIndex = 0;
    let pageScrollTimeout;
    const pauseDuration = 5000; // Pause on each card for 5 seconds
    const cards = carousel.querySelectorAll('.res-card');

    if (cards.length <= 1) return; // No need to auto-scroll if only one card

    function scrollToCard(index) {
      if (isUserInteracting || isPageScrolling) return;

      const card = cards[index];
      if (!card) return;

      // Get the carousel's scroll position and card position
      const cardLeft = card.offsetLeft;

      // Scroll the carousel container directly instead of using scrollIntoView
      // This prevents the page itself from scrolling
      carousel.scrollTo({
        left: cardLeft,
        behavior: 'smooth'
      });
    }

    function autoAdvance() {
      if (isUserInteracting || isPageScrolling) return;

      currentIndex = (currentIndex + 1) % cards.length;
      scrollToCard(currentIndex);

      // Schedule next advance
      setTimeout(autoAdvance, pauseDuration);
    }

    // Pause auto-scroll when user interacts with carousel
    carousel.addEventListener('mouseenter', () => {
      isUserInteracting = true;
    });

    carousel.addEventListener('mouseleave', () => {
      isUserInteracting = false;
    });

    carousel.addEventListener('touchstart', () => {
      isUserInteracting = true;
    });

    let touchEndTimeout;
    carousel.addEventListener('touchend', () => {
      clearTimeout(touchEndTimeout);
      touchEndTimeout = setTimeout(() => {
        isUserInteracting = false;
      }, 1000);
    });

    // Pause auto-scroll when user scrolls the page
    function handlePageScroll() {
      isPageScrolling = true;
      clearTimeout(pageScrollTimeout);
      pageScrollTimeout = setTimeout(() => {
        isPageScrolling = false;
      }, 2000); // Resume auto-scroll 2 seconds after user stops scrolling
    }

    window.addEventListener('scroll', handlePageScroll, { passive: true });

    // Start auto-scroll after initial pause
    setTimeout(autoAdvance, pauseDuration);
  }
})();
