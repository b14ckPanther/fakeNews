'use client';

import React from 'react';
import { User } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  score?: number;
  isCurrentPlayer?: boolean;
  isReady?: boolean;
}

export default function PlayerCard({ name, score, isCurrentPlayer, isReady }: PlayerCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-dark-bg-tertiary shadow-md border-2 transition-all ${
        isCurrentPlayer ? 'ring-2 ring-primary-500 dark:ring-primary-400' : 'border-gray-200 dark:border-dark-border'
      } ${isReady ? 'border-success-400 dark:border-success-500 bg-success-50 dark:bg-success-900/20' : ''}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isReady 
          ? 'bg-success-100 dark:bg-success-900/30' 
          : 'bg-primary-100 dark:bg-primary-900/30'
      }`}>
        <User className={`w-6 h-6 ${
          isReady 
            ? 'text-success-600 dark:text-success-400' 
            : 'text-primary-600 dark:text-primary-400'
        }`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-800 dark:text-dark-text-primary">{name}</p>
          {isReady && (
            <span className="px-2 py-0.5 bg-success-500 dark:bg-success-600 text-white text-xs rounded-full font-semibold">
              ✓
            </span>
          )}
        </div>
        {score !== undefined && (
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Score: {score}</p>
        )}
      </div>
    </div>
  );
}

