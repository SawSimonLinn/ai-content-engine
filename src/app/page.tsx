"use client";

import { useState, useEffect } from "react";
import { ContentPlan } from "@/lib/types";
import { ContentStore } from "@/lib/content-store";
import { PlanCreator } from "@/components/plan-creator";
import { PlanDashboard } from "@/components/plan-dashboard";
import { Toaster } from "@/components/ui/toaster";
import { 
  Sparkles, 
  Settings, 
  ChevronDown, 
  Archive, 
  LayoutDashboard,
  Zap
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
    
    // Auto-select latest non-archived plan
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-teal p-1.5 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-slate-900 tracking-tight">
            AI Content <span className="text-brand-teal">Engine</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="font-medium flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-brand-teal" />
                Plan History
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Current Plans</DropdownMenuLabel>
              {currentPlans.length > 0 ? currentPlans.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => { setActivePlanId(p.id); setShowCreator(false); }}>
                  {p.topic}
                </DropdownMenuItem>
              )) : <div className="p-2 text-xs text-muted-foreground italic">No current plans</div>}
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2">
                <Archive className="h-3 w-3" /> Archived
              </DropdownMenuLabel>
              {archivedPlans.length > 0 ? archivedPlans.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => { setActivePlanId(p.id); setShowCreator(false); }}>
                  {p.topic}
                </DropdownMenuItem>
              )) : <div className="p-2 text-xs text-muted-foreground italic">No archives</div>}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon" className="rounded-full">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-6 py-12 max-w-7xl">
        {showCreator ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <PlanCreator onPlanCreated={handlePlanCreated} />
            {plans.length > 0 && (
              <div className="mt-8 text-center">
                <Button variant="link" onClick={() => setShowCreator(false)} className="text-brand-teal">
                  Return to Active Plan
                </Button>
              </div>
            )}
          </div>
        ) : activePlan ? (
          <PlanDashboard 
            plan={activePlan} 
            onRefresh={() => setPlans(ContentStore.getPlans())}
            onNewPlan={() => setShowCreator(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-brand-teal/5 rounded-full mb-6">
              <Sparkles className="h-16 w-16 text-brand-teal animate-pulse" />
            </div>
            <h2 className="text-3xl font-headline mb-4">Ready to automate your strategy?</h2>
            <p className="text-muted-foreground text-lg max-w-md mb-8">
              Generate a high-performance 30-day content calendar for multiple platforms in seconds.
            </p>
            <Button size="lg" className="bg-brand-teal text-white h-14 px-10 text-xl font-headline" onClick={() => setShowCreator(true)}>
              Create Your First Plan
            </Button>
          </div>
        )}
      </main>

      <footer className="py-8 border-t bg-white">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AI Content Engine. Built with agent chaining technology.</p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
