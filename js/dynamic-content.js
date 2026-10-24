/**
 * Luxure Nest - Dynamic Content Engine
 * 
 * Injects resolved service, city, and micro-market configuration into
 * semantic DOM slots.
 * 
 * STRICT SECURITY:
 * - Uses utils.setText and DOM node creation.
 * - Never uses innerHTML with untrusted strings.
 * - Guarantees zero "undefined" or "[object Object]" renderings.
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  const utils = root.LuxureNest.utils;

  /**
   * Update SEO metadata in <head>.
   */
  function updateSEOMetadata(resolved) {
    if (typeof document === 'undefined') return;

    // 1. Page Title
    document.title = resolved.text.seoTitle || 'Luxure Nest | Commercial Real Estate Advisory';

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = resolved.text.seoDescription || '';

    // 3. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    canonical.href = `${currentOrigin}/${resolved.service.slug}/${resolved.city.slug}`;

    // 4. OpenGraph Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = resolved.text.seoTitle;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = resolved.text.seoDescription;
  }

  /**
   * Render Hero Section content.
   */
  function renderHero(resolved) {
    utils.setText('#hero-headline', resolved.text.heroTitle);
    utils.setText('#hero-subhead', resolved.text.heroSubtitle);
    utils.setText('#hero-service-badge', resolved.service.shortLabel);
    utils.setText('#hero-city-badge', resolved.city.name);

    // Render key value highlight bullet points
    const highlightsContainer = document.getElementById('hero-highlights-list');
    if (highlightsContainer) {
      highlightsContainer.textContent = ''; // Clear previous
      resolved.valueHighlights.forEach(text => {
        const li = document.createElement('li');
        li.className = 'hero__highlight-item';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'hero__highlight-icon';
        iconSpan.setAttribute('aria-hidden', 'true');
        iconSpan.textContent = '✓';

        const textSpan = document.createElement('span');
        textSpan.className = 'hero__highlight-text';
        textSpan.textContent = text;

        li.appendChild(iconSpan);
        li.appendChild(textSpan);
        highlightsContainer.appendChild(li);
      });
    }

    // Micro-market indicator if recognized
    const micromarketBadge = document.getElementById('hero-micromarket-badge');
    if (micromarketBadge) {
      if (resolved.micromarket) {
        micromarketBadge.textContent = `Focus Area: ${resolved.micromarket.name}`;
        micromarketBadge.style.display = 'inline-flex';
      } else {
        micromarketBadge.style.display = 'none';
      }
    }
  }

  /**
   * Render Lead Form Header and delegate form dropdown/fields initialization.
   */
  function renderLeadForm(resolved) {
    utils.setText('#form-service-badge', resolved.service.shortLabel);
    utils.setText('#form-city-badge', resolved.city.name);
    utils.setText('#form-service-name', resolved.service.singularName);
    utils.setText('#form-city-name', resolved.city.name);

    // Initialize or update complete single-view form
    if (root.LuxureNest.form && typeof root.LuxureNest.form.initForm === 'function') {
      root.LuxureNest.form.initForm(resolved);
    }
  }

  /**
   * Render Workspace Options / Service Types section placeholder.
   */
  function renderWorkspaceOptions(resolved) {
    utils.setText('#options-section-title', `${resolved.service.singularName} Options in ${resolved.city.name}`);
    utils.setText(
      '#options-section-subhead',
      `Customized space solutions suited for startups, SMEs, and large corporate enterprises across ${resolved.city.name}.`
    );

    const grid = document.getElementById('workspace-options-grid');
    if (grid) {
      grid.textContent = '';
      resolved.optionsPlaceholder.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'card card--elevated option-card';

        const badge = document.createElement('span');
        badge.className = 'badge badge--gold option-card__badge';
        badge.textContent = opt.badge;

        const heading = document.createElement('h3');
        heading.className = 'option-card__title';
        heading.textContent = opt.title;

        const p = document.createElement('p');
        p.className = 'option-card__desc';
        p.textContent = opt.description;

        const actionBtn = document.createElement('a');
        actionBtn.className = 'btn btn--outline btn--sm option-card__action';
        actionBtn.href = '#lead-form-area';
        actionBtn.textContent = 'Inquire About This';

        card.appendChild(badge);
        card.appendChild(heading);
        card.appendChild(p);
        card.appendChild(actionBtn);
        grid.appendChild(card);
      });
    }
  }

  /**
   * Render Business Hubs placeholder list for the active city.
   */
  function renderBusinessHubs(resolved) {
    utils.setText('#business-hubs-city-name', resolved.city.name);
    utils.setText(
      '#business-hubs-subhead',
      `Explore premier corporate micro-markets and commercial corridors across ${resolved.city.name}. (Approved hubs configuration placeholder).`
    );

    const list = document.getElementById('business-hubs-grid');
    if (list) {
      list.textContent = '';
      resolved.businessHubs.forEach(hub => {
        const card = document.createElement('div');
        card.className = 'card hub-card';

        const hubName = document.createElement('h3');
        hubName.className = 'hub-card__title';
        hubName.textContent = hub.name;

        const landmark = document.createElement('p');
        landmark.className = 'hub-card__landmark';
        landmark.textContent = hub.landmark;

        const link = document.createElement('a');
        link.className = 'hub-card__link';
        link.href = '#lead-form-area';
        link.textContent = `Explore ${resolved.service.shortLabel} Spaces →`;

        card.appendChild(hubName);
        card.appendChild(landmark);
        card.appendChild(link);
        list.appendChild(card);
      });
    }
  }

  /**
   * Render Expert / Team Section Foundation (Section 23).
   */
  function renderExpertTeam(resolved) {
    utils.setText('#expert-team-city-name', resolved.city.name);
    utils.setText(
      '#expert-team-heading',
      `Our CRE Experts Help You Find, Tour & Negotiate Your Workspace in ${resolved.city.name}`
    );
    utils.setText(
      '#expert-team-subhead',
      `Dedicated local commercial advisors assisting enterprise leaders and business founders with personalized site visits, lease negotiations, and legal paperwork.`
    );
    utils.setText('#expert-team-cta', `Talk to a ${resolved.city.name} CRE Expert`);
  }

  /**
   * Render Fallback Notification if an unsupported route was requested.
   */
  function renderFallbackNotice(resolved) {
    const banner = document.getElementById('route-fallback-banner');
    if (!banner) return;

    if (resolved.isFallback) {
      banner.style.display = 'block';
      utils.setText(
        '#route-fallback-message',
        `Note: The requested location or service path was not recognized. Showing default verified ${resolved.service.name} in ${resolved.city.name}.`
      );
    } else {
      banner.style.display = 'none';
    }
  }

  /**
   * Master render method: updates all dynamic components across the page.
   * @param {object} resolved - Fully resolved configuration object
   */
  function renderPage(resolved) {
    if (!resolved) {
      utils.logger.error('renderPage called with null/empty configuration.');
      return;
    }

    try {
      updateSEOMetadata(resolved);
      renderHero(resolved);
      renderLeadForm(resolved);
      renderWorkspaceOptions(resolved);
      renderBusinessHubs(resolved);
      renderExpertTeam(resolved);
      renderFallbackNotice(resolved);

      utils.logger.info(`Page rendered successfully for ${resolved.service.id} in ${resolved.city.id}.`);
    } catch (err) {
      utils.logger.error('Error during dynamic page rendering:', err);
    }
  }

  root.LuxureNest.dynamicContent = {
    renderPage,
    updateSEOMetadata
  };

})(typeof window !== 'undefined' ? window : this);
