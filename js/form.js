/**
 * Luxure Nest - Lead Generation Form UX, Validation & Submission Engine
 * 
 * SPECIFICATION:
 * - Minimal high-converting lead capture (Name, Phone, Work Email, Team Size dropdown).
 * - Workspace Type pill selector: 'Coworking' and 'Managed Office' (Attachment 1).
 * - Team Size dropdown: '1-5', '6-20', '21-50', '50+' (Attachment 2).
 * - Universal Lead Modal popup for in-page CTAs and location cards.
 * - Dynamic location customization when triggered from Prime Location cards.
 * - Zero external dependencies, pure vanilla JS.
 * - Safe payload mapping compatible with Google Sheet lead capture endpoint.
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

  // Single-binding initialization guard
  let isFormInitialized = false;

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
      errorMessage: 'Please enter a valid 10-digit mobile number.'
    },

    workEmail: {
      required: true,
      validate: (val) => {
        if (!val || typeof val !== 'string') return false;
        const trimmed = val.trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
      },
      errorMessage: 'Please enter your work email.'
    },

    teamSize: {
      required: true,
      validate: (val) => {
        return Boolean(val && typeof val === 'string' && val.trim().length > 0);
      },
      errorMessage: 'Please select your team size.'
    },

    isDecisionMaker: {
      required: true,
      validate: (val) => {
        return Boolean(val && typeof val === 'string' && (val === 'Yes' || val === 'No'));
      },
      errorMessage: 'Please indicate if you are a decision maker.'
    }
  };

  /**
   * Submission Service Abstraction
   * Handles dispatching lead payload to configured endpoint.
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
        idempotencyKey: payload.idempotencyKey,
        googleSheetRow: payload.googleSheetRow,
        leadSummary: {
          name: payload.completeLeadRecord.fullName,
          service: payload.completeLeadRecord.service,
          city: payload.completeLeadRecord.city,
          teamSize: payload.completeLeadRecord.teamSize,
          microMarket: payload.completeLeadRecord.preferredMicroMarket
        }
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        if (payload.idempotencyKey) {
          headers['x-idempotency-key'] = payload.idempotencyKey;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          throw new Error('Our servers are currently experiencing high traffic. Please wait 10 seconds and click Submit again.');
        }

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.error || `Server responded with HTTP ${response.status}. Your lead could not be saved.`);
        }

        const data = await response.json().catch(() => null);

        if (!data || data.success !== true || !data.leadId) {
          throw new Error((data && data.error) || 'Submission was not verified by the server. Please try again.');
        }

        return data;

      } catch (networkErr) {
        clearTimeout(timeoutId);

        if (networkErr.name === 'AbortError') {
          throw new Error('Submission timed out. Please check your internet connection and try again.');
        }

        throw networkErr;
      }
    }
  };

  /**
   * Extract values from either the hero form or modal form.
   * @param {boolean} isModal 
   * @returns {object} Form field key-value pairs
   */
  function getFormData(isModal = false) {
    const prefix = isModal ? 'modal-lead-' : 'lead-';
    const teamsizeEl = document.getElementById(`${prefix}teamsize`);
    const serviceEl = document.getElementById(`${prefix}service`);
    const microMarketEl = document.getElementById(`${prefix}micromarket`);

    const selectedService = (serviceEl && serviceEl.value) || (
      activeResolution && activeResolution.service && activeResolution.service.singularName
        ? activeResolution.service.singularName
        : 'Coworking'
    );

    const selectedMicroMarket = (microMarketEl && microMarketEl.value) || (
      activeResolution && activeResolution.micromarket
        ? activeResolution.micromarket.name
        : ''
    );

    const decisionMakerEl = document.getElementById(`${prefix}decisionmaker`);
    const decisionMakerVal = (decisionMakerEl && decisionMakerEl.value) ? decisionMakerEl.value.trim() : 'Yes';

    return {
      fullName: (document.getElementById(`${prefix}name`)?.value || '').trim(),
      phone: (document.getElementById(`${prefix}phone`)?.value || '').trim(),
      workEmail: (document.getElementById(`${prefix}email`)?.value || '').trim(),
      teamSize: (teamsizeEl?.value || '').trim(),
      service: selectedService,
      companyName: '',
      isDecisionMaker: decisionMakerVal,
      preferredMicroMarket: selectedMicroMarket,
      dateOfSiteVisit: '',
      timeOfSiteVisit: ''
    };
  }

  /**
   * Validate a single form field by name and display/clear its inline error message.
   */
  function validateField(fieldName, value, isModal = false) {
    const rule = VALIDATION_RULES[fieldName];
    if (!rule) return true;

    const prefix = isModal ? 'modal-lead-' : 'lead-';
    let inputId = `${prefix}name`;
    if (fieldName === 'phone') inputId = `${prefix}phone`;
    if (fieldName === 'workEmail') inputId = `${prefix}email`;
    if (fieldName === 'teamSize') inputId = `${prefix}teamsize`;
    if (fieldName === 'isDecisionMaker') inputId = `${prefix}decisionmaker`;

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
   */
  function validateCompleteForm(isModal = false) {
    const data = getFormData(isModal);
    let isAllValid = true;
    let firstInvalidEl = null;

    const prefix = isModal ? 'modal-lead-' : 'lead-';
    const fields = ['fullName', 'phone', 'workEmail', 'teamSize', 'isDecisionMaker'];

    fields.forEach((fieldName) => {
      const isValid = validateField(fieldName, data[fieldName], isModal);
      if (!isValid) {
        isAllValid = false;
        if (!firstInvalidEl) {
          let inputId = `${prefix}name`;
          if (fieldName === 'phone') inputId = `${prefix}phone`;
          if (fieldName === 'workEmail') inputId = `${prefix}email`;
          if (fieldName === 'teamSize') inputId = `${prefix}teamsize`;
          if (fieldName === 'isDecisionMaker') inputId = `${prefix}decisionmaker`;
          firstInvalidEl = document.getElementById(inputId);
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
   * Display or hide top-level form submission alert banner.
   */
  function showFormAlert(message, isModal = false) {
    const alertId = isModal ? 'modal-form-submit-alert' : 'form-submit-alert';
    const alertEl = document.getElementById(alertId);
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
  function setSubmittingState(submitting, isModal = false, originalText = 'Get Free Shortlist') {
    isSubmitting = submitting;
    const btnId = isModal ? 'modal-lead-form-submit' : 'lead-form-submit';
    const submitBtn = document.getElementById(btnId);
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
      submitBtn.textContent = originalText || 'Get Free Shortlist';
    }
  }

  /**
   * Handle form submission event (shared logic for in-page and modal forms).
   */
  async function handleFormSubmit(event, isModal = false) {
    if (event) event.preventDefault();

    if (isSubmitting) {
      utils.logger.warn('Submission already in progress. Ignoring duplicate click.');
      return;
    }

    showFormAlert(null, isModal);

    const validation = validateCompleteForm(isModal);
    if (!validation.isValid) {
      utils.logger.warn('Form validation failed. Please correct highlighted fields.');
      if (validation.firstInvalidEl) {
        validation.firstInvalidEl.focus();
      }
      return;
    }

    const btnId = isModal ? 'modal-lead-form-submit' : 'lead-form-submit';
    const ctaBtn = document.getElementById(btnId);
    const originalText = ctaBtn ? ctaBtn.textContent : 'Get Free Shortlist';

    setSubmittingState(true, isModal, originalText);

    try {
      const activeCity = activeResolution ? activeResolution.city.name : '';
      const contextData = {
        city: activeCity,
        landingMicroMarket: validation.data.preferredMicroMarket || (activeResolution && activeResolution.micromarket ? activeResolution.micromarket.name : ''),
        attribution: (activeResolution && activeResolution.originalRequest && activeResolution.originalRequest.attribution) || utils.getAttributionParams()
      };

      const payload = (config && typeof config.mapLeadPayload === 'function')
        ? config.mapLeadPayload(validation.data, contextData)
        : {
            googleSheetRow: {
              'Name': validation.data.fullName,
              'Date of Site Visit': '',
              'Time of Site Visit': '',
              'Requirement': validation.data.service,
              'Company Name': '',
              'Team Size': validation.data.teamSize || '',
              'Assigned To': '',
              'Status': 'New Lead'
            },
            completeLeadRecord: {
              ...validation.data,
              ...contextData,
              submittedAt: new Date().toISOString()
            }
          };

      // Read anti-bot honeypot field
      const hpField = document.getElementById(isModal ? 'modal-lead-hp-field' : 'lead-hp-field');
      const hpVal = hpField ? hpField.value : '';
      payload._hp_company_website = hpVal;

      // Unique idempotency key to prevent double-charging or duplicate rows on retry
      payload.idempotencyKey = 'ik_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

      const response = await submissionService.submitLead(payload);

      if (response && response.success && response.leadId) {
        utils.logger.info(`Lead submission confirmed successful (ID: ${response.leadId}). Redirecting to Thank You page...`);
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
        throw new Error((response && response.message) || 'Submission was not verified by the server.');
      }

    } catch (err) {
      utils.logger.error('Lead submission failed:', err);
      showFormAlert(
        err.message || 'Unable to submit your inquiry at this moment. Please check your connection and try again.',
        isModal
      );
      setSubmittingState(false, isModal, originalText);
    }
  }

  /**
   * Setup Workspace Type Pill Selectors (Attachment 1 style)
   */
  function setupWorkspacePills() {
    const pillGroups = [
      { containerId: 'hero-workspace-pills', hiddenInputId: 'lead-service' },
      { containerId: 'modal-workspace-pills', hiddenInputId: 'modal-lead-service' }
    ];

    pillGroups.forEach(({ containerId, hiddenInputId }) => {
      const container = document.getElementById(containerId);
      const hiddenInput = document.getElementById(hiddenInputId);
      if (!container || !hiddenInput) return;

      const buttons = container.querySelectorAll('.workspace-pill');
      buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (e) e.preventDefault();
          buttons.forEach(b => {
            b.classList.remove('workspace-pill--active');
            b.setAttribute('aria-checked', 'false');
          });
          btn.classList.add('workspace-pill--active');
          btn.setAttribute('aria-checked', 'true');

          const val = btn.getAttribute('data-service-value') || btn.textContent.trim();
          hiddenInput.value = val;

          // Sync both forms so they stay consistent
          pillGroups.forEach(otherGroup => {
            const otherHidden = document.getElementById(otherGroup.hiddenInputId);
            if (otherHidden) otherHidden.value = val;
            const otherContainer = document.getElementById(otherGroup.containerId);
            if (otherContainer) {
              const otherButtons = otherContainer.querySelectorAll('.workspace-pill');
              otherButtons.forEach(ob => {
                const oval = ob.getAttribute('data-service-value') || ob.textContent.trim();
                if (oval.toLowerCase() === val.toLowerCase()) {
                  ob.classList.add('workspace-pill--active');
                  ob.setAttribute('aria-checked', 'true');
                } else {
                  ob.classList.remove('workspace-pill--active');
                  ob.setAttribute('aria-checked', 'false');
                }
              });
            }
          });
        });
      });
    });
  }

  /**
   * Synchronize active workspace pills with the route service.
   */
  function syncPillsWithRoute(resolved) {
    if (!resolved || !resolved.service) return;
    const isManaged = resolved.service.id === 'managed-office';
    const targetVal = isManaged ? 'Managed Office' : 'Coworking';

    ['lead-service', 'modal-lead-service'].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = targetVal;
    });

    ['hero-workspace-pills', 'modal-workspace-pills'].forEach(id => {
      const container = document.getElementById(id);
      if (!container) return;
      const buttons = container.querySelectorAll('.workspace-pill');
      buttons.forEach(btn => {
        const val = btn.getAttribute('data-service-value') || btn.textContent.trim();
        if (val.toLowerCase() === targetVal.toLowerCase()) {
          btn.classList.add('workspace-pill--active');
          btn.setAttribute('aria-checked', 'true');
        } else {
          btn.classList.remove('workspace-pill--active');
          btn.setAttribute('aria-checked', 'false');
        }
      });
    });
  }

  /**
   * Open the Universal Lead Modal
   * @param {object} [options] - Optional context overrides { hubName, cityName, serviceId }
   */
  function openLeadModal(options = {}) {
    const modalEl = document.getElementById('lead-modal');
    if (!modalEl) return;

    const modalTitleEl = document.getElementById('modal-form-title');
    const locationBadge = document.getElementById('modal-location-badge');
    const locationNameEl = document.getElementById('modal-location-name');
    const modalMicroMarketInput = document.getElementById('modal-lead-micromarket');

    // Dynamically adjust modal title and target location if opened from a location card
    if (options.hubName) {
      const city = options.cityName || (activeResolution ? activeResolution.city.name : 'Noida');
      if (modalTitleEl) {
        modalTitleEl.textContent = `Get Shortlist for ${options.hubName}`;
      }
      if (locationBadge && locationNameEl) {
        locationNameEl.textContent = `${options.hubName}, ${city}`;
        locationBadge.style.display = 'block';
      }
      if (modalMicroMarketInput) {
        modalMicroMarketInput.value = options.hubName;
      }
    } else {
      if (modalTitleEl) {
        modalTitleEl.textContent = 'Get Your Free Shortlist — Ready in 24 Hours';
      }
      if (locationBadge) {
        locationBadge.style.display = 'none';
      }
      if (modalMicroMarketInput) {
        modalMicroMarketInput.value = activeResolution && activeResolution.micromarket
          ? activeResolution.micromarket.name
          : '';
      }
    }

    // Pre-fill modal with any values already entered in the hero form
    const heroName = (document.getElementById('lead-name')?.value || '').trim();
    const heroPhone = (document.getElementById('lead-phone')?.value || '').trim();
    const heroEmail = (document.getElementById('lead-email')?.value || '').trim();
    const heroTeamSize = (document.getElementById('lead-teamsize')?.value || '').trim();
    const heroDecisionMaker = (document.getElementById('lead-decisionmaker')?.value || '').trim();

    const modalName = document.getElementById('modal-lead-name');
    const modalPhone = document.getElementById('modal-lead-phone');
    const modalEmail = document.getElementById('modal-lead-email');
    const modalTeamSize = document.getElementById('modal-lead-teamsize');
    const modalDecisionMaker = document.getElementById('modal-lead-decisionmaker');

    if (modalName && !modalName.value && heroName) modalName.value = heroName;
    if (modalPhone && !modalPhone.value && heroPhone) modalPhone.value = heroPhone;
    if (modalEmail && !modalEmail.value && heroEmail) modalEmail.value = heroEmail;
    if (modalTeamSize && !modalTeamSize.value && heroTeamSize) modalTeamSize.value = heroTeamSize;
    if (modalDecisionMaker && !modalDecisionMaker.value && heroDecisionMaker) modalDecisionMaker.value = heroDecisionMaker;

    // Clear any previous error styling
    ['modal-lead-name', 'modal-lead-phone', 'modal-lead-email', 'modal-lead-teamsize', 'modal-lead-decisionmaker'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('form-control--error', 'form-select--error');
      }
      const err = document.getElementById(`${id}-error`);
      if (err) {
        err.textContent = '';
        err.classList.remove('form-error-msg--visible');
      }
    });

    showFormAlert(null, true);

    modalEl.classList.add('lead-modal--open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first input field
    const nameInput = document.getElementById('modal-lead-name');
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 60);
    }
  }

  /**
   * Close the Universal Lead Modal
   */
  function closeLeadModal() {
    const modalEl = document.getElementById('lead-modal');
    if (!modalEl) return;

    modalEl.classList.remove('lead-modal--open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /**
   * Setup Modal triggers, close buttons, and keyboard handlers
   */
  function setupModalSystem() {
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.onclick = closeLeadModal;
    }

    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.onclick = closeLeadModal;
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modalEl = document.getElementById('lead-modal');
        if (modalEl && modalEl.classList.contains('lead-modal--open')) {
          closeLeadModal();
        }
      }
    });

    // Wire up all CTA elements on the page that trigger the modal
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.open-lead-modal-btn');
      if (trigger) {
        e.preventDefault();
        const hubName = trigger.getAttribute('data-hub-name');
        const cityName = trigger.getAttribute('data-hub-city');
        openLeadModal({ hubName, cityName });
      }
    });

    // Modal form submit handler
    const modalForm = document.getElementById('modal-lead-form');
    if (modalForm) {
      modalForm.onsubmit = (e) => handleFormSubmit(e, true);
    }
  }

  /**
   * Attach inline validation listeners on blur and input for all fields.
   */
  function bindFieldListeners() {
    const forms = [
      { prefix: 'lead-', isModal: false },
      { prefix: 'modal-lead-', isModal: true }
    ];

    const fields = ['fullName', 'phone', 'workEmail', 'teamSize', 'isDecisionMaker'];

    forms.forEach(({ prefix, isModal }) => {
      fields.forEach((fieldName) => {
        let inputId = `${prefix}name`;
        if (fieldName === 'phone') inputId = `${prefix}phone`;
        if (fieldName === 'workEmail') inputId = `${prefix}email`;
        if (fieldName === 'teamSize') inputId = `${prefix}teamsize`;
        if (fieldName === 'isDecisionMaker') inputId = `${prefix}decisionmaker`;

        const el = document.getElementById(inputId);
        if (!el) return;

        el.addEventListener('blur', function () {
          if (this.value || this.classList.contains('form-control--error') || this.classList.contains('form-select--error')) {
            validateField(fieldName, this.value, isModal);
          }
        });

        el.addEventListener('input', function () {
          if (this.classList.contains('form-control--error') || this.classList.contains('form-select--error')) {
            validateField(fieldName, this.value, isModal);
          }
        });

        el.addEventListener('change', function () {
          if (this.classList.contains('form-control--error') || this.classList.contains('form-select--error')) {
            validateField(fieldName, this.value, isModal);
          }
        });
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

    // Attach event listeners exactly once to prevent duplicate listeners
    if (!isFormInitialized) {
      setupWorkspacePills();
      setupModalSystem();

      const heroFormEl = document.getElementById('lead-form');
      if (heroFormEl) {
        heroFormEl.onsubmit = (e) => handleFormSubmit(e, false);
      }

      bindFieldListeners();
      isFormInitialized = true;
    }

    // Always synchronize workspace pills with active route
    syncPillsWithRoute(resolved);

    utils.logger.info(`Lead forms initialized for ${resolved.service.id} in ${resolved.city.id}.`);
  }

  // Export public form API
  root.LuxureNest.form = {
    initForm,
    openLeadModal,
    closeLeadModal,
    getFormData,
    validateCompleteForm,
    validateField,
    handleFormSubmit,
    submissionService,
    getIsSubmitting: () => isSubmitting
  };

})(typeof window !== 'undefined' ? window : this);
