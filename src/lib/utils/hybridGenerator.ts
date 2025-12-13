import type { Persona, CompanyInfo } from '@/lib/models/types';
import { cleanTopic, simplifyTopic, injectTopic } from './topicTools';
import { getPersonaTone, getStylePrefix, pickStyleMode, type StyleMode } from './personaTone';
import { pick, pickUnique, smoothText, polishGrammar, pickWeighted } from './textTools';
import { applyPattern, postPatterns, commentPatterns, shortPatterns, type PatternTokens } from './postPatterns';

// Import seed libraries
import introSeeds from '@/lib/ai/seeds/introSeeds.json';
import reflectionSeeds from '@/lib/ai/seeds/reflectionSeeds.json';
import struggleSeeds from '@/lib/ai/seeds/struggleSeeds.json';
import adviceSeeds from '@/lib/ai/seeds/adviceSeeds.json';
import closingSeeds from '@/lib/ai/seeds/closingSeeds.json';
import shortReplySeeds from '@/lib/ai/seeds/shortReplySeeds.json';
import affirmationSeeds from '@/lib/ai/seeds/affirmationSeeds.json';
import humorSeeds from '@/lib/ai/seeds/humorSeeds.json';

// ====================================================================
// PART 7: Week-Level Anti-Repetition System
// ====================================================================
interface WeekSeedHistory {
  intros: string[];
  reflections: string[];
  struggles: string[];
  advice: string[];
  closings: string[];
  shortReplies: string[];
  affirmations: string[];
  humor: string[];
  patterns: string[];
  styles: StyleMode[];
}

let weekSeedHistory: WeekSeedHistory = {
  intros: [],
  reflections: [],
  struggles: [],
  advice: [],
  closings: [],
  shortReplies: [],
  affirmations: [],
  humor: [],
  patterns: [],
  styles: [],
};

/**
 * Resets week-level seed history (call at start of new week generation)
 */
export function resetWeekHistory(): void {
  weekSeedHistory = {
    intros: [],
    reflections: [],
    struggles: [],
    advice: [],
    closings: [],
    shortReplies: [],
    affirmations: [],
    humor: [],
    patterns: [],
    styles: [],
  };
}

/**
 * Picks a seed avoiding the last 2 used values from week history
 */
function pickWeekUnique<T>(arr: T[], history: T[]): T {
  if (arr.length === 0) throw new Error('Cannot pick from empty array');
  if (arr.length === 1) return arr[0];
  
  // Get last 2 used values
  const lastTwo = history.slice(-2);
  
  // Filter out last two if present
  const filtered = arr.filter(item => !lastTwo.includes(item));
  
  // If filtered is empty or too small, allow repeats but prefer variety
  if (filtered.length === 0) {
    return pick(arr);
  }
  
  const selected = pick(filtered);
  
  // Add to history (keep last 10 to avoid recent repeats)
  history.push(selected);
  if (history.length > 10) {
    history.shift();
  }
  
  return selected;
}

/**
 * Capitalizes the first letter of company value proposition
 */
function capitalizeValueProp(valueProp: string): string {
  return valueProp.charAt(0).toUpperCase() + valueProp.slice(1);
}

// ====================================================================
// PART 2: Length Modes
// ====================================================================
type LengthMode = 'short' | 'medium' | 'long';

/**
 * Picks a length mode with weighted probability
 */
function pickLengthMode(): LengthMode {
  return pickWeighted<LengthMode>({
    short: 0.25,
    medium: 0.50,
    long: 0.25,
  });
}

// ====================================================================
// PART 5: Company Mention Throttling
// ====================================================================
const COMPANY_MENTION_PROBABILITY = 0.2; // 20% chance

/**
 * Determines if company should be mentioned in this generation
 */
function shouldMentionCompany(): boolean {
  return Math.random() < COMPANY_MENTION_PROBABILITY;
}

// ====================================================================
// PART 5: Hybrid Post Generation (Ultra-Realistic)
// ====================================================================
/**
 * Generates a natural-sounding Reddit post using hybrid AI simulation
 * Supports length modes, style modes, and week-level anti-repetition
 */
