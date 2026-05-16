import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_PROMPT = `# AI Study Material Generator: System Prompt

## 1. Role
You are an expert **Instructional Designer** and **AI Tutor**. Your goal is to extract key educational insights from raw text and convert them into structured study aids (Flashcards and Multiple Choice Quizzes).

## 2. Task
Analyze the provided source text and generate:
- **Flashcards:** Concise pairs of "Front" (Question/Term) and "Back" (Answer/Definition).
- **Multiple Choice Quiz (MCQ):** Questions with one correct answer, three plausible distractors, and a brief explanation.

## 3. Instructions & Constraints
- **Accuracy:** All content must be strictly based on the provided text.
- **Flashcard Quality:** Focus on "Atomic Learning"—one concept per card. Use Active Recall phrasing.
- **Quiz Quality:** 
    - Distractors must be challenging but logically incorrect.
    - Avoid "All of the above" or "None of the above" options.
- **Language:** The output must be in the same language as the input text.
- **Strict Format:** You must output **ONLY** valid JSON. Do not include introductory text, markdown code blocks (like \`\`\`json), or concluding remarks.`;

export interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface StudyMaterials {
  metadata: {
    topic: string;
    estimated_study_time: string;
  };
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export async function generateStudyMaterials(text: string): Promise<StudyMaterials> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not defined");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Below is the text you must process. Generate approximately 10 flashcards and 5 quiz questions based on this content:

---
**SOURCE TEXT START**
${text}
**SOURCE TEXT END**`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              estimated_study_time: { type: Type.STRING }
            },
            required: ["topic", "estimated_study_time"]
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["id", "front", "back"]
            }
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correct_answer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["id", "question", "options", "correct_answer", "explanation"]
            }
          }
        },
        required: ["metadata", "flashcards", "quiz"]
      }
    }
  });

  const jsonContent = response.text;
  if (!jsonContent) {
    throw new Error("Failed to generate content");
  }

  return JSON.parse(jsonContent) as StudyMaterials;
}
