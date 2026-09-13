// api/engine/intent.js
// Detecta la intención comercial principal del último mensaje del lead.

export const INTENTS = {
  GREETING: 'GREETING',
  QUESTION: 'QUESTION',
  INTEREST: 'INTEREST',
  DISCOVERY: 'DISCOVERY',
  OBJECTION: 'OBJECTION',
  PRICE: 'PRICE',
  URGENCY: 'URGENCY',
  BUYING_SIGNAL: 'BUYING_SIGNAL',
  NEGATIVE_SIGNAL: 'NEGATIVE_SIGNAL',
  NO_FIT: 'NO_FIT',
  READY_TO_BOOK: 'READY_TO_BOOK'
};

export function detectBasicIntent(message = '') {
  const text = message.toLowerCase().trim();

  if (!text) {
    return INTENTS.QUESTION;
  }

  // Señales de intención de compra / acción
  if (
    text.includes('quiero empezar') ||
    text.includes('quiero hacerlo') ||
    text.includes('me apunto') ||
    text.includes('cómo empiezo') ||
    text.includes('dónde me apunto') ||
    text.includes('reservar') ||
    text.includes('agendar')
  ) {
    return INTENTS.BUYING_SIGNAL;
  }

  // Precio
  if (
    text.includes('precio') ||
    text.includes('cuánto cuesta') ||
    text.includes('cuanto cuesta') ||
    text.includes('cuánto vale') ||
    text.includes('cuanto vale') ||
    text.includes('tarifa')
  ) {
    return INTENTS.PRICE;
  }

  // Objeciones
  if (
    text.includes('es caro') ||
    text.includes('muy caro') ||
    text.includes('no puedo') ||
    text.includes('no tengo dinero') ||
    text.includes('no tengo tiempo') ||
    text.includes('me lo tengo que pensar') ||
    text.includes('tengo que pensarlo') ||
    text.includes('lo tengo que consultar')
  ) {
    return INTENTS.OBJECTION;
  }

  // Señales negativas
  if (
    text.includes('no me interesa') ||
    text.includes('déjalo') ||
    text.includes('dejalo') ||
    text.includes('no quiero')
  ) {
    return INTENTS.NEGATIVE_SIGNAL;
  }

  // Saludos
  if (
    text === 'hola' ||
    text.startsWith('hola ') ||
    text === 'buenas' ||
    text.startsWith('buenas ')
  ) {
    return INTENTS.GREETING;
  }

  // Interés
  if (
    text.includes('me interesa') ||
    text.includes('me gustaría') ||
    text.includes('me gustaria') ||
    text.includes('quiero información') ||
    text.includes('quiero informacion')
  ) {
    return INTENTS.INTEREST;
  }

  return INTENTS.DISCOVERY;
}
