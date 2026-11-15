import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import { back, galleryState, galleryProjects, transition } from "@/data/projects";

export function GalleryRow({ ready }: { ready: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const busy = useRef(false); // true while an intro/return animation is running
  const [hover, setHover] = useState<number | null>(null);
  const navigate = useNavigate();

  // Restore scroll + play the return or reveal animation
  useLayoutEffect(() => {
    const tr = track.current!;
    const vp = viewport.current!;
    const main = vp.closest("main") as HTMLElement | null;
    gsap.set(tr, { x: -galleryState.x });
    const cards = tr.querySelectorAll<HTMLElement>("[data-i]");
    const overlays = tr.querySelectorAll<HTMLElement>("[data-overlay]");

    if (!ready) {
      gsap.set(cards, { opacity: 0 });
      return;
    }

    const { rect, slug } = back;
    const target = slug ? tr.querySelector<HTMLElement>(`[data-slug="${slug}"]`) : null;
    const isReturn = !!(rect && target);
    if (!isReturn) {
      back.rect = null;
      back.slug = null;
    }

    busy.current = true;

    const ctx = gsap.context(() => {
      if (isReturn && rect && target) {
        // ---------- Return from a project page ----------
        vp.style.overflow = "visible";
        if (main) main.style.overflow = "visible";

        gsap.set(overlays, { xPercent: 100 });

        const box = target.querySelector<HTMLElement>("[data-box]")!;
        const to = box.getBoundingClientRect();
        const others = [...cards].filter((c) => c !== target);

        const scaleX = rect.width / to.width;
        const scaleY = rect.height / to.height;

        gsap.set(target, { zIndex: 50, position: "relative" });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(target, { clearProps: "zIndex,position" });
            gsap.set(box, { clearProps: "transform,transformOrigin" });
            vp.style.overflow = "";
            if (main) main.style.overflow = "";
            busy.current = false;
            back.rect = null;
            back.slug = null;
          },
        });

        tl.fromTo(
          box,
          {
            x: rect.left - to.left,
            y: rect.top - to.top,
            scaleX,
            scaleY,
            transformOrigin: "top left",
            force3D: true,
          },
          {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 1.1,
            ease: "expo.inOut",
          },
          0
        );

        tl.fromTo(
          others,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out" },
          0.5
        );
      } else {
        // ---------- First load: the deal ----------
        const labels = tr.querySelectorAll("p");
        const boxes = [...cards].map((c) => c.querySelector<HTMLElement>("[data-box]")!);
        const introH = Math.min(window.innerHeight * 0.52, 460);
        const introW = introH * (4 / 5);
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        vp.style.overflow = "visible";
        if (main) main.style.overflow = "visible";
        gsap.set(labels, { opacity: 0 });

        gsap.set(overlays, { xPercent: 0 });

        cards.forEach((card, i) => {
          gsap.set(card, {
            opacity: i === 0 ? 1 : 0,
            zIndex: cards.length - i,
            position: "relative",
          });
        });

        boxes.forEach((box, i) => {
          const r = box.getBoundingClientRect();
          const sx = introW / r.width;
          const sy = introH / r.height;

          gsap.set(box, {
            x: cx - (r.left + r.width / 2),
            y: cy - (r.top + r.height / 2),
            rotation: 0,
            scaleX: i === 0 ? sx : sx * 0.92,
            scaleY: i === 0 ? sy : sy * 0.92,
            transformOrigin: "center center",
            willChange: "transform",
            force3D: true,
          });
        });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(cards, { clearProps: "zIndex,position,opacity" });
            gsap.set(boxes, { clearProps: "transform,willChange,transformOrigin" });
            vp.style.overflow = "";
            if (main) main.style.overflow = "";
            busy.current = false;
          },
        });

        boxes.forEach((box, i) => {
          const delay = i * 0.07;
          const overlay = overlays[i]!;

          if (i > 0) {
            tl.set(cards[i]!, { opacity: 1 }, delay);
          }

          tl.to(
            box,
            {
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              duration: 1.3,
              ease: "power3.inOut",
            },
            delay
          );

          tl.to(
            overlay,
            {
              xPercent: 100,
              duration: 0.85,
              ease: "power3.inOut",
            },
            delay + 0.25
          );
        });

        tl.to(
          labels,
          { opacity: 1, duration: 0.5, stagger: 0.04, ease: "power2.out" },
          ">-0.7"
        );
      }
    });

    return () => {
      ctx.revert();
      vp.style.overflow = "";
      if (main) main.style.overflow = "";
      busy.current = false;
    };
  }, [ready]);

  // Wheel -> horizontal scroll
  useEffect(() => {
    const vp = viewport.current!,
      tr = track.current!;
    const setX = gsap.quickTo(tr, "x", { duration: 1.1, ease: "power3.out" });
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (busy.current) return;
      const mult = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
      const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * mult;
      const max = Math.max(0, tr.scrollWidth - vp.clientWidth);
      galleryState.x = Math.min(max, Math.max(0, galleryState.x + d));
      setX(-galleryState.x);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const open = (i: number, box: HTMLElement) => {
    if (busy.current) return;
    busy.current = true;

    transition.rect = box.getBoundingClientRect();
    navigate({ to: "/project/$slug", params: { slug: galleryProjects[i]!.slug } });
  };

  return (
    <div ref={viewport} className="w-full overflow-hidden">
      {/* pl-6 pr-10 adds the margin to show background color before the first card and after the last card */}
      <div ref={track} className="flex w-max gap-[10px] pl-6 pr-10 will-change-transform">
        {galleryProjects.map((p, i) => (
          <button
            key={p.slug}
            data-i={i}
            data-slug={p.slug}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={(e) => open(i, e.currentTarget.querySelector<HTMLElement>("[data-box]")!)}
            className="block shrink-0 cursor-pointer text-left"
          >
            <p className="ui-text mb-3">{p.name}</p>
            <div
              data-box
              className="relative h-[clamp(320px,64vh,660px)] overflow-hidden bg-background transition-[filter] duration-500"
              style={{
                aspectRatio: `${p.w} / 660`,
                filter:
                  hover === i
                    ? "grayscale(0%)"
                    : hover !== null
                      ? "grayscale(70%) opacity(0.4)"
                      : "grayscale(70%)",
              }}
            >
              <img
                src={p.cover}
                alt={p.name}
                className="h-full w-full object-cover"
                style={{ objectPosition: p.coverPosition || "center" }}
                draggable={false}
              />
              <div
                data-overlay
                className="pointer-events-none absolute inset-0 z-10 bg-neutral-900/45 backdrop-grayscale-[40%] will-change-transform"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}