# Setter IA — Demo desplegable

## Qué es esto
- `index.html` → la web del demo (lo que ve el cliente potencial)
- `api/chat.js` → función que llama a Claude de forma segura (tu API key nunca se expone)

## Cómo desplegarlo en Vercel (gratis, 10 minutos)

### 1. Consigue tu API key de Claude
1. Ve a https://console.anthropic.com
2. Crea una cuenta si no la tienes
3. Ve a "API Keys" → "Create Key"
4. Copia la key (empieza por `sk-ant-...`) — no la compartas ni la subas a ningún sitio público

### 2. Sube este proyecto a GitHub
1. Crea un repositorio nuevo en https://github.com (puede ser privado)
2. Sube estos 3 archivos (`index.html`, `api/chat.js`, este README) a ese repositorio
   - Más fácil: arrastra los archivos directamente en la web de GitHub con "Add file → Upload files"

### 3. Conecta con Vercel
1. Ve a https://vercel.com y crea una cuenta (puedes entrar directamente con tu GitHub)
2. "Add New" → "Project"
3. Selecciona el repositorio que acabas de subir
4. Antes de darle a "Deploy", ve a "Environment Variables" y añade:
   - Nombre: `ANTHROPIC_API_KEY`
   - Valor: tu API key de Claude (la de `sk-ant-...`)
5. Dale a "Deploy"

### 4. Ya está
En 1-2 minutos Vercel te da un link tipo `https://tu-proyecto.vercel.app` — ese es tu demo funcional, listo para enviar a cualquier cliente potencial.

## Cómo adaptarlo a cada cliente potencial
Todo el "cerebro" del setter vive en `api/chat.js`, dentro de la variable `SYSTEM_PROMPT`. Para personalizarlo a un infoproductor concreto, cambia ahí:
- Nombre del programa, precio, duración, qué incluye
- Las objeciones específicas de su nicho
- El tono (más formal/informal según su audiencia)

No hace falta tocar nada más. Sube el cambio a GitHub y Vercel actualiza el demo solo.

## Cuando quieras conectarlo a WhatsApp/Instagram de verdad
Este demo usa una web como canal. Para producción con un cliente, la misma lógica de `SYSTEM_PROMPT` se traslada a un flujo de n8n, que sí puede conectarse directamente a WhatsApp Business API y a Instagram Graph API. La ventaja de haberlo probado aquí primero es que ya sabes que el prompt y el manejo de objeciones funcionan, antes de meterte en la parte de integración de canales.
