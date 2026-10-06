import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/env.js';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const chatWithGemini = async (history, message, file = null) => {
    try {
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.content }]
            }))
        });

        let result;
        if (file) {
            // If file is present, we might need to use generateContent instead of chat for single turn with image
            // Or use multi-modal chat if supported. Gemini 1.5 supports it.
            // For simplicity in this turn, let's treat file + text as a user message parts
            const imageData = {
                inlineData: {
                    data: file.buffer.toString('base64'),
                    mimeType: file.mimetype
                }
            };
            result = await model.generateContent([message, imageData]);
        } else {
            result = await chat.sendMessage(message);
        }

        return result.response.text();
    } catch (error) {
        console.error('Gemini Chat Error:', error);
        throw new Error('Failed to generate response from Gemini');
    }
};

export const generateEmbeddings = async (text) => {
    try {
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Gemini Embedding Error:', error);
        throw new Error('Failed to generate embeddings');
    }
};
