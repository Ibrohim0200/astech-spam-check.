export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'POST method required' });
  }

  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'No message provided' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Siz spam tekshiruvchi AI assistantsiz. Foydalanuvchi xabarini tahlil qilib, u SPAM (ha) yoki SPAM EMAS (yo‘q) deb faqat bitta javob bering.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0
      })
    });

    const data = await openaiRes.json();
    const gptReply = data.choices?.[0]?.message?.content?.toLowerCase();

    if (gptReply?.includes('yo‘q') || gptReply?.includes('yoq')) {
      return res.status(200).json({ ok: true, spam: false });
    } else {
      return res.status(200).json({ ok: true, spam: true });
    }

  } catch (err) {
    return res.status(500).json({ message: 'AI xatoligi', error: err.message });
  }
}
