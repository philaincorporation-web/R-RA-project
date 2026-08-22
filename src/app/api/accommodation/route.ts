import { NextResponse } from "next/server";
import { getAccommodations } from "@/lib/sheetdb/queries";

export async function GET() {
  const accommodations = await getAccommodations();
  return NextResponse.json({ ok: true, data: accommodations });
}
