'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { useLocalization } from '@/lib/localization';
import { Sentence } from '@/types/game';

interface SentenceCardProps {
  sentence: Sentence;
  onAnswer?: (isFake: boolean) => void;
  selectedAnswer?: boolean | null;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function SentenceCard({
  sentence,
  onAnswer,
  selectedAnswer,
  disabled = false,
  readOnly = false,
}: SentenceCardProps) {
  const { language, isRTL } = useLocalization();
  const text = sentence.text[language];

  const handleAnswer = (isFake: boolean) => {
    if (!disabled && onAnswer) {
      onAnswer(isFake);
    }
  };

  return (
    <div
      className={`p-6 rounded-xl bg-white shadow-lg border-2 transition-all ${
        selectedAnswer === true
          ? 'border-danger-500 bg-danger-50'
          : selectedAnswer === false
          ? 'border-success-500 bg-success-50'
          : 'border-gray-200 hover:border-primary-300'
      } ${disabled ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <p className="text-lg font-medium text-gray-800 mb-4 text-center">{text}</p>
      <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={() => handleAnswer(true)}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
            selectedAnswer === true
              ? 'bg-danger-500 text-white'
              : 'bg-danger-100 text-danger-700 hover:bg-danger-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <X className="w-5 h-5" />
          <span>Fake</span>
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
            selectedAnswer === false
              ? 'bg-success-500 text-white'
              : 'bg-success-100 text-success-700 hover:bg-success-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Check className="w-5 h-5" />
          <span>True</span>
        </button>
      </div>
    </div>
  );
}

