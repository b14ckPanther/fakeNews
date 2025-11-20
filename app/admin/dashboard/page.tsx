'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocalization } from '@/lib/localization';
import { useAuth } from '@/lib/auth';
import {
  subscribeToGame,
  updateGameStatus,
  updateGameRound,
  calculateAndUpdatePlayerScore,
  createGame,
  kickPlayer,
} from '@/lib/firestore';
import { generateRound1, generateRound2, generateRound3, createGameRound } from '@/lib/gameLogic';
import Header from '@/components/Header';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PlayerCard from '@/components/PlayerCard';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Game, GameStatus, GameRound } from '@/types/game';
import { Play, Users, ArrowRight, Trophy } from 'lucide-react';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t, language, isRTL, fontFamily } = useLocalization();
  const [game, setGame] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [pin, setPin] = useState('');
  const [gameId, setGameId] = useState('');

  // Read PIN and gameId from URL parameters
  useEffect(() => {
    const urlPin = searchParams.get('pin') || '';
    const urlGameId = searchParams.get('gameId') || '';
    if (urlPin) {
      setPin(urlPin);
    }
    if (urlGameId) {
      setGameId(urlGameId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !isAdmin) {
      router.push('/admin/login');
      return;
    }
  }, [user, isAdmin, authLoading, router]);

  const handleStartGame = async () => {
    if (!game) return;

    const round1Sentences = generateRound1();
    const round1Data = createGameRound(1, round1Sentences);

    await updateGameRound(pin, 1, round1Data);
    await updateGameStatus(pin, 'round1');
  };

  const handleNextRound = useCallback(async () => {
    if (!game || !pin) return;

    const currentRoundNum = game.currentRound || 1;

    if (currentRoundNum === 1) {
      const round1Sentences = game.rounds[1]?.sentences || generateRound1();
      const round2Sentences = generateRound2(round1Sentences);
      const round2Data = createGameRound(2, round2Sentences, game.rounds[1]);

      await updateGameRound(pin, 2, round2Data);
      await updateGameStatus(pin, 'round2');
    } else if (currentRoundNum === 2) {
      const playerIds = Object.keys(game.players);
      await Promise.all(
        playerIds.map((playerId) => calculateAndUpdatePlayerScore(pin, playerId))
      );

      const round2Sentences = game.rounds[2]?.sentences || [];
      const round3Sentences = generateRound3(round2Sentences);
      const round3Data = createGameRound(3, round3Sentences, game.rounds[2]);

      await updateGameRound(pin, 3, round3Data);
      await updateGameStatus(pin, 'round3');
    } else if (currentRoundNum === 3) {
      const playerIds = Object.keys(game.players);
      await Promise.all(
        playerIds.map((playerId) => calculateAndUpdatePlayerScore(pin, playerId))
      );

      await updateGameStatus(pin, 'results');
    }
  }, [game, pin]);

  const handleShowResults = async () => {
    router.push(`/admin/results?gameId=${pin}`);
  };

  const handleCreateGame = async () => {
    if (!user) return;
    
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const createdGameId = await createGame(user.uid, newPin);
      setPin(newPin);
      setGameId(createdGameId);
      // Update URL without navigation to preserve state
      router.push(`/admin/dashboard?gameId=${createdGameId}&pin=${newPin}`);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const getQRCodeUrl = () => {
    if (typeof window !== 'undefined' && pin) {
      return `${window.location.origin}/player?pin=${pin}`;
    }
    return '';
  };

  // Memoize QR code URL to prevent unnecessary re-renders
  const qrCodeUrl = getQRCodeUrl();

  // Subscribe to game when PIN is set
  useEffect(() => {
    if (!pin || !isAdmin) return;

    const unsubscribe = subscribeToGame(pin, (gameData) => {
      setGame(gameData);
      if (gameData && gameData.currentRound && gameData.rounds[gameData.currentRound]) {
        setCurrentRound(gameData.rounds[gameData.currentRound]);
      }
    });

    return () => unsubscribe();
  }, [pin, isAdmin]);

  // Auto-advance to next round when timer expires (only once)
  useEffect(() => {
    if (!game || !currentRound || !pin) return;
    if (game.status !== 'round1' && game.status !== 'round2' && game.status !== 'round3') return;

    const checkTimer = () => {
      const now = Date.now();
      if (now >= currentRound.endTime) {
        handleNextRound();
        return true; // Signal that we advanced
      }
      return false;
    };

    // Check immediately
    if (checkTimer()) {
      return;
    }

    // Then check every second
    const interval = setInterval(() => {
      if (checkTimer()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.currentRound, currentRound?.endTime, pin, game?.status]);

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const players = game ? Object.values(game.players) : [];
  const canStart = game && game.status === 'lobby' && players.length > 0;
  const canNextRound =
    game &&
    (game.status === 'round1' || game.status === 'round2' || game.status === 'round3') &&
    currentRound &&
    Date.now() >= currentRound.endTime;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Animated background matching player UI */}
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
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
              {language === 'en' ? 'Admin Dashboard' : language === 'he' ? 'לוח בקרה' : 'لوحة تحكم المدير'}
            </h1>
            {!pin && (
              <motion.button
                onClick={handleCreateGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 transition-all shadow-2xl border-2 border-white/30"
              >
                {language === 'en' ? 'Create New Game' : language === 'he' ? 'צור משחק חדש' : 'إنشاء لعبة جديدة'}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Only show PIN and QR code when game is in lobby status */}
        {pin && game && game.status === 'lobby' && (
          <div className="mb-6 grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl border-2 border-white/20 dark:border-dark-border">
              <p className="text-sm text-white/70 dark:text-dark-text-secondary mb-1">
                {language === 'en' ? 'Game PIN' : language === 'he' ? 'PIN של המשחק' : 'رمز اللعبة'}
              </p>
              <p className="text-2xl font-mono font-bold text-white dark:text-primary-400">{pin}</p>
              <p className="text-xs text-white/60 dark:text-dark-text-tertiary mt-2">
                {language === 'en' 
                  ? 'Share this PIN with players to join' 
                  : language === 'he' 
                  ? 'שתף את ה-PIN הזה עם שחקנים להצטרפות' 
                  : 'شارك رمز PIN هذا مع اللاعبين للانضمام'}
              </p>
            </div>
            <div className="flex items-center justify-center">
              {qrCodeUrl && <QRCodeDisplay value={qrCodeUrl} size={150} />}
            </div>
          </div>
        )}

        {game && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-2 border-white/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                      {t('lobby.players')} ({players.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {players.length === 0 ? (
                      <p className="text-white/70 text-center py-8 font-semibold">
                        {language === 'en' && 'Waiting for players to join...'}
                        {language === 'he' && 'ממתין לשחקנים להצטרף...'}
                        {language === 'ar' && 'في انتظار انضمام اللاعبين...'}
                      </p>
                    ) : (
                      players.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <PlayerCard
                            name={player.name}
                            score={player.score || 0}
                            showKickButton={true}
                            onKick={async () => {
                              if (pin && window.confirm(
                                language === 'en' 
                                  ? `Are you sure you want to kick ${player.name}?`
                                  : language === 'he'
                                  ? `האם אתה בטוח שברצונך להסיר את ${player.name}?`
                                  : `هل أنت متأكد أنك تريد طرد ${player.name}؟`
                              )) {
                                await kickPlayer(pin, player.id);
                              }
                            }}
                          />
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>

              {game.status === 'results' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-2 border-white/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10" />
                  <motion.button
                    onClick={handleShowResults}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10 w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 transition-all shadow-2xl border-2 border-white/30"
                  >
                    <Trophy className="w-6 h-6" />
                    <span>{t('results.title')}</span>
                  </motion.button>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-2 border-white/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />
                <div className="relative z-10">
                  <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
                    {language === 'en' ? 'Game Controls' : language === 'he' ? 'בקרות משחק' : 'أدوات التحكم'}
                  </h2>
                  <div className="space-y-3">
                    {game.status === 'lobby' && (
                      <motion.button
                        onClick={handleStartGame}
                        disabled={!canStart}
                        whileHover={{ scale: !canStart ? 1 : 1.05 }}
                        whileTap={{ scale: !canStart ? 1 : 0.95 }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all shadow-2xl border-2 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-5 h-5" />
                        <span>{t('admin.startGame')}</span>
                      </motion.button>
                    )}

                    {(game.status === 'round1' ||
                      game.status === 'round2' ||
                      game.status === 'round3') && (
                      <>
                        <div className="text-center p-4 bg-white/10 rounded-xl border-2 border-white/20 backdrop-blur-sm">
                          <p className="text-sm text-white/70 mb-1 font-medium">
                            {language === 'en' ? 'Round' : language === 'he' ? 'סיבוב' : 'الجولة'}
                          </p>
                          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                            {game.currentRound || 1}
                          </p>
                        </div>
                        
                        {/* Manual proceed button - always enabled */}
                        <motion.button
                          onClick={handleNextRound}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all shadow-2xl border-2 border-white/30"
                        >
                          <ArrowRight className="w-5 h-5" />
                          <span>
                            {language === 'en' ? 'Proceed to Next Round' : language === 'he' ? 'המשך לסיבוב הבא' : 'المتابعة إلى الجولة التالية'}
                          </span>
                        </motion.button>
                        
                        {/* Auto-enabled next round button when timer expires */}
                        {canNextRound && (
                          <motion.button
                            onClick={handleNextRound}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 transition-all shadow-2xl border-2 border-white/30 mt-2"
                          >
                            <ArrowRight className="w-5 h-5" />
                            <span>{t('admin.nextRound')}</span>
                          </motion.button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-2 border-white/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />
                <div className="relative z-10">
                  <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
                    {language === 'en' ? 'Status' : language === 'he' ? 'סטטוס' : 'الحالة'}
                  </h2>
                  <p className="text-lg font-bold text-white capitalize">{game.status}</p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}

