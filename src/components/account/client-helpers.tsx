"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PENDING_CLAIM_KEY } from "@/components/account/account-prompt";

/** Efface la réservation en attente une fois l'utilisateur arrivé dans son espace (déjà rattachée côté serveur). */
export function ClearPendingClaim() {
  useEffect(() => {
    try {
      sessionStorage.removeItem(PENDING_CLAIM_KEY);
    } catch {
      // ignore
    }
  }, []);
  return null;
}

export function PrintButton({ label }: { label: string }) {
  return (
    <Button type="button" variant="secondary" size="sm" onClick={() => window.print()} className="print:hidden">
      <Printer className="h-4 w-4" />
      {label}
    </Button>
  );
}
