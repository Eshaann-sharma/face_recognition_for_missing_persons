import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Loader2 } from 'lucide-react';

export function Results() {
  const location = useLocation();
  const uploadedFile = location.state?.file || null; // Get video file
  const uploadedImage = location.state?.image || null; // Get image file

  const [isProcessing, setIsProcessing] = useState(false);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [trackedVideoUrl, setTrackedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!uploadedFile || !uploadedImage) {
      console.warn('No uploaded file or image found!');
    }
  }, [uploadedFile, uploadedImage]);

  const handleStartProcessing = async () => {
    if (!uploadedFile || !uploadedImage) {
      alert('No file or image to process!');
      return;
    }

    setIsProcessing(true);
    setTimestamps([]);
    setTrackedVideoUrl(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('video', uploadedFile);

      const response = await fetch('http://localhost:5001/detect_faces', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process file');

      const data = await response.json();

      setTimestamps(data.timestamps || []);
      setTrackedVideoUrl(`http://localhost:5001${data.video_url}`);
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Error processing file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
        Search Results
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
        <button
          onClick={handleStartProcessing}
          disabled={isProcessing}
          className={`inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              Start Processing
            </>
          )}
        </button>
      </div>

      {timestamps.length > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-900/20 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Person Found at:
          </h2>
          <ul className="flex flex-wrap gap-3">
            {timestamps.map((timestamp, index) => (
              <li
                key={index}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium"
              >
                {timestamp} sec
              </li>
            ))}
          </ul>
        </div>
      )}

      {trackedVideoUrl && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Tracked Video:
          </h2>
          
          <video controls className="w-full rounded-lg shadow-lg">
            <source src={trackedVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
