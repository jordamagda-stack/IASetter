// api/engine/leadExtraction.js
// Actualiza la memoria del lead con información nueva.
// La interpretación del mensaje la hará el LLM.
// Este archivo se encarga de guardar esa información correctamente.

const QUALIFICATION_FIELDS = [
  'situation',
  'problem',
  'desiredOutcome',
  'urgency',
  'previousAttempts',
  'payer',
  'budgetFit',
  'fit'
];

export function updateLeadFromAnalysis(leadState, analysis = {}) {
  const current = leadState.qualification || {};

  const updatedQualification = {
    ...current
  };

  for (const field of QUALIFICATION_FIELDS) {
    if (
      analysis[field] !== undefined &&
      analysis[field] !== null &&
      analysis[field] !== ''
    ) {
      updatedQualification[field] = analysis[field];
    }
  }

  const updatedContact = {
    ...leadState.contact
  };

  if (analysis.name) {
    updatedContact.name = analysis.name;
  }

  if (analysis.email) {
    updatedContact.email = analysis.email;
  }

  if (analysis.phone) {
    updatedContact.phone = analysis.phone;
  }

  return {
    ...leadState,

    contact: updatedContact,

    qualification: updatedQualification
  };
}
