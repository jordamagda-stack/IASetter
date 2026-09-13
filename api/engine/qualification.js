// engine/qualification.js
// Decide qué información del lead ya tenemos
// y qué información nos falta para cualificarlo.

const REQUIRED_FIELDS = [
  'situation',
  'problem',
  'desiredOutcome',
  'urgency',
  'previousAttempts',
  'payer',
  'budgetFit',
  'fit'
];

export function getQualificationStatus(leadState) {
  const qualification = leadState.qualification;

  const completed = REQUIRED_FIELDS.filter((field) => {
    const value = qualification[field];

    return value !== null &&
           value !== undefined &&
           value !== '';
  });

  const missing = REQUIRED_FIELDS.filter((field) => {
    const value = qualification[field];

    return value === null ||
           value === undefined ||
           value === '';
  });

  const progress = Math.round(
    (completed.length / REQUIRED_FIELDS.length) * 100
  );

  return {
    progress,
    completed,
    missing,
    isComplete: missing.length === 0
  };
}

export function getNextQualificationField(leadState) {
  const status = getQualificationStatus(leadState);

  if (status.isComplete) {
    return null;
  }

  return status.missing[0];
}
