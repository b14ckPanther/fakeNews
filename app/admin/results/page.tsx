'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocalization } from '@/lib/localization';
import { useAuth } from '@/lib/auth';
import Header from '@/components/Header';
import { subscribeToGame } from '@/lib/firestore';
import { Game, PlayerScore, getScoreCategory } from '@/types/game';
import { Trophy, Users, Award, Crown, Sparkles, Star, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AdminResultsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = searchParams.get('gameId') || '';

  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t, language, isRTL, fontFamily } = useLocalization();
  const [game, setGame] = useState<Game | null>(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !isAdmin) {
      router.push('/admin/login');
      return;
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!gameId) {
      router.push('/');
      return;
    }

    const unsubscribe = subscribeToGame(gameId, (gameData) => {
      if (gameData) {
        setGame(gameData);
      }
    });

    return () => unsubscribe();
  }, [gameId, router]);

  useEffect(() => {
    if (game) {
      setTimeout(() => setShowContent(true), 500);
    }
  }, [game]);

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'Lie Hunter':
        return {
          icon: Trophy,
          gradient: 'from-red-500 via-pink-500 to-purple-500',
          bgGradient: 'from-red-500/20 via-pink-500/20 to-purple-500/20',
          text: language === 'en' ? 'LIE HUNTER' : language === 'he' ? 'צייד שקרים' : 'صياد الأكاذيب',
        };
      case 'Lie Investigator':
        return {
          icon: Award,
          gradient: 'from-yellow-500 via-orange-500 to-red-500',
          bgGradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
          text: language === 'en' ? 'LIE INVESTIGATOR' : language === 'he' ? 'חוקר שקרים' : 'محقق الأكاذيب',
        };
      case 'Truth Explorer':
        return {
          icon: Target,
          gradient: 'from-green-500 via-emerald-500 to-teal-500',
          bgGradient: 'from-green-500/20 via-emerald-500/20 to-teal-500/20',
          text: language === 'en' ? 'TRUTH EXPLORER' : language === 'he' ? 'חוקר אמת' : 'مستكشف الحقيقة',
        };
      default:
        return {
          icon: Users,
          gradient: 'from-gray-400 via-gray-500 to-gray-600',
          bgGradient: 'from-gray-400/20 via-gray-500/20 to-gray-600/20',
          text: language === 'en' ? 'VICTIM' : language === 'he' ? 'קורבן' : 'ضحية',
        };
    }
  };

  if (authLoading) {
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
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  if (!game) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
            <p className="text-white">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  const players = Object.values(game.players);
  const playerScores: PlayerScore[] = players
    .map((player) => ({
      playerId: player.id,
      playerName: player.name,
      score: player.score || 0,
      category: getScoreCategory(player.score || 0),
    }))
    .sort((a, b) => b.score - a.score);

  const categoryCounts = {
    'Lie Hunter': playerScores.filter((p) => p.category === 'Lie Hunter').length,
    'Lie Investigator': playerScores.filter((p) => p.category === 'Lie Investigator').length,
    'Truth Explorer': playerScores.filter((p) => p.category === 'Truth Explorer').length,
    Victim: playerScores.filter((p) => p.category === 'Victim').length,
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
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

      <Header />
      
      <div className="max-w-6xl mx-auto p-4 pt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            {t('admin.results')}
          </h1>
        </motion.div>

        {/* Category summary cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {Object.entries(categoryCounts).map(([category, count], index) => {
            const config = getCategoryConfig(category);
            const Icon = config.icon;
            return (
              <AnimatePresence key={category}>
                {showContent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-2 border-white/20 relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient}`} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        >
                          <Icon className={`w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`} />
                        </motion.div>
                        <h2 className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                          {t(`category.${category.toLowerCase().replace(/ /g, '')}`)}
                        </h2>
                      </div>
                      <motion.p
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
                        className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}
                      >
                        {count}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>

        {/* Leaderboard */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-white/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2 text-center relative">
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
                      {language === 'en' ? 'FINAL LEADERBOARD' : language === 'he' ? 'לוח התוצאות הסופי' : 'لوحة المتصدرين النهائية'}
                    </motion.span>
                  </h2>
                  {playerScores[0]?.category === 'Lie Hunter' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-center mb-6"
                    >
                      🏆 {language === 'en' ? 'CHAMPION: LIE HUNTER' : language === 'he' ? 'אלוף: צייד שקרים' : 'بطل: صياد الأكاذيب'} 🏆
                    </motion.p>
                  )}
                </motion.div>
                <div className="space-y-4">
                  {playerScores.map((player, index) => {
                    const config = getCategoryConfig(player.category);
                    const Icon = config.icon;
                    const isTopThree = index < 3;
                    const isWinner = index === 0 && player.category === 'Lie Hunter';

                    return (
                      <motion.div
                        key={player.playerId}
                        initial={{ opacity: 0, x: isRTL ? -100 : 100, y: 100, scale: 0.5, rotate: -45 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0, 
                          y: 0,
                          scale: 1,
                          rotate: 0,
                        }}
                        transition={{ 
                          delay: 0.7 + index * 0.15,
                          type: 'spring',
                          stiffness: 150,
                          damping: 15,
                        }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className={`p-6 rounded-2xl border-2 backdrop-blur-md transition-all relative overflow-hidden ${
                          isTopThree
                            ? 'bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 border-purple-400 shadow-2xl'
                            : 'bg-white/5 border-white/20 hover:border-purple-300/50'
                        }`}
                      >
                        {/* Winner glow effect */}
                        {isWinner && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20"
                            animate={{
                              opacity: [0.3, 0.7, 0.3],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {isTopThree ? (
                              <motion.div
                                animate={{
                                  rotate: [0, 15, -15, 15, -15, 0],
                                  scale: [1, 1.3, 1],
                                  y: isWinner ? [0, -10, 0] : 0,
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity,
                                  y: { duration: 1.5, repeat: Infinity },
                                }}
                                className="relative"
                              >
                                <Crown className={`w-14 h-14 ${
                                  index === 0 ? 'text-yellow-400 drop-shadow-lg' :
                                  index === 1 ? 'text-gray-300' :
                                  'text-orange-400'
                                }`} />
                                {index === 0 && (
                                  <>
                                    <motion.div
                                      className="absolute -top-3 -right-3"
                                      animate={{ 
                                        rotate: 360, 
                                        scale: [1, 1.3, 1],
                                      }}
                                      transition={{ 
                                        rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                                        scale: { duration: 1.5, repeat: Infinity },
                                      }}
                                    >
                                      <Sparkles className="w-8 h-8 text-purple-400" />
                                    </motion.div>
                                    <motion.div
                                      className="absolute -bottom-2 -left-2"
                                      animate={{ 
                                        rotate: -360, 
                                        scale: [1, 1.2, 1],
                                      }}
                                      transition={{ 
                                        rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                                        scale: { duration: 1, repeat: Infinity },
                                      }}
                                    >
                                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                                    </motion.div>
                                  </>
                                )}
                              </motion.div>
                            ) : (
                              <motion.div 
                                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-lg"
                                whileHover={{ scale: 1.2 }}
                              >
                                {index + 1}
                              </motion.div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <motion.p 
                                  className="font-black text-white text-2xl"
                                  animate={isWinner ? {
                                    scale: [1, 1.05, 1],
                                  } : {}}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  {player.playerName}
                                </motion.p>
                                {isTopThree && (
                                  <motion.span
                                    animate={{ 
                                      scale: [1, 1.3, 1],
                                      rotate: [0, 180, 360],
                                    }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-yellow-400"
                                  >
                                    <Star className="w-6 h-6 fill-yellow-400" />
                                  </motion.span>
                                )}
                                {isWinner && (
                                  <motion.span
                                    animate={{ 
                                      scale: [1, 1.2, 1],
                                      x: [0, 5, -5, 5, -5, 0],
                                    }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    className="text-yellow-400"
                                  >
                                    <Sparkles className="w-6 h-6" />
                                  </motion.span>
                                )}
                              </div>
                              <motion.div 
                                className="flex items-center gap-2"
                                animate={isWinner ? {
                                  x: [0, 5, -5, 0],
                                } : {}}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <Icon className={`w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`} />
                                <span className={`text-base font-bold text-transparent bg-clip-text bg-gradient-to-r ${config.gradient} tracking-wide`}>
                                  {config.text}
                                </span>
                              </motion.div>
                            </div>
                          </div>
                          <div className="text-right">
                            <motion.p 
                              className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}
                              animate={isWinner ? {
                                scale: [1, 1.1, 1],
                              } : {}}
                              transition={{ duration: 1.2, repeat: Infinity }}
                            >
                              {player.score}
                            </motion.p>
                            <p className="text-sm text-white/60 font-medium">
                              {language === 'en' ? 'points' : language === 'he' ? 'נקודות' : 'نقاط'}
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

export default function AdminResultsPage() {
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
      <AdminResultsPageContent />
    </Suspense>
  );
}
