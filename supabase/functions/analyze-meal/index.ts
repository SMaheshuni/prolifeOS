// Edge Function: analyze-meal
// Receives a base64 data URL, calls OpenAI Vision, returns { name, calories }.
// The OPENAI_API_KEY lives only here (server-side secret), never in the browser.
// JWT verification is on by default — only authenticated users can call this.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

const SYSTEM_PROMPT =
  'You identify food in photos and estimate calories for the visible portion. ' +
  'Respond ONLY with JSON: { "name": string, "calories": integer }. ' +
  'Use a short dish name (1-5 words, no flavour adjectives). ' +
  'Calories must be the total kcal for the visible portion.'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return json({ error: 'Server not configured' }, 500)

  let image: unknown
  try {
    const body = await req.json()
    image = body?.image
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    return json({ error: 'Invalid image' }, 400)
  }

  let openaiResponse: Response
  try {
    openaiResponse = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'What is in this image and how many calories?' },
              { type: 'image_url', image_url: { url: image, detail: 'low' } },
            ],
          },
        ],
      }),
    })
  } catch {
    return json({ error: 'Vision request failed' }, 502)
  }

  if (!openaiResponse.ok) return json({ error: 'Vision request failed' }, 502)

  const data = await openaiResponse.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) return json({ error: 'Empty vision response' }, 502)

  let parsed: { name?: unknown; calories?: unknown }
  try {
    parsed = JSON.parse(content)
  } catch {
    return json({ error: 'Could not parse meal' }, 502)
  }

  const name = typeof parsed.name === 'string' ? parsed.name.trim() : ''
  const calories = Number(parsed.calories)
  if (!name || !Number.isFinite(calories)) {
    return json({ error: 'Could not parse meal' }, 502)
  }

  return json({ name, calories: Math.round(calories) })
})
