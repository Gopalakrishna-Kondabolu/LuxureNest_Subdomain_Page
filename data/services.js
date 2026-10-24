/**
 * Luxure Nest - Services Configuration
 * 
 * Defines metadata, requirement options, copy templates, and SEO structures
 * for all supported commercial real estate service types.
 * 
 * Strict requirement: Do not invent pricing, availability, or business claims.
 */

(function (root) {
  'use strict';

  root.LuxureNest = root.LuxureNest || {};

  const SERVICES = {
    coworking: {
      id: 'coworking',
      slug: 'coworking',
      name: 'Coworking Spaces',
      singularName: 'Coworking Space',
      shortLabel: 'Coworking',
      tagline: 'Flexible Desks, Private Cabins & Collaborative Workspaces',
      heroTitleTemplate: 'Find the Right Coworking Space in {city}',
      heroSubtitleTemplate: 'Compare premium flexible workspaces, private cabins, and enterprise shared offices across prime business locations in {city}. Guided tours and zero brokerage.',
      ctaText: 'Schedule a Workspace Tour',
      secondaryCtaText: 'Explore Available Spaces',

      // Service-specific requirement options for future Step 2 form
      formRequirementOptions: [
        { id: 'hot-desk', label: 'Hot Desk', description: 'Flexible unassigned desk in open area' },
        { id: 'dedicated-desk', label: 'Dedicated Desk', description: 'Assigned fixed desk in shared zone' },
        { id: 'private-cabin', label: 'Private Cabin', description: 'Lockable sound-insulated private office' }
      ],

      // Key value pillars relevant to flexible coworking
      valueHighlights: [
        'Verified plug-and-play flexible workspaces',
        'End-to-end site visit coordination with zero brokerage',
        'Flexible month-to-month and annual commitment options'
      ],

      // Placeholder for workspace/service options section
      optionsPlaceholder: [
        {
          title: 'Hot Desks',
          description: 'Access flexible seating in high-grade collaborative workspaces with high-speed internet and business amenities.',
          badge: 'Flexible'
        },
        {
          title: 'Dedicated Desks',
          description: 'A reserved personal workspace in a premium shared environment with dedicated locker and storage.',
          badge: 'Popular'
        },
        {
          title: 'Private Cabins',
          description: 'Fully furnished, secure private office cabins for teams of 2 to 50+ members with customized access controls.',
          badge: 'Enterprise'
        }
      ],

      // SEO templates
      seo: {
        titleTemplate: 'Coworking Spaces in {city} | Verified Commercial Offices | Luxure Nest',
        metaDescriptionTemplate: 'Find and tour curated coworking spaces in {city}. Compare flexible hot desks, dedicated desks, and private cabins across prime business hubs with Luxure Nest.',
        ogTitleTemplate: 'Premium Coworking Spaces in {city} — Luxure Nest'
      }
    },

    office: {
      id: 'office',
      slug: 'office',
      name: 'Commercial & Managed Offices',
      singularName: 'Office Space',
      shortLabel: 'Office',
      tagline: 'Customized Managed Offices & Grade-A Commercial Leasing',
      heroTitleTemplate: 'Find the Right Office Space in {city}',
      heroSubtitleTemplate: 'End-to-end commercial real estate advisory for managed enterprise suites and conventional office leasing across Grade-A IT parks in {city}.',
      ctaText: 'Request Office Space Proposal',
      secondaryCtaText: 'Schedule Expert Consultation',

      // Service-specific requirement options for future Step 2 form
      formRequirementOptions: [
        { id: 'managed-office', label: 'Managed Office', description: 'Tailored turnkey office designed and operated for your team' },
        { id: 'office-leasing', label: 'Office Leasing', description: 'Conventional bare-shell or warm-shell commercial lease' }
      ],

      // Key value pillars relevant to enterprise office leasing
      valueHighlights: [
        'Grade-A IT parks and independent commercial towers',
        'Turnkey fit-out management or flexible lease terms',
        'Dedicated corporate real estate advisor to negotiate best rates'
      ],

      // Placeholder for workspace/service options section
      optionsPlaceholder: [
        {
          title: 'Managed Offices',
          description: 'Bespoke enterprise office suites customized to brand specifications, fully operated with dedicated facilities management.',
          badge: 'Turnkey'
        },
        {
          title: 'Commercial Office Leasing',
          description: 'Long-term corporate leasing options in landmark commercial towers, available in bare-shell, warm-shell, or fully fitted conditions.',
          badge: 'Long-Term'
        },
        {
          title: 'Enterprise Built-to-Suit',
          description: 'Scalable corporate headquarters and large-format floor plates customized for multinational and high-growth organizations.',
          badge: 'Bespoke'
        }
      ],

      // SEO templates
      seo: {
        titleTemplate: 'Commercial Office Space in {city} | Managed & Leased Offices | Luxure Nest',
        metaDescriptionTemplate: 'Explore Grade-A commercial office spaces for lease and managed offices in {city}. Expert advisory, tenant representation, and negotiated leasing terms with Luxure Nest.',
        ogTitleTemplate: 'Commercial Office Space & Managed Offices in {city} — Luxure Nest'
      }
    }
  };

  root.LuxureNest.services = SERVICES;

})(typeof window !== 'undefined' ? window : this);
