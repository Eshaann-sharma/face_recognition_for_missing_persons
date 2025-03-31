export interface User {
  id: string;
  email: string;
  role: 'admin' | 'investigator';
  name: string;
}

export interface DetectedMatch {
  id: string;
  confidence: number;
  timestamp: string;
  location: string;
  imageUrl: string;
  cameraId: string;
}

export interface SearchResult {
  query: string;
  matches: DetectedMatch[];
  searchId: string;
  status: 'processing' | 'completed' | 'error';
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  streamUrl?: string;
}