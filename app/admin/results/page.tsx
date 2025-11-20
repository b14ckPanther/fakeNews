'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocalization } from '@/lib/localization';
import { subscribeToGame } from '@/lib/firestore';
import { Game, PlayerScore, getScoreCategory } from '@/types/game';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Trophy, Users, Award } from 'lucide-react';

export default function AdminResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = searchParams.get('gameId') || '';

  const { t, language, isRTL, fontFamily } = useLocalization();
  const [game, setGame] = useState<Game | null>(null);

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

  if (!game) {
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Lie Hunter':
        return 'bg-danger-100 text-danger-700 border-danger-300';
      case 'Lie Investigator':
        return 'bg-warning-100 text-warning-700 border-warning-300';
      case 'Truth Explorer':
        return 'bg-success-100 text-success-700 border-success-300';
      case 'Victim':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div
      className="min-h-screen p-4 bg-gradient-to-br from-primary-50 via-white to-success-50"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('admin.results')}</h1>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-danger-600" />
              <h2 className="text-xl font-bold text-gray-800">{t('category.lieHunter')}</h2>
            </div>
            <p className="text-4xl font-bold text-danger-600">{categoryCounts['Lie Hunter']}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-warning-600" />
              <h2 className="text-xl font-bold text-gray-800">{t('category.lieInvestigator')}</h2>
            </div>
            <p className="text-4xl font-bold text-warning-600">
              {categoryCounts['Lie Investigator']}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-success-600" />
              <h2 className="text-xl font-bold text-gray-800">{t('category.truthExplorer')}</h2>
            </div>
            <p className="text-4xl font-bold text-success-600">
              {categoryCounts['Truth Explorer']}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('admin.summary')}</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div
                key={category}
                className={`p-4 rounded-lg border-2 ${getCategoryColor(category)}`}
              >
                <p className="font-semibold mb-1">{t(`category.${category.toLowerCase().replace(/ /g, '')}`)}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">All Players</h2>
          <div className="space-y-3">
            {playerScores.map((player, index) => (
              <div
                key={player.playerId}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border-2 border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{player.playerName}</p>
                    <p className={`text-sm ${getCategoryColor(player.category)} px-2 py-1 rounded inline-block`}>
                      {t(`category.${player.category.toLowerCase().replace(/ /g, '')}`)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{player.score}</p>
                  <p className="text-sm text-gray-600">
                    {language === 'en' ? 'points' : language === 'he' ? 'נקודות' : 'نقاط'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

