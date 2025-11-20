'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import {
  subscribeToGame,
  subscribeToGameByPin,
  getGameByPin,
  addPlayerToGame,
  updatePlayerAnswer,
  calculateAndUpdatePlayerScore,
} from '@/lib/firestore';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLocalization } from '@/lib/localization';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PlayerRoundDisplay from '@/components/PlayerRoundDisplay';
import { Game, Player } from '@/types/game';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

function PlayerPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pin = searchParams.get('pin') || '';

  const { user: authUser, isAdmin } = useAuth();
  const { t, language, isRTL, fontFamily } = useLocalization();
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [name, setName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<{ [sentenceId: string]: boolean }>({});

  // Prevent admin from joining as player
  useEffect(() => {
    if (authUser && isAdmin && game) {
      router.push('/admin/dashboard');
    }
  }, [authUser, isAdmin, game, router]);

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
    
    // Round 1 is read-only, no answers allowed
    if (currentRound === 1) {
      return;
    }
    
    setCurrentAnswers((prev) => ({ ...prev, [sentenceId]: isFake }));

    await updatePlayerAnswer(game.id, player.id, currentRound, sentenceId, isFake);
  };

  const handleSkip = async () => {
    if (!game || !player || !db) return;

    const currentRound = game.currentRound || 1;
    
    // For Round 1, mark player as ready (read-only round)
    if (currentRound === 1) {
      try {
        // Update player's round1Ready status
        const playerRef = doc(db, 'games', game.id);
        await updateDoc(playerRef, {
          [`players.${player.id}.round1Ready`]: true,
        });
      } catch (error) {
        console.error('Error marking player as ready:', error);
      }
      return;
    }
    
    // For other rounds, calculate score (handled by admin)
  };

  const currentRound = game?.currentRound ? game.rounds[game.currentRound] : null;
  const allAnswered =
    currentRound &&
    game &&
    game.currentRound !== 1 && // Round 1 doesn't need answers
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
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
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

        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-2xl opacity-30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-white/20">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <span className="text-3xl">🎮</span>
              </motion.div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
                {t('player.enterName')}
              </h1>
              <p className="text-white/70 text-sm">
                {language === 'en' ? 'Enter your name to join the game' : language === 'he' ? 'הזן את שמך להצטרף למשחק' : 'أدخل اسمك للانضمام إلى اللعبة'}
              </p>
            </div>
            <div className="space-y-4">
              <motion.input
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'en' ? 'Your name' : language === 'he' ? 'השם שלך' : 'اسمك'}
                className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-xl focus:border-purple-400 focus:outline-none text-lg text-gray-800 placeholder-gray-500 font-medium shadow-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              />
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleJoinGame}
                disabled={!name.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 transition-all shadow-2xl border-2 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'en' ? 'Join Game' : language === 'he' ? 'הצטרף למשחק' : 'انضم إلى اللعبة'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (game.status === 'lobby') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
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

        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center relative z-10"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-2xl opacity-30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-white/20">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4 drop-shadow-lg" />
            </motion.div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
              {language === 'en' ? 'Welcome, ' : language === 'he' ? 'ברוך הבא, ' : 'مرحبًا، '}
              {player?.name}!
            </h1>
            <p className="text-xl text-white/90 font-semibold mb-4">{t('lobby.waiting')}</p>
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-purple-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Waiting screen after Round 1 (read-only round)
  if (game.status === 'round1' && currentRound && player?.round1Ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ fontFamily, direction: isRTL ? 'rtl' : 'ltr' }}
      >
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

        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center relative z-10"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-white/20">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' }}
            >
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4 drop-shadow-lg" />
            </motion.div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mb-4">
              {language === 'en' ? 'Reading Complete!' : language === 'he' ? 'סיום קריאה!' : 'اكتمل القراءة!'}
            </h1>
            <p className="text-xl text-white/90 font-semibold mb-6">
              {language === 'en' 
                ? 'Waiting for other players to finish...' 
                : language === 'he' 
                ? 'ממתין לשחקנים אחרים לסיים...' 
                : 'في انتظار انتهاء اللاعبين الآخرين...'}
            </p>
            <div className="flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-blue-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
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
    <PlayerRoundDisplay
      game={game}
      currentRound={currentRound}
      currentAnswers={currentAnswers}
      onAnswer={handleAnswer}
      onSkip={handleSkip}
      playerReady={player?.round1Ready}
    />
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

