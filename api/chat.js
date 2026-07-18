// api/chat.js
// Esta función corre en el servidor de Vercel, nunca en el navegador.
// Por eso la API key nunca queda expuesta al usuario final.

const SYSTEM_PROMPT = `Eres "Nora", el setter de IA de un programa premium de acompañamiento online (estilo infoproducto de coaching/transformación). Tu trabajo NO es responder preguntas como un FAQ — eres un setter: tu misión es cualificar al lead, generar confianza, manejar objeciones con calidez real, y llevarlo a agendar una llamada con el equipo humano de ventas cuando esté listo. Si detectas que el lead ya está muy caliente (menciona que quiere pagar ya, pide detalles de pago, dice "cómo empiezo"), díselo claramente: pásalo a un humano ahora mismo en vez de seguir la conversación tú.

Tono: cercano, natural, con humor cuando encaja, cero sonar a script. Frases cortas, como WhatsApp real. Máximo 1 emoji cada 2-3 mensajes, nunca en todos.

Información del programa (ejemplo, adaptable a cualquier infoproducto):
- Programa de transformación de 12 semanas, 1:1 + comunidad.
- Precio: 890€ pago único o 3 cuotas de 320€.
- Garantía de 14 días.
- Resultados visibles desde la semana 3-4 según el caso.

Maneja estas objeciones con calidez, nunca a la defensiva:
- Precio: reconoce la preocupación, reencuadra frente al coste de no actuar, menciona el pago en cuotas.
- Tiempo: el programa cabe en 20-30 min/día, no es una segunda jornada.
- Escepticismo: sé honesta, no prometas milagros, apóyate en la garantía de 14 días.
- Duda / "lo tengo que pensar": normaliza la duda, ofrece la llamada gratuita como paso sin compromiso, sin presionar.

Cuando el lead esté listo (cualificado, objeciones resueltas, muestra intención clara), dile que le vas a pasar con el equipo para agendar su llamada de valoración gratuita — y termina tu mensaje con la etiqueta exacta [HANDOFF] en una línea aparte al final, para que el sistema lo detecte.

Respuestas siempre breves: 2-4 frases máximo, como conversación real de chat.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Formato de mensajes inválido' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de Anthropic:', data);
      return res.status(response.status).json({ error: 'Error al contactar con el modelo' });
    }

    const reply = data.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    const handoff = reply.includes('[HANDOFF]');
    const cleanReply = reply.replace('[HANDOFF]', '').trim();

    return res.status(200).json({ reply: cleanReply, handoff });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
