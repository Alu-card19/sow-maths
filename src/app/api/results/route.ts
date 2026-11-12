import { promises as fs } from "fs";
import path from "path";
import type { ParticipantResult } from "@/lib/types";

// Path to the results storage file in the public directory
const RESULTS_FILE = path.join(process.cwd(), "public", "results.json");

/**
 * Ensure the results file exists and is valid JSON
 */
async function ensureResultsFile() {
  try {
    await fs.access(RESULTS_FILE);
  } catch {
    // File doesn't exist, create it with empty array
    await fs.mkdir(path.dirname(RESULTS_FILE), { recursive: true });
    await fs.writeFile(RESULTS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Read all results from the file
 */
async function readResults(): Promise<ParticipantResult[]> {
  await ensureResultsFile();
  try {
    const data = await fs.readFile(RESULTS_FILE, "utf-8");
    return JSON.parse(data) as ParticipantResult[];
  } catch {
    return [];
  }
}

/**
 * Write results to the file
 */
async function writeResults(results: ParticipantResult[]): Promise<void> {
  await ensureResultsFile();
  await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2));
}

/**
 * GET /api/results - Retrieve all results or filtered results
 * Query params:
 * - level: Filter by class level (e.g., JSS1, JSS2)
 * - campus: Filter by campus
 * - studentId: Filter by specific student
 * - sortBy: Sort field (score, completedAt, studentName)
 * - order: Sort order (asc, desc)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const campus = searchParams.get("campus");
    const studentId = searchParams.get("studentId");
    const sortBy = searchParams.get("sortBy") || "completedAt";
    const order = searchParams.get("order") || "desc";

    let results = await readResults();

    // Apply filters
    if (level) {
      results = results.filter((r) => r.level === level);
    }
    if (campus) {
      results = results.filter((r) => r.campus === campus);
    }
    if (studentId) {
      results = results.filter((r) => r.studentId === studentId);
    }

    // Sort results
    results.sort((a, b) => {
      let aVal: any = a[sortBy as keyof ParticipantResult];
      let bVal: any = b[sortBy as keyof ParticipantResult];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (order === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return Response.json({ success: true, results, count: results.length });
  } catch (error) {
    console.error("Error reading results:", error);
    return Response.json(
      { error: "Failed to read results" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/results - Save a new result
 */
export async function POST(request: Request) {
  try {
    const result: ParticipantResult = await request.json();

    // Validate required fields
    if (
      !result.studentId ||
      !result.studentName ||
      !result.level ||
      result.score === undefined ||
      result.questionsAttempted === undefined
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Add server-side timestamps and ID
    const newResult: ParticipantResult = {
      ...result,
      id: `${result.studentId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const results = await readResults();
    results.push(newResult);
    await writeResults(results);

    return Response.json(
      { success: true, result: newResult },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving result:", error);
    return Response.json(
      { error: "Failed to save result" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/results?id=<resultId> - Delete a specific result
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Result ID is required" },
        { status: 400 }
      );
    }

    let results = await readResults();
    const initialLength = results.length;
    results = results.filter((r) => r.id !== id);

    if (results.length === initialLength) {
      return Response.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    await writeResults(results);
    return Response.json({ success: true, message: "Result deleted" });
  } catch (error) {
    console.error("Error deleting result:", error);
    return Response.json(
      { error: "Failed to delete result" },
      { status: 500 }
    );
  }
}
