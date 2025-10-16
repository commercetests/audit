'use client';

import { useState } from 'react';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!url) {
      setError('Please enter an Amazon URL');
      return;
    }
    
    // Check if it's an Amazon URL
    if (!url.includes('amazon.')) {
      setError('Please enter a valid Amazon URL');
      return;
    }
    
    setError('');
    onSubmit(url);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="amazon-url" className="block text-xl font-medium text-green-400 mb-4">
            Amazon Product URL
          </label>
          <div className="relative">
            <input
              id="amazon-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.com/product-name/dp/ASIN/"
              className="w-full px-8 py-6 bg-black/30 border-2 border-green-500/30 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-xl text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-3 top-3 bg-green-600 hover:bg-green-500 text-white font-medium py-3 px-8 rounded-full transition-colors disabled:bg-green-800 disabled:text-green-200 text-lg shadow-lg"
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400 pl-6">{error}</p>}
        </div>
      </form>
    </div>
  );
}
