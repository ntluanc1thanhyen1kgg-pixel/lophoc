import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with API key:', err);
  }
}

// 1. API Tạo PPCT bằng Gemini
app.post('/api/gemini/generate-ppct', async (req, res) => {
  try {
    const { topic, grade, subject } = req.body;
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured',
        items: []
      });
    }

    const prompt = `Bạn là chuyên gia giáo dục Việt Nam. Hãy tạo 4 tiết phân phối chương trình (PPCT) cho môn ${subject || 'Tin học'} lớp ${grade || '3'} theo chương trình GDPT 2018 với chủ đề: "${topic}".
Trả về duy nhất một mảng JSON (không bọc trong markdown code fence, không giải thích gì thêm) gồm các đối tượng có định dạng:
[
  {
    "grade": ${grade || 3},
    "subject": "${subject || 'Tin học'}",
    "week": 1,
    "periodIndex": 1,
    "lessonName": "Tên bài dạy chi tiết",
    "integrationNote": "Nội dung tích hợp STEM, kỹ năng sống, chuyển đổi số...",
    "notes": "Chủ đề hoặc ghi chú"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text?.trim() || '[]';
    // Remove possible markdown formatting ```json ... ```
    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

    try {
      const items = JSON.parse(cleaned);
      return res.json({ items });
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON:', cleaned);
      return res.status(500).json({ error: 'Invalid JSON response from AI', items: [] });
    }
  } catch (err: any) {
    console.error('Gemini generate-ppct error:', err);
    return res.status(500).json({ error: err?.message || 'Gemini error', items: [] });
  }
});

// 2. API Gợi ý tích hợp bằng Gemini
app.post('/api/gemini/suggest-integration', async (req, res) => {
  try {
    const { topic, grade, subject, integrationType } = req.body;
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured',
        suggestion: null
      });
    }

    const prompt = `Bạn là chuyên gia sư phạm tiểu học và trung học tại Việt Nam.
Hãy phân tích bài dạy sau và đưa ra gợi ý tích hợp ${integrationType || 'STEM/kỹ năng sống/chuyển đổi số'} chi tiết, thực tế, dễ áp dụng:
- Môn học: ${subject || 'Tin học'}
- Khối lớp: Khối ${grade || '3'}
- Tên bài dạy / chủ đề: ${topic}
Yêu cầu nội dung phản hồi gồm:
1. Mục tiêu bài học (Kiến thức, Phẩm chất, Năng lực)
2. Nội dung và hoạt động tích hợp cụ thể
3. Thiết bị dạy học và học liệu gợi ý
4. Đánh giá học sinh theo thông tư 27/2020/TT-BGDĐT.
Trình bày rõ ràng, sư phạm, chuẩn mực.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return res.json({ suggestion: response.text });
  } catch (err: any) {
    console.error('Gemini suggest-integration error:', err);
    return res.status(500).json({ error: err?.message || 'Gemini error', suggestion: null });
  }
});

// Start Server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
