import { LEVELS, type Level, type Student, type Round } from "./types";

const KEY = "sow-math-olympiad:v1";
const ROUND_KEY = "sow-math-olympiad:current-round";

export type Saved = { students: Student[]; level: Level };

export function loadSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Saved>;
    const students = Array.isArray(data.students)
      ? data.students.filter(
          (s): s is Student =>
            !!s &&
            typeof s.id === "string" &&
            typeof s.name === "string" &&
            LEVELS.includes(s.level as Level) &&
            typeof s.score === "number" &&
            typeof s.turns === "number",
        )
      : [];
    const level = LEVELS.includes(data.level as Level) ? (data.level as Level) : "JSS1";
    return { students, level };
  } catch {
    return null;
  }
}

export function save(data: Saved): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage can be blocked (private window). The app still works, it just won't remember.
  }
}

export function saveCurrentRound(round: Round | null): void {
  try {
    if (round) {
      window.localStorage.setItem(ROUND_KEY, JSON.stringify(round));
    } else {
      window.localStorage.removeItem(ROUND_KEY);
    }
  } catch {
    // Storage can be blocked.
  }
}

export function loadCurrentRound(): Round | null {
  try {
    const raw = window.localStorage.getItem(ROUND_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Round;
  } catch {
    return null;
  }
}
