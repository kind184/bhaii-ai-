import React, { useState, useRef, useCallback } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import Button from './Button';

const ImageEditor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setEditedImageUrl(null); // Clear edited image on new upload
      setError(null);
    } else {
      setSelectedFile(null);
      setOriginalImageUrl(null);
      setError('Please select a valid image file (jpeg, png, gif, webp).');
    }
  }, []);

  const handleEditImage = useCallback(async () => {
    if (!selectedFile || imagePrompt.trim() === '') {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }

    setLoading(true);
    setError(null);
    setEditedImageUrl(null); // Clear previous edited image before new generation

    try {
      const response = await editImageWithGemini(selectedFile, imagePrompt);
      if (response.imageUrl) {
        setEditedImageUrl(response.imageUrl);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Image editing failed:', err);
      setError('An unexpected error occurred during image editing.');
    } finally {
      setLoading(false);
    }
  }, [selectedFile, imagePrompt]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setImagePrompt('');
    setOriginalImageUrl(null);
    setEditedImageUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input value
    }
  }, []);

  return (
    <div className="flex flex-col bg-white p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Image Editor (Nano Banana Powered)</h2>

      {/* File Input */}
      <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
           onClick={() => fileInputRef.current?.click()}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        {selectedFile ? (
          <p className="text-gray-700 text-sm">Selected: <span className="font-semibold">{selectedFile.name}</span>. Click to change.</p>
        ) : (
          <p className="text-gray-500">Drag & drop an image or click to upload</p>
        )}
      </div>

      {/* Image Prompt */}
      <div className="mb-4">
        <label htmlFor="imagePrompt" className="block text-gray-700 text-sm font-medium mb-2">
          Editing Prompt (e.g., "Add a retro filter", "Remove the person"):
        </label>
        <textarea
          id="imagePrompt"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
          rows={3}
          placeholder="Describe how you want to edit the image..."
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          disabled={loading || !selectedFile}
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4">{error}</p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 justify-end">
        <Button onClick={handleClear} variant="secondary" disabled={loading || !selectedFile} size="sm">
          Clear
        </Button>
        <Button onClick={handleEditImage} loading={loading} disabled={loading || !selectedFile || imagePrompt.trim() === ''} size="sm">
          {loading ? 'Editing...' : 'Edit Image'}
        </Button>
      </div>

      {/* Image Display */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 overflow-y-auto custom-scrollbar">
        {originalImageUrl && (
          <div className="flex flex-col items-center border border-gray-200 rounded-lg p-2 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Original Image</h3>
            <img src={originalImageUrl} alt="Original" className="max-w-full h-auto max-h-64 object-contain rounded-md" />
          </div>
        )}
        {editedImageUrl && (
          <div className="flex flex-col items-center border border-gray-200 rounded-lg p-2 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Edited Image</h3>
            <img src={editedImageUrl} alt="Edited" className="max-w-full h-auto max-h-64 object-contain rounded-md" />
          </div>
        )}
        {!originalImageUrl && !editedImageUrl && (
          <p className="text-gray-500 text-center col-span-2 py-8">Upload an image to get started!</p>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;