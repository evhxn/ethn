export interface FolderPhoto {
  name: string
  /** Real image path under /public — Phase 2 fills these in */
  src?: string
  alt?: string
}

export interface FolderItem {
  name: string
  type: "folder" | "photo" | "coming-soon" | "link"
  content?: string
  photos?: FolderPhoto[]
  href?: string
  /** Fashion-archive metadata — Phase 2 index filters read these */
  look?: string
  collection?: string
  season?: string
}

export const PROJECT_FOLDERS: FolderItem[] = [
  {
    name: "Heritage Fest",
    type: "folder",
    look: "Look 001",
    collection: "Live Systems",
    season: "2025",
    content:
      "Led technical and creative design for large-scale projection-mapped shows.\nEmployed AutoCAD for projector placement and facility-scale design.\nIncreased attendee engagement by 75% through iterative testing and feedback.",
  },
  {
    name: "F.I.S.H.Bot",
    type: "folder",
    look: "Look 002",
    collection: "Robotics",
    content:
      "Developed an autonomous fish-inspired swimming hydro robot in C++.\nImplemented particle image velocimetry in Python for flow dynamics analysis.\nBacked by a $4,000 University research grant.",
    photos: [{ name: "Model Concept", src: "/images/projects/FISHBot.jpeg", alt: "FISHBot CAD model concept" }],
  },
  {
    name: "Corgicade",
    type: "folder",
    look: "Look 003",
    collection: "Hardware",
    content:
      "Designed and built a modular arcade cabinet using AutoCAD.\nIntegrated dual monitors, custom lighting, and a PC-based emulator\nfor a retro gaming experience.",
  },
  {
    name: "Snake Game",
    type: "folder",
    look: "Look 004",
    collection: "Hardware",
    content:
      "Designed and built a yin-yang-inspired Snake Game enclosure for a 3D printing class.\nCombined 3D modeling, soldering, and embedded electronics into a functional tabletop game.",
    photos: [
      { name: "Finalized Enclosure", src: "/images/projects/SnakeGame1.jpeg", alt: "Finalized Snake Game enclosure" },
      { name: "Finalized Enclosure (Back + Branding)", src: "/images/projects/SnakeGame2.jpeg", alt: "Back of the Snake Game enclosure" },
      { name: "Finalized Enclosure (Inside)", src: "/images/projects/SnakeGame3.jpeg", alt: "Inside of the Snake Game enclosure" },
    ],
  },
  {
    name: "Research",
    type: "folder",
    look: "Look 005",
    collection: "Software",
    content:
      "Conducted tensile and bending tests on 3D-printed fish-scale-inspired braces.\nAchieved a 25% strength boost through pattern reformation.\nPython and R for statistical modeling.",
    photos: [{ name: "Bent Into Shape", src: "/images/projects/Bent.jpg", alt: "Bent Into Shape research symposium poster" }],
    href: "https://blogs.chapman.edu/engineering/2023/12/02/chapman-engineering-students-present-real-world-solutions-at-the-fall-student-scholar-symposium/",
  },
  {
    name: "R2-D2 Replica",
    type: "folder",
    look: "Look 005",
    collection: "Fabrication",
    season: "2025",
    content: "Designed and fabricated a full-scale R2-D2 replica with 3D-printed components and custom electronics.",
    photos: [
      { name: "Debugging", src: "/images/projects/R23.jpeg", alt: "R2-D2 replica electronics debugging" },
      { name: "Part Organization", src: "/images/projects/R21.jpeg", alt: "Organized R2-D2 replica parts" },
      { name: "Finished Build", src: "/images/projects/R22.jpeg", alt: "Finished R2-D2 replica" },
    ],
  },
  {
    name: "Aphex Clock",
    type: "folder",
    look: "Look 006",
    collection: "Fabrication",
    season: "2025",
    content: "Designed and built an Aphex Twin-inspired 3D-printed clock with a glow-in-the-dark face.",
    photos: [
      { name: "Finalized Clock", src: "/images/projects/Aphex1.jpeg", alt: "Finalized Aphex-inspired clock" },
      { name: "Back Clock", src: "/images/projects/Aphex2.jpeg", alt: "Back of the Aphex-inspired clock" },
      { name: "Clock in the Dark", src: "/images/projects/Aphex3.jpeg", alt: "Aphex-inspired clock glowing in the dark" },
    ],
  },
  {
    name: "LinkedIn",
    type: "link",
    href: "https://www.linkedin.com/in/ethn/",
  },
  { name: "Photos", type: "coming-soon" },
  { name: "Assets", type: "coming-soon" },
  { name: "Schematics", type: "coming-soon" },
]
