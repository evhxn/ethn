"use client"

import Link from "next/link"
import { Github, Linkedin, Mail, ArrowDown } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-6 text-balance">
          Ethan Tapia
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed text-pretty">
          Systems & Software Engineer specializing in embedded systems, robotics, and entertainment technology.
          Building at the intersection of hardware and software.
        </p>

        <div className="flex items-center justify-center gap-6 mb-12">
          <Link
            href="https://github.com/evhxn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
            aria-label="GitHub profile"
            onClick={(e) => e.stopPropagation()}
          >
            <Github className="w-5 h-5" />
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
            aria-label="LinkedIn profile"
            onClick={(e) => e.stopPropagation()}
          >
            <Linkedin className="w-5 h-5" />
          </Link>
          <Link
            href="mailto:etapia@chapman.edu"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
            aria-label="Email Ethan"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-16">
          <span>657-256-2947</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>etapia@chapman.edu</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>Anaheim, CA</span>
        </div>

        <Link
          href="#about"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
          aria-label="Scroll to about section"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowDown className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}
