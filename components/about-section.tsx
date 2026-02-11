import { AnimatedSection } from "./animated-section"

export function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <span className="text-sm font-mono text-primary tracking-widest uppercase mb-4 block">
            About
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight">
            Building the future, one system at a time.
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-12">
          <AnimatedSection delay={100}>
            <p className="text-muted-foreground leading-relaxed">
              I&apos;m a Computer Science student at Chapman University with a focus on Design and Fabrication,
              graduating May 2026. My expertise spans software development, hardware systems, and creative
              technical solutions -- from projection mapping and robotics to embedded control systems.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <p className="text-muted-foreground leading-relaxed">
              With experience at Diality Inc. and Chapman&apos;s research labs, I combine rigorous engineering
              with creative problem-solving. I&apos;ve led projects ranging from large-scale projection-mapped
              shows to autonomous swimming robots, always pushing the boundary between hardware and software.
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
