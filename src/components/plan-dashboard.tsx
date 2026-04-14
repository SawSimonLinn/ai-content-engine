"use client";

import { useState, useMemo } from "react";
import { ContentPlan, ContentDay, Platform } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  List, 
  ChevronRight, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  History,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentStore } from "@/lib/content-store";
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

  const handleUpdateStatus = (dayId: string, status: any) => {
    ContentStore.updateDay(plan.id, dayId, { status });
    onRefresh();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-headline text-brand-teal flex items-center gap-2">
            {plan.topic}
            <Badge variant="outline" className="text-brand-orange border-brand-orange bg-brand-orange/5">
              30-Day Plan
            </Badge>
          </h2>
          <p className="text-muted-foreground mt-1">
            Created on {new Date(plan.createdAt).toLocaleDateString()} • {plan.frequency} posts/week
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Calendar View'}
          </Button>
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white" onClick={onNewPlan}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="bg-brand-teal/5 border-brand-teal/20">
        <CardContent className="pt-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-medium text-brand-teal uppercase tracking-wider">Overall Progress</p>
              <h3 className="text-2xl font-headline">{stats.completed} / {stats.total} Content Items Done</h3>
            </div>
            <p className="text-3xl font-headline text-brand-teal">{Math.round(stats.progress)}%</p>
          </div>
          <Progress value={stats.progress} className="h-3 bg-white/50" />
        </CardContent>
      </Card>

      {/* Content List/Grid */}
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-5" : "grid-cols-1"
      )}>
        {plan.days.map((day) => (
          <Card 
            key={day.id} 
            className={cn(
              "group cursor-pointer hover:border-brand-teal hover:shadow-md transition-all duration-300",
              day.status === 'Completed' ? 'bg-brand-teal/5 border-brand-teal/30' : ''
            )}
            onClick={() => setSelectedDay(day)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground">DAY {day.dayNumber}</span>
                <Badge variant={day.status === 'Completed' ? 'default' : 'secondary'} className={cn(
                  "text-[10px]",
                  day.status === 'Completed' ? 'bg-brand-teal' : 'bg-muted'
                )}>
                  {day.status}
                </Badge>
              </div>
              
              <h4 className="font-headline text-lg line-clamp-2 mb-2 group-hover:text-brand-teal transition-colors">
                {day.idea.title}
              </h4>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Clock className="h-3 w-3" />
                <span>{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {day.postingTime}</span>
              </div>

              <div className="flex flex-wrap gap-1 mt-auto">
                {plan.platforms.map(p => (
                  <Badge key={p} variant="outline" className="text-[9px] py-0 px-1 border-brand-teal/20 text-brand-teal">
                    {p}
                  </Badge>
                ))}
              </div>
              
              {day.notes && (
                <div className="mt-3 pt-3 border-t border-dashed flex items-center gap-1.5 text-xs text-muted-foreground italic">
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
