import { NextRequest, NextResponse } from "next/server";
import { hasCampusAccess } from "@/lib/campus-auth";

export async function GET(request: NextRequest) {
  const allowed = await hasCampusAccess(request, true);
  return NextResponse.json({ valid: allowed }, { status: allowed ? 200 : 401, headers: { "Cache-Control": "no-store" } });
}
