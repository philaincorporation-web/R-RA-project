"use client";

import { HashLoader } from "react-spinners";

export function LoadingScreen({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center gap-4 bg-rera-mist dark:bg-rera-navy-900"
          : "flex min-h-[50vh] flex-col items-center justify-center gap-4"
      }
    >
      <HashLoader color="#012474" size={60} />
      <p className="text-sm font-medium text-rera-navy-500 dark:text-rera-mist/60">
        Chargement...
      </p>
    </div>
  );
}