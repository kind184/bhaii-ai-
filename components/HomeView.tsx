import React from 'react';
import Button from './Button';

type NavigationView = 'home' | 'chat' | 'image-editor' | 'slideshow-generator' | 'hd-image-generator'; // NEW: Added 'hd-image-generator'

interface HomeViewProps {
  onNavigate: (view: NavigationView) => void;
}

interface FeatureCardProps {
  title: string;
  description: string;
  gradient: string;
  targetView: NavigationView;
  onNavigate: (view: NavigationView) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, gradient, targetView, onNavigate }) => {
  return (
    <div className={`relative flex flex-col justify-between p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${gradient} text-white`}>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-100 mb-6 flex-1 text-sm">{description}</p>
      <Button
        onClick={() => onNavigate(targetView)}
        variant="secondary"
        className="bg-white text-blue-600 hover:bg-gray-100 self-start mt-auto"
        size="md"
      >
        Launch
      </Button>
    </div>
  );
};

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const featureCards = [
    {
      title: 'Bhaii Chat',
      description: 'Chat with your supportive AI brother, Bhaii! Get quick, friendly advice and encouraging words with a local touch. Kya haal hai?',
      gradient: 'bg-gradient-to-br from-blue-500 to-purple-600',
      targetView: 'chat' as NavigationView,
    },
    {
      title: 'Gemini Image Editor',
      description: 'Unleash your creativity! Upload an image and use text prompts to edit it with the power of Gemini 2.5 Flash Image. Add a filter, remove objects, and more!',
      gradient: 'bg-gradient-to-br from-green-500 to-teal-600',
      targetView: 'image-editor' as NavigationView,
    },
    {
      title: 'Animated Slideshow',
      description: 'Create a short, fun animated slideshow from your text! Perfect for quick demos and student projects, no API key needed!',
      gradient: 'bg-gradient-to-br from-pink-500 to-indigo-600',
      targetView: 'slideshow-generator' as NavigationView,
    },
    { // NEW FEATURE CARD
      title: 'HD Image Generator',
      description: 'Generate high-quality, clear, and detailed images from text prompts. Ideal for school projects, posters, and presentations!',
      gradient: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      targetView: 'hd-image-generator' as NavigationView,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 rounded-lg">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8">Welcome to Bhaii AI Studio!</h2>
      <p className="text-lg text-gray-600 mb-10 max-w-2xl">
        Your personal space for creative AI interactions. Choose a feature below to get started!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featureCards.map((card, index) => (
          <FeatureCard
            key={index}
            title={card.title}
            description={card.description}
            gradient={card.gradient}
            targetView={card.targetView}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeView;