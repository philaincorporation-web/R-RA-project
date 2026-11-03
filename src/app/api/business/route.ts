import { after, NextResponse } from "next/server";
import { businessRequestSchema } from "@/lib/validation/schemas";
import { getCurrentUser } from "@/lib/auth/server";
import { recordReservation } from "@/lib/db/reservations";
import { generateReference } from "@/lib/db/contact";
import { notifyTeam } from "@/lib/notifications/team";
import { businessServices } from "@/data/business-services";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = businessRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const input = parsed.data;
  const reference = generateReference("RERA-BIZ");
  const title = businessServices.find((s) => s.id === input.service)?.title.fr ?? input.service;
  const user = await getCurrentUser();
  let claimToken: string | null = null;
  try {
    ({ claimToken } = await recordReservation(
      {
        reference,
        kind: "business",
        fullName: input.contactName,
        email: input.email,
        phone: input.phone,
        title,
        startDate: input.preferredDate,
        summary: {
          service: input.service,
          organization: input.organization ?? "",
          attendees: input.attendees ?? null,
          budget: input.budget ?? "",
          details: input.details,
          message: input.message ?? "",
        },
      },
      user?.id ?? null
    ));
  } catch (error) {
    console.error("[business] enregistrement impossible", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  after(() =>
    notifyTeam({
      subject: `Nouvelle demande Business : ${title}`,
      lines: [
        ["Référence", reference],
        ["Rubrique", title],
        ["Contact", input.contactName],
        ["Organisation", input.organization || "—"],
        ["E-mail", input.email],
        ["Téléphone", input.phone],
      ],
      adminPath: `/fr/admin/business/${encodeURIComponent(reference)}`,
    })
  );

  return NextResponse.json({ ok: true, reference, signedIn: Boolean(user), claimToken });
}
