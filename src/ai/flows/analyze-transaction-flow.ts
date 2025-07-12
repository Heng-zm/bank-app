
'use server';
/**
 * @fileOverview An AI flow to analyze financial transactions for fraud risk.
 *
 * - analyzeTransaction - A function that assesses the risk of a transaction.
 * - AnalyzeTransactionInput - The input type for the analyzeTransaction function.
 * - AnalyzeTransactionOutput - The return type for the analyzeTransaction function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const AnalyzeTransactionInputSchema = z.object({
  amount: z.number().describe('The amount of the transaction.'),
  recipient: z.string().describe('The recipient of the transaction (email or account number).'),
  recentTransactions: z
    .string()
    .describe('A JSON string representing the user\'s last 10 transactions.'),
});
export type AnalyzeTransactionInput = z.infer<typeof AnalyzeTransactionInputSchema>;

const AnalyzeTransactionOutputSchema = z.object({
  risk: z
    .enum(['low', 'medium', 'high'])
    .describe('The assessed risk level of the transaction.'),
  reason: z
    .string()
    .describe('A brief justification for the assessed risk level.'),
});
export type AnalyzeTransactionOutput = z.infer<typeof AnalyzeTransactionOutputSchema>;

export async function analyzeTransaction(input: AnalyzeTransactionInput): Promise<AnalyzeTransactionOutput> {
  return analyzeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTransactionPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: AnalyzeTransactionInputSchema },
  output: { schema: AnalyzeTransactionOutputSchema },
  prompt: `You are a fraud detection specialist for a bank. Your task is to analyze a proposed transaction and assess its risk level based on the user's recent activity.

Consider the following factors:
- Is the amount unusually large compared to other recent transactions?
- Is the recipient new? (i.e., not present in recent transaction history)
- Does the transaction fit the user's typical spending pattern?
- Time of day can also be a factor, but we don't have that data, so focus on amount and recipient.

Based on your analysis of the new transaction in the context of the user's history, determine if the risk is "low", "medium", or "high", and provide a concise, one-sentence reason for your decision.

**User's Recent Transactions:**
\`\`\`json
{{{recentTransactions}}}
\`\`\`

**New Transaction to Analyze:**
- Amount: {{{amount}}}
- Recipient: {{{recipient}}}

Please provide your risk assessment in the specified JSON format.`,
});

const analyzeTransactionFlow = ai.defineFlow(
  {
    name: 'analyzeTransactionFlow',
    inputSchema: AnalyzeTransactionInputSchema,
    outputSchema: AnalyzeTransactionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
