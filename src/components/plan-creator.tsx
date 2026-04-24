"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Plus, X, Crown, Lock } from "lucide-react";
import { brainstormContentIdeas } from "@/ai/flows/brainstorm-content-ideas-flow";
import { ContentPlan, ContentDay, Platform } from "@/lib/types";
import { ContentStore } from "@/lib/content-store";

interface PlanCreatorProps {
  onPlanCreated: (plan: ContentPlan) => void;
}

const DURATION_OPTIONS = [
  { weeks: 1, label: "1 WEEK", sublabel: "7 days", free: true },
  { weeks: 2, label: "2 WEEKS", sublabel: "14 days", free: false },
  { weeks: 4, label: "1 MONTH", sublabel: "30 days", free: false },
];

export function PlanCreator({ onPlanCreated }: PlanCreatorProps) {
  const [currentTopic, setCurrentTopic] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("3");
  const [platforms, setPlatforms] = useState<Platform[]>(["Instagram", "YouTube"]);
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);

  const handleAddTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic("");
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(t => t !== topicToRemove));
  };

  const handlePlatformToggle = (platform: Platform) => {
    setPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const createPlan = async () => {
    if (topics.length === 0) return;
    setIsGenerating(true);
    setStep(2);

    try {
      const freqNum = parseInt(frequency);
      const totalDays = durationWeeks * 7;
      const totalPosts = freqNum * durationWeeks;

      const brainstormingResult = await brainstormContentIdeas({ topics, count: totalPosts });

      setStep(3);
      const selectedIdeas = brainstormingResult.ideas.slice(0, totalPosts);

      const days: ContentDay[] = [];
      const startDate = new Date();
      const postInterval = 7 / freqNum;
      let ideaIndex = 0;

      for (let i = 1; i <= totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (i - 1));
        const shouldPost =
          Math.floor((i - 1) / postInterval) > Math.floor((i - 2) / postInterval) || i === 1;

        if (shouldPost && ideaIndex < selectedIdeas.length) {
          const idea = selectedIdeas[ideaIndex];
          days.push({
            id: `day-${i}-${Math.random().toString(36).substr(2, 9)}`,
            date: currentDate.toISOString(),
            dayNumber: i,
            idea: { ...idea, id: `idea-${i}` },
            status: "Not started",
            notes: "",
            postingTime: "10:00 AM",
          });
          ideaIndex++;
        }
      }

      const newPlan: ContentPlan = {
        id: Math.random().toString(36).substr(2, 9),
        userId: "user-1",
        title: brainstormingResult.planTitle,
        topics,
        frequency: freqNum,
        platforms,
        createdAt: new Date().toISOString(),
        days,
        isArchived: false,
      };

      ContentStore.savePlan(newPlan);
      onPlanCreated(newPlan);
    } catch (error) {
      console.error("Failed to generate plan", error);
    } finally {
      setIsGenerating(false);
      setStep(1);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-4 border-black rounded-none shadow-brutalist-lg overflow-hidden">
      <CardHeader className="text-center bg-brand-orange border-b-4 border-black py-6 md:py-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 md:p-4 bg-white border-2 border-black -rotate-6 shadow-brutalist">
            <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-brand-teal" />
          </div>
        </div>
        <CardTitle className="text-2xl md:text-4xl font-headline font-black text-black">IGNITE YOUR ENGINE</CardTitle>
        <CardDescription className="text-black font-bold uppercase tracking-tight mt-2">
          Strategy across multiple topics.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-8 space-y-8 md:space-y-10">

        {/* Duration selector */}
        <div className="space-y-4">
          <Label className="text-lg font-black uppercase">Plan Duration</Label>
          <div className="grid grid-cols-3 gap-3">
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = durationWeeks === opt.weeks && opt.free;
              return (
                <button
                  key={opt.weeks}
                  type="button"
                  disabled={!opt.free}
                  onClick={() => opt.free && setDurationWeeks(opt.weeks)}
                  className={[
                    "relative flex flex-col items-center justify-center p-3 sm:p-4 border-4 font-black uppercase transition-all",
                    opt.free
                      ? isSelected
                        ? "border-brand-teal bg-brand-teal text-white shadow-brutalist"
                        : "border-black bg-white text-black hover:bg-black hover:text-white cursor-pointer"
                      : "border-black/30 bg-gray-50 text-black/30 cursor-not-allowed",
                  ].join(" ")}
                >
                  {!opt.free && (
                    <div className="absolute -top-2 -right-2 bg-brand-orange border-2 border-black px-1.5 py-0.5 flex items-center gap-1">
                      <Crown className="h-2.5 w-2.5 text-black" />
                      <span className="text-[9px] font-black text-black">PRO</span>
                    </div>
                  )}
                  {!opt.free && <Lock className="h-4 w-4 mb-1 text-black/30" />}
                  <span className="text-sm sm:text-base leading-tight">{opt.label}</span>
                  <span className="text-[10px] font-bold opacity-60 mt-0.5">{opt.sublabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-4">
          <Label htmlFor="topic" className="text-lg font-black uppercase">What are the topics?</Label>
          <div className="flex gap-2">
            <Input
              id="topic"
              placeholder="e.g. WEB DEVELOPMENT, DOG TOYS..."
              className="h-14 text-lg border-4 border-black rounded-none focus-visible:ring-brand-teal bg-white"
              value={currentTopic}
              onChange={(e) => setCurrentTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
            />
            <Button
              type="button"
              onClick={handleAddTopic}
              className="h-14 w-14 border-4 border-black bg-white text-black hover:bg-black hover:text-white rounded-none shadow-brutalist"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {topics.map((topic) => (
              <Badge key={topic} className="bg-brand-teal text-white border-2 border-black rounded-none px-3 py-1 font-black uppercase flex items-center gap-2">
                {topic}
                <X className="h-3 w-3 cursor-pointer hover:text-brand-orange" onClick={() => handleRemoveTopic(topic)} />
              </Badge>
            ))}
            {topics.length === 0 && (
              <p className="text-xs font-bold uppercase text-muted-foreground italic">Add at least one topic to start.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <Label className="text-lg font-black uppercase">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="h-14 border-4 border-black rounded-none font-bold bg-white">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className="border-2 border-black rounded-none">
                <SelectItem value="1">1 TIME / WEEK</SelectItem>
                <SelectItem value="3">3 TIMES / WEEK</SelectItem>
                <SelectItem value="5">5 TIMES / WEEK</SelectItem>
                <SelectItem value="7">EVERY SINGLE DAY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-black uppercase">Channels</Label>
            <div className="grid grid-cols-2 gap-4 pt-1">
              {["Instagram", "TikTok", "Facebook", "YouTube"].map((p) => (
                <div key={p} className="flex items-center space-x-3 p-2 border-2 border-black hover:bg-muted transition-colors cursor-pointer" onClick={() => handlePlatformToggle(p as Platform)}>
                  <Checkbox
                    id={`p-${p}`}
                    checked={platforms.includes(p as Platform)}
                    className="border-2 border-black rounded-none"
                    onCheckedChange={() => handlePlatformToggle(p as Platform)}
                  />
                  <Label htmlFor={`p-${p}`} className="cursor-pointer font-bold uppercase text-xs">{p}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 sm:p-8 border-t-4 border-black bg-muted/30 flex flex-col gap-6">
        <Button
          className="w-full h-14 md:h-20 text-lg md:text-2xl font-headline font-black bg-brand-teal hover:bg-brand-teal/90 text-white border-4 border-black shadow-brutalist hover-brutalist rounded-none transition-all"
          onClick={createPlan}
          disabled={isGenerating || topics.length === 0}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              {step === 2 ? "BRAINSTORMING..." : "CALCULATING..."}
            </>
          ) : (
            <>
              GENERATE PLAN
              <Sparkles className="ml-3 h-6 w-6" />
            </>
          )}
        </Button>

        {isGenerating && (
          <div className="w-full space-y-3">
            <div className="flex justify-between text-xs font-black uppercase px-1">
              <span>STARTED</span>
              <span className={step >= 2 ? "text-brand-teal" : ""}>IDEATING</span>
              <span className={step >= 3 ? "text-brand-teal" : ""}>PLANNING</span>
            </div>
            <div className="h-4 w-full bg-white border-2 border-black rounded-none overflow-hidden">
              <div
                className="h-full bg-brand-orange border-r-2 border-black transition-all duration-500"
                style={{ width: step === 2 ? "50%" : step === 3 ? "85%" : "0%" }}
              />
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
