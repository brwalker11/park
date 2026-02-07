(function () {
  const DATA_URL = '/data/resources.json';
  const INLINE_CTA_COPY = {
    heading: 'Ready to see what this could earn on your lot?',
    supporting: 'We’ll map the numbers, project the lift, and build a plan that fits your property.',
    button: 'Plan My Revenue Boost'
  };
  const CTA_EVENTS = {
    contact: { name: 'generate_lead', params: { method: 'Article Bottom CTA' } },
    calculator: { name: 'calculator_start', params: { method: 'Article Bottom CTA' } },
    inline: { name: 'generate_lead', params: { method: 'Article Inline CTA' } }
  };
  let ctaTrackingAttached = false;

  // Series configuration for contextual sidebar navigation
  const SERIES_CONFIG = {
    'flexible-parking-rules': {
      name: 'Flexible Parking Rules',
      mainSlug: 'flexible-parking-rules',
      articles: [
        { slug: 'license-plate-allow-listing-guide', title: 'License Plate Allow Listing Guide', part: 1 },
        { slug: 'custom-operating-hours-strategy', title: 'Custom Operating Hours Strategy', part: 2 },
        { slug: 'dynamic-pricing-strategies', title: 'Dynamic Pricing Strategies', part: 3 },
        { slug: 'balancing-revenue-relationships', title: 'Balancing Revenue & Relationships', part: 4 }
      ]
    },
    'dynamic-pricing-guide': {
      name: 'Dynamic Pricing 101',
      mainSlug: 'dynamic-pricing-guide',
      articles: [
        { slug: 'choosing-pricing-strategy', title: 'Choosing Your Pricing Strategy', part: 1 },
        { slug: 'dynamic-pricing-technology', title: 'Technology Stack for Dynamic Pricing', part: 2 },
        { slug: 'pricing-by-property-type', title: 'Pricing by Property Type', part: 3 },
        { slug: 'dynamic-pricing-mistakes', title: 'Common Pricing Mistakes', part: 4 }
      ]
    }
  };

  function getSeriesForSlug(slug) {
    // Check if slug is a main series article
    if (SERIES_CONFIG[slug]) {
      return { series: SERIES_CONFIG[slug], isMain: true };
    }
    // Check if slug is a sub-article in any series
    for (const [mainSlug, series] of Object.entries(SERIES_CONFIG)) {
      const found = series.articles.find(a => a.slug === slug);
      if (found) {
        return { series, isMain: false, currentArticle: found };
      }
    }
    return null;
  }

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const slug = getSlug();
    if (!slug) {
      renderNotFound('We couldn’t find that article.', { noindex: true });
      return;
    }

    try {
      const articles = await loadArticles();
      const current = articles.find((item) => item.slug === slug);
      if (!current) {
        renderNotFound('We couldn’t find that article.', { noindex: true });
        return;
      }

      const bodyHtml = await loadArticleBody(current.content);
      renderArticle(current, articles, bodyHtml);
    } catch (error) {
      console.error(error);
      renderNotFound('We couldn’t load this article right now. Please try again soon.');
    }
  }

  function getSlug() {
    const pathMatch = window.location.pathname.match(/\/articles\/([^/]+)\/?/);
    let slug = pathMatch ? pathMatch[1] : '';
    if (!slug) {
      const url = new URL(window.location.href);
      slug = url.searchParams.get('slug') || '';
    }
    return slug ? decodeURIComponent(slug) : '';
  }

  async function loadArticles() {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to load articles');
    }
    const raw = await response.json();
    return raw.map((item) => ({
      slug: item.slug,
      title: item.title,
      category: item.category,
      tags: Array.isArray(item.tags) ? item.tags : [],
      date: item.date,
      lastmod: item.lastmod || item.date,
      description: item.description || '',
      excerpt: item.excerpt || item.description || '',
      image: normaliseImage(item.image),
      imageAlt: item.imageAlt || item.title,
      thumbnail: normaliseImage(item.thumbnail || item.image),
      content: item.content,
      readTime: item.readTime || '',
      author: item.author || 'Monetize Parking',
      canonicalOverride: item.canonicalOverride || ''
    }));
  }

  async function loadArticleBody(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to load article body');
    }
    return response.text();
  }

  function renderArticle(article, allArticles, bodyHtml) {
    const container = document.getElementById('article');
    const hero = container.querySelector('.article-hero');
    const heroImage = document.getElementById('hero-image');
    const titleEl = document.getElementById('article-title');
    const metaEl = document.getElementById('article-meta');
    const summaryEl = document.getElementById('article-summary');
    const bodyEl = document.getElementById('article-body');
    const footerCopy = document.getElementById('article-footer-copy');
    const robots = document.querySelector('meta[name="robots"]');

    container.dataset.articleSlug = article.slug;
    const heroImageUrl = absolute(article.image);
    hero.style.backgroundImage = `url('${heroImageUrl}')`;
    heroImage.src = heroImageUrl;
    heroImage.alt = article.imageAlt;
    heroImage.loading = 'eager';
    heroImage.decoding = 'async';
    heroImage.setAttribute('fetchpriority', 'high');

    titleEl.textContent = article.title;
    metaEl.textContent = buildMetaLine(article);
    summaryEl.textContent = article.excerpt;
    summaryEl.style.display = article.excerpt ? '' : 'none';
    footerCopy.textContent = 'Ready to turn this strategy into new parking revenue? Let’s build the plan together.';

    bodyEl.innerHTML = bodyHtml;
    enhanceBody(bodyEl);

    const prettyUrl = absolute(`/articles/${article.slug}/`);
    const canonicalUrl = computeCanonical(article);
    const imageUrl = absolute(article.image);
    const publishDate = isoDate(article.date);
    const modifiedDate = isoDate(article.lastmod || article.date);

    setDocumentMeta(article, canonicalUrl, imageUrl, publishDate, modifiedDate);
    if (robots) {
      robots.setAttribute('content', 'index,follow');
    }

    renderBreadcrumb(article);
    renderRelated(article, allArticles);
    trackPageView(prettyUrl);
    attachCtaTracking();
  }

  function enhanceBody(bodyEl) {
    bodyEl.querySelectorAll('img').forEach((img) => {
      img.loading = 'lazy';
      if (!img.alt || img.alt.trim() === '') {
        img.alt = document.getElementById('article-title').textContent || 'Article image';
      }
    });

    // Mid-article CTA removed - only bottom CTA should appear
  }

  function insertInlineCta(bodyEl) {
    const headings = bodyEl.querySelectorAll('h2, h3');
    const target = headings[2] || headings[headings.length - 1] || bodyEl.firstChild;
    if (!target) return;

    if (!target.parentNode) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'cta-inline';

    const copy = document.createElement('p');
    copy.innerHTML = `<strong>${INLINE_CTA_COPY.heading}</strong> ${INLINE_CTA_COPY.supporting}`;

    const button = document.createElement('a');
    button.href = '/contact/';
    button.className = 'btn';
    button.textContent = INLINE_CTA_COPY.button;
    button.setAttribute('data-cta', 'inline');

    wrapper.appendChild(copy);
    wrapper.appendChild(button);

    target.parentNode.insertBefore(wrapper, target);
  }

  function renderBreadcrumb(article) {
    const categoryLink = document.getElementById('breadcrumb-category');
    const titleCrumb = document.getElementById('breadcrumb-title');
    const filterUrl = `/resources/?category=${encodeURIComponent(article.category)}`;
    categoryLink.href = filterUrl;
    categoryLink.textContent = article.category;
    titleCrumb.textContent = article.title;
  }

  function renderRelated(article, allArticles) {
    const list = document.getElementById('related-list');
    if (!list) return;
    list.innerHTML = '';

    // Check if this article is part of a series
    const seriesInfo = getSeriesForSlug(article.slug);
    if (seriesInfo) {
      renderSeriesSidebar(list, seriesInfo, article.slug, allArticles);
      return;
    }

    // Default related articles behavior
    const maxCandidates = Math.min(5, Math.max(0, allArticles.length - 1));
    const items = allArticles
      .filter((item) => item.slug !== article.slug)
      .map((item) => ({
        article: item,
        tagOverlap: overlapCount(article.tags, item.tags),
        sameCategory: item.category === article.category,
        recency: Date.parse(item.lastmod || item.date || '') || 0
      }))
      .sort((a, b) => {
        if (b.tagOverlap !== a.tagOverlap) return b.tagOverlap - a.tagOverlap;
        if (b.sameCategory !== a.sameCategory) return (b.sameCategory ? 1 : 0) - (a.sameCategory ? 1 : 0);
        return b.recency - a.recency;
      })
      .slice(0, maxCandidates);

    const minimum = Math.min(5, Math.max(3, items.length));
    const selection = items.slice(0, minimum);

    if (!selection.length) {
      const empty = document.createElement('p');
      empty.className = 'related-empty';
      empty.textContent = 'Check back soon for more related resources.';
      list.appendChild(empty);
      return;
    }

    selection.forEach(({ article: item }) => {
      list.appendChild(buildRelatedCard(item));
    });
  }

  function renderSeriesSidebar(container, seriesInfo, currentSlug, allArticles) {
    const { series, isMain } = seriesInfo;

    // Build lookup map for article data (to get thumbnails)
    const articlesBySlug = {};
    allArticles.forEach((a) => {
      articlesBySlug[a.slug] = a;
    });

    // Update sidebar heading
    const asideHeading = document.querySelector('.aside-heading');
    if (asideHeading) {
      asideHeading.textContent = 'Related Resources';
    }

    // If viewing a sub-article, show link to main article (unless main article is current)
    if (!isMain && series.mainSlug !== currentSlug) {
      const mainArticle = articlesBySlug[series.mainSlug];
      if (mainArticle) {
        container.appendChild(buildRelatedCard(mainArticle));
      }
    }

    // List series articles, excluding the current one
    series.articles.forEach((art) => {
      // Skip the current article - don't show it in the sidebar
      if (art.slug === currentSlug) {
        return;
      }

      const articleData = articlesBySlug[art.slug];
      if (articleData) {
        container.appendChild(buildRelatedCard(articleData));
      }
    });

    // If no articles were added (shouldn't happen), show empty message
    if (container.children.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'related-empty';
      empty.textContent = 'Check back soon for more related resources.';
      container.appendChild(empty);
    }
  }

  function overlapCount(baseTags, candidateTags) {
    if (!Array.isArray(baseTags) || !Array.isArray(candidateTags)) return 0;
    return candidateTags.filter((tag) => baseTags.includes(tag)).length;
  }

  function buildRelatedCard(item) {
    const link = document.createElement('a');
    link.className = 'related-card';
    link.href = buildArticleUrl(item.slug);

    const thumb = document.createElement('div');
    thumb.className = 'related-thumb';
    const img = document.createElement('img');
    img.src = item.thumbnail;
    img.alt = item.imageAlt || item.title;
    img.loading = 'lazy';
    thumb.appendChild(img);

    const content = document.createElement('div');
    content.className = 'related-content';

    const tag = document.createElement('span');
    tag.className = 'related-tag';
    tag.textContent = item.category;

    const title = document.createElement('div');
    title.className = 'related-title';
    title.textContent = item.title;

    const read = document.createElement('span');
    read.className = 'related-read';
    read.textContent = item.readTime || '';

    content.appendChild(tag);
    content.appendChild(title);
    if (read.textContent) {
      content.appendChild(read);
    }

    link.appendChild(thumb);
    link.appendChild(content);
    return link;
  }

  function computeCanonical(article) {
    if (article.canonicalOverride) {
      return article.canonicalOverride;
    }
    return absolute(`/articles/${article.slug}/`);
  }

  function setDocumentMeta(article, canonicalUrl, imageUrl, publishDate, modifiedDate) {
    document.title = `${article.title} | Monetize Parking`;
    setMeta('description', article.description);
    setLinkCanonical(canonicalUrl);

    setOg('og:type', 'article');
    setOg('og:title', `${article.title} | Monetize Parking`);
    setOg('og:description', article.description);
    setOg('og:url', canonicalUrl);
    setOg('og:image', imageUrl);
    setOg('article:published_time', publishDate);
    setOg('article:modified_time', modifiedDate);
    clearOgTags('article:tag');
    article.tags.forEach((tag) => addOgTag('article:tag', tag));

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', `${article.title} | Monetize Parking`);
    setMeta('twitter:description', article.description);
    setMeta('twitter:image', imageUrl);

    injectJsonLd(article, canonicalUrl, imageUrl, publishDate, modifiedDate);
  }

  function setMeta(name, content) {
    if (!name) return;
    const selector = name.startsWith('og:') || name.startsWith('article:') ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('article:')) {
        tag.setAttribute('property', name);
      } else {
        tag.setAttribute('name', name);
      }
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content || '');
  }

  function setOg(property, content) {
    setMeta(property, content);
  }

  function addOgTag(property, value) {
    const meta = document.createElement('meta');
    meta.setAttribute('property', property);
    meta.setAttribute('content', value);
    document.head.appendChild(meta);
  }

  function clearOgTags(property) {
    document.querySelectorAll(`meta[property="${property}"]`).forEach((node) => node.remove());
  }

  function setLinkCanonical(url) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  function injectJsonLd(article, canonicalUrl, imageUrl, publishDate, modifiedDate) {
    document.querySelectorAll('script[type="application/ld+json"][data-dynamic="article"]').forEach((node) => node.remove());
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: imageUrl,
      datePublished: publishDate,
      dateModified: modifiedDate,
      author: {
        '@type': 'Organization',
        name: article.author || 'Monetize Parking'
      },
      mainEntityOfPage: canonicalUrl,
      publisher: {
        '@type': 'Organization',
        name: 'Monetize Parking',
        logo: {
          '@type': 'ImageObject',
          url: absolute('/images/Logo.png')
        }
      },
      keywords: article.tags
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.dynamic = 'article';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function renderNotFound(message, options) {
    var shouldNoindex = options && options.noindex;
    document.title = 'Article Not Found | Monetize Parking';
    if (shouldNoindex) {
      var robots = document.querySelector('meta[name="robots"]');
      if (robots) {
        robots.setAttribute('content', 'noindex,follow');
      }
    }
    setLinkCanonical(`${window.location.origin}/resources/`);
    const container = document.getElementById('article');
    if (container) {
      container.innerHTML = `
        <h1>We couldn’t find that resource.</h1>
        <p>${message || 'The article you are looking for may have moved or been removed.'}</p>
        <p><a class="btn btn-primary" href="/resources/">Browse Resources</a></p>
      `;
    }
  }

  function buildMetaLine(article) {
    const published = formatDisplayDate(article.date);
    const updated = formatDisplayDate(article.lastmod || article.date);
    const parts = [`By ${article.author}`];
    if (updated && updated !== published) {
      parts.push(`Updated ${updated}`);
    } else if (published) {
      parts.push(`Published ${published}`);
    }
    if (article.readTime) {
      parts.push(article.readTime);
    }
    return parts.join(' • ');
  }

  function formatDisplayDate(input) {
    if (!input) return '';
    const value = Date.parse(input);
    if (!value) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(value));
  }

  function isoDate(input) {
    if (!input) return '';
    const value = Date.parse(input);
    if (!value) return '';
    return new Date(value).toISOString();
  }

  function normaliseImage(path) {
    if (!path) return '/images/default-guide.webp';
    if (path.startsWith('http')) return path;
    return path.startsWith('/images/') ? path : `/images/${path.replace(/^\/+/, '')}`;
  }

  function absolute(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${window.location.origin}${path}`;
  }

  function buildArticleUrl(slug) {
    return `/articles/${encodeURIComponent(slug)}/`;
  }

  function setRobots(value) {
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute('content', value);
    }
  }

  function trackPageView(canonicalUrl) {
    if (typeof gtag === 'function') {
      try {
        const url = new URL(canonicalUrl, window.location.origin);
        gtag('config', 'G-LGHS0L5WE8', {
          page_path: url.pathname + url.search,
          page_location: canonicalUrl
        });
      } catch (error) {
        console.warn('Unable to send GA page view', error);
      }
    }
  }

  function attachCtaTracking() {
    if (ctaTrackingAttached) return;
    ctaTrackingAttached = true;
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cta]');
      if (!button) return;
      const type = button.getAttribute('data-cta');
      const eventConfig = CTA_EVENTS[type];
      if (eventConfig && typeof gtag === 'function') {
        gtag('event', eventConfig.name, eventConfig.params);
      }
    });
  }
})();
