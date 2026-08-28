export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { prompt } = req.body || {};
  if (!prompt) { res.status(400).json({ error: 'No prompt provided' }); return; }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    const part = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part) {
      res.status(200).json({ image: part.inlineData.data, mime: part.inlineData.mimeType });
    } else {
      res.status(200).json({ error: 'No image returned', detail: data });
    }
  } catch (e) {
    res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
