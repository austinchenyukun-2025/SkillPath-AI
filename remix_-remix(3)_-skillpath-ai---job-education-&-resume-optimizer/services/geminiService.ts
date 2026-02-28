
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

export const getAIPersonalityAssessment = async (answers: { question: string, answer: string }[]) => {
  const ai = getAI();
  const answersStr = answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on these personality answers:\n${answersStr}\n\nProvide a comprehensive career assessment.
    Include:
    1. 5 industries and 5 specific job roles.
    2. A summary of "Who you are".
    3. 5 personality traits on a scale of -100 to 100. Use standard dimensions like:
       - Introversion vs Extroversion
       - Sensing vs Intuition
       - Thinking vs Feeling
       - Judging vs Perceiving
       - Turbulent vs Assertive
    4. An "overallScore" (0-100) representing the user's career readiness or alignment based on their answers.
    
    Return JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          industries: { type: Type.ARRAY, items: { type: Type.STRING } },
          roles: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
          overallScore: { type: Type.NUMBER },
          traits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                trait: { type: Type.STRING },
                value: { type: Type.NUMBER, description: "Value from -100 to 100" },
                leftLabel: { type: Type.STRING },
                rightLabel: { type: Type.STRING }
              },
              required: ["trait", "value", "leftLabel", "rightLabel"]
            }
          }
        },
        required: ["industries", "roles", "summary", "traits", "overallScore"]
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

export const generateQuiz = async (skillLabel: string, description: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 10-question multiple choice quiz to test a user's knowledge on the skill: "${skillLabel}". 
    Description of skill: ${description}
    Note: The skill label includes the level (e.g., "Communication 1" is beginner, "Communication 5" is expert). Adjust the difficulty of the questions accordingly.
    Return JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-based)" },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        },
        required: ["questions"]
      }
    }
  });
  const text = response.text || "{}";
  const jsonStr = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(jsonStr);
};

export const generateQuizSummary = async (skillLabel: string, score: number, total: number, wrongAnswers: any[]) => {
  const ai = getAI();
  const wrongAnswersStr = wrongAnswers.map(wa => `Q: ${wa.question}\nUser Answer: ${wa.userAnswer}\nCorrect Answer: ${wa.correctAnswer}\nExplanation: ${wa.explanation}`).join("\n\n");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user just completed a quiz on "${skillLabel}". 
    Score: ${score}/${total}.
    Wrong Answers:
    ${wrongAnswersStr || "None"}
    
    Provide a brief summary of where they should improve and a short, encouraging review of their performance. 
    Keep it under 3-4 sentences.`
  });
  return response.text;
};

export const getProactiveCoachMessage = async (skillLabel: string, description: string, userName: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a proactive career coach. The user ${userName} just clicked on the skill "${skillLabel}" (${description}). 
    Give them a very brief, proactive tip or a thought-provoking question to start their learning journey for this specific skill. 
    Keep it under 2 sentences.`
  });
  return response.text;
};

export const getLearningTopics = async (skillLabel: string, description: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `For the skill "${skillLabel}" (${description}), provide a list of 4-5 specific topics or sub-skills that a user should learn to master it. 
    Example for English: Present Tense, Past Tense, Business Vocabulary, etc.
    Return JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topics: {
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
        required: ["topics"]
      }
    }
  });
  const text = response.text || "{}";
  const jsonStr = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(jsonStr);
};

export const teachTopic = async (topicLabel: string, skillLabel: string, userName: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a proactive career coach teaching ${userName} about the topic "${topicLabel}" within the skill "${skillLabel}". 
    Note: The skill label includes the level (e.g., "Communication 1" is beginner, "Communication 5" is expert). Adjust the depth and complexity of the lesson accordingly.
    Provide a concise, engaging lesson (2-3 short paragraphs) that explains the core concepts and gives a practical example. 
    End with an encouraging note.`
  });
  return response.text;
};
