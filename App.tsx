import React, { useState, useEffect, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import ImageEditor from './components/ImageEditor';
import HomeView from './components/HomeView';
import SlideshowGenerator from './components/SlideshowGenerator';
import HDImageGenerator from './components/HDImageGenerator'; // NEW IMPORT
import { ChatMessage, UserPreferences } from './types';
import { STORAGE_KEY_USER_PREFS } from './constants';

type NavigationView = 'home' | 'chat' | 'image-editor' | 'slideshow-generator' | 'hd-image-generator'; // NEW: Added 'hd-image-generator'

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<NavigationView>('home'); // Default to home view
  const [userName, setUserName] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Load user preferences from localStorage on initial mount
  useEffect(() => {
    const storedPrefs = localStorage.getItem(STORAGE_KEY_USER_PREFS);
    if (storedPrefs) {
      try {
        const userPrefs: UserPreferences = JSON.parse(storedPrefs);
        setUserName(userPrefs.name || '');
        setRememberMe(userPrefs.rememberMe || false);
        // Ensure lastChat items have correct Date objects
        setChatHistory(userPrefs.lastChat.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })) || []);
      } catch (e) {
        console.error("Failed to parse user preferences from localStorage", e);
        localStorage.removeItem(STORAGE_KEY_USER_PREFS); // Clear invalid data
      }
    }
  }, []);

  const handleNavigate = useCallback((view: NavigationView) => {
    setActiveView(view);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <HomeView onNavigate={handleNavigate} />;
      case 'chat':
        return (
          <ChatInterface
            userName={userName}
            setUserName={setUserName}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        );
      case 'image-editor':
        return <ImageEditor />;
      case 'slideshow-generator':
        return <SlideshowGenerator />;
      case 'hd-image-generator': // NEW CASE
        return <HDImageGenerator />;
      default:
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-100 rounded-lg shadow-xl overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🤖</span>Bhaii AI Studio
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-60 bg-gray-800 text-white flex flex-col p-4 shadow-lg z-10">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200 flex items-center gap-2
                  ${activeView === 'home'
                    ? 'bg-blue-700 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                  }`}
                onClick={() => handleNavigate('home')}
                aria-current={activeView === 'home' ? 'page' : undefined}
              >
                <span className="text-lg">🏠</span> Home
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200 flex items-center gap-2
                  ${activeView === 'chat'
                    ? 'bg-blue-700 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                  }`}
                onClick={() => handleNavigate('chat')}
                aria-current={activeView === 'chat' ? 'page' : undefined}
              >
                <span className="text-lg">💬</span> Bhaii Chat
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200 flex items-center gap-2
                  ${activeView === 'image-editor'
                    ? 'bg-blue-700 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                  }`}
                onClick={() => handleNavigate('image-editor')}
                aria-current={activeView === 'image-editor' ? 'page' : undefined}
              >
                <span className="text-lg">📸</span> Image Editor
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200 flex items-center gap-2
                  ${activeView === 'slideshow-generator'
                    ? 'bg-blue-700 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                  }`}
                onClick={() => handleNavigate('slideshow-generator')}
                aria-current={activeView === 'slideshow-generator' ? 'page' : undefined}
              >
                <span className="text-lg">🎞️</span> Animated Slideshow
              </button>
            </li>
            <li> {/* NEW NAVIGATION ITEM */}
              <button
                className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200 flex items-center gap-2
                  ${activeView === 'hd-image-generator'
                    ? 'bg-blue-700 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                  }`}
                onClick={() => handleNavigate('hd-image-generator')}
                aria-current={activeView === 'hd-image-generator' ? 'page' : undefined}
              >
                <span className="text-lg">🖼️</span> HD Image Generator
              </button>
            </li>
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 bg-gray-50 overflow-auto custom-scrollbar p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;