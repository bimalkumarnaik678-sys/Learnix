import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import Ollama from 'ollama';
import { AI_PROVIDER, OLLAMA_HOST, OLLAMA_MODEL } from '../config/env.js';

const router = express.Router();

// Helper to check if Ollama is reachable
const checkOllama = async () => {
  try {
    console.log('Checking Ollama connection to:', OLLAMA_HOST);
    const client = new Ollama({ host: OLLAMA_HOST });
    await client.list();
    console.log('Ollama connection successful');
    return true;
  } catch (e) {
    console.error('Ollama connection check failed:', e.message);
    if (e.cause) console.error('Cause:', e.cause);
    return false;
  }
};

router.post('/chat', requireAuth, aiLimiter, async (req, res) => {
  const { courseId, conversation = [] } = req.body || {};

  try {
    if (AI_PROVIDER === 'ollama') {
      const isUp = await checkOllama();
      if (!isUp) {
        return res.status(503).json({
          message: 'Ollama service is not reachable. Please ensure it is running.',
          error: 'CONNECTION_REFUSED'
        });
      }

      const client = new Ollama({ host: OLLAMA_HOST });
      const messages = (conversation || []).map(m => ({ role: m.role, content: m.content }));

      // Add system prompt if starting a new conversation
      if (messages.length === 0 || messages[0].role !== 'system') {
        messages.unshift({
          role: 'system',
          content: 'You are a helpful AI tutor for the LearnAI platform. Keep answers concise and educational.'
        });
      }

      const response = await client.chat({ model: OLLAMA_MODEL, messages });
      const content = response?.message?.content || '';

      return res.json({
        reply: content,
        sources: [],
        suggested_exercises: [],
        courseId,
        turns: (conversation || []).length
      });
    }

    return res.json({
      reply: 'AI Provider not configured. Please set AI_PROVIDER=ollama in .env',
      sources: [],
      suggested_exercises: [],
      courseId
    });
  } catch (e) {
    console.error('AI Chat Error:', e);
    return res.status(500).json({
      message: 'AI chat failed',
      error: e.message
    });
  }
});

router.post('/embed', requireAuth, aiLimiter, async (req, res) => {
  const { texts = [] } = req.body || {};
  try {
    if (AI_PROVIDER === 'ollama') {
      const client = new Ollama({ host: OLLAMA_HOST });
      const results = [];
      for (let i = 0; i < texts.length; i++) {
        const r = await client.embeddings({ model: 'nomic-embed-text', input: texts[i] });
        results.push({ i, vec: r?.embedding || [], text: texts[i] });
      }
      return res.json({ embeddings: results });
    }
    // Fallback for dev without AI
    const embeddings = texts.map((t, i) => ({ i, vec: Array(384).fill(0.1), text: t }));
    return res.json({ embeddings });
  } catch (e) {
    console.error('Embedding Error:', e);
    return res.status(500).json({ message: 'Embedding failed' });
  }
});

router.post('/analyze', requireAuth, aiLimiter, async (req, res) => {
  const { history = [] } = req.body || {};
  try {
    const attempts = history.slice(-20);
    const total = attempts.length || 1;
    const correct = attempts.filter(a => a.correct === true || a.score > 0.5).length;
    const accuracy = correct / total;
    let pace = 'steady';
    if (accuracy > 0.85) pace = 'fast';
    else if (accuracy < 0.6) pace = 'slow';

    const gaps = {};
    for (const a of attempts) {
      const key = a.topic || a.tag || 'general';
      if (!gaps[key]) gaps[key] = { seen: 0, wrong: 0 };
      gaps[key].seen += 1;
      if (!(a.correct === true || a.score > 0.5)) gaps[key].wrong += 1;
    }

    const weakest = Object.entries(gaps)
      .map(([k, v]) => ({ topic: k, rate: v.wrong / v.seen }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3);

    let feedback = `Accuracy ${(accuracy * 100).toFixed(0)}%. Pace ${pace}. Focus: ${weakest.map(w => w.topic).join(', ') || 'general review'}.`;

    if (AI_PROVIDER === 'ollama') {
      const client = new Ollama({ host: OLLAMA_HOST });
      const system = 'You are a concise learning coach for students.';
      const prompt = `Recent performance accuracy ${(accuracy * 100).toFixed(0)}%. Pace ${pace}. Weak areas: ${weakest.map(w => w.topic + `(${(w.rate * 100).toFixed(0)}%)`).join(', ')}. Give 3 bullet suggestions and a short encouragement.`;

      try {
        const r = await client.chat({
          model: OLLAMA_MODEL, messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
          ]
        });
        feedback = r?.message?.content || feedback;
      } catch (e) {
        console.warn('AI Analysis failed, using fallback feedback');
      }
    }

    return res.json({ accuracy, pace, weakest, feedback });
  } catch (e) {
    return res.status(500).json({ message: 'Analysis failed' });
  }
});

export default router;