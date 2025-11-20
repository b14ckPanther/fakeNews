export type Language = 'en' | 'he' | 'ar';

export type GameStatus = 'lobby' | 'round1' | 'round2' | 'round3' | 'results';

export interface Sentence {
  id: string;
  text: {
    en: string;
    he: string;
    ar: string;
  };
  isFake: boolean;
}

export interface Player {
  id: string;
  name: string;
  gamePin: string;
  score: number;
  answers: {
    [round: number]: {
      [sentenceId: string]: boolean;
    };
  };
  joinedAt: number;
  round1Ready?: boolean; // For Round 1 read-only tracking
  kicked?: boolean; // True if player was kicked by admin
}

export interface GameRound {
  roundNumber: 1 | 2 | 3;
  sentences: Sentence[];
  startTime: number;
  endTime: number;
  duration: number; // in seconds
}

export interface Game {
  id: string;
  pin: string;
  status: GameStatus;
  createdAt: number;
  currentRound?: number;
  rounds: {
    [key: number]: GameRound;
  };
  players: {
    [playerId: string]: Player;
  };
  adminId: string;
}

export type ScoreCategory = 'Victim' | 'Truth Explorer' | 'Lie Investigator' | 'Lie Hunter';

export interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number;
  category: ScoreCategory;
}

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 90) return 'Lie Hunter';
  if (score >= 80) return 'Lie Investigator';
  if (score >= 60) return 'Truth Explorer';
  return 'Victim';
}

