export type Platform = 'Instagram' | 'TikTok' | 'Facebook' | 'YouTube';

export type ContentStatus = 'Not started' | 'In progress' | 'Completed';

export interface ContentIdea {
  id: string;
  title: string;
  type: 'post' | 'carousel' | 'video';
  hookConcept: string;
  angle: string;
}

export interface GeneratedAsset {
  platform: Platform;
  script?: string;
  caption?: string;
  hashtags?: string[];
  title?: string;
  description?: string;
}

export interface ContentDay {
  id: string;
  date: string; // ISO string
  dayNumber: number; // 1 to 30
  idea: ContentIdea;
  status: ContentStatus;
  notes: string;
  assets?: GeneratedAsset[];
  postingTime?: string;
}

export interface ContentPlan {
  id: string;
  userId: string;
  topics: string[];
  frequency: number; // times per week
  platforms: Platform[];
  createdAt: string;
  days: ContentDay[];
  isArchived: boolean;
}
