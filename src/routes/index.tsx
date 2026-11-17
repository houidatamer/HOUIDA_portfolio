import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CreativeField } from "@/components/CreativeField";
import { IntroSequence } from "@/components/IntroSequence";
import { Header } from "@/components/Header";
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
      {/* Séquence d'intro conditionnelle */}
      <IntroSequence onComplete={() => {}} />

      {/* Header fixe global */}
      <Header />

      {/* Hero Section avec padding-top suffisant (pt-[96px]) */}
      <section className="grid-4 relative min-h-dvh md:h-dvh overflow-hidden bg-white pt-[96px] pb-6 md:pb-8">
        <CreativeField activeCluster={activeCluster} onHoverCluster={setActiveCluster} />

        {/* Left Editorial Column */}
        <div className="relative z-10 col-span-2 flex flex-col justify-center py-6 md:py-0">
          <h1 className="font-display font-extrabold italic text-[clamp(3.2rem,7.2vw,7rem)] leading-[0.92] tracking-[-0.03em] text-foreground">
            Houida
            <br />
            Tamer
          </h1>

          <p className="mt-6 md:mt-8 max-w-md text-[clamp(1.1rem,1.5vw,1.5rem)] leading-[1.35] tracking-[-0.015em] text-foreground">
            Je construis des images,
            <br />
            du premier plan à la dernière couleur.
          </p>

          <div className="mt-8 md:mt-11 max-w-lg border-t border-foreground/15">
            {DISCIPLINES.map((item) => {
              const isActive = activeCluster === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveCluster(item.id)}
                  onMouseLeave={() => setActiveCluster(null)}
                  className="grid grid-cols-[140px_1fr] md:grid-cols-[170px_1fr] items-center border-b border-foreground/15 py-3 transition-opacity duration-200 cursor-default"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-transform duration-200 ${
                        isActive ? "scale-150 bg-foreground" : "bg-foreground/70"
                      }`}
                    />
                    <span className="text-[13px] md:text-[14px] font-medium tracking-[-0.01em] text-foreground">
                      {item.title}
                    </span>
                  </div>
                  <span
                    className={`text-[12px] md:text-[13px] transition-colors duration-200 ${
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

        {/* Full-Width Bottom Bar */}
        <div className="relative z-10 col-span-2 md:col-span-4 mt-auto flex items-center justify-between border-t border-foreground/15 pt-4">
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
        className="flex h-dvh flex-col justify-end overflow-hidden bg-white pb-6 md:pb-5"
      >
        <GalleryRow ready={true} />
        <p className="ui-text px-4 pt-3 text-muted-foreground md:hidden">Swipe →</p>
      </section>
    </main>
  );
}