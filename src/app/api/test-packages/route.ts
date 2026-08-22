import { NextResponse } from "next/server";
import { getPackages } from "@/lib/sheetdb/queries";

export async function GET() {
  const packages = await getPackages();

  return NextResponse.json({
    count: packages.length,
    packages,
  });
}