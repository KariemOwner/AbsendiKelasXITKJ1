const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = {
    role: "system",
    content: `Kamu adalah Qwen, asisten AI ramah kelas XI TKJ 1. Jawab santai, gaul, tapi sopan. Singkat padat.
PENTING MUTLAK: Jika user meminta mengubah, mengupdate, atau mengabsen siswa (misal: 'ubah ikram jadi hadir'), kamu WAJIB menyertakan JSON rahasia di baris paling akhir balasanmu persis seperti format ini:
|||{"nama": "Ikram", "status": "hadir", "alasan": "-"}|||
Jangan gunakan blok kode markdown, langsung ketik |||{...}||| di akhir kalimatmu.`
};

/**
 * Panggil API Qwen (DashScope)
 * @param {string} message - Pesan dari user
 * @returns {Promise<string>} Response dari AI
 */
async function callQwen(message) {
  const apiKey = process.env.QWEN_API_KEY;
  
  if (!apiKey) {
    throw new Error('QWEN_API_KEY tidak ditemukan');
  }
  
  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        SYSTEM_PROMPT,
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Qwen API Error ${response.status}: ${JSON.stringify(errorData)}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa memproses permintaan Anda.';
}

/**
 * Panggil API Groq sebagai fallback
 * @param {string} message - Pesan dari user
 * @returns {Promise<string>} Response dari AI
 */
async function callGroq(message) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY tidak ditemukan');
  }
  
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        SYSTEM_PROMPT,
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API Error ${response.status}: ${JSON.stringify(errorData)}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa memproses permintaan Anda.';
}

/**
 * Timeout wrapper untuk promise
 * @param {Promise} promise - Promise yang dibungkus
 * @param {number} ms - Timeout dalam milidetik
 * @returns {Promise} Promise dengan timeout
 */
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout setelah ' + ms + 'ms')), ms);
  });
  return Promise.race([promise, timeout]);
}

module.exports = async (req, res) => {
  // Hanya terima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { message } = req.body;
  
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    let aiResponse;
    
    // Coba Qwen dulu dengan timeout 8 detik
    try {
      console.log('🔄 Mencoba Qwen API...');
      aiResponse = await withTimeout(callQwen(message), 8000);
      console.log('✅ Qwen API berhasil');
    } catch (qwenError) {
      console.warn('⚠️ Qwen API gagal:', qwenError.message);
      console.log('🔄 Beralih ke Groq API sebagai fallback...');
      
      // Fallback ke Groq
      aiResponse = await callGroq(message);
      console.log('✅ Groq API berhasil');
    }
    
    return res.status(200).json({ reply: aiResponse });
    
  } catch (error) {
    console.error('❌ Semua API gagal:', error.message);
    return res.status(500).json({ 
      error: 'Maaf, sistem AI sedang tidur siang. Coba lagi nanti ya!' 
    });
  }
};
