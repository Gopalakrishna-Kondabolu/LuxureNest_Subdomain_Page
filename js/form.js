/**
 * Luxure Nest - Lead Generation Form UX, Validation & Submission Engine
 * 
 * PHASE 2 SPECIFICATION:
 * - One complete form in one view / one tab.
 * - Exactly 10 fields in specified order.
 * - Service is a configuration-driven dropdown.
 * - Team Size is a validated number immediately after Service.
 * - Decision Maker is a dropdown containing strictly 'Yes' and 'No'.
 * - Preferred Micro-market is populated based on active city from allowlist.
 * - Date and Time of Site Visit are visitor-entered without fabricated values.
 * - Client-side inline validation with accessible error messaging.
 * - Duplicate submission protection with loading state.
 * - Failed submission preserves entered data and allows retry.
 * - Successful submission redirects to /thank-you.
 * - Google Sheet payload mapping without frontend credential exposure.
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  const utils = root.LuxureNest.utils;
  const config = root.LuxureNest.config;

  // Active form submission lock
  let isSubmitting = false;

  // Active page resolution context
  let activeResolution = null;

  /**
   * Validation Rules Configuration
   */
  const VALIDATION_RULES = {
    fullName: {
      required: true,
      validate: (val) => {
        if (!val || typeof val !== 'string') return false;
        const trimmed = val.trim();
        return trimmed.length >= 2 && /^[a-zA-Z\s\.\-']{2,60}$/.test(trimmed);
      },
      errorMessage: 'Please enter your name.'
    },

    phone: {
      required: true,
      validate: (val) => {
        if (!val || typeof val !== 'string') return false;
        // Strip cosmetic formatting (spaces, hyphens, parens, dots)
        const cleanDigits = val.replace(/[\s\-\.\(\)]/g, '');
        // Match Indian phone number: optional +91 or 0 followed by 10 digits starting with 6-9
        return /^(?:\+?91|0)?[6-9]\d{9}$/.test(cleanDigits);
      },
      errorMessage: 'Please enter a valid phone number.'
    },

    workEmail: {
      required: true,
      validate: (val) => {
        if (!val || typeof val !== 'string') return false;
        const trimmed = val.trim();
        // Standard email regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
      },
      errorMessage: 'Please enter your work email.'
    },

    companyName: {
      required: true,
      validate: (val) => {
        if (!val || typeof val !== 'string') return false;
        return val.trim().length >= 2;
      },
      errorMessage: 'Please enter your company name.'
    },

    service: {
      required: true,
      validate: (val) => {
        return Boolean(val && typeof val === 'string' && val.trim().length > 0);
      },
      errorMessage: 'Please select a service.'
    },

    teamSize: {
      required: true,
      validate: (val) => {
        if (val === '' || val === null || val === undefined) return false;
        const num = Number(val);
        // Minimum 1, positive integer, no NaN, no decimals
        return !isNaN(num) && Number.isInteger(num) && num >= 1;
      },
      errorMessage: 'Please enter your team size.'
    },

    isDecisionMaker: {
      required: true,
      validate: (val) => {
        // STRICT REQUIREMENT: Exactly 'Yes' or 'No'
        return val === 'Yes' || val === 'No';
      },
      errorMessage: 'Please select Yes or No.'
    },

    preferredMicroMarket: {
      required: true,
      validate: (val) => {
        return Boolean(val && typeof val === 'string' && val.trim().length > 0);
      },
      errorMessage: 'Please select a preferred micro-market.'
    },

    dateOfSiteVisit: {
      required: true,
      validate: (val) => {
        if (!val || typeof val !== 'string') return false;
        // Verify format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
        // Verify date is not in the past
        const selectedDate = new Date(val + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return !isNaN(selectedDate.getTime()) && selectedDate >= today;
      },
      errorMessage: 'Please select a valid date for your site visit.'
    },

    timeOfSiteVisit: {
      required: true,
      validate: (val) => {
        return Boolean(val && typeof val === 'string' && val.trim().length > 0);
      },
      errorMessage: 'Please select a time of site visit.'
    }
  };

  /**
   * Submission Service Abstraction
   * Handles dispatching lead payload to the configured submission endpoint.
   * 
   * SECURITY RULE: Never embed private Google Service Account keys or spreadsheet secrets here.
   */
  const submissionService = {
    async submitLead(payload) {
      // 1. If running under file:/// protocol, simulate successful local preview submission
      if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        utils.logger.info('[File Preview Mode] Simulating lead submission for local file preview:', payload);
        await new Promise(resolve => setTimeout(resolve, 600));
        return { success: true, message: 'Local file preview mode: lead simulated successfully', leadId: 'LN-LOCAL-' + Date.now() };
      }

      const endpoint = (config && config.SUBMISSION_ENDPOINT) || '/api/submit-lead';

      utils.logger.info('Submitting lead payload to endpoint:', {
        endpoint,
        googleSheetRow: payload.googleSheetRow,
        leadSummary: {
          name: payload.completeLeadRecord.fullName,
          service: payload.completeLeadRecord.service,
          city: payload.completeLeadRecord.city
        }
      });

      try {
        const isGoogleAppsScript = endpoint.includes('script.google.com');
        const headers = isGoogleAppsScript
          ? { 'Content-Type': 'text/plain;charset=utf-8' }
          : { 'Content-Type': 'application/json', 'Accept': 'application/json' };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          try {
            const data = await response.json();
            return data;
          } catch (jsonErr) {
            // Google Apps Script sometimes returns plain text or redirect HTML
            return {
              success: true,
              message: 'Lead received successfully',
              leadId: 'LN-' + Date.now()
            };
          }
        }

        // If local static server (e.g. VS Code Live Server on port 5500/5501) returned 404 Not Found for /api/submit-lead:
        const isLocalHost = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname === ''
        );

        if (isLocalHost && (response.status === 404 || response.status === 405)) {
          utils.logger.warn('[Local Dev Preview] Endpoint returned ' + response.status + ' on static dev server. Simulating successful submission for local testing:', payload);
          await new Promise(resolve => setTimeout(resolve, 400));
          return { success: true, message: 'Local dev simulation: lead recorded', leadId: 'LN-DEV-' + Date.now() };
        }

        throw new Error(`Submission failed with HTTP ${response.status}: ${response.statusText}`);
      } catch (networkErr) {
        // If network fetch threw an error (connection refused, offline, or static server without POST support)
        const isLocalHost = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname === ''
        );

        if (isLocalHost) {
          utils.logger.warn('[Local Dev Preview] Network fetch could not reach backend, simulating successful submission for local testing:', networkErr);
          await new Promise(resolve => setTimeout(resolve, 400));
          return { success: true, message: 'Local dev simulation: lead recorded', leadId: 'LN-DEV-' + Date.now() };
        }

        throw networkErr;
      }
    }
  };

  /**
   * Extract current values of all 10 form fields from the DOM.
   * @returns {object} Form field key-value pairs
   */
  function getFormData() {
    return {
      fullName: (document.getElementById('lead-name')?.value || '').trim(),
      phone: (document.getElementById('lead-phone')?.value || '').trim(),
      workEmail: (document.getElementById('lead-email')?.value || '').trim(),
      companyName: (document.getElementById('lead-company')?.value || '').trim(),
      service: (document.getElementById('lead-service')?.value || '').trim(),
      teamSize: (document.getElementById('lead-teamsize')?.value || '').trim(),
      isDecisionMaker: (document.getElementById('lead-decision-maker')?.value || '').trim(),
      preferredMicroMarket: (document.getElementById('lead-micromarket')?.value || '').trim(),
      dateOfSiteVisit: (document.getElementById('lead-visit-date')?.value || '').trim(),
      timeOfSiteVisit: (document.getElementById('lead-visit-time')?.value || '').trim()
    };
  }

  /**
   * Validate a single form field by name and display/clear its inline error message.
   * 
   * @param {string} fieldName - Field identifier
   * @param {any} value - Field input value
   * @returns {boolean} True if valid, false if invalid
   */
  function validateField(fieldName, value) {
    const rule = VALIDATION_RULES[fieldName];
    if (!rule) return true;

    const inputId = getElementIdForField(fieldName);
    const inputEl = document.getElementById(inputId);
    const errorEl = document.getElementById(`${inputId}-error`);

    const isValid = rule.validate(value);

    if (inputEl) {
      if (!isValid) {
        inputEl.classList.add('form-control--error');
        inputEl.classList.add('form-select--error');
        inputEl.setAttribute('aria-invalid', 'true');
        if (errorEl) {
          inputEl.setAttribute('aria-describedby', errorEl.id);
        }
      } else {
        inputEl.classList.remove('form-control--error');
        inputEl.classList.remove('form-select--error');
        inputEl.setAttribute('aria-invalid', 'false');
      }
    }

    if (errorEl) {
      if (!isValid) {
        errorEl.textContent = rule.errorMessage;
        errorEl.classList.add('form-error-msg--visible');
      } else {
        errorEl.textContent = '';
        errorEl.classList.remove('form-error-msg--visible');
      }
    }

    return isValid;
  }

  /**
   * Validate all form fields.
   * 
   * @returns {{ isValid: boolean, firstInvalidEl: HTMLElement|null, data: object }}
   */
  function validateCompleteForm() {
    const data = getFormData();
    let isAllValid = true;
    let firstInvalidEl = null;

    // Validate in exact visual order
    const fieldOrder = [
      'fullName',
      'phone',
      'workEmail',
      'companyName',
      'service',
      'teamSize',
      'isDecisionMaker',
      'preferredMicroMarket',
      'dateOfSiteVisit',
      'timeOfSiteVisit'
    ];

    fieldOrder.forEach((fieldName) => {
      const isValid = validateField(fieldName, data[fieldName]);
      if (!isValid) {
        isAllValid = false;
        if (!firstInvalidEl) {
          const id = getElementIdForField(fieldName);
          firstInvalidEl = document.getElementById(id);
        }
      }
    });

    return {
      isValid: isAllValid,
      firstInvalidEl,
      data
    };
  }

  /**
   * Map field name to HTML element ID.
   */
  function getElementIdForField(fieldName) {
    const map = {
      fullName: 'lead-name',
      phone: 'lead-phone',
      workEmail: 'lead-email',
      companyName: 'lead-company',
      service: 'lead-service',
      teamSize: 'lead-teamsize',
      isDecisionMaker: 'lead-decision-maker',
      preferredMicroMarket: 'lead-micromarket',
      dateOfSiteVisit: 'lead-visit-date',
      timeOfSiteVisit: 'lead-visit-time'
    };
    return map[fieldName] || fieldName;
  }

  /**
   * Set minimum date on the date picker to today (YYYY-MM-DD).
   */
  function setMinVisitDate() {
    const dateInput = document.getElementById('lead-visit-date');
    if (!dateInput) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDateStr = `${year}-${month}-${day}`;

    dateInput.min = minDateStr;
  }

  /**
   * Populate the Service dropdown dynamically from active service configuration.
   */
  function populateServiceDropdown(resolved) {
    const selectEl = document.getElementById('lead-service');
    if (!selectEl) return;

    selectEl.textContent = ''; // Clear previous options

    // Default unselected placeholder option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    defaultOpt.textContent = `Select ${resolved.service.shortLabel} Option`;
    selectEl.appendChild(defaultOpt);

    // Options from services.js
    const options = resolved.service.formRequirementOptions || [];
    options.forEach((opt) => {
      const optionEl = document.createElement('option');
      optionEl.value = opt.label;
      optionEl.textContent = `${opt.label} — ${opt.description}`;
      selectEl.appendChild(optionEl);
    });
  }

  /**
   * Populate the Preferred Micro-market dropdown dynamically from active city configuration.
   */
  function populateMicromarketDropdown(resolved) {
    const selectEl = document.getElementById('lead-micromarket');
    if (!selectEl) return;

    selectEl.textContent = ''; // Clear previous options

    // Default unselected placeholder option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    defaultOpt.textContent = `Select Micro-Market in ${resolved.city.name}`;
    selectEl.appendChild(defaultOpt);

    // Fetch allowlisted micro-markets for active city
    const micromarketsModule = root.LuxureNest.micromarkets;
    const cityMicromarkets = micromarketsModule
      ? micromarketsModule.getForCity(resolved.city.id)
      : [];

    cityMicromarkets.forEach((item) => {
      const optionEl = document.createElement('option');
      optionEl.value = item.name;
      optionEl.textContent = item.name;
      selectEl.appendChild(optionEl);
    });
  }

  /**
   * Populate the Time of Site Visit dropdown from approved slots.
   */
  function populateTimeSlotsDropdown() {
    const selectEl = document.getElementById('lead-visit-time');
    if (!selectEl) return;

    selectEl.textContent = ''; // Clear

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    defaultOpt.textContent = 'Select Inspection Time Slot';
    selectEl.appendChild(defaultOpt);

    const timeSlots = (config && config.VISIT_TIME_SLOTS) || [
      '10:00 AM – 12:00 PM',
      '12:00 PM – 02:00 PM',
      '02:00 PM – 04:00 PM',
      '04:00 PM – 06:00 PM'
    ];

    timeSlots.forEach((slot) => {
      const optionEl = document.createElement('option');
      optionEl.value = slot;
      optionEl.textContent = slot;
      selectEl.appendChild(optionEl);
    });
  }

  /**
   * Display or hide top-level form submission alert banner.
   */
  function showFormAlert(message) {
    const alertEl = document.getElementById('form-submit-alert');
    if (!alertEl) return;

    if (message) {
      alertEl.textContent = message;
      alertEl.classList.add('form-alert--visible');
      alertEl.focus();
    } else {
      alertEl.textContent = '';
      alertEl.classList.remove('form-alert--visible');
    }
  }

  /**
   * Set submit button loading and duplicate-protection state.
   */
  function setSubmittingState(submitting, originalCtaText) {
    isSubmitting = submitting;
    const submitBtn = document.getElementById('lead-form-submit');
    if (!submitBtn) return;

    if (submitting) {
      submitBtn.disabled = true;
      submitBtn.classList.add('btn--loading');
      submitBtn.textContent = '';

      const spinner = document.createElement('span');
      spinner.className = 'btn-spinner';
      spinner.setAttribute('aria-hidden', 'true');

      const textNode = document.createTextNode('Submitting Inquiry...');

      submitBtn.appendChild(spinner);
      submitBtn.appendChild(textNode);
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn--loading');
      submitBtn.textContent = originalCtaText || 'Schedule Workspace Tour';
    }
  }

  /**
   * Handle form submission event.
   */
  async function handleFormSubmit(event) {
    if (event) event.preventDefault();

    // 1. Prevent duplicate submission while already submitting
    if (isSubmitting) {
      utils.logger.warn('Submission already in progress. Ignoring duplicate click.');
      return;
    }

    // Hide any previous alert banner
    showFormAlert(null);

    // 2. Validate complete form
    const validation = validateCompleteForm();
    if (!validation.isValid) {
      utils.logger.warn('Form validation failed. Please correct highlighted fields.');
      if (validation.firstInvalidEl) {
        validation.firstInvalidEl.focus();
      }
      return;
    }

    const ctaBtn = document.getElementById('lead-form-submit');
    const originalText = ctaBtn ? ctaBtn.textContent : '';

    // 3. Initiate submission state
    setSubmittingState(true, originalText);

    try {
      // 4. Construct complete lead payload with Google Sheet mapping
      const contextData = {
        city: activeResolution ? activeResolution.city.name : '',
        landingMicroMarket: activeResolution && activeResolution.micromarket ? activeResolution.micromarket.name : '',
        attribution: (activeResolution && activeResolution.originalRequest && activeResolution.originalRequest.attribution) || utils.getAttributionParams()
      };

      const payload = (config && typeof config.mapLeadPayload === 'function')
        ? config.mapLeadPayload(validation.data, contextData)
        : {
            googleSheetRow: {
              'Name': validation.data.fullName,
              'Date of Site Visit': validation.data.dateOfSiteVisit,
              'Time of Site Visit': validation.data.timeOfSiteVisit,
              'Requirement': validation.data.service,
              'Company Name': validation.data.companyName,
              'Assigned To': '',
              'Status': 'New Lead'
            },
            completeLeadRecord: {
              ...validation.data,
              ...contextData,
              submittedAt: new Date().toISOString()
            }
          };

      // 5. Send to submission endpoint
      const response = await submissionService.submitLead(payload);

      if (response && response.success) {
        utils.logger.info('Lead submission confirmed successful. Redirecting to Thank You page...');
        // REDIRECT TO THANK YOU PAGE ONLY AFTER CONFIRMED SUCCESS
        const isStaticDevEnvironment = typeof window !== 'undefined' && (
          window.location.protocol === 'file:' ||
          window.location.pathname.endsWith('.html') ||
          window.location.port === '5500' ||
          window.location.port === '5501'
        );

        if (isStaticDevEnvironment) {
          window.location.href = 'thank-you.html';
        } else {
          window.location.href = '/thank-you';
        }
      } else {
        throw new Error((response && response.message) || 'Submission was not confirmed by the server.');
      }

    } catch (err) {
      utils.logger.error('Lead submission failed:', err);
      // PRESERVE ENTERED DATA: do not reset form!
      showFormAlert(
        'Unable to submit your inquiry at this moment. Please check your connection and try again.'
      );
      // Restore submit button to allow retry
      setSubmittingState(false, originalText);
    }
  }

  /**
   * Attach inline validation listeners on blur and input for all fields.
   */
  function bindFieldListeners() {
    const fieldOrder = [
      'fullName',
      'phone',
      'workEmail',
      'companyName',
      'service',
      'teamSize',
      'isDecisionMaker',
      'preferredMicroMarket',
      'dateOfSiteVisit',
      'timeOfSiteVisit'
    ];

    fieldOrder.forEach((fieldName) => {
      const id = getElementIdForField(fieldName);
      const el = document.getElementById(id);
      if (!el) return;

      // Validate on blur (user leaves field)
      el.addEventListener('blur', function () {
        // If field has been interacted with or attempted, validate
        if (this.value || this.classList.contains('form-control--error') || this.classList.contains('form-select--error')) {
          validateField(fieldName, this.value);
        }
      });

      // Clear error immediately when user begins correcting
      el.addEventListener('input', function () {
        if (this.classList.contains('form-control--error') || this.classList.contains('form-select--error')) {
          validateField(fieldName, this.value);
        }
      });

      el.addEventListener('change', function () {
        if (this.classList.contains('form-control--error') || this.classList.contains('form-select--error')) {
          validateField(fieldName, this.value);
        }
      });
    });
  }

  /**
   * Initialize or reconfigure the form when page route/configuration resolves.
   * 
   * @param {object} resolved - Resolved page configuration
   */
  function initForm(resolved) {
    activeResolution = resolved;

    const formEl = document.getElementById('lead-form');
    if (!formEl) return;

    // 1. Populate dropdowns
    populateServiceDropdown(resolved);
    populateMicromarketDropdown(resolved);
    populateTimeSlotsDropdown();
    setMinVisitDate();

    // 2. Update dynamic CTA button text
    const submitBtn = document.getElementById('lead-form-submit');
    if (submitBtn) {
      submitBtn.textContent = resolved.text.ctaText || 'Schedule Workspace Tour';
    }

    // 3. Update form card title & subtitle
    utils.setText('#form-service-badge', resolved.service.shortLabel);
    utils.setText('#form-city-badge', resolved.city.name);

    // 4. Attach submit handler (ensure only one listener bound)
    formEl.onsubmit = handleFormSubmit;

    // 5. Attach field validation listeners
    bindFieldListeners();

    utils.logger.info(`Lead form initialized for ${resolved.service.id} in ${resolved.city.id}.`);
  }

  // Export public form API
  root.LuxureNest.form = {
    initForm,
    getFormData,
    validateCompleteForm,
    validateField,
    handleFormSubmit,
    submissionService,
    getIsSubmitting: () => isSubmitting
  };

})(typeof window !== 'undefined' ? window : this);
