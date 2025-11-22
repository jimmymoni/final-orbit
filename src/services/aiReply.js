import { generateCompletion } from './replicate';
import { knowledgeModel } from '@/models/knowledge';
import { appsModel } from '@/models/apps';

/**
 * AI Reply Service
 * Generates smart reply suggestions using Replicate AI
 * with context from knowledge base, apps, and templates
 */

/**
 * Main function to generate reply suggestions
 */
export async function generateReplySuggestions(inquiry) {
  try {
    // Step 1: Build context from various sources
    const context = await buildContext(inquiry);

    // Step 2: Create prompts for 3 different reply styles
    const prompts = createPrompts(inquiry, context);

    // Step 3: Generate all 3 replies in parallel
    const systemPrompt = createSystemPrompt();

    const replies = await Promise.all([
      generateCompletion(prompts.professional, { systemPrompt, temperature: 0.7 }),
      generateCompletion(prompts.friendly, { systemPrompt, temperature: 0.8 }),
      generateCompletion(prompts.concise, { systemPrompt, temperature: 0.6 }),
    ]);

    return {
      suggestions: [
        { id: 1, style: 'Professional', reply: replies[0], badge: 'default' },
        { id: 2, style: 'Friendly', reply: replies[1], badge: 'success' },
        { id: 3, style: 'Concise', reply: replies[2], badge: 'outline' },
      ],
      context: context.meta,
    };
  } catch (error) {
    console.error('Error generating reply suggestions:', error);
    throw new Error('Failed to generate AI replies. Please try again.');
  }
}

/**
 * Build context from knowledge base, apps, and templates
 */
async function buildContext(inquiry) {
  const { title, content, category } = inquiry;
  const searchQuery = `${title} ${content}`.toLowerCase();

  // Search knowledge base for relevant articles
  const kbArticles = await searchKnowledgeBase(searchQuery, category);

  // Find relevant app if mentioned
  const app = await findRelevantApp(searchQuery);

  // Get reply templates for this category
  const templates = await getReplyTemplates(category);

  // Build context strings
  const kbContext = kbArticles.length > 0
    ? `\n\nRelevant Knowledge Base Articles:\n${kbArticles.map((a, i) =>
        `${i + 1}. ${a.title}\n${a.content?.substring(0, 300)}...`
      ).join('\n\n')}`
    : '';

  const appContext = app
    ? `\n\nRelevant App Information:\n- Name: ${app.name}\n- Description: ${app.description}\n- Features: ${app.features?.join(', ') || 'N/A'}\n- Pricing: ${app.pricing}`
    : '';

  const templateContext = templates.length > 0
    ? `\n\nExample Reply Templates:\n${templates.map((t, i) =>
        `${i + 1}. ${t.template}`
      ).join('\n\n')}`
    : '';

  return {
    kbContext,
    appContext,
    templateContext,
    meta: {
      knowledgeArticles: kbArticles.length,
      app: app?.name || null,
      templates: templates.length,
    },
  };
}

/**
 * Search knowledge base for relevant articles
 */
async function searchKnowledgeBase(query, category) {
  try {
    // Get all articles (or filtered by category)
    const articles = await knowledgeModel.getAll(category ? { category } : {});

    // Simple keyword matching (can be enhanced with embeddings later)
    const keywords = query.split(' ').filter(w => w.length > 3);

    const scored = articles.map(article => {
      const text = `${article.title} ${article.markdown_content}`.toLowerCase();
      const score = keywords.reduce((sum, keyword) => {
        return sum + (text.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      return { ...article, score };
    });

    // Return top 3 most relevant
    return scored
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(a => ({
        title: a.title,
        content: a.markdown_content,
      }));
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return [];
  }
}

/**
 * Find relevant app mentioned in inquiry
 */
async function findRelevantApp(query) {
  try {
    const apps = await appsModel.getAll();

    // Check if any app name is mentioned
    const mentionedApp = apps.find(app =>
      query.includes(app.name.toLowerCase())
    );

    return mentionedApp || null;
  } catch (error) {
    console.error('App search error:', error);
    return null;
  }
}

/**
 * Get reply templates for category
 */
async function getReplyTemplates(category) {
  try {
    // Get apps with reply templates
    const apps = await appsModel.getAll();

    const templates = [];
    apps.forEach(app => {
      if (app.reply_templates && Array.isArray(app.reply_templates)) {
        app.reply_templates.forEach(template => {
          if (!category || template.category === category) {
            templates.push(template);
          }
        });
      }
    });

    return templates.slice(0, 2); // Return top 2 templates
  } catch (error) {
    console.error('Template search error:', error);
    return [];
  }
}

/**
 * Create system prompt for AI
 */
function createSystemPrompt() {
  return `You are a helpful and professional customer support assistant for FinalApps, a company that builds Shopify apps.

Your role is to help employees craft excellent replies to customer inquiries.

Guidelines:
- Be helpful, professional, and empathetic
- Provide accurate information based on the context provided
- Include soft mentions of relevant FinalApps products when appropriate
- Keep responses concise but complete
- Use proper formatting (paragraphs, bullet points when needed)
- Sign off professionally
- Do NOT make up information - only use what's in the context

Tone variations:
- Professional: Formal, detailed, corporate tone
- Friendly: Warm, conversational, approachable tone
- Concise: Brief, to-the-point, efficient tone`;
}

/**
 * Create prompts for different reply styles
 */
function createPrompts(inquiry, context) {
  const { title, content } = inquiry;
  const { kbContext, appContext, templateContext } = context;

  const baseContext = `
Customer Inquiry:
Title: ${title}
Content: ${content}
${kbContext}
${appContext}
${templateContext}

Based on the above context, generate a reply to the customer.`;

  return {
    professional: `${baseContext}\n\nStyle: Professional and detailed. Use a formal, corporate tone. Include all relevant details.`,
    friendly: `${baseContext}\n\nStyle: Friendly and conversational. Be warm and approachable. Use a casual but professional tone.`,
    concise: `${baseContext}\n\nStyle: Concise and to-the-point. Be brief and efficient. Get straight to the solution.`,
  };
}

/**
 * Fallback replies when AI is unavailable
 */
export function getFallbackReplies() {
  return {
    suggestions: [
      {
        id: 1,
        style: 'Professional',
        reply: 'Thank you for reaching out to FinalApps support. I\'ve reviewed your inquiry and I\'m here to help. Could you please provide more details about your specific situation so I can assist you better?',
        badge: 'default',
      },
      {
        id: 2,
        style: 'Friendly',
        reply: 'Hey there! Thanks for getting in touch with us. I\'d love to help you out with this. Can you share a bit more info about what you\'re experiencing?',
        badge: 'success',
      },
      {
        id: 3,
        style: 'Concise',
        reply: 'Thanks for contacting support. Please provide more details so I can assist you effectively.',
        badge: 'outline',
      },
    ],
    context: {
      knowledgeArticles: 0,
      app: null,
      templates: 0,
    },
  };
}
