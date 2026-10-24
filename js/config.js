/**
 * Luxure Nest - Central Configuration Hub
 * 
 * Aggregates services, cities, and micro-markets into a single source of truth.
 * Handles configuration resolution, safe fallbacks, and schema contracts
 * for future Phase 2 (Form & Google Sheet integration).
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  const utils = root.LuxureNest.utils;

  // Defaults for graceful fallback
  const DEFAULT_SERVICE_ID = 'coworking';
  const DEFAULT_CITY_ID = 'gurugram';

  const SUPPORTED_SERVICE_IDS = ['coworking', 'office'];
  const SUPPORTED_CITY_IDS = ['gurugram', 'noida', 'delhi'];

  /**
   * Submission Endpoint Configuration
   * In local/development mode, routes to /api/submit-lead on server.js.
   * In production, this can be set to the authorized Google Apps Script Web App / Webhook URL.
   * NOTE: Private credentials or API keys must NEVER be exposed here.
   */
  const SUBMISSION_ENDPOINT = '/api/submit-lead';

  /**
   * Approved Site Visit Inspection Time Slots
   */
  const VISIT_TIME_SLOTS = [
    '10:00 AM – 12:00 PM',
    '12:00 PM – 02:00 PM',
    '02:00 PM – 04:00 PM',
    '04:00 PM – 06:00 PM'
  ];

  /**
   * Single-View Complete Lead Form Contract (Phase 2 Final UX)
   * 
   * Strict requirement: ONE continuous form in ONE tab/view.
   * No Step 1 / Step 2 tabs. Exactly 10 fields in specified order.
   */
  const FORM_SCHEMA_CONTRACT = {
    fields: [
      { name: 'fullName', type: 'text', label: 'Name', required: true, minLength: 2 },
      { name: 'phone', type: 'tel', label: 'Phone Number', required: true },
      { name: 'workEmail', type: 'email', label: 'Work Email', required: true },
      { name: 'companyName', type: 'text', label: 'Company Name', required: true, minLength: 2 },
      { name: 'service', type: 'select', label: 'Service', required: true },
      { name: 'teamSize', type: 'number', label: 'Team Size', required: true, min: 1 },
      {
        name: 'isDecisionMaker',
        type: 'select',
        label: 'Are you a Decision Maker?',
        required: true,
        // STRICT REQUIREMENT: Dropdown containing exactly 'Yes' and 'No'
        allowedOptions: ['Yes', 'No']
      },
      { name: 'preferredMicroMarket', type: 'select', label: 'Preferred Micro-market', required: true },
      { name: 'dateOfSiteVisit', type: 'date', label: 'Date of Site Visit', required: true },
      { name: 'timeOfSiteVisit', type: 'select', label: 'Time of Site Visit', required: true }
    ]
  };

  /**
   * Destination Google Sheet Lead Schema Contract
   * The destination Google Sheet contains these EXACT 7 columns:
   * [Name, Date of Site Visit, Time of Site Visit, Requirement, Company Name, Assigned To, Status]
   * 
   * DATA MAPPING SPECIFICATION:
   * 1. 'Name'                <- fullName
   * 2. 'Date of Site Visit'  <- dateOfSiteVisit
   * 3. 'Time of Site Visit'  <- timeOfSiteVisit
   * 4. 'Requirement'         <- service (selected service type)
   * 5. 'Company Name'        <- companyName
   * 6. 'Assigned To'         <- '' (unassigned, managed by internal CRM workflow)
   * 7. 'Status'              <- 'New Lead' (internal initial status)
   * 
   * Additional collected fields (phone, workEmail, teamSize, isDecisionMaker,
   * preferredMicroMarket, city, landingMicroMarket, attribution) are preserved
   * in the complete lead payload sent to the submission endpoint so that no
   * customer data is discarded.
   */
  const GOOGLE_SHEET_SCHEMA = {
    columns: [
      'Name',
      'Date of Site Visit',
      'Time of Site Visit',
      'Requirement',
      'Company Name',
      'Assigned To',
      'Status'
    ],
    defaultStatus: 'New Lead',
    defaultAssignedTo: ''
  };

  /**
   * Structure and map collected form data into the exact Google Sheet row structure
   * alongside the complete comprehensive lead record.
   * 
   * @param {object} formData - Validated user input from form
   * @param {object} contextData - Page and attribution context (city, ad loc, UTMs)
   * @returns {{ googleSheetRow: object, completeLeadRecord: object }}
   */
  function mapLeadPayload(formData, contextData) {
    const safeForm = formData || {};
    const safeContext = contextData || {};

    const googleSheetRow = {
      'Name': safeForm.fullName || '',
      'Date of Site Visit': safeForm.dateOfSiteVisit || '',
      'Time of Site Visit': safeForm.timeOfSiteVisit || '',
      'Requirement': safeForm.service || '',
      'Company Name': safeForm.companyName || '',
      'Assigned To': GOOGLE_SHEET_SCHEMA.defaultAssignedTo,
      'Status': GOOGLE_SHEET_SCHEMA.defaultStatus
    };

    const completeLeadRecord = {
      fullName: safeForm.fullName || '',
      phone: safeForm.phone || '',
      workEmail: safeForm.workEmail || '',
      companyName: safeForm.companyName || '',
      service: safeForm.service || '',
      teamSize: Number(safeForm.teamSize) || 1,
      isDecisionMaker: safeForm.isDecisionMaker || '',
      preferredMicroMarket: safeForm.preferredMicroMarket || '',
      dateOfSiteVisit: safeForm.dateOfSiteVisit || '',
      timeOfSiteVisit: safeForm.timeOfSiteVisit || '',
      city: safeContext.city || '',
      landingMicroMarket: safeContext.landingMicroMarket || '',
      attribution: safeContext.attribution || {},
      submittedAt: new Date().toISOString()
    };

    return {
      googleSheetRow,
      completeLeadRecord
    };
  }

  /**
   * Safe getter for service configuration.
   * Returns fallback service if requested key is invalid.
   */
  function getService(serviceId) {
    const services = root.LuxureNest.services || {};
    const normalized = (serviceId || '').toLowerCase().trim();
    if (services[normalized]) {
      return services[normalized];
    }
    return services[DEFAULT_SERVICE_ID];
  }

  /**
   * Safe getter for city configuration.
   * Returns fallback city if requested key is invalid.
   */
  function getCity(cityId) {
    const cities = root.LuxureNest.cities || {};
    const normalized = (cityId || '').toLowerCase().trim();
    if (cities[normalized]) {
      return cities[normalized];
    }
    return cities[DEFAULT_CITY_ID];
  }

  /**
   * Resolves complete page configuration combining service, city,
   * optional micro-market, and query attribution.
   * 
   * Guarantees that no field is undefined or null.
   * 
   * @param {object} params
   * @param {string} params.serviceId - Raw or detected service slug
   * @param {string} params.cityId - Raw or detected city slug
   * @param {string} [params.micromarketSlug] - Optional advertising or URL micro-market slug
   * @param {boolean} [params.isFallback] - True if route was unsupported
   * @returns {object} Fully resolved configuration object
   */
  function resolvePageConfig({ serviceId, cityId, micromarketSlug, isFallback = false } = {}) {
    const services = root.LuxureNest.services || {};
    const cities = root.LuxureNest.cities || {};
    const micromarkets = root.LuxureNest.micromarkets;

    const normalizedService = (serviceId || '').toLowerCase().trim();
    const normalizedCity = (cityId || '').toLowerCase().trim();

    const isServiceValid = Boolean(services[normalizedService]);
    const isCityValid = Boolean(cities[normalizedCity]);

    const activeServiceId = isServiceValid ? normalizedService : DEFAULT_SERVICE_ID;
    const activeCityId = isCityValid ? normalizedCity : DEFAULT_CITY_ID;
    const hasFallenBack = isFallback || !isServiceValid || !isCityValid;

    const service = services[activeServiceId];
    const city = cities[activeCityId];

    // Safe allowlisted micro-market lookup (if supplied via ?loc= or path)
    let matchedMicromarket = null;
    if (micromarketSlug && micromarkets) {
      matchedMicromarket = micromarkets.getBySlug(micromarketSlug, activeCityId);
    }

    // Dynamic text synthesis using templates
    const tokens = {
      city: city.name,
      service: service.singularName,
      servicePlural: service.name,
      micromarket: matchedMicromarket ? matchedMicromarket.name : city.name
    };

    // Hero title: micro-market specific if valid, otherwise city-level
    let heroTitle = utils.formatTemplate(service.heroTitleTemplate, tokens);
    if (matchedMicromarket) {
      heroTitle = `${heroTitle} — ${matchedMicromarket.name}`;
    }

    const heroSubtitle = utils.formatTemplate(service.heroSubtitleTemplate, tokens);
    const seoTitle = utils.formatTemplate(service.seo.titleTemplate, tokens);
    const seoDescription = utils.formatTemplate(service.seo.metaDescriptionTemplate, tokens);

    // Business hubs for this city
    const businessHubs = city.businessHubsPlaceholder || [];

    return {
      service,
      city,
      micromarket: matchedMicromarket,
      isFallback: hasFallenBack,
      originalRequest: {
        serviceId: serviceId || '',
        cityId: cityId || '',
        micromarketSlug: micromarketSlug || ''
      },
      text: {
        heroTitle,
        heroSubtitle,
        ctaText: service.ctaText,
        secondaryCtaText: service.secondaryCtaText,
        seoTitle,
        seoDescription
      },
      businessHubs,
      formOptions: service.formRequirementOptions || [],
      valueHighlights: service.valueHighlights || [],
      optionsPlaceholder: service.optionsPlaceholder || []
    };
  }

  root.LuxureNest.config = {
    DEFAULT_SERVICE_ID,
    DEFAULT_CITY_ID,
    SUPPORTED_SERVICE_IDS,
    SUPPORTED_CITY_IDS,
    FORM_SCHEMA_CONTRACT,
    GOOGLE_SHEET_SCHEMA,
    SUBMISSION_ENDPOINT,
    VISIT_TIME_SLOTS,
    mapLeadPayload,
    getService,
    getCity,
    resolvePageConfig
  };

})(typeof window !== 'undefined' ? window : this);
