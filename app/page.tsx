import { Starfield } from "@/components/starfield"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ExperienceSection } from "@/components/experience-section"
import { ProjectsSection } from "@/components/projects-section"
import { SkillsSection } from "@/components/skills-section"
import { EducationSection } from "@/components/education-section"
import { ContactSection } from "@/components/contact-section"

export default function Home() {
  return (
    <>
      <Starfield />
      <Navigation />
      <main className="relative z-10">
        <HeroSection />
        <div className="border-t border-border" />
        <AboutSection />
        <div className="border-t border-border" />
        <ExperienceSection />
        <div className="border-t border-border" />
        <ProjectsSection />
        <div className="border-t border-border" />
        <SkillsSection />
        <div className="border-t border-border" />
        <EducationSection />
        <div className="border-t border-border" />
        <ContactSection />
        <footer className="border-t border-border py-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Ethan Tapia. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Built with Next.js & Three.js
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}
