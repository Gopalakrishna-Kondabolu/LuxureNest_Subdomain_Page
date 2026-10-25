/**
 * Luxure Nest - AI-Generated Image Registry & Route-Aware Selector
 * 
 * Implements a scalable, hierarchical image selection engine:
 * Route -> Service -> City -> Micro-market -> Section -> Image Configuration
 * 
 * Strict Fallback Cascade:
 * 1. city + service + section
 * 2. service + section fallback
 * 3. city + section (location) fallback
 * 4. global section fallback
 * 5. safe ultimate fallback (guarantees zero broken images or 'undefined' URLs)
 * 
 * Authenticity & Compliance:
 * - All image descriptions adhere to tenant advisory context.
 * - Never claims AI imagery as actual physical Luxure Nest properties.
 * - Meaningful, descriptive, accessibility-compliant alt attributes.
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  /**
   * Primary Image Registry indexed by [city][service][section]
   */
  const IMAGE_REGISTRY = {
    // =========================================================================
    // 1. GURUGRAM IMAGERY
    // =========================================================================
    gurugram: {
      coworking: {
        hero: {
          src: 'assets/images/generated/gurugram/coworking/gurugram-coworking-hero.jpg',
          alt: 'Modern collaborative coworking workspace with natural daylight and ergonomic seating in Gurugram',
          caption: 'Premium Coworking Workspace • Gurugram'
        },
        workspace: {
          src: 'assets/images/generated/workspace/hot-desks.jpg',
          alt: 'Flexible hot desks and collaborative zones in Gurugram coworking facility',
          caption: 'Flexible Desks • Gurugram'
        },
        meeting: {
          src: 'assets/images/generated/workspace/private-cabin.jpg',
          alt: 'Acoustically soundproof private meeting cabin in Gurugram',
          caption: 'Private Team Cabin • Gurugram'
        },
        amenities: {
          src: 'assets/images/about/reception.png',
          alt: 'Grade-A coworking reception and concierge facilities in Gurugram',
          caption: 'Premium Hospitality Amenities'
        }
      },
      office: {
        hero: {
          src: 'assets/images/generated/gurugram/office/gurugram-office-hero.jpg',
          alt: 'Executive managed office cabins with glass architecture and natural daylight in Gurugram',
          caption: 'Managed Office Suite • Gurugram'
        },
        workspace: {
          src: 'assets/images/generated/workspace/managed-suite.jpg',
          alt: 'Turnkey enterprise managed office interior in Gurugram commercial building',
          caption: 'Turnkey Enterprise Suite • Gurugram'
        },
        meeting: {
          src: 'assets/images/generated/gurugram/office/gurugram-office-hero.jpg',
          alt: 'Executive boardroom and private cabins in Gurugram commercial tower',
          caption: 'Executive Boardroom • Gurugram'
        },
        amenities: {
          src: 'assets/images/about/reception.png',
          alt: 'Corporate entrance lobby and security infrastructure in Gurugram',
          caption: 'Corporate Infrastructure'
        }
      },
      // Micro-market specific images for Gurugram commercial hubs
      micromarkets: {
        'cyber-city': {
          src: 'assets/images/generated/locations/gurugram/cyber-city.jpg',
          alt: 'Grade-A commercial glass skyscrapers in DLF Cyber City corporate district, Gurugram',
          caption: 'DLF Cyber City, Gurugram'
        },
        'golf-course-road': {
          src: 'assets/images/generated/locations/gurugram/golf-course-road.jpg',
          alt: 'Contemporary corporate office towers along Golf Course Road, Gurugram',
          caption: 'Golf Course Road, Gurugram'
        },
        'golf-course-ext': {
          src: 'assets/images/generated/locations/gurugram/golf-course-ext.png',
          alt: 'Modern commercial developments along Golf Course Extension Road, Gurugram',
          caption: 'Golf Course Ext. Road, Gurugram'
        },
        'sohna-road': {
          src: 'assets/images/generated/locations/gurugram/sohna-road.png',
          alt: 'Corporate commercial hub along Sohna Road, Gurugram',
          caption: 'Sohna Road, Gurugram'
        },
        'udyog-vihar': {
          src: 'assets/images/generated/locations/gurugram/udyog-vihar.png',
          alt: 'Institutional IT and corporate workspace buildings in Udyog Vihar, Gurugram',
          caption: 'Udyog Vihar, Gurugram'
        },
        'mg-road': {
          src: 'assets/images/generated/locations/gurugram/mg-road.png',
          alt: 'Commercial retail and corporate office corridor along MG Road, Gurugram',
          caption: 'MG Road, Gurugram'
        }
      },
      locationFallback: {
        src: 'assets/images/locations/gurugram.png',
        alt: 'Prominent commercial business towers and corporate corridors in Gurugram',
        caption: 'Gurugram Commercial District'
      }
    },

    // =========================================================================
    // 2. NOIDA IMAGERY
    // =========================================================================
    noida: {
      coworking: {
        hero: {
          src: 'assets/images/generated/noida/coworking/noida-coworking-hero.jpg',
          alt: 'Modern coworking space with natural daylight and privacy phone booths in Noida IT corridor',
          caption: 'Collaborative Workspace • Noida'
        },
        workspace: {
          src: 'assets/images/generated/workspace/hot-desks.jpg',
          alt: 'Open collaborative work tables in modern Noida workspace facility',
          caption: 'Flexible Desks • Noida'
        },
        meeting: {
          src: 'assets/images/generated/workspace/private-cabin.jpg',
          alt: 'Sound-insulated private team cabin in Noida workspace',
          caption: 'Private Team Cabin • Noida'
        },
        amenities: {
          src: 'assets/images/about/reception.png',
          alt: 'Modern workspace reception and business lounge in Noida',
          caption: 'Modern Workspace Amenities'
        }
      },
      office: {
        hero: {
          src: 'assets/images/generated/noida/office/noida-office-hero.jpg',
          alt: 'Modern managed office floor with linear workstations and meeting pods in Noida',
          caption: 'Managed Enterprise Office • Noida'
        },
        workspace: {
          src: 'assets/images/generated/workspace/managed-suite.jpg',
          alt: 'Bespoke corporate team workstations in Noida commercial building',
          caption: 'Enterprise Team Suite • Noida'
        },
        meeting: {
          src: 'assets/images/generated/noida/office/noida-office-hero.jpg',
          alt: 'Executive meeting pod and conference area in Noida IT park',
          caption: 'Executive Meeting Pod • Noida'
        },
        amenities: {
          src: 'assets/images/about/reception.png',
          alt: 'Corporate entrance lobby and security infrastructure in Noida',
          caption: 'Corporate Infrastructure'
        }
      },
      micromarkets: {
        'sector-62': {
          src: 'assets/images/generated/locations/noida/sector-62.png',
          alt: 'Institutional IT campuses and business towers in Sector 62, Noida',
          caption: 'Sector 62, Noida'
        },
        'sector-16': {
          src: 'assets/images/generated/locations/noida/sector-16.png',
          alt: 'Commercial offices and media hub towers in Sector 16 / Film City, Noida',
          caption: 'Sector 16 / Film City, Noida'
        },
        'expressway-125': {
          src: 'assets/images/generated/locations/noida/expressway-125.jpg',
          alt: 'Grade-A corporate office towers on Noida Expressway near Sector 125/126',
          caption: 'Noida Expressway (Sec 125–127)'
        },
        'sector-135': {
          src: 'assets/images/generated/locations/noida/sector-135.jpg',
          alt: 'Patni IT-SEZ corporate campuses and modern tech facilities in Sector 135, Noida',
          caption: 'Sector 135 / Expressways, Noida'
        },
        'sector-142': {
          src: 'assets/images/generated/locations/noida/sector-142.jpg',
          alt: 'Contemporary glass commercial IT towers at Sector 142 Noida',
          caption: 'Sector 142 / Advant Navis, Noida'
        },
        'sector-18': {
          src: 'assets/images/generated/locations/noida/sector-18.png',
          alt: 'Central commercial business district and transit hub in Sector 18, Noida',
          caption: 'Sector 18 Commercial Belt, Noida'
        }
      },
      locationFallback: {
        src: 'assets/images/locations/noida.png',
        alt: 'Modern IT and commercial towers across Noida Expressway and Sector 62',
        caption: 'Noida Commercial Corridor'
      }
    },

    // =========================================================================
    // 3. DELHI IMAGERY
    // =========================================================================
    delhi: {
      coworking: {
        hero: {
          src: 'assets/images/generated/delhi/coworking/delhi-coworking-hero.jpg',
          alt: 'Upscale double-height architectural coworking space with natural daylight in Delhi',
          caption: 'Distinguished Coworking • Delhi'
        },
        workspace: {
          src: 'assets/images/generated/workspace/dedicated-desk.jpg',
          alt: 'Dedicated workspace desking in Delhi commercial center',
          caption: 'Dedicated Desks • Delhi'
        },
        meeting: {
          src: 'assets/images/generated/delhi/office/delhi-office-hero.jpg',
          alt: 'High-end meeting room overlooking green Delhi commercial district',
          caption: 'Executive Boardroom • Delhi'
        },
        amenities: {
          src: 'assets/images/about/reception.png',
          alt: 'Refined commercial reception and concierge in Delhi corporate district',
          caption: 'Hospitality Amenities'
        }
      },
      office: {
        hero: {
          src: 'assets/images/generated/delhi/office/delhi-office-hero.jpg',
          alt: 'Prestigious corporate boardroom and managed offices in Delhi commercial district',
          caption: 'Enterprise Corporate Office • Delhi'
        },
        workspace: {
          src: 'assets/images/generated/workspace/managed-suite.jpg',
          alt: 'Custom turnkey managed office reception and team zone in Delhi',
          caption: 'Managed Office Suite • Delhi'
        },
        meeting: {
          src: 'assets/images/generated/delhi/office/delhi-office-hero.jpg',
          alt: 'Soundproof conference boardroom with large windows in Delhi corporate district',
          caption: 'Conference Boardroom • Delhi'
        },
        amenities: {
          src: 'assets/images/about/reception.png',
          alt: 'Prestigious corporate entrance lobby in Delhi commercial tower',
          caption: 'Corporate Infrastructure'
        }
      },
      micromarkets: {
        'connaught-place': {
          src: 'assets/images/generated/locations/delhi/connaught-place.png',
          alt: 'Iconic Central Business District commercial colonnades in Connaught Place, Delhi',
          caption: 'Connaught Place (CP), Delhi'
        },
        'barakhamba-road': {
          src: 'assets/images/generated/locations/delhi/barakhamba-road.jpg',
          alt: 'Statesman House architectural commercial skyscraper along Barakhamba Road, Central Delhi',
          caption: 'Barakhamba Road, Delhi'
        },
        'aerocity': {
          src: 'assets/images/generated/locations/delhi/aerocity.jpg',
          alt: 'Worldmark commercial corporate buildings in Aerocity Hospitality District, Delhi',
          caption: 'Aerocity Hospitality District, Delhi'
        },
        'nehru-place': {
          src: 'assets/images/generated/locations/delhi/nehru-place.png',
          alt: 'Major commercial and financial commercial center in Nehru Place, South Delhi',
          caption: 'Nehru Place, South Delhi'
        },
        'saket-district': {
          src: 'assets/images/generated/locations/delhi/saket-district.jpg',
          alt: 'Select Citywalk and Grade-A commercial office complex at Saket District Centre, South Delhi',
          caption: 'Saket District Centre, South Delhi'
        },
        'jasola': {
          src: 'assets/images/generated/locations/delhi/jasola.jpg',
          alt: 'US Complex commercial business towers at Jasola District Centre, South Delhi',
          caption: 'Jasola District Centre, Delhi'
        }
      },
      locationFallback: {
        src: 'assets/images/locations/delhi.png',
        alt: 'Prestigious commercial office architecture in Delhi business districts',
        caption: 'Delhi Central Business District'
      }
    },

    // =========================================================================
    // 4. SERVICE-LEVEL FALLBACKS
    // =========================================================================
    serviceFallbacks: {
      coworking: {
        hero: {
          src: 'assets/images/generated/gurugram/coworking/gurugram-coworking-hero.jpg',
          alt: 'Premium flexible coworking space in Delhi NCR',
          caption: 'Premium Coworking Workspace'
        },
        workspace: {
          src: 'assets/images/generated/workspace/hot-desks.jpg',
          alt: 'Modern flexible desks in collaborative workspace',
          caption: 'Flexible Desks'
        },
        options: [
          {
            title: 'Hot Desks',
            src: 'assets/images/generated/workspace/hot-desks.jpg',
            alt: 'Hot desk workstation in open collaborative workspace with daylight'
          },
          {
            title: 'Dedicated Desks',
            src: 'assets/images/generated/workspace/dedicated-desk.jpg',
            alt: 'Dedicated personal desk with ergonomic chair and secure storage'
          },
          {
            title: 'Private Cabins',
            src: 'assets/images/generated/workspace/private-cabin.jpg',
            alt: 'Private team office cabin with sound-insulated glass partition'
          }
        ]
      },
      office: {
        hero: {
          src: 'assets/images/generated/gurugram/office/gurugram-office-hero.jpg',
          alt: 'Custom managed corporate office in Delhi NCR',
          caption: 'Managed Corporate Office'
        },
        workspace: {
          src: 'assets/images/generated/workspace/managed-suite.jpg',
          alt: 'Turnkey enterprise managed suite with contemporary furnishings',
          caption: 'Managed Enterprise Suite'
        },
        options: [
          {
            title: 'Managed Offices',
            src: 'assets/images/generated/workspace/managed-suite.jpg',
            alt: 'Turnkey managed office suite customized for enterprise teams'
          },
          {
            title: 'Commercial Office Leasing',
            src: 'assets/images/generated/gurugram/office/gurugram-office-hero.jpg',
            alt: 'Grade-A commercial office space for long-term lease'
          },
          {
            title: 'Enterprise Built-to-Suit',
            src: 'assets/images/generated/delhi/office/delhi-office-hero.jpg',
            alt: 'Enterprise built-to-suit commercial office floor plate'
          }
        ]
      }
    },

    // =========================================================================
    // 5. GLOBAL SECTION FALLBACKS
    // =========================================================================
    globalSections: {
      hero: {
        src: 'assets/images/generated/gurugram/coworking/gurugram-coworking-hero.jpg',
        alt: 'Curated premium commercial workspace in Delhi NCR',
        caption: 'Commercial Real Estate Advisory'
      },
      workspace: {
        src: 'assets/images/generated/workspace/hot-desks.jpg',
        alt: 'Contemporary commercial office workspace in Delhi NCR',
        caption: 'Commercial Workspaces'
      },
      amenities: {
        src: 'assets/images/about/reception.png',
        alt: 'Grade-A corporate reception and workspace hospitality amenities',
        caption: 'Enterprise Amenities'
      },
      whyUs: {
        src: 'assets/images/about/why-luxure-nest.png',
        alt: 'Luxure Nest tenant representation and commercial lease advisory',
        caption: 'Tenant-First CRE Advisory'
      },
      finalCta: {
        src: 'assets/images/about/footer-architecture.png',
        alt: 'Landmark commercial office tower and business district architecture',
        caption: 'Find Your Ideal Workspace'
      }
    }
  };

  /**
   * Resolves the most appropriate image asset based on route parameters.
   * 
   * Multi-tier resolution:
   * 1. city + service + section
   * 2. service + section fallback
   * 3. city + section (location) fallback
   * 4. global section fallback
   * 5. safe ultimate fallback
   * 
   * @param {object} params
   * @param {string} [params.cityId]
   * @param {string} [params.serviceId]
   * @param {string} [params.section] - 'hero' | 'workspace' | 'meeting' | 'amenities' | 'whyUs' | 'finalCta' | 'location'
   * @param {string} [params.micromarketSlug]
   * @returns {{ src: string, alt: string, caption: string }}
   */
  function getImage({ cityId = '', serviceId = '', section = 'hero', micromarketSlug = '' } = {}) {
    const normCity = (cityId || '').toLowerCase().trim();
    const normService = (serviceId || '').toLowerCase().trim();
    const normSection = (section || 'hero').toLowerCase().trim();
    const normMicro = (micromarketSlug || '').toLowerCase().trim();

    // 0. Micro-market specific lookup if requested
    if (
      normMicro &&
      IMAGE_REGISTRY[normCity] &&
      IMAGE_REGISTRY[normCity].micromarkets &&
      IMAGE_REGISTRY[normCity].micromarkets[normMicro]
    ) {
      return IMAGE_REGISTRY[normCity].micromarkets[normMicro];
    }

    // 1. City + Service + Section
    if (
      IMAGE_REGISTRY[normCity] &&
      IMAGE_REGISTRY[normCity][normService] &&
      IMAGE_REGISTRY[normCity][normService][normSection]
    ) {
      return IMAGE_REGISTRY[normCity][normService][normSection];
    }

    // 2. Service + Section Fallback
    if (
      IMAGE_REGISTRY.serviceFallbacks[normService] &&
      IMAGE_REGISTRY.serviceFallbacks[normService][normSection]
    ) {
      return IMAGE_REGISTRY.serviceFallbacks[normService][normSection];
    }

    // 3. City + Section Fallback (e.g. location cards)
    if (
      normSection === 'location' &&
      IMAGE_REGISTRY[normCity] &&
      IMAGE_REGISTRY[normCity].locationFallback
    ) {
      return IMAGE_REGISTRY[normCity].locationFallback;
    }

    // 4. Global Section Fallback
    if (IMAGE_REGISTRY.globalSections[normSection]) {
      return IMAGE_REGISTRY.globalSections[normSection];
    }

    // 5. Safe Ultimate Fallback (Never returns broken URL or undefined)
    return {
      src: 'assets/images/generated/gurugram/coworking/gurugram-coworking-hero.jpg',
      alt: 'Premium commercial workspace advisory in Delhi NCR',
      caption: 'Luxure Nest Commercial Real Estate'
    };
  }

  /**
   * Retrieves workspace option card image by service and option index.
   * @param {string} serviceId
   * @param {number} optionIndex
   * @returns {{ src: string, alt: string }}
   */
  function getWorkspaceOptionImage(serviceId, optionIndex = 0) {
    const normService = (serviceId || 'coworking').toLowerCase().trim();
    const serviceSet = IMAGE_REGISTRY.serviceFallbacks[normService] || IMAGE_REGISTRY.serviceFallbacks.coworking;
    const options = serviceSet.options || [];

    if (options[optionIndex]) {
      return options[optionIndex];
    }

    // Fallback if index out of bounds
    return {
      src: 'assets/images/generated/workspace/hot-desks.jpg',
      alt: 'Commercial workspace solution'
    };
  }

  /**
   * Retrieves business hub card image by city and micro-market ID.
   * @param {string} cityId
   * @param {string} hubId
   * @returns {{ src: string, alt: string, caption: string }}
   */
  function getBusinessHubImage(cityId, hubId = '') {
    const normCity = (cityId || '').toLowerCase().trim();
    const normHub = (hubId || '').toLowerCase().trim();

    // Check if city has a dedicated image for this micro-market hub
    if (
      IMAGE_REGISTRY[normCity] &&
      IMAGE_REGISTRY[normCity].micromarkets &&
      IMAGE_REGISTRY[normCity].micromarkets[normHub]
    ) {
      return IMAGE_REGISTRY[normCity].micromarkets[normHub];
    }

    // Fallback to city location image
    if (IMAGE_REGISTRY[normCity] && IMAGE_REGISTRY[normCity].locationFallback) {
      return IMAGE_REGISTRY[normCity].locationFallback;
    }

    // Global fallback
    return {
      src: 'assets/images/generated/locations/gurugram/cyber-city.jpg',
      alt: 'Commercial corporate business hub',
      caption: 'Commercial Business Hub'
    };
  }

  /**
   * Retrieves prominent city landmark image for Why Luxure Nest section.
   * e.g., India Gate for Delhi, DLF Cyber City for Gurugram, Noida Expressway for Noida.
   * @param {string} cityId
   * @returns {{ src: string, alt: string, caption: string }}
   */
  function getWhyUsLandmarkImage(cityId) {
    const normCity = (cityId || '').toLowerCase().trim();
    const landmarks = {
      delhi: {
        src: 'assets/images/landmarks/delhi-india-gate.jpg',
        alt: 'Iconic India Gate monument in New Delhi',
        caption: 'New Delhi Landmark • India Gate'
      },
      gurugram: {
        src: 'assets/images/landmarks/gurugram-cyber-city.jpg',
        alt: 'DLF Cyber City and modern commercial skyline in Gurugram',
        caption: 'Gurugram Skyline • Cyber City'
      },
      noida: {
        src: 'assets/images/landmarks/noida-expressway-skyline.jpg',
        alt: 'Noida Expressway modern corporate towers and expressway corridor',
        caption: 'Noida Commercial Corridor'
      }
    };
    return landmarks[normCity] || landmarks.gurugram;
  }

  root.LuxureNest.images = {
    registry: IMAGE_REGISTRY,
    getImage,
    getWorkspaceOptionImage,
    getBusinessHubImage,
    getWhyUsLandmarkImage
  };

})(typeof window !== 'undefined' ? window : this);
