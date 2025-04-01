import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Clock, Upload } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: 'Advanced Face Recognition',
      description: 'State-of-the-art AI technology to identify missing persons in CCTV footage.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with role-based access control.',
    },
    {
      icon: Clock,
      title: 'Real-time Processing',
      description: 'Process and analyze footage in real-time for quick responses.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          AI-Powered Missing Person Detection
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Advanced facial recognition technology to help locate missing persons through CCTV footage analysis.
        </p>
        <button
          onClick={() => navigate('/videoupload')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Start Search
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 py-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"
            >
              <Icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
              <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Upload Photo</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload a recent photo of the missing person
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI analyzes CCTV footage for matches
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Get Results</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Review matches with Timestamp and Clips
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}