// engine/scoring.js
// Calcula la calidad comercial de un lead.
// El score es independiente de la respuesta de Claude.

export function calculateLeadScore(leadState) {
  const qualification = leadState.qualification;

  let fit = 0;
  let problem = 0;
  let urgency = 0;
  let intent = 0;
  let budget = 0;

  // FIT — máximo 25 puntos
  if (qualification.fit === true) {
    fit = 25;
  } else if (
    qualification.fit !== null &&
    qualification.fit !== undefined
  ) {
    fit = 0;
  }

  // PROBLEMA — máximo 20 puntos
  if (qualification.problem) {
    problem = 20;
  }

  // URGENCIA — máximo 20 puntos
  if (qualification.urgency === 'high') {
    urgency = 20;
  } else if (qualification.urgency === 'medium') {
    urgency = 12;
  } else if (qualification.urgency === 'low') {
    urgency = 5;
  }

  // INTENCIÓN — máximo 20 puntos
  if (leadState.conversation.stage === 'CTA') {
    intent = 20;
  } else if (leadState.conversation.stage === 'QUALIFY') {
    intent = 15;
  } else if (leadState.conversation.stage === 'DEEPEN') {
    intent = 10;
  } else if (leadState.conversation.stage === 'DISCOVERY') {
    intent = 5;
  }

  // PRESUPUESTO / PAGADOR — máximo 15 puntos
  if (
    qualification.budgetFit === true &&
    qualification.payer
  ) {
    budget = 15;
  } else if (qualification.payer) {
    budget = 8;
  }

  const total =
    fit +
    problem +
    urgency +
    intent +
    budget;

  return {
    fit,
    problem,
    urgency,
    intent,
    budget,
    total
  };
}

export function getLeadStatus(score) {
  if (score >= 85) {
    return 'READY';
  }

  if (score >= 70) {
    return 'HOT';
  }

  if (score >= 50) {
    return 'QUALIFYING';
  }

  if (score >= 30) {
    return 'WARM';
  }

  return 'COLD';
}
