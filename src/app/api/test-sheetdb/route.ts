import { NextResponse } from "next/server";
import { sheetdbGetAll } from "@/lib/sheetdb/client";

export async function GET() {
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