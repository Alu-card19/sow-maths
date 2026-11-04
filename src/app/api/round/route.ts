import { getCurrentRound, setCurrentRound } from "@/lib/state";
import type { Round } from "@/lib/types";

export async function GET() {
  const round = getCurrentRound();
  return Response.json({ round });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const round: Round | null = data.round;
    setCurrentRound(round);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
