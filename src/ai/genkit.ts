
import {genkit, Plugin, Task} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

/**
 * A Genkit plugin that pretty-prints any task to the console.
 */
const prettyPrinter: Plugin = {
  name: 'prettyPrinter',
  configure: async () => {},
  onTask: async (task: Task) => {
    let taskStr = `[${task.name}]`;
    if (task.input) {
      taskStr += ` input: ${JSON.stringify(task.input, undefined, '  ')}`;
    }
    if (task.output) {
      taskStr += ` output: ${JSON.stringify(task.output, undefined, '  ')}`;
    }
    console.log(taskStr);
  },
};

/**
 * Initializes and configures the Genkit AI instance for the application.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1beta'],
    }),
    prettyPrinter,
  ],
});
