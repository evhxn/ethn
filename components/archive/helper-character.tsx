"use client"

import { useState } from "react"
import Image from "next/image"

export function HelperCharacter() {
  const [isOpen, setIsOpen] = useState(true)
  const [message, setMessage] = useState("Hey! I'm Clip-E, Ethan's archive assistant. Click an option below!")

  const quickItems = [
    {
      label: "What does Ethan do?",
      response:
        "Ethan is a Systems & Software Engineer specializing in embedded systems, robotics, and entertainment technology. He builds at the intersection of hardware and software.",
    },
    {
      label: "How can I reach Ethan?",
      response:
        "You can reach Ethan at etapia@chapman.edu or connect on LinkedIn at linkedin.com/in/ethn. He's based in Anaheim, CA.",
    },
    {
      label: "What's this archive?",
      response:
        "This is Ethan's retro project archive -- a hidden Easter egg! Double-click any folder to explore project details and assets.",
    },
    {
      label: "Where did Ethan study?",
      response:
        "Ethan studies Computer Science at Chapman University, with a minor in Entrepreneurship. Dean's List and Provost Scholarship recipient!",
    },
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-[72px] h-[72px] flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open helper"
      >
        <Image
          src="/images/clippy.png"
          alt="Clip-E assistant"
          width={72}
          height={72}
          className="object-contain drop-shadow-lg"
        />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 max-w-xs">
      {/* Speech bubble */}
      <div className="bg-[#fffde8] border-2 border-archive-border rounded-sm p-3 shadow-lg relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-1 right-2 text-xs font-mono text-archive-textMuted hover:text-archive-text"
          aria-label="Close helper"
        >
          x
        </button>
        <p className="text-xs font-mono text-archive-text leading-relaxed pr-4 mb-3">{message}</p>
        <div className="flex flex-col gap-1">
          {quickItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setMessage(item.response)}
              className="text-left text-xs font-mono text-[#0000cc] hover:underline flex items-center gap-1.5"
            >
              <span className="text-archive-text">-</span>
              {item.label}
            </button>
          ))}
        </div>
        {/* Speech bubble arrow */}
        <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-archive-border" />
        <div className="absolute -bottom-1.5 right-[33px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#fffde8]" />
      </div>

      {/* Clippy character */}
      <div className="w-[88px] h-[88px] relative">
        <Image
          src="/images/clippy.png"
          alt="Clip-E assistant"
          width={96}
          height={96}
          className="object-contain drop-shadow-lg"
        />
      </div>
    </div>
  )
}
