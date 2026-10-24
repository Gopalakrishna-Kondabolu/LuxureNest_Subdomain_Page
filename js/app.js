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
   * Initialize Route Switcher & Inspection Helper.
   * Enables seamless in-browser verification of all 6 target routes + fallbacks.
   */
  function initRouteInspector() {
    const navLinks = document.querySelectorAll('.route-test-link');
    if (!navLinks || navLinks.length === 0) return;

    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const targetService = this.getAttribute('data-service');
        const targetCity = this.getAttribute('data-city');

        if (!targetService || !targetCity) return;

        // In static environment or test mode, update query params cleanly
        e.preventDefault();
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('service', targetService);
        newUrl.searchParams.set('city', targetCity);
        window.history.pushState({}, '', newUrl.toString());

        // Re-resolve and re-render without full page reload
        bootstrap();
      });
    });
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

      // 4. Update active states on inspector links if present
      updateInspectorActiveState(routeInfo.serviceId, routeInfo.cityId);

      utils.logger.info('Luxure Nest Landing Page initialized successfully.');
    } catch (err) {
      utils.logger.error('Fatal initialization error:', err);
    }
  }

  function updateInspectorActiveState(activeService, activeCity) {
    const links = document.querySelectorAll('.route-test-link');
    links.forEach(link => {
      const s = link.getAttribute('data-service');
      const c = link.getAttribute('data-city');
      if (s === activeService && c === activeCity) {
        link.classList.add('route-test-link--active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('route-test-link--active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // Public API exposed on window.LuxureNest
  root.LuxureNest.app = {
    bootstrap,
    formBridge,
    trackingBridge,
    getCurrentResolution: () => currentResolution
  };

  // Run on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        bootstrap();
        initRouteInspector();
      });
    } else {
      bootstrap();
      initRouteInspector();
    }
  }

})(typeof window !== 'undefined' ? window : this);
