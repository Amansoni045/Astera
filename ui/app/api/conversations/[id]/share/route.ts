import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateShareToken } from "@/lib/repositories/conversationRepository";

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
    const shareToken = await generateShareToken(session.user.id, id);
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const shareUrl = `${protocol}://${host}/share/${shareToken}`;

    return NextResponse.json({ shareToken, shareUrl });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate share link" },
      { status: 500 },
    );
  }
}
