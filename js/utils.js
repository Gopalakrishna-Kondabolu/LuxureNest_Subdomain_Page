/**
 * Luxure Nest - Core Utility Functions
 * 
 * Provides safe DOM manipulation, sanitization, secure parameter extraction,
 * and defensive programming helpers.
 * 
 * SECURITY MANDATE:
 * - Never inject untrusted user/URL input via innerHTML.
 * - Always use textContent or allowlisted lookups.
 * - Enforce strict bounds on query parameter values.
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  /**
   * Escape HTML special characters for defensive string handling.
   * @param {string} str - Raw string
   * @returns {string} - Escaped string
   */
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Safely update the text content of a DOM element or query selector.
   * Guaranteed not to execute scripts or parse HTML tags.
   * @param {string|HTMLElement} target - CSS selector or DOM element
   * @param {string} text - Safe text to insert
   * @returns {HTMLElement|null}
   */
  function setText(target, text) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return null;
    el.textContent = text != null ? String(text) : '';
    return el;
  }

  /**
   * Safely set an attribute on an element with sanitization.
   * @param {string|HTMLElement} target
   * @param {string} attr
   * @param {string} value
   */
  function setAttr(target, attr, value) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el || !attr) return null;
    // Disallow javascript: pseudo-protocols for URLs
    if ((attr === 'href' || attr === 'src') && typeof value === 'string') {
      const sanitized = value.trim().toLowerCase();
      if (sanitized.startsWith('javascript:') || sanitized.startsWith('data:text/html')) {
        console.warn(`[LuxureNest Security] Blocked unsafe attribute value for ${attr}:`, value);
        el.setAttribute(attr, '#');
        return el;
      }
    }
    el.setAttribute(attr, String(value));
    return el;
  }

  /**
   * Safely toggle an element's class.
   * @param {string|HTMLElement} target
   * @param {string} className
   * @param {boolean} [force]
   */
  function toggleClass(target, className, force) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el || !className) return;
    el.classList.toggle(className, force);
  }

  /**
   * Parse URL query parameters safely.
   * Limits key and value lengths and strips control characters.
   * @returns {Record<string, string>}
   */
  function getSafeQueryParams() {
    const params = {};
    if (typeof window === 'undefined' || !window.location.search) {
      return params;
    }

    try {
      const searchParams = new URLSearchParams(window.location.search);
      for (const [rawKey, rawValue] of searchParams.entries()) {
        if (!rawKey) continue;
        // Strict boundary: key <= 32 chars, value <= 128 chars
        const cleanKey = rawKey.trim().toLowerCase().slice(0, 32);
        // Strip ASCII control characters and HTML tags
        const cleanVal = rawValue
          .replace(/[\x00-\x1F\x7F<>]/g, '')
          .trim()
          .slice(0, 128);

        params[cleanKey] = cleanVal;
      }
    } catch (err) {
      console.warn('[LuxureNest Utils] Could not parse query params safely:', err);
    }

    return params;
  }

  /**
   * Extract supported advertising attribution parameters.
   * Strict separation: Advertising location is treated as marketing context only,
   * NOT as the user's verified preference in the form.
   * @returns {object}
   */
  function getAttributionParams() {
    const query = getSafeQueryParams();
    const ALLOWED_ATTRIBUTION_KEYS = [
      'loc',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_adgroup',
      'utm_term',
      'matchtype',
      'physical_loc'
    ];

    const attribution = {};
    ALLOWED_ATTRIBUTION_KEYS.forEach(key => {
      attribution[key] = query[key] || '';
    });

    return attribution;
  }

  /**
   * Normalize an input slug or identifier string.
   * E.g. "Sohna Road" -> "sohna-road"
   * @param {string} str
   * @returns {string}
   */
  function normalizeSlug(str) {
    if (typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_\s]/g, '')
      .replace(/[\s_]+/g, '-');
  }

  /**
   * Format template strings with replacement tokens.
   * E.g. formatTemplate("Find office in {city}", { city: "Noida" })
   * @param {string} template
   * @param {Record<string, string>} tokens
   * @returns {string}
   */
  function formatTemplate(template, tokens) {
    if (typeof template !== 'string') return '';
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      if (tokens && key in tokens && tokens[key] != null) {
        return String(tokens[key]);
      }
      return match;
    });
  }

  /**
   * Defensive logger that only logs informative messages without leaking sensitive state.
   */
  const logger = {
    info: (msg, meta) => console.log(`[LuxureNest INFO] ${msg}`, meta !== undefined ? meta : ''),
    warn: (msg, meta) => console.warn(`[LuxureNest WARN] ${msg}`, meta !== undefined ? meta : ''),
    error: (msg, meta) => console.error(`[LuxureNest ERROR] ${msg}`, meta !== undefined ? meta : '')
  };

  root.LuxureNest.utils = {
    escapeHTML,
    setText,
    setAttr,
    toggleClass,
    getSafeQueryParams,
    getAttributionParams,
    normalizeSlug,
    formatTemplate,
    logger
  };

})(typeof window !== 'undefined' ? window : this);
