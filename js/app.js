/**
 * Luxure Nest - Application Orchestrator
 * 
 * Coordinates route resolution, dynamic content rendering, accessibility setup,
 * and future Phase 2 integration bridges (Form, Google Sheet, and Tracking).
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  const utils = root.LuxureNest.utils;
  const config = root.LuxureNest.config;
  const routing = root.LuxureNest.routing;
  const dynamicContent = root.LuxureNest.dynamicContent;

  // Store active application state
  let currentResolution = null;

  /**
   * Phase 2 Form Integration Bridge
   * Delegates payload mapping and submission to the active form module.
   */
  const formBridge = {
    prepareGoogleSheetPayload(formData, contextData) {
      return config.mapLeadPayload(formData, contextData);
    },
    submitLead(payload) {
      if (root.LuxureNest.form && root.LuxureNest.form.submissionService) {
        return root.LuxureNest.form.submissionService.submitLead(payload);
      }
      return Promise.reject(new Error('Form submission service not initialized'));
    }
  };

  /**
   * Phase 2 Tracking Integration Bridge (Architectural Foundation)
   * 
   * Captures ad parameters without polluting user preference fields.
   */
  const trackingBridge = {
    getAttribution() {
      return utils.getAttributionParams();
    },
    logEvent(eventName, eventData) {
      // Future Google Ads / Analytics tag firing hook
      utils.logger.info(`[TrackingBridge Stub] Event: ${eventName}`, eventData);
    }
  };

  /**
   * Enforces a clean production URL in the address bar:
   * e.g. https://spaces.luxurenest.com/coworking/gurugram
   * Strips ?service= and ?city= parameters while preserving any UTM/advertising tracking query parameters.
   */
  function enforceCleanUrl(serviceId, cityId) {
    if (typeof window === 'undefined' || !window.history || !window.history.replaceState) {
      return;
    }

    // Do not alter URL when loaded directly via file://
    if (window.location.protocol === 'file:') {
      return;
    }

    const expectedPath = `/${serviceId}/${cityId}`;
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';

    // Parse query params to check and remove legacy route parameters
    const searchParams = new URLSearchParams(window.location.search);
    const hadServiceParam = searchParams.has('service');
    const hadCityParam = searchParams.has('city');

    searchParams.delete('service');
    searchParams.delete('city');

    const remainingQuery = searchParams.toString();
    const cleanSearch = remainingQuery ? `?${remainingQuery}` : '';
    const hash = window.location.hash || '';

    // If on root, or if path doesn't match the clean path, or if service/city query params were in the URL
    if (currentPath !== expectedPath || hadServiceParam || hadCityParam) {
      const cleanUrl = `${expectedPath}${cleanSearch}${hash}`;
      try {
        window.history.replaceState({ serviceId, cityId }, document.title, cleanUrl);
        utils.logger.info(`Address bar synchronized to clean URL: ${cleanUrl}`);
      } catch (e) {
        utils.logger.warn('Could not update browser history state:', e);
      }
    }
  }

  /**
   * Master Bootstrap Sequence
   */
  function bootstrap() {
    try {
      // 1. Resolve current route from pathname, hash, or query params
      const routeInfo = routing.resolveCurrentRoute();

      // 2. Resolve complete, validated page configuration
      currentResolution = config.resolvePageConfig({
        serviceId: routeInfo.serviceId,
        cityId: routeInfo.cityId,
        micromarketSlug: routeInfo.micromarketSlug,
        isFallback: routeInfo.isFallback
      });

      // Attach attribution
      currentResolution.originalRequest.attribution = routeInfo.attribution;

      // 3. Render dynamic content into the DOM
      dynamicContent.renderPage(currentResolution);

      // 4. Enforce clean production URL in the address bar (no ?service= or ?city= query headers)
      enforceCleanUrl(routeInfo.serviceId, routeInfo.cityId);

      utils.logger.info('Luxure Nest Landing Page initialized successfully.');
    } catch (err) {
      utils.logger.error('Fatal initialization error:', err);
    }
  }

  /**
   * Smoothly scroll to the form and focus the first input when in-page CTA links are clicked.
   */
  function initFormAnchorLinks() {
    document.addEventListener('click', function (e) {
      const cta = e.target.closest('a[href="#lead-form-area"]');
      if (cta) {
        const formArea = document.getElementById('lead-form-area');
        if (formArea) {
          e.preventDefault();
          formArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            const firstInput = document.getElementById('lead-name');
            if (firstInput) firstInput.focus();
          }, 450);
        }
      }
    });
  }

  /**
   * Smoothly scroll to sections when navigation links are clicked.
   */
  function initNavAnchorLinks() {
    document.addEventListener('click', function (e) {
      const navLink = e.target.closest('.site-nav__link');
      if (navLink) {
        const href = navLink.getAttribute('href');
        if (href && href.startsWith('#')) {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (history.pushState) {
              history.pushState(null, null, href);
            }
          }
        }
      }
    });
  }

  /**
   * Automatically displays the sticky footer when scrolling downwards past the hero section,
   * and hides it smoothly when scrolling upwards or when at the top.
   */
  function initStickyFooterScrollBehavior() {
    const stickyFooter = document.getElementById('sticky-footer-bar');
    if (!stickyFooter) return;

    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    let ticking = false;
    const threshold = 180; // Only activate after scrolling past the top hero banner

    function onScroll() {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

      // When user is scrolling downwards and past the initial threshold: show
      if (currentScrollY > lastScrollY && currentScrollY > threshold) {
        stickyFooter.classList.add('sticky-footer-bar--visible');
      }
      // When user is scrolling upwards or near the top: hide
      else if (currentScrollY < lastScrollY || currentScrollY <= threshold) {
        stickyFooter.classList.remove('sticky-footer-bar--visible');
      }

      lastScrollY = Math.max(0, currentScrollY);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Initializes the Case Studies Carousel/Slider controls.
   * Handles Next/Prev buttons, slide index cycling, and dot indicator clicks.
   */
  function initCaseStudiesSlider() {
    const slider = document.getElementById('case-studies-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.case-study-slide');
    const dots = document.querySelectorAll('#case-studies-dots .case-studies-dot');
    const prevBtn = document.getElementById('case-study-prev-btn');
    const nextBtn = document.getElementById('case-study-next-btn');

    if (!slides.length) return;

    let currentIndex = 0;

    function goToSlide(targetIndex) {
      if (slides.length <= 1) return;
      currentIndex = (targetIndex + slides.length) % slides.length;

      slides.forEach((slide, idx) => {
        if (idx === currentIndex) {
          slide.style.display = 'block';
          slide.classList.add('case-study-slide--active');
          slide.setAttribute('aria-hidden', 'false');
        } else {
          slide.style.display = 'none';
          slide.classList.remove('case-study-slide--active');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('case-studies-dot--active');
          dot.setAttribute('aria-selected', 'true');
        } else {
          dot.classList.remove('case-studies-dot--active');
          dot.setAttribute('aria-selected', 'false');
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const slideIdx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(slideIdx)) {
          goToSlide(slideIdx);
        }
      });
    });
  }

  // Public API exposed on window.LuxureNest
  root.LuxureNest.app = {
    bootstrap,
    formBridge,
    trackingBridge,
    getCurrentResolution: () => currentResolution
  };

  // Listen for browser back/forward history navigation between routes
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      bootstrap();
    });
  }

  // Run on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        bootstrap();
        initFormAnchorLinks();
        initNavAnchorLinks();
        initStickyFooterScrollBehavior();
        initCaseStudiesSlider();
      });
    } else {
      bootstrap();
      initFormAnchorLinks();
      initNavAnchorLinks();
      initStickyFooterScrollBehavior();
      initCaseStudiesSlider();
    }
  }

})(typeof window !== 'undefined' ? window : this);
