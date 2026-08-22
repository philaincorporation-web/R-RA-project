import { NextResponse } from "next/server";
import { getActivities } from "@/lib/sheetdb/queries";

export async function GET() {
  const activities = await getActivities();
  return NextResponse.json({ ok: true, data: activities });
}
