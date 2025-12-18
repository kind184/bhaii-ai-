import React, { useState, useCallback, useEffect } from 'react';
import Button from './Button';
import { generateHDImageWithGemini } from '../services/geminiService';

const HDImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // API Key selection checks
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);

  useEffect(() => {
    // Check API key status on component mount
    const checkApiKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setApiKeySelected(selected);
      if (!selected) {
        setStatusMessage("Please select your API key for HD image generation (billing required).");
      } else {
        setStatusMessage("Ready to generate HD images!");
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    setStatusMessage("Opening API key selection dialog...");
    await (window as any).aistudio.openSelectKey();
    // Assume selection was successful to avoid race condition, actual check happens on API call
    setApiKeySelected(true);
    setStatusMessage("API key selected. You can now generate HD images.");
  };

  const handleGenerateImage = useCallback(async () => {
    if (!apiKeySelected) {
      setError("Please select your API key first.");
      return;
    }
    if (prompt.trim() === '') {
      setError('Please provide a text prompt to generate an image.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    setStatusMessage('Generating HD image... This may take a moment.');

    try {
      const response = await generateHDImageWithGemini(
        prompt.trim(),
        aspectRatio,
      );

      if (response.imageUrl) {
        setGeneratedImageUrl(response.imageUrl);
        setStatusMessage('HD image generated successfully!');
      } else if (response.error) {
        setError(response.error);
        if (response.error.includes("API key issue")) {
          setApiKeySelected(false); // Reset key selection state
          setStatusMessage("API key issue: HD image generation requires billing. Please ensure your API key is enabled for billing and re-select it.");
        } else {
          setStatusMessage('');
        }
      } else {
        setError('Failed to generate HD image.');
        setStatusMessage('');
      }
    } catch (err: any) {
      console.error('HD image generation failed:', err);
      setError(`An unexpected error occurred: ${err.message || 'Unknown error'}`);
      setStatusMessage('');
    } finally {
      setLoading(false);
    }
  }, [apiKeySelected, prompt, aspectRatio]);

  const handleClear = useCallback(() => {
    setPrompt('');
    setAspectRatio('1:1');
    setGeneratedImageUrl(null);
    setLoading(false);
    setError(null);
    setStatusMessage(apiKeySelected ? 'Ready to generate HD images!' : 'Please select your API key for HD image generation (billing required).');
  }, [apiKeySelected]);

  return (
    <div className="flex flex-col bg-white p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">HD Image Generator</h2>
      <p className="text-gray-600 text-sm mb-4">
        Generate high-quality, clear, sharp, and detailed images from text prompts.
        Perfect for school demos, posters, and presentations! This feature uses Google Gemini's image generation capabilities and requires an API key with billing enabled.
      </p>

      {!apiKeySelected && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md" role="alert">
          <p className="mb-2">{statusMessage}</p>
          <Button onClick={handleSelectApiKey} variant="primary" size="sm">
            Select API Key
          </Button>
          <p className="mt-2 text-xs">
            A link to the billing documentation can be found <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">here</a>.
          </p>
        </div>
      )}

      {/* Text Prompt */}
      <div className="mb-4">
        <label htmlFor="imagePrompt" className="block text-gray-700 text-sm font-medium mb-2">
          Image Prompt:
        </label>
        <textarea
          id="imagePrompt"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
          rows={3}
          placeholder="Describe the image you want to generate (e.g., 'A vibrant watercolor painting of a whimsical treehouse in a magical forest')..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading || !apiKeySelected}
          aria-describedby="prompt-help"
        />
        <p id="prompt-help" className="mt-1 text-xs text-gray-500">
          Be descriptive for best results!
        </p>
      </div>

      {/* Aspect Ratio */}
      <div className="mb-4">
        <label htmlFor="aspectRatio" className="block text-gray-700 text-sm font-medium mb-2">
          Aspect Ratio:
        </label>
        <select
          id="aspectRatio"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}
          disabled={loading || !apiKeySelected}
          aria-label="Select image aspect ratio"
        >
          <option value="1:1">1:1 (Square)</option>
          <option value="3:4">3:4 (Portrait)</option>
          <option value="4:3">4:3 (Landscape)</option>
          <option value="9:16">9:16 (Tall Portrait)</option>
          <option value="16:9">16:9 (Wide Landscape)</option>
        </select>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4" role="alert">{error}</p>
      )}

      {statusMessage && !error && !generatedImageUrl && (
        <p className={`text-sm mb-4 ${loading ? 'text-blue-600' : 'text-gray-600'}`} role="status">{statusMessage}</p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 justify-end">
        <Button onClick={handleClear} variant="secondary" disabled={loading} size="sm">
          Clear
        </Button>
        <Button
          onClick={handleGenerateImage}
          loading={loading}
          disabled={loading || !apiKeySelected || prompt.trim() === ''}
          size="sm"
          aria-label={loading ? 'Generating image' : 'Generate Image'}
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </Button>
      </div>

      {/* Generated Image Display */}
      {generatedImageUrl && (
        <div className="flex flex-col items-center mt-4 border border-gray-200 rounded-lg p-2 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Generated HD Image</h3>
          <img src={generatedImageUrl} alt="Generated HD" className="max-w-full h-auto rounded-md shadow-md" aria-label="Generated HD image"/>
          <a href={generatedImageUrl} download="generated_hd_image.jpeg" className="mt-2 text-blue-600 hover:underline text-sm" aria-label="Download generated image">
            Download Image
          </a>
        </div>
      )}
    </div>
  );
};

export default HDImageGenerator;