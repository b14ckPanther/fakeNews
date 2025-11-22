import { falseStatements, trueStatements } from '@/data/content';
import { Sentence, GameRound } from '@/types/game';

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Round 1: 7 sentences (5 fake + 2 true)
// Round 1: 7 sentences (5 fake + 2 true) from specific list
export function generateRound1(): Sentence[] {
  const specificFakeIds = ['false-10', 'false-8', 'false-7', 'false-4', 'false-5', 'false-6'];
  const specificTrueIds = ['true-6', 'true-7', 'true-10'];

  const fakePool = falseStatements.filter(s => specificFakeIds.includes(s.id));
  const truePool = trueStatements.filter(s => specificTrueIds.includes(s.id));

  const fake = shuffleArray([...fakePool]).slice(0, 5);
  const true_ = shuffleArray([...truePool]).slice(0, 2);

  return shuffleArray([...fake, ...true_]);
}

// Round 2: 7 sentences (4 from Round 1: 3 fake + 1 true, 2 new fake + 1 new true)
export function generateRound2(round1Sentences: Sentence[]): Sentence[] {
  const round1Fake = round1Sentences.filter((s) => s.isFake);
  const round1True = round1Sentences.filter((s) => !s.isFake);

  const repeatedFake = shuffleArray([...round1Fake]).slice(0, 3);
  const repeatedTrue = shuffleArray([...round1True]).slice(0, 1);

  const usedIds = new Set(round1Sentences.map((s) => s.id));
  const newFake = shuffleArray(falseStatements.filter((s) => !usedIds.has(s.id))).slice(0, 2);
  const newTrue = shuffleArray(trueStatements.filter((s) => !usedIds.has(s.id))).slice(0, 1);

  return shuffleArray([...repeatedFake, ...repeatedTrue, ...newFake, ...newTrue]);
}

// Round 3: 7 sentences (2 fake from Round 2, 2 rephrased fake from Round 2, 1 new true, 1 new fake, 1 true from previous rounds)
export function generateRound3(round2Sentences: Sentence[]): Sentence[] {
  const round2Fake = round2Sentences.filter((s) => s.isFake);
  const round2True = round2Sentences.filter((s) => !s.isFake);

  // 2 fake from Round 2 (unchanged)
  const repeatedFake = shuffleArray([...round2Fake]).slice(0, 2);

  // 2 rephrased fake from Round 2 (we'll use the same sentences as "rephrased" for simplicity)
  const rephrasedFake = shuffleArray([...round2Fake])
    .filter((s) => !repeatedFake.includes(s))
    .slice(0, 2);

  // 1 new true
  const allUsedIds = new Set([
    ...round2Sentences.map((s) => s.id),
    ...repeatedFake.map((s) => s.id),
    ...rephrasedFake.map((s) => s.id),
  ]);
  const newTrue = shuffleArray(trueStatements.filter((s) => !allUsedIds.has(s.id))).slice(0, 1);

  // 1 new fake
  const newFake = shuffleArray(falseStatements.filter((s) => !allUsedIds.has(s.id))).slice(0, 1);

  // 1 true from previous rounds
  const previousTrue = shuffleArray([...round2True]).slice(0, 1);

  return shuffleArray([...repeatedFake, ...rephrasedFake, ...newTrue, ...newFake, ...previousTrue]);
}

export function createGameRound(
  roundNumber: 1 | 2 | 3,
  sentences: Sentence[],
  previousRound?: GameRound
): GameRound {
  const duration = 120; // 2 minutes in seconds
  const startTime = Date.now();
  const endTime = startTime + duration * 1000;

  if (roundNumber === 2 && previousRound) {
    return {
      roundNumber: 2,
      sentences,
      startTime,
      endTime,
      duration,
    };
  }

  if (roundNumber === 3 && previousRound) {
    return {
      roundNumber: 3,
      sentences,
      startTime,
      endTime,
      duration,
    };
  }

  return {
    roundNumber: 1,
    sentences,
    startTime,
    endTime,
    duration,
  };
}

