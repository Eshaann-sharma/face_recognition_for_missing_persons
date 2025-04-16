import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

export function Live() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      setError('Camera access denied. Please check your permissions.');
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsAutoCapturing(false);
  };

  const captureFrame = async () => {
    if (!videoRef.current || !stream) return;
  
    setIsLoading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
  
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
  
      const response = await fetch('http://localhost:5001/api/face-recognition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        if (result.match) {
          setLastResult(`Match found: ${result.person}`);
        } else {
          setLastResult('⚠️ No match found');
        }
      } else {
        setLastResult(`Server error: ${result.error || 'Unknown error'}`);
      }
  
    } catch (err) {
      console.error('Error capturing frame:', err);
      setLastResult('Error processing image');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoCapturing && stream) {
      interval = setInterval(captureFrame, 2000);
    }
    return () => clearInterval(interval);
  }, [isAutoCapturing, stream]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-8">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Camera Access Error
          </h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={startCamera}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry Camera Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Live Face Recognition
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Use your camera to perform real-time face recognition
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="relative aspect-video mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full rounded-lg bg-black"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <RefreshCw className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={captureFrame}
            disabled={!stream || isLoading}
            className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="h-5 w-5 mr-2" />
            Capture Frame
          </button>

          <button
            onClick={() => setIsAutoCapturing(!isAutoCapturing)}
            disabled={!stream}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold ${
              isAutoCapturing
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAutoCapturing ? 'Stop Auto Capture' : 'Start Auto Capture'}
          </button>
        </div>

        {lastResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            lastResult.includes('Match')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
          }`}>
            <p className="text-center font-medium">{lastResult}</p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Camera Guidelines
        </h2>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li>• Ensure good lighting conditions</li>
          <li>• Face the camera directly</li>
          <li>• Keep a steady position</li>
          <li>• Maintain a reasonable distance from the camera</li>
          <li>• Auto-capture checks every 5 seconds</li>
        </ul>
      </div>
    </div>
  );
}