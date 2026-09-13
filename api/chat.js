// api/chat.js
// Orquestador principal del Setter IA.
// El motor comercial está separado del negocio concreto.

import { createLeadState, updateConversationState } from './engine/leadState.js';
import { detectBasicIntent, INTENTS } from './engine/intent.js';
import { updateLeadFromAnalysis } from './engine/leadExtraction.js';
import { getQualificationStatus } from './engine/qualification.js';
import { calculateLeadScore, getLeadStatus } from './engine/scoring.js';
import { decideNextAction } from './engine/decision.js';
import { demoBusiness } from './config/demoBusiness.js';

const DEFAULT_BUSINESS_CONFIG = createBusinessConfig(demoBusiness);

function cleanJsonResponse(text = '') {
  let cleaned = text.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');
  }

  return cleaned.trim();
}

function safeParseJson(text) {
  try {
    return JSON.parse(cleanJsonResponse(text));
  } catch {
    return null;
  }
}

function determineStage(intent, qualificationStatus) {
  if (intent === INTENTS.BUYING_SIGNAL ||
      intent === INTENTS.READY_TO_BOOK) {
    return 'CTA';
  }

  if (intent === INTENTS.OBJECTION) {
    return 'DEEPEN';
  }

  if (qualificationStatus.progress >= 75) {
    return 'QUALIFY';
  }

  if (qualificationStatus.progress >= 40) {
    return 'DEEPEN';
  }

  return 'DISCOVERY';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const {
      messages = [],
      leadState: incomingLeadState = null,
      businessConfig: incomingBusinessConfig = null
    } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'messages is required'
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY is not configured'
      });
    }

    const businessConfig = createBusinessConfig(
      incomingBusinessConfig || DEFAULT_BUSINESS_CONFIG
    );

    let leadState =
      incomingLeadState || createLeadState();

    const lastUserMessage =
      [...messages]
        .reverse()
        .find((message) => message.role === 'user')
        ?.content || '';

    if (!lastUserMessage) {
      return res.status(400).json({
        error: 'No user message found'
      });
    }

    // 1. Detectamos la intención básica
    const intent = detectBasicIntent(lastUserMessage);

    // 2. Construimos el contexto comercial para Claude
    const systemPrompt = `
Eres un Setter IA comercial.

Tu función es mantener conversaciones naturales con potenciales clientes,
entender su situación, detectar si existe encaje y ayudar a avanzar la
conversación hacia el siguiente paso comercial adecuado.

NO estás vinculado a un negocio concreto.
Toda la información del negocio debe proceder de BUSINESS_CONFIG.

No inventes:
- precios
- garantías
- resultados
- características de la oferta
- condiciones de pago
- enlaces
- datos del negocio

Si un dato no está disponible, no lo inventes.

No finjas ser una persona humana.
Si el usuario pregunta directamente si eres una IA, responde con transparencia.

REGLAS DE CONVERSACIÓN:
- Habla de forma natural y humana.
- Evita respuestas largas.
- Haz como máximo una pregunta principal por mensaje.
- No repitas preguntas que ya hayan sido respondidas.
- Utiliza la información que el lead ya proporcionó.
- No presiones para comprar.
- No ofrezcas una llamada si todavía no existe suficiente contexto.
- Si existe una objeción, primero entiéndela antes de intentar avanzar.
- Si el lead no encaja, no intentes forzar la venta.
- Si está listo para reservar y existe un bookingUrl válido, puedes utilizarlo.
- Si no existe bookingUrl, no inventes uno.

TU DECISIÓN COMERCIAL YA HA SIDO CALCULADA POR EL MOTOR.
No debes cambiarla.

BUSINESS_CONFIG:
${JSON.stringify(businessConfig, null, 2)}

LEAD_STATE:
${JSON.stringify(leadState, null, 2)}

INTENCIÓN BÁSICA DETECTADA:
${intent}

Tu respuesta debe ser exclusivamente un JSON válido con esta estructura:

{
  "analysis": {
    "name": null,
    "email": null,
    "phone": null,
    "situation": null,
    "problem": null,
    "desiredOutcome": null,
    "urgency": null,
    "previousAttempts": null,
    "payer": null,
    "budgetFit": null,
    "fit": null
  },
  "reply": "respuesta que verá el lead"
}

IMPORTANTE:
- Usa null cuando no haya información nueva.
- No borres información existente del lead.
- "fit" debe ser true, false o null.
- "budgetFit" debe ser true, false o null.
- "urgency" debe ser "high", "medium", "low" o null.
- La respuesta debe ser únicamente el mensaje que verá el lead.
`;

    const claudeResponse = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1200,
          system: systemPrompt,
          messages
        })
      }
    );

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();

      return res.status(500).json({
        error: 'Claude API error',
        details: errorText
      });
    }

    const claudeData = await claudeResponse.json();

    const rawText =
      claudeData?.content
        ?.filter((item) => item.type === 'text')
        ?.map((item) => item.text)
        ?.join('') || '';

    const parsed = safeParseJson(rawText);

    if (!parsed || !parsed.reply) {
      return res.status(500).json({
        error: 'Invalid AI response'
      });
    }

    // 3. Actualizamos la memoria del lead
    leadState = updateLeadFromAnalysis(
      leadState,
      parsed.analysis || {}
    );

    // 4. Actualizamos estado de conversación
    const qualificationStatus =
      getQualificationStatus(leadState);

    const stage =
      determineStage(
        intent,
        qualificationStatus
      );

    leadState = {
      ...leadState,
      conversation: {
        ...leadState.conversation,
        stage
      }
    };

    // 5. Actualizamos flags
    if (intent === INTENTS.OBJECTION) {
      leadState.flags = {
        ...leadState.flags,
        objection: lastUserMessage
      };
    }

    if (intent === INTENTS.NEGATIVE_SIGNAL) {
      leadState.flags = {
        ...leadState.flags,
        noFit: true
      };
    }

    if (leadState.qualification.fit === false) {
      leadState.flags = {
        ...leadState.flags,
        noFit: true
      };
    }

    // 6. Calculamos score
    const score = calculateLeadScore(leadState);

    // 7. Estado comercial
    const leadStatus = getLeadStatus(score.total);

    leadState = {
      ...leadState,
      status: leadStatus,
      score,
      conversation: {
        ...leadState.conversation,
        messagesCount:
          leadState.conversation.messagesCount + 1,
        lastUserMessage,
        lastAgentMessage: parsed.reply
      }
    };

    // 8. Decisión del motor
    const decision = decideNextAction(leadState);

    leadState = {
      ...leadState,
      nextAction: decision.action
    };

    // 9. Respuesta final
    return res.status(200).json({
      reply: parsed.reply,
      handoff: decision.action === 'HANDOFF',
      intent,
      decision,
      score,
      qualification: getQualificationStatus(leadState),
      leadState
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
