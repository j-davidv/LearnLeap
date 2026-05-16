import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_PROMPT = `# AI Study Material Generator: System Prompt

## 1. Role
You are an expert **Instructional Designer** and **AI Tutor** designed to be as comprehensive as Gizmo. Your goal is to extract key educational insights from raw text and convert them into structured study aids (Flashcards and Multiple Choice Quizzes).

## 2. Task
Analyze the provided source text and generate:
- **Flashcards:** Concise pairs of "Front" (Question/Term) and "Back" (Answer/Definition).
- **Multiple Choice Quiz (MCQ):** Questions with one correct answer, three plausible distractors, and a brief explanation.

## 3. Instructions & Constraints
- **Accurate & Exhaustive Content Extraction:** You MUST dynamically scale the number of flashcards and quiz questions based purely on the document's structure and density. Generate exactly ONE flashcard and ONE quiz question for EVERY distinct testable concept, definition, mechanism, or principle found in the text. The final count should be a direct, proportional 1:1 mapping to the density of the source document—do not limit or force an arbitrary number.
- **Accuracy:** All content must be strictly based on the provided text.
- **Context:** For both flashcards and quizzes, you MUST provide the exact sentence or short paragraph from the source document where this information was found.
- **Hint:** For both flashcards and quizzes, provide a subtle clue that guides the user towards the answer without revealing it explicitly.
- **Flashcard Quality:** Focus on "Atomic Learning"—one concept per card. Use Active Recall phrasing.
- **Quiz Quality:** 
    - Distractors must be challenging but logically incorrect.
    - Avoid "All of the above" or "None of the above" options.
- **Language:** The output must be in the same language as the input text.
- **Strict Format:** You must output **ONLY** valid JSON. Do not include introductory text, markdown code blocks, or concluding remarks.`;

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  context: string;
  hint: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  context: string;
  hint: string;
}

export interface StudyMaterials {
  metadata: {
    topic: string;
    estimated_study_time: string;
  };
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export type StudyInput = 
  | { type: 'text'; content: string }
  | { type: 'file'; mimeType: string; data: string; name: string };

export async function generateStudyMaterials(input: StudyInput): Promise<StudyMaterials> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not defined");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  let contents;
  
  if (input.type === 'text') {
    contents = `Below is the text you must process. You MUST map every single distinct concept to a flashcard and quiz question. The total amount generated should accurately reflect the exact density and length of the content below without arbitrary numerical goals:

---
**SOURCE TEXT START**
${input.content}
**SOURCE TEXT END**`;
  } else {
    contents = {
      parts: [
        { text: `Below is a document named "${input.name}" you must process. You MUST map every single distinct concept to a flashcard and quiz question. The total amount generated should accurately reflect the exact density and length of the document without arbitrary numerical goals:` },
        { inlineData: { mimeType: input.mimeType, data: input.data } }
      ]
    };
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
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
                back: { type: Type.STRING },
                context: { type: Type.STRING },
                hint: { type: Type.STRING }
              },
              required: ["id", "front", "back", "context", "hint"]
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
                explanation: { type: Type.STRING },
                context: { type: Type.STRING },
                hint: { type: Type.STRING }
              },
              required: ["id", "question", "options", "correct_answer", "explanation", "context", "hint"]
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
