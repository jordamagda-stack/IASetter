// engine/decision.js
// Decide cuál debe ser la siguiente acción comercial del Setter.
// Las decisiones críticas no dependen del LLM.

import { getQualificationStatus } from './qualification.js';
import { calculateLeadScore, getLeadStatus } from './scoring.js';

export function decideNextAction(leadState) {
  const qualification = getQualificationStatus(leadState);
  const score = calculateLeadScore(leadState);
  const status = getLeadStatus(score.total);

  // 1. Lead descartado
  if (leadState.flags.noFit === true) {
    return {
      action: 'NO_FIT',
      status: 'NO_FIT',
      score: score.total,
      reason: 'El lead no cumple los criterios de encaje'
    };
  }

  // 2. Handoff solicitado/activado
  if (leadState.flags.handoff === true) {
    return {
      action: 'HANDOFF',
      status: 'READY',
      score: score.total,
      reason: 'El lead está listo para pasar al equipo humano'
    };
  }

  // 3. Cualificación completa
  if (qualification.isComplete && score.total >= 85) {
    return {
      action: 'OFFER_CTA',
      status: 'READY',
      score: score.total,
      reason: 'Lead cualificado y con suficiente intención'
    };
  }

  // 4. Hay objeción activa
  if (leadState.flags.objection) {
    return {
      action: 'HANDLE_OBJECTION',
      status,
      score: score.total,
      reason: 'Existe una objeción que debe gestionarse'
    };
  }

  // 5. Falta información para cualificar
  if (!qualification.isComplete) {
    return {
      action: 'ASK_QUESTION',
      status,
      score: score.total,
      missing: qualification.missing,
      reason: 'Todavía falta información de cualificación'
    };
  }

  // 6. Cualificado pero todavía no suficientemente caliente
  if (score.total >= 70) {
    return {
      action: 'DEEPEN',
      status: 'HOT',
      score: score.total,
      reason: 'El lead encaja pero necesitamos aumentar profundidad/intención'
    };
  }

  // 7. Estado inicial
  return {
    action: 'CONTINUE',
    status,
    score: score.total,
    reason: 'Continuar conversación'
  };
}
