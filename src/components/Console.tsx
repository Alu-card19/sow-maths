"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QUESTIONS } from "@/data/questions";
import { STUDENTS } from "@/data/students";
import { loadSaved, save, saveCurrentRound } from "@/lib/storage";
import { shuffle, uid } from "@/lib/shuffle";
import {
  DEFAULT_POINTS,
  DEFAULT_SECONDS,
  LEVELS,
  type Level,
  type Round,
  type Slide,
  type Student,
} from "@/lib/types";
import { Roster } from "./Roster";
import { Stage } from "./Stage";

type PerLevel<T> = Record<Level, T>;

function perLevel<T>(make: (level: Level) => T): PerLevel<T> {
  return Object.fromEntries(LEVELS.map((l) => [l, make(l)])) as PerLevel<T>;
}

export default function Console() {
  const [ready, setReady] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [level, setLevel] = useState<Level>("JSS1");
  const [round, setRound] = useState<Round | null>(null);
  const [called, setCalled] = useState<PerLevel<number>>(() => perLevel(() => 0));

  // The shuffled decks live in refs. They are built once per page load, so every
  // refresh gives a completely new order, and a question never repeats until the deck runs out.
  const decks = useRef<PerLevel<Slide[]>>(perLevel(() => []));
  const cursor = useRef<PerLevel<number>>(perLevel(() => 0));

  useEffect(() => {
    decks.current = perLevel((l) => shuffle(QUESTIONS[l]));
    cursor.current = perLevel(() => 0);
    const saved = loadSaved();
    if (saved) setLevel(saved.level);
    if (saved && saved.students.length > 0) {
      setStudents(saved.students);
    } else {
      // First visit: start with the names written in src/data/students.ts
      setStudents(
        LEVELS.flatMap((l) =>
          STUDENTS[l].map((e: { name: string }) => ({ id: uid(), name: e.name, level: l, score: 0, turns: 0 })),
        ),
      );
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) save({ students, level });
  }, [ready, students, level]);

  useEffect(() => {
    saveCurrentRound(round);
  }, [round]);

  // Sync round to server for other devices
  useEffect(() => {
    if (!round) {
      fetch("/api/round", { method: "POST", body: JSON.stringify({ round: null }) });
      return;
    }
    fetch("/api/round", { method: "POST", body: JSON.stringify({ round }) });
  }, [round]);

  const draw = useCallback((lvl: Level): Slide | null => {
    if (decks.current[lvl].length === 0) return null;
    if (cursor.current[lvl] >= decks.current[lvl].length) {
      decks.current[lvl] = shuffle(decks.current[lvl]);
      cursor.current[lvl] = 0;
    }
    const slide = decks.current[lvl][cursor.current[lvl]];
    cursor.current[lvl] += 1;
    setCalled((c) => ({ ...c, [lvl]: Math.min(cursor.current[lvl], decks.current[lvl].length) }));
    return slide;
  }, []);

  const startRound = useCallback(
    (studentId: string, lvl: Level, questionNo = 1) => {
      const slide = draw(lvl);
      if (!slide) return;
      const seconds = slide.seconds ?? DEFAULT_SECONDS;
      setRound({
        studentId,
        level: lvl,
        slide,
        options: slide.options ? shuffle(slide.options) : null,
        phase: questionNo === 1 ? "ready" : "question",
        secondsLeft: seconds,
        totalSeconds: seconds,
        paused: false,
        result: null,
        questionNo,
      });
    },
    [draw],
  );

  /** Whoever has had the fewest turns goes next, with ties broken at random. */
  const pickNext = useCallback(
    (lvl: Level, excludeId?: string): Student | null => {
      const pool = students.filter((s) => s.level === lvl);
      if (pool.length === 0) return null;
      const candidates = pool.length > 1 ? pool.filter((s) => s.id !== excludeId) : pool;
      const fewest = Math.min(...candidates.map((s) => s.turns));
      const lowest = candidates.filter((s) => s.turns === fewest);
      return lowest[Math.floor(Math.random() * lowest.length)];
    },
    [students],
  );

  // Countdown
  const phase = round?.phase;
  const paused = round?.paused;
  const slideId = round?.slide.id;
  useEffect(() => {
    if (phase !== "question" || paused) return;
    const t = setInterval(() => {
      setRound((r) =>
        r && r.phase === "question" && !r.paused && r.secondsLeft > 0
          ? { ...r, secondsLeft: r.secondsLeft - 1 }
          : r,
      );
    }, 1000);
    return () => clearInterval(t);
  }, [phase, paused, slideId]);

  const onAdd = (names: string[]) => {
    setStudents((prev) => [
      ...prev,
      ...names.map((name) => ({ id: uid(), name, level, score: 0, turns: 0 })),
    ]);
  };

  const onRemove = (id: string) => setStudents((prev) => prev.filter((s) => s.id !== id));

  const onResetScores = () =>
    setStudents((prev) => prev.map((s) => ({ ...s, score: 0, turns: 0 })));

  const missingNames = STUDENTS[level]
    .filter((e: { name: string }) => !students.some((s) => s.level === level && s.name.toLowerCase() === e.name.toLowerCase()))
    .map((e: { name: string }) => e.name);

  const onCallNext = () => {
    const s = pickNext(level);
    if (s) startRound(s.id, level);
  };

  const onMark = useCallback(
    (result: "correct" | "wrong") => {
      if (!round || round.result) return;
      const gained = result === "correct" ? (round.slide.points ?? DEFAULT_POINTS) : 0;
      setStudents((prev) =>
        prev.map((s) =>
          s.id === round.studentId ? { ...s, turns: s.turns + 1, score: s.score + gained } : s,
        ),
      );
      setRound({ ...round, result });
    },
    [round],
  );

  /** Same student, another question. */
  const onNextQuestion = useCallback(() => {
    if (!round) return;
    startRound(round.studentId, round.level, round.questionNo + 1);
  }, [round, startRound]);

  /** Move on to a different student, who starts fresh at question 1. */
  const onNextStudent = useCallback(() => {
    if (!round) return;
    const s = pickNext(round.level, round.studentId);
    if (s) startRound(s.id, round.level);
  }, [round, pickNext, startRound]);

  const onShow = useCallback(
    () => setRound((r) => (r && r.phase === "ready" ? { ...r, phase: "question" } : r)),
    [],
  );
  const onReveal = useCallback(
    () => setRound((r) => (r && r.phase === "question" ? { ...r, phase: "revealed", paused: true } : r)),
    [],
  );
  const onTogglePause = useCallback(
    () => setRound((r) => (r && r.phase === "question" ? { ...r, paused: !r.paused } : r)),
    [],
  );
  const onExit = useCallback(() => setRound(null), []);

  if (!ready) {
    return <div className="graph-paper min-h-dvh" aria-busy="true" />;
  }

  const student = round ? students.find((s) => s.id === round.studentId) : undefined;
  if (round && student) {
    return (
      <Stage
        round={round}
        student={student}
        deckSize={QUESTIONS[round.level].length}
        called={called[round.level]}
        onShow={onShow}
        onReveal={onReveal}
        onMark={onMark}
        onNextQuestion={onNextQuestion}
        onNextStudent={onNextStudent}
        onTogglePause={onTogglePause}
        onExit={onExit}
      />
    );
  }

  return (
    <Roster
      level={level}
      onLevel={setLevel}
      students={students}
      deckSize={QUESTIONS[level].length}
      called={called[level]}
      onAdd={onAdd}
      onRemove={onRemove}
      onCall={(id) => startRound(id, level)}
      onCallNext={onCallNext}
      onResetScores={onResetScores}
      codeNamesMissing={missingNames.length}
      onLoadFromCode={() => onAdd(missingNames)}
    />
  );
}