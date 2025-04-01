import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Upload() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Clean up URL object
    }
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleProceed = () => {
    if (!selectedImage) return;
    navigate('/videoupload', { state: { image: selectedImage } }); // Passing the selected image to the next page
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Upload Photo for Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a clear, recent photo of the person you're looking for.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="mb-6">
          {/* Image Upload Input */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleImageSelect(e.target.files[0])}
            className="block w-full text-gray-700 dark:text-white"
          />
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="mb-6">
            <img
              src={previewUrl}
              alt="Image Preview"
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Clear Image Button */}
        {selectedImage && (
          <div className="text-center">
            <button
              onClick={handleClear}
              className="inline-flex items-center px-6 py-2 rounded-lg text-red-600 font-semibold border border-red-600 hover:bg-red-100"
            >
              Clear Image
            </button>
          </div>
        )}

        {/* Proceed Button */}
        {selectedImage && (
          <div className="mt-6 text-center">
            <button
              onClick={handleProceed}
              className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Proceed to Upload Video
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
