"use client";

import { useEffect, useRef } from "react";
import { animate, splitText, stagger } from "animejs";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils/cn";

type AnimatedTextTag = "p" | "h1" | "h2" | "h3" | "span";

export function AnimatedText({
  text,
  as = "p",
  className,
}: {
  text: string;
  as?: AnimatedTextTag;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return;

    // En Strict Mode (dev uniquement), React monte ce composant deux fois.
    // Comme le split par lignes est asynchrone (attend le chargement des
    // polices), les deux instances peuvent se marcher dessus sur le même
    // élément DOM. `cancelled` permet d'ignorer proprement l'exécution
    // "fantôme" issue du premier montage, une fois qu'il a été nettoyé.
    let cancelled = false;

    const splitter = splitText(ref.current, { lines: { wrap: "clip" } });

    splitter.addEffect(({ lines }) => {
      if (cancelled || lines.length === 0) return;

      // Animation d'entrée jouée une seule fois : le texte reste ensuite lisible
      // (auparavant il sortait de l'écran et revenait en boucle).
      return animate(lines, {
        y: { from: "100%", to: "0%" },
        duration: 900,
        ease: "out(3)",
        delay: stagger(150),
      });
    });

    return () => {
      cancelled = true;
      splitter.revert();
    };
  }, [text, reducedMotion]);

  const Tag = as as "p";

  return (
    <Tag ref={ref as React.RefObject<HTMLParagraphElement>} className={cn(className)}>
      {text}
    </Tag>
  );
}