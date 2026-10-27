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

    // 5. OpenGraph Image Tag (Route-aware)
    if (root.LuxureNest.images && typeof root.LuxureNest.images.getImage === 'function') {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      const heroImageObj = root.LuxureNest.images.getImage({
        cityId: resolved.city.id,
        serviceId: resolved.service.id,
        section: 'hero',
        micromarketSlug: resolved.micromarket ? resolved.micromarket.slug : ''
      });
      if (heroImageObj && heroImageObj.src) {
        ogImage.content = `${currentOrigin}/${heroImageObj.src}`;
      }
    }
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

    // Render Route-Aware Primary Hero Section Background
    const heroSection = document.getElementById('hero');
    if (heroSection && root.LuxureNest.images && typeof root.LuxureNest.images.getImage === 'function') {
      const heroImg = root.LuxureNest.images.getImage({
        cityId: resolved.city.id,
        serviceId: resolved.service.id,
        section: 'hero',
        micromarketSlug: resolved.micromarket ? resolved.micromarket.slug : ''
      });

      if (heroImg && heroImg.src) {
        heroSection.style.backgroundImage = `url("${heroImg.src}")`;
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
   * Render Brand Network section (Attachment 2).
   */
  function renderBrandNetwork(resolved) {
    const serviceLabel = resolved.service.singularName ? resolved.service.singularName.toLowerCase() : 'coworking';
    utils.setText(
      '#brand-network-headline',
      `Leading ${serviceLabel} operators in ${resolved.city.name}. One enquiry away.`
    );
  }

  /**
   * Render Business Hubs list with route-aware micro-market & city imagery.
   */
  function renderBusinessHubs(resolved) {
    utils.setText('#business-hubs-city-name', resolved.city.name);

    const list = document.getElementById('business-hubs-grid');
    if (list) {
      list.textContent = '';
      resolved.businessHubs.forEach(hub => {
        const card = document.createElement('div');
        card.className = 'card hub-card hub-card--clickable open-lead-modal-btn';
        card.setAttribute('data-hub-name', hub.name);
        card.setAttribute('data-hub-city', resolved.city.name);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Explore workspaces in ${hub.name}, ${resolved.city.name}`);

        // Add visual hub/micro-market image
        if (root.LuxureNest.images && typeof root.LuxureNest.images.getBusinessHubImage === 'function') {
          const hubImg = root.LuxureNest.images.getBusinessHubImage(resolved.city.id, hub.id);
          if (hubImg) {
            const imgWrap = document.createElement('div');
            imgWrap.className = 'hub-card__image-wrap';

            const imgEl = document.createElement('img');
            imgEl.className = 'hub-card__img';
            imgEl.src = hubImg.src;
            imgEl.alt = hubImg.alt || hub.name;
            imgEl.loading = 'lazy';
            imgEl.width = 400;
            imgEl.height = 250;

            imgWrap.appendChild(imgEl);
            card.appendChild(imgWrap);
          }
        }

        const body = document.createElement('div');
        body.className = 'hub-card__body';

        const hubName = document.createElement('h3');
        hubName.className = 'hub-card__title';
        hubName.textContent = hub.name;

        const landmark = document.createElement('p');
        landmark.className = 'hub-card__landmark';
        landmark.textContent = hub.landmark;

        const link = document.createElement('span');
        link.className = 'hub-card__link';
        link.textContent = `Explore ${resolved.service.shortLabel} Spaces →`;

        body.appendChild(hubName);
        body.appendChild(landmark);
        body.appendChild(link);
        card.appendChild(body);

        // Click & keyboard handlers to open customized location modal
        const triggerLocationModal = () => {
          if (root.LuxureNest.form && typeof root.LuxureNest.form.openLeadModal === 'function') {
            root.LuxureNest.form.openLeadModal({
              hubName: hub.name,
              cityName: resolved.city.name,
              serviceId: resolved.service.id
            });
          }
        };

        card.addEventListener('click', triggerLocationModal);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerLocationModal();
          }
        });

        list.appendChild(card);
      });
    }
  }

  /**
   * Render Expert / Team Section Foundation (Attachment 3).
   */
  function renderExpertTeam(resolved) {
    utils.setText('#expert-team-heading', 'Our Experts are eager to help you!');
    utils.setText(
      '#expert-team-subhead',
      `Our team has helped more than 10,000 businesses & professionals find their perfect office across ${resolved.city.name}. Our experts will help you with:`
    );
  }

  /**
   * Render Why Luxure Nest Section (Attachment 4).
   */
  function renderWhyLuxureNest(resolved) {
    if (typeof document !== 'undefined') {
      const cityEls = document.querySelectorAll('.why-city-target');
      cityEls.forEach(el => {
        el.textContent = resolved.city.name;
      });

      // Update landmark image dynamically based on city
      const landmarkImg = document.getElementById('why-us-landmark-img');
      if (landmarkImg && root.LuxureNest.images && typeof root.LuxureNest.images.getWhyUsLandmarkImage === 'function') {
        const landmark = root.LuxureNest.images.getWhyUsLandmarkImage(resolved.city.id);
        if (landmark && landmark.src) {
          landmarkImg.src = landmark.src;
          landmarkImg.alt = landmark.alt || `${resolved.city.name} Commercial Landmark`;
        }
      }

      // Update CTA banner city target
      const ctaCityEls = document.querySelectorAll('.process-cta-city');
      ctaCityEls.forEach(el => {
        el.textContent = resolved.city.name;
      });
    }
  }

  /**
   * Render Fallback Notification (disabled so default note never appears).
   */
  function renderFallbackNotice(resolved) {
    const banner = document.getElementById('route-fallback-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  /**
   * Render Sticky Bottom Footer Bar text dynamically based on resolved location.
   */
  function renderStickyFooter(resolved) {
    const textEl = document.getElementById('sticky-footer-text');
    if (!textEl || !resolved || !resolved.city) return;
    textEl.textContent = `Book a Free Workspace Consult in ${resolved.city.name} & Unlock Zero Brokerage Rates!`;
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
      renderBrandNetwork(resolved);
      renderExpertTeam(resolved);
      renderBusinessHubs(resolved);
      renderWhyLuxureNest(resolved);
      renderStickyFooter(resolved);
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
