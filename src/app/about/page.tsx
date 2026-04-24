import Link from "next/link";
import { Zap, BrainCircuit, Layers, Repeat2, GitBranch, ArrowLeft } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Topic Brainstorm",
    description:
      "Drop your niche and let GPT-4o generate 20 structured content ideas plus a plan title — no blank-page paralysis.",
    color: "bg-brand-teal",
    textColor: "text-white",
  },
  {
    icon: Layers,
    title: "Platform-Specific Assets",
    description:
      "One idea, four formats. Get scripts and captions tailored for Instagram, TikTok, Facebook, and YouTube automatically.",
    color: "bg-brand-orange",
    textColor: "text-black",
  },
  {
    icon: Repeat2,
    title: "Script Refinement Chat",
    description:
      "Not happy with the output? Chat directly with the AI to rewrite, adjust tone, or punch up the hook — iteratively.",
    color: "bg-brand-pink",
    textColor: "text-white",
  },
  {
    icon: GitBranch,
    title: "30-Day Strategy Builder",
    description:
      "Set your weekly posting frequency (1, 3, 5, or 7 posts) and get a full month-long schedule built in seconds.",
    color: "bg-brand-yellow",
    textColor: "text-black",
  },
];

const stack = [
  { label: "Framework", value: "Next.js 15 + React 19" },
  { label: "Language", value: "TypeScript" },
  { label: "Styling", value: "Tailwind CSS + shadcn/ui" },
  { label: "AI Layer", value: "Genkit + OpenAI GPT-4o" },
  { label: "Persistence", value: "Browser localStorage" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black px-3 sm:px-6 h-14 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-brand-teal p-1.5 md:p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Zap className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-headline font-extrabold text-black tracking-tighter">
            AI <span className="hidden sm:inline">CONTENT </span>
            <span className="text-brand-teal">ENGINE</span>
          </h1>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 border-2 border-black px-4 py-2 font-bold uppercase tracking-tight text-sm shadow-brutalist hover-brutalist bg-white transition-transform"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to App</span>
        </Link>
      </header>

      <main className="container mx-auto px-4 md:px-6 max-w-4xl py-12 md:py-20 space-y-16 md:space-y-24">
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="inline-block bg-brand-orange border-4 border-black px-4 py-1 shadow-brutalist text-xs font-bold uppercase tracking-widest mb-2">
            About the Project
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-headline font-black tracking-tighter">
            CONTENT PLANNING,
            <br />
            <span className="text-brand-teal">ACTUALLY FAST.</span>
          </h2>
          <p className="text-base md:text-xl font-medium max-w-2xl mx-auto bg-white border-2 border-black p-4 md:p-6 shadow-brutalist">
            AI Content Engine is a solo-built tool that replaces hours of strategy
            spreadsheets with a multi-step AI workflow — from idea to ready-to-post
            script in minutes.
          </p>
        </section>

        {/* Why section */}
        <section className="border-4 border-black shadow-brutalist-lg bg-white">
          <div className="p-6 md:p-10 border-b-4 border-black">
            <h3 className="font-headline text-2xl md:text-3xl font-black mb-6">WHY I BUILT THIS</h3>
            <div className="space-y-4 text-base font-medium leading-relaxed text-black/70">
              <p>
                I built AI Content Engine end-to-end using the OpenAI API to solve a real bottleneck in my workflow.
              </p>
              <p className="bg-brand-orange border-2 border-black px-4 py-3 text-black font-bold text-base shadow-brutalist">
                As a software engineer doing side projects + full-time content creation, I was losing too many hours on content planning, scripting, and rewriting.
              </p>
              <p>So I shipped a product that does this in one flow:</p>
            </div>
          </div>

          {/* Feature list — highlighted */}
          <div className="border-b-4 border-black">
            {[
              "Brainstorms structured content ideas from multiple topics",
              "Builds a weekly plan based on posting frequency (1 / 3 / 5 / 7 posts)",
              "Generates platform-specific assets for Instagram, TikTok, Facebook, and YouTube",
              "Creates script + caption + hashtags (Instagram includes SEO-style caption flow)",
              "Supports script refinement through AI chat instructions",
              "Allows regenerate / update loops until output quality is right",
              "Tracks execution status (Not started, In progress, Completed) + notes",
              "Keeps plan history with archive support",
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 px-6 md:px-10 py-3 border-b-2 border-black last:border-b-0 ${
                  i % 2 === 0 ? "bg-white" : "bg-background"
                }`}
              >
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 bg-brand-teal border-2 border-black flex items-center justify-center text-white text-[10px] font-black">
                  {i + 1}
                </span>
                <p className="text-sm md:text-base font-medium">{item}</p>
              </div>
            ))}
          </div>

          {/* Technical choices */}
          <div className="p-6 md:p-10 border-b-4 border-black space-y-3">
            <h4 className="font-headline font-black text-sm uppercase tracking-widest text-black/50 mb-4">Technical Choices</h4>
            <p className="text-sm font-medium text-black/70">Next.js + TypeScript + Genkit + OpenAI API</p>
            <p className="text-sm font-medium text-black/70">
              Model strategy:{" "}
              <span className="font-bold text-black">GPT-4o</span> for higher-quality internal generation,{" "}
              <span className="font-bold text-black">GPT-4o-mini</span> for public usage
            </p>
            <p className="text-sm font-medium text-black/70">Backend API key integration with rate limiting for safer public sharing</p>
          </div>

          {/* Closing */}
          <div className="p-6 md:p-10 bg-black">
            <p className="text-white font-bold text-base md:text-lg leading-relaxed">
              This project is a clear example of how I solve problems:{" "}
              <span className="text-brand-orange">identify a real pain point</span>,{" "}
              <span className="text-brand-orange">design a usable UI</span>,{" "}
              <span className="text-brand-orange">ship quickly</span>, and iterate from real usage.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h3 className="font-headline text-2xl md:text-3xl font-black">WHAT IT DOES</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="border-4 border-black p-6 shadow-brutalist bg-white space-y-3 hover-brutalist transition-transform"
                >
                  <div className={`inline-flex p-2 border-2 border-black ${f.color} ${f.textColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-headline font-black text-lg">{f.title}</h4>
                  <p className="text-sm font-medium text-black/70 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="space-y-6">
          <h3 className="font-headline text-2xl md:text-3xl font-black">TECH STACK</h3>
          <div className="border-4 border-black shadow-brutalist-lg overflow-hidden">
            {stack.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center justify-between px-6 py-4 border-b-2 border-black last:border-b-0 ${
                  i % 2 === 0 ? "bg-white" : "bg-background"
                }`}
              >
                <span className="font-bold uppercase text-xs tracking-widest text-black/60">
                  {item.label}
                </span>
                <span className="font-headline font-black text-sm md:text-base">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Builder CTA */}
        <section className="border-4 border-black p-8 md:p-12 bg-brand-teal shadow-brutalist-lg text-white text-center space-y-6">
          <h3 className="font-headline text-3xl md:text-4xl font-black tracking-tighter">
            BUILT BY SAW SIMON LINN
          </h3>
          <p className="font-medium text-white/80 max-w-lg mx-auto text-base">
            Full-stack developer focused on shipping tools that solve real problems.
            This project lives at the intersection of AI and creator workflows.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {[
              { label: "Portfolio", href: "https://simonlinn.dev/" },
              { label: "GitHub", href: "https://github.com/SawSimonLinn/" },
              { label: "LinkedIn", href: "https://www.linkedin.com/in/sawsimonlinn/" },
              { label: "CodeHeaven Studio", href: "https://www.codeheavenstudio.com/" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-brand-teal transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-2 border-t-4 border-black bg-white">
        <div className="container mx-auto px-4 md:px-6 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} AI CONTENT ENGINE • BUILT DIFFERENT.</p>
          <div className="flex items-center gap-3">
            <a href="https://www.linkedin.com/in/sawsimonlinn/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">LinkedIn</a>
            <span className="text-black/30">•</span>
            <a href="https://github.com/SawSimonLinn/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">GitHub</a>
            <span className="text-black/30">•</span>
            <a href="https://simonlinn.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">simonlinn.dev</a>
            <span className="text-black/30">•</span>
            <a href="https://www.codeheavenstudio.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">CodeHeaven Studio</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
