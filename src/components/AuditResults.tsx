'use client';

import { useState } from 'react';
import ImageGallery from './ImageGallery';
import FallbackImageGallery from './FallbackImageGallery';
import ContentEvaluation from './ContentEvaluation';

export interface AuditResultData {
  title: string;
  imageCount: number;
  imageUrls: string[];
  hasVideo: boolean;
  videoCount: number;
  bulletPoints: string[];
  description: string;
  hasEnhancedContent: boolean;
  url: string;
}

interface AuditResultsProps {
  data: AuditResultData | null;
}

export default function AuditResults({ data }: AuditResultsProps) {
  const [useNextImage, setUseNextImage] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  if (!data) return null;
  
  // Switch to fallback gallery if Next.js Image component fails
  const handleImageError = () => {
    setImageError(true);
    setUseNextImage(false);
  };

  return (
    <div className="w-full h-full backdrop-blur-lg bg-white/10 shadow-lg rounded-3xl p-6 border border-white/20 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-green-400">Alan Audit Results</h2>
      
      <div className="space-y-4">
        <div className="backdrop-blur-md bg-black/20 rounded-xl p-5 border border-white/10">
          <h3 className="font-medium text-green-400 mb-2 text-lg">Product URL</h3>
          <p className="text-base text-gray-300 break-all">{data.url}</p>
        </div>
        
        <div className="backdrop-blur-md bg-black/20 rounded-xl p-5 border border-white/10">
          <h3 className="font-medium text-green-400 mb-2 text-lg">Title</h3>
          <p className="text-base text-gray-300">{data.title || 'Not found'}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-green-400 text-lg mb-4">Images & Videos</h3>
          <div className="flex items-center mb-3 backdrop-blur-md bg-black/20 rounded-xl p-4 border border-white/10">
            <span className={`text-base font-medium ${data.imageCount >= 6 ? 'text-green-400' : 'text-red-400'}`}>
              {data.imageCount} images found
            </span>
            <span className="ml-2 text-sm text-gray-400">(Required: 6+ images according to Amazon guidelines)</span>
          </div>
          <div className="flex items-center mb-4 backdrop-blur-md bg-black/20 rounded-xl p-4 border border-white/10">
            <span className={`text-base font-medium ${data.hasVideo ? 'text-green-400' : 'text-red-400'}`}>
              {data.videoCount} {data.videoCount === 1 ? 'video' : 'videos'} found
            </span>
            <span className="ml-2 text-sm text-gray-400">(Required: 1+ video according to Amazon guidelines)</span>
          </div>
          {data.imageUrls.length > 0 && (
            <>
              {useNextImage ? (
                <div onError={handleImageError}>
                  <ImageGallery images={data.imageUrls.slice(0, data.imageCount)} />
                </div>
              ) : (
                <FallbackImageGallery images={data.imageUrls.slice(0, data.imageCount)} />
              )}
              
              {imageError && (
                <p className="text-xs text-amber-600 mt-2">
                  Note: Using standard HTML images due to loading issues with Next.js Image component.
                </p>
              )}
            </>
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-green-400 text-lg mb-4">Bullet Points</h3>
          {data.bulletPoints.length > 0 ? (
            <div>
              <div className="flex items-center mb-3 backdrop-blur-md bg-black/20 rounded-xl p-4 border border-white/10">
                <span className={`text-base font-medium ${data.bulletPoints.length >= 5 ? 'text-green-400' : 'text-red-400'}`}>
                  {data.bulletPoints.length} bullet points found
                </span>
                <span className="ml-2 text-sm text-gray-400">(Recommended: 5+ bullet points)</span>
              </div>
              <ul className="list-disc list-inside text-base space-y-3 backdrop-blur-md bg-black/20 rounded-xl p-5 border border-white/10">
                {data.bulletPoints.map((bullet, index) => (
                  <li key={index} className="text-gray-300 truncate">{bullet}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-base text-red-400 backdrop-blur-md bg-black/30 border border-red-900/30 rounded-xl p-4">No bullet points found</p>
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-green-400 text-lg mb-4">Description</h3>
          {data.description ? (
            <p className="text-base text-gray-300 line-clamp-3 backdrop-blur-md bg-black/20 rounded-xl p-5 border border-white/10">{data.description}</p>
          ) : (
            <p className="text-base text-red-400 backdrop-blur-md bg-black/30 border border-red-900/30 rounded-xl p-4">No description found</p>
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-green-400 text-lg mb-4">Enhanced Content (A+ Content)</h3>
          <div className="flex items-center backdrop-blur-md bg-black/20 rounded-xl p-4 border border-white/10">
            <span className={`text-base font-medium ${data.hasEnhancedContent ? 'text-green-400' : 'text-red-400'}`}>
              {data.hasEnhancedContent ? 'Present' : 'Not present'}
            </span>
            <span className="ml-2 text-sm text-gray-400">(Required according to Amazon guidelines)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
