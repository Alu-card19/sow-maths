"use client";

import { useEffect, useState } from "react";
import { LEVELS, levelLabel, type Level } from "@/lib/types";
import { MathText } from "./MathText";
import { BeadRail } from "./BeadRail";
import type { Round } from "@/lib/types";

export function StudentView() {
  const [studentName, setStudentName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<Level>("JSS1");
  const [hasJoined, setHasJoined] = useState(false);
  const [round, setRound] = useState<Round | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Periodically check for current round updates from server
  useEffect(() => {
    if (!hasJoined) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/round");
        const data = await response.json();
        setRound(data.round || null);
      } catch (error) {
        console.error("Failed to fetch round:", error);
      }
    }, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [hasJoined]);

  // Load initial round when joining
  useEffect(() => {
    if (hasJoined) {
      fetch("/api/round")
        .then((r) => r.json())
        .then((data) => setRound(data.round || null))
        .catch((error) => console.error("Failed to fetch round:", error));
    }
  }, [hasJoined]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      setHasJoined(true);
    }
  };

  if (!hasJoined) {
    return (
      <div className="graph-paper min-h-dvh flex items-center justify-center">
        <main className="w-full max-w-2xl px-5">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl mb-4">
              Math Olympiad
            </h1>
            <p className="text-lg text-ink-soft">Enter your details to join</p>
          </header>

          <form onSubmit={handleJoin} className="flex flex-col gap-6">
            {/* Name Input */}
            <div className="flex flex-col gap-3">
              <label htmlFor="name" className="text-lg font-semibold">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                className="rounded-xl border-2 border-ink/30 bg-chalk px-4 py-3 text-lg outline-none focus:border-ink"
              />
            </div>

            {/* Level Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-lg font-semibold">Your Class</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedLevel(level)}
                    className={`rounded-xl px-4 py-3 font-bold transition-colors ${
                      selectedLevel === level
                        ? "bg-ink text-chalk"
                        : "border-2 border-ink/30 hover:border-ink"
                    }`}
                  >
                    {levelLabel(level)}
                  </button>
                ))}
              </div>
            </div>

            {/* Join Button */}
            <button
              type="submit"
              disabled={!studentName.trim()}
              className="mt-4 rounded-xl bg-ink px-5 py-4 text-xl font-extrabold text-chalk transition-colors hover:bg-ink-soft disabled:opacity-40"
            >
              Join
            </button>
          </form>
        </main>
      </div>
    );
  }

  // Student is joined - show the question or waiting screen
  return (
    <div className="graph-paper min-h-dvh flex flex-col">
      <header className="border-b-2 border-ink/20 px-5 py-4 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-base font-medium text-ink-soft">Welcome, {studentName}</p>
          <h1 className="text-3xl font-extrabold mt-1">{levelLabel(selectedLevel)}</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
        {!round ? (
          <div className="text-center">
            <p className="text-2xl font-bold text-ink-soft">Waiting for the host...</p>
            <p className="text-base text-ink-soft mt-2">A question will appear here when your turn comes up.</p>
          </div>
        ) : round.phase === "ready" ? (
          <div className="text-center">
            <p className="text-3xl font-bold">Get ready!</p>
            <p className="text-xl text-ink-soft mt-4">A question is coming...</p>
          </div>
        ) : round.phase === "question" ? (
          <div className="w-full max-w-3xl">
            {/* Timer */}
            <div className="mb-6 text-center">
              <div className="text-6xl font-extrabold tabular">
                {round.secondsLeft}
              </div>
              <p className="text-ink-soft mt-2">seconds remaining</p>
            </div>

            {/* Question */}
            <div className="rounded-2xl border-2 border-ink bg-chalk p-8 mb-8">
              {round.slide.image && (
                <img
                  src={round.slide.image}
                  alt="Question"
                  className="mx-auto mb-6 max-h-48 object-contain"
                />
              )}
              <p className="font-serif text-3xl sm:text-4xl font-medium leading-tight text-center">
                <MathText text={round.slide.question} />
              </p>
            </div>

            {/* Options if multiple choice */}
            {round.options && (
              <div className="grid gap-3">
                {round.options.map((option, i) => (
                  <div
                    key={i}
                    className="rounded-xl border-2 border-ink/30 bg-chalk px-4 py-3 text-lg font-medium text-center"
                  >
                    <MathText text={option} />
                  </div>
                ))}
              </div>
            )}

            {/* Beads showing progress */}
            <div className="mt-8 flex justify-center">
              <BeadRail total={round.slide.points || 10} done={round.secondsLeft <= 0 ? 0 : 1} />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-3xl font-bold">
              {round.result === "correct" ? "✓ Correct!" : "✗ Incorrect"}
            </p>
            <p className="text-xl text-ink-soft mt-4">Waiting for next question...</p>
          </div>
        )}
      </main>

      <footer className="border-t-2 border-ink/20 px-5 py-4 sm:px-8 text-center text-sm text-ink-soft">
        <button
          onClick={() => setHasJoined(false)}
          className="font-semibold underline underline-offset-2 hover:text-ink"
        >
          Switch Student
        </button>
      </footer>
    </div>
  );
}
