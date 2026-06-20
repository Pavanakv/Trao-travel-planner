// All LLM calls live here, isolated from routes/controllers, so the
// provider or model can be swapped without touching the rest of the app.

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callLLM(prompt) {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('Gemini returned no content');
  }
  return content;
}

function parseJSON(raw) {
  // Gemini often wraps JSON in markdown code fences despite instructions - strip them.
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

async function callLLMForJSON(prompt) {
  const raw = await callLLM(prompt);
  try {
    return parseJSON(raw);
  } catch (firstErr) {
    // Retry once with a stricter instruction - covers the occasional malformed
    // response without failing the whole request outright.
    const raw2 = await callLLM(
      `${prompt}\n\nIMPORTANT: Return ONLY raw JSON. No markdown code fences, no explanation, no extra text before or after.`
    );
    return parseJSON(raw2);
  }
}

export async function generateTripPlan({ destination, numDays, budgetType, interests }) {
  const prompt = `You are a travel planning assistant. Generate a complete trip plan as strict JSON.

Trip details:
- Destination: ${destination}
- Number of days: ${numDays}
- Budget level: ${budgetType} (low / medium / high)
- Interests: ${interests.length ? interests.join(', ') : 'general sightseeing'}

Return ONLY a JSON object with this exact shape, no other text:
{
  "days": [
    { "dayNumber": 1, "activities": ["activity 1", "activity 2", "activity 3"] }
  ],
  "budgetEstimate": {
    "flights": <number, USD>,
    "accommodation": <number, USD>,
    "food": <number, USD>,
    "activities": <number, USD>,
    "total": <number, USD, sum of the above>
  },
  "hotelSuggestions": [
    { "name": "<hotel name>", "tier": "Budget Friendly" | "Mid Range" | "Luxury", "note": "<one short sentence>" }
  ],
  "packingList": [
    { "item": "<packing item>", "checked": false }
  ]
}

Rules:
- "days" must have exactly ${numDays} entries, dayNumber 1 through ${numDays}.
- Each day should have 2-4 concrete, destination-specific activities (not generic placeholders).
- Budget numbers should be realistic for a ${budgetType}-budget trip to ${destination} for ${numDays} days, and "total" must equal the sum of the other four fields.
- "hotelSuggestions" must have exactly 3 entries, one per tier.
- "packingList" should have 8-12 items tailored to ${destination}'s likely climate/season and the trip's interests.`;

  const result = await callLLMForJSON(prompt);

  if (!Array.isArray(result.days) || result.days.length === 0) {
    throw new Error('LLM response missing a valid itinerary');
  }

  return result;
}

export async function regenerateDay({ destination, dayNumber, totalDays, budgetType, interests, instruction }) {
  const prompt = `You are a travel planning assistant. Regenerate a single day of an existing itinerary as strict JSON.

Context:
- Destination: ${destination}
- This is day ${dayNumber} of ${totalDays}
- Budget level: ${budgetType}
- Interests: ${interests.length ? interests.join(', ') : 'general sightseeing'}
- User's instruction for this day: "${instruction}"

Return ONLY a JSON object with this exact shape, no other text:
{
  "dayNumber": ${dayNumber},
  "activities": ["activity 1", "activity 2", "activity 3"]
}

Give 2-4 concrete, destination-specific activities that follow the user's instruction.`;

  const result = await callLLMForJSON(prompt);

  if (!Array.isArray(result.activities)) {
    throw new Error('LLM response missing valid activities');
  }

  return result;
}
