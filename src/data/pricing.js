export const pricingConfig = {
  minimumTripFee: 0,
  services: {
    lawn_maintenance: {
      label: 'Lawn maintenance',
      base: 95,
    },
    mulch_bed_refresh: {
      label: 'Mulch / bed refresh',
      base: 260,
    },
    property_cleanup: {
      label: 'Property cleanup',
      base: 180,
    },
    trimming_brush_work: {
      label: 'Trimming / brush work',
      base: 145,
    },
    property_maintenance: {
      label: 'Property maintenance',
      base: 155,
    },
    custom_outdoor_jobs: {
      label: 'Custom outdoor jobs',
      base: 180,
    },
  },
  propertySizes: {
    small: {
      label: 'Small yard',
      adjustment: 0,
    },
    medium: {
      label: 'Medium yard',
      adjustment: 55,
    },
    large: {
      label: 'Large yard',
      adjustment: 120,
    },
    extra_large_heavy: {
      label: 'Extra large / heavy',
      adjustment: 240,
    },
  },
  conditions: {
    normal: {
      label: 'Normal condition',
      adjustment: 0,
    },
    overgrown: {
      label: 'Overgrown',
      adjustment: 75,
    },
    heavy_cleanup: {
      label: 'Heavy cleanup',
      adjustment: 175,
    },
  },
  urgency: {
    flexible: {
      label: 'Flexible timeline',
      adjustment: 0,
    },
    this_week: {
      label: 'This week',
      adjustment: 45,
    },
    urgent: {
      label: 'ASAP / urgent',
      adjustment: 95,
    },
  },
  addons: {
    haulAway: {
      label: 'Haul-away / disposal',
      adjustment: 65,
    },
    curbEdges: {
      label: 'Extra curb or bed edging',
      adjustment: 45,
    },
    brushPile: {
      label: 'Brush pile or limb cleanup',
      adjustment: 85,
    },
    recurringSetup: {
      label: 'Recurring maintenance setup',
      adjustment: 0,
    },
  },
};

export function calculateEstimate(input) {
  const service = pricingConfig.services[input.serviceType] ?? pricingConfig.services.lawn_maintenance;
  const propertySize = pricingConfig.propertySizes[input.propertySize] ?? pricingConfig.propertySizes.small;
  const condition = pricingConfig.conditions[input.condition] ?? pricingConfig.conditions.normal;
  const urgency = pricingConfig.urgency[input.urgency] ?? pricingConfig.urgency.flexible;
  const selectedAddons = Array.isArray(input.addons) ? input.addons : [];

  const addonTotal = selectedAddons.reduce((total, addonKey) => {
    const addon = pricingConfig.addons[addonKey];
    return total + (addon?.adjustment ?? 0);
  }, 0);

  const low = Math.max(
    pricingConfig.minimumTripFee,
    service.base + propertySize.adjustment + condition.adjustment + urgency.adjustment + addonTotal,
  );
  const high = Math.round(low + Math.max(45, low * 0.35));

  return {
    low,
    high,
    serviceLabel: service.label,
    propertySizeLabel: propertySize.label,
    conditionLabel: condition.label,
    urgencyLabel: urgency.label,
    addonLabels: selectedAddons
      .map((addonKey) => pricingConfig.addons[addonKey]?.label)
      .filter(Boolean),
  };
}
