'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 300 }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-lg">
      <QRCodeSVG value={value} size={size} level="H" includeMargin={true} />
      <div className="text-center">
        <p className="text-lg font-bold text-gray-800">Scan to Join</p>
        <p className="text-2xl font-mono font-bold text-primary-600 mt-2">{value}</p>
      </div>
    </div>
  );
}

