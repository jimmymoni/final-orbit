import Replicate from 'replicate';

/**
 * Replicate AI Service
 * Handles all interactions with Replicate API
 */

// Initialize Replicate client
const replicate = new Replicate({
  auth: import.meta.env.VITE_REPLICATE_API_TOKEN,
});

// Recommended model: DeepSeek R1
// Advanced reasoning model optimized for complex tasks
const DEFAULT_MODEL = 'deepseek/deepseek-r1';

// Alternative models for different use cases
export const MODELS = {
  DEEPSEEK_R1: 'deepseek/deepseek-r1', // Best reasoning and problem-solving
  LLAMA_405B: 'meta/meta-llama-3.1-405b-instruct', // Highest quality (fallback)
  LLAMA_70B: 'meta/meta-llama-3.1-70b-instruct', // Good balance
  FAST: 'mistralai/mixtral-8x7b-instruct-v0.1', // Fastest, cost-effective
};

/**
 * Generate text completion using Replicate
 */
export async function generateCompletion(prompt, options = {}) {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt = null,
  } = options;

  try {
    const input = {
      prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
      temperature,
      max_tokens: maxTokens,
      top_p: 0.9,
    };

    const output = await replicate.run(model, { input });

    // Replicate returns an async iterator, collect all chunks
    let fullResponse = '';
    for await (const chunk of output) {
      fullResponse += chunk;
    }

    return fullResponse.trim();
  } catch (error) {
    console.error('Replicate API error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

/**
 * Generate multiple completions in parallel
 */
export async function generateMultipleCompletions(prompts, options = {}) {
  try {
    const promises = prompts.map((prompt) => generateCompletion(prompt, options));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Batch generation error:', error);
    throw error;
  }
}

/**
 * Check if Replicate is configured
 */
export function isReplicateConfigured() {
  const token = import.meta.env.VITE_REPLICATE_API_TOKEN;
  return token && token !== 'your_replicate_token_here';
}

export default replicate;
