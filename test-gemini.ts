import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{
          inlineData: {
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            data: "UEsDBBQAAAAIAAAAIQAAAAAAAAAAAA==" 
          }
        }]
      }]
    });
    console.log("Success");
  } catch (err: any) {
    console.error("Failed:", err.message);
  }
}
run();
