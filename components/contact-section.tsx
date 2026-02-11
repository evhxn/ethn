"use client"

import Link from "next/link"
import { Github, Linkedin, Mail } from "lucide-react"
import { AnimatedSection } from "./animated-section"

export function ContactSection() {
  return (
    <section id="contact" className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <AnimatedSection>
          <span className="text-sm font-mono text-primary tracking-widest uppercase mb-4 block">
            Contact
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Let&apos;s work together
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-12 leading-relaxed">
            Feel free to reach out for collaborations, opportunities, or just to say hello. 
            I&apos;m always open to discussing new projects and ideas.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="flex items-center justify-center gap-8">
            <Link
              href="mailto:etapia@chapman.edu"
              className="group flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-xl border border-border bg-secondary/50 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-200">
                <Mail className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Email
              </span>
            </Link>

            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-xl border border-border bg-secondary/50 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-200">
                <Linkedin className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                LinkedIn
              </span>
            </Link>

            <Link
              href="https://github.com/evhxn"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-xl border border-border bg-secondary/50 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-200">
                <Github className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                GitHub
              </span>
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <p className="text-sm text-muted-foreground mt-12">
            etapia@chapman.edu &middot; 657-256-2947
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
