'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 300 }: QRCodeDisplayProps) {
  if (!value) return null;
  
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white/10 dark:bg-dark-bg-secondary/50 backdrop-blur-md rounded-2xl shadow-xl border-2 border-white/20 dark:border-dark-border">
      <div className="bg-white p-4 rounded-xl">
        <QRCodeSVG value={value} size={size} level="H" includeMargin={true} />
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-white dark:text-dark-text-primary">Scan to Join</p>
        <p className="text-sm text-white/70 dark:text-dark-text-secondary mt-1">
          {value.includes('pin=') ? 'Direct to name entry' : 'Join game'}
        </p>
      </div>
    </div>
  );
}

