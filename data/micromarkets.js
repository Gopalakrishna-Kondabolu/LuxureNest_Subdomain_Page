/**
 * Luxure Nest - Micro-Markets Configuration
 * 
 * Defines the structural schema and initial registry for micro-markets.
 * 
 * IMPORTANT ARCHITECTURAL NOTE:
 * 1. Values below are structured placeholders designed to demonstrate safe lookup.
 *    Approved micro-market data will be provided and finalized in Phase 2.
 * 2. Advertising location (e.g. ?loc=sohna-road) is strictly separated from
 *    the user's self-selected preferred micro-market in the lead form.
 * 3. All lookups are strictly allowlisted to prevent arbitrary HTML or script injection.
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  /**
   * Registry of recognized micro-markets indexed by normalized slug.
   * Marked as placeholder configuration.
   */
  const MICROMARKETS = {
    // --- GURUGRAM PLACEHOLDERS ---
    'cyber-city': {
      id: 'cyber-city',
      slug: 'cyber-city',
      name: 'DLF Cyber City',
      cityId: 'gurugram',
      displayName: 'DLF Cyber City, Gurugram',
      isPlaceholder: true
    },
    'golf-course-road': {
      id: 'golf-course-road',
      slug: 'golf-course-road',
      name: 'Golf Course Road',
      cityId: 'gurugram',
      displayName: 'Golf Course Road, Gurugram',
      isPlaceholder: true
    },
    'golf-course-ext': {
      id: 'golf-course-ext',
      slug: 'golf-course-ext',
      name: 'Golf Course Ext. Road',
      cityId: 'gurugram',
      displayName: 'Golf Course Ext. Road, Gurugram',
      isPlaceholder: true
    },
    'sohna-road': {
      id: 'sohna-road',
      slug: 'sohna-road',
      name: 'Sohna Road',
      cityId: 'gurugram',
      displayName: 'Sohna Road, Gurugram',
      isPlaceholder: true
    },
    'udyog-vihar': {
      id: 'udyog-vihar',
      slug: 'udyog-vihar',
      name: 'Udyog Vihar',
      cityId: 'gurugram',
      displayName: 'Udyog Vihar, Gurugram',
      isPlaceholder: true
    },

    // --- NOIDA PLACEHOLDERS ---
    'sector-62': {
      id: 'sector-62',
      slug: 'sector-62',
      name: 'Sector 62',
      cityId: 'noida',
      displayName: 'Sector 62, Noida',
      isPlaceholder: true
    },
    'sector-16-film-city': {
      id: 'sector-16-film-city',
      slug: 'sector-16-film-city',
      name: 'Sector 16 / Film City',
      cityId: 'noida',
      displayName: 'Sector 16 / Film City, Noida',
      isPlaceholder: true
    },
    'noida-expressway': {
      id: 'noida-expressway',
      slug: 'noida-expressway',
      name: 'Noida Expressway (Sec 125–135)',
      cityId: 'noida',
      displayName: 'Noida Expressway, Noida',
      isPlaceholder: true
    },
    'sector-142': {
      id: 'sector-142',
      slug: 'sector-142',
      name: 'Sector 142',
      cityId: 'noida',
      displayName: 'Sector 142, Noida',
      isPlaceholder: true
    },

    // --- DELHI PLACEHOLDERS ---
    'connaught-place': {
      id: 'connaught-place',
      slug: 'connaught-place',
      name: 'Connaught Place',
      cityId: 'delhi',
      displayName: 'Connaught Place (CP), Central Delhi',
      isPlaceholder: true
    },
    'barakhamba-road': {
      id: 'barakhamba-road',
      slug: 'barakhamba-road',
      name: 'Barakhamba Road',
      cityId: 'delhi',
      displayName: 'Barakhamba Road, Central Delhi',
      isPlaceholder: true
    },
    'aerocity': {
      id: 'aerocity',
      slug: 'aerocity',
      name: 'Aerocity',
      cityId: 'delhi',
      displayName: 'Aerocity, South West Delhi',
      isPlaceholder: true
    },
    'nehru-place': {
      id: 'nehru-place',
      slug: 'nehru-place',
      name: 'Nehru Place',
      cityId: 'delhi',
      displayName: 'Nehru Place, South Delhi',
      isPlaceholder: true
    },
    'saket-district': {
      id: 'saket-district',
      slug: 'saket-district',
      name: 'Saket District Centre',
      cityId: 'delhi',
      displayName: 'Saket District Centre, South Delhi',
      isPlaceholder: true
    }
  };

  /**
   * Safe lookup for micro-market by slug.
   * Normalizes input and verifies city membership if cityId is supplied.
   * Returns null if unmapped/unsupported (graceful fallback).
   */
  function getMicromarketBySlug(rawSlug, expectedCityId) {
    if (!rawSlug || typeof rawSlug !== 'string') return null;

    // Normalize: lowercase, trim, replace spaces/underscores with hyphens
    const normalized = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-');

    const entry = MICROMARKETS[normalized];
    if (!entry) return null;

    // Optional cross-validation against parent city
    if (expectedCityId && entry.cityId !== expectedCityId.toLowerCase().trim()) {
      return null;
    }

    return entry;
  }

  /**
   * Retrieve all micro-markets for a given city ID.
   */
  function getMicromarketsForCity(cityId) {
    if (!cityId) return [];
    const normalizedCity = cityId.toLowerCase().trim();
    return Object.values(MICROMARKETS).filter(item => item.cityId === normalizedCity);
  }

  root.LuxureNest.micromarkets = {
    registry: MICROMARKETS,
    getBySlug: getMicromarketBySlug,
    getForCity: getMicromarketsForCity
  };

})(typeof window !== 'undefined' ? window : this);
