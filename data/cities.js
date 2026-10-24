/**
 * Luxure Nest - Cities Configuration
 * 
 * Defines metadata, business hub placeholders, regional context, and SEO structures
 * for all supported primary commercial real estate target markets.
 * 
 * IMPORTANT: Micro-market and business hub entries below are clearly marked
 * placeholders based on known commercial zones. Actual approved business hubs
 * will be provided and populated in Phase 2.
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  const CITIES = {
    gurugram: {
      id: 'gurugram',
      slug: 'gurugram',
      name: 'Gurugram',
      shortName: 'Gurugram',
      stateRegion: 'Haryana (NCR)',
      regionCode: 'GUR',

      // City-specific context line
      marketOverview: 'Leading corporate, tech, and financial hub featuring Grade-A commercial corridors and global MNC headquarters.',

      // Clearly marked placeholder configuration for business hubs (to be confirmed in Phase 2)
      businessHubsPlaceholder: [
        { id: 'cyber-city', name: 'DLF Cyber City', landmark: 'Rapid Metro / NH-48 Corridor' },
        { id: 'golf-course-road', name: 'Golf Course Road', landmark: 'Sector 53–54 / Metro Connected' },
        { id: 'golf-course-ext', name: 'Golf Course Ext. Road', landmark: 'Sector 58–66 / Southern Peripheral' },
        { id: 'sohna-road', name: 'Sohna Road', landmark: 'Subhash Chowk to Badshahpur Corridor' },
        { id: 'udyog-vihar', name: 'Udyog Vihar', landmark: 'Phases 1–5 / Bordering Delhi' },
        { id: 'mg-road', name: 'MG Road', landmark: 'Corporate Corridor / Yellow Line Metro' }
      ],

      // City-specific imagery placeholder path
      imagePlaceholder: {
        alt: 'Commercial business district in Gurugram',
        badge: 'Gurugram Commercial Corridor'
      },

      // Approved micro-market IDs associated with this city (populated in micromarkets.js)
      micromarketIds: ['cyber-city', 'golf-course-road', 'golf-course-ext', 'sohna-road', 'udyog-vihar'],

      // City SEO overrides/keywords
      seoKeywords: [
        'Commercial property Gurugram',
        'Office space for lease Gurgaon',
        'Shared office Cyber City',
        'Managed offices Golf Course Road'
      ]
    },

    noida: {
      id: 'noida',
      slug: 'noida',
      name: 'Noida',
      shortName: 'Noida',
      stateRegion: 'Uttar Pradesh (NCR)',
      regionCode: 'NOI',

      marketOverview: 'Rapidly expanding IT/ITES and institutional hub offering world-class infrastructure and seamless expressway connectivity.',

      // Clearly marked placeholder configuration for business hubs (to be confirmed in Phase 2)
      businessHubsPlaceholder: [
        { id: 'sector-62', name: 'Sector 62', landmark: 'Institutional Area & Electronic City Metro' },
        { id: 'sector-16', name: 'Sector 16 / Film City', landmark: 'DND Flyway & Sector 16 Metro' },
        { id: 'expressway-125', name: 'Noida Expressway (Sec 125–127)', landmark: 'Institutional Corridor near Kalindi Kunj' },
        { id: 'sector-135', name: 'Sector 135 / Expressways', landmark: 'IT-SEZ Zone & Expressway Belt' },
        { id: 'sector-142', name: 'Sector 142 / Advant Navis', landmark: 'Aqua Line Metro Hub' },
        { id: 'sector-18', name: 'Sector 18 Commercial Belt', landmark: 'Atta Market & Blue Line Station' }
      ],

      imagePlaceholder: {
        alt: 'Modern IT office towers in Noida',
        badge: 'Noida Expressway Corridor'
      },

      micromarketIds: ['sector-62', 'sector-16-film-city', 'noida-expressway', 'sector-135', 'sector-142'],

      seoKeywords: [
        'Office space for rent Noida',
        'Coworking space Sector 62 Noida',
        'Managed workspace Noida Expressway',
        'Commercial lease Noida'
      ]
    },

    delhi: {
      id: 'delhi',
      slug: 'delhi',
      name: 'Delhi',
      shortName: 'Delhi',
      stateRegion: 'National Capital Territory (NCR)',
      regionCode: 'DEL',

      marketOverview: 'Prestigious central business districts, diplomatic enclaves, and prime transit hubs with unmatched corporate visibility.',

      // Clearly marked placeholder configuration for business hubs (to be confirmed in Phase 2)
      businessHubsPlaceholder: [
        { id: 'connaught-place', name: 'Connaught Place (CP)', landmark: 'Central Business District / Rajiv Chowk' },
        { id: 'barakhamba-road', name: 'Barakhamba & Kasturba Gandhi Marg', landmark: 'CBD Commercial Corridor' },
        { id: 'aerocity', name: 'Aerocity Hospitality District', landmark: 'IGI Airport Terminal 3 / Airport Express' },
        { id: 'nehru-place', name: 'Nehru Place', landmark: 'South Delhi Commercial & Tech Hub' },
        { id: 'saket-district', name: 'Saket District Centre', landmark: 'Press Enclave Road / Select Citywalk Belt' },
        { id: 'jasola', name: 'Jasola District Centre', landmark: 'Mathura Road / Jasola Apollo Metro' }
      ],

      imagePlaceholder: {
        alt: 'Prominent commercial corporate district in Delhi',
        badge: 'Delhi Commercial District'
      },

      micromarketIds: ['connaught-place', 'barakhamba-road', 'aerocity', 'nehru-place', 'saket-district'],

      seoKeywords: [
        'Commercial office space Central Delhi',
        'Coworking space Connaught Place',
        'Grade A office Aerocity',
        'Shared office Nehru Place Delhi'
      ]
    }
  };

  root.LuxureNest.cities = CITIES;

})(typeof window !== 'undefined' ? window : this);
