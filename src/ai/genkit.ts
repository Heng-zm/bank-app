
import {genkit} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

/**
 * Initializes and configures the Genkit AI instance for the application.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1beta'],
    }),
  ],
});
