import { Github, Mail, Linkedin, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="font-bold text-xl">
            <Link href="/">Ethan Tapia</Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="#skills" className="text-sm font-medium hover:underline underline-offset-4">
              Skills
            </Link>
            <Link href="#projects" className="text-sm font-medium hover:underline underline-offset-4">
              Projects
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-24 md:py-32 lg:py-40 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Hi, I'm <span className="text-primary">Ethan Tapia</span>
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Computer Science student specializing in engineering design, embedded systems, and creative technical
                  solutions.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="px-2 py-1">
                    <Mail className="h-3 w-3 mr-1" /> etapia@chapman.edu
                  </Badge>
                  <Badge variant="secondary" className="px-2 py-1">
                    <Phone className="h-3 w-3 mr-1" /> 657-256-2947
                  </Badge>
                  <Badge variant="secondary" className="px-2 py-1">
                    <MapPin className="h-3 w-3 mr-1" /> Anaheim, CA
                  </Badge>
                </div>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="#contact">Get in Touch</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="#projects">View Projects</Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] rounded-full overflow-hidden border-4 border-primary/20">
                  <Image
                    src="/placeholder.svg?height=320&width=320"
                    alt="Profile"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About Me</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Computer Science student with a passion for engineering and creative technical solutions
                </p>
              </div>
              <div className="mx-auto max-w-3xl space-y-4 text-left">
                <p>
                  I'm a Computer Science student at Chapman University with a focus on Design and Fabrication. My
                  expertise spans software development, hardware systems, and creative technical solutions.
                </p>
                <p>
                  With experience in projection mapping, robotics, and embedded systems, I combine technical knowledge
                  with creative problem-solving to build innovative solutions. I've led projects ranging from
                  large-scale projection-mapped shows to autonomous swimming robots.
                </p>
                <p>
                  Currently working at The Walt Disney Company while pursuing my degree, I'm passionate about bringing
                  technical creativity to life through engineering and design.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="education" className="py-16 md:py-24 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Education</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  My academic background and coursework
                </p>
              </div>
              <div className="mx-auto max-w-3xl space-y-6 text-left pt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">Chapman University</h3>
                        <p className="text-muted-foreground">Orange, CA</p>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <p className="font-medium">Expected May 2026</p>
                      </div>
                    </div>
                    <p className="font-medium">Bachelor of Science in Computer Science</p>
                    <p className="text-muted-foreground">Themed Inquiry in Design and Fabrication</p>
                    <div className="mt-4">
                      <p className="font-medium">Related Coursework:</p>
                      <p className="text-sm text-muted-foreground">
                        Manufacturing Design, 3D Printing and Design, Theater Technology, Systems Programming, Object
                        Oriented Programming, Data Networks and Communications, Data Structures and Algorithms,
                        Algorithm Analysis, Operating Systems, Language Models, Database Management
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Technical Skills</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Technologies and tools I work with
                </p>
              </div>
              <div className="mx-auto max-w-4xl w-full pt-8">
                <div className="grid gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {["C/C++", "Java", "Python", "MATLAB", "R", "SQL"].map((skill) => (
                          <Badge key={skill} className="px-2 py-1" variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Hardware/AV Systems</h3>
                      <div className="flex flex-wrap gap-2">
                        {["AutoCAD", "Raspberry Pi", "Arduino", "Projection Mapping", "xLights", "FalconPiPlayer"].map(
                          (skill) => (
                            <Badge key={skill} className="px-2 py-1" variant="secondary">
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Libraries</h3>
                      <div className="flex flex-wrap gap-2">
                        {["pandas", "NumPy", "Matplotlib", "DLTdv", "OpenCV"].map((skill) => (
                          <Badge key={skill} className="px-2 py-1" variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Developer Tools</h3>
                      <div className="flex flex-wrap gap-2">
                        {["MATLAB Simulink", "Fusion360", "Gazebo", "Qt Creator", "xLights", "VSCode", "Docker"].map(
                          (skill) => (
                            <Badge key={skill} className="px-2 py-1" variant="secondary">
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Embedded Controls</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Arduino", "Raspberry Pi", "PID Controllers", "LabVIEW"].map((skill) => (
                          <Badge key={skill} className="px-2 py-1" variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="py-16 md:py-24 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Projects</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">Showcasing my technical work</p>
              </div>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 pt-8">
                <Card className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=200&width=300"
                      alt="Heritage Fest"
                      width={300}
                      height={200}
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">Heritage Fest</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["C++", "Python", "Projection Mapping", "After Effects", "AutoCAD"].map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                      <li>
                        Led technical and creative design for large-scale projection-mapped shows, including
                        programming, color calibration, lens selection and geometric corrections to ensure seamless
                        imagery.
                      </li>
                      <li>
                        Employed AutoCAD for projector placement and facility-scale design, factoring in throw
                        distances, surface geometry, and ambient-lighting constraints.
                      </li>
                      <li>
                        Increased attendee engagement by 75% through iterative testing and feedback, optimizing
                        brightness, contrast, and color space for maximum visual impact.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=200&width=300"
                      alt="F.I.S.H Bot"
                      width={300}
                      height={200}
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">F.I.S.H Bot</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["C++", "Python", "MATLAB Simulink", "R", "AutoCAD"].map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                      <li>
                        Developed an autonomous, fish-inspired swimming hydro robot in C++, integrating sensors and
                        actuators to mimic fish locomotion. Leveraged Simulink to refine motion control loops for
                        stability testing.
                      </li>
                      <li>
                        Implemented particle image velocimetry (PIV) in Python to analyze flow dynamics, acceleration,
                        and hydrodynamic efficiency across various scale patterns.
                      </li>
                      <li>
                        Collaborated on electronics, sensor calibration, and mechanical design, backed by a $4,000
                        University research grant.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=200&width=300"
                      alt="Corgicade"
                      width={300}
                      height={200}
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">Corgicade</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["AutoCAD"].map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                      <li>
                        Designed and built a modular arcade cabinet using AutoCAD, integrating dual monitors, custom
                        lighting, and a PC-based emulator for a retro gaming experience.
                      </li>
                      <li>
                        Managed material selection, CNC cutting, and assembly to translate 3D concepts into a fully
                        functional prototype.
                      </li>
                      <li>
                        Showcased the completed build at a campus game jam, receiving positive feedback for ergonomic
                        design and friendly layout.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=200&width=300"
                      alt="Bent Into Shape"
                      width={300}
                      height={200}
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">Bent Into Shape</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["Python", "MATLAB", "R", "AutoCAD"].map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                      <li>
                        Conducted tensile and bending tests on 3D-printed fish-scale-inspired braces using an Instron
                        system, analyzing load vs. deformation relationships and achieving a 25% strength boost through
                        pattern reformation.
                      </li>
                      <li>
                        Utilized Python and R to parse large data sets, generate statistical models, and develop visual
                        dashboards guiding iterative prototype refinement.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Professional Experience</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  My work history and professional roles
                </p>
              </div>
              <div className="mx-auto max-w-4xl w-full space-y-8 pt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold">Outdoor Ventures</h3>
                        <p className="text-muted-foreground">The Walt Disney Company, Anaheim, CA</p>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <p>Sep 2024 - Present</p>
                      </div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 mt-4">
                      <li>
                        Maintain vending carts, ensuring proper rotation and stock levels, reducing outages during peak
                        park times.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold">Engineering Research Assistant</h3>
                        <p className="text-muted-foreground">Chapman University, Orange, CA</p>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <p>July 2023 - Feb 2025</p>
                      </div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 mt-4">
                      <li>
                        Led and supported cross-functional engineering prototypes utilizing C++, Python, MATLAB
                        Simulink, R, and AutoCAD to design, analyze, and optimize systems.
                      </li>
                      <li>
                        Utilized advanced testing and data-driven feedback loops to improve performance outcomes,
                        securing a $4,000 research grant.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold">Property Manager</h3>
                        <p className="text-muted-foreground">Fairgrove Property Management, Irvine, CA</p>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <p>June 2020 - Jan 2025</p>
                      </div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 mt-4">
                      <li>
                        Managed tenant documentation and financial records, including rental applications, invoices, and
                        payments.
                      </li>
                      <li>
                        Modernized operations with AppFolio, boosting productivity by 20% while sustaining 98% occupancy
                        for 5 consecutive years.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold">Supervisor</h3>
                        <p className="text-muted-foreground">7 Leaves Cafe, Anaheim, CA</p>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <p>June 2021 - June 2024</p>
                      </div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 mt-4">
                      <li>
                        Collaborated with cross-functional teams to uphold high-quality standards in a fast-paced
                        environment.
                      </li>
                      <li>
                        Streamlined training procedures to support daily operations, reducing onboarding time by 15% and
                        lowering labor costs.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 md:py-24 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Get in Touch</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Feel free to reach out for collaborations or opportunities
                </p>
              </div>
              <div className="mx-auto grid max-w-3xl gap-8 pt-8 md:grid-cols-3">
                <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                  <Mail className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Email</h3>
                  <p className="text-muted-foreground">Let's connect via email</p>
                  <Button asChild>
                    <Link href="mailto:etapia@chapman.edu">etapia@chapman.edu</Link>
                  </Button>
                </div>
                <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                  <Linkedin className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">LinkedIn</h3>
                  <p className="text-muted-foreground">Connect professionally</p>
                  <Button asChild>
                    <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                      View Profile
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                  <Github className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">GitHub</h3>
                  <p className="text-muted-foreground">Check out my code</p>
                  <Button asChild>
                    <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                      View Projects
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Ethan Tapia. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="mailto:etapia@chapman.edu">
                <Mail className="h-4 w-4" />
                <span className="sr-only">Email</span>
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
