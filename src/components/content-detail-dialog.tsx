"use client";

import { useState } from "react";
import { ContentDay, ContentPlan, GeneratedAsset, Platform } from "@/lib/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
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
  MessageSquare
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
      
      // We generate content for all platforms in the plan
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
      toast({ title: "Content Generated!", description: "AI has successfully generated assets for all platforms." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Generation failed", description: "Something went wrong with the AI workflow." });
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Day {day.dayNumber} • {new Date(day.date).toLocaleDateString()}</span>
              <DialogTitle className="text-2xl font-headline mt-1">{day.idea.title}</DialogTitle>
              <DialogDescription className="text-brand-teal font-medium">
                {day.idea.angle}
              </DialogDescription>
            </div>
            <Button 
              variant={day.status === 'Completed' ? 'default' : 'outline'}
              className={day.status === 'Completed' ? 'bg-brand-teal' : ''}
              onClick={handleToggleComplete}
            >
              {day.status === 'Completed' ? <Check className="mr-2 h-4 w-4" /> : <Circle className="mr-2 h-4 w-4" />}
              {day.status === 'Completed' ? 'Completed' : 'Mark Done'}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
          {/* Left Column: Generation & Assets */}
          <div className="md:col-span-2 p-6 flex flex-col gap-6 overflow-hidden border-r">
            {!day.assets ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 border-2 border-dashed rounded-xl border-muted">
                <div className="p-4 bg-brand-teal/10 rounded-full">
                  <Sparkles className="h-10 w-10 text-brand-teal" />
                </div>
                <h3 className="text-xl font-headline">Generate Creative Assets</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Our AI Content Generation Agent will build scripts, captions, and metadata specifically for your platforms.
                </p>
                <Button 
                  size="lg" 
                  className="bg-brand-teal text-white" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  {isGenerating ? "Generating Content..." : "Generate Platform Assets"}
                </Button>
              </div>
            ) : (
              <>
                <Tabs value={activePlatform} onValueChange={(v) => setActivePlatform(v as Platform)} className="w-full flex flex-col flex-1">
                  <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${plan.platforms.length}, 1fr)` }}>
                    {plan.platforms.map(p => (
                      <TabsTrigger key={p} value={p}>{p}</TabsTrigger>
                    ))}
                  </TabsList>

                  <ScrollArea className="flex-1 mt-6 pr-4">
                    {currentAsset ? (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Title/Header Area (YouTube specific) */}
                        {currentAsset.title && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="flex items-center gap-2"><PlayCircle className="h-4 w-4 text-brand-orange" /> Video Title</Label>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentAsset.title!, 'title')}>
                                {copied === 'title' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                            <div className="p-3 bg-muted rounded-lg font-headline text-lg border">
                              {currentAsset.title}
                            </div>
                          </div>
                        )}

                        {/* Script Section */}
                        {currentAsset.script && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand-teal" /> Video Script / Post Body</Label>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentAsset.script!, 'script')}>
                                {copied === 'script' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-sm leading-relaxed whitespace-pre-wrap border">
                              {currentAsset.script}
                            </div>
                          </div>
                        )}

                        {/* Caption Section */}
                        {currentAsset.caption && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-brand-teal" /> Caption</Label>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentAsset.caption!, 'caption')}>
                                {copied === 'caption' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                            <div className="p-3 bg-muted rounded-lg text-sm border italic">
                              {currentAsset.caption}
                            </div>
                          </div>
                        )}

                         {/* Description Section (YouTube) */}
                         {currentAsset.description && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand-teal" /> Description</Label>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentAsset.description!, 'desc')}>
                                {copied === 'desc' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                            <div className="p-3 bg-muted rounded-lg text-xs leading-relaxed whitespace-pre-wrap border font-mono">
                              {currentAsset.description}
                            </div>
                          </div>
                        )}

                        {/* Hashtags Section */}
                        {currentAsset.hashtags && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="flex items-center gap-2"><Hash className="h-4 w-4 text-brand-orange" /> Hashtags</Label>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentAsset.hashtags!.join(' '), 'hashtags')}>
                                {copied === 'hashtags' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 p-3 bg-muted rounded-lg border">
                              {currentAsset.hashtags.map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-white text-brand-teal border">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No assets generated for this platform.
                      </div>
                    )}
                  </ScrollArea>
                </Tabs>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                   <p className="text-xs text-muted-foreground">Generated by content agent</p>
                   <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                     <Sparkles className="mr-2 h-3 w-3" />
                     Regenerate
                   </Button>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Tracking & Notes */}
          <div className="bg-muted/30 p-6 flex flex-col gap-6">
             <div className="space-y-4">
               <Label className="text-base font-semibold flex items-center gap-2">
                 <History className="h-4 w-4 text-brand-orange" /> Tracking Details
               </Label>
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">Status</span>
                   <Badge variant="outline" className="border-brand-teal text-brand-teal uppercase text-[10px]">
                     {day.status}
                   </Badge>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">Type</span>
                   <Badge variant="secondary" className="uppercase text-[10px]">
                     {day.idea.type}
                   </Badge>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">Scheduled</span>
                   <span className="font-medium">{day.postingTime}</span>
                 </div>
               </div>
             </div>

             <div className="space-y-3 flex-1 flex flex-col">
               <Label htmlFor="notes" className="text-base font-semibold">Internal Notes</Label>
               <Textarea 
                id="notes" 
                placeholder="Add filming location, collaborators, or reminder notes here..." 
                className="flex-1 resize-none bg-white min-h-[200px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
               />
               <Button variant="secondary" className="w-full" onClick={handleSaveNotes}>
                 <Save className="mr-2 h-4 w-4" />
                 Save Notes
               </Button>
             </div>

             <div className="bg-brand-orange/10 p-4 rounded-lg border border-brand-orange/20">
               <h4 className="text-xs font-bold text-brand-orange uppercase mb-1">Hook Concept</h4>
               <p className="text-sm italic text-foreground">"{day.idea.hookConcept}"</p>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
