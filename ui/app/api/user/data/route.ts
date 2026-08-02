import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  exportUserData,
  deleteAllUserConversations,
} from "@/lib/repositories/conversationRepository";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await exportUserData(session.user.id);
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="astera_export_${Date.now()}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to export data" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await deleteAllUserConversations(session.user.id);
    return NextResponse.json({ success: true, count: result.count });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete conversations" },
      { status: 500 },
    );
  }
}
