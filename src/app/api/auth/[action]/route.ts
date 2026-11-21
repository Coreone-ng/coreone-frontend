import { NextRequest, NextResponse } from "next/server";
import { handleAuth } from "@/features/auth/server";

export const runtime = "nodejs";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  return action === "session"
    ? handleAuth(request, action)
    : NextResponse.json({ message: "Not found." }, { status: 404 });
}
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  return handleAuth(request, (await context.params).action);
}
