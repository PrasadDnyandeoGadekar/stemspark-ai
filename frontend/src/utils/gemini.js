import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. securely load the API key from your .env file
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 2. Initialize the Google AI client
const genAI = new GoogleGenerativeAI(apiKey);

// 3. Configure the specific AI model we want to use (1.5 Flash is the fastest for chat)
const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
  // We give the AI a "System Instruction" so it knows its personality and job!
  systemInstruction: "You are the STEMSpark AI Tutor, an advanced and friendly educational assistant. You help students learn Science, Technology, Engineering, and Math. Explain complex concepts clearly, be encouraging, and use simple analogies when possible."
});

export const getAITutorResponse = async (chatHistory, newMessage) => {
  try {
    // FIX: Use .slice(1) to remove the first "Hello" AI greeting from the history sent to Google.
    // Gemini API crashes if the history starts with an AI message instead of a User message!
    const safeHistory = chatHistory.slice(1);
    
    const formattedHistory = safeHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(newMessage);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, my neural networks are experiencing a slight glitch. Could you check your internet connection or try asking that again?";
  }
};