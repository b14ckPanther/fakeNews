'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  subscribeToGame,
  subscribeToGameByPin,
  getGameByPin,
  addPlayerToGame,
  updatePlayerAnswer,
  calculateAndUpdatePlayerScore,
} from '@/lib/firestore';
import { useLocalization } from '@/lib/localization';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SentenceCard from '@/components/SentenceCard';
import Timer from '@/components/Timer';
import { Game, Player, Sentence } from '@/types/game';
import { useMotionValue, useTransform, motion } from 'framer-motion';
import { SkipForward, CheckCircle } from 'lucide-react';

function PlayerPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pin = searchParams.get('pin') || '';

  const { t, language, isRTL, fontFamily } = useLocalization();
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [name, setName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<{ [sentenceId: string]: boolean }>({});

  useEffect(() => {
    if (!pin) {
      router.push('/');
      return;
    }

    const loadGame = async () => {
      const gameData = await getGameByPin(pin);
      if (gameData) {
        setGame(gameData);
      }
    };

    loadGame();
  }, [pin, router]);

  useEffect(() => {
    if (!pin || !player) return;

    const unsubscribe = subscribeToGameByPin(pin, (gameData) => {
      if (gameData) {
        setGame(gameData);
        if (gameData.players[player.id]) {
          setPlayer(gameData.players[player.id]);
        }
      }
    });

    return () => unsubscribe();
  }, [pin, player?.id]);

  const handleJoinGame = async () => {
    if (!name.trim() || !game || !auth) return;

    try {
      const userCredential = await signInAnonymously(auth);
      if (userCredential.user && game) {
        const newPlayer: Player = {
          id: userCredential.user.uid,
          name: name.trim(),
          gamePin: pin,
          score: 0,
          answers: {},
          joinedAt: Date.now(),
        };

        await addPlayerToGame(game.id, newPlayer);
        setPlayer(newPlayer);
        setIsJoined(true);
      }
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  const handleAnswer = async (sentenceId: string, isFake: boolean) => {
    if (!game || !player) return;

    const currentRound = game.currentRound || 1;
    setCurrentAnswers((prev) => ({ ...prev, [sentenceId]: isFake }));

    await updatePlayerAnswer(game.id, player.id, currentRound, sentenceId, isFake);
  };

  const handleSkip = async () => {
    if (!game || !player) return;

    // Calculate score for current round and move to results if round 3
    // Score calculation happens automatically on admin's next round action
  };

  const currentRound = game?.currentRound ? game.rounds[game.currentRound] : null;
  const allAnswered =
    currentRound &&
    currentRound.sentences.every((s) => currentAnswers[s.id] !== undefined);

  if (!game) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'en' ? 'Loading game...' : language === 'he' ? 'טוען משחק...' : 'جارٍ تحميل اللعبة...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-success-50"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{t('player.enterName')}</h1>
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'en' ? 'Your name' : language === 'he' ? 'השם שלך' : 'اسمك'}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
            />
            <button
              onClick={handleJoinGame}
              disabled={!name.trim()}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {language === 'en' ? 'Join' : language === 'he' ? 'הצטרף' : 'انضم'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (game.status === 'lobby') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-success-50"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {language === 'en' ? 'Welcome, ' : language === 'he' ? 'ברוך הבא, ' : 'مرحبًا، '}
              {player?.name}!
            </h1>
            <p className="text-xl text-gray-600">{t('lobby.waiting')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (game.status === 'results' && player) {
    router.push(`/player/results?gameId=${game.id}&playerId=${player.id}`);
    return null;
  }

  if (!currentRound) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <p className="text-gray-600">
          {language === 'en' ? 'Waiting for round to start...' : language === 'he' ? 'ממתין לסיבוב להתחיל...' : 'في انتظار بدء الجولة...'}
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 bg-gradient-to-br from-primary-50 via-white to-success-50"
      style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto pt-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {language === 'en' ? 'Round ' : language === 'he' ? 'סיבוב ' : 'الجولة '}
            {game.currentRound}
          </h1>
          <Timer
            startTime={currentRound.startTime}
            duration={currentRound.duration}
            onComplete={handleSkip}
          />
        </div>

        <div className="grid gap-4 mb-6">
          {currentRound.sentences.map((sentence) => (
            <motion.div
              key={sentence.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SentenceCard
                sentence={sentence}
                onAnswer={(isFake) => handleAnswer(sentence.id, isFake)}
                selectedAnswer={currentAnswers[sentence.id] !== undefined ? currentAnswers[sentence.id] : null}
                disabled={currentAnswers[sentence.id] !== undefined}
              />
            </motion.div>
          ))}
        </div>

        {allAnswered && (
          <div className="text-center">
            <button
              onClick={handleSkip}
              className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
              <span>{t('round.skip')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PlayerPageContent />
    </Suspense>
  );
}

