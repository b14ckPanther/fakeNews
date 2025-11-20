'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  startTime: number;
  duration: number; // in seconds
  onComplete?: () => void;
}

export default function Timer({ startTime, duration, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / duration) * 100;

  const getColor = () => {
    if (progress > 50) return 'text-success-600 bg-success-100';
    if (progress > 25) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  return (
    <div className="flex items-center gap-3 justify-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            className={progress > 50 ? 'text-success-500' : progress > 25 ? 'text-warning-500' : 'text-danger-500'}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock className={`w-6 h-6 ${progress > 50 ? 'text-success-600' : progress > 25 ? 'text-warning-600' : 'text-danger-600'}`} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
}

