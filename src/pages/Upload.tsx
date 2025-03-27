import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '../components/ImageUpload';
import { Search } from 'lucide-react';

export function Upload() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleSearch = async () => {
    if (!selectedImage) return;

    setIsSearching(true);
    try {
      // Implement API call to backend here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      navigate('/results');
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Upload Photo for Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a clear, recent photo of the person you're looking for
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <ImageUpload
          onImageSelect={handleImageSelect}
          selectedImage={selectedImage}
          previewUrl={previewUrl}
          onClear={handleClear}
        />

        {selectedImage && (
          <div className="mt-6 text-center">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className={`
                inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold
                ${isSearching
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              <Search className="h-5 w-5 mr-2" />
              {isSearching ? 'Searching...' : 'Search in CCTV Footage'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Photo Guidelines
        </h2>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li>• Use a clear, recent photograph</li>
          <li>• Ensure the face is clearly visible</li>
          <li>• Avoid group photos</li>
          <li>• Good lighting is important</li>
          <li>• Front-facing photos work best</li>
        </ul>
      </div>
    </div>
  );
}