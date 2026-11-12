export const LEVELS = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"] as const;
export type Level = (typeof LEVELS)[number];

export const DEFAULT_SECONDS = 60;
export const DEFAULT_POINTS = 10;
export const DEFAULT_ROUND_DURATION_MINUTES = 2;
export const AVAILABLE_DURATIONS = [1, 2, 3, 5, 10] as const;

/** One question slide. Edit these in src/data/questions.ts */
export type Slide = {
  id: string;
  /** Question text. Wrap maths in $...$ for LaTeX, e.g. $\frac{3}{4}$ */
  question: string;
  /** The correct answer. If you give options, it must match one of them exactly. */
  answer: string;
  /** Optional multiple-choice options (shuffled each time the question is shown). */
  options?: string[];
  /** Optional image from the /public folder, e.g. "/questions/jss2-triangle.png" */
  image?: string;
  /** Time allowed in seconds (default 60). */
  seconds?: number;
  /** Points for a correct answer (default 10). */
  points?: number;
};

export type Student = {
  id: string;
  name: string;
  level: Level;
  score: number;
  turns: number;
  campus?: string; // Optional campus/school name
};

export type Phase = "ready" | "question" | "revealed";

export type Round = {
  studentId: string;
  level: Level;
  slide: Slide;
  options: string[] | null;
  phase: Phase;
  secondsLeft: number;
  totalSeconds: number;
  paused: boolean;
  result: "correct" | "wrong" | null;
  /** Which question this is for the student currently on stage (1, 2, 3...) */
  questionNo: number;
  /** Session-level timer: seconds remaining for entire round (in minutes) */
  sessionSecondsLeft: number;
  /** Session-level timer: total seconds for the round (in minutes) */
  sessionTotalSeconds: number;
  /** Time when this round session started (for tracking across questions) */
  roundStartedAt: number;
  /** The selected answer option (if any) - can only be set once, prevents changes after submission */
  selectedAnswer: string | null;
};

export function levelLabel(level: Level): string {
  return level.replace(/^([A-Z]+)(\d)$/, "$1 $2");
}

/** A completed round result saved to the database */
export type ParticipantResult = {
  id: string;
  studentId: string;
  studentName: string;
  level: Level;
  campus?: string;
  roundNumber: number;
  score: number;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionDurationMinutes: number;
  completionTimeSeconds: number; // Time from start to finish
  completedAt: string; // ISO timestamp
  createdAt: string; // ISO timestamp
};