import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface VideoFile {
  id: string;
  file: File;
  url: string;
  isProcessing: boolean;
  isProcessed: boolean;
}

export function VideoUpload() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newVideos = Array.from(files)
      .filter(file => file.type.startsWith('video/'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        isProcessing: false,
        isProcessed: false
      }));

    setVideos(prev => [...prev, ...newVideos]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeVideo = (id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
  };

  const processVideo = async (video: VideoFile) => {
    if (!image) {
      alert('Please upload an image before processing.');
      return;
    }

    setVideos(prev =>
      prev.map(v =>
        v.id === video.id ? { ...v, isProcessing: true } : v
      )
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/results', { state: { file: video.file, image } });
    } catch (error) {
      console.error('Error processing video:', error);
      alert('Error processing video');
      setVideos(prev =>
        prev.map(v =>
          v.id === video.id ? { ...v, isProcessing: false } : v
        )
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* White Box Section */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Face Recognition Image & Video Upload
        </h1>

        {/* Image Upload Section */}
        <div className="mb-6">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> an image
              </p>
              <p className="text-xs text-gray-500">JPG, PNG</p>
            </div>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>

          {/* Image Preview */}
          {imagePreview && (
            <div className="flex justify-center mt-4">
              <img
                src={imagePreview}
                alt="Uploaded Preview"
                className="rounded-lg shadow-md w-40 h-40 object-cover"
              />
            </div>
          )}
        </div>

        {/* Video Upload Section */}
        <div className="mb-6">
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">MP4, WebM, or Ogg</p>
            </div>
            <input
              id="video-upload"
              type="file"
              className="hidden"
              accept="video/*"
              onChange={handleVideoUpload}
              multiple
            />
          </label>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map(video => (
            <div
              key={video.id}
              className="relative bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <button
                onClick={() => removeVideo(video.id)}
                className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
              >
                <X className="w-4 h-4" />
              </button>

              <video
                src={video.url}
                controls
                className="w-full rounded-lg mb-4"
              >
                Your browser does not support the video tag.
              </video>

              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500 truncate mb-2">
                  {video.file.name}
                </span>

                <button
                  onClick={() => processVideo(video)}
                  disabled={video.isProcessing}
                  className={`px-4 py-2 text-white rounded-lg ${
                    video.isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {video.isProcessing ? 'Processing...' : 'Process Video'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Guidelines (Outside the White Box) */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 max-w-2xl w-full">
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
