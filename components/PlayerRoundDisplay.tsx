'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLocalization } from '@/lib/localization';
import { useTheme } from '@/lib/theme';
import SentenceCard from './SentenceCard';
import Timer from './Timer';
import { GameRound, Sentence, Game } from '@/types/game';
import { SkipForward, Sparkles } from 'lucide-react';

interface PlayerRoundDisplayProps {
  game: Game;
  currentRound: GameRound;
  currentAnswers: { [sentenceId: string]: boolean };
  onAnswer: (sentenceId: string, isFake: boolean) => void;
  onSkip: () => void;
  playerReady?: boolean;
}

export default function PlayerRoundDisplay({
  game,
  currentRound,
  currentAnswers,
  onAnswer,
  onSkip,
  playerReady,
}: PlayerRoundDisplayProps) {
  const { language, isRTL, fontFamily } = useLocalization();
  const { isDark } = useTheme();

  const allAnswered = currentRound.sentences.every((s) => currentAnswers[s.id] !== undefined);
  const isRound1 = game.currentRound === 1;

  return (
    <div
      className="min-h-screen p-4 relative overflow-hidden"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-dark-bg dark:via-dark-bg-secondary dark:to-dark-bg-tertiary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(120,119,198,0.2), transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(120,119,198,0.2), transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(120,119,198,0.2), transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Floating particles effect */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="max-w-5xl mx-auto pt-8 relative z-10">
        {/* Round Header with Glow Effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl blur-xl opacity-50"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-white/10 dark:bg-dark-bg-secondary/50 backdrop-blur-md rounded-2xl px-8 py-6 border-2 border-white/20 dark:border-dark-border shadow-2xl">
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
                {language === 'en' ? 'ROUND' : language === 'he' ? 'סיבוב' : 'الجولة'}{' '}
                <span className="text-6xl">{game.currentRound}</span>
              </h1>
              {isRound1 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-semibold text-white/90">
                    {language === 'en' ? 'READ ONLY' : language === 'he' ? 'קריאה בלבד' : 'للقراءة فقط'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timer - Always visible */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <div className="inline-block bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 border-2 border-white/20">
              <Timer
                startTime={currentRound.startTime}
                duration={currentRound.duration}
                onComplete={onSkip}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Sentences Grid with 3D effect */}
        <div className="grid gap-6 mb-8">
          {currentRound.sentences.map((sentence, index) => (
            <motion.div
              key={sentence.id}
              initial={{ opacity: 0, y: 30, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              style={{ perspective: '1000px' }}
            >
              <SentenceCard
                sentence={sentence}
                onAnswer={(isFake) => onAnswer(sentence.id, isFake)}
                selectedAnswer={currentAnswers[sentence.id] !== undefined ? currentAnswers[sentence.id] : null}
                disabled={currentAnswers[sentence.id] !== undefined}
                readOnly={isRound1}
              />
            </motion.div>
          ))}
        </div>

        {/* Skip/Finish Button with Glow */}
        {(isRound1 || allAnswered) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.button
              onClick={onSkip}
              disabled={isRound1 && playerReady}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl blur-lg opacity-60"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-500 dark:via-pink-500 dark:to-blue-500 text-white rounded-2xl font-bold text-lg shadow-2xl border-2 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed">
                <SkipForward className="w-6 h-6" />
                <span>
                  {isRound1
                    ? playerReady
                      ? (language === 'en' ? 'Waiting...' : language === 'he' ? 'ממתין...' : 'في الانتظار...')
                      : (language === 'en' ? 'Finished Reading' : language === 'he' ? 'סיימתי לקרוא' : 'انتهيت من القراءة')
                    : (language === 'en' ? 'Skip' : language === 'he' ? 'דלג' : 'تخطي')}
                </span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