export function generateHybridPost(
  persona: Persona,
  topic: string,
  company: CompanyInfo
): string {
  // Clean and simplify topic
  const topicClean = cleanTopic(topic);
  const topicSimple = simplifyTopic(topicClean);
  
  // Pick length mode
  const lengthMode = pickLengthMode();
  
  // Pick style mode (for additional flavor)
  const styleMode = pickWeekUnique(
    ['analytical', 'introspective', 'motivational', 'casual'] as StyleMode[],
    weekSeedHistory.styles
  );
  
  // Get persona tone and style prefix
  const tonePrefix = getPersonaTone(persona);
  const stylePrefix = getStylePrefix(styleMode);
  
  // PART 2: Short posts
  if (lengthMode === 'short') {
    const shortReply = pickWeekUnique(shortReplySeeds, weekSeedHistory.shortReplies);
    const closing = pickWeekUnique(closingSeeds, weekSeedHistory.closings);
    
    // Sometimes add humor to short posts
    const useHumor = Math.random() < 0.3;
    const humor = useHumor ? pickWeekUnique(humorSeeds, weekSeedHistory.humor) : '';
    
    const tokens: PatternTokens = {
      intro: tonePrefix,
      shortReply,
      closing: useHumor ? '' : closing,
      humor: useHumor ? humor : '',
      reflection: '',
      struggle: '',
      advice: '',
    };
    
    const pattern = pick(shortPatterns);
    let result = applyPattern(pattern, tokens);
    
    // Apply text processing
    result = smoothText(result);
    result = polishGrammar(result);
    
    return result;
  }
  
  // PART 6: Pick seeds with week-level anti-repetition
  const introSeed = pickWeekUnique(introSeeds, weekSeedHistory.intros);
  const reflectionSeed = pickWeekUnique(reflectionSeeds, weekSeedHistory.reflections);
  const struggleSeed = pickWeekUnique(struggleSeeds, weekSeedHistory.struggles);
  const adviceSeed = pickWeekUnique(adviceSeeds, weekSeedHistory.advice);
  const closingSeed = pickWeekUnique(closingSeeds, weekSeedHistory.closings);
  
  // Inject topics into seeds
  const reflection = injectTopic(reflectionSeed, topicSimple);
  const struggle = injectTopic(struggleSeed, topicSimple);
  
  // PART 5: Company mention throttling
  let advice: string;
  if (shouldMentionCompany()) {
    const companyValue = capitalizeValueProp(company.valueProp);
    advice = injectTopic(adviceSeed, topicSimple).replace(
      /(worked|helped|key|difference|breakthrough|game changer)/i,
      (match) => {
        return `${match} was focusing on tools that ${companyValue}`;
      }
    );
    // Fallback if no match
    if (advice === injectTopic(adviceSeed, topicSimple)) {
      advice = `What worked for me was focusing on ${companyValue}. It didn't solve everything, but it helped.`;
    }
  } else {
    advice = injectTopic(adviceSeed, topicSimple);
  }
  
  // PART 3: Select pattern based on length mode
  let pattern: string;
  if (lengthMode === 'medium') {
    // Medium: 2-3 sentences
    const mediumPatterns = [
      '{intro} {reflection}. {closing}',
      '{intro} {struggle}. {closing}',
      '{intro} {advice}. {closing}',
      '{intro} {reflection}. {struggle}. {closing}',
    ];
    pattern = pickWeekUnique(mediumPatterns, weekSeedHistory.patterns);
  } else {
    // Long: full pattern
    pattern = pickWeekUnique(postPatterns, weekSeedHistory.patterns);
  }
  
  // PART 4: Apply style prefix (optional enhancement)
  const useStylePrefix = Math.random() < 0.4; // 40% chance
  const finalIntro = useStylePrefix ? `${stylePrefix} ${tonePrefix}` : tonePrefix;
  
  // Build tokens
  const tokens: PatternTokens = {
    intro: finalIntro,
    reflection,
    struggle,
    advice,
    closing: closingSeed,
  };
  
  // Apply pattern
  let result = applyPattern(pattern, tokens);
  
  // PART 8: Final assembly with polish
  result = smoothText(result);
  result = polishGrammar(result);
  
  return result;
}

