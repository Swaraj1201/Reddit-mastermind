/**
 * Topic Tools - Cleaning, Simplifying, and Formatting Topics
 */

import { pick } from './textTools';

// ====================================================================
// FIX 1: Limit Themes Per Post (1-2 max)
// ====================================================================
/**
 * Randomly selects 1 or 2 themes and joins them naturally
 */
export function limitThemesToPost(themes: string[]): string {
  if (themes.length === 0) return '';
  if (themes.length === 1) return cleanTopic(themes[0]);
  
  // Randomly select 1 or 2 themes (50/50 chance)
  const count = Math.random() < 0.5 ? 1 : 2;
  const selected = shuffleArray(themes).slice(0, count);
  
  if (selected.length === 1) {
    return cleanTopic(selected[0]);
  }
  
  // Join 2 themes with natural patterns
  const patterns = [
    `${selected[0]} and ${selected[1]}`,
    `${selected[0]} while also ${selected[1]}`,
    `how people handle ${selected[0]} and ${selected[1]}`,
    `common issues around ${selected[0]} and ${selected[1]}`,
  ];
  
  const combined = pick(patterns);
  return cleanTopic(combined);
}

/**
 * Shuffles an array
 */
function shuffleArray<T>(arr: T[]): T[] {
  return arr.map(x => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(obj => obj.x);
}

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
  
  // Replace specific awkward phrases (but avoid creating "improving my {verb}ing" patterns)
  cleaned = cleaned.replace(/how to get better at (.+)/gi, (match, theme) => {
    // If theme is a verb-ing form, don't use "improving my"
    if (/\w+ing/.test(theme)) {
      return `getting better at ${theme}`;
    }
    return `improving my ${theme}`;
  });
  cleaned = cleaned.replace(/struggles people face with (.+)/gi, (match, theme) => `common challenges in ${theme}`);
  
  // FIX 8: Remove long &-joined sequences - limit to max 2 items
  const parts = cleaned.split(' & ');
  if (parts.length > 2) {
    // Take first 2 and join naturally
    cleaned = `${parts[0]} and ${parts[1]}`;
  }
  
  return cleaned;
}

// ====================================================================
// FIX 2: Topic Simplification with Conversational Rewrites
// ====================================================================
/**
 * Simplifies topics with conversational rewrites and synonyms
 * Uses random synonyms to avoid repetition
 */
export function topicSimplify(topic: string): string {
  const lower = topic.toLowerCase();
  
  // Synonym mappings with multiple options - FIX 4: Enhanced conversational forms
  const synonymMap: Record<string, string[]> = {
    'task prioritization': [
      'getting better at prioritizing tasks',
      'learning to prioritize better',
      'figuring out how to prioritize tasks'
    ],
    'sustainable productivity': [
      'trying to stay productive long-term',
      'working on keeping my productivity steady',
      'building a sustainable productivity habit'
    ],
    'improving my sustainable productivity': [
      'trying to stay productive long-term',
      'working on keeping my productivity steady',
      'building a sustainable productivity habit'
    ],
    'improving sustainable productivity': [
      'trying to stay productive long-term',
      'working on keeping my productivity steady',
      'building a sustainable productivity habit'
    ],
    'managing workload': [
      'handling my workload',
      'keeping up with everything I need to do',
      'trying to stay on top of my tasks'
    ],
    'improving focus': [
      'trying to stay focused',
      'getting better at focusing',
      'figuring out how to focus better'
    ],
    'avoiding burnout': ['preventing burnout', 'avoiding burnout', 'keeping burnout at bay'],
    'procrastination': ['putting things off', 'procrastinating', 'delaying tasks'],
    'common challenges': ['these challenges', 'typical challenges', 'the challenges'],
    'best practices': ['what usually works', 'proven approaches', 'effective methods'],
    'common mistakes': ['the mistakes we all make', 'common pitfalls', 'typical mistakes'],
  };
  
  // Check for exact matches first
  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if (lower.includes(key)) {
      const synonym = pick(synonyms);
      return topic.replace(new RegExp(key, 'gi'), synonym);
    }
  }
  
  // Then check for partial matches
  for (const [key, synonyms] of Object.entries(synonymMap)) {
    const pattern = new RegExp(key.replace(/\s+/g, '\\s+'), 'gi');
    if (pattern.test(topic)) {
      const synonym = pick(synonyms);
      return topic.replace(pattern, synonym);
    }
  }
  
  // Fallback to original simplifyTopic logic
  return simplifyTopic(topic);
}

// ====================================================================
// PART 2: Topic Simplification (Original Logic)
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
// FIX 1: Natural Rewrite for "improving my {verb-ing}"
// ====================================================================
/**
 * Fixes unnatural "improving my {verb-ing}" patterns
 */
