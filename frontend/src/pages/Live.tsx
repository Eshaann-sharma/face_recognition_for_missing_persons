import React, { useState } from 'react';
import { Camera } from '../types';
import { Wifi, WifiOff } from 'lucide-react';

export function Live() {
  const [cameras] = useState<Camera[]>([
    {
      id: 'CAM_001',
      name: 'Central Station - Platform 2',
      location: 'Central Station',
      status: 'online',
    },
    {
      id: 'CAM_002',
      name: 'Shopping Mall - East Entrance',
      location: 'City Mall',
      status: 'offline',
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Live Surveillance
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor connected CCTV cameras in real-time
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {camera.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{camera.location}</p>
              </div>
              <div className={`flex items-center ${
                camera.status === 'online' ? 'text-green-500' : 'text-red-500'
              }`}>
                {camera.status === 'online' ? (
                  <Wifi className="h-5 w-5" />
                ) : (
                  <WifiOff className="h-5 w-5" />
                )}
                <span className="ml-2 capitalize">{camera.status}</span>
              </div>
            </div>

            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              {camera.status === 'online' ? (
                <div className="text-center">
                  <p className="text-gray-400">Live feed placeholder</p>
                  <p className="text-sm text-gray-500">WebRTC stream would appear here</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <WifiOff className="h-12 w-12 mx-auto mb-2" />
                  <p>Camera Offline</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}