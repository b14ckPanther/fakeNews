import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
  deleteField,
} from 'firebase/firestore';
import { db } from './firebase';
import { Game, Player, GameStatus } from '@/types/game';

// Game operations
export async function createGame(adminId: string, pin: string): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  // Use PIN as document ID for easier lookup
  const gameRef = doc(db, 'games', pin);
  const gameData: Omit<Game, 'id'> = {
    pin,
    status: 'lobby',
    createdAt: Date.now(),
    adminId,
    players: {},
    rounds: {},
  };
  await setDoc(gameRef, gameData);
  return pin; // Return PIN as game ID
}

export async function getGame(gameId: string): Promise<Game | null> {
  if (!db) throw new Error('Firestore not initialized');
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);
  if (gameSnap.exists()) {
    return { id: gameSnap.id, ...gameSnap.data() } as Game;
  }
  return null;
}

export async function getGameByPin(pin: string): Promise<Game | null> {
  if (!db) throw new Error('Firestore not initialized');
  // For simplicity, we'll use PIN as document ID
  // In production, you might want to create a separate collection mapping PINs to game IDs
  const gameRef = doc(db, 'games', pin);
  const gameSnap = await getDoc(gameRef);
  if (gameSnap.exists()) {
    const data = gameSnap.data();
    if (data.pin === pin) {
      return { id: gameSnap.id, ...data } as Game;
    }
  }
  return null;
}

export function subscribeToGameByPin(pin: string, callback: (game: Game | null) => void) {
  if (!db) throw new Error('Firestore not initialized');
  const gameRef = doc(db, 'games', pin);
  return onSnapshot(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.pin === pin) {
        callback({ id: snapshot.id, ...data } as Game);
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

export function subscribeToGame(gameId: string, callback: (game: Game | null) => void) {
  if (!db) throw new Error('Firestore not initialized');
  const gameRef = doc(db, 'games', gameId);
  return onSnapshot(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Game);
    } else {
      callback(null);
    }
  });
}

export async function updateGameStatus(gameId: string, status: GameStatus) {
  if (!db) throw new Error('Firestore not initialized');
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, { status });
}

export async function updateGameRound(gameId: string, roundNumber: number, roundData: any) {
  if (!db) throw new Error('Firestore not initialized');
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    [`rounds.${roundNumber}`]: roundData,
    currentRound: roundNumber,
  });
}

// Player operations
export async function addPlayerToGame(gameId: string, player: Player) {
  if (!db) throw new Error('Firestore not initialized');
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    [`players.${player.id}`]: player,
  });
}

export async function updatePlayerAnswer(
  gameId: string,
  playerId: string,
  roundNumber: number,
  sentenceId: string,
  answer: boolean
) {
  if (!db) throw new Error('Firestore not initialized');
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) return;

  const game = gameSnap.data() as Game;
  const player = game.players[playerId];
  if (!player) return;

  if (!player.answers[roundNumber]) {
    player.answers[roundNumber] = {};
  }
  player.answers[roundNumber][sentenceId] = answer;

  await updateDoc(gameRef, {
    [`players.${playerId}.answers`]: player.answers,
  });
}

export async function calculateAndUpdatePlayerScore(gameId: string, playerId: string) {
  if (!db) throw new Error('Firestore not initialized');
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) return;

  const game = gameSnap.data() as Game;
  const player = game.players[playerId];
  if (!player) return;

  let totalScore = 0;
  let totalAnswers = 0;

  Object.entries(player.answers).forEach(([roundNum, answers]) => {
    const roundNumber = parseInt(roundNum);
    const round = game.rounds[roundNumber];
    if (!round) return;

    round.sentences.forEach((sentence) => {
      const playerAnswer = answers[sentence.id];
      if (playerAnswer !== undefined) {
        totalAnswers++;
        if (playerAnswer === !sentence.isFake) {
          totalScore++;
        }
      }
    });
  });

  const finalScore = totalAnswers > 0 ? Math.round((totalScore / totalAnswers) * 100) : 0;

  await updateDoc(gameRef, {
    [`players.${playerId}.score`]: finalScore,
  });
}

export async function kickPlayer(gameId: string, playerId: string) {
  if (!db) throw new Error('Firestore not initialized');
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) return;

  const game = gameSnap.data() as Game;
  const player = game.players[playerId];
  if (!player) return;

  // Remove the player completely from the game
  await updateDoc(gameRef, {
    [`players.${playerId}`]: deleteField(),
  });
}

