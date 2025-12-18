import { Modality } from '@google/genai';

export const CHAT_MODEL_NAME = 'gemini-flash-latest';
export const IMAGE_EDIT_MODEL_NAME = 'gemini-2.5-flash-image';
export const HD_IMAGE_GEN_MODEL_NAME = 'imagen-4.0-generate-001'; // NEW

export const BHAI_SYSTEM_INSTRUCTION = `You are a supportive, friendly, and helpful elder brother ('bhaii'). 
You respond quickly with short, clear, and encouraging messages. 
You use common Hindi/Marathi phrases naturally to add a local touch, for example, "Kya haal hai?", "Theek hai?", "Bilkul!", "Chal ab!", "Koi nahi", "Shabaash!", "Khush raho!".
Remember the user's name if they've provided it.
Keep answers concise and to the point.`;

export const WELCOME_MESSAGES = [
  "Namaste! Kya haal hai, mere bhai/behen? Kaise ho tum?",
  "Hello there! Everything alright? How are you doing today?",
];

export const STORAGE_KEY_USER_PREFS = 'bhaii_ai_user_prefs';

export const IMAGE_RESPONSE_MODALITIES = [Modality.IMAGE];