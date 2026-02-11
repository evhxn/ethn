"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatedSection } from "./animated-section"

interface Experience {
  title: string
  company: string
  location: string
  period: string
  description: string[]
  tags: string[]
}

const EXPERIENCES: Experience[] = [
  {
    title: "Systems & Software Engineering Intern",
    company: "Diality Inc.",
    location: "Irvine, CA",
    period: "June 2025 -- Oct. 2025",
    description: [
      "Developed and tested embedded software in C++ for a portable hemodialysis device, integrating sensors and actuators within a real-time control loop.",
      "Executed hardware-in-the-loop (H.I.L) validation using Bitbucket, Bamboo CI/CD, and Jira, reducing firmware defect rates through automated regression testing.",
      "Collaborated with cross-functional teams (mechanical, electrical, software) under FDA-regulated quality processes, contributing to design reviews and documentation.",
    ],
    tags: ["C++", "Embedded Systems", "H.I.L Testing", "Jira", "CI/CD"],
  },
  {
    title: "Engineering Research Assistant",
    company: "Chapman University",
    location: "Orange, CA",
    period: "July 2023 -- Feb. 2025",
    description: [
      "Led and supported cross-functional engineering prototypes utilizing C++, Python, MATLAB Simulink, R, and AutoCAD to design, analyze, and optimize systems.",
      "Utilized advanced testing and data-driven feedback loops to improve performance outcomes, securing a $4,000 research grant.",
    ],
    tags: ["C++", "Python", "MATLAB", "Research", "AutoCAD"],
  },
  {
    title: "Property Manager",
    company: "Fairgrove Property Management",
    location: "Irvine, CA",
    period: "June 2020 -- Present",
    description: [
      "Managed tenant documentation and financial records, including rental applications, invoices, and payments.",
      "Modernized operations with AppFolio, boosting productivity by 20% while sustaining 98% occupancy for 5 consecutive years.",
    ],
    tags: ["Operations", "AppFolio", "Financial Management"],
  },
  {
    title: "ODV Stocker Steward Lead",
    company: "Disneyland Resort",
    location: "Anaheim, CA",
    period: "June 2023 -- Present",
    description: [
      "Maintain vending carts, ensuring proper rotation and stock levels, reducing outages during peak park times.",
      "Collaborated with cross-functional teams to uphold high-quality standards in a fast-paced environment.",
    ],
    tags: ["Leadership", "Operations", "Team Management"],
  },
]

function ExperienceCard({ experience, index }: { experience: Experience; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <AnimatedSection delay={index * 100}>
      <div
        className="group relative flex gap-6 cursor-pointer"
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
        {/* Timeline line */}
        <div className="hidden md:flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-primary shrink-0 mt-2" />
          <div className="w-px flex-1 bg-border" />
        </div>

        <div className="flex-1 pb-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {experience.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {experience.company} &middot; {experience.location}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-sm text-muted-foreground whitespace-nowrap">{experience.period}</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {experience.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Expandable content */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="space-y-2 text-sm text-muted-foreground mt-2">
              {experience.description.map((desc, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary mt-1.5 shrink-0 w-1 h-1 rounded-full bg-primary block" />
                  <span className="leading-relaxed">{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

export function ExperienceSection() {
  return (
    <section id="experience" className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <span className="text-sm font-mono text-primary tracking-widest uppercase mb-4 block">
            Experience
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 tracking-tight">
            Where I&apos;ve worked
          </h2>
        </AnimatedSection>

        <div>
          {EXPERIENCES.map((exp, i) => (
            <ExperienceCard key={exp.company + exp.title} experience={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
