

import { GoogleGenAI, GenerateContentResponse, Chat, Modality } from '@google/genai';
import { CHAT_MODEL_NAME, BHAI_SYSTEM_INSTRUCTION, IMAGE_EDIT_MODEL_NAME, IMAGE_RESPONSE_MODALITIES, HD_IMAGE_GEN_MODEL_NAME } from '../constants'; // Added HD_IMAGE_GEN_MODEL_NAME
import { ChatMessage, ImagePart } from '../types';

interface GeminiChatResponse {
  text: string;
  error?: string;
}

interface GeminiImageEditResponse {
  imageUrl?: string;
  error?: string;
}

// NEW: Interface for HD Image Generation Response
interface GeminiHDImageGenerationResponse {
  imageUrl?: string;
  error?: string;
}

// Function to initialize GoogleGenAI. It's called when an API request is made
// to ensure it uses the latest API key from the environment.
const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not set. Please ensure it is configured in your environment.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper to convert Blob to Base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Extract base64 part
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const chatWithBhaii = async (
  message: string,
  history: ChatMessage[],
  userName: string,
): Promise<GeminiChatResponse> => {
  try {
    const ai = getGeminiClient();

    // Convert app's ChatMessage history to Gemini's Content format.
    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Always create a new chat instance, passing the full history directly.
    // This ensures the model always has the complete and up-to-date context
    // from the UI's chat history.
    const chatInstance: Chat = ai.chats.create({
      model: CHAT_MODEL_NAME,
      config: {
        systemInstruction: BHAI_SYSTEM_INSTRUCTION,
      },
      history: formattedHistory, // Pass the formatted history here
    });
      
    // Prepend user name to the message for context
    const personalizedMessage = userName ? `${userName} says: ${message}` : message;

    const streamResponse = await chatInstance.sendMessageStream({ message: personalizedMessage });

    let fullText = '';
    for await (const chunk of streamResponse) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullText += c.text;
      }
    }

    return { text: fullText.trim() };
  } catch (error: any) {
    console.error('Error chatting with Bhaii:', error);
    if (error.message && error.message.includes("Requested entity was not found")) {
      // Prompt user to select API key if it's not found, as per guidelines for Veo.
      // Although this is chat, the error handling pattern is consistent.
      await (window as any).aistudio.openSelectKey();
      return { text: '', error: 'API key issue. Please select your API key again from the dialog.' };
    }
    return { text: '', error: 'Sorry, kuch gadbad ho gayi. Can you please try again?' };
  }
};

export const editImageWithGemini = async (
  imageFile: File,
  prompt: string,
): Promise<GeminiImageEditResponse> => {
  try {
    const ai = getGeminiClient();

    const base64ImageData = await blobToBase64(imageFile);

    const imagePart: ImagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: imageFile.type,
      },
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: IMAGE_EDIT_MODEL_NAME,
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: IMAGE_RESPONSE_MODALITIES,
      },
    });

    const editedImagePart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (editedImagePart) {
      const imageUrl = `data:${editedImagePart.mimeType};base64,${editedImagePart.data}`;
      return { imageUrl };
    } else {
      console.error('No image data received from Gemini:', response);
      return { error: 'Could not generate edited image. Please try a different prompt.' };
    }
  } catch (error: any) {
    console.error('Error editing image with Gemini:', error);
    // Specific error handling for API key issues
    if (error.message && error.message.includes("Requested entity was not found")) {
      await (window as any).aistudio.openSelectKey();
      return { error: 'API key issue. Please select your API key again from the dialog.' };
    }
    return { error: 'Failed to edit image. Network issue or invalid prompt?' };
  }
};

// NEW: Function to generate HD images
export const generateHDImageWithGemini = async (
  prompt: string,
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
): Promise<GeminiHDImageGenerationResponse> => {
  try {
    const ai = getGeminiClient();

    if (!prompt.trim()) {
      return { error: 'Please provide a text prompt for image generation.' };
    }

    const response = await ai.models.generateImages({
      model: HD_IMAGE_GEN_MODEL_NAME,
      prompt: prompt.trim(),
      config: {
        numberOfImages: 1, // Generate a single image
        outputMimeType: 'image/jpeg', // Standard output format
        aspectRatio: aspectRatio,
      },
    });

    const generatedImage = response.generatedImages?.[0]?.image;

    if (generatedImage?.imageBytes) {
      const imageUrl = `data:${generatedImage.mimeType};base64,${generatedImage.imageBytes}`;
      return { imageUrl };
    } else {
      console.error('No image data received from HD image generator:', response);
      return { error: 'Could not generate HD image. Please try a different prompt.' };
    }
  } catch (error: any) {
    console.error('Error generating HD image with Gemini:', error);
    if (error.message && error.message.includes("Requested entity was not found.")) {
      // As per guidelines, if key selection fails or API key is invalid, prompt user again.
      await (window as any).aistudio.openSelectKey();
      return { error: 'API key issue: HD Image generation requires billing. Please ensure your API key is enabled for billing and re-select it.' };
    }
    return { error: `Failed to generate HD image: ${error.message || 'Unknown error'}` };
  }
};
