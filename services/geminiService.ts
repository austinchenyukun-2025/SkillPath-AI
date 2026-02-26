import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, StudyLevel } from "../types";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your .env.local file.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeResume = async (resumeData: { text?: string, file?: { data: string, mimeType: string } }, targetJob: string) => {
  const ai = getAI();
  const parts: any[] = [
    { text: `Analyze this resume for a ${targetJob} role. Provide feedback in JSON format.` }
  ];

  if (resumeData.file) {
    parts.push({
      inlineData: {
        data: resumeData.file.data,
        mimeType: resumeData.file.mimeType
      }
    });
  } else if (resumeData.text) {
    parts.push({ text: `Resume Content: ${resumeData.text}` });
  }

  // Use gemini-flash-latest for reliable multimodal analysis (PDF support)
  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedJobs: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "missingSkills", "improvementTips", "suggestedJobs"]
      }
    }
  });
  
  const text = response.text || "{}";
  // Remove potential markdown code blocks if the model accidentally includes them
  const jsonStr = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(jsonStr);
};

export const generateSkillTree = async (interest: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a hierarchical skill learning path for someone interested in ${interest}. 
    Provide 3 main modules, each with 2-3 sub-skills.
    Format as JSON structure: { "id": string, "label": string, "description": string, "children": [...] }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          description: { type: Type.STRING },
          children: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                children: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      id: { type: Type.STRING }, 
                      label: { type: Type.STRING }, 
                      description: { type: Type.STRING } 
                    },
                    required: ["id", "label", "description"]
                  } 
                }
              },
              required: ["id", "label", "description"]
            }
          }
        },
        required: ["id", "label", "description", "children"]
      }
    }
  });
  const text = response.text || "{}";
  const jsonStr = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(jsonStr);
};

export const getAIPersonalityAssessment = async (answers: string[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on these personality answers: ${answers.join(", ")}, suggest 3 industries and 3 specific job roles that fit this user. Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          industries: { type: Type.ARRAY, items: { type: Type.STRING } },
          roles: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }
        },
        required: ["industries", "roles", "summary"]
      }
    }
  });
  const text = response.text || "{}";
  const jsonStr = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(jsonStr);
};

export const chatWithCoach = async (message: string, context: string) => {
  const ai = getAI();
  // Fix: gemini-3-flash-preview is suitable for concise conversational tasks
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Context: You are a professional career coach for soft skills. 
    User message: ${message}
    Previous context: ${context}
    Keep it concise and encouraging.`
  });
  return response.text;
};
