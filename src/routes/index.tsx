import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CreativeField } from "@/components/CreativeField";
import { IntroSequence } from "@/components/IntroSequence";
import { GalleryRow } from "@/components/GalleryRow";
import { projects } from "@/data/projects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Houida Tamer — Artiste 3D, Monteur, Étalonneur & Motion Designer" },
      {
        name: "description",
        content:
          "Je construis des images, du premier plan à la dernière couleur. Art 3D, montage, étalonnage et motion design.",
      },
    ],
  }),
  component: Index,
});

const DISCIPLINES = [
  { id: 0, title: "Étalonnage", desc: "Look, ambiance, finition" },
  { id: 1, title: "Montage", desc: "Rythme, narration, cohérence" },
  { id: 2, title: "Motion design", desc: "Animation, identité en mouvement" },
  { id: 3, title: "Art 3D", desc: "Modélisation, texturing, rendu" },
];

function Index() {
  const workRef = useRef<HTMLElement>(null);
  const [activeCluster, setActiveCluster] = useState<number | null>(null);

  useEffect(() => {
    projects.forEach((p) => {
      const im = new Image();
      im.src = p.cover;
    });
  }, []);

  const scrollToWork = () => {
    workRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="w-full bg-white text-foreground relative">
      {/* Intro sequence */}
      <IntroSequence onComplete={() => {}} />

      {/* Hero Section */}
      <section className="grid-4 relative max-md:!h-auto max-md:!max-h-none max-md:!overflow-visible overflow-x-hidden bg-white pt-[115px] md:pt-[120px] pb-4 md:pb-2 flex flex-col justify-start md:grid md:grid-cols-4 md:items-end">
        {/* Left Editorial Column */}
        <div className="relative z-20 col-span-2 flex flex-col justify-start md:justify-end py-2 md:py-0 px-4 md:pl-12 md:pb-[28px] bg-white md:bg-transparent order-1">
          <div className="w-full max-w-[500px]">
            <h1 className="font-display font-extrabold italic text-[clamp(3rem,7.2vw,7.8rem)] leading-[0.9] tracking-[-0.03em] text-foreground">
              Visual
              <br />
              Storyteller
            </h1>

            <p className="mt-4 md:mt-7 text-[clamp(1.05rem,1.65vw,1.7rem)] leading-[1.35] tracking-[-0.015em] text-foreground">
              Je construis des images,
              <br />
              du premier plan à la dernière couleur.
            </p>

            {/* 4 Disciplines Table */}
            <div className="mt-5 md:mt-7 w-full border-t border-foreground/15">
              {DISCIPLINES.map((item) => {
                const isActive = activeCluster === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setActiveCluster(item.id)}
                    onMouseLeave={() => setActiveCluster(null)}
                    className="grid grid-cols-[130px_1fr] md:grid-cols-[180px_1fr] items-center border-b border-foreground/15 py-2.5 md:py-3 transition-opacity duration-200 cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full transition-transform duration-200 ${
                          isActive ? "scale-150 bg-foreground" : "bg-foreground/70"
                        }`}
                      />
                      <span className="text-[14px] md:text-[16px] font-medium tracking-[-0.01em] text-foreground">
                        {item.title}
                      </span>
                    </div>
                    <span
                      className={`text-[12px] md:text-[14px] transition-colors duration-200 ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Creative Field Canvas */}
        <CreativeField activeCluster={activeCluster} onHoverCluster={setActiveCluster} />

        {/* Full-Width Bottom Bar */}
        <div className="relative z-25 col-span-2 md:col-span-4 mt-2 md:mt-4 flex items-center justify-between border-t border-foreground/15 pt-3 pb-2 px-4 md:px-8 bg-white order-3">
          <button
            onClick={scrollToWork}
            className="ui-text cursor-pointer uppercase transition-opacity hover:opacity-60"
          >
            Voir les projets ↓
          </button>
          <span className="ui-text text-muted-foreground">Scroll</span>
        </div>
      </section>

      {/* Gallery Section */}
      <section
        ref={workRef}
        className="flex max-md:!h-auto md:h-dvh flex-col justify-start md:justify-center overflow-hidden bg-white pb-8 md:pb-5 pt-6 md:pt-0"
      >
        <GalleryRow ready={true} />
        <p className="ui-text px-4 pt-3 text-muted-foreground md:hidden">Swipe →</p>
      </section>
    </main>
  );
}