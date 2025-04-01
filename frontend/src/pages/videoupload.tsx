import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

export interface VideoFile {
  id: string;
  file: File;
  url: string;
  isProcessing: boolean;
  isProcessed: boolean;
}

export function VideoUpload() {
  const [videos, setVideos] = useState<VideoFile[]>([]);

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

  const removeVideo = (id: string) => {
    setVideos(prev => {
      const filtered = prev.filter(video => video.id !== id);
      // Cleanup URL object
      const videoToRemove = prev.find(video => video.id === id);
      if (videoToRemove) {
        URL.revokeObjectURL(videoToRemove.url);
      }
      return filtered;
    });
  };

  const processVideo = async (id: string) => {
    setVideos(prev => 
      prev.map(video => 
        video.id === id ? { ...video, isProcessing: true } : video
      )
    );

    try {
      // Simulating processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVideos(prev => 
        prev.map(video => 
          video.id === id ? { ...video, isProcessing: false, isProcessed: true } : video
        )
      );
    } catch (error) {
      console.error('Error processing video:', error);
      alert('Error processing video');
      
      setVideos(prev => 
        prev.map(video => 
          video.id === id ? { ...video, isProcessing: false } : video
        )
      );
    }
  };

  const processAllVideos = () => {
    videos
      .filter(video => !video.isProcessed && !video.isProcessing)
      .forEach(video => processVideo(video.id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Face Recognition Video Upload
      </h1>

      {/* Upload Section */}
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
            <p className="text-xs text-gray-500">MP4, WebM, or Ogg (MAX. 100MB)</p>
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

      {/* Process All Button */}
      {videos.length > 0 && (
        <button
          onClick={processAllVideos}
          className="w-full mb-6 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Process All Videos
        </button>
      )}

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
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 truncate">
                {video.file.name}
              </span>
              
              {video.isProcessed ? (
                <span className="text-green-600 text-sm font-medium">
                  Processed ✓
                </span>
              ) : (
                <button
                  onClick={() => processVideo(video.id)}
                  disabled={video.isProcessing}
                  className={`px-4 py-2 text-white rounded-lg ${
                    video.isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {video.isProcessing ? 'Processing...' : 'Process Video'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}