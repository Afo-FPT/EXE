'use client';

import { useState, useEffect } from 'react';

export const BackendStatus = () => {
  const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkBackend = async () => {
    try {
      setIsChecking(true);
      const response = await fetch('http://localhost:5000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsBackendUp(true);
      } else {
        setIsBackendUp(false);
      }
    } catch (error) {
      console.error('Backend check failed:', error);
      setIsBackendUp(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBackend();
    
    // Check every 10 seconds
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="fixed top-4 left-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span className="text-sm font-medium">Đang kiểm tra backend...</span>
        </div>
      </div>
    );
  }

  if (!isBackendUp) {
    return null; // Không hiển thị gì khi backend down
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">✅ Backend đang hoạt động</span>
      </div>
    </div>
  );
};

