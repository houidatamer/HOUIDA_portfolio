import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GalleryRow } from "@/components/GalleryRow";
import { Intro } from "@/components/Intro";
import { galleryState, projects } from "@/data/projects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Houida Tamer — Creative Director" },
      { name: "description", content: "Selected work in art direction, campaigns and digital design by Houida Tamer." },
      { property: "og:title", content: "Houida Tamer — Creative Director" },
      { property: "og:description", content: "Selected work in art direction, campaigns and digital design." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [intro, setIntro] = useState(!galleryState.introPlayed);
  const done = useCallback(() => {
    galleryState.introPlayed = true;
    setIntro(false);
  }, []);

  // Warm the cache for the project pages' hero images
  useEffect(() => {
    projects.forEach((p) => {
      const im = new Image();
      im.src = p.cover;
    });
  }, []);

  return (
    <main className="flex h-screen flex-col justify-end overflow-hidden pb-5">
      {intro && <Intro onDone={done} />}
      <GalleryRow ready={!intro} />
    </main>
  );
}
