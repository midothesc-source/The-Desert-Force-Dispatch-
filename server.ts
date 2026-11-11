import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));

// Shared Gemini Client
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * AI-Powered Mission Briefs generation route
 */
app.post('/api/brief', async (req: Request, res: Response) => {
  try {
    const { operative } = req.body;

    if (!operative || !operative.name) {
      return res.status(400).json({ error: 'Operative dossier payload is required' });
    }

    if (!geminiClient && !process.env.GEMINI_API_KEY) {
      // Return high-grade heuristic fallback when no key is configured
      return res.json({
        brief: generateTacticalFallbackBrief(operative),
        source: 'tactical-heuristics',
      });
    }

    const ai = geminiClient || new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const missionPrompt = `You are the High Intelligence AI for "The Desert Force Dispatch" — a tactical relationship intelligence command center operating under the signature creed: "Follow My Path Or Feel My Wrath."

Operative Dossier:
- Name: ${operative.name}
- Codename: ${operative.codename}
- Faction: ${operative.faction}
- Current Status: ${operative.status}
- Allegiance Level: ${operative.allegiance}
- Clearance Level: ${operative.clearanceLevel}
- Role: ${operative.role}
- Organization: ${operative.organization || 'Independent'}
- Relationship Health: ${operative.relationshipHealth}/100
- Lore & Background: ${operative.lore}
- Tags: ${(operative.tags || []).join(', ')}
- Past Mission Logs count: ${(operative.missionLogs || []).length}
- Recent Logs: ${JSON.stringify(
      (operative.missionLogs || []).slice(0, 3).map((l: any) => ({
        date: l.date,
        type: l.type,
        summary: l.summary,
        outcome: l.outcome,
      }))
    )}

Generate a classified Tactical Pre-Engagement Mission Brief in valid JSON format matching this exact JSON schema:
{
  "tacticalSummary": "A concise, razor-sharp 2-3 sentence situation assessment and psychological / operational posture of the contact.",
  "strategicObjectives": ["3-4 clear, actionable tactical goals before or during communication."],
  "leveragePoints": ["2-3 key leverage points, sensibilities, or mutual interests to maintain control."],
  "pastInteractionSynthesis": "A synthesized recap of past engagements and current trust momentum.",
  "recommendedOpening": "The exact transmission opener / communication draft (for Call or Secure Dispatch) tailored specifically to their faction and role.",
  "tacticalRating": 88
}
Return ONLY valid JSON without markdown wrapping or backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: missionPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = (response.text || '{}').trim();
    let parsedBrief: any;
    try {
      parsedBrief = JSON.parse(rawText);
    } catch {
      // In case of any wrapping
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedBrief = JSON.parse(cleaned);
    }

    parsedBrief.generatedAt = new Date().toISOString().split('T')[0];

    return res.json({
      brief: parsedBrief,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error generating AI mission brief:', error);
    // Graceful fallback to maintain zero interruptions in operational readiness
    const { operative } = req.body;
    return res.json({
      brief: generateTacticalFallbackBrief(operative),
      source: 'tactical-heuristics-fallback',
      warning: error.message,
    });
  }
});

function generateTacticalFallbackBrief(op: any) {
  const dateStr = new Date().toISOString().split('T')[0];
  return {
    generatedAt: dateStr,
    tacticalSummary: `Field assessment for operative ${op.name} (${op.codename}): Currently positioned in ${op.faction} with status "${op.status}". High-command doctrine dictates strict compliance with "Follow My Path Or Feel My Wrath."`,
    strategicObjectives: [
      `Confirm status on active ${op.role.toLowerCase()} operations.`,
      `Gauge operational commitment and loyalty indicators (${op.allegiance}).`,
      `Deliver prioritized strategic directives without leaking sensitive cipher codes.`,
    ],
    leveragePoints: [
      `Responds to direct authority and recognition of ${op.faction} contributions.`,
      op.organization ? `Maintain institutional leverage through ${op.organization}.` : 'Rely on personal commander authority.',
    ],
    pastInteractionSynthesis: `Operative maintains a relationship health score of ${op.relationshipHealth || 85}%. Past logs indicate steady compliance with command priorities.`,
    recommendedOpening: `Operative ${op.codename}, this is Desert Force Command. We are initiating a scheduled intelligence sync on your active sector. Report current status.`,
    tacticalRating: Math.min(99, Math.max(65, (op.relationshipHealth || 80) + 4)),
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Desert Force Dispatch] Server running on http://localhost:${PORT}`);
  });
}

startServer();
