'use server';

/**
 * @fileOverview Extracts the recipient's email address and message content from a user prompt.
 *
 * - extractEmailAndMessage - A function that handles the extraction process.
 * - ExtractEmailAndMessageInput - The input type for the extractEmailAndMessage function.
 * - ExtractEmailAndMessageOutput - The return type for the extractEmailAndMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractEmailAndMessageInputSchema = z.string().describe('The user prompt containing the recipient email address and message content.');
export type ExtractEmailAndMessageInput = z.infer<typeof ExtractEmailAndMessageInputSchema>;

const ExtractEmailAndMessageOutputSchema = z.object({
  email: z.string().email().describe('The extracted recipient email address.'),
  message: z.string().describe('The extracted message content.'),
});
export type ExtractEmailAndMessageOutput = z.infer<typeof ExtractEmailAndMessageOutputSchema>;

export async function extractEmailAndMessage(input: ExtractEmailAndMessageInput): Promise<ExtractEmailAndMessageOutput> {
  return extractEmailAndMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractEmailAndMessagePrompt',
  input: {schema: ExtractEmailAndMessageInputSchema},
  output: {schema: ExtractEmailAndMessageOutputSchema},
  prompt: `You are an AI assistant tasked with extracting the recipient's email address and message content from a user prompt.

  Given the following prompt, extract the email address and message. The email address must be a valid email.

  Prompt: {{{$input}}}

  Ensure that you do not include the phrase "Prompt:" or any other extraneous text in the message content.
  `,
});

const extractEmailAndMessageFlow = ai.defineFlow(
  {
    name: 'extractEmailAndMessageFlow',
    inputSchema: ExtractEmailAndMessageInputSchema,
    outputSchema: ExtractEmailAndMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
