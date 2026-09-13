// engine/businessConfig.js
// Configuración de un negocio.
// El motor del Setter será independiente del negocio concreto.

export function createBusinessConfig(config = {}) {
  return {
    business: {
      name: config.business?.name || '',
      description: config.business?.description || '',
      website: config.business?.website || '',
      sector: config.business?.sector || ''
    },

    offer: {
      name: config.offer?.name || '',
      description: config.offer?.description || '',
      price: config.offer?.price || null,
      currency: config.offer?.currency || 'EUR',
      paymentOptions: config.offer?.paymentOptions || [],
      mainResult: config.offer?.mainResult || '',
      cta: config.offer?.cta || '',
      bookingUrl: config.offer?.bookingUrl || ''
    },

    idealClient: {
      description: config.idealClient?.description || '',
      problems: config.idealClient?.problems || [],
      desires: config.idealClient?.desires || [],
      exclusions: config.idealClient?.exclusions || []
    },

    qualification: {
      requiredFields: config.qualification?.requiredFields || [
        'situation',
        'problem',
        'desiredOutcome',
        'urgency',
        'previousAttempts',
        'payer',
        'budgetFit',
        'fit'
      ],

      questions: config.qualification?.questions || [],

      exclusionRules: config.qualification?.exclusionRules || []
    },

    personality: {
      tone: config.personality?.tone || 'professional',
      style: config.personality?.style || 'natural',
      language: config.personality?.language || 'es',
      useEmojis: config.personality?.useEmojis ?? false,
      maxMessageLength: config.personality?.maxMessageLength || 500
    },

    objections: config.objections || [],

    followUp: {
      enabled: config.followUp?.enabled ?? false,
      delays: config.followUp?.delays || [24, 48, 72]
    }
  };
}
