import { cn } from "@/lib/utils/cn";

/** Classes partagées du back-office (utilisables côté serveur ET client : pas de "use client" ici). */

export const adminInput =
  "h-11 w-full rounded-lg border border-rera-navy-200 bg-white px-3.5 text-sm text-rera-navy-800 placeholder:text-rera-navy-300 focus:border-rera-lagoon-500 focus:outline-none focus:ring-2 focus:ring-rera-lagoon-200";
export const adminLabel = "mb-1.5 block text-sm font-medium text-rera-navy-700";

export type AdminButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<AdminButtonVariant, string> = {
  primary: "bg-rera-navy-700 text-white hover:bg-rera-navy-600",
  secondary: "border border-rera-navy-200 bg-white text-rera-navy-700 hover:bg-rera-mist",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  ghost: "text-rera-navy-600 hover:bg-rera-navy-50",
};

export function adminButton(variant: AdminButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rera-lagoon-300 disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className
  );
}
