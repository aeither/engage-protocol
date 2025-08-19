import { PublicKey } from '@solana/web3.js';

// Program ID - Updated for testnet deployment
export const QUIZ_GAME_PROGRAM_ID = new PublicKey('2wSzeesj4BVQtrzLDSR3YdqZ1nDnDtWV1E8tNpvJimZk');

// Account types
export interface GameState {
  authority: PublicKey;
  vault: PublicKey;
  totalGames: number;
  totalRewards: number;
}

export interface QuizSession {
  active: boolean;
  userAnswer: number;
  amountPaid: number;
  timestamp: number;
  quizId: string;
  user: PublicKey;
  bump: number;
}

// Event types
export interface QuizStartedEvent {
  user: PublicKey;
  quizId: string;
  userAnswer: number;
  amount: number;
  timestamp: number;
}

export interface QuizCompletedEvent {
  user: PublicKey;
  quizId: string;
  success: boolean;
  reward: number;
  correctAnswers: number;
  bonusLamports: number;
}

export interface VaultUpdatedEvent {
  oldVault: PublicKey;
  newVault: PublicKey;
}

// Instruction data types
export interface StartQuizParams {
  quizId: string;
  userAnswer: number;
  amount: number;
}

export interface CompleteQuizParams {
  correctAnswerCount: number;
}

export interface WithdrawParams {
  amount: number;
}

export interface UpdateVaultParams {
  newVault: PublicKey;
}

export interface FundVaultParams {
  amount: number;
}

// Error types
export enum QuizError {
  InvalidAmount = 6000,
  EmptyQuizId = 6001,
  ActiveQuizExists = 6002,
  NoActiveQuiz = 6003,
  UnauthorizedUser = 6004,
  InsufficientFunds = 6005,
  InsufficientVaultFunds = 6006,
  QuizExpired = 6007,
  MinimumAmountRequired = 6008,
}

// Helper functions for PDA derivation
export const getGameStatePDA = (): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('game_state')],
    QUIZ_GAME_PROGRAM_ID
  );
};

export const getQuizSessionPDA = (user: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('quiz_session'), user.toBuffer()],
    QUIZ_GAME_PROGRAM_ID
  );
};

// Quiz configuration types
export interface QuizConfig {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  entryFee: number; // in SOL
  timeLimit: number; // in seconds
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Transaction result types
export interface QuizTransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

export interface QuizSessionStatus {
  active: boolean;
  quizId?: string;
  amountPaid?: number;
  timeRemaining?: number;
  canComplete: boolean;
}

// Constants
export const QUIZ_CONSTANTS = {
  MIN_ENTRY_FEE: 0.001, // SOL
  MAX_ENTRY_FEE: 10.0, // SOL
  QUIZ_TIME_LIMIT: 3600, // 1 hour in seconds
  MIN_CORRECT_FOR_REWARD: 2,
  PERFECT_SCORE_THRESHOLD: 3,
} as const;