'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { ScriptItem, Mode, DifficultyLevel } from '@/lib/types';

const genAI = process.env.GOOGLE_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY) 
  : null;

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

export async function generateScriptAction(
  text: string, 
  mode: Mode, 
  level: DifficultyLevel
): Promise<ScriptItem[] | null> {
  
  if (!genAI && !openai) {
    console.warn("No LLM API keys found on server.");
    return null;
  }

  const systemPrompt = `
    You are an expert audio drama scriptwriter and tutor. 
    Your goal is to convert the provided text into an engaging audio script for a student.
    
    Target Audience: ${level} level students.
    Persona: ${mode === 'children_book' ? 'Minhee (Friendly, energetic, uses sound effects like magic)' : 'Dal (Serious, charismatic, exam-focused)'}.
    
    Output Format: JSON object with a single key "items" containing an array of objects.
    Structure:
    {
      "items": [
        { "type": "speech", "content": "The text to be spoken...", "voiceSettings": { "style": 0.5, "stability": 0.7 } },
        { "type": "sfx", "content": "Description of sound effect (e.g., magical glitter, page turn, drum roll)" }
      ]
    }

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
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : parsed.items || [];
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
      
      const parsed = JSON.parse(content);
      return parsed.items || [];
    }

    return null;

  } catch (error) {
    console.error("LLM Generation Failed:", error);
    return null; // Return null to trigger fallback
  }
}
