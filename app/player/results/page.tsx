'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalization } from '@/lib/localization';
import { subscribeToGame } from '@/lib/firestore';
import { Game, Player, getScoreCategory } from '@/types/game';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Trophy, Award, Target, User, Crown, Sparkles, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function PlayerResultsPageContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '';
  const playerId = searchParams.get('playerId') || '';

  const { t, language, isRTL, fontFamily } = useLocalization();
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [showCategory, setShowCategory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(gameId, (gameData) => {
      if (gameData) {
        setGame(gameData);
        if (playerId && gameData.players[playerId]) {
          setPlayer(gameData.players[playerId]);
        }
      }
    });

    return () => unsubscribe();
  }, [gameId, playerId]);

  // Trigger animations in sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setShowCategory(true), 1500);
    const timer2 = setTimeout(() => setShowLeaderboard(true), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!game || !player) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading results...</p>
        </div>
      </div>
    );
  }

  const score = player.score || 0;
  const category = getScoreCategory(score);
  const players = Object.values(game.players)
    .map((p) => ({
      ...p,
      category: getScoreCategory(p.score || 0),
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const rank = players.findIndex((p) => p.id === playerId) + 1;

  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case 'Lie Hunter':
        return {
          icon: Trophy,
          gradient: 'from-red-500 via-pink-500 to-purple-500',
          bgGradient: 'from-red-500/20 via-pink-500/20 to-purple-500/20',
          text: language === 'en' ? 'LIE HUNTER' : language === 'he' ? 'צייד שקרים' : 'صياد الأكاذيب',
          emoji: '🎯',
        };
      case 'Lie Investigator':
        return {
          icon: Award,
          gradient: 'from-yellow-500 via-orange-500 to-red-500',
          bgGradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
          text: language === 'en' ? 'LIE INVESTIGATOR' : language === 'he' ? 'חוקר שקרים' : 'محقق الأكاذيب',
          emoji: '🔍',
        };
      case 'Truth Explorer':
        return {
          icon: Target,
          gradient: 'from-green-500 via-emerald-500 to-teal-500',
          bgGradient: 'from-green-500/20 via-emerald-500/20 to-teal-500/20',
          text: language === 'en' ? 'TRUTH EXPLORER' : language === 'he' ? 'חוקר אמת' : 'مستكشف الحقيقة',
          emoji: '🌟',
        };
      default:
        return {
          icon: User,
          gradient: 'from-white via-gray-200 to-gray-300',
          bgGradient: 'from-gray-400/20 via-gray-500/20 to-gray-600/20',
          text: language === 'en' ? 'VICTIM' : language === 'he' ? 'קורבן' : 'ضحية',
          emoji: '😔',
        };
    }
  };

  const categoryConfig = getCategoryConfig(category);
  const CategoryIcon = categoryConfig.icon;

  return (
    <div
      className="min-h-screen p-4 relative overflow-hidden"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(120,119,198,0.3), transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(120,119,198,0.3), transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(120,119,198,0.3), transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="max-w-5xl mx-auto pt-8 relative z-10">
        {/* Score reveal animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-block relative mb-6"
            animate={{
              rotate: [0, 5, -5, 5, -5, 0],
            }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-2xl opacity-60"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-white/10 backdrop-blur-md rounded-full p-8 border-4 border-white/30">
              <Trophy className="w-24 h-24 text-yellow-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4 relative"
          >
            <motion.span
              animate={{
                textShadow: [
                  '0 0 20px rgba(168,85,247,0.5)',
                  '0 0 40px rgba(236,72,153,0.8)',
                  '0 0 20px rgba(168,85,247,0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {language === 'en' ? 'YOU ARE A' : language === 'he' ? 'אתה' : 'أنت'}
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white/90 mb-6"
          >
            {player.name}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
              {score}
            </div>
            <p className="text-xl text-white/70 mt-2">
              {language === 'en' ? 'points' : language === 'he' ? 'נקודות' : 'نقاط'}
            </p>
          </motion.div>

          {/* Category badge with spectacular jumping animation */}
          <AnimatePresence>
            {showCategory && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 200, rotate: -360, x: -200 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0, 
                  rotate: 0,
                  x: 0,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 100, 
                  damping: 15,
                  delay: 0.8 
                }}
                className="inline-block relative"
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${categoryConfig.bgGradient} rounded-3xl blur-3xl opacity-70`}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 0.9, 0.7],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className={`relative bg-white/10 backdrop-blur-md rounded-3xl px-16 py-8 border-4 border-white/30 shadow-2xl`}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 5, -5, 0],
                  }}
                  transition={{
                    y: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                    rotate: {
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 1.5, repeat: Infinity },
                      }}
                      className="relative"
                    >
                      <CategoryIcon className={`w-20 h-20 text-transparent bg-clip-text bg-gradient-to-r ${categoryConfig.gradient}`} />
                      <motion.div
                        className="absolute -top-3 -right-3"
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.3, 1],
                        }}
                        transition={{ 
                          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                          scale: { duration: 1, repeat: Infinity },
                        }}
                      >
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                      </motion.div>
                    </motion.div>
                    <div className="text-center">
                      <motion.div
                        className="text-6xl mb-2"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          rotate: [0, 10, -10, 10, -10, 0],
                        }}
                        transition={{ 
                          scale: { duration: 0.8, repeat: Infinity },
                          rotate: { duration: 2, repeat: Infinity },
                        }}
                      >
                        {categoryConfig.emoji}
                      </motion.div>
                      <motion.p 
                        className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${categoryConfig.gradient} tracking-wider`}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      >
                        {categoryConfig.text}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rank display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8"
          >
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              {language === 'en' ? 'RANK #' : language === 'he' ? 'דירוג #' : 'المركز #'}
              {rank} / {players.length}
            </p>
          </motion.div>
        </motion.div>

        {/* Leaderboard */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-white/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />
              <div className="relative z-10">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6 text-center">
                  {language === 'en' ? 'LEADERBOARD' : language === 'he' ? 'לוח התוצאות' : 'لوحة المتصدرين'}
                </h2>
                <div className="space-y-4">
                  {players.map((p, index) => {
                    const isCurrentPlayer = p.id === playerId;
                    const pCategoryConfig = getCategoryConfig(p.category);
                    const PCategoryIcon = pCategoryConfig.icon;
                    const isTopThree = index < 3;

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        whileHover={{ scale: 1.02, x: isRTL ? -10 : 10 }}
                        className={`p-5 rounded-2xl border-2 backdrop-blur-md transition-all ${
                          isCurrentPlayer
                            ? 'bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 border-purple-400 shadow-2xl'
                            : 'bg-white/5 border-white/20 hover:border-purple-300/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {isTopThree ? (
                              <motion.div
                                animate={{
                                  rotate: [0, 10, -10, 10, -10, 0],
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="relative"
                              >
                                <Crown className={`w-10 h-10 ${
                                  index === 0 ? 'text-yellow-400' :
                                  index === 1 ? 'text-gray-300' :
                                  'text-orange-400'
                                }`} />
                                <motion.div
                                  className="absolute -top-2 -right-2"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                >
                                  <Sparkles className="w-5 h-5 text-purple-400" />
                                </motion.div>
                              </motion.div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                                {index + 1}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-white text-lg">{p.name}</p>
                                {isCurrentPlayer && (
                                  <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    className="text-yellow-400"
                                  >
                                    <Star className="w-5 h-5 fill-yellow-400" />
                                  </motion.span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <PCategoryIcon className={`w-4 h-4 text-transparent bg-clip-text bg-gradient-to-r ${pCategoryConfig.gradient}`} />
                                <span className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${pCategoryConfig.gradient}`}>
                                  {pCategoryConfig.text}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${pCategoryConfig.gradient}`}>
                              {p.score || 0}
                            </p>
                            <p className="text-sm text-white/60">
                              {language === 'en' ? 'pts' : language === 'he' ? 'נק' : 'نق'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PlayerResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <PlayerResultsPageContent />
    </Suspense>
  );
}
