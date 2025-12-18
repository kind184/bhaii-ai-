export interface ChatMessage {
  id: string;
  sender: 'user' | 'bhaii';
  text: string;
  timestamp: Date;
}

export interface UserPreferences {
  name: string;
  rememberMe: boolean;
  lastChat: ChatMessage[];
}

export interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string; // Base64 encoded string
  };
}
