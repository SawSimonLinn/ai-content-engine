'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating platform-specific content assets.
 *
 * - generatePlatformSpecificContent - A function that handles the generation of platform-specific content.
 * - GeneratePlatformSpecificContentInput - The input type for the generatePlatformSpecificContent function.
 * - GeneratePlatformSpecificContentOutput - The return type for the generatePlatformSpecificContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { enforceRateLimit } from '@/lib/rate-limiter';

const PlatformEnum = z.enum(['Instagram', 'TikTok', 'Facebook', 'YouTube']);

const GeneratePlatformSpecificContentInputSchema = z.object({
  contentIdea: z.string().describe('A detailed content idea to generate assets for.'),
  platform: PlatformEnum.describe('The target social media platform.'),
});
export type GeneratePlatformSpecificContentInput = z.infer<typeof GeneratePlatformSpecificContentInputSchema>;

const InstagramTikTokFacebookOutputSchema = z.object({
  script: z.string().describe('A script for a short video or a textual post.'),
  caption: z.string().describe('A compelling caption for the post.'),
  hashtags: z.array(z.string()).describe('A list of relevant hashtags for the post.'),
});

const YouTubeOutputSchema = z.object({
  title: z.string().max(99).describe('A catchy YouTube video title (max 99 characters) including relevant keywords/hashtags.'),
  description: z.string().describe('A detailed YouTube video description.'),
});

const GeneratePlatformSpecificContentOutputSchema = z.discriminatedUnion('platform', [
  InstagramTikTokFacebookOutputSchema.extend({ platform: z.literal('Instagram') }),
  InstagramTikTokFacebookOutputSchema.extend({ platform: z.literal('TikTok') }),
  InstagramTikTokFacebookOutputSchema.extend({ platform: z.literal('Facebook') }),
  YouTubeOutputSchema.extend({ platform: z.literal('YouTube') }),
]);
export type GeneratePlatformSpecificContentOutput = z.infer<typeof GeneratePlatformSpecificContentOutputSchema>;

export async function generatePlatformSpecificContent(
  input: GeneratePlatformSpecificContentInput
): Promise<GeneratePlatformSpecificContentOutput> {
  await enforceRateLimit();
  return generatePlatformSpecificContentFlow(input);
}

const generatePlatformSpecificContentPrompt = ai.definePrompt({
  name: 'generatePlatformSpecificContentPrompt',
  input: { schema: GeneratePlatformSpecificContentInputSchema },
  output: { schema: GeneratePlatformSpecificContentOutputSchema },
  prompt: `You are an expert social media content creator. Your task is to generate platform-specific content assets based on a given content idea and target platform.

Content Idea: {{{contentIdea}}}
Target Platform: {{{platform}}}

When the platform is 'Instagram', provide a script, a compelling SEO-optimized caption, and a list of EXACTLY 5 relevant hashtags (Instagram best practice: 5 focused hashtags only).
When the platform is 'TikTok' or 'Facebook', provide a script, a caption, and a list of relevant hashtags.
When the platform is 'YouTube', provide a video title (max 99 characters, including relevant keywords/hashtags) and a detailed SEO-optimized video description (include keywords, timestamps if relevant, and a call to action).

Ensure the generated content is engaging and optimized for the specified platform.
`,
});

const generatePlatformSpecificContentFlow = ai.defineFlow(
  {
    name: 'generatePlatformSpecificContentFlow',
    inputSchema: GeneratePlatformSpecificContentInputSchema,
    outputSchema: GeneratePlatformSpecificContentOutputSchema,
  },
  async (input) => {
    const { output } = await generatePlatformSpecificContentPrompt(input);
    if (!output) {
      throw new Error('Failed to generate platform-specific content.');
    }
    // Add the platform to the output for discriminated union validation if it's not already there by the model
    // The model should infer it from the prompt's input, but explicitly adding for type safety if needed.
    // However, the discriminatedUnion output schema usually handles this if the model is instructed correctly.
    return { ...output, platform: input.platform } as GeneratePlatformSpecificContentOutput;
  }
);
