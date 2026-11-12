"use client";

import Link from "next/link";
import { useState } from "react";
import { LEVELS, levelLabel, type Level, type Student, AVAILABLE_DURATIONS } from "@/lib/types";

type Props = {
  level: Level;
  onLevel: (level: Level) => void;
  students: Student[];
  deckSize: number;
  called: number;
  onAdd: (names: string[]) => void;
  onRemove: (id: string) => void;
  onCall: (id: string) => void;
  onCallNext: () => void;
  onResetScores: () => void;
  codeNamesMissing: number;
  onLoadFromCode: () => void;
  roundDurationMinutes: number;
  onRoundDurationChange: (minutes: number) => void;
};

export function Roster({
  level,
  onLevel,
  students,
  deckSize,
  called,
  onAdd,
  onRemove,
  onCall,
  onCallNext,
  onResetScores,
  codeNamesMissing,
  onLoadFromCode,
  roundDurationMinutes,
  onRoundDurationChange,
}: Props) {
  const [draft, setDraft] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const classStudents = students.filter((s) => s.level === level);
  const ranked = [...classStudents].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const noQuestions = deckSize === 0;
  const canCall = classStudents.length > 0 && !noQuestions;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const names = draft
      .split(/[\n,]/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    onAdd(names);
    setDraft("");
  }

  return (
    <div className="graph-paper min-h-dvh">
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-medium text-ink-soft">Seat of Wisdom Montessori</p>
            <div className="flex gap-3">
              <Link href="/results" className="text-base font-semibold underline underline-offset-4 hover:text-ink-soft">
                View results
              </Link>
              <Link href="/play" className="text-base font-semibold underline underline-offset-4 hover:text-ink-soft">
                Student page
              </Link>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
            Maths Olympiad
          </h1>
        </header>

        {/* Class picker: six beads on a thread */}
        <section aria-labelledby="class-heading" className="flex flex-col gap-4">
          <h2 id="class-heading" className="text-xl font-bold">
            Choose a class
          </h2>
          <div className="relative">
            <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 bg-ink/25" aria-hidden />
            <div
              role="radiogroup"
              aria-labelledby="class-heading"
              className="relative grid grid-cols-3 gap-y-4 sm:grid-cols-6"
            >
              {LEVELS.map((l) => {
                const active = l === level;
                const count = students.filter((s) => s.level === l).length;
                return (
                  <div key={l} className="flex justify-center">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onLevel(l)}
                      className={`bead flex flex-col items-center justify-center rounded-full font-extrabold text-ink transition-transform ${
                        active
                          ? "size-24 scale-100 ring-4 ring-ink ring-offset-4 ring-offset-paper sm:size-28"
                          : "size-20 opacity-80 hover:scale-105 hover:opacity-100 sm:size-24"
                      }`}
                    >
                      <span className="text-xl leading-none sm:text-2xl">{levelLabel(l)}</span>
                      <span className="mt-1 text-xs font-semibold">
                        {count} {count === 1 ? "student" : "students"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Add students */}
          <section aria-labelledby="add-heading" className="flex flex-col gap-4">
            <h2 id="add-heading" className="text-2xl font-bold">
              Add students to {levelLabel(level)}
            </h2>
            <form onSubmit={submit} className="flex flex-col gap-3">
              <label htmlFor="names" className="text-base font-medium text-ink-soft">
                Type a name and press Enter. Separate several names with commas.
              </label>
              <div className="flex gap-2">
                <input
                  id="names"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoComplete="off"
                  placeholder="Ada Okafor, Tunde Bello"
                  className="min-w-0 flex-1 rounded-xl border-2 border-ink/30 bg-chalk px-4 py-3 text-lg outline-none focus:border-ink"
                />
                <button
                  type="submit"
                  disabled={draft.trim() === ""}
                  className="rounded-xl bg-ink px-5 py-3 text-lg font-bold text-chalk transition-colors hover:bg-ink-soft disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </form>

            {codeNamesMissing > 0 && (
              <button
                type="button"
                onClick={onLoadFromCode}
                className="w-fit rounded-xl border-2 border-ink px-4 py-2 text-base font-bold hover:bg-gold/25"
              >
                Add {codeNamesMissing} {codeNamesMissing === 1 ? "name" : "names"} from the student list
              </button>
            )}

            <div className="mt-2 rounded-2xl border-2 border-ink bg-chalk p-5">
              <p className="text-lg font-semibold">
                {noQuestions
                  ? `No questions for ${levelLabel(level)} yet`
                  : `${deckSize} questions for ${levelLabel(level)}`}
              </p>
              <p className="mt-1 text-base text-ink-soft">
                {noQuestions
                  ? "Add them in src/data/questions.ts, then redeploy."
                  : `Shuffled fresh each time this page loads. ${called} called so far.`}
              </p>
              
              {/* Round duration settings */}
              <div className="mt-4 flex flex-col gap-3">
                <label htmlFor="duration" className="text-base font-medium text-ink-soft">
                  Round duration:
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_DURATIONS.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => onRoundDurationChange(duration)}
                      className={`rounded-lg px-3 py-2 font-bold transition-colors ${
                        roundDurationMinutes === duration
                          ? "bg-ink text-chalk"
                          : "border-2 border-ink/30 hover:border-ink"
                      }`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  max="60"
                  value={roundDurationMinutes}
                  onChange={(e) => onRoundDurationChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 rounded-lg border-2 border-ink/30 bg-chalk px-3 py-2 text-base font-medium outline-none focus:border-ink"
                  placeholder="Custom duration"
                />
              </div>

              <button
                type="button"
                onClick={onCallNext}
                disabled={!canCall}
                className="bead mt-4 w-full rounded-xl px-5 py-4 text-xl font-extrabold text-ink transition-transform hover:scale-[1.01] disabled:opacity-40 disabled:hover:scale-100"
              >
                Call a student
              </button>
              {!noQuestions && classStudents.length === 0 && (
                <p className="mt-2 text-sm text-ink-soft">Add at least one student first.</p>
              )}
            </div>
          </section>

          {/* Roster */}
          <section aria-labelledby="roster-heading" className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-3">
              <h2 id="roster-heading" className="text-2xl font-bold">
                {levelLabel(level)} scoreboard
              </h2>
              {students.length > 0 &&
                (confirmReset ? (
                  <span className="flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        onResetScores();
                        setConfirmReset(false);
                      }}
                      className="rounded-lg bg-rose px-3 py-1.5 font-bold text-chalk"
                    >
                      Reset all scores
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="rounded-lg border-2 border-ink/30 px-3 py-1.5 font-semibold"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
                  >
                    Reset scores
                  </button>
                ))}
            </div>

            {ranked.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-ink/30 bg-chalk/70 p-8 text-lg text-ink-soft">
                No students in {levelLabel(level)} yet. Add the first one to get started.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {ranked.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 rounded-2xl border-2 border-ink/15 bg-chalk px-4 py-3"
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-base font-extrabold ${
                        i === 0 && s.score > 0 ? "bead text-ink" : "bg-paper text-ink-soft"
                      }`}
                      aria-label={`Position ${i + 1}`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-bold">{s.name}</p>
                      <p className="text-sm text-ink-soft">
                        {s.turns} {s.turns === 1 ? "question answered" : "questions answered"}
                      </p>
                    </div>
                    <p className="tabular text-3xl font-extrabold">{s.score}</p>
                    <button
                      type="button"
                      onClick={() => onCall(s.id)}
                      disabled={noQuestions}
                      className="rounded-xl bg-ink px-4 py-2 font-bold text-chalk hover:bg-ink-soft disabled:opacity-40"
                    >
                      Call
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(s.id)}
                      aria-label={`Remove ${s.name}`}
                      className="rounded-lg px-2 py-1 text-2xl leading-none text-ink-soft hover:text-rose"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}