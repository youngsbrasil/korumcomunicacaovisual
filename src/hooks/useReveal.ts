import { useEffect, useRef } from "react";

/**
 * Observes descendants with the `.reveal` class inside the returned ref
 * and adds `is-visible` when they scroll into view.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets: Element[] = [];
    if (root.classList.contains("reveal")) targets.push(root);
    targets.push(...Array.from(root.querySelectorAll(".reveal")));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}
