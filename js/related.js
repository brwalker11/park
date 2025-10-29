(function () {
  const DATA_URL = '/park/data/resources.json';
  const DEFAULT_IMAGES = createFallbacks();
  const MIN_RESULTS = 3;
  const MAX_RESULTS = 5;

  const container = document.getElementById('related-list');
  const articleEl = document.querySelector('[data-resource-slug]');

  if (!container || !articleEl) return;

  const currentSlug = articleEl.getAttribute('data-resource-slug') || '';
  const currentCategory = articleEl.getAttribute('data-resource-category') || '';
  const tagsRaw = articleEl.getAttribute('data-resource-tags') || '';
  const currentTags = tagsRaw
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch related resources');
      return res.json();
    })
    .then((items) => {
      const normalized = items.map(normaliseItem);
      const related = pickRelated(normalized);
      renderRelated(related);
    })
    .catch(() => {
      container.innerHTML = '<p class="related-empty">We couldn\'t load related resources right now.</p>';
    });

  function normaliseItem(item) {
    const clone = Object.assign({}, item);
    const category = clone.category && DEFAULT_IMAGES[clone.category] ? clone.category : 'Articles';
    clone.category = category;
    clone.image = clone.image || DEFAULT_IMAGES[category];
    clone.tags = Array.isArray(clone.tags) ? clone.tags.map((tag) => tag.toLowerCase()) : [];
    clone._dateValue = clone.date ? Date.parse(clone.date) || 0 : 0;
    return clone;
  }

  function pickRelated(items) {
    const candidates = items
      .filter((item) => item.slug !== currentSlug)
      .map((item) => {
        const sharedTags = currentTags.length
          ? item.tags.filter((tag) => currentTags.includes(tag)).length
          : 0;
        const sameCategory = currentCategory && item.category === currentCategory ? 1 : 0;
        return {
          item,
          sharedTags,
          sameCategory
        };
      });

    const sorted = candidates.sort((a, b) => {
      if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
      if (b.sameCategory !== a.sameCategory) return b.sameCategory - a.sameCategory;
      return (b.item._dateValue || 0) - (a.item._dateValue || 0);
    });

    const primary = sorted.filter((entry) => entry.sharedTags > 0).slice(0, MAX_RESULTS);
    const fallback = sorted.filter((entry) => entry.sharedTags === 0 && entry.sameCategory > 0);
    const others = sorted.filter((entry) => entry.sharedTags === 0 && entry.sameCategory === 0);

    const combined = [...primary];

    fallback.concat(others).forEach((entry) => {
      if (combined.length >= MAX_RESULTS) return;
      if (!combined.find((existing) => existing.item.slug === entry.item.slug)) {
        combined.push(entry);
      }
    });

    if (combined.length < MIN_RESULTS) {
      sorted.forEach((entry) => {
        if (combined.length >= MAX_RESULTS) return;
        if (!combined.find((existing) => existing.item.slug === entry.item.slug)) {
          combined.push(entry);
        }
      });
    }

    return combined.slice(0, MAX_RESULTS).map((entry) => entry.item);
  }

  function renderRelated(list) {
    if (!list.length) {
      container.innerHTML = '<p class="related-empty">More resources coming soon.</p>';
      return;
    }

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    list.forEach((item) => {
      const link = document.createElement('a');
      link.className = 'related-card';
      link.href = item.url;

      const thumb = document.createElement('div');
      thumb.className = 'related-thumb';

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = item.image;
      img.alt = item.title;
      thumb.appendChild(img);

      const body = document.createElement('div');
      body.className = 'related-content';

      const tag = document.createElement('span');
      tag.className = 'related-tag';
      tag.textContent = item.category;

      const title = document.createElement('span');
      title.className = 'related-title';
      title.textContent = item.title;

      const meta = document.createElement('span');
      meta.className = 'related-read';
      meta.textContent = item.readTime;

      body.appendChild(tag);
      body.appendChild(title);
      body.appendChild(meta);

      link.appendChild(thumb);
      link.appendChild(body);

      fragment.appendChild(link);
    });

    container.appendChild(fragment);
  }
  function createFallbacks() {
    const entries = [
      ['Case Studies', '#273d9a', 'Case Study'],
      ['Guides', '#0a7c6b', 'Guide'],
      ['Articles', '#3b3a3f', 'Article']
    ];

    return entries.reduce((acc, [key, color, label]) => {
      const gradientId = `grad-related-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="${label}">` +
        `<defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color}" stop-opacity="0.95"/><stop offset="100%" stop-color="${color}" stop-opacity="0.7"/></linearGradient></defs>` +
        `<rect width="1200" height="800" fill="url(#${gradientId})"/>` +
        `<text x="50%" y="54%" fill="white" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="96" text-anchor="middle">${label}</text>` +
        `<text x="50%" y="66%" fill="white" fill-opacity="0.7" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-size="36" text-anchor="middle">Monetize Parking</text>` +
        `</svg>`;
      acc[key] = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
      return acc;
    }, {});
  }
})();
