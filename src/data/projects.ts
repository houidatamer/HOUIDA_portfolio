export type GalleryItem = {
  src: string;
  url: string;
  title?: string;
  role?: string;
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
      "Le rythme du morceau dicte le montage. Direction, montage et étalonnage de clips, avec une image qui suit le son et une ambiance construite par la couleur.",
    cover: "/images/Don-big.jpg",
    coverPosition: "90% center",
    detailCoverPosition: "93% center",
    vimeoGrid: [
      {
        src: "/images/Don-big.jpg",
        url: "https://www.youtube.com/watch?v=Xqd813GoFfQ&list=RDXqd813GoFfQ&start_radio=1",
        title: "L'Étranger",
        role: "Assistant monteur",
      },
      {
        src: "/images/reflet2.jpg",
        url: "https://vimeo.com/1247060331?share=copy&fl=sv&fe=ci",
        title: "Reflet",
        role: "Montage & Étalonnage",
      },
      {
        src: "/images/omw.jpg",
        url: "https://vimeo.com/YOUR_MUSIC_VIDEO_3",
        title: "Out of my way",
        role: "Assistant monteur",
      },
    ],
  },
  {
    name: "Publicités TV",
    year: "",
    role: ["Commercial", "Direction Artistique & Post-production"],
    intro:
      "Une image de cinéma pour un format publicitaire. Direction artistique et post-production de films pour la télévision et le digital : lumière travaillée, montage précis, finitions soignées.",
    cover: "/images/royalairmaroc4.jpg",
    coverPosition: "center",
    detailCoverPosition: "center",
    vimeoGrid: [
      {
        src: "/images/royalairmaroc3.jpg",
        url: "https://vimeo.com/1247030113",
        title: "Royal Air Maroc",
        role: "Assistant monteur",
        layout: "wide",
      },
      {
        src: "/images/magix2.jpg",
        url: "https://vimeo.com/1247089142?fl=tl&fe=ec",
        title: "Magix",
        role: "Montage & Post-production",
        layout: "offset",
      },
      {
        src: "/images/taghazout.jpg",
        url: "https://vimeo.com/1247089225?fl=ip&fe=ec",
        title: "Taghazout Bay",
        role: "Assistant monteur",
        layout: "tall",
      },
      {
        src: "/images/cashplus.jpg",
        url: "https://vimeo.com/1247089513?fl=tl&fe=ec",
        title: "Cashplus",
        role: "Montage",
        layout: "square",
      },
      {
        src: "/images/inwidiridik.jpg",
        url: "https://www.youtube.com/watch?v=sHM7mK0kkjU",
        title: "INWI",
        role: "Assistant monteur",
        layout: "wide",
      },
    ],
  },
  {
    name: "Courts-métrages",
    year: "",
    role: ["Cinema", "Narrative Visuel"],
    intro:
      "Chaque histoire impose son propre traitement. Animation 3D, comédie dramatique, docufiction : le rythme, la lumière et la mise en scène s'adaptent à chaque registre.",
    cover: "/images/paulamovie2.jpg",
    coverPosition: "center",
    detailCoverPosition: "center",
    vimeoGrid: [
      {
        src: "/images/paulamovie2.jpg",
        url: "https://www.youtube.com/watch?v=hhypGoGPnh0",
        title: "El Domonio del Mediodia",
        role: "VFX",
      },
      {
        src: "/images/overtime.jpg",
        url: "https://www.youtube.com/watch?v=YVkesn0vUu4&t=237s",
        title: "Overtime",
        role: "VFX",
      },
      {
        src: "/images/alligator.jpg",
        url: "https://drive.google.com/file/d/1_B-56m6UhSlZvz3sUwI30XkgRJAx0kX9/view?usp=sharing",
        title: "Mr.alligator",
        role: "VFX",
      },
    ],
  },
  {
    name: "Contenus digitaux et 3D",
    year: "",
    role: ["Campagnes", "3D & Motion Design"],
    intro:
      "Capter l'attention dès la première seconde. Campagnes de marque en 3D, motion design et effets visuels, avec des formats courts et dynamiques.",
    cover: "/images/windows.png",
    coverPosition: "center",
    detailCoverPosition: "50% center",
    vimeoGrid: [
      {
        src: "/images/windows.png",
        url: "https://www.behance.net/gallery/223811043/M_ad",
        title: "Microsoft",
        role: "3D & Motion Design",
      },
      {
        src: "/images/CA1.png",
        url: "https://www.behance.net/gallery/235031923/motion-design",
        title: "Le collectif des lunettes",
        role: "Motion Design",
      },
      {
        src: "/images/album2.jpg",
        url: "https://vimeo.com/1247031788?share=copy&fl=sv&fe=ci",
        title: "Album",
        role: "Montage & VFX",
        aspect: "portrait",
      },
      {
        src: "/images/into.jpg",
        url: "https://vimeo.com/1247032055?share=copy&fl=sv&fe=ci",
        title: "Into the life of an editor",
        role: "Réalisation & Montage",
        aspect: "portrait",
      },
      {
        src: "/images/dominto.jpg",
        url: "https://www.behance.net/gallery/223811947/Generique-court-metrage",
        title: "Dominique",
        role: "Générique & Motion Design",
      },
    ],
  },
  {
    name: "Recherche visuelles",
    year: "",
    role: ["Portfolio", "Selection de créations numérique"],
    intro:
      "L'image comme terrain d'expérimentation. Une sélection de créations numériques : mapping vidéo, installations interactives et essais visuels.",
    cover: "/images/star-wars-2.png",
    coverPosition: "center",
    detailCoverPosition: "center",
    vimeoGrid: [
      {
        src: "/images/batman.png",
        url: "https://www.behance.net/gallery/227548873/batman",
        title: "DC",
        role: "Création 3D & Compositing",
      },
      {
        src: "/images/knight.png",
        url: "https://www.behance.net/gallery/227759697/forgotten-knight",
        title: "Knight",
        role: "Environnement 3D",
      },
      {
        src: "/images/sphere.png",
        url: "https://www.behance.net/gallery/223810269/Alien-Sphere",
        title: "Sphere",
        role: "Expérimentation 3D",
      },
      {
        src: "/images/space2.png",
        url: "https://www.behance.net/gallery/227548651/stars-wars",
        title: "Space",
        role: "3D & Lighting",
      },
      {
        src: "/images/drill.png",
        url: "https://www.behance.net/gallery/234844167/album-cover",
        title: "Drill",
        role: "Cover Art & 3D",
        aspect: "square",
      },
      {
        src: "/images/ch1.png",
        url: "https://www.behance.net/gallery/227548781/space",
        title: "Ch",
        role: "Character design",
        aspect: "square",
      },
      {
        src: "/images/Ashes.png",
        url: "https://vimeo.com/1247032901?share=copy&fl=sv&fe=ci",
        title: "Ashes",
        role: "Installation numérique",
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