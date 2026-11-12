"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LEVELS, levelLabel, type Level, type ParticipantResult } from "@/lib/types";

export default function ResultsPage() {
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ParticipantResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedLevel, setSelectedLevel] = useState<Level | "all">("all");
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "completedAt" | "studentName">("completedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Get unique campuses from results
  const [campuses, setCampuses] = useState<string[]>([]);

  // Load results on mount
  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/results");
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        // Extract unique campuses
        const uniqueCampuses = Array.from(new Set(data.results.map((r: ParticipantResult) => r.campus).filter(Boolean)));
        setCampuses(uniqueCampuses as string[]);
      } else {
        setError(data.error || "Failed to load results");
      }
    } catch (err) {
      setError("Error loading results: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort results
  useEffect(() => {
    let filtered = results;

    // Apply filters
    if (selectedLevel !== "all") {
      filtered = filtered.filter((r) => r.level === selectedLevel);
    }
    if (selectedCampus !== "all") {
      filtered = filtered.filter((r) => r.campus === selectedCampus);
    }

    // Sort results
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    setFilteredResults(filtered);
  }, [results, selectedLevel, selectedCampus, sortBy, sortOrder]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Student Name",
      "Class",
      "Campus",
      "Score",
      "Questions Attempted",
      "Correct Answers",
      "Incorrect Answers",
      "Round Duration (mins)",
      "Completion Time (secs)",
      "Completed At",
    ];

    const rows = filteredResults.map((r) => [
      r.studentName,
      levelLabel(r.level),
      r.campus || "N/A",
      r.score,
      r.questionsAttempted,
      r.correctAnswers,
      r.incorrectAnswers,
      r.sessionDurationMinutes,
      r.completionTimeSeconds,
      new Date(r.completedAt).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Export to JSON
  const exportToJSON = () => {
    const data = JSON.stringify(filteredResults, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Calculate statistics
  const stats = {
    totalResults: filteredResults.length,
    totalScore: filteredResults.reduce((sum, r) => sum + r.score, 0),
    averageScore: filteredResults.length > 0 ? (filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length).toFixed(2) : 0,
    averageQuestions: filteredResults.length > 0 ? (filteredResults.reduce((sum, r) => sum + r.questionsAttempted, 0) / filteredResults.length).toFixed(2) : 0,
    totalCorrect: filteredResults.reduce((sum, r) => sum + r.correctAnswers, 0),
    totalIncorrect: filteredResults.reduce((sum, r) => sum + r.incorrectAnswers, 0),
  };

  return (
    <div className="graph-paper min-h-dvh">
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-medium text-ink-soft">Seat of Wisdom Montessori</p>
            <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
              Results & Leaderboard
            </h1>
          </div>
          <Link
            href="/"
            className="w-fit rounded-xl bg-ink px-5 py-3 text-lg font-bold text-chalk transition-colors hover:bg-ink-soft"
          >
            Back to console
          </Link>
        </header>

        {error && (
          <div className="rounded-2xl border-2 border-rose bg-rose/20 p-5">
            <p className="text-lg font-bold text-rose">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-ink-soft">Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-ink/30 bg-chalk/70 p-8 text-center">
            <p className="text-lg text-ink-soft">No results yet. Start a session to see results here.</p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="Total Results" value={stats.totalResults.toString()} />
              <StatCard label="Total Score" value={stats.totalScore.toString()} />
              <StatCard label="Average Score" value={stats.averageScore.toString()} />
              <StatCard label="Avg Questions" value={stats.averageQuestions.toString()} />
              <StatCard label="Correct Answers" value={stats.totalCorrect.toString()} />
              <StatCard label="Incorrect Answers" value={stats.totalIncorrect.toString()} />
            </section>

            {/* Filters and Controls */}
            <section className="rounded-2xl border-2 border-ink/15 bg-chalk p-5">
              <h2 className="mb-4 text-xl font-bold">Filters & Export</h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Level filter */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="level" className="text-sm font-semibold text-ink-soft">
                    Class
                  </label>
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as Level | "all")}
                    className="rounded-lg border-2 border-ink/30 bg-white px-3 py-2 text-base outline-none focus:border-ink"
                  >
                    <option value="all">All Classes</option>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {levelLabel(l)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campus filter */}
                {campuses.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="campus" className="text-sm font-semibold text-ink-soft">
                      Campus
                    </label>
                    <select
                      id="campus"
                      value={selectedCampus}
                      onChange={(e) => setSelectedCampus(e.target.value)}
                      className="rounded-lg border-2 border-ink/30 bg-white px-3 py-2 text-base outline-none focus:border-ink"
                    >
                      <option value="all">All Campuses</option>
                      {campuses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sort by */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="sortBy" className="text-sm font-semibold text-ink-soft">
                    Sort By
                  </label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "score" | "completedAt" | "studentName")}
                    className="rounded-lg border-2 border-ink/30 bg-white px-3 py-2 text-base outline-none focus:border-ink"
                  >
                    <option value="completedAt">Date (Newest)</option>
                    <option value="score">Score (Highest)</option>
                    <option value="studentName">Name (A-Z)</option>
                  </select>
                </div>

                {/* Sort order toggle */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="rounded-lg bg-ink px-3 py-2 text-sm font-bold text-chalk transition-colors hover:bg-ink-soft"
                  >
                    {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                  </button>
                </div>
              </div>

              {/* Export buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={exportToCSV}
                  className="rounded-lg bg-gold px-4 py-2 font-bold text-ink hover:brightness-110"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={exportToJSON}
                  className="rounded-lg bg-gold px-4 py-2 font-bold text-ink hover:brightness-110"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={loadResults}
                  className="rounded-lg border-2 border-ink/30 px-4 py-2 font-bold hover:border-ink"
                >
                  Refresh
                </button>
              </div>
            </section>

            {/* Results Table */}
            <section className="overflow-x-auto rounded-2xl border-2 border-ink/15 bg-chalk">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-ink/15 bg-ink/5">
                    <th className="px-4 py-3 text-sm font-bold text-ink-soft">Student</th>
                    <th className="px-4 py-3 text-sm font-bold text-ink-soft">Class</th>
                    <th className="px-4 py-3 text-sm font-bold text-ink-soft">Campus</th>
                    <th className="px-4 py-3 text-sm font-bold text-ink-soft">Score</th>
                    <th className="px-4 py-3 text-sm font-bold text-ink-soft">Attempted</th>
                    <th className="px-4 py-3 text-sm font-bold text-ink-soft">Correct</th>
                    <th className="px-4 py-3 text-sm font-bold text-ink-soft">Incorrect</th>
                    <th className="px-4 py-3 text-sm font-bold text-ink-soft">Duration</th>
                    <th className="px-4 py-3 text-sm font-bold text-ink-soft">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => (
                    <tr key={result.id} className={`border-b border-ink/10 ${idx % 2 === 0 ? "bg-white" : "bg-chalk"}`}>
                      <td className="px-4 py-3 font-semibold">{result.studentName}</td>
                      <td className="px-4 py-3">{levelLabel(result.level)}</td>
                      <td className="px-4 py-3">{result.campus || "—"}</td>
                      <td className="px-4 py-3 font-bold text-gold">{result.score}</td>
                      <td className="px-4 py-3">{result.questionsAttempted}</td>
                      <td className="px-4 py-3 text-leaf">{result.correctAnswers}</td>
                      <td className="px-4 py-3 text-rose">{result.incorrectAnswers}</td>
                      <td className="px-4 py-3">{result.sessionDurationMinutes}m</td>
                      <td className="px-4 py-3 text-sm text-ink-soft">
                        {new Date(result.completedAt).toLocaleDateString()} {new Date(result.completedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Leaderboard */}
            <section className="grid gap-8 lg:grid-cols-2">
              {/* Top Scorers */}
              <div className="rounded-2xl border-2 border-ink/15 bg-chalk p-5">
                <h2 className="mb-4 text-2xl font-bold">Top Scorers</h2>
                <div className="space-y-2">
                  {filteredResults
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10)
                    .map((result, idx) => (
                      <div key={result.id} className="flex items-center gap-3 rounded-lg bg-white px-4 py-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-bold text-ink">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold">{result.studentName}</p>
                          <p className="text-sm text-ink-soft">{levelLabel(result.level)}</p>
                        </div>
                        <p className="tabular text-2xl font-extrabold text-gold">{result.score}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Most Correct Answers */}
              <div className="rounded-2xl border-2 border-ink/15 bg-chalk p-5">
                <h2 className="mb-4 text-2xl font-bold">Most Correct Answers</h2>
                <div className="space-y-2">
                  {filteredResults
                    .sort((a, b) => b.correctAnswers - a.correctAnswers)
                    .slice(0, 10)
                    .map((result, idx) => (
                      <div key={result.id} className="flex items-center gap-3 rounded-lg bg-white px-4 py-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf font-bold text-chalk">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold">{result.studentName}</p>
                          <p className="text-sm text-ink-soft">{levelLabel(result.level)}</p>
                        </div>
                        <p className="tabular text-2xl font-extrabold text-leaf">{result.correctAnswers}</p>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-ink/15 bg-chalk p-4">
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
