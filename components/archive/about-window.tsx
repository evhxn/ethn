"use client"

import Image from "next/image"
import { ArchiveWindow } from "./archive-window"

export function AboutWindow({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <ArchiveWindow title="About Ethan" onClose={onClose} className="relative z-50 w-full max-w-md">
        <div className="flex flex-col items-center gap-4 py-2">
          <Image src="/images/e-logo.png" alt="Logo" width={64} height={64} className="opacity-90" />
          <div className="text-center">
            <h2 className="text-sm font-mono font-bold text-archive-text mb-1">{"Ethan's Project Archive v1.0"}</h2>
            <p className="text-xs font-mono text-archive-textMuted leading-relaxed max-w-sm">
              Systems &amp; Software Engineer specializing in embedded systems, robotics, and entertainment technology.
              Building at the intersection of hardware and software.
            </p>
          </div>
          <a
            href="https://blogs.chapman.edu/engineering/2023/12/02/chapman-engineering-students-present-real-world-solutions-at-the-fall-student-scholar-symposium/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-archive-highlightText underline underline-offset-2 hover:text-archive-text"
          >
            Read more about Bent Into Shape
          </a>
          <div className="w-full border-t border-archive-border pt-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <span className="text-archive-textMuted">School:</span>
              <span className="text-archive-text">Chapman University</span>
              <span className="text-archive-textMuted">Major:</span>
              <span className="text-archive-text">Computer Science</span>
              <span className="text-archive-textMuted">Location:</span>
              <span className="text-archive-text">Anaheim, CA</span>
              <span className="text-archive-textMuted">Email:</span>
              <span className="text-archive-text">etapia@chapman.edu</span>
            </div>
          </div>
        </div>
      </ArchiveWindow>
    </div>
  )
}
