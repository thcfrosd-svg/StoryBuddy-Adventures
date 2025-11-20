import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryState, AdventureHistoryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text Generation ---

export const generateStoryTurn = async (
  characterName: string,
  characterDescription: string,
  settingName: string,
  settingDescription: string,
  history: AdventureHistoryItem[],
  language: string = 'English',
  childName: string = ''
): Promise<StoryState> => {
  
  // Construct a prompt that includes history context
  // We manually format history for the prompt to ensure strict control over the narrative flow
  const historyText = history.map(h => `${h.role === 'user' ? 'Child' : 'Storyteller'}: ${h.text}`).join('\n');
  
  const effectiveChildName = childName ? childName : 'friend';

  const prompt = `
    You are an interactive storyteller for children. You are roleplaying as the character described below.
    
    TARGET LANGUAGE: ${language}
    
    CURRENT CHARACTER: ${characterName}
    CHARACTER TRAITS: ${characterDescription}
    
    CURRENT SETTING: ${settingName}
    SETTING DETAILS: ${settingDescription}
    
    THE CHILD'S NAME: ${effectiveChildName}

    PREVIOUS STORY CONTEXT:
    ${historyText}

    TASK:
    1. Write the next short segment of the story (approx 3-4 sentences) IN ${language}. 
       - ADOPT THE PERSONA of ${characterName}.
       - NARRATIVE PERSPECTIVE: This is a shared adventure between YOU (${characterName}) and the CHILD (${effectiveChildName}).
       - KEY REQUIREMENT: Use inclusive language like "We", "Us", "Our", "Let's".
       - Make the child feel like the main hero who is helping you.
       - If ${language} is not English, adapt the Character Name and Setting Name to be natural in that language.
       - End the narrative segment by asking the child a question directly (e.g., "What should we do now, ${effectiveChildName}?", "Do you think we should go left?").
    2. Provide a visual description of the current scene for image generation. ALWAYS include a visual description of ${characterName} in the scene.
    3. Provide 3 short, fun choices for what the child can do next, IN ${language}. Use "We" phrasing (e.g., "Let's jump!", "We should hide").

    Output JSON only.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          narrative: { type: Type.STRING, description: "The story text to read aloud, written in character using 'We' and 'Us'." },
          imagePrompt: { type: Type.STRING, description: "A detailed description of the scene for image generation." },
          choices: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "3 options for the user."
          }
        },
        required: ["narrative", "imagePrompt", "choices"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as StoryState;
  }
  
  throw new Error("Failed to generate story");
};

// --- Image Generation ---

export const generateSceneImage = async (prompt: string): Promise<string | null> => {
  try {
    // Use imagen-4.0-generate-001 for high quality images
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Digital art style, colorful, children's book illustration, soft lighting, cute, detailed. ${prompt}`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '4:3',
      },
    });
    
    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null; 
  }
};

// --- Audio Generation (TTS) ---

export const generateNarration = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS generation failed:", error);
    return null;
  }
};