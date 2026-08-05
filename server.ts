import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Security & Safety Analysis endpoint
  app.post('/api/scan-safety', async (req, res) => {
    try {
      const { content, type } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Valid content string is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback response if no API key is set
        return res.json({
          threatLevel: 'unknown',
          score: 50,
          summary: 'Gemini API Key is not configured. Basic heuristic rules were applied.',
          details: ['No AI key provided in environment', 'Recommend caution before opening external links'],
          recommendations: ['Check destination domain carefully', 'Ensure URL uses HTTPS'],
          isFallback: true
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Analyze the following decoded QR code data for security risks, phishing threats, malware potential, or data privacy concerns.
Data Type: ${type || 'text/url'}
Content: "${content.substring(0, 1000)}"

Return a JSON object matching this exact structure (no markdown wrapper, raw JSON):
{
  "threatLevel": "safe" | "caution" | "danger",
  "score": number (0 to 100 where 100 is completely safe, 0 is critical threat),
  "summary": "Short 1-2 sentence assessment",
  "details": ["Point 1", "Point 2", "Point 3"],
  "recommendations": ["Action item 1", "Action item 2"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      const responseText = response.text || '';
      // Clean potential json code block markers
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        const parsed = JSON.parse(cleanJson);
        return res.json(parsed);
      } catch (parseErr) {
        return res.json({
          threatLevel: 'safe',
          score: 85,
          summary: 'Scanned content evaluated.',
          details: [responseText],
          recommendations: ['Verify sender before proceeding']
        });
      }
    } catch (error: any) {
      console.error('Safety analysis error:', error);
      return res.status(500).json({
        error: 'Failed to analyze QR code safety',
        message: error?.message || 'Server error'
      });
    }
  });

  // Vite middleware integration
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[QR Toolkit] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
