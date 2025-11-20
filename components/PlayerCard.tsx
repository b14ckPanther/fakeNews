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
      className={`flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-md shadow-lg border-2 transition-all ${
        isCurrentPlayer
          ? 'border-purple-400 bg-purple-500/20'
          : 'border-white/20 hover:border-purple-300/50'
      } ${isReady ? 'border-green-400 bg-green-500/20' : ''}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isReady 
          ? 'bg-green-500/30 border-2 border-green-400' 
          : 'bg-purple-500/30 border-2 border-purple-400'
      }`}>
        <User className={`w-6 h-6 ${
          isReady 
            ? 'text-green-300' 
            : 'text-purple-300'
        }`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white">{name}</p>
            {isReady && (
              <span className="text-xs text-green-400 font-semibold">
                ✓ Ready
              </span>
            )}
          </div>
          {score !== undefined && (
            <div className="text-right">
              <p className="text-sm text-white/70 font-medium">Score</p>
              <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">{score}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
