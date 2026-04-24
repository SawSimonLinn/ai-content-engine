"use client";

import { useState, useRef, useEffect } from "react";
import { ContentDay, ContentPlan, GeneratedAsset, Platform } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Save,
  FileText,
  Hash,
  MessageSquare,
  Circle,
  History,
  Send,
  Bot,
  User
} from "lucide-react";
import { generatePlatformSpecificContent } from "@/ai/flows/generate-platform-specific-content";
import { refineScript } from "@/ai/flows/refine-script-flow";
import { ContentStore } from "@/lib/content-store";
import { toast } from "@/hooks/use-toast";

type ContentMode = 'script' | 'caption';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ContentDetailDialogProps {
  day: ContentDay;
  plan: ContentPlan;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ContentDetailDialog({ day, plan, isOpen, onClose, onUpdate }: ContentDetailDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [localAssets, setLocalAssets] = useState(day.assets);
  const [localStatus, setLocalStatus] = useState(day.status);
  const [activePlatform, setActivePlatform] = useState<Platform>(plan.platforms[0]);
  const [notes, setNotes] = useState(day.notes);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [emojiMode, setEmojiMode] = useState<'with' | 'without'>('with');
  const [contentMode, setContentMode] = useState<ContentMode>('script');
  const [scriptOverride, setScriptOverride] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const getSharedScript = () => {
    if (scriptOverride !== null) return scriptOverride;
    return localAssets?.find(a => a.script)?.script ?? '';
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const currentScript = getSharedScript();
    const userMsg = chatInput.trim();
    setChatInput('');
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newMessages);
    setIsChatting(true);
    try {
      const refined = await refineScript({
        currentScript,
        platform: day.idea.type === 'video' ? 'TikTok/Instagram/YouTube' : plan.platforms[0],
        userInstruction: userMsg,
      });
      setScriptOverride(refined);
      setChatMessages([...newMessages, { role: 'assistant', content: 'Script updated!' }]);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to update script' });
    } finally {
      setIsChatting(false);
    }
  };

  const formatText = (text: string) => {
    if (emojiMode === 'without') {
      return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').replace(/\s{2,}/g, ' ').trim();
    }
    return text;
  };

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
      ContentStore.updateDay(plan.id, day.id, { assets: results, status: 'In progress' });
      setLocalAssets(results);
      setLocalStatus('In progress');
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
    const newStatus = localStatus === 'Completed' ? 'In progress' : 'Completed';
    ContentStore.updateDay(plan.id, day.id, { status: newStatus });
    setLocalStatus(newStatus);
    onUpdate();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentAsset = localAssets?.find(a => a.platform === activePlatform);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden border-4 border-black rounded-none shadow-brutalist-lg">
        <DialogHeader className="px-4 py-3 md:px-6 md:py-4 border-b-4 border-black bg-brand-teal text-white flex-shrink-0">
          <div className="flex flex-row justify-between items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 flex-shrink-0">Day {day.dayNumber} • {new Date(day.date).toLocaleDateString()}</span>
              </div>
              <DialogTitle className="text-base sm:text-lg md:text-xl font-headline font-black uppercase leading-tight truncate">{day.idea.title}</DialogTitle>
              <DialogDescription className="text-white/70 font-bold uppercase text-[10px] truncate mt-0.5">
                {day.idea.angle}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`flex-shrink-0 text-xs ${localStatus === 'Completed' ? 'bg-secondary text-black border-2 border-black' : 'bg-white text-black border-2 border-black'}`}
              onClick={handleToggleComplete}
            >
              {localStatus === 'Completed' ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Circle className="mr-1.5 h-3.5 w-3.5" />}
              {localStatus === 'Completed' ? 'COMPLETED' : 'MARK AS DONE'}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-background">
          {/* Main Content Area */}
          <div className="lg:col-span-8 p-4 md:p-8 flex flex-col gap-6 md:gap-8 border-b-4 lg:border-b-0 lg:border-r-4 border-black">
            {!localAssets ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-12 space-y-4 md:space-y-6 border-4 border-dashed border-black bg-white shadow-brutalist">
                <div className="p-4 md:p-6 bg-brand-orange border-2 border-black shadow-brutalist">
                  <Sparkles className="h-10 w-10 md:h-14 md:w-14 text-black" />
                </div>
                <h3 className="text-xl md:text-3xl font-headline font-black uppercase">Build Your Assets</h3>
                <p className="text-sm md:text-lg font-bold max-w-sm mx-auto">
                  Our Content Agents are ready to draft your scripts, captions, and tags.
                </p>
                <Button
                  size="lg"
                  className="bg-brand-teal text-white border-2 border-black h-12 md:h-16 px-6 md:px-10 text-base md:text-xl font-headline font-black shadow-brutalist hover-brutalist rounded-none"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Sparkles className="mr-3 h-6 w-6" />}
                  {isGenerating ? "CRAFTING..." : "GENERATE NOW"}
                </Button>
              </div>
            ) : (
              <>
                {/* Script / Caption Toggle */}
                <div className="flex items-center gap-1 border-4 border-black self-start">
                  <button
                    onClick={() => setContentMode('script')}
                    className={`px-4 py-2 text-xs font-black uppercase transition-colors flex items-center gap-2 ${contentMode === 'script' ? 'bg-black text-white' : 'bg-white text-black hover:bg-muted'}`}
                  >
                    <FileText className="h-3.5 w-3.5" /> Script
                  </button>
                  <button
                    onClick={() => setContentMode('caption')}
                    className={`px-4 py-2 text-xs font-black uppercase transition-colors flex items-center gap-2 ${contentMode === 'caption' ? 'bg-black text-white' : 'bg-white text-black hover:bg-muted'}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Caption
                  </button>
                </div>

                {/* Platform Tabs — only shown in Caption mode */}
                {contentMode === 'caption' && (
                  <Tabs value={activePlatform} onValueChange={(v) => { setActivePlatform(v as Platform); setSelectedTags(new Set()); }} className="w-full">
                    <TabsList className="w-full h-14 bg-black p-1 rounded-none grid" style={{ gridTemplateColumns: `repeat(${plan.platforms.length}, 1fr)` }}>
                      {plan.platforms.map(p => (
                        <TabsTrigger key={p} value={p} className="rounded-none font-black uppercase text-xs data-[state=active]:bg-brand-teal data-[state=active]:text-white">
                          {p}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}

                <div className="pr-4">
                  {contentMode === 'script' ? (
                    /* ── SCRIPT VIEW (shared for all platforms) ── */
                    <div className="space-y-6 pb-6">
                      {getSharedScript() ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="flex items-center gap-2 font-black uppercase text-sm">
                              <FileText className="h-5 w-5 text-brand-teal" /> Video Script
                            </Label>
                            <Button variant="outline" size="sm" className="border-2 border-black rounded-none shadow-brutalist hover-brutalist bg-white"
                              onClick={() => copyToClipboard(formatText(getSharedScript()), 'script')}>
                              {copied === 'script' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                          <div className="p-6 bg-white border-2 border-black shadow-brutalist text-sm leading-relaxed whitespace-pre-wrap font-medium min-h-[140px]">
                            {formatText(getSharedScript())}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 font-black uppercase text-muted-foreground text-sm border-4 border-dashed border-black">
                          No script — generate assets first.
                        </div>
                      )}

                      {/* AI Chat to refine script */}
                      <div className="border-4 border-black bg-white">
                        <div className="bg-black text-white px-4 py-2 flex items-center gap-2">
                          <Bot className="h-4 w-4 text-brand-teal" />
                          <span className="text-xs font-black uppercase">Refine Script with AI</span>
                        </div>

                        {chatMessages.length > 0 && (
                          <div className="p-4 space-y-3 max-h-48 overflow-y-auto border-b-2 border-black">
                            {chatMessages.map((msg, i) => (
                              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && <Bot className="h-4 w-4 mt-0.5 text-brand-teal flex-shrink-0" />}
                                <div className={`px-3 py-2 text-xs font-bold max-w-[80%] border-2 border-black ${msg.role === 'user' ? 'bg-brand-teal text-white' : 'bg-secondary text-black'}`}>
                                  {msg.content}
                                </div>
                                {msg.role === 'user' && <User className="h-4 w-4 mt-0.5 text-brand-orange flex-shrink-0" />}
                              </div>
                            ))}
                            <div ref={chatEndRef} />
                          </div>
                        )}

                        <div className="p-3 flex gap-2">
                          <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                            placeholder="e.g. Make it shorter, add a hook..."
                            className="border-2 border-black rounded-none font-bold text-xs h-10 focus-visible:ring-brand-teal"
                            disabled={isChatting || !getSharedScript()}
                          />
                          <Button
                            size="sm"
                            className="bg-brand-teal text-white border-2 border-black rounded-none shadow-brutalist hover-brutalist h-10 px-3"
                            onClick={handleSendChat}
                            disabled={isChatting || !chatInput.trim() || !getSharedScript()}
                          >
                            {isChatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : currentAsset ? (
                    /* ── CAPTION VIEW ── */
                      <div className="space-y-8 pb-10">
                        {currentAsset.caption && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="flex items-center gap-2 font-black uppercase text-sm">
                                <MessageSquare className="h-5 w-5 text-brand-teal" />
                                {activePlatform === 'Instagram' ? 'SEO Caption' : 'Caption'}
                              </Label>
                              <Button variant="outline" size="sm" className="border-2 border-black rounded-none shadow-brutalist hover-brutalist bg-white" onClick={() => copyToClipboard(formatText(currentAsset.caption!), 'caption')}>
                                {copied === 'caption' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            <div className="p-4 bg-secondary/10 border-2 border-black italic font-medium">
                              {formatText(currentAsset.caption)}
                            </div>
                          </div>
                        )}

                        {currentAsset.hashtags && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="flex items-center gap-2 font-black uppercase text-sm">
                                <Hash className="h-5 w-5 text-brand-orange" /> Tags
                                {activePlatform === 'Instagram' && (
                                  <span className="text-[10px] font-black text-muted-foreground normal-case">
                                    — tap to select ({selectedTags.size}/5)
                                  </span>
                                )}
                              </Label>
                              {activePlatform === 'Instagram' ? (
                                selectedTags.size > 0 && (
                                  <Button variant="outline" size="sm" className="border-2 border-black rounded-none shadow-brutalist hover-brutalist bg-white" onClick={() => copyToClipboard([...selectedTags].map(t => `#${t.replace(/^#+/, '')}`).join(' '), 'tags')}>
                                    {copied === 'tags' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                  </Button>
                                )
                              ) : (
                                <Button variant="outline" size="sm" className="border-2 border-black rounded-none shadow-brutalist hover-brutalist bg-white" onClick={() => copyToClipboard(currentAsset.hashtags!.map(t => `#${t.replace(/^#+/, '')}`).join(' '), 'tags')}>
                                  {copied === 'tags' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 p-4 bg-white border-2 border-black">
                              {currentAsset.hashtags.map(tag => {
                                const isSelected = selectedTags.has(tag);
                                if (activePlatform === 'Instagram') {
                                  return (
                                    <Badge
                                      key={tag}
                                      onClick={() => {
                                        setSelectedTags(prev => {
                                          const next = new Set(prev);
                                          if (next.has(tag)) { next.delete(tag); } else if (next.size < 5) { next.add(tag); }
                                          return next;
                                        });
                                      }}
                                      className={`border-2 border-black font-black uppercase text-[10px] rounded-none px-3 transition-colors ${
                                        isSelected ? 'cursor-pointer bg-black text-white'
                                          : selectedTags.size >= 5 ? 'cursor-not-allowed bg-muted text-muted-foreground opacity-50'
                                          : 'cursor-pointer bg-brand-orange text-black hover:bg-black hover:text-white'
                                      }`}
                                    >
                                      #{tag.replace(/^#+/, '')}
                                    </Badge>
                                  );
                                }
                                return (
                                  <Badge key={tag} className="bg-brand-orange text-black border-2 border-black font-black uppercase text-[10px] rounded-none px-3">
                                    #{tag.replace(/^#+/, '')}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {currentAsset.description && activePlatform === 'YouTube' && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="flex items-center gap-2 font-black uppercase text-sm"><FileText className="h-5 w-5 text-brand-teal" /> Description</Label>
                              <Button variant="outline" size="sm" className="border-2 border-black rounded-none shadow-brutalist hover-brutalist bg-white" onClick={() => copyToClipboard(formatText(currentAsset.description!), 'description')}>
                                {copied === 'description' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            <div className="p-6 bg-white border-2 border-black shadow-brutalist text-sm leading-relaxed whitespace-pre-wrap font-medium">
                              {formatText(currentAsset.description)}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16 font-black uppercase text-muted-foreground text-sm border-4 border-dashed border-black">
                        No assets for this platform.
                      </div>
                    )}
                </div>

                {contentMode === 'caption' && (
                  <div className="pt-6 border-t-4 border-black flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-1 border-2 border-black">
                      <button
                        onClick={() => setEmojiMode('with')}
                        className={`px-3 py-1.5 text-xs font-black uppercase transition-colors ${emojiMode === 'with' ? 'bg-black text-white' : 'bg-white text-black hover:bg-muted'}`}
                      >
                        😀 With Emoji
                      </button>
                      <button
                        onClick={() => setEmojiMode('without')}
                        className={`px-3 py-1.5 text-xs font-black uppercase transition-colors ${emojiMode === 'without' ? 'bg-black text-white' : 'bg-white text-black hover:bg-muted'}`}
                      >
                        No Emoji
                      </button>
                    </div>
                    <Button variant="outline" size="sm" className="border-2 border-black font-black uppercase shadow-brutalist hover-brutalist bg-white" onClick={handleGenerate} disabled={isGenerating}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 bg-white p-4 md:p-8 flex flex-col gap-6 md:gap-10">
             <div className="space-y-6">
               <Label className="text-lg font-black uppercase flex items-center gap-2">
                 <History className="h-5 w-5 text-brand-orange" /> Tracking
               </Label>
               <div className="space-y-4">
                 <div className="flex justify-between items-center font-bold uppercase text-xs">
                   <span className="text-muted-foreground">Status</span>
                   <Badge className="border-2 border-black bg-brand-teal text-white rounded-none">
                     {localStatus}
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