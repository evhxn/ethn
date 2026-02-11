import { AnimatedSection } from "./animated-section"

export function EducationSection() {
  return (
    <section id="education" className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <span className="text-sm font-mono text-primary tracking-widest uppercase mb-4 block">
            Education
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 tracking-tight">
            Academic background
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">
                  Chapman University
                </h3>
                <p className="text-muted-foreground">Orange, CA</p>
              </div>
              <span className="text-sm text-primary font-mono mt-2 md:mt-0">
                Expected May 2026
              </span>
            </div>

            <div className="mb-6">
              <p className="text-foreground font-medium">
                Bachelor of Science in Computer Science
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Themed Inquiry in Design and Fabrication
              </p>
            </div>

            <div>
              <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Related Coursework
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Manufacturing Design",
                  "3D Printing & Design",
                  "Theater Technology",
                  "Systems Programming",
                  "Object Oriented Programming",
                  "Data Networks",
                  "Data Structures & Algorithms",
                  "Algorithm Analysis",
                  "Operating Systems",
                  "Language Models",
                  "Database Management",
                ].map((course) => (
                  <span
                    key={course}
                    className="text-xs px-2.5 py-1 rounded-md bg-secondary/50 text-muted-foreground border border-border"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
