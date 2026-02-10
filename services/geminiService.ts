
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async generateQuiz(text: string): Promise<QuizQuestion[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following text and generate a 5-question multiple choice quiz to test deep comprehension and information retention. 
      Text: "${text.substring(0, 4000)}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Exactly 4 options"
              },
              correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Failed to parse quiz JSON", e);
      return [];
    }
  },

  async generateSummaryAndRetentionTips(text: string): Promise<{ summary: string, retentionTips: string[] }> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a concise summary of this text and 3-5 specific "Retention Hooks" (memorable analogies or key concepts) to help someone remember this forever.
      Text: "${text.substring(0, 4000)}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            retentionTips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "retentionTips"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to parse summary JSON", e);
      return { summary: "Failed to generate summary.", retentionTips: [] };
    }
  },

  async generateTrainingText(category: string): Promise<{ title: string, content: string }> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate an interesting, educational article about ${category} that is roughly 600-800 words long. Suitable for speed reading practice.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "content"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }
};
