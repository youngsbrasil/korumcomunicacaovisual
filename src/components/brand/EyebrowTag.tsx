import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EyebrowTag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-block font-mono text-xs tracking-normal text-korum-green md:text-sm", className)}>&lt;{children}&gt;</span>;
}