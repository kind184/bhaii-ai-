import React, { useState, useRef, useCallback, useEffect } from 'react';
import Button from './Button';

const SLIDE_DURATION_MS = 2500; // 2.5 seconds per slide
const MAX_SLIDES = 6; // To keep total video length around 10-15 seconds

const SlideshowGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // Used briefly for "Generate" button click
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Enter text to create your animated slideshow!');

  const timeoutRef = useRef<number | null>(null);

  const startSlideshow = useCallback((newSlides: string[]) => {
    if (newSlides.length === 0) {
      setError('No valid slides generated. Please enter some text.');
      setIsPlaying(false);
      return;
    }

    setSlides(newSlides);
    setCurrentSlideIndex(0);
    setIsPlaying(true);
    setStatusMessage('Slideshow playing...');
  }, []);

  const stopSlideshow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPlaying(false);
    setStatusMessage('Slideshow stopped. Ready for new input!');
  }, []);

  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setCurrentSlideIndex((prevIndex) => {
          if (prevIndex < slides.length - 1) {
            return prevIndex + 1;
          } else {
            // Slideshow finished playing through all slides
            stopSlideshow();
            setStatusMessage('Slideshow finished! You can generate another one.');
            return 0; // Reset index for potential replay
          }
        });
      }, SLIDE_DURATION_MS);
    } else if (!isPlaying && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentSlideIndex, slides, stopSlideshow]);

  const handleGenerate = useCallback(() => {
    setLoading(true);
    setError(null);
    stopSlideshow(); // Stop any currently playing slideshow

    const rawLines = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const generatedSlides = rawLines.slice(0, MAX_SLIDES); // Limit to MAX_SLIDES

    if (generatedSlides.length === 0) {
      setError('Please enter some text for your slideshow.');
      setLoading(false);
      return;
    }
    
    startSlideshow(generatedSlides);
    setLoading(false);
  }, [inputText, startSlideshow, stopSlideshow]);

  const handleClear = useCallback(() => {
    stopSlideshow();
    setInputText('');
    setSlides([]);
    setCurrentSlideIndex(0);
    setError(null);
    setStatusMessage('Enter text to create your animated slideshow!');
    setLoading(false);
  }, [stopSlideshow]);

  const currentSlideText = slides[currentSlideIndex] || 'Your awesome slideshow will appear here!';

  return (
    <div className="flex flex-col bg-white p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Animated Slideshow Generator</h2>
      <p className="text-gray-600 text-sm mb-4">
        Turn your text into a fun, animated slideshow video (10-15 seconds)! Each line of text becomes a slide.
        No API keys or billing required - completely free and student-friendly!
      </p>

      {/* Text Input */}
      <div className="mb-4">
        <label htmlFor="slideshowText" className="block text-gray-700 text-sm font-medium mb-2">
          Your Slideshow Text (one line per slide, max {MAX_SLIDES} slides for 10-15s):
        </label>
        <textarea
          id="slideshowText"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
          rows={5}
          placeholder="Write your amazing story here...
Each line will be a new slide!
Keep it short and sweet.
This is slide number four.
And finally, the last slide!"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isPlaying || loading}
          aria-label="Text input for slideshow"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4" role="alert">{error}</p>
      )}

      {statusMessage && !error && (
        <p className={`text-sm mb-4 ${isPlaying ? 'text-blue-600' : 'text-gray-600'}`} role="status">
          {statusMessage}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 justify-end">
        <Button onClick={handleClear} variant="secondary" disabled={loading || (inputText === '' && slides.length === 0 && !isPlaying)} size="sm">
          Clear
        </Button>
        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={isPlaying || loading || inputText.trim() === ''}
          size="sm"
          aria-label={loading ? 'Generating slideshow' : 'Generate Slideshow'}
        >
          {loading ? 'Generating...' : 'Generate Slideshow'}
        </Button>
      </div>

      {/* Slideshow Display */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg shadow-lg flex items-center justify-center overflow-hidden min-h-[200px] sm:min-h-[300px]">
        {slides.length > 0 && isPlaying ? (
          <p className="text-white text-center text-xl sm:text-3xl font-bold p-4 max-w-[90%] slide-text-animation"
             key={currentSlideIndex} // Key ensures re-render and re-application of animation
             aria-live="polite"
             aria-atomic="true">
            {currentSlideText}
          </p>
        ) : (
          <p className="text-white text-center text-lg sm:text-2xl font-semibold opacity-75 p-4 max-w-[90%]">
            {currentSlideText}
          </p>
        )}
      </div>
    </div>
  );
};

export default SlideshowGenerator;