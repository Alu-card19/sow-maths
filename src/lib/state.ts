import type { Round } from "./types";

// In-memory store (will reset on server restart)
let currentRound: Round | null = null;

export function getCurrentRound(): Round | null {
  return currentRound;
}

export function setCurrentRound(round: Round | null): void {
  currentRound = round;
}
