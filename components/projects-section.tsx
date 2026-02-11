"use client"

import { useState } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"
import { AnimatedSection } from "./animated-section"

interface Project {
  title: string
  tagline: string
  tags: string[]
  details: string[]
}

const PROJECTS: Project[] = [
  {
    title: "Heritage Fest",
    tagline: "Large-scale projection mapping & embedded controllers for immersive cultural shows.",
    tags: ["C++", "Python", "Projection Mapping", "After Effects", "AutoCAD"],
    details: [
      "Led technical and creative design for large-scale projection-mapped shows, including programming, color calibration, lens selection and geometric corrections to ensure seamless imagery.",
      "Employed AutoCAD for projector placement and facility-scale design, factoring in throw distances, surface geometry, and ambient-lighting constraints.",
      "Increased attendee engagement by 75% through iterative testing and feedback, optimizing brightness, contrast, and color space for maximum visual impact.",
    ],
  },
  {
    title: "F.I.S.H.Bot",
    tagline: "Autonomous swimming robot with biomimetic control systems.",
    tags: ["C++", "Python", "MATLAB Simulink", "R", "AutoCAD"],
    details: [
      "Developed an autonomous, fish-inspired swimming hydro robot in C++, integrating sensors and actuators to mimic fish locomotion. Leveraged Simulink to refine motion control loops for stability testing.",
      "Implemented particle image velocimetry (PIV) in Python to analyze flow dynamics, acceleration, and hydrodynamic efficiency across various scale patterns.",
      "Collaborated on electronics, sensor calibration, and mechanical design, backed by a $4,000 University research grant.",
    ],
  },
  {
    title: "Corgicade",
    tagline: "Modular arcade cabinet design with custom lighting and emulation.",
    tags: ["AutoCAD", "CNC", "Hardware Design"],
    details: [
      "Designed and built a modular arcade cabinet using AutoCAD, integrating dual monitors, custom lighting, and a PC-based emulator for a retro gaming experience.",
      "Managed material selection, CNC cutting, and assembly to translate 3D concepts into a fully functional prototype.",
      "Showcased the completed build at a campus game jam, receiving positive feedback for ergonomic design and friendly layout.",
    ],
  },
  {
    title: "Bent Into Shape",
    tagline: "3D-printed fish-scale-inspired braces with data-driven design optimization.",
    tags: ["Python", "MATLAB", "R", "AutoCAD", "Instron Testing"],
    details: [
      "Conducted tensile and bending tests on 3D-printed fish-scale-inspired braces using an Instron system, analyzing load vs. deformation relationships and achieving a 25% strength boost through pattern reformation.",
      "Utilized Python and R to parse large data sets, generate statistical models, and develop visual dashboards guiding iterative prototype refinement.",
    ],
  },
]

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <AnimatedSection delay={index * 100}>
      <div
        className="group rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsExpanded(!isExpanded)
          }
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 mt-1 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {project.tagline}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Expandable details */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-border pt-4">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {project.details.map((detail, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary mt-1.5 shrink-0 w-1 h-1 rounded-full bg-primary block" />
                  <span className="leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

export function ProjectsSection() {
  return (
    <section id="projects" className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <span className="text-sm font-mono text-primary tracking-widest uppercase mb-4 block">
            Projects
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 tracking-tight">
            What I&apos;ve built
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
