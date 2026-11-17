import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { back, getProject, transition } from "@/data/projects";

export const Route = createFileRoute("/project/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.project.name ?? "Project";
    const desc = `${name} — ${loaderData?.project.role.join(", ") ?? "Selected work"} by Houida Tamer.`;
    return {
      meta: [
        { title: `${name} — Houida Tamer` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} — Houida Tamer` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:image", content: loaderData?.project.cover ?? "" },
        { name: "twitter:image", content: loaderData?.project.cover ?? "" },
      ],
    };
  },
  component: ProjectPage,
});

function ProjectPage() {
  const { project: p } = Route.useLoaderData();
  const imgWrap = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const initialFromRef = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const el = imgWrap.current!;

    if (transition.rect) {
      initialFromRef.current = transition.rect;
      transition.rect = null;
    }
    const from = initialFromRef.current;

    const ctx = gsap.context(() => {
      if (from) {
        const to = el.getBoundingClientRect();
        const scaleX = from.width / to.width;
        const scaleY = from.height / to.height;

        gsap.fromTo(
          el,
          {
            x: from.left - to.left,
            y: from.top - to.top,
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
            duration: 1.2,
            ease: "expo.inOut",
            clearProps: "transform,transformOrigin",
            onComplete: () => {
              initialFromRef.current = null;
            },
          }
        );
      } else {
        gsap.from(el, { opacity: 0, duration: 0.8 });
      }

      gsap.from(title.current!.children, {
        yPercent: 110,
        duration: 1,
        ease: "expo.out",
        delay: from ? 0.55 : 0.2,
      });
      gsap.from(meta.current, {
        opacity: 0,
        duration: 0.6,
        delay: from ? 0.8 : 0.4,
      });
    });

    return () => {
      back.rect = el.getBoundingClientRect();
      back.slug = p.slug;
      ctx.revert();
    };
  }, [p.slug]);

  const navigate = useNavigate();
  const goBack = () => {
    const tl = gsap.timeline({ onComplete: () => navigate({ to: "/" }) });
    const s = { y: window.scrollY };
    if (s.y > 0) {
      tl.to(s, {
        y: 0,
        duration: Math.min(1.2, 0.4 + s.y / 3000),
        ease: "power3.inOut",
        onUpdate: () => window.scrollTo(0, s.y),
      });
    }
    tl.to(title.current!.children, { yPercent: 110, duration: 0.5, ease: "expo.in" }).to(
      meta.current,
      { opacity: 0, duration: 0.3 },
      "<"
    );
  };

  return (
    <main>
      <section className="grid-4 relative min-h-dvh md:h-screen pt-[68px] md:pt-[75px] pb-6 items-stretch">
        <div className="col-span-2 flex flex-col justify-between pt-5 md:pt-12 md:pr-8 order-2 md:order-1">
          <div>
            <h1 ref={title} className="title-xl overflow-hidden pb-[0.08em]">
              <span className="block">{p.name}</span>
            </h1>
            <button
              onClick={goBack}
              className="ui-text mt-4 md:mt-5 block cursor-pointer uppercase transition-opacity hover:opacity-60"
            >
              ← Index
            </button>
          </div>

          <div
            ref={meta}
            className="ui-text mt-8 md:mt-0 grid grid-cols-2 gap-[var(--margin)] items-end leading-snug"
          >
            <p className="space-y-1">
              <span className="block">{p.client}</span>
              {p.year && <span className="block text-muted-foreground">{p.year}</span>}
            </p>
            <p className="space-y-1">
              <span className="block">{p.role[0]}</span>
              <span className="block text-muted-foreground">{p.role[1]}</span>
            </p>
          </div>
        </div>

        <div className="col-span-2 h-[42dvh] sm:h-[48dvh] md:h-full order-1 md:order-2">
          <div ref={imgWrap} className="h-full w-full overflow-hidden will-change-transform">
            <img
              src={p.cover}
              alt={p.name}
              className="h-full w-full object-cover"
              style={{ objectPosition: p.detailCoverPosition || p.coverPosition || "center" }}
            />
          </div>
        </div>
      </section>

      <section className="grid-4 py-12 md:py-32">
        <p className="ui-text col-span-2 md:col-span-1 mb-3 md:mb-0 text-muted-foreground md:text-foreground">
          About
        </p>
        <p className="col-span-2 md:col-span-2 text-[clamp(1.15rem,4.5vw,2.2rem)] leading-[1.24] tracking-[-0.02em]">
          {p.intro}
        </p>
      </section>

      {p.vimeoGrid && p.vimeoGrid.length > 0 ? (
        <section className="grid-4 gap-y-8 md:gap-y-12 pb-14 md:pb-32">
          {p.vimeoGrid.map((item, i) => {
            const colClass =
              item.aspect === "portrait"
                ? "col-span-1"
                : item.aspect === "square"
                  ? "col-span-2 md:col-span-1"
                  : "col-span-2";

            const aspectClass =
              item.aspect === "portrait"
                ? "aspect-[9/16]"
                : item.aspect === "square"
                  ? "aspect-square"
                  : "aspect-video";

            return (
              <a
                key={`${item.url}-${i}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${colClass} group block`}
              >
                <div className={`${aspectClass} w-full overflow-hidden bg-black/5`}>
                  <img
                    src={item.src}
                    alt={item.title || `${p.name} ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="ui-text mt-2 flex items-center justify-between gap-2">
                  <span className="truncate">{item.title || `0${i + 1}`}</span>
                  <span className="shrink-0 text-muted-foreground transition-opacity group-hover:opacity-60">
                    ↗
                  </span>
                </div>
              </a>
            );
          })}
        </section>
      ) : (
        <section className="grid-4 gap-y-[var(--margin)] pb-14 md:pb-32">
          {p.images.map((src, i) => (
            <div
              key={src}
              className={
                i % 3 === 0
                  ? "col-span-2 md:col-span-4 aspect-[16/9] overflow-hidden"
                  : "col-span-2 md:col-span-2 aspect-[4/5] overflow-hidden"
              }
            >
              <img
                src={src}
                alt={`${p.name} ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </section>
      )}

      <section className="grid-4 pb-10">
        <button
          onClick={goBack}
          className="ui-text col-span-2 md:col-span-4 cursor-pointer text-left uppercase transition-opacity hover:opacity-60"
        >
          ← Back to projects
        </button>
      </section>
    </main>
  );
}