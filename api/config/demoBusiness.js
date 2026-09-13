// api/config/demoBusiness.js
// Configuración de demostración.
// En el SaaS real, estos datos vendrán de la cuenta de cada negocio.

export const demoBusiness = {
  business: {
    name: 'Negocio Demo',
    description: 'Negocio de servicios que utiliza captación y venta online',
    website: '',
    sector: 'servicios'
  },

  offer: {
    name: 'Programa de acompañamiento',
    description: 'Servicio de acompañamiento personalizado para ayudar al cliente a conseguir su objetivo',
    price: null,
    currency: 'EUR',
    paymentOptions: [],
    mainResult: 'Conseguir el resultado definido por el cliente',
    cta: 'solicitar una llamada',
    bookingUrl: ''
  },

  idealClient: {
    description: 'Personas que tienen un problema concreto, quieren resolverlo y están abiertas a recibir ayuda',
    problems: [
      'No consiguen suficientes clientes',
      'Han probado diferentes estrategias sin conseguir resultados',
      'No tienen un proceso comercial claro'
    ],
    desires: [
      'Conseguir clientes de forma estable',
      'Tener un proceso comercial más predecible',
      'Dejar de depender de acciones improvisadas'
    ],
    exclusions: [
      'No tiene interés real en resolver el problema',
      'No puede asumir ninguna inversión',
      'No encaja con el servicio'
    ]
  },

  qualification: {
    requiredFields: [
      'situation',
      'problem',
      'desiredOutcome',
      'urgency',
      'previousAttempts',
      'payer',
      'budgetFit',
      'fit'
    ],

    questions: [],

    exclusionRules: [
      'No hay encaje con el servicio',
      'No existe interés real',
      'No puede asumir ninguna inversión'
    ]
  },

  personality: {
    tone: 'cercano y profesional',
    style: 'natural',
    language: 'es',
    useEmojis: false,
    maxMessageLength: 500
  },

  objections: [
    'precio',
    'presupuesto',
    'tiempo',
    'necesidad de pensarlo'
  ],

  followUp: {
    enabled: false,
    delays: [24, 48, 72]
  }
};
