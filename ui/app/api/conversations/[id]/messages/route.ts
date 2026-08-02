import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addResearchTurn } from "@/lib/repositories/conversationRepository";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { prompt, result } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim() || !result) {
      return NextResponse.json(
        { error: "Prompt and Research Result are required." },
        { status: 400 },
      );
    }

    const updated = await addResearchTurn(
      session.user.id,
      id,
      prompt.trim(),
      result,
    );

    return NextResponse.json(updated, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to add message to conversation" },
      { status: 500 },
    );
  }
}
