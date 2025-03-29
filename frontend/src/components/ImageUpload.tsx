import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  previewUrl: string | null;
  onClear: () => void;
}

export function ImageUpload({ onImageSelect, selectedImage, previewUrl, onClear }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedImage ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
            }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isDragActive
              ? 'Drop the image here'
              : 'Drag and drop an image, or click to select'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Supported formats: JPEG, PNG
          </p>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={previewUrl!}
            alt="Preview"
            className="max-h-96 mx-auto rounded-lg shadow-lg"
          />
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            {selectedImage.name}
          </p>
        </div>
      )}
    </div>
  );
}