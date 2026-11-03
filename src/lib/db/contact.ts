import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "./sql";

/** Référence lisible et non devinable : RERA-BK-<horodatage>-<aléa>. */
export function generateReference(prefix: "RERA-BK" | "RERA-BIZ" | "RERA-MSG") {
  const now = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${now}-${rand}`;
}

export async function insertContactMessage(input: {
  reference: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
}) {
  await db()`
    INSERT INTO contact_messages (reference, full_name, email, subject, message)
    VALUES (${input.reference}, ${input.fullName}, ${input.email}, ${input.subject}, ${input.message})
  `;
}
