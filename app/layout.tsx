import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import { SmoothScroll } from "@/components/smooth-scroll"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Ethan's Archive",
  description:
    "cool guy.",
}

export const viewport: Viewport = {
  themeColor: "#0a0e14",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
