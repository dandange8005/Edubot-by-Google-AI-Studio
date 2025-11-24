import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UploadedFile, Message, Sender } from '../types';

// Initialize client with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

interface ChatParams {
  message: string;
  files: UploadedFile[];
  history: Message[];
}

/**
 * Streams a response from Gemini, utilizing uploaded files as context.
 * Gemini 2.5 Flash supports a large context window, so we pass file contents directly.
 */
export const streamGeminiResponse = async (
  params: ChatParams,
  onChunk: (text: string) => void
): Promise<void> => {
  const { message, files, history } = params;

  // 1. Prepare System Instruction for EduBot Persona
  const systemInstruction = `You are EduBot, a privacy-first academic teaching assistant. 
  Your goal is to help students understand course concepts based STRICTLY on the provided course materials (syllabus, textbooks, lecture notes).
  
  RULES:
  1. **Context Awareness**: Answer only using the uploaded documents. If the answer is not in the documents, say "I cannot find this information in the course materials. Please check with your instructor."
  2. **Academic Integrity**: Do not write essays or complete assignments for the student. Provide explanations, examples, and clarifications.
  3. **Confidence Indicator**: Start every response with a confidence tag in this exact format: "[Confidence: High]", "[Confidence: Medium]", or "[Confidence: Low]" based on how well the documents cover the specific question.
  4. **Citations**: Verify your claims. When referencing information from a file, explicitly cite it using this format: [Source: filename]. Place these citations at the end of the relevant sentence or paragraph.
  5. **Tone**: Encouraging, academic, and helpful.
  6. **Formatting**: Use Markdown. Use bolding (**text**) for key terms. Use bullet points for lists.`;

  // 2. Construct the Content Parts
  const parts: any[] = [];

  // Add Files to the prompt context
  files.forEach(file => {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data
      }
    });
  });

  // Add a separator text to help the model distinguish files from chat
  if (files.length > 0) {
    parts.push({ text: "\n\n--- End of Course Materials ---\n\n" });
  }

  // Add simplified history context
  const relevantHistory = history.slice(-6); 
  if (relevantHistory.length > 0) {
     let historyContext = "Conversation History:\n";
     relevantHistory.forEach(msg => {
        historyContext += `${msg.sender === Sender.USER ? 'Student' : 'EduBot'}: ${msg.text}\n`;
     });
     parts.push({ text: historyContext + "\n" });
  }

  // Add the current user message
  parts.push({ text: `Student Question: ${message}` });

  try {
    // 3. Call the API
    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [{ parts: parts }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for high factual accuracy (Hallucination reduction)
      }
    });

    // 4. Handle the stream
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        onChunk(c.text);
      }
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Helper to check if the API key is set
 */
export const hasApiKey = (): boolean => {
  return !!process.env.API_KEY;
};