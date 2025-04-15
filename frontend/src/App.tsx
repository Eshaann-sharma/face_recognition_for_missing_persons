import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { Results } from './pages/Results';
import { VideoUpload} from './pages/videoupload';
import { useAuthStore } from './store/authStore';
import { Live } from './pages/live';

function App() {
  const { isAuthenticated, isLoading, error, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/upload"
            element={isAuthenticated ? <Upload /> : <Navigate to="/" />}
          />
          <Route
            path="/results"
            element={isAuthenticated ? <Results /> : <Navigate to="/" />}
          />
          <Route
            path="/videoupload"
            element={isAuthenticated ? <VideoUpload /> : <Navigate to="/" />}
          />
          <Route
            path="/live"
            element={isAuthenticated ? <Live /> : <Navigate to="/" />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;