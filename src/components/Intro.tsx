import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { introFrame, galleryProjects } from "@/data/projects";

/** First-load loader: swipe through covers in one frame, then the gallery deals the deck. */
export function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  // Reverse the 5 featured cards so the first one lands on top
  const deck = [...galleryProjects].reverse();

  useLayoutEffect(() => {
    let cancelled = false;
    let ctx: gsap.Context | undefined;

    const imgs = Array.from(root.current!.querySelectorAll("img"));
    const decoded = Promise.all(imgs.map((im) => im.decode().catch(() => undefined)));
    const timeout = new Promise((r) => setTimeout(r, 3000));

    Promise.race([decoded, timeout]).then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        const counter = root.current!.querySelector("[data-count]")!;
        const tl = gsap.timeline({ onComplete: onDone });
        const total = 2;
        const swipe = Math.min(0.35, total / Math.max(cards.length, 1));

        gsap.set(cards, { xPercent: 100, opacity: 1 });
        gsap.set(cards[0]!, { xPercent: 0 });

        cards.forEach((card, i) => {
          if (i === 0) return;
          const t = (i / cards.length) * total;
          tl.to(cards[i - 1]!, { xPercent: -100, duration: swipe, ease: "power2.inOut" }, t);
          tl.fromTo(card, { xPercent: 100 }, { xPercent: 0, duration: swipe, ease: "power2.inOut" }, t);
        });

        tl.to(counter, { textContent: 100, snap: { textContent: 1 }, duration: total, ease: "none" }, 0);
        tl.to({}, { duration: 0.08 });
      }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [onDone]);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-30 flex items-center justify-center overflow-hidden bg-background pointer-events-none"
    >
      <div
        className="relative overflow-hidden"
        style={{ height: introFrame.height, aspectRatio: `${introFrame.ratio}` }}
      >
        {deck.map((p) => (
          <img
            key={p.slug}
            data-card
            src={p.cover}
            alt=""
            style={{ opacity: 0, objectPosition: p.coverPosition || "center" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ))}
        {/* Grey overlay sitting on cards during shuffle */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-neutral-900/45 backdrop-grayscale-[40%]" />
      </div>
      <span data-count className="ui-text absolute bottom-5 left-5">
        0
      </span>
    </div>
  );
}