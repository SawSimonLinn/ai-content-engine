"use client";

import { useState, useEffect } from "react";
import { ContentPlan } from "@/lib/types";
import { ContentStore } from "@/lib/content-store";
import { PlanCreator } from "@/components/plan-creator";
import { PlanDashboard } from "@/components/plan-dashboard";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import {
  Sparkles,
  ChevronDown,
  Archive,
  LayoutDashboard,
  Zap,
  Plus
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const loadedPlans = ContentStore.getPlans();
    setPlans(loadedPlans);
    
    const latest = loadedPlans.filter(p => !p.isArchived).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    if (latest) {
      setActivePlanId(latest.id);
    } else if (loadedPlans.length === 0) {
      setShowCreator(true);
    }
  }, []);

  const handlePlanCreated = (newPlan: ContentPlan) => {
    setPlans(prev => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
    setShowCreator(false);
  };

  const activePlan = plans.find(p => p.id === activePlanId);
  const archivedPlans = plans.filter(p => p.isArchived);
  const currentPlans = plans.filter(p => !p.isArchived);

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black px-3 sm:px-6 h-14 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-brand-teal p-1.5 md:p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Zap className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-headline font-extrabold text-black tracking-tighter">
            AI <span className="hidden sm:inline">CONTENT </span><span className="text-brand-teal">ENGINE</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/about"
            className="hidden sm:flex items-center border-2 border-black px-3 py-1.5 text-xs font-bold uppercase tracking-widest shadow-brutalist hover-brutalist bg-white transition-transform"
          >
            About
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-2 border-black font-bold uppercase tracking-tight shadow-brutalist hover-brutalist bg-white text-black">
                <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">History</span>
                <ChevronDown className="h-4 w-4 sm:ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-2 border-black rounded-none shadow-brutalist">
              <DropdownMenuLabel className="font-headline text-xs">Current Plans</DropdownMenuLabel>
              {currentPlans.length > 0 ? currentPlans.map(p => (
                <DropdownMenuItem key={p.id} className="cursor-pointer font-medium hover:bg-brand-teal hover:text-white flex flex-col items-start gap-1" onClick={() => { setActivePlanId(p.id); setShowCreator(false); }}>
                  <span className="font-black truncate w-full">{p.topics.join(' • ')}</span>
                  <span className="text-[10px] opacity-70 uppercase">{new Date(p.createdAt).toLocaleDateString()}</span>
                </DropdownMenuItem>
              )) : <div className="p-2 text-xs text-muted-foreground italic">No current plans</div>}
              
              <DropdownMenuSeparator className="bg-black h-px" />
              <DropdownMenuLabel className="font-headline text-xs flex items-center gap-2">
                <Archive className="h-3 w-3" /> Archived
              </DropdownMenuLabel>
              {archivedPlans.length > 0 ? archivedPlans.map(p => (
                <DropdownMenuItem key={p.id} className="cursor-pointer font-medium hover:bg-brand-orange hover:text-black flex flex-col items-start gap-1" onClick={() => { setActivePlanId(p.id); setShowCreator(false); }}>
                  <span className="font-black truncate w-full">{p.topics.join(' • ')}</span>
                  <span className="text-[10px] opacity-70 uppercase">{new Date(p.createdAt).toLocaleDateString()}</span>
                </DropdownMenuItem>
              )) : <div className="p-2 text-xs text-muted-foreground italic">No archives</div>}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon" className="border-2 border-black shadow-brutalist hover-brutalist rounded-none bg-white" onClick={() => setShowCreator(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-3 sm:px-6 max-w-5xl flex flex-col">
        {showCreator ? (
          <div className="flex-1 flex flex-col justify-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PlanCreator onPlanCreated={handlePlanCreated} />
            {plans.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => setShowCreator(false)} className="text-brand-teal font-bold uppercase decoration-2 underline-offset-4">
                  Return to Active Plan
                </Button>
              </div>
            )}
          </div>
        ) : activePlan ? (
          <div className="py-6 md:py-10">
            <PlanDashboard
              plan={activePlan}
              onRefresh={() => setPlans(ContentStore.getPlans())}
              onNewPlan={() => setShowCreator(true)}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-8 bg-brand-orange border-4 border-black shadow-brutalist-lg mb-8 rotate-3">
              <Sparkles className="h-20 w-20 text-black animate-pulse" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-black mb-6 tracking-tighter">PLANNING SHOULDN'T <br/>BE BORING.</h2>
            <p className="text-base md:text-xl font-medium max-w-lg mb-8 md:mb-12 bg-white border-2 border-black p-4 shadow-brutalist">
              Stop guessing. Use high-personality AI agents to build a 30-day strategy that actually resonates.
            </p>
            <Button size="lg" className="bg-brand-teal text-white border-2 border-black shadow-brutalist h-14 md:h-20 px-6 md:px-12 text-xl md:text-2xl font-headline hover-brutalist transition-transform rounded-none" onClick={() => setShowCreator(true)}>
              CREATE YOUR STRATEGY
            </Button>
          </div>
        )}
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

      <Toaster />
    </div>
  );
}