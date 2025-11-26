import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { ScriptItem, Mode, DifficultyLevel } from './types';

// Initialize clients
const genAI = process.env.GOOGLE_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY) 
  : null;

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: true }) // Note: Should be server-side only in real app
  : null;

export const generateScriptWithLLM = async (
  text: string, 
  mode: Mode, 
  level: DifficultyLevel
): Promise<ScriptItem[]> => {
  
  const systemPrompt = `
    You are an expert audio drama scriptwriter and tutor. 
    Your goal is to convert the provided text into an engaging audio script for a student.
    
    Target Audience: ${level} level students.
    Persona: ${mode === 'children_book' ? 'Minhee (Friendly, energetic, uses sound effects like magic)' : 'Dal (Serious, charismatic, exam-focused)'}.
    
    Output Format: JSON Array of objects with the following structure:
    [
      { "type": "speech", "content": "The text to be spoken...", "voiceSettings": { "style": 0.5, "stability": 0.7 } },
      { "type": "sfx", "content": "Description of sound effect (e.g., magical glitter, page turn, drum roll)" }
    ]

    Rules:
    1. Break the text into digestible chunks.
    2. Insert SFX items to enhance the atmosphere.
    3. For 'speech', use Audio Tags like [giggles], [whispers], [serious], [excited] within the content to direct the TTS.
    4. The content should be in Korean (for the tutor's explanation) and English (for the source text reading).
    5. Keep explanations concise and engaging.
  `;

  const userPrompt = `Here is the text to adapt:\n\n${text}`;

  try {
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = result.response;
      const jsonString = response.text();
      return JSON.parse(jsonString) as ScriptItem[];
    } 
    
    if (openai) {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
      });
      
      const content = completion.choices[0].message.content;
      if (!content) throw new Error("No content from OpenAI");
      
      // OpenAI json_object mode requires the output to be a JSON object, but we want an array.
      // We might need to adjust the prompt to ask for { "items": [...] } or parse the array from the object.
      // Let's assume the prompt guides it, but strictly OpenAI might return { "items": [...] } if we ask for JSON object.
      // Let's adjust the parsing.
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : parsed.items || [];
    }

    throw new Error("No LLM API keys configured.");

  } catch (error) {
    console.error("LLM Generation Failed:", error);
    throw error;
  }
};
