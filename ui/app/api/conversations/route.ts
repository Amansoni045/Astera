import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserConversations,
  createConversation,
} from "@/lib/repositories/conversationRepository";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const archived = searchParams.get("archived") === "true";

  try {
    const conversations = await getUserConversations(session.user.id, {
      search,
      archived,
    });
    return NextResponse.json(conversations);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { prompt, result } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const conversation = await createConversation(session.user.id, prompt.trim(), result);
    return NextResponse.json(conversation, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create conversation" },
      { status: 500 },
    );
  }
}
