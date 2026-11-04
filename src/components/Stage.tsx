"use client";

import { useEffect } from "react";
import { BeadRail } from "./BeadRail";
import { MathText } from "./MathText";
import { DEFAULT_POINTS, levelLabel, type Round, type Student } from "@/lib/types";

type Props = {
  round: Round;
  student: Student;
  deckSize: number;
  called: number;
  onShow: () => void;
  onReveal: () => void;
  onMark: (result: "correct" | "wrong") => void;
  onNextQuestion: () => void;
  onNextStudent: () => void;
  onTogglePause: () => void;
  onExit: () => void;
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function TimerRing({ left, total, paused }: { left: number; total: number; paused: boolean }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, left / total) : 0;
  const urgent = left <= 10;
  return (
    <div
      className="relative flex size-24 items-center justify-center sm:size-28"
      role="timer"
      aria-label={`${left} seconds left`}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={urgent ? "var(--color-rose)" : "var(--color-gold)"}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <span
        className={`tabular text-4xl font-extrabold sm:text-5xl ${urgent ? "text-rose" : "text-chalk"} ${
          paused ? "opacity-50" : ""
        }`}
      >
        {left}
      </span>
    </div>
  );
}

export function Stage({
  round,
  student,
  deckSize,
  called,
  onShow,
  onReveal,
  onMark,
  onNextQuestion,
  onNextStudent,
  onTogglePause,
  onExit,
}: Props) {
  const { phase, slide, options, result } = round;
  const points = slide.points ?? DEFAULT_POINTS;
  const correctIndex = options ? options.findIndex((o) => o === slide.answer) : -1;

  // Keyboard control so the host can run the whole round from the keyboard or a clicker.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "enter") {
        e.preventDefault();
        if (phase === "ready") onShow();
        else if (phase === "question") onReveal();
        else if (result) onNextQuestion();
      } else if (k === "c" && phase === "revealed" && !result) {
        onMark("correct");
      } else if (k === "x" && phase === "revealed" && !result) {
        onMark("wrong");
      } else if (k === "n" && phase === "revealed" && result) {
        onNextStudent();
      } else if (k === "p" && phase === "question") {
        onTogglePause();
      } else if (k === "escape") {
        onExit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, result, onShow, onReveal, onMark, onNextQuestion, onNextStudent, onTogglePause, onExit]);

  return (
    <div className="graph-ink flex min-h-dvh flex-col text-chalk">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-10 sm:py-6">
        <div>
          <p className="text-base font-medium text-chalk/70 sm:text-lg">Seat of Wisdom Montessori</p>
          <p className="text-xl font-extrabold sm:text-2xl">
            {levelLabel(round.level)} Maths Olympiad
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-base font-medium text-chalk/70 sm:text-lg">Score</p>
            <p className="tabular text-3xl font-extrabold text-gold sm:text-4xl">{student.score}</p>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="rounded-xl border-2 border-chalk/30 px-4 py-2 font-semibold hover:border-chalk/70"
          >
            Back to class
          </button>
        </div>
      </header>

      {/* Main stage */}
      <main className="flex flex-1 flex-col justify-center px-5 py-6 sm:px-10">
        {phase === "ready" && (
          <section key="ready" className="slate-in mx-auto flex w-full max-w-5xl flex-col gap-6">
            <p className="text-2xl font-medium text-chalk/75 sm:text-3xl">Your turn</p>
            <h1 className="text-[clamp(3rem,11vw,9rem)] font-extrabold leading-[0.95] tracking-tight">
              {student.name}
            </h1>
            <div>
              <button
                type="button"
                onClick={onShow}
                className="bead rounded-2xl px-8 py-5 text-2xl font-extrabold text-ink transition-transform hover:scale-[1.02]"
              >
                Show question
              </button>
            </div>
          </section>
        )}

        {phase !== "ready" && (
          <section key={slide.id + student.id} className="slate-in mx-auto flex w-full max-w-6xl flex-col gap-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-3 text-xl font-bold text-chalk/80 sm:text-2xl">
                <span>{student.name}</span>
                <span aria-hidden className="text-chalk/30">
                  /
                </span>
                <span>Question {round.questionNo}</span>
                <span aria-hidden className="text-chalk/30">
                  /
                </span>
                <span className="text-gold">{points} points</span>
              </div>
              <button
                type="button"
                onClick={onTogglePause}
                disabled={phase !== "question"}
                className="rounded-xl border-2 border-transparent p-1 disabled:cursor-default"
                aria-label={round.paused ? "Resume timer" : "Pause timer"}
              >
                <TimerRing left={round.secondsLeft} total={round.totalSeconds} paused={round.paused} />
              </button>
            </div>

            <p className="max-w-[28ch] font-serif text-[clamp(2rem,5.2vw,4.5rem)] font-medium leading-[1.15] sm:max-w-[34ch]">
              <MathText text={slide.question} />
            </p>

            {slide.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.image}
                alt=""
                className="max-h-[38vh] w-auto max-w-full self-start rounded-2xl bg-chalk object-contain p-3"
              />
            )}

            {options && (
              <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                {options.map((opt, i) => {
                  const isCorrect = phase === "revealed" && i === correctIndex;
                  const dim = phase === "revealed" && correctIndex !== -1 && i !== correctIndex;
                  return (
                    <li
                      key={opt + i}
                      className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-colors ${
                        isCorrect
                          ? "border-leaf bg-leaf/25"
                          : "border-chalk/20 bg-chalk/5"
                      } ${dim ? "opacity-40" : ""}`}
                    >
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-full text-xl font-extrabold ${
                          isCorrect ? "bg-leaf text-chalk" : "bead text-ink"
                        }`}
                      >
                        {LETTERS[i]}
                      </span>
                      <span className="font-serif text-[clamp(1.5rem,3vw,2.75rem)] leading-tight">
                        <MathText text={opt} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {phase === "revealed" && (
              <div className="slate-in flex flex-col gap-4 rounded-2xl border-2 border-leaf bg-leaf/20 p-5 sm:p-6">
                <p className="text-xl font-bold text-chalk/80 sm:text-2xl">Answer</p>
                <p className="font-serif text-[clamp(2rem,4.5vw,4rem)] font-medium leading-tight">
                  {correctIndex !== -1 && (
                    <span className="mr-4 font-display font-extrabold text-gold">{LETTERS[correctIndex]}</span>
                  )}
                  <MathText text={slide.answer} />
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Controls and bead rail */}
      <footer className="flex flex-col gap-5 px-5 pb-6 pt-2 sm:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3">
          {phase === "question" && (
            <>
              <button
                type="button"
                onClick={onReveal}
                className="bead rounded-2xl px-7 py-4 text-xl font-extrabold text-ink"
              >
                Reveal answer
              </button>
              <button
                type="button"
                onClick={onTogglePause}
                className="rounded-2xl border-2 border-chalk/30 px-6 py-4 text-lg font-bold hover:border-chalk/70"
              >
                {round.paused ? "Resume timer" : "Pause timer"}
              </button>
              {round.secondsLeft === 0 && (
                <p className="text-xl font-extrabold text-rose" role="status">
                  Time is up
                </p>
              )}
            </>
          )}

          {phase === "revealed" && !result && (
            <>
              <button
                type="button"
                onClick={() => onMark("correct")}
                className="rounded-2xl bg-leaf px-7 py-4 text-xl font-extrabold text-chalk hover:brightness-110"
              >
                Correct, +{points}
              </button>
              <button
                type="button"
                onClick={() => onMark("wrong")}
                className="rounded-2xl bg-rose px-7 py-4 text-xl font-extrabold text-chalk hover:brightness-110"
              >
                Wrong
              </button>
            </>
          )}

          {phase === "revealed" && result && (
            <>
              <p
                role="status"
                className={`rounded-2xl px-5 py-3 text-xl font-extrabold ${
                  result === "correct" ? "bg-leaf/25 text-chalk" : "bg-rose/25 text-chalk"
                }`}
              >
                {result === "correct" ? `Correct, ${student.name} scores ${points}` : "No points this time"}
              </p>
              <button
                type="button"
                onClick={onNextQuestion}
                className="bead rounded-2xl px-7 py-4 text-xl font-extrabold text-ink"
              >
                Next question for {student.name}
              </button>
              <button
                type="button"
                onClick={onNextStudent}
                className="rounded-2xl border-2 border-chalk/40 px-7 py-4 text-xl font-bold hover:border-chalk/80"
              >
                Next student
              </button>
            </>
          )}

          <p className="ml-auto hidden text-sm text-chalk/55 lg:block">
            Space asks another question. N moves to the next student. C correct, X wrong, P pauses, Esc leaves.
          </p>
        </div>

        <BeadRail total={deckSize} done={called} />
      </footer>
    </div>
  );
}