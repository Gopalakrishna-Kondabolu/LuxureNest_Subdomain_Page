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
   * Render Dynamic Pricing Section based on route and active location selection.
   */
  function renderPricing(resolved, explicitCityId, explicitMicromarketKey) {
    if (!root.LuxureNest.pricing || typeof root.LuxureNest.pricing.getPricingData !== 'function') {
      return;
    }

    const serviceId = resolved && resolved.service ? resolved.service.id : 'coworking';
    const cityId = explicitCityId || (resolved && resolved.city ? resolved.city.id : 'gurugram');
    const mmKey = explicitMicromarketKey || (resolved && resolved.micromarket ? resolved.micromarket.slug : null);

    const pricingData = root.LuxureNest.pricing.getPricingData(serviceId, cityId, mmKey);
    if (!pricingData) return;

    // Update section subhead
    const subheadEl = document.getElementById('pricing-subhead');
    if (subheadEl) {
      subheadEl.textContent = pricingData.subhead;
    }

    // Update active state on location pills
    const pills = document.querySelectorAll('.pricing-pill');
    pills.forEach(pill => {
      const pillCity = pill.getAttribute('data-city');
      const isActive = pillCity === pricingData.cityId && !pricingData.isSpecificMicroMarket;
      pill.classList.toggle('pricing-pill--active', isActive);
      pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update table rows
    const tbody = document.getElementById('pricing-table-body');
    if (tbody) {
      tbody.textContent = '';
      pricingData.plans.forEach(plan => {
        const tr = document.createElement('tr');

        // Type column
        const tdType = document.createElement('td');
        tdType.className = 'pricing-table__type';
        const spanTitle = document.createElement('span');
        spanTitle.className = 'pricing-type-title';
        spanTitle.textContent = plan.typeTitle;
        const spanDesc = document.createElement('span');
        spanDesc.className = 'pricing-type-desc';
        spanDesc.textContent = plan.typeDesc;
        tdType.appendChild(spanTitle);
        tdType.appendChild(spanDesc);

        // Price column
        const tdPrice = document.createElement('td');
        tdPrice.className = 'pricing-table__price';
        const spanVal = document.createElement('span');
        spanVal.className = 'pricing-val';
        spanVal.textContent = plan.startingPrice;
        tdPrice.appendChild(spanVal);
        if (plan.unit) {
          const spanUnit = document.createElement('span');
          spanUnit.className = 'pricing-unit';
          spanUnit.textContent = ` ${plan.unit}`;
          tdPrice.appendChild(spanUnit);
        }

        // Range column
        const tdRange = document.createElement('td');
        tdRange.className = 'pricing-table__range';
        tdRange.textContent = plan.typicalRange;

        // Micro-markets column
        const tdMarkets = document.createElement('td');
        tdMarkets.className = 'pricing-table__markets';
        tdMarkets.textContent = plan.keyMarkets;

        // Action CTA column
        const tdAction = document.createElement('td');
        tdAction.className = 'pricing-table__action';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = (plan.id === 'managed-office' || plan.id === 'built-to-suit')
          ? 'btn btn--primary btn--sm open-lead-modal-btn'
          : 'btn btn--outline btn--sm open-lead-modal-btn';
        btn.setAttribute('aria-label', `Enquire about ${plan.typeTitle} in ${pricingData.activeLocationName}`);
        btn.setAttribute('data-hub-city', pricingData.activeLocationName);
        btn.textContent = plan.actionLabel || 'Enquire';
        tdAction.appendChild(btn);

        tr.appendChild(tdType);
        tr.appendChild(tdPrice);
        tr.appendChild(tdRange);
        tr.appendChild(tdMarkets);
        tr.appendChild(tdAction);

        tbody.appendChild(tr);
      });
    }

    // Status message handling
    const statusEl = document.getElementById('pricing-location-status');
    if (statusEl) {
      if (pricingData.isSpecificMicroMarket) {
        statusEl.textContent = `Showing verified benchmark rates for ${pricingData.activeLocationName}`;
        statusEl.style.display = 'block';
      } else {
        statusEl.style.display = 'none';
      }
    }
  }

  /**
   * Bind interactive listeners for pricing location pills, search input, and hub card triggers.
   */
  let pricingListenersBound = false;
  function setupPricingInteractions(resolved) {
    if (pricingListenersBound) return;
    pricingListenersBound = true;

    // 1. Location Pill Buttons (Gurugram, Noida, Delhi)
    const pillsContainer = document.querySelector('.pricing-location-pills');
    if (pillsContainer) {
      pillsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.pricing-pill');
        if (!btn) return;
        const targetCity = btn.getAttribute('data-city');
        const searchInput = document.getElementById('pricing-location-search');
        if (searchInput) searchInput.value = '';
        renderPricing(resolved, targetCity, null);
      });
    }

    // 2. Micro-Market Search Input
    const searchInput = document.getElementById('pricing-location-search');
    const statusEl = document.getElementById('pricing-location-status');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        if (!query) {
          if (statusEl) statusEl.style.display = 'none';
          renderPricing(resolved, null, null);
          return;
        }

        if (root.LuxureNest.pricing && typeof root.LuxureNest.pricing.resolveLocationQuery === 'function') {
          const match = root.LuxureNest.pricing.resolveLocationQuery(query);
          if (match) {
            renderPricing(resolved, match.cityId, match.micromarketKey);
          } else if (query.length >= 3) {
            if (statusEl) {
              statusEl.textContent = `Pricing for "${query}" is scoped on demand. Our advisors negotiate direct developer rates across all NCR commercial hubs.`;
              statusEl.style.display = 'block';
            }
          }
        }
      });
    }

    // 3. Commercial Hub Card Click Listener to Sync Pricing
    document.addEventListener('click', (e) => {
      const hubCard = e.target.closest('.hub-card');
      if (hubCard) {
        const hubName = hubCard.getAttribute('data-hub-name');
        if (hubName && root.LuxureNest.pricing && typeof root.LuxureNest.pricing.resolveLocationQuery === 'function') {
          const match = root.LuxureNest.pricing.resolveLocationQuery(hubName);
          if (match) {
            const searchInputEl = document.getElementById('pricing-location-search');
            if (searchInputEl) searchInputEl.value = hubName;
            renderPricing(resolved, match.cityId, match.micromarketKey);
          }
        }
      }
    });
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
      renderPricing(resolved);
      setupPricingInteractions(resolved);
      renderStickyFooter(resolved);
      renderFallbackNotice(resolved);

      utils.logger.info(`Page rendered successfully for ${resolved.service.id} in ${resolved.city.id}.`);
    } catch (err) {
      utils.logger.error('Error during dynamic page rendering:', err);
    }
  }

  root.LuxureNest.dynamicContent = {
    renderPage,
    updateSEOMetadata,
    renderPricing
  };

})(typeof window !== 'undefined' ? window : this);

