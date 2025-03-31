import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DetectedMatch } from '../types';
import { MapPin, Calendar, Percent } from 'lucide-react';

export function Results() {
  const [matches, setMatches] = useState<DetectedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchResults = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data
      const mockMatches: DetectedMatch[] = [
        {
          id: '1',
          confidence: 89.5,
          timestamp: new Date().toISOString(),
          location: 'Central Station, Platform 2',
          imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
          cameraId: 'CAM_001'
        },
        {
          id: '2',
          confidence: 76.8,
          timestamp: new Date().toISOString(),
          location: 'Shopping Mall, East Entrance',
          imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
          cameraId: 'CAM_003'
        }
      ];

      setMatches(mockMatches);
      setIsLoading(false);
    };

    fetchResults();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Search Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {matches.length} potential matches in CCTV footage
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            <div className="relative">
              <img
                src={match.imageUrl}
                alt={`Match ${match.id}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-semibold flex items-center">
                <Percent className="h-4 w-4 mr-1" />
                {match.confidence.toFixed(1)}%
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{match.location}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(new Date(match.timestamp), 'PPp')}</span>
                </div>
              </div>

              <button
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // Implement view details logic
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}