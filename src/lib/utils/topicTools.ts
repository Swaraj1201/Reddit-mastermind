/**
 * Topic Tools - Cleaning, Simplifying, and Formatting Topics
 */

// ====================================================================
// PART 2: Topic Cleaning Function
// ====================================================================
/**
 * Cleans topic formatting - normalizes commas, spacing, and formatting
 * Fixes issues like "fitness , health" → "fitness & health"
 * Also replaces specific awkward phrases with better alternatives
 */
export function cleanTopic(topic: string): string {
  let cleaned = topic
    .replace(/\s*,\s*/g, ', ')    // normalize comma spacing
    .replace(/, /g, ' & ')        // convert "," into " & "
    .replace(/\s+/g, ' ')         // collapse double spaces
    .trim();
  
  // Replace specific awkward phrases
  cleaned = cleaned.replace(/how to get better at (.+)/gi, (match, theme) => `improving my ${theme}`);
  cleaned = cleaned.replace(/struggles people face with (.+)/gi, (match, theme) => `common challenges in ${theme}`);
  
  return cleaned;
}

// ====================================================================
// PART 2: Topic Simplification
// ====================================================================
/**
 * Simplifies multi-word topics for conversational use
 * Prevents awkward repetition and makes topics flow naturally in sentences
 */
export function simplifyTopic(topic: string): string {
  const lower = topic.toLowerCase();

  // Specific phrase mappings
  if (lower.includes('best practices')) return 'improving over time';
  if (lower.includes('advice for newcomers')) return 'getting started';
  if (lower.includes('struggles people face')) return 'common challenges';
  if (lower.includes('tips on')) return 'making progress';
  if (lower.includes('fitness') && lower.includes('health')) return 'building healthier habits';
  if (lower.includes('how to get better')) return 'making progress'; // Avoid "improve at getting better"
  if (lower.includes('common mistakes')) return 'avoiding mistakes';
  if (lower.includes('what people overlook')) return 'common blind spots';

  // Fallback: remove leading phrases
  let simplified = topic
    .replace(/^(tips on|advice for|best practices for|struggles people face with|how to get better at|common mistakes in|what people overlook about)\s+/i, '')
    .trim();
  
  // Ensure "getting better" becomes "making progress" to avoid awkward phrases
  if (simplified.toLowerCase() === 'getting better') {
    simplified = 'making progress';
  }
  
  return simplified;
}

// ====================================================================
// PART 2: Topic Injection Helper
// ====================================================================
/**
 * Ensures smooth insertion of topic into a sentence template
 * Replaces {{topic}} placeholder with the simplified topic
 */
export function injectTopic(template: string, topic: string): string {
  const simplified = simplifyTopic(topic);
  return template.replace(/{{topic}}/g, simplified);
}

