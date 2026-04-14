'use server';
/**
 * @fileOverview This file implements a Genkit flow for brainstorming social media content ideas based on multiple topics.
 *
 * - brainstormContentIdeas - A function that generates a diverse set of 20 structured content ideas based on a list of topics.
 * - BrainstormContentIdeasInput - The input type for the brainstormContentIdeas function.
 * - BrainstormContentIdeasOutput - The return type for the brainstormContentIdeas function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BrainstormContentIdeasInputSchema = z.object({
  topics: z.array(z.string()).describe('A list of topics for which to generate content ideas.'),
});
export type BrainstormContentIdeasInput = z.infer<typeof BrainstormContentIdeasInputSchema>;

const ContentIdeaSchema = z.object({
  title: z.string().describe('A catchy title for the content idea.'),
  type: z.enum(['post', 'carousel', 'video']).describe('The type of social media content.'),
  hookConcept: z
    .string()
    .describe('A brief concept for a hook to grab attention (e.g., a question, a shocking fact, a relatable scenario).'),
  angle: z.string().describe('The unique perspective or approach taken for this content idea.'),
});

const BrainstormContentIdeasOutputSchema = z.object({
  planTitle: z.string().describe('A short, punchy 3-6 word headline that captures the spirit of this content strategy. Should be bold and motivating, NOT just a list of the topics.'),
  ideas: z.array(ContentIdeaSchema).length(20).describe('A list of 20 diverse content ideas.'),
});
export type BrainstormContentIdeasOutput = z.infer<typeof BrainstormContentIdeasOutputSchema>;

export async function brainstormContentIdeas(
  input: BrainstormContentIdeasInput
): Promise<BrainstormContentIdeasOutput> {
  return brainstormContentIdeasFlow(input);
}

const brainstormContentIdeasPrompt = ai.definePrompt({
  name: 'brainstormContentIdeasPrompt',
  input: { schema: BrainstormContentIdeasInputSchema },
  output: { schema: BrainstormContentIdeasOutputSchema },
  prompt: `You are a creative social media content strategist specializing in generating engaging content ideas.

Your task is to brainstorm 20 diverse social media content ideas that relate to the following topics:
{{#each topics}}
- {{{this}}}
{{/each}}

The content plan should create a cohesive narrative or variety that touches upon all provided topics.

Also generate a planTitle: a short, punchy 3-6 word headline that captures the spirit of this strategy. Make it bold and motivating — something like "BUILD IN PUBLIC DAILY" or "DOMINATE THE FEED" or "FROM ZERO TO VIRAL". Do NOT just list the topics.

For each idea, provide:
- A catchy title.
- The content type (must be one of: 'post', 'carousel', 'video'). Ensure a good mix of these types.
- A brief hook concept to grab the audience's attention.
- A unique angle or perspective for the content.

Ensure the ideas are varied and provide a rich pool of starting points. The output must include planTitle and a JSON array of 20 content ideas.`,
});

const brainstormContentIdeasFlow = ai.defineFlow(
  {
    name: 'brainstormContentIdeasFlow',
    inputSchema: BrainstormContentIdeasInputSchema,
    outputSchema: BrainstormContentIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await brainstormContentIdeasPrompt(input);
    return output!;
  }
);
