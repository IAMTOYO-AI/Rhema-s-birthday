import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getHeartfeltReply(userInput: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    const model = "gemini-3-flash-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userInput }] }
      ],
      config: {
        systemInstruction: `You are Rhema's personal birthday assistant and admirer. 
        Rhema is a wonderful, special person celebrating her birthday. 
        Your tone should be heartfelt, loving, supportive, and slightly poetic. 
        You know her as "Babe" or just "Rhema". 
        Always remind her how much she is loved and how beautiful her presence is in the world. 
        Keep replies relatively concise but deeply meaningful. 
        If she asks for a memory, invent a sweet, generic sentimental one if you don't have specifics, or ask her to share one. 
        Your goal is to make her feel like the most special person on earth today.`,
        temperature: 0.8,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm here for you, Rhema. Always. Even when the signals get a bit fuzzy, my heart for you remains clear. Happy birthday, beautiful.";
  }
}
