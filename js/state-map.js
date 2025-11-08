(function () {
  'use strict';

  // State configuration
  const STATES = {
    colorado: { abbr: 'CO', name: 'Colorado', url: '/resources/states/colorado.html' },
    wisconsin: { abbr: 'WI', name: 'Wisconsin', url: '/resources/states/wisconsin.html' },
    minnesota: { abbr: 'MN', name: 'Minnesota', url: '/resources/states/minnesota.html' },
    texas: { abbr: 'TX', name: 'Texas', url: '/resources/states/texas.html' }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initMapInteractivity();
    initPillHoverSync();
  }

  /**
   * Make SVG map states clickable and add hover effects
   */
  function initMapInteractivity() {
    const activeStates = document.querySelectorAll('.active-state');

    activeStates.forEach(stateEl => {
      const stateName = stateEl.dataset.state;
      if (!stateName || !STATES[stateName]) return;

      // Make focusable for keyboard navigation
      stateEl.setAttribute('tabindex', '0');
      stateEl.setAttribute('role', 'link');
      stateEl.setAttribute('aria-label', `View ${STATES[stateName].name} insights`);

      // Click handler
      stateEl.addEventListener('click', () => {
        navigateToState(stateName);
      });

      // Keyboard handler (Enter/Space)
      stateEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateToState(stateName);
        }
      });

      // Hover effects - highlight corresponding pill
      stateEl.addEventListener('mouseenter', () => {
        highlightPill(stateName);
      });

      stateEl.addEventListener('mouseleave', () => {
        unhighlightPill(stateName);
      });
    });
  }

  /**
   * Sync state pill hover with map highlighting
   */
  function initPillHoverSync() {
    const pills = document.querySelectorAll('.state-pill');

    pills.forEach(pill => {
      const stateName = pill.dataset.state;
      if (!stateName) return;

      // Highlight map state when hovering pill
      pill.addEventListener('mouseenter', () => {
        highlightMapState(stateName);
      });

      pill.addEventListener('mouseleave', () => {
        unhighlightMapState(stateName);
      });
    });
  }

  /**
   * Navigate to state page
   */
  function navigateToState(stateName) {
    const state = STATES[stateName];
    if (!state) return;

    // Track event if gtag is available
    if (typeof gtag === 'function') {
      gtag('event', 'state_map_click', {
        state_name: state.name,
        state_abbr: state.abbr
      });
    }

    window.location.href = state.url;
  }

  /**
   * Highlight state pill (when hovering map)
   */
  function highlightPill(stateName) {
    const pill = document.querySelector(`.state-pill[data-state="${stateName}"]`);
    if (pill) {
      pill.style.borderColor = 'var(--state-active)';
      pill.style.background = 'rgba(13, 110, 253, 0.08)';
    }
  }

  /**
   * Remove highlight from state pill
   */
  function unhighlightPill(stateName) {
    const pill = document.querySelector(`.state-pill[data-state="${stateName}"]`);
    if (pill) {
      pill.style.borderColor = '';
      pill.style.background = '';
    }
  }

  /**
   * Highlight map state (when hovering pill)
   */
  function highlightMapState(stateName) {
    const stateEl = document.querySelector(`.active-state[data-state="${stateName}"]`);
    if (stateEl) {
      stateEl.style.fill = 'var(--state-hover)';
    }
  }

  /**
   * Remove highlight from map state
   */
  function unhighlightMapState(stateName) {
    const stateEl = document.querySelector(`.active-state[data-state="${stateName}"]`);
    if (stateEl) {
      stateEl.style.fill = '';
    }
  }
})();
