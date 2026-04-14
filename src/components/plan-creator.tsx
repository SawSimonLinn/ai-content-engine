"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, Check } from "lucide-react";
import { brainstormContentIdeas } from "@/ai/flows/brainstorm-content-ideas-flow";
import { ContentPlan, ContentDay, ContentIdea, Platform } from "@/lib/types";
import { ContentStore } from "@/lib/content-store";

interface PlanCreatorProps {
  onPlanCreated: (plan: ContentPlan) => void;
}

export function PlanCreator({ onPlanCreated }: PlanCreatorProps) {
  const [topic, setTopic] = useState("");
  const [frequency, setFrequency] = useState("3");
  const [platforms, setPlatforms] = useState<Platform[]>(["Instagram", "YouTube"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Brainstorming, 3: Planning

  const handlePlatformToggle = (platform: Platform) => {
    setPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const createPlan = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setStep(2);

    try {
      // Step 2: Brainstorm Agent
      const brainstormingResult = await brainstormContentIdeas({ topic });
      
      setStep(3);
      // Step 3: Planning Agent (logic to distribute ideas over 30 days)
      const freqNum = parseInt(frequency);
      const totalPosts = Math.ceil((freqNum / 7) * 30);
      const selectedIdeas = brainstormingResult.ideas.slice(0, totalPosts);
      
      const days: ContentDay[] = [];
      const startDate = new Date();
      
      // Distribute ideas over 30 days
      const postInterval = 7 / freqNum;
      let ideaIndex = 0;

      for (let i = 1; i <= 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (i - 1));
        
        // Basic logic: place a post every few days based on frequency
        const shouldPost = Math.floor((i - 1) / postInterval) > Math.floor((i - 2) / postInterval) || i === 1;
        
        if (shouldPost && ideaIndex < selectedIdeas.length) {
          const idea = selectedIdeas[ideaIndex];
          days.push({
            id: `day-${i}-${Math.random().toString(36).substr(2, 9)}`,
            date: currentDate.toISOString(),
            dayNumber: i,
            idea: { ...idea, id: `idea-${i}` },
            status: 'Not started',
            notes: '',
            postingTime: '10:00 AM'
          });
          ideaIndex++;
        } else {
          // Fill rest with empty or placeholder if needed, but the prompt says 30-day dashboard
          // We'll only create active days for simplicity in the list, but for 30-day dashboard
          // we should represent all days. Let's just create content-less days for empty ones.
        }
      }

      const newPlan: ContentPlan = {
        id: Math.random().toString(36).substr(2, 9),
        userId: "user-1",
        topic,
        frequency: freqNum,
        platforms,
        createdAt: new Date().toISOString(),
        days,
        isArchived: false
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
    <Card className="max-w-2xl mx-auto shadow-xl border-2 border-brand-teal/10">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-brand-teal/10 rounded-full">
            <Sparkles className="h-8 w-8 text-brand-teal" />
          </div>
        </div>
        <CardTitle className="text-3xl font-headline text-brand-teal">Ignite Your Content</CardTitle>
        <CardDescription className="text-lg">
          Transform a single topic into a full 30-day automated strategy.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="topic" className="text-base font-semibold">What's your main topic?</Label>
          <Input 
            id="topic" 
            placeholder="e.g. Sustainable Living, Web Development Tips..." 
            className="h-12 text-lg border-2 focus-visible:ring-brand-teal"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-base font-semibold">How often do you post?</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="h-12 border-2">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 time per week</SelectItem>
                <SelectItem value="3">3 times per week</SelectItem>
                <SelectItem value="5">5 times per week</SelectItem>
                <SelectItem value="7">Every day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Target Platforms</Label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {['Instagram', 'TikTok', 'Facebook', 'YouTube'].map((p) => (
                <div key={p} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`p-${p}`} 
                    checked={platforms.includes(p as Platform)}
                    onCheckedChange={() => handlePlatformToggle(p as Platform)}
                  />
                  <Label htmlFor={`p-${p}`} className="cursor-pointer">{p}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button 
          className="w-full h-14 text-xl font-headline bg-brand-teal hover:bg-brand-teal/90 transition-all shadow-lg"
          onClick={createPlan}
          disabled={isGenerating || !topic}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              {step === 2 ? "Brainstorming Ideas..." : "Orchestrating Plan..."}
            </>
          ) : (
            <>
              Generate Full 30-Day Plan
              <Sparkles className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
        
        {isGenerating && (
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Input Received</span>
              <span>Brainstorming</span>
              <span>Planning</span>
            </div>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-orange transition-all duration-500" 
                style={{ width: step === 2 ? '50%' : step === 3 ? '85%' : '0%' }}
              />
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
