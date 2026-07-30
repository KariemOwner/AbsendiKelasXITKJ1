module.exports = async (req, res) => {
  // Hanya terima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.QWEN_API_KEY;

  if (!apiKey) {
    console.error('QWEN_API_KEY tidak ditemukan di environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah Qwen, asisten AI pintar dan ramah khusus untuk siswa dan guru kelas XI TKJ 1. Gunakan bahasa Indonesia gaul yang asik tapi tetap sopan. Jawab dengan singkat dan padat.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DashScope API Error:', response.status, errorData);
      return res.status(response.status).json({ 
        error: 'Gagal menghubungi AI service',
        details: errorData 
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa memproses permintaan Anda.';

    return res.status(200).json({ reply: aiResponse });

  } catch (error) {
    console.error('Internal Server Error:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};
