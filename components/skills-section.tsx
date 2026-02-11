"use client"

import { AnimatedSection } from "./animated-section"

interface SkillCategory {
  label: string
  skills: string[]
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    label: "Languages",
    skills: ["C++", "C", "Python", "Java", "MATLAB", "R", "SQL"],
  },
  {
    label: "Libraries",
    skills: ["OpenCV", "DLTdv", "NumPy", "pandas", "Matplotlib"],
  },
  {
    label: "Tools",
    skills: ["Bitbucket", "Bamboo", "Jira", "Docker", "VSCode", "AutoCAD", "SolidWorks", "Vectorworks"],
  },
  {
    label: "Systems",
    skills: ["Embedded Control", "Digital Logic", "Real-time Systems", "H.I.L Testing", "PID Controllers"],
  },
]

export function SkillsSection() {
  return (
    <section id="skills" className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <span className="text-sm font-mono text-primary tracking-widest uppercase mb-4 block">
            Skills
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 tracking-tight">
            Technical toolkit
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8">
          {SKILL_CATEGORIES.map((category, i) => (
            <AnimatedSection key={category.label} delay={i * 100}>
              <div>
                <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
                  {category.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 text-sm rounded-lg border border-border bg-secondary/50 text-foreground hover:border-primary/40 hover:text-primary transition-colors duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