// ====================================================================
// PART 5: Hybrid Comment Generation (Ultra-Realistic)
// ====================================================================
/**
 * Generates a natural-sounding Reddit comment using hybrid AI simulation
 * More concise than posts, with company mention throttling
 */
export function generateHybridComment(
  persona: Persona,
  topic: string,
  company: CompanyInfo
): string {
  // Clean and simplify topic
  const topicClean = cleanTopic(topic);
  const topicSimple = simplifyTopic(topicClean);
  
  // Comments can also vary in length (but shorter on average)
  const lengthMode = pickWeighted<LengthMode>({
    short: 0.40,  // Higher chance of short comments
    medium: 0.50,
    long: 0.10,
  });
  
  // Get persona tone
  const tonePrefix = getPersonaTone(persona);
  
  // PART 6: Pick seeds with week-level anti-repetition
  const struggleSeed = pickWeekUnique(struggleSeeds, weekSeedHistory.struggles);
  const adviceSeed = pickWeekUnique(adviceSeeds, weekSeedHistory.advice);
  const closingSeed = pickWeekUnique(closingSeeds, weekSeedHistory.closings);
  
  // Inject topics
  const struggle = injectTopic(struggleSeed, topicSimple);
  
  // PART 5: Company mention throttling (20% chance)
  let advice: string;
  if (shouldMentionCompany()) {
    const companyValue = capitalizeValueProp(company.valueProp);
    advice = `What worked for me was focusing on ${companyValue}. It didn't solve everything, but it helped.`;
  } else {
    advice = injectTopic(adviceSeed, topicSimple);
  }
  
  // PART 2: Short comments
  if (lengthMode === 'short') {
    const shortReply = pickWeekUnique(shortReplySeeds, weekSeedHistory.shortReplies);
    const affirmation = Math.random() < 0.5 
      ? pickWeekUnique(affirmationSeeds, weekSeedHistory.affirmations)
      : '';
    
    const tokens: PatternTokens = {
      intro: tonePrefix,
      shortReply,
      affirmation,
      struggle: '',
      advice: affirmation ? '' : advice,
      closing: '',
      reflection: '',
    };
    
    const shortCommentPatterns = [
      '{intro} {shortReply}',
      '{intro} {shortReply} {affirmation}',
      '{intro} {shortReply} {advice}',
    ];
    
    const pattern = pick(shortCommentPatterns);
    let result = applyPattern(pattern, tokens);
    
    result = smoothText(result);
    result = polishGrammar(result);
    
    return result;
  }
  
  // Medium/Long comments
  const affirmation = Math.random() < 0.3 
    ? pickWeekUnique(affirmationSeeds, weekSeedHistory.affirmations)
    : '';
  
  // Select comment pattern
  let pattern: string;
  if (lengthMode === 'medium') {
    const mediumCommentPatterns = [
      '{intro} {struggle}. {advice}.',
      '{intro} I\'ve been there. {struggle}. {advice}.',
      '{intro} {struggle}. {closing}',
      '{intro} {affirmation}. {advice}.',
    ];
    pattern = pick(mediumCommentPatterns);
  } else {
    pattern = pickWeekUnique(commentPatterns, weekSeedHistory.patterns);
  }
  
  // Build tokens
  const tokens: PatternTokens = {
    intro: tonePrefix,
    struggle,
    advice,
    closing: closingSeed,
    affirmation,
    reflection: '', // Not used in comments, but may be in some patterns
  };
  
  // Apply pattern
  let result = applyPattern(pattern, tokens);
  
  // PART 8: Final assembly with polish
  result = smoothText(result);
  result = polishGrammar(result);
  
  return result;
}
