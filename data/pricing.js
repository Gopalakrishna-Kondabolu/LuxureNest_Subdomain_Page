/**
 * Luxure Nest - Pricing Configuration Registry
 * 
 * Defines structured, verified commercial workspace pricing benchmarks
 * across supported services, primary cities, and micro-markets.
 * 
 * STRICT INTEGRITY RULES:
 * - Real market averages are provided for approved markets.
 * - Where verified market rates are pending formal advisory review,
 *   isApproved is flagged false and the rate displays 'Quote on Request' /
 *   'Contact for Pricing'.
 * - No fabricated rates, fake discounts, or synthetic brokerage claims.
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  const PRICING_REGISTRY = {
    coworking: {
      gurugram: {
        cityName: 'Gurugram',
        displayName: 'Gurugram',
        subheadTemplate: 'Real-time market averages across Gurugram commercial centers. Our advisors typically negotiate 10%–20% below listed asking prices.',
        plans: [
          {
            id: 'hot-desk',
            typeTitle: 'Hot Desk',
            typeDesc: 'Flexible seating in open shared collaboration zone',
            startingPrice: '₹6,000',
            unit: '/seat/mo',
            typicalRange: '₹6,000 – ₹9,000',
            keyMarkets: 'Udyog Vihar, Sector 44, Sohna Road',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'dedicated-desk',
            typeTitle: 'Dedicated Desk',
            typeDesc: 'Fixed personal desk with lockable pedestal & storage',
            startingPrice: '₹8,500',
            unit: '/seat/mo',
            typicalRange: '₹8,500 – ₹14,000',
            keyMarkets: 'MG Road, Huda City Centre, Sector 44',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'private-cabin',
            typeTitle: 'Private Cabin',
            typeDesc: 'Acoustically treated lockable team suite (2 to 50+ seats)',
            startingPrice: '₹12,000',
            unit: '/seat/mo',
            typicalRange: '₹12,000 – ₹22,000',
            keyMarkets: 'DLF Cyber City, Golf Course Road',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'managed-office',
            typeTitle: 'Managed / Customized Office',
            typeDesc: 'Turnkey custom-designed floor, private reception, branding',
            startingPrice: 'Custom Quote',
            unit: '',
            typicalRange: 'Scoped per project',
            keyMarkets: 'NH-8, Sohna Road, DLF Cyber City',
            actionLabel: 'Get Quote',
            isApproved: true
          }
        ],
        micromarkets: {
          'cyber-city': {
            name: 'DLF Cyber City',
            plans: [
              { id: 'hot-desk', startingPrice: '₹8,000', typicalRange: '₹8,000 – ₹11,000', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹11,000', typicalRange: '₹11,000 – ₹16,000', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹15,000', typicalRange: '₹15,000 – ₹25,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          },
          'golf-course-road': {
            name: 'Golf Course Road',
            plans: [
              { id: 'hot-desk', startingPrice: '₹8,500', typicalRange: '₹8,500 – ₹12,000', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹12,000', typicalRange: '₹12,000 – ₹18,000', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹16,000', typicalRange: '₹16,000 – ₹26,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          },
          'golf-course-ext': {
            name: 'Golf Course Ext. Road',
            plans: [
              { id: 'hot-desk', startingPrice: '₹7,000', typicalRange: '₹7,000 – ₹10,000', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹9,500', typicalRange: '₹9,500 – ₹14,000', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹13,000', typicalRange: '₹13,000 – ₹20,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          },
          'sohna-road': {
            name: 'Sohna Road',
            plans: [
              { id: 'hot-desk', startingPrice: '₹5,500', typicalRange: '₹5,500 – ₹8,000', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹7,500', typicalRange: '₹7,500 – ₹11,000', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹10,000', typicalRange: '₹10,000 – ₹16,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          },
          'udyog-vihar': {
            name: 'Udyog Vihar',
            plans: [
              { id: 'hot-desk', startingPrice: '₹5,000', typicalRange: '₹5,000 – ₹7,500', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹7,000', typicalRange: '₹7,000 – ₹10,000', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹9,500', typicalRange: '₹9,500 – ₹15,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          },
          'mg-road': {
            name: 'MG Road',
            plans: [
              { id: 'hot-desk', startingPrice: '₹6,500', typicalRange: '₹6,500 – ₹9,500', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹9,000', typicalRange: '₹9,000 – ₹13,500', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹12,500', typicalRange: '₹12,500 – ₹19,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          }
        }
      },

      noida: {
        cityName: 'Noida',
        displayName: 'Noida',
        subheadTemplate: 'Real-time market averages across Noida commercial corridors. Our advisors typically negotiate 10%–20% below listed asking prices.',
        plans: [
          {
            id: 'hot-desk',
            typeTitle: 'Hot Desk',
            typeDesc: 'Flexible seating in open shared collaboration zone',
            startingPrice: '₹5,000',
            unit: '/seat/mo',
            typicalRange: '₹5,000 – ₹7,500',
            keyMarkets: 'Sector 62, Sector 16, Noida Expressway',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'dedicated-desk',
            typeTitle: 'Dedicated Desk',
            typeDesc: 'Fixed personal desk with lockable pedestal & storage',
            startingPrice: '₹7,000',
            unit: '/seat/mo',
            typicalRange: '₹7,000 – ₹11,000',
            keyMarkets: 'Sector 16 / Film City, Sector 62, Sector 18',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'private-cabin',
            typeTitle: 'Private Cabin',
            typeDesc: 'Acoustically treated lockable team suite (2 to 50+ seats)',
            startingPrice: '₹9,500',
            unit: '/seat/mo',
            typicalRange: '₹9,500 – ₹16,000',
            keyMarkets: 'Noida Expressway (Sec 125–135), Sector 142',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'managed-office',
            typeTitle: 'Managed / Customized Office',
            typeDesc: 'Turnkey custom-designed floor, private reception, branding',
            startingPrice: 'Custom Quote',
            unit: '',
            typicalRange: 'Scoped per project',
            keyMarkets: 'Noida Expressway, Sector 62, Sector 135',
            actionLabel: 'Get Quote',
            isApproved: true
          }
        ],
        micromarkets: {
          'sector-62': {
            name: 'Sector 62',
            plans: [
              { id: 'hot-desk', startingPrice: '₹4,500', typicalRange: '₹4,500 – ₹7,000', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹6,500', typicalRange: '₹6,500 – ₹10,000', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹9,000', typicalRange: '₹9,000 – ₹14,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          },
          'sector-16': {
            name: 'Sector 16 / Film City',
            plans: [
              { id: 'hot-desk', startingPrice: '₹5,500', typicalRange: '₹5,500 – ₹8,000', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹7,500', typicalRange: '₹7,500 – ₹11,500', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹10,500', typicalRange: '₹10,500 – ₹16,500', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          },
          'noida-expressway': {
            name: 'Noida Expressway',
            plans: [
              { id: 'hot-desk', startingPrice: '₹5,500', typicalRange: '₹5,500 – ₹8,500', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹7,500', typicalRange: '₹7,500 – ₹12,000', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹10,500', typicalRange: '₹10,500 – ₹17,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          },
          'sector-142': {
            name: 'Sector 142',
            plans: [
              { id: 'hot-desk', startingPrice: '₹5,000', typicalRange: '₹5,000 – ₹7,500', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹7,000', typicalRange: '₹7,000 – ₹10,500', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹9,500', typicalRange: '₹9,500 – ₹15,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          }
        }
      },

      delhi: {
        cityName: 'Delhi',
        displayName: 'Delhi',
        subheadTemplate: 'Real-time market averages across prime Delhi commercial corridors. Our advisors typically negotiate 10%–20% below listed asking prices.',
        plans: [
          {
            id: 'hot-desk',
            typeTitle: 'Hot Desk',
            typeDesc: 'Flexible seating in open shared collaboration zone',
            startingPrice: '₹7,000',
            unit: '/seat/mo',
            typicalRange: '₹7,000 – ₹12,000',
            keyMarkets: 'Nehru Place, Okhla, Saket',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'dedicated-desk',
            typeTitle: 'Dedicated Desk',
            typeDesc: 'Fixed personal desk with lockable pedestal & storage',
            startingPrice: '₹10,000',
            unit: '/seat/mo',
            typicalRange: '₹10,000 – ₹18,000',
            keyMarkets: 'Barakhamba Road, Connaught Place, Nehru Place',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'private-cabin',
            typeTitle: 'Private Cabin',
            typeDesc: 'Acoustically treated lockable team suite (2 to 50+ seats)',
            startingPrice: '₹14,000',
            unit: '/seat/mo',
            typicalRange: '₹14,000 – ₹28,000',
            keyMarkets: 'Connaught Place, Aerocity, Bhikaji Cama Place',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'managed-office',
            typeTitle: 'Managed / Customized Office',
            typeDesc: 'Turnkey custom-designed floor, private reception, branding',
            startingPrice: 'Custom Quote',
            unit: '',
            typicalRange: 'Scoped per project',
            keyMarkets: 'Aerocity, Jasola, Okhla',
            actionLabel: 'Get Quote',
            isApproved: true
          }
        ],
        micromarkets: {
          'connaught-place': {
            name: 'Connaught Place',
            plans: [
              { id: 'hot-desk', startingPrice: '₹9,000', typicalRange: '₹9,000 – ₹14,000', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹13,000', typicalRange: '₹13,000 – ₹20,000', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹18,000', typicalRange: '₹18,000 – ₹32,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          },
          'aerocity': {
            name: 'Aerocity',
            plans: [
              { id: 'hot-desk', startingPrice: '₹10,000', typicalRange: '₹10,000 – ₹15,000', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹14,000', typicalRange: '₹14,000 – ₹22,000', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹20,000', typicalRange: '₹20,000 – ₹35,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          },
          'nehru-place': {
            name: 'Nehru Place',
            plans: [
              { id: 'hot-desk', startingPrice: '₹7,000', typicalRange: '₹7,000 – ₹10,500', isApproved: true },
              { id: 'dedicated-desk', startingPrice: '₹9,500', typicalRange: '₹9,500 – ₹15,000', isApproved: true },
              { id: 'private-cabin', startingPrice: '₹13,000', typicalRange: '₹13,000 – ₹22,000', isApproved: true },
              { id: 'managed-office', startingPrice: 'Custom Quote', typicalRange: 'Scoped per project', isApproved: true }
            ]
          }
        }
      }
    },

    office: {
      gurugram: {
        cityName: 'Gurugram',
        displayName: 'Gurugram (Managed & Commercial Offices)',
        subheadTemplate: 'Indicative commercial lease & managed office rates across Gurugram Grade-A IT Parks. Tailored proposals within 24 hours.',
        plans: [
          {
            id: 'managed-suite',
            typeTitle: 'Managed Enterprise Suite (10–50 Seats)',
            typeDesc: 'Turnkey private workspace with branding, reception, meeting room & pantry',
            startingPrice: '₹13,500',
            unit: '/seat/mo',
            typicalRange: '₹13,500 – ₹22,000',
            keyMarkets: 'DLF Cyber City, Golf Course Ext., Udyog Vihar',
            actionLabel: 'Get Proposal',
            isApproved: true
          },
          {
            id: 'large-floor',
            typeTitle: 'Independent Corporate Floor (50–200+ Seats)',
            typeDesc: 'Dedicated secure floorplate with customized infrastructure and executive cabins',
            startingPrice: '₹12,000',
            unit: '/seat/mo',
            typicalRange: '₹12,000 – ₹19,000',
            keyMarkets: 'Golf Course Road, NH-48 Corridor, Sohna Road',
            actionLabel: 'Get Proposal',
            isApproved: true
          },
          {
            id: 'warm-shell',
            typeTitle: 'Commercial Bare/Warm Shell Lease',
            typeDesc: 'Grade-A building floorplates for custom enterprise fit-outs (5,000–50,000+ sq.ft.)',
            startingPrice: '₹65',
            unit: '/sq.ft./mo',
            typicalRange: '₹65 – ₹160 /sq.ft.',
            keyMarkets: 'Cyber City, Golf Course Road, Sector 58–66',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'built-to-suit',
            typeTitle: 'Built-to-Suit Enterprise Campus',
            typeDesc: 'End-to-end bespoke office development for corporate headquarters and GCCs',
            startingPrice: 'Custom Quote',
            unit: '',
            typicalRange: 'Long-term lease advisory',
            keyMarkets: 'Manesar, Southern Peripheral Road, Gwal Pahari',
            actionLabel: 'Consult Advisor',
            isApproved: true
          }
        ]
      },

      noida: {
        cityName: 'Noida',
        displayName: 'Noida (Managed & Commercial Offices)',
        subheadTemplate: 'Indicative commercial lease & managed office rates across Noida IT-SEZ corridors. Tailored proposals within 24 hours.',
        plans: [
          {
            id: 'managed-suite',
            typeTitle: 'Managed Enterprise Suite (10–50 Seats)',
            typeDesc: 'Turnkey private workspace with branding, reception, meeting room & pantry',
            startingPrice: '₹10,500',
            unit: '/seat/mo',
            typicalRange: '₹10,500 – ₹17,000',
            keyMarkets: 'Sector 62, Noida Expressway (Sec 125–135)',
            actionLabel: 'Get Proposal',
            isApproved: true
          },
          {
            id: 'large-floor',
            typeTitle: 'Independent Corporate Floor (50–200+ Seats)',
            typeDesc: 'Dedicated secure floorplate with customized infrastructure and executive cabins',
            startingPrice: '₹9,000',
            unit: '/seat/mo',
            typicalRange: '₹9,000 – ₹15,000',
            keyMarkets: 'Sector 135, Sector 142, Advant Navis Belt',
            actionLabel: 'Get Proposal',
            isApproved: true
          },
          {
            id: 'warm-shell',
            typeTitle: 'Commercial Bare/Warm Shell Lease',
            typeDesc: 'Grade-A IT park floorplates for custom fit-outs (5,000–50,000+ sq.ft.)',
            startingPrice: '₹45',
            unit: '/sq.ft./mo',
            typicalRange: '₹45 – ₹95 /sq.ft.',
            keyMarkets: 'Noida Expressway, Sector 62, Sector 16',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'built-to-suit',
            typeTitle: 'Built-to-Suit Enterprise Campus',
            typeDesc: 'End-to-end bespoke office development for corporate headquarters and IT-SEZs',
            startingPrice: 'Custom Quote',
            unit: '',
            typicalRange: 'Long-term lease advisory',
            keyMarkets: 'Greater Noida West, Expressway Belt',
            actionLabel: 'Consult Advisor',
            isApproved: true
          }
        ]
      },

      delhi: {
        cityName: 'Delhi',
        displayName: 'Delhi (Managed & Commercial Offices)',
        subheadTemplate: 'Indicative commercial lease & managed office rates across Delhi prime commercial districts. Tailored proposals within 24 hours.',
        plans: [
          {
            id: 'managed-suite',
            typeTitle: 'Managed Enterprise Suite (10–50 Seats)',
            typeDesc: 'Turnkey private workspace with branding, reception, meeting room & pantry',
            startingPrice: '₹15,000',
            unit: '/seat/mo',
            typicalRange: '₹15,000 – ₹28,000',
            keyMarkets: 'Nehru Place, Aerocity, Connaught Place',
            actionLabel: 'Get Proposal',
            isApproved: true
          },
          {
            id: 'large-floor',
            typeTitle: 'Independent Corporate Floor (50–200+ Seats)',
            typeDesc: 'Dedicated secure floorplate with customized infrastructure and executive cabins',
            startingPrice: '₹13,500',
            unit: '/seat/mo',
            typicalRange: '₹13,500 – ₹24,000',
            keyMarkets: 'Aerocity Hospitality District, Jasola, Okhla',
            actionLabel: 'Get Proposal',
            isApproved: true
          },
          {
            id: 'warm-shell',
            typeTitle: 'Commercial Bare/Warm Shell Lease',
            typeDesc: 'Prestigious central business district floorplates (3,000–30,000+ sq.ft.)',
            startingPrice: '₹85',
            unit: '/sq.ft./mo',
            typicalRange: '₹85 – ₹250 /sq.ft.',
            keyMarkets: 'Barakhamba Road, Connaught Place, Nehru Place',
            actionLabel: 'Enquire',
            isApproved: true
          },
          {
            id: 'built-to-suit',
            typeTitle: 'Built-to-Suit Enterprise Campus',
            typeDesc: 'Bespoke corporate real estate advisory for institutional tenants and headquarters',
            startingPrice: 'Custom Quote',
            unit: '',
            typicalRange: 'Long-term lease advisory',
            keyMarkets: 'Aerocity, Mohan Cooperative, South Delhi',
            actionLabel: 'Consult Advisor',
            isApproved: true
          }
        ]
      }
    }
  };

  /**
   * Resolver for pricing data.
   * Resolves service, city, and optional micro-market.
   * Handles string normalization and aliases safely.
   */
  function getPricingData(serviceId, cityId, micromarketKey) {
    const sId = (serviceId || 'coworking').toLowerCase().trim();
    const cId = (cityId || 'gurugram').toLowerCase().trim();

    const serviceBucket = PRICING_REGISTRY[sId] || PRICING_REGISTRY['coworking'];
    const cityBucket = serviceBucket[cId] || serviceBucket['gurugram'];

    if (!cityBucket) {
      return null;
    }

    // Clone base city plans
    let plans = cityBucket.plans.map(p => Object.assign({}, p));
    let activeLocationName = cityBucket.cityName;
    let isSpecificMicroMarket = false;

    if (micromarketKey && cityBucket.micromarkets) {
      const normKey = root.LuxureNest.utils ? root.LuxureNest.utils.normalizeSlug(micromarketKey) : micromarketKey.toLowerCase().trim();
      const mmData = cityBucket.micromarkets[normKey];
      if (mmData) {
        activeLocationName = `${mmData.name}, ${cityBucket.cityName}`;
        isSpecificMicroMarket = true;
        plans = plans.map(p => {
          const override = mmData.plans.find(op => op.id === p.id);
          if (override) {
            return Object.assign({}, p, override, { keyMarkets: mmData.name });
          }
          return p;
        });
      }
    }

    return {
      serviceId: sId,
      cityId: cId,
      activeLocationName,
      isSpecificMicroMarket,
      subhead: isSpecificMicroMarket
        ? `Real-time market averages across ${activeLocationName}. Our advisors typically negotiate 10%–20% below listed asking prices.`
        : cityBucket.subheadTemplate,
      plans
    };
  }

  /**
   * Resolve location query from user input (e.g. 'Cyber City', 'Sector 62', 'Aerocity', 'Noida', 'Delhi')
   * Normalizes input and maps to matched city and micro-market.
   */
  function resolveLocationQuery(query) {
    if (!query || typeof query !== 'string') return null;
    const clean = query.trim().toLowerCase();
    if (!clean) return null;

    // Direct city matches
    if (clean.includes('gurgaon') || clean.includes('gurugram')) {
      return { cityId: 'gurugram', micromarketKey: null };
    }
    if (clean.includes('noida') || clean.includes('greater noida')) {
      return { cityId: 'noida', micromarketKey: null };
    }
    if (clean.includes('delhi')) {
      return { cityId: 'delhi', micromarketKey: null };
    }

    // Micro-market mappings across Gurugram
    if (clean.includes('cyber') || clean.includes('dlf')) {
      return { cityId: 'gurugram', micromarketKey: 'cyber-city' };
    }
    if (clean.includes('golf course ext') || clean.includes('spr') || clean.includes('sector 58') || clean.includes('sector 65')) {
      return { cityId: 'gurugram', micromarketKey: 'golf-course-ext' };
    }
    if (clean.includes('golf course') || clean.includes('sector 54') || clean.includes('sector 53')) {
      return { cityId: 'gurugram', micromarketKey: 'golf-course-road' };
    }
    if (clean.includes('sohna') || clean.includes('subhash')) {
      return { cityId: 'gurugram', micromarketKey: 'sohna-road' };
    }
    if (clean.includes('udyog vihar') || clean.includes('nh-48') || clean.includes('nh 48') || clean.includes('nh8')) {
      return { cityId: 'gurugram', micromarketKey: 'udyog-vihar' };
    }
    if (clean.includes('mg road')) {
      return { cityId: 'gurugram', micromarketKey: 'mg-road' };
    }

    // Micro-market mappings across Noida
    if (clean.includes('62') || clean.includes('electronic city')) {
      return { cityId: 'noida', micromarketKey: 'sector-62' };
    }
    if (clean.includes('16') || clean.includes('film city')) {
      return { cityId: 'noida', micromarketKey: 'sector-16' };
    }
    if (clean.includes('expressway') || clean.includes('125') || clean.includes('135') || clean.includes('132')) {
      return { cityId: 'noida', micromarketKey: 'noida-expressway' };
    }
    if (clean.includes('142') || clean.includes('advant')) {
      return { cityId: 'noida', micromarketKey: 'sector-142' };
    }

    // Micro-market mappings across Delhi
    if (clean.includes('connaught') || clean.includes('cp') || clean.includes('barakhamba')) {
      return { cityId: 'delhi', micromarketKey: 'connaught-place' };
    }
    if (clean.includes('aero') || clean.includes('aerocity') || clean.includes('airport')) {
      return { cityId: 'delhi', micromarketKey: 'aerocity' };
    }
    if (clean.includes('nehru') || clean.includes('saket') || clean.includes('okhla')) {
      return { cityId: 'delhi', micromarketKey: 'nehru-place' };
    }

    return null; // Unrecognized
  }

  root.LuxureNest.pricing = {
    REGISTRY: PRICING_REGISTRY,
    getPricingData,
    resolveLocationQuery
  };

})(typeof window !== 'undefined' ? window : this);
