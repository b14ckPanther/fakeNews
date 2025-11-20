'use client';

import React from 'react';
import { User } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  score?: number;
  isCurrentPlayer?: boolean;
}

export default function PlayerCard({ name, score, isCurrentPlayer }: PlayerCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl bg-white shadow-md ${
        isCurrentPlayer ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
        <User className="w-6 h-6 text-primary-600" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{name}</p>
        {score !== undefined && (
          <p className="text-sm text-gray-600">Score: {score}</p>
        )}
      </div>
    </div>
  );
}

