import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Chaotic Classifier' });
  });

  // AI Assistant endpoint to tame turbulent thoughts & classify messy brain dumps into structured workflow steps
  app.post('/api/tame-thoughts', async (req, res) => {
    try {
      const { brainDump, projectTitle, projectType, currentSteps } = req.body;

      if (!brainDump || typeof brainDump !== 'string' || !brainDump.trim()) {
        res.status(400).json({ error: 'Please provide a thought or brain dump text to tame.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
          fallback: true
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are the core intelligence of "Chaotic Classifier" (subtitled "taming turbulent thoughts").
The user is working on a workflow for:
Project Name: ${projectTitle || 'Creative / Technical Project'}
Project Type: ${projectType || 'General Project'}

Here are existing steps in this workflow (if any):
${JSON.stringify(currentSteps || [], null, 2)}

The user provided this raw, chaotic thought / brain dump / stream of consciousness:
"""
${brainDump}
"""

Your task is to tame this turbulent thought into 1 to 5 crisp, actionable, ordered workflow steps.
Classify each step with:
1. title: Punchy, distinct step name (e.g., "Synthesize Bassline Hooks", "Write Database Migrations", "Record Vocal Stems", "Deploy Canary Release")
2. description: Clear, actionable description of what this step entails, key decisions, and tips.
3. status: One of "turbulent" (initial chaotic idea), "in_motion" (actively doing), "polished" (finished), or "parked" (hold/icebox).
4. chaosLevel: A number from 1 (crystal clear / low turbulence) to 5 (highly chaotic / experimental).
5. tag: A single concise category tag (e.g., "Ideation", "Sound Design", "Frontend", "Backend", "Arrangement", "Mixing", "Testing", "Deployment", "Review").
6. estimatedMinutes: Reasonable estimated duration in minutes.
7. notes: Array of 1-3 bullet pointers or checklist tips.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert project producer, software architect, and creative workflow director who specializes in converting chaotic, turbulent brainstorms into structured, high-momentum sequential steps.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'A 1-sentence calming summary of how the chaotic thoughts were classified.',
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    status: {
                      type: Type.STRING,
                      description: 'Must be one of: turbulent, in_motion, polished, parked',
                    },
                    chaosLevel: { type: Type.INTEGER },
                    tag: { type: Type.STRING },
                    estimatedMinutes: { type: Type.INTEGER },
                    notes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['title', 'description', 'status', 'chaosLevel', 'tag'],
                },
              },
            },
            required: ['summary', 'steps'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from model');
      }

      const parsed = JSON.parse(responseText);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/tame-thoughts:', error);
      res.status(500).json({
        error: error.message || 'Failed to tame thoughts',
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chaotic Classifier server running on http://localhost:${PORT}`);
  });
}

startServer();
