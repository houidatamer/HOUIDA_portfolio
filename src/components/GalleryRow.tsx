import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import { back, galleryState, galleryProjects, transition } from "@/data/projects";

export function GalleryRow({ ready }: { ready: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const dragging = useRef(false);
  const [hover, setHover] = useState<number | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  useLayoutEffect(() => {
    const tr = track.current!;
    const vp = viewport.current!;
    const section = vp.closest("section") as HTMLElement | null;
    gsap.set(tr, { x: -galleryState.x });
    const cards = tr.querySelectorAll<HTMLElement>("[data-i]");

    const { rect, slug } = back;
    const target = slug ? tr.querySelector<HTMLElement>(`[data-slug="${slug}"]`) : null;
    const isReturn = !!(rect && target);
    if (!isReturn) {
      back.rect = null;
      back.slug = null;
      gsap.set(cards, { clearProps: "opacity,transform,zIndex,position" });
      return;
    }

    busy.current = true;

    const ctx = gsap.context(() => {
      if (rect && target) {
        if (section) section.scrollIntoView({ behavior: "instant" as ScrollBehavior });
        vp.style.overflow = "visible";
        if (section) section.style.overflow = "visible";

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
            if (section) section.style.overflow = "";
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
      }
    });

    return () => {
      ctx.revert();
      vp.style.overflow = "";
      if (section) section.style.overflow = "";
      busy.current = false;
    };
  }, [ready]);

  useEffect(() => {
    const vp = viewport.current!,
      tr = track.current!;
    const section = vp.closest("section") as HTMLElement | null;
    const setX = gsap.quickTo(tr, "x", { duration: 1.1, ease: "power3.out" });

    const clampX = (val: number) => {
      const max = Math.max(0, tr.scrollWidth - vp.clientWidth);
      return Math.min(max, Math.max(0, val));
    };

    const onWheel = (e: WheelEvent) => {
      if (busy.current || !section) return;
      const rect = section.getBoundingClientRect();
      if (rect.top > 10) return;

      const mult = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
      const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * mult;
      const max = Math.max(0, tr.scrollWidth - vp.clientWidth);

      if (d < 0 && galleryState.x <= 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        return;
      }

      if (max > 0) {
        e.preventDefault();
        galleryState.x = clampX(galleryState.x + d);
        setX(-galleryState.x);
      }
    };

    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (busy.current || e.touches.length !== 1) return;
      gsap.killTweensOf(tr);
      startX = e.touches[0]!.clientX;
      lastX = startX;
      lastTime = performance.now();
      startScroll = galleryState.x;
      velocity = 0;
      dragging.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (busy.current || e.touches.length !== 1) return;
      const x = e.touches[0]!.clientX;
      const dx = startX - x;
      if (Math.abs(dx) > 6) {
        dragging.current = true;
      }
      if (dragging.current) {
        e.preventDefault();
        const now = performance.now();
        const dt = Math.max(1, now - lastTime);
        velocity = (lastX - x) / dt;
        lastX = x;
        lastTime = now;

        galleryState.x = clampX(startScroll + dx);
        gsap.set(tr, { x: -galleryState.x });
      }
    };

    const onTouchEnd = () => {
      if (!dragging.current) return;
      const momentum = velocity * 260;
      galleryState.x = clampX(galleryState.x + momentum);
      gsap.to(tr, {
        x: -galleryState.x,
        duration: 0.85,
        ease: "power3.out",
      });
      setTimeout(() => {
        dragging.current = false;
      }, 60);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    vp.addEventListener("touchstart", onTouchStart, { passive: true });
    vp.addEventListener("touchmove", onTouchMove, { passive: false });
    vp.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      vp.removeEventListener("touchstart", onTouchStart);
      vp.removeEventListener("touchmove", onTouchMove);
      vp.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const open = (i: number, box: HTMLElement) => {
    if (busy.current || dragging.current) return;
    busy.current = true;

    transition.rect = box.getBoundingClientRect();
    navigate({ to: "/project/$slug", params: { slug: galleryProjects[i]!.slug } });
  };

  return (
    <div ref={viewport} className="w-full overflow-hidden touch-pan-x">
      <div
        ref={track}
        className="flex w-max gap-[10px] pl-4 pr-6 md:pl-6 md:pr-10 will-change-transform"
      >
        {galleryProjects.map((p, i) => {
          const filterStyle = isTouch
            ? "grayscale(0%)"
            : hover === i
              ? "grayscale(0%)"
              : hover !== null
                ? "grayscale(70%) opacity(0.4)"
                : "grayscale(70%)";

          return (
            <button
              key={p.slug}
              data-i={i}
              data-slug={p.slug}
              onMouseEnter={() => !isTouch && setHover(i)}
              onMouseLeave={() => !isTouch && setHover(null)}
              onClick={(e) => open(i, e.currentTarget.querySelector<HTMLElement>("[data-box]")!)}
              className="block shrink-0 cursor-pointer text-left"
            >
              <p className="ui-text mb-2.5 md:mb-3">{p.name}</p>
              <div
                data-box
                className="relative h-[56dvh] sm:h-[60dvh] md:h-[clamp(320px,64vh,660px)] overflow-hidden bg-background transition-[filter] duration-500"
                style={{
                  aspectRatio: `${p.w} / 660`,
                  filter: filterStyle,
                }}
              >
                <img
                  src={p.cover}
                  alt={p.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: p.coverPosition || "center" }}
                  draggable={false}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}