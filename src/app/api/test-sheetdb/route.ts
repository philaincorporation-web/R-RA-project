import { NextResponse } from "next/server";
import { sheetdbGetAll } from "@/lib/sheetdb/client";

export async function GET() {
  // Route de diagnostic : désactivée en production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const data = await sheetdbGetAll({
    sheet: "packages",
    revalidateSeconds: 0,
  });

  return NextResponse.json({
    success: data !== null,
    count: data?.length ?? 0,
    data,
  });
}