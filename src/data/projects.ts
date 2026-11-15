export type GalleryItem = {
  src: string;
  url: string;
  title?: string;
  layout?: "wide" | "offset" | "tall" | "square";
  aspect?: "video" | "portrait" | "square";
};

export type Project = {
  slug: string;
  name: string;
  client: string;
  year: string;
  role: string[];
  w: number;
  cover: string;
  coverPosition?: string;
  detailCoverPosition?: string;
  intro: string;
  images: string[];
  vimeoGrid?: GalleryItem[];
};

type ProjectInput = {
  name: string;
  year: string;
  role: string[];
  intro: string;
  cover?: string;
  coverPosition?: string;
  detailCoverPosition?: string;
  images?: string[];
  vimeoGrid?: GalleryItem[];
};

const featuredProjectsData: ProjectInput[] = [
  {
    name: "Clips musicaux",
    year: "",
    role: ["Direction", "Editing & Color Grading"],
    intro:
      "Une approche visuelle guidée par le rythme, l'ambiance et l'étalonnage, pour créer des univers immersifs au service des artistes d'aujourd'hui.",
    cover: "/images/Don-big.jpg",
    coverPosition: "90% center",
    detailCoverPosition: "93% center",
    vimeoGrid: [
      {
        src: "/images/Don-big.jpg",
        url: "https://www.youtube.com/watch?v=Xqd813GoFfQ&list=RDXqd813GoFfQ&start_radio=1",
        title: "L'Étranger",
      },
      {
        src: "/images/reflet2.jpg",
        url: "https://vimeo.com/1247060331?share=copy&fl=sv&fe=ci",
        title: "Reflet",
      },
      {
        src: "/images/omw.jpg",
        url: "https://vimeo.com/YOUR_MUSIC_VIDEO_3",
        title: "Out of my way",
      },
    ],
  },
  {
    name: "Publicités TV",
    year: "",
    role: ["Commercial", "Direction Artistique & Post-production"],
    intro:
      "Production publicitaire alliant lumière cinéma, rythme de montage précis et post-production soignée, pensée pour la TV et le digital.",
    cover: "/images/royalairmaroc4.jpg",
    coverPosition: "center",
    detailCoverPosition: "center",
    vimeoGrid: [
      {
        src: "/images/royalairmaroc3.jpg",
        url: "https://vimeo.com/1247030113",
        title: "Royal Air Maroc",
        layout: "wide",
      },
      {
        src: "/images/magix2.jpg",
        url: "https://vimeo.com/1247089142?fl=tl&fe=ec",
        title: "Magix",
        layout: "offset",
      },
      {
        src: "/images/taghazout.jpg",
        url: "https://vimeo.com/1247089225?fl=tl&fe=ecs",
        title: "Taghazout Bay",
        layout: "tall",
      },
      {
        src: "/images/cashplus.jpg",
        url: "https://vimeo.com/1247089513?fl=tl&fe=ec",
        title: "Cashplus",
        layout: "square",
      },
      {
        src: "/images/inwidiridik.jpg",
        url: "https://www.youtube.com/watch?v=sHM7mK0kkjU",
        title: "INWI",
        layout: "wide",
      },
    ],
  },
  {
    name: "Courts-métrages",
    year: "",
    role: ["Cinema", "Narrative Visuel"],
    intro:
      "ourts-métrages mêlant animation 3D, comédie dramatique et docu-fiction — une approche hybride où le rythme, la lumière et la mise en scène s'adaptent à chaque registre narratif.",
    cover: "/images/paulamovie2.jpg",
    coverPosition: "center",
    detailCoverPosition: "center",
    vimeoGrid: [
      {
        src: "/images/paulamovie2.jpg",
        url: "https://www.youtube.com/watch?v=hhypGoGPnh0",
        title: "El Domonio del Mediodia",
      },
      {
        src: "/images/overtime.jpg",
        url: "https://www.youtube.com/watch?v=YVkesn0vUu4&t=237s",
        title: "Overtime",
      },
      {
        src: "/images/alligator.jpg",
        url: "https://drive.google.com/file/d/1_B-56m6UhSlZvz3sUwI30XkgRJAx0kX9/view?usp=sharing",
        title: "Mr.alligator",
      },
    ],
  },
  {
    name: "Contenus digitaux et 3D",
    year: "",
    role: ["Campagnes", "3D & Motion Design"],
    intro:
      "Campagnes de marque expérimentales mêlant environnements 3D, motion design et effets visuels dynamiques, pensées pour capter immédiatement l'attention.",
    cover: "/images/windows.png",
    coverPosition: "center",
    detailCoverPosition: "50% center",
    vimeoGrid: [
      {
        src: "/images/windows.png",
        url: "https://www.behance.net/gallery/223811043/M_ad",
        title: "Microsoft",
      },
      {
        src: "/images/CA1.png",
        url: "https://www.behance.net/gallery/235031923/motion-design",
        title: "Le collectif des lunettes",
      },
      {
        src: "/images/album2.jpg",
        url: "https://vimeo.com/1247031788?share=copy&fl=sv&fe=ci",
        title: "Album",
        aspect: "portrait",
      },
      {
        src: "/images/into.jpg",
        url: "https://vimeo.com/1247032055?share=copy&fl=sv&fe=ci",
        title: "Into the life of an editor",
        aspect: "portrait",
      },
      {
        src: "/images/dominto.jpg",
        url: "https://www.behance.net/gallery/223811947/Generique-court-metrage",
        title: "Dominique",
      },
    ],
  },
  {
    name: "Recherche visuelles",
    year: "",
    role: ["Portfolio", "Selection de créations numérique"],
    intro:
      "Une sélection de créations numériques, de mapping vidéo, d'installations interactives et d'expérimentations visuelles.",
    cover: "/images/star-wars-2.png",
    coverPosition: "center",
    detailCoverPosition: "center",
    vimeoGrid: [
      {
        src: "/images/batman.png",
        url: "https://www.behance.net/gallery/227548873/batman",
        title: "DC",
      },
      {
        src: "/images/knight.png",
        url: "https://www.behance.net/gallery/227759697/forgotten-knight",
        title: "Knight",
      },
      {
        src: "/images/sphere.png",
        url: "https://www.behance.net/gallery/223810269/Alien-Sphere",
        title: "Sphere",
      },
      {
        src: "/images/space2.png",
        url: "https://www.behance.net/gallery/227548651/stars-wars",
        title: "Space",
      },
      {
        src: "/images/drill.png",
        url: "https://www.behance.net/gallery/234844167/album-cover",
        title: "Drill",
        aspect: "square",
      },
      {
        src: "/images/ch1.png",
        url: "https://www.behance.net/gallery/227548781/space",
        title: "Ch",
        aspect: "square",
      },
      {
        src: "/images/Ashes.png",
        url: "https://vimeo.com/1247032901?share=copy&fl=sv&fe=ci",
        title: "Ashes",
      },
    ],
  },
];

