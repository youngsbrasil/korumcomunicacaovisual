import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EyebrowTag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-korum-green md:text-xs",
        className,
      )}
    >
      <span aria-hidden className="inline-block h-px w-6 bg-korum-green/70" />
      <span>&lt;{children}&gt;</span>
    </span>
  );
}
