import { ContentPlan, ContentDay, Platform } from './types';

const STORAGE_KEY = 'ai-content-engine-plans';

export const ContentStore = {
  getPlans: (): ContentPlan[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  savePlan: (plan: ContentPlan) => {
    const plans = ContentStore.getPlans();
    const existingIndex = plans.findIndex(p => p.id === plan.id);
    if (existingIndex >= 0) {
      plans[existingIndex] = plan;
    } else {
      plans.push(plan);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  },

  updateDay: (planId: string, dayId: string, updates: Partial<ContentDay>) => {
    const plans = ContentStore.getPlans();
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const day = plan.days.find(d => d.id === dayId);
      if (day) {
        Object.assign(day, updates);
        ContentStore.savePlan(plan);
      }
    }
  },

  archivePlan: (planId: string) => {
    const plans = ContentStore.getPlans();
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      plan.isArchived = true;
      ContentStore.savePlan(plan);
    }
  }
};
