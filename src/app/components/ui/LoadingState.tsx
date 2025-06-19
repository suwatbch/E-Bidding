'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
  error?: string | null;
}

export default function LoadingState({
  message = 'Loading...',
  error,
}: LoadingStateProps) {
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error</div>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
