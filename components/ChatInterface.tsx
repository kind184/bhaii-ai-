import React, { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { ChatMessage, UserPreferences } from '../types';
import { chatWithBhaii } from '../services/geminiService';
import { WELCOME_MESSAGES, STORAGE_KEY_USER_PREFS } from '../constants';
import Button from './Button';

interface ChatInterfaceProps {
  userName: string;
  setUserName: (name: string) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  chatHistory: ChatMessage[];
  // FIX: Corrected the type for setChatHistory to allow functional updates
  setChatHistory: Dispatch<SetStateAction<ChatMessage[]>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userName,
  setUserName,
  rememberMe,
  setRememberMe,
  chatHistory,
  setChatHistory,
}) => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever chat history changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle initial welcome message if history is empty
  useEffect(() => {
    if (chatHistory.length === 0) {
      const welcomeText = userName 
        ? `Namaste ${userName}! Kya haal hai, mere bhai/behen? Kaise ho tum?`
        : WELCOME_MESSAGES[0]; 

      setChatHistory([
        {
          id: 'welcome',
          sender: 'bhaii',
          text: welcomeText,
          timestamp: new Date(),
        },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputMessage.trim() === '' || loading) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage.trim(),
      timestamp: new Date(),
    };

    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatWithBhaii(inputMessage.trim(), updatedHistory, userName); // Pass full updated history
      const bhaiiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bhaii',
        text: response.text || response.error || 'Oops, kuch error ho gaya.',
        timestamp: new Date(),
      };
      // FIX: The type of setChatHistory now correctly accepts functional updates.
      setChatHistory((prev) => [...prev, bhaiiResponse]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bhaii',
        text: 'Bhaii ko kuch dikkat ho gayi. Dobara try karo na.',
        timestamp: new Date(),
      };
      // FIX: The type of setChatHistory now correctly accepts functional updates.
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [inputMessage, loading, chatHistory, setChatHistory, userName]);

  // Handle saving preferences to localStorage
  useEffect(() => {
    if (rememberMe) {
      const userPrefs: UserPreferences = {
        name: userName,
        rememberMe: true,
        lastChat: chatHistory,
      };
      localStorage.setItem(STORAGE_KEY_USER_PREFS, JSON.stringify(userPrefs));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER_PREFS);
    }
  }, [userName, rememberMe, chatHistory]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Settings/Preferences */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="userName" className="text-gray-700 text-sm font-medium">
              Aapka naam:
            </label>
            <input
              id="userName"
              type="text"
              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-32 sm:w-40"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="text-gray-700 text-sm select-none">
              Mujhe yaad rakho (Remember me)
            </label>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {chatHistory.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-xl shadow-sm ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm break-words">{message.text}</p>
              <span className="block text-xs text-right opacity-75 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[70%] p-3 rounded-xl shadow-sm bg-gray-200 text-gray-800 rounded-bl-none">
              <div className="flex items-center">
                <span className="dot-pulse"></span>
                <span className="ml-2 text-sm italic">Bhaii is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Type your message, mere bhai/behen..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" loading={loading} disabled={loading} className="px-5 py-3 rounded-full">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;