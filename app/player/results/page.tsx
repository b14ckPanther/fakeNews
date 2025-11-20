'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalization } from '@/lib/localization';
import { subscribeToGame } from '@/lib/firestore';
import { Game, Player, getScoreCategory } from '@/types/game';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Trophy, Award, Target, User } from 'lucide-react';
import { motion } from 'framer-motion';

function PlayerResultsPageContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '';
  const playerId = searchParams.get('playerId') || '';

  const { t, language, isRTL, fontFamily } = useLocalization();
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

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

  if (!game || !player) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
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

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Lie Hunter':
        return Trophy;
      case 'Lie Investigator':
        return Award;
      case 'Truth Explorer':
        return Target;
      default:
        return User;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Lie Hunter':
        return 'text-danger-600 bg-danger-100 border-danger-300';
      case 'Lie Investigator':
        return 'text-warning-600 bg-warning-100 border-warning-300';
      case 'Truth Explorer':
        return 'text-success-600 bg-success-100 border-success-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const CategoryIcon = getCategoryIcon(category);

  return (
    <div
      className="min-h-screen p-4 bg-gradient-to-br from-primary-50 via-white to-success-50"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className={`inline-block p-6 rounded-full ${getCategoryColor(category)} border-4 mb-4`}>
            <CategoryIcon className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('results.title')}</h1>
          <p className="text-2xl text-gray-600 mb-4">{player.name}</p>
          <div className="text-6xl font-bold text-primary-600 mb-2">{score}</div>
          <p className="text-lg text-gray-600 mb-4">
            {language === 'en' ? 'points' : language === 'he' ? 'נקודות' : 'نقاط'}
          </p>
          <div className={`inline-block px-6 py-3 rounded-full ${getCategoryColor(category)} border-2`}>
            <p className="text-xl font-bold">
              {t(`category.${category.toLowerCase().replace(/ /g, '')}`)}
            </p>
          </div>
          <div className="mt-6">
            <p className="text-2xl font-bold text-gray-800">
              {language === 'en' ? 'Rank #' : language === 'he' ? 'דירוג #' : 'المركز #'}
              {rank} / {players.length}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            {language === 'en' ? 'Leaderboard' : language === 'he' ? 'לוח התוצאות' : 'لوحة المتصدرين'}
          </h2>
          <div className="space-y-3">
            {players.map((p, index) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  p.id === playerId ? 'bg-primary-50 border-2 border-primary-500' : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-danger-100 text-danger-600'
                        : index === 1
                        ? 'bg-warning-100 text-warning-600'
                        : index === 2
                        ? 'bg-success-100 text-success-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className={`text-sm ${getCategoryColor(p.category)} px-2 py-1 rounded inline-block`}>
                      {t(`category.${p.category.toLowerCase().replace(/ /g, '')}`)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{p.score || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PlayerResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PlayerResultsPageContent />
    </Suspense>
  );
}

