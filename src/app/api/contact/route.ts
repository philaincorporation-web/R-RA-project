import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/schemas";
import { createContactMessage } from "@/lib/sheetdb/mutations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const result = await createContactMessage(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "sheetdb_error" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, reference: result.reference });
}
