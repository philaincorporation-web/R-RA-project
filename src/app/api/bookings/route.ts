import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation/schemas";
import { createBooking } from "@/lib/sheetdb/mutations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const result = await createBooking(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "sheetdb_error" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, reference: result.reference });
}
