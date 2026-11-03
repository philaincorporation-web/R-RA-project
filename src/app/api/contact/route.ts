import { after, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/schemas";
import { generateReference, insertContactMessage } from "@/lib/db/contact";
import { notifyTeam } from "@/lib/notifications/team";

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

  const input = parsed.data;
  const reference = generateReference("RERA-MSG");
  try {
    await insertContactMessage({ reference, ...input });
  } catch (error) {
    console.error("[contact] enregistrement impossible", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  after(() =>
    notifyTeam({
      subject: `Nouveau message : ${input.subject}`,
      lines: [
        ["Référence", reference],
        ["De", input.fullName],
        ["E-mail", input.email],
        ["Sujet", input.subject],
      ],
      adminPath: `/fr/admin/messages/${encodeURIComponent(reference)}`,
    })
  );

  return NextResponse.json({ ok: true, reference });
}
