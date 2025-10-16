'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(images.length > 0 ? images[0] : null);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  
  // Filter out images that failed to load
  const validImages = images.filter(img => !imgError[img]);
  
  if (validImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-md">
        <p className="text-green-400">No valid images available</p>
      </div>
    );
  }

  // If the selected image has an error, select the first valid image
  if (selectedImage && imgError[selectedImage] && validImages.length > 0) {
    setSelectedImage(validImages[0]);
  }

  return (
    <div className="space-y-4">
      {/* Main selected image */}
      {selectedImage && (
        <div className="relative w-full h-48 backdrop-blur-md bg-black/20 rounded-xl overflow-hidden border border-white/10 shadow-md">
          <Image
            src={selectedImage}
            alt="Product image"
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onError={() => {
              setImgError(prev => ({ ...prev, [selectedImage]: true }));
            }}
            unoptimized // Skip Next.js image optimization for external URLs
          />
        </div>
      )}
      
      {/* Thumbnail gallery */}
      {validImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 mt-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 shadow-md ${
                selectedImage === image ? 'border-green-500' : 'border-white/10'
              } backdrop-blur-sm ${selectedImage === image ? 'bg-green-900/20' : 'bg-black/30'}`}
            >
              <Image
                src={image}
                alt={`Product thumbnail ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="64px"
                onError={() => {
                  setImgError(prev => ({ ...prev, [image]: true }));
                }}
                unoptimized // Skip Next.js image optimization for external URLs
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
