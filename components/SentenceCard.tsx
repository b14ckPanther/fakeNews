'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
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
    if (!disabled && !readOnly && onAnswer) {
      onAnswer(isFake);
    }
  };

  // Read-only mode (Round 1)
  if (readOnly) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        className="p-6 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border-2 border-white/20 transition-all relative overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />
        <div className="relative z-10">
          <p className="text-xl font-semibold text-white mb-2 text-center leading-relaxed">
            {text}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
              {language === 'en' ? 'Read Only' : language === 'he' ? 'קריאה בלבד' : 'للقراءة فقط'}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Interactive mode (Rounds 2 & 3)
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`p-6 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border-2 transition-all relative overflow-hidden ${
        selectedAnswer === true
          ? 'border-red-400 bg-red-500/20'
          : selectedAnswer === false
          ? 'border-green-400 bg-green-500/20'
          : 'border-white/20 hover:border-purple-400'
      } ${disabled ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5" />
      <div className="relative z-10">
        <p className="text-xl font-semibold text-white mb-6 text-center leading-relaxed">
          {text}
        </p>
        <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <motion.button
            onClick={() => handleAnswer(true)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              selectedAnswer === true
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-300'
                : 'bg-white/10 text-red-300 hover:bg-red-500/20 border-2 border-red-400/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <X className="w-6 h-6" />
            <span>Fake</span>
          </motion.button>
          <motion.button
            onClick={() => handleAnswer(false)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              selectedAnswer === false
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-300'
                : 'bg-white/10 text-green-300 hover:bg-green-500/20 border-2 border-green-400/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Check className="w-6 h-6" />
            <span>True</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
