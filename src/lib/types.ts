export const LEVELS = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"] as const;
export type Level = (typeof LEVELS)[number];

export const DEFAULT_SECONDS = 60;
export const DEFAULT_POINTS = 10;

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
};

export function levelLabel(level: Level): string {
  return level.replace(/^([A-Z]+)(\d)$/, "$1 $2");
}