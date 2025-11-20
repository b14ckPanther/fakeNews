'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocalization } from '@/lib/localization';
import { useAuth } from '@/lib/auth';
import {
  subscribeToGame,
  updateGameStatus,
  updateGameRound,
  calculateAndUpdatePlayerScore,
  createGame,
} from '@/lib/firestore';
import { generateRound1, generateRound2, generateRound3, createGameRound } from '@/lib/gameLogic';
import Header from '@/components/Header';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PlayerCard from '@/components/PlayerCard';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Game, GameStatus, GameRound } from '@/types/game';
import { Play, Users, ArrowRight, Trophy } from 'lucide-react';
import { Suspense } from 'react';

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

  const handleNextRound = async () => {
    if (!game) return;

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
  };

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
      className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <Header />
      
      <div className="max-w-6xl mx-auto p-4 pt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {language === 'en' ? 'Admin Dashboard' : language === 'he' ? 'לוח בקרה' : 'لوحة تحكم المدير'}
            </h1>
            {!pin && (
              <button
                onClick={handleCreateGame}
                className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                {language === 'en' ? 'Create New Game' : language === 'he' ? 'צור משחק חדש' : 'إنشاء لعبة جديدة'}
              </button>
            )}
          </div>
        </div>

        {pin && (
          <div className="mb-6 grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border-2 border-gray-200 dark:border-dark-border">
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">
                {language === 'en' ? 'Game PIN' : language === 'he' ? 'PIN של המשחק' : 'رمز اللعبة'}
              </p>
              <p className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">{pin}</p>
              <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">
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
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    {t('lobby.players')} ({players.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {players.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      {language === 'en' && 'Waiting for players to join...'}
                      {language === 'he' && 'ממתין לשחקנים להצטרף...'}
                      {language === 'ar' && 'في انتظار انضمام اللاعبين...'}
                    </p>
                  ) : (
                    players.map((player) => (
                      <PlayerCard
                        key={player.id}
                        name={player.name}
                        score={player.score || 0}
                      />
                    ))
                  )}
                </div>
              </div>

              {game.status === 'results' && (
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <button
                    onClick={handleShowResults}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <Trophy className="w-6 h-6" />
                    <span>{t('results.title')}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {language === 'en' ? 'Game Controls' : language === 'he' ? 'בקרות משחק' : 'أدوات التحكم'}
                </h2>
                <div className="space-y-3">
                  {game.status === 'lobby' && (
                    <button
                      onClick={handleStartGame}
                      disabled={!canStart}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-success-600 text-white rounded-lg font-semibold hover:bg-success-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-5 h-5" />
                      <span>{t('admin.startGame')}</span>
                    </button>
                  )}

                  {(game.status === 'round1' ||
                    game.status === 'round2' ||
                    game.status === 'round3') && (
                    <>
                      <div className="text-center p-4 bg-primary-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          {language === 'en' ? 'Round' : language === 'he' ? 'סיבוב' : 'الجولة'}
                        </p>
                        <p className="text-3xl font-bold text-primary-600">
                          {game.currentRound || 1}
                        </p>
                      </div>
                      <button
                        onClick={handleNextRound}
                        disabled={!canNextRound}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowRight className="w-5 h-5" />
                        <span>{t('admin.nextRound')}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {language === 'en' ? 'Status' : language === 'he' ? 'סטטוס' : 'الحالة'}
                </h2>
                <p className="text-lg text-gray-600 capitalize">{game.status}</p>
              </div>
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

