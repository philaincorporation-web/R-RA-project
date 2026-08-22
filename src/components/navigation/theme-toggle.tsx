"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className, dark }: { className?: string; dark?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  // Évite les mismatches d'hydratation : ne rend le vrai bouton qu'une fois monté côté client.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className={cn("h-9 w-9 rounded-full", className)} aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        dark
          ? "text-white hover:bg-white/10"
          : "text-rera-navy-700 hover:bg-rera-navy-100/70 dark:text-rera-mist dark:hover:bg-white/10",
        className
      )}
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
