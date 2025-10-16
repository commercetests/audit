'use client';

import { useState } from 'react';
import UrlForm from '@/components/UrlForm';
import AuditResults, { AuditResultData } from '@/components/AuditResults';
import LoadingBar from '@/components/LoadingBar';
import ContentEvaluation from '@/components/ContentEvaluation';
import Image from 'next/image';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AuditResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze the URL');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-black to-green-900">
      <div className="container mx-auto py-12 px-4">
        <header className="text-center mb-12 flex flex-col items-center">
          <div className="relative w-64 h-16 mb-4">
            <Image 
              src="/alan-green.png" 
              alt="Alan Audit Logo" 
              fill
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1 className="text-4xl font-bold text-green-400 mb-3">Alan Audit</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Enter an Amazon product URL to analyze its content quality based on images, title, bullet points, 
            description, and enhanced content.
          </p>
        </header>
        
        <div className="flex flex-col items-center w-full">
          <div className="w-full backdrop-blur-lg bg-white/10 shadow-lg rounded-3xl p-8 mb-8 border border-white/20">
            <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
          
          {error && (
            <div className="mt-6 p-5 backdrop-blur-lg bg-red-900/30 border border-red-500/30 rounded-2xl text-red-300 w-full shadow-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {isLoading && <LoadingBar />}
          
          {results && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AuditResults data={results} />
              <ContentEvaluation data={results} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
