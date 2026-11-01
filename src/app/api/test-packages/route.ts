import { NextResponse } from "next/server";
import { getPackages } from "@/lib/sheetdb/queries";

export async function GET() {
  // Route de diagnostic : désactivée en production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const packages = await getPackages();

  return NextResponse.json({
    count: packages.length,
    packages,
  });
}