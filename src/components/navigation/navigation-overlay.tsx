"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HashLoader } from "react-spinners";

function NavigationOverlayInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const currentKey = `${pathname}?${searchParams.toString()}`;
  const previousKey = useRef(currentKey);

  useEffect(() => {
    if (previousKey.current !== currentKey) {
      previousKey.current = currentKey;
      setIsNavigating(false);
    }
  }, [currentKey]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;

      const anchor = (event.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || target === "_blank" || href.startsWith("#")) return;

      const isInternal = href.startsWith("/") || href.startsWith(window.location.origin);
      const isSameUrl = href === pathname + window.location.search;
      if (isInternal && !isSameUrl) {
        setIsNavigating(true);
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isNavigating ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white/50 backdrop-blur-md dark:bg-rera-navy-900/50"
        >
          <HashLoader color="#20B2C9" size={60} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function NavigationOverlay() {
  return (
    <Suspense fallback={null}>
      <NavigationOverlayInner />
    </Suspense>
  );
}