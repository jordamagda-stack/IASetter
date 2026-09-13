// engine/leadState.js
// Estado estructurado de un lead.
// Este archivo NO decide todavía si el lead está cualificado.
// Solo define y mantiene la información que vamos recopilando.

export function createLeadState() {
  return {
    contact: {
      name: null,
      email: null,
      phone: null
    },

    qualification: {
      situation: null,
      problem: null,
      desiredOutcome: null,
      urgency: null,
      previousAttempts: null,
      payer: null,
      budgetFit: null,
      fit: null
    },

    conversation: {
      stage: 'NEW',
      messagesCount: 0,
      lastUserMessage: null,
      lastAgentMessage: null
    },

    score: {
      fit: 0,
      problem: 0,
      urgency: 0,
      intent: 0,
      budget: 0,
      total: 0
    },

    status: 'NEW',

    nextAction: 'START_CONVERSATION',

    flags: {
      objection: null,
      handoff: false,
      noFit: false
    }
  };
}

export function updateConversationState(
  state,
  { userMessage = null, agentMessage = null } = {}
) {
  return {
    ...state,

    conversation: {
      ...state.conversation,

      messagesCount:
        state.conversation.messagesCount +
        (userMessage ? 1 : 0),

      lastUserMessage:
        userMessage || state.conversation.lastUserMessage,

      lastAgentMessage:
        agentMessage || state.conversation.lastAgentMessage
    }
  };
}

export function calculateQualificationProgress(state) {
  const fields = Object.values(state.qualification);

  const completed = fields.filter(
    (value) => value !== null && value !== ''
  ).length;

  const total = fields.length;

  return total === 0
    ? 0
    : Math.round((completed / total) * 100);
}
