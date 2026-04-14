'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RefineScriptInputSchema = z.object({
  currentScript: z.string().describe('The current video script.'),
  platform: z.string().describe('The target platform (TikTok, Instagram, YouTube, etc).'),
  userInstruction: z.string().describe('User instruction on how to change the script.'),
});

const RefineScriptOutputSchema = z.object({
  script: z.string().describe('The refined video script.'),
});

export async function refineScript(input: z.infer<typeof RefineScriptInputSchema>): Promise<string> {
  const flow = ai.defineFlow(
    {
      name: 'refineScriptFlow_' + Date.now(),
      inputSchema: RefineScriptInputSchema,
      outputSchema: RefineScriptOutputSchema,
    },
    async (inp) => {
      const prompt = ai.definePrompt({
        name: 'refineScriptPrompt_' + Date.now(),
        input: { schema: RefineScriptInputSchema },
        output: { schema: RefineScriptOutputSchema },
        prompt: `You are an expert video script writer for {{{platform}}}.

Current script:
{{{currentScript}}}

User instruction: {{{userInstruction}}}

Rewrite or update the script based on the instruction. Keep the platform's style and format. Return only the updated script text.`,
      });
      const { output } = await prompt(inp);
      if (!output) throw new Error('Failed to refine script.');
      return output;
    }
  );
  const result = await flow(input);
  return result.script;
}
