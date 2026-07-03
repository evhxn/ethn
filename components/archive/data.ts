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
    photos: [{ name: "projection_01.jpg" }, { name: "stage_setup.jpg" }],
  },
  {
    name: "F.I.S.H.Bot",
    type: "folder",
    look: "Look 002",
    collection: "Robotics",
    content:
      "Developed an autonomous fish-inspired swimming hydro robot in C++.\nImplemented particle image velocimetry in Python for flow dynamics analysis.\nBacked by a $4,000 University research grant.",
    photos: [{ name: "fishbot_v1.jpg" }, { name: "piv_data.jpg" }],
  },
  {
    name: "Corgicade",
    type: "folder",
    look: "Look 003",
    collection: "Hardware",
    content:
      "Designed and built a modular arcade cabinet using AutoCAD.\nIntegrated dual monitors, custom lighting, and a PC-based emulator\nfor a retro gaming experience.",
    photos: [{ name: "cabinet_render.jpg" }],
  },
  {
    name: "Bent Into Shape",
    type: "folder",
    look: "Look 004",
    collection: "Software",
    content:
      "Conducted tensile and bending tests on 3D-printed fish-scale-inspired braces.\nAchieved a 25% strength boost through pattern reformation.\nPython and R for statistical modeling.",
    photos: [{ name: "instron_test.jpg" }],
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