export function fixImprovingMyPhrases(text: string): string {
  let fixed = text
    // Fix double "improving" patterns: "improving at improving" → "getting better at"
    .replace(/improving at improving/gi, 'getting better at')
    .replace(/improving my improving/gi, 'improving')
    
    // CASE 1: improving my avoiding → getting better at avoiding
    .replace(/improving my avoiding/gi, 'getting better at avoiding')
    // CASE 2: improving my preventing → getting better at preventing
    .replace(/improving my preventing/gi, 'getting better at preventing')
    // CASE 3: improving my managing → getting better at managing
    .replace(/improving my managing/gi, 'getting better at managing')
    
    // Fix "tips on improving at {verb}ing" → "tips on getting better at {verb}ing"
    .replace(/tips on improving at ([a-z]+ing)/gi, 'tips on getting better at $1')
    
    // GENERIC CASE: improving at {verb}ing → getting better at {verb}ing
    .replace(/improving at ([a-z]+ing)/gi, 'getting better at $1')
    
    // GENERIC CASE: improving my {verb}ing → working on {verb}ing (but not if it's a noun)
    .replace(/improving my (avoiding|preventing|managing|handling|focusing|prioritizing)/gi, 'getting better at $1')
    
    // For other verb-ing patterns, use "working on"
    .replace(/improving my ([a-z]+ing)/gi, 'working on $1')
    
    // Remove unnatural double-verb constructions:
    .replace(/improving my ([a-z]+) my/gi, 'improving my $1')
    
    // Fix "improving my procrastination" → "working on procrastination" or "getting better at procrastinating"
    .replace(/improving my procrastination/gi, 'working on procrastination')
    .replace(/improving my productivity/gi, 'staying productive')
    .replace(/improving my focus/gi, 'staying focused');
  
  return fixed;
}

// ====================================================================
// FIX 2: Natural Human Rewrite for Burnout, Focus, Productivity Topics
// ====================================================================
/**
 * Rewrites topic keywords to use more conversational, natural human language
 */
export function rewriteTopicKeywords(text: string): string {
  return text
    .replace(/preventing burnout/gi, 'avoiding burnout')
    .replace(/burnout prevention/gi, 'avoiding burnout')
    .replace(/improving focus/gi, 'staying focused')
    .replace(/task prioritization/gi, 'prioritizing tasks')
    .replace(/sustainable productivity/gi, 'staying productive')
    .replace(/managing workload/gi, 'handling my workload')
    .replace(/common challenges/gi, 'the challenges I\'m facing')
    .replace(/best practices/gi, 'what usually works')
    .replace(/common mistakes/gi, 'mistakes people make')
    // Additional natural rewrites
    .replace(/improving productivity/gi, 'staying productive')
    .replace(/productivity improvement/gi, 'staying productive')
    .replace(/focus improvement/gi, 'staying focused')
    .replace(/workload management/gi, 'handling my workload');
}

// ====================================================================
// FIX 1: Rewrite Dual-Theme Topics into Conversational English
// ====================================================================
/**
 * Rewrites dual-theme topics into natural conversational forms
 */
export function rewriteDualThemes(topic: string): string {
  let rewritten = topic;
  
  // If topic contains "X and Y", rewrite to natural forms
  if (rewritten.toLowerCase().includes('managing workload and avoiding burnout')) {
    rewritten = rewritten.replace(/managing workload and avoiding burnout/gi, () =>
      pick([
        'balancing workload without burning out',
        'juggling workload while preventing burnout',
        'managing my workload without hitting burnout',
        'trying to stay productive without burning out'
      ])
    );
  }
  
  // Individual theme rewrites
  rewritten = rewritten.replace(/managing workload/gi, () => pick([
    'handling my workload',
    'managing my tasks',
    'keeping up with everything I need to do'
  ]));
  
  rewritten = rewritten.replace(/avoiding burnout/gi, () => pick([
    'preventing burnout',
    'making sure I don\'t burn out',
    'trying to stay mentally fresh'
  ]));
  
  return rewritten;
}

// ====================================================================
// FIX 2: Enhanced Fix Improving Phrases (already exists, enhance it)
// ====================================================================

// ====================================================================
// PART 2: Topic Injection Helper
// ====================================================================
/**
 * Ensures smooth insertion of topic into a sentence template
 * Replaces {{topic}} placeholder with the simplified topic
 * Applies grammar fixes before injection
 */
export function injectTopic(template: string, topic: string): string {
  let simplified = topicSimplify(topic); // Use topicSimplify for better conversational rewrites
  // Apply grammar fixes
  simplified = fixImprovingMyPhrases(simplified);
  simplified = rewriteTopicKeywords(simplified);
  return template.replace(/{{topic}}/g, simplified);
}