const extraNames = [
  "Rains",
  "Nine Furniture",
  "Louis Vuitton",
  "Mall of the Emirates",
  "Aesop",
  "Kinfolk",
  "Arket",
  "Byredo",
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const featuredList: Project[] = featuredProjectsData.map((item) => {
  const slug = slugify(item.name);
  return {
    slug,
    name: item.name,
    client: item.name,
    year: item.year,
    role: item.role,
    w: 530,
    cover: item.cover || `https://picsum.photos/seed/${slug}/1060/1320`,
    coverPosition: item.coverPosition || "center",
    detailCoverPosition: item.detailCoverPosition || item.coverPosition || "center",
    intro: item.intro,
    images:
      item.images && item.images.length > 0
        ? item.images
        : Array.from(
            { length: 5 },
            (_, k) => `https://picsum.photos/seed/${slug}-${k}/1200/1500`
          ),
    vimeoGrid: item.vimeoGrid || [],
  };
});

const extraList: Project[] = extraNames.map((name, i) => {
  const slug = slugify(name);
  return {
    slug,
    name,
    client: name,
    year: `${2022 + (i % 4)}`,
    role: ["Art Direction", "Digital Campaign"],
    w: 530,
    cover: `https://picsum.photos/seed/${slug}/1060/1320`,
    coverPosition: "center",
    detailCoverPosition: "center",
    intro:
      "A quiet, photographic campaign built around texture, light and the honest presence of the product in its landscape.",
    images: Array.from(
      { length: 5 },
      (_, k) => `https://picsum.photos/seed/${slug}-${k}/1200/1500`
    ),
    vimeoGrid: [],
  };
});

export const projects: Project[] = [...featuredList, ...extraList];
export const galleryProjects: Project[] = featuredList;

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const transition: { rect: DOMRect | null } = { rect: null };
export const back: { rect: DOMRect | null; slug: string | null } = { rect: null, slug: null };
export const galleryState = { x: 0, introPlayed: false };
export const introFrame = { height: "min(52vh, 460px)", ratio: "4 / 5" } as const;