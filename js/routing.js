/**
 * Luxure Nest - Lightweight Route Detection
 * 
 * Inspects the current URL environment to detect the requested service, city,
 * and optional micro-market.
 * 
 * Works across:
 * 1. Clean server-rewritten paths: /coworking/gurugram
 * 2. Query parameter fallback: ?service=coworking&city=gurugram
 * 3. Hash path fallback: #/coworking/gurugram
 * 4. Subdirectory hosted environments: /subpath/coworking/gurugram
 * 
 * NOTE: This is NOT a client-side SPA router. It detects route state on page load
 * and coordinates with the static landing-page architecture.
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  const utils = root.LuxureNest.utils;

  /**
   * Parse pathname segments to find service and city.
   * Handles arbitrary base path prefixes (e.g. /subdomain/coworking/gurugram).
   * @param {string} pathname
   * @param {string[]} validServices
   * @param {string[]} validCities
   * @returns {{ serviceId: string|null, cityId: string|null }}
   */
  function parsePathSegments(pathname, validServices, validCities) {
    if (!pathname || typeof pathname !== 'string') {
      return { serviceId: null, cityId: null };
    }

    // Split path into clean, non-empty lowercase segments
    const segments = pathname
      .toLowerCase()
      .split('/')
      .map(s => s.trim())
      .filter(Boolean);

    let detectedService = null;
    let detectedCity = null;

    // Scan segments for valid service and city pairs
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];

      // Check if current segment is a valid service
      if (validServices.includes(seg)) {
        detectedService = seg;
        // Next segment might be the city
        if (i + 1 < segments.length && validCities.includes(segments[i + 1])) {
          detectedCity = segments[i + 1];
        }
        break;
      }
    }

    // If city wasn't immediately after service, check if any segment is a valid city
    if (detectedService && !detectedCity) {
      detectedCity = segments.find(s => validCities.includes(s)) || null;
    }

    return { serviceId: detectedService, cityId: detectedCity };
  }

  /**
   * Resolves the active route based on path, query params, or hash.
   * Guarantees a valid, non-null serviceId and cityId.
   * @returns {object} Route resolution details
   */
  function resolveCurrentRoute() {
    const config = root.LuxureNest.config;
    const validServices = (config && config.SUPPORTED_SERVICE_IDS) || ['coworking', 'office'];
    const validCities = (config && config.SUPPORTED_CITY_IDS) || ['gurugram', 'noida', 'delhi'];
    const defaultService = (config && config.DEFAULT_SERVICE_ID) || 'coworking';
    const defaultCity = (config && config.DEFAULT_CITY_ID) || 'gurugram';

    const queryParams = utils.getSafeQueryParams();
    const attribution = utils.getAttributionParams();

    let serviceCandidate = null;
    let cityCandidate = null;
    let detectionMethod = 'default';

    // 1. Try clean pathname detection first (Primary production mode)
    if (typeof window !== 'undefined' && window.location.pathname) {
      const pathResult = parsePathSegments(window.location.pathname, validServices, validCities);
      if (pathResult.serviceId && pathResult.cityId) {
        serviceCandidate = pathResult.serviceId;
        cityCandidate = pathResult.cityId;
        detectionMethod = 'pathname';
      }
    }

    // 2. Try URL Hash fallback: #/coworking/gurugram
    if ((!serviceCandidate || !cityCandidate) && typeof window !== 'undefined' && window.location.hash) {
      const hashPath = window.location.hash.replace(/^#\/?/, '/');
      const hashResult = parsePathSegments(hashPath, validServices, validCities);
      if (hashResult.serviceId && hashResult.cityId) {
        serviceCandidate = hashResult.serviceId;
        cityCandidate = hashResult.cityId;
        detectionMethod = 'hash';
      }
    }

    // 3. Try query parameter fallback: ?service=coworking&city=gurugram
    if (!serviceCandidate && queryParams.service) {
      serviceCandidate = queryParams.service.toLowerCase().trim();
      detectionMethod = 'query';
    }
    if (!cityCandidate && queryParams.city) {
      cityCandidate = queryParams.city.toLowerCase().trim();
      detectionMethod = 'query';
    }

    // Check validity against allowlisted values
    const isServiceSupported = serviceCandidate && validServices.includes(serviceCandidate);
    const isCitySupported = cityCandidate && validCities.includes(cityCandidate);

    const isFallback = !isServiceSupported || !isCitySupported;

    // Apply safe defaults if unsupported or missing
    const resolvedServiceId = isServiceSupported ? serviceCandidate : defaultService;
    const resolvedCityId = isCitySupported ? cityCandidate : defaultCity;

    // Safe extraction of advertising micro-market (loc parameter)
    // Strictly separated from user preferred selection in the form
    const adLocRaw = queryParams.loc || '';
    const micromarketSlug = adLocRaw ? utils.normalizeSlug(adLocRaw) : '';

    if (isFallback) {
      utils.logger.info(
        `Route resolution fell back to defaults [${resolvedServiceId}/${resolvedCityId}]. ` +
        `Requested: service="${serviceCandidate || 'none'}", city="${cityCandidate || 'none'}".`
      );
    } else {
      utils.logger.info(
        `Route resolved successfully: /${resolvedServiceId}/${resolvedCityId} via ${detectionMethod}.`
      );
    }

    return {
      serviceId: resolvedServiceId,
      cityId: resolvedCityId,
      micromarketSlug,
      isFallback,
      detectionMethod,
      attribution,
      rawPath: typeof window !== 'undefined' ? window.location.pathname : ''
    };
  }

  root.LuxureNest.routing = {
    resolveCurrentRoute,
    parsePathSegments
  };

})(typeof window !== 'undefined' ? window : this);
