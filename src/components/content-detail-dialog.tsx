"use client";

import { useState } from "react";
import { ContentDay, ContentPlan, GeneratedAsset, Platform } from "@/lib/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  Save, 
  PlayCircle, 
  FileText, 
  Hash,
  MessageSquare,
  Circle,
  History
} from "lucide-react";
import { generatePlatformSpecificContent } from "@/ai/flows/generate-platform-specific-content";
import { ContentStore } from "@/lib/content-store";
import { toast } from "@/hooks/use-toast";

interface ContentDetailDialogProps {
  day: ContentDay;
  plan: ContentPlan;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ContentDetailDialog({ day, plan, isOpen, onClose, onUpdate }: ContentDetailDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform>(plan.platforms[0]);
  const [notes, setNotes] = useState(day.notes);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const results: GeneratedAsset[] = [];
      for (const platform of plan.platforms) {
        const result = await generatePlatformSpecificContent({
          contentIdea: JSON.stringify(day.idea),
          platform: platform
        });
        results.push(result);
      }
      ContentStore.updateDay(plan.id, day.id, { 
        assets: results,
        status: 'In progress' 
      });
      onUpdate();
      toast({ title: "Content Generated!", description: "AI has built the assets." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Generation failed" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNotes = () => {
    ContentStore.updateDay(plan.id, day.id, { notes });
    onUpdate();
    toast({ title: "Notes Saved" });
  };

  const handleToggleComplete = () => {
    const newStatus = day.status === 'Completed' ? 'In progress' : 'Completed';
    ContentStore.updateDay(plan.id, day.id, { status: newStatus });
    onUpdate();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentAsset = day.assets?.find(a => a.platform === activePlatform);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden border-4 border-black rounded-none shadow-brutalist-lg">
        <DialogHeader className="p-8 border-b-4 border-black bg-brand-teal text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 inline-block mb-2">Day {day.dayNumber} • {new Date(day.date).toLocaleDateString()}</span>
              <DialogTitle className="text-4xl font-headline font-black uppercase leading-none">{day.idea.title}</DialogTitle>
              <DialogDescription className="text-white font-bold uppercase mt-2 opacity-90">
                {day.idea.angle}
              </DialogDescription>
            </div>
            <Button 
              variant="outline"
              className={day.status === 'Completed' ? 'bg-secondary text-black border-2 border-black' : 'bg-white text-black border-2 border-black'}
              onClick={handleToggleComplete}
            >
              {day.status === 'Completed' ? <Check className="mr-2 h-4 w-4" /> : <Circle className="mr-2 h-4 w-4" />}
              {day.status === 'Completed' ? 'COMPLETED' : 'MARK AS DONE'}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-background">
          {/* Main Content Area */}
          <div className="lg:col-span-8 p-8 flex flex-col gap-8 overflow-hidden border-r-4 border-black">
            {!day.assets ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6 border-4 border-dashed border-black bg-white shadow-brutalist">
                <div className="p-6 bg-brand-orange border-2 border-black shadow-brutalist">
                  <Sparkles className="h-14 w-14 text-black" />
                </div>
                <h3 className="text-3xl font-headline font-black uppercase">Build Your Assets</h3>
                <p className="text-lg font-bold max-w-sm mx-auto">
                  Our Content Agents are ready to draft your scripts, captions, and tags.
                </p>
                <Button 
                  size="lg" 
                  className="bg-brand-teal text-white border-2 border-black h-16 px-10 text-xl font-headline font-black shadow-brutalist hover-brutalist rounded-none" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Sparkles className="mr-3 h-6 w-6" />}
                  {isGenerating ? "CRAFTING..." : "GENERATE NOW"}
                </Button>
              </div>
            ) : (
              <>
                <Tabs value={activePlatform} onValueChange={(v) => setActivePlatform(v as Platform)} className="w-full flex flex-col flex-1">
                  <TabsList className="w-full h-14 bg-black p-1 rounded-none grid" style={{ gridTemplateColumns: `repeat(${plan.platforms.length}, 1fr)` }}>
                    {plan.platforms.map(p => (
                      <TabsTrigger key={p} value={p} className="rounded-none font-black uppercase text-xs data-[state=active]:bg-brand-teal data-[state=active]:text-white">
                        {p}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <ScrollArea className="flex-1 mt-8 pr-4">
                    {currentAsset ? (
                      <div className="space-y-8 pb-10">
                        {currentAsset.title && (
                          <div className="space-y-3">
                            <Label className="flex items-center gap-2 font-black uppercase text-sm"><PlayCircle className="h-5 w-5 text-brand-orange" /> Video Title</Label>
                            <div className="p-4 bg-white border-2 border-black shadow-brutalist font-headline text-xl font-black uppercase">
                              {currentAsset.title}
                            </div>
                          </div>
                        )}

                        {currentAsset.script && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="flex items-center gap-2 font-black uppercase text-sm"><FileText className="h-5 w-5 text-brand-teal" /> Script / Copy</Label>
                              <Button variant="outline" size="sm" className="border-2 border-black rounded-none shadow-brutalist hover-brutalist bg-white" onClick={() => copyToClipboard(currentAsset.script!, 'script')}>
                                {copied === 'script' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            <div className="p-6 bg-white border-2 border-black shadow-brutalist text-sm leading-relaxed whitespace-pre-wrap font-medium">
                              {currentAsset.script}
                            </div>
                          </div>
                        )}

                        {currentAsset.caption && (
                          <div className="space-y-3">
                            <Label className="flex items-center gap-2 font-black uppercase text-sm"><MessageSquare className="h-5 w-5 text-brand-teal" /> Caption</Label>
                            <div className="p-4 bg-secondary/10 border-2 border-black italic font-medium">
                              {currentAsset.caption}
                            </div>
                          </div>
                        )}

                        {currentAsset.hashtags && (
                          <div className="space-y-3">
                            <Label className="flex items-center gap-2 font-black uppercase text-sm"><Hash className="h-5 w-5 text-brand-orange" /> Tags</Label>
                            <div className="flex flex-wrap gap-2 p-4 bg-white border-2 border-black">
                              {currentAsset.hashtags.map(tag => (
                                <Badge key={tag} className="bg-brand-orange text-black border-2 border-black font-black uppercase text-[10px] rounded-none px-3">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16 font-black uppercase">
                        No assets for this platform.
                      </div>
                    )}
                  </ScrollArea>
                </Tabs>
                <div className="pt-6 border-t-4 border-black flex justify-between items-center">
                   <p className="text-xs font-black uppercase">Crafted by AI Content Agent</p>
                   <Button variant="outline" size="sm" className="border-2 border-black font-black uppercase shadow-brutalist hover-brutalist bg-white" onClick={handleGenerate} disabled={isGenerating}>
                     <Sparkles className="mr-2 h-4 w-4" />
                     Regenerate
                   </Button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 bg-white p-8 flex flex-col gap-10">
             <div className="space-y-6">
               <Label className="text-lg font-black uppercase flex items-center gap-2">
                 <History className="h-5 w-5 text-brand-orange" /> Tracking
               </Label>
               <div className="space-y-4">
                 <div className="flex justify-between items-center font-bold uppercase text-xs">
                   <span className="text-muted-foreground">Status</span>
                   <Badge className="border-2 border-black bg-brand-teal text-white rounded-none">
                     {day.status}
                   </Badge>
                 </div>
                 <div className="flex justify-between items-center font-bold uppercase text-xs">
                   <span className="text-muted-foreground">Format</span>
                   <Badge className="border-2 border-black bg-secondary text-black rounded-none">
                     {day.idea.type}
                   </Badge>
                 </div>
                 <div className="flex justify-between items-center font-bold uppercase text-xs">
                   <span className="text-muted-foreground">Time</span>
                   <span className="font-black underline decoration-2">{day.postingTime}</span>
                 </div>
               </div>
             </div>

             <div className="flex-1 flex flex-col gap-4">
               <Label htmlFor="notes" className="text-lg font-black uppercase">Director's Notes</Label>
               <Textarea 
                id="notes" 
                placeholder="COLLABS, LOCATIONS, REMINDERS..." 
                className="flex-1 border-4 border-black rounded-none bg-background p-4 font-bold focus-visible:ring-brand-teal min-h-[150px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
               />
               <Button className="w-full bg-brand-orange text-black border-2 border-black font-black uppercase h-12 shadow-brutalist hover-brutalist rounded-none" onClick={handleSaveNotes}>
                 <Save className="mr-2 h-4 w-4" />
                 Save Notes
               </Button>
             </div>

             <div className="bg-black text-white p-6 shadow-brutalist">
               <h4 className="text-xs font-black uppercase text-brand-orange mb-3">The Hook</h4>
               <p className="text-sm font-bold leading-relaxed italic">"{day.idea.hookConcept}"</p>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}