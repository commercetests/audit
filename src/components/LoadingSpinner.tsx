'use client';

import { useEffect, useState } from 'react';

export default function LoadingBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress with a realistic loading animation
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        // Progress gets slower as it approaches 90%
        const increment = Math.max(1, 10 - Math.floor(oldProgress / 10));
        const newProgress = Math.min(90, oldProgress + increment);
        return newProgress;
      });
    }, 300);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="w-full py-8 px-4">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-400 bg-green-900/30">
              Analyzing Content
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-green-400">
              {progress}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-black/30 backdrop-blur-md border border-white/10">
          <div 
            style={{ width: `${progress}%` }}
            className="shadow-lg shadow-green-500/20 flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300 ease-out"
          ></div>
        </div>
      </div>
    </div>
  );
}
