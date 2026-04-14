"use client";

import { useState, useMemo } from "react";
import { ContentPlan, ContentDay, Platform } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  List, 
  Clock, 
  MessageSquare, 
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentDetailDialog } from "./content-detail-dialog";

interface PlanDashboardProps {
  plan: ContentPlan;
  onRefresh: () => void;
  onNewPlan: () => void;
}

export function PlanDashboard({ plan, onRefresh, onNewPlan }: PlanDashboardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedDay, setSelectedDay] = useState<ContentDay | null>(null);

  const stats = useMemo(() => {
    const total = plan.days.length;
    const completed = plan.days.filter(d => d.status === 'Completed').length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, progress };
  }, [plan]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b-4 border-black pb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-brand-orange text-black border-2 border-black font-black uppercase text-xs rounded-none py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ACTIVE STRATEGY
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {plan.topics.map((topic, i) => (
              <Badge key={i} className="bg-brand-teal text-white border-2 border-black rounded-none font-black uppercase text-xs">
                {topic}
              </Badge>
            ))}
          </div>
          <h2 className="text-4xl lg:text-5xl font-headline font-black text-black leading-tight uppercase">
            {plan.topics.join(' & ')}
          </h2>
          <p className="text-lg font-bold uppercase mt-4 text-muted-foreground">
            {new Date(plan.createdAt).toLocaleDateString()} • {plan.frequency} POSTS / WEEK
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="border-2 border-black font-bold uppercase rounded-none shadow-brutalist hover-brutalist bg-white"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button 
            className="bg-brand-orange hover:bg-brand-orange/90 text-black border-2 border-black font-black uppercase rounded-none shadow-brutalist hover-brutalist"
            onClick={onNewPlan}
          >
            <Plus className="h-4 w-4 mr-2" />
            NEW PLAN
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-brand-teal p-8 border-4 border-black shadow-brutalist-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <p className="text-sm font-black text-white uppercase tracking-widest mb-1">STRATEGY PROGRESS</p>
            <h3 className="text-4xl font-headline font-black text-white leading-none">
              {stats.completed} / {stats.total} COMPLETED
            </h3>
          </div>
          <div className="bg-white border-4 border-black p-4 rotate-3 shadow-brutalist">
             <p className="text-5xl font-headline font-black text-brand-teal leading-none">{Math.round(stats.progress)}%</p>
          </div>
        </div>
        <Progress value={stats.progress} className="h-8 bg-black/20 border-2 border-black rounded-none overflow-hidden" />
      </div>

      {/* Content List/Grid */}
      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
      )}>
        {plan.days.map((day) => (
          <Card 
            key={day.id} 
            className={cn(
              "group cursor-pointer border-4 border-black rounded-none shadow-brutalist hover-brutalist transition-all duration-200",
              day.status === 'Completed' ? 'bg-secondary/20' : 'bg-white',
              viewMode === 'list' ? 'flex flex-row items-center p-2' : ''
            )}
            onClick={() => setSelectedDay(day)}
          >
            <CardContent className={cn("p-6 w-full", viewMode === 'list' ? 'flex items-center justify-between gap-4 py-4' : 'flex flex-col h-full')}>
              <div className={cn("flex flex-col", viewMode === 'list' ? 'flex-1' : '')}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-black uppercase bg-black text-white px-2 py-0.5">DAY {day.dayNumber}</span>
                  <Badge className={cn(
                    "text-[10px] font-black uppercase border-2 border-black rounded-none",
                    day.status === 'Completed' ? 'bg-brand-teal text-white' : 'bg-white text-black'
                  )}>
                    {day.status}
                  </Badge>
                </div>
                
                <h4 className="font-headline text-2xl font-black uppercase line-clamp-2 mb-4 group-hover:text-brand-teal transition-colors">
                  {day.idea.title}
                </h4>
                
                <div className="flex items-center gap-3 text-xs font-bold uppercase mb-6">
                  <div className="flex items-center gap-1.5 bg-muted px-2 py-1 border border-black">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="bg-muted px-2 py-1 border border-black">
                    {day.postingTime}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {plan.platforms.map(p => (
                  <div key={p} className="text-[10px] font-black uppercase border-2 border-black px-2 py-0.5 bg-brand-orange/10">
                    {p}
                  </div>
                ))}
              </div>
              
              {day.notes && viewMode === 'grid' && (
                <div className="mt-6 pt-4 border-t-2 border-dashed border-black flex items-center gap-2 text-xs font-bold uppercase italic text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span className="truncate">{day.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDay && (
        <ContentDetailDialog 
          day={selectedDay} 
          plan={plan}
          isOpen={!!selectedDay} 
          onClose={() => setSelectedDay(null)}
          onUpdate={() => onRefresh()}
        />
      )}
    </div>
  );
}
