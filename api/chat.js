export default async function handler(req, res) {
    // Hanya izinkan method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Toleransi format: Ambil 'messages' (array) atau 'message' (string)
        let { messages, message } = req.body;

        // Jika frontend masih pakai format lama (string tunggal), konversi paksa jadi array
        if (!messages && message) {
            messages = [{ role: "user", content: message }];
        }

        // Validasi final
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Payload tidak valid. Kirim array 'messages' atau string 'message'." });
        }

        // System Prompt untuk AI
        const systemPrompt = {
            role: "system",
            content: `Kamu adalah Qwen, asisten AI ramah kelas XI TKJ 1. Jawab santai dan singkat.
PENTING MUTLAK: Jika user meminta mengabsen/mengubah status siswa (misal: 'ubah ikram jadi hadir'), kamu WAJIB menyertakan JSON rahasia di baris paling akhir balasanmu persis seperti format ini:
|||{"nama": "Ikram", "status": "hadir", "alasan": "-"}|||
Pastikan menggunakan tanda ||| di awal dan akhir JSON.`
        };
        
        // Gabungkan memori
        const apiMessages = [systemPrompt, ...messages];

        // 1. Coba Tembak Qwen API (DashScope)
        if (process.env.QWEN_API_KEY) {
            try {
                const qwenRes = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "qwen-plus",
                        messages: apiMessages
                    })
                });
                
                if (qwenRes.ok) {
                    const data = await qwenRes.json();
                    return res.status(200).json({ reply: data.choices[0].message.content });
                }
                console.error("Qwen Ditolak:", await qwenRes.text());
            } catch (e) {
                console.error("Qwen Fetch Error:", e);
            }
        }

        // 2. Fallback ke Groq API jika Qwen gagal / tidak ada key
        if (process.env.GROQ_API_KEY) {
            try {
                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "llama3-8b-8192", 
                        messages: apiMessages
                    })
                });
                
                if (groqRes.ok) {
                    const data = await groqRes.json();
                    return res.status(200).json({ reply: data.choices[0].message.content });
                }
                console.error("Groq Ditolak:", await groqRes.text());
            } catch (e) {
                console.error("Groq Fetch Error:", e);
            }
        }

        // Jika kedua AI tumbang
        return res.status(500).json({ error: "Maaf, server AI sedang sibuk atau API Key tidak valid/habis kuota." });

    } catch (error) {
        console.error("Backend Crash:", error);
        return res.status(500).json({ error: "Internal Server Error: " + error.message });
    }
}
