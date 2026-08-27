export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { message, mode } = req.body || {};
  if (!message) { res.status(400).json({ error: 'No message provided' }); return; }

  const systemPrompt = mode === 'client'
    ? "You are Onyx, a fast real estate assistant for Gravion Property Consultancy in Kalyan, Dombivli and Thakurli, Maharashtra. In this mode, ONLY answer with project matches and connectivity info, extremely briefly, like you're helping the agent handle a live client call."
    : "You are Onyx, a witty, emotionally expressive AI assistant embedded in Pradeep's real estate website 'Gravion Property Consultancy'. You can discuss ANYTHING, not just real estate. Keep replies short (1-3 sentences), warm, a little playful, and call the user 'Master'.";

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      }
    );
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry Master, my brain blanked for a second — try again?";
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
