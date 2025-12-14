import type { Persona, CompanyInfo } from '@/lib/models/types';
import { cleanTopic, simplifyTopic, injectTopic, topicSimplify, fixImprovingMyPhrases, rewriteTopicKeywords, rewriteDualThemes } from './topicTools';
import { getPersonaTone, getStylePrefix, type StyleMode } from './personaTone';
import { pick, smoothText, polishGrammar, pickWeighted, replaceTopicRepetition, removeFillerPhrases, humanSmooth, removeDuplicateSentences } from './textTools';
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
  lastLengthMode: LengthMode | null;
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
  lastLengthMode: null,
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
    lastLengthMode: null,
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

// ====================================================================
// FIX 4: Better Length Mode Selection Rules
// ====================================================================
type LengthMode = 'short' | 'medium' | 'long';

/**
 * Checks if topic is complex (requires medium/long posts)
 */
function isTopicComplex(topic: string): boolean {
  const lower = topic.toLowerCase();
  return lower.includes('best practices') ||
         lower.includes('common challenges') ||
         lower.includes('common mistakes') ||
         lower.includes('tips on') ||
         lower.includes('improving my');
}

/**
 * Picks a length mode with smart rules based on topic complexity
 * FIX 5: Refined length mode selection with proper weights
 */
function pickLengthMode(topic: string): LengthMode {
  const isComplex = isTopicComplex(topic);
  
  // FIX 5: Complex topics use medium/long distribution
  if (isComplex) {
    const mode = pickWeighted<LengthMode>({
      medium: 0.55,
      long: 0.35,
    });
    weekSeedHistory.lastLengthMode = mode;
    return mode;
  }
  
  // FIX 5: Don't allow two short posts in a row
  if (weekSeedHistory.lastLengthMode === 'short') {
    const mode = pickWeighted<LengthMode>({
      medium: 0.60,
      long: 0.40,
    });
    weekSeedHistory.lastLengthMode = mode;
    return mode;
  }
  
  // FIX 5: Normal distribution with refined weights
  const mode = pickWeighted<LengthMode>({
    short: 0.10,
    medium: 0.55,
    long: 0.35,
  });
  weekSeedHistory.lastLengthMode = mode;
  return mode;
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
// FIX 6: Natural Phrase Insertion Rules
// ====================================================================
type TopicRefMode = 'direct' | 'implied' | 'pronoun';

/**
 * Gets topic reference based on mode
 */
function getTopicReference(topic: string, mode: TopicRefMode): string {
  if (mode === 'direct') {
    return topicSimplify(topic);
  }
  
  if (mode === 'implied') {
    const impliedRefs = [
      'this situation',
      'the part I struggle with',
      'my biggest hurdle',
      'what I\'ve been dealing with',
      'this whole thing',
      'what I\'m working on',
    ];
    return pick(impliedRefs);
  }
  
  // pronoun mode
  const pronouns = [
    'this',
    'these challenges',
    'this issue',
    'what I\'m dealing with',
    'this part of it',
  ];
  return pick(pronouns);
}

/**
 * Randomly picks topic reference mode
 */
function pickTopicRefMode(): TopicRefMode {
  return pick(['direct', 'implied', 'pronoun'] as TopicRefMode[]);
}

// ====================================================================
// PART 5: Hybrid Post Generation (Full Seed-Based System)
// ====================================================================
/**
 * Generates a natural-sounding Reddit post using hybrid seed-based generation
 * FIX 7: Tracks last intro to prevent repetition
 */
let lastIntro = '';
let lastComment = '';

/**
 * Generates a natural-sounding Reddit post
 */
export function generateHybridPost(
  persona: Persona,
  topic: string,
  company: CompanyInfo
): string {
  // Clean and simplify topic
  const topicClean = cleanTopic(topic);
  let topicSimple = topicSimplify(topicClean);
  
  // FIX 1: Rewrite dual themes into conversational English
  topicSimple = rewriteDualThemes(topicSimple);
  
  // Apply grammar fixes to topic
  topicSimple = rewriteTopicKeywords(
    fixImprovingMyPhrases(topicSimple)
  );
  
  // FIX 5: Pick length mode with refined rules
  const lengthMode = pickLengthMode(topicClean);
  
  // Pick style mode (for additional flavor)
  const styleMode = pickWeekUnique(
    ['analytical', 'introspective', 'motivational', 'casual'] as StyleMode[],
    weekSeedHistory.styles
  );
  
  // PART 6: Pick seeds with week-level anti-repetition and FIX 7 (prevent duplicate intros)
  let introSeed: string;
  do {
    introSeed = pickWeekUnique(introSeeds, weekSeedHistory.intros);
  } while (introSeed === lastIntro && introSeeds.length > 1);
  lastIntro = introSeed;
  
  const reflectionSeed = pickWeekUnique(reflectionSeeds, weekSeedHistory.reflections);
  const struggleSeed = pickWeekUnique(struggleSeeds, weekSeedHistory.struggles);
  const adviceSeed = pickWeekUnique(adviceSeeds, weekSeedHistory.advice);
  const closingSeed = pickWeekUnique(closingSeeds, weekSeedHistory.closings);
  
  // Get persona tone and style prefix
  const tonePrefix = getPersonaTone(persona);
  const stylePrefix = getStylePrefix(styleMode);
  
  // FIX 5: Only add persona intro 25% of the time to prevent repetitive intros
  const usePersonaIntro = Math.random() < 0.25;
  
  // PART 2: Short posts
  if (lengthMode === 'short') {
    // FIX 5: Use more casual, Reddit-like intros for short posts
    const shortIntroSeeds = [
      'Not gonna lie —',
      'Real talk —',
      'Same here —',
      'This one hits hard —',
      'Honestly —',
      'Gonna be real —',
      'Lowkey struggling with this —',
      'Okay but actually —',
      'Hey everyone —',
      'Quick question —',
    ];
    const shortIntro = pick(shortIntroSeeds);
    
    const shortReply = pickWeekUnique(shortReplySeeds, weekSeedHistory.shortReplies);
    const closing = pickWeekUnique(closingSeeds, weekSeedHistory.closings);
    
    // Sometimes add humor to short posts
    const useHumor = Math.random() < 0.3;
    const humor = useHumor ? pickWeekUnique(humorSeeds, weekSeedHistory.humor) : '';
    
    const tokens: PatternTokens = {
      intro: shortIntro,
      shortReply,
      closing: useHumor ? '' : closing,
      humor: useHumor ? humor : '',
      reflection: '',
      struggle: '',
      advice: '',
    };
    
    const pattern = pick(shortPatterns);
    let result = applyPattern(pattern, tokens);
    
    // FIX 4: Conditionally add persona intro
    if (usePersonaIntro) {
      result = `${tonePrefix} ${result}`;
    }
    
    // FIX 9: Apply cleanup pipeline BEFORE returning
    result = simplifyTopic(result);
    result = rewriteDualThemes(result);
    result = fixImprovingMyPhrases(result);
    result = removeFillerPhrases(result);
    result = replaceTopicRepetition(result, topicSimple);
    result = polishGrammar(result);
    result = humanSmooth(result);
    result = smoothText(result);
    result = removeDuplicateSentences(result); // FIX 1: Remove duplicate sentences
    
    return result;
  }
  
  // FIX 6: Natural phrase insertion - vary how we refer to the topic
  const topicRefMode = pickTopicRefMode();
  const topicRef = getTopicReference(topicSimple, topicRefMode);
  
  // Inject topics into seeds with varied reference modes
  const reflection = injectTopic(reflectionSeed, topicRefMode === 'direct' ? topicSimple : topicRef);
  const struggle = injectTopic(struggleSeed, topicRefMode === 'direct' ? topicSimple : topicRef);
  
  // PART 5: Company mention throttling with FIX 4 - No raw company value leaks
  let advice: string;
  if (shouldMentionCompany()) {
    // FIX 4: Prevent raw company value proposition leaks - use natural, vague phrasing
    const vp = company.valueProp.toLowerCase();
    let naturalAdvice = '';
    
    if (vp.includes('tasks') || vp.includes('smart prioritization') || vp.includes('prioritization')) {
      naturalAdvice = 'Using tools that automate small decisions really helped me.';
    } else if (vp.includes('progress') || vp.includes('track')) {
      naturalAdvice = 'Tracking my progress in a simple way helped me stay consistent.';
    } else if (vp.includes('focus') || vp.includes('suggestions')) {
      naturalAdvice = 'Breaking things into simple daily focus points made a difference.';
    } else {
      // Generic natural advice
      naturalAdvice = 'Using tools that simplify the process really helped me.';
    }
    
    advice = naturalAdvice;
  } else {
    advice = injectTopic(adviceSeed, topicRef);
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
  let finalIntro = introSeed;
  
  // FIX 4: Only add persona tone 40% of the time
  if (usePersonaIntro) {
    if (useStylePrefix) {
      finalIntro = `${stylePrefix} ${tonePrefix} ${introSeed}`;
    } else {
      finalIntro = `${tonePrefix} ${introSeed}`;
    }
  }
  
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
  
  // FIX 4: Remove any raw company value proposition leaks
  if (company.valueProp) {
    result = result.replace(new RegExp(company.valueProp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
  }
  
  // FIX 9: Apply cleanup pipeline BEFORE returning
  result = simplifyTopic(result);
  result = rewriteDualThemes(result);
  result = fixImprovingMyPhrases(result);
  result = removeFillerPhrases(result);
  result = replaceTopicRepetition(result, topicSimple);
  result = polishGrammar(result);
  result = humanSmooth(result);
  result = smoothText(result);
  
  return result;
}

// ====================================================================
// FIX 7: Hybrid Comment Generation with Realism Boost
// ====================================================================
/**
 * Generates a natural-sounding Reddit comment
 * FIX 7: Comment length adapts to post length, prevents duplicate comments
 */
export function generateHybridComment(
  persona: Persona,
  topic: string,
  company: CompanyInfo,
  postLength?: LengthMode
): string {
  // FIX 4: 20% chance of no-intro natural comment
  if (Math.random() < 0.20) {
    const noIntroComments = [
      'Same here.',
      'Totally relate.',
      'Honestly, me too.',
      'Oh wow, this hit hard.',
      'Been dealing with this myself.',
      'Following this.',
      'Needed to hear this today.'
    ];
    return pick(noIntroComments);
  }
  
  // Clean and simplify topic
  const topicClean = cleanTopic(topic);
  let topicSimple = topicSimplify(topicClean);
  
  // FIX 1: Rewrite dual themes
  topicSimple = rewriteDualThemes(topicSimple);
  
  // Apply grammar fixes to topic
  topicSimple = rewriteTopicKeywords(
    fixImprovingMyPhrases(topicSimple)
  );
  
  // FIX 7: Comment length based on post length
  let lengthMode: LengthMode;
  if (postLength === 'long') {
    // Long post → medium or short comments
    lengthMode = pickWeighted<LengthMode>({
      short: 0.60,
      medium: 0.40,
    });
  } else if (postLength === 'medium') {
    // Medium post → short or medium comments
    lengthMode = pickWeighted<LengthMode>({
      short: 0.50,
      medium: 0.50,
    });
  } else if (postLength === 'short') {
    // Short post → short or humorous comments
    if (Math.random() < 0.1) {
      // 10% chance of humor mode
      const humor = pickWeekUnique(humorSeeds, weekSeedHistory.humor);
      const tonePrefix = getPersonaTone(persona);
      let result = `${tonePrefix} ${humor}`;
      result = smoothText(result);
      result = polishGrammar(result);
      return result;
    }
    lengthMode = 'short';
  } else {
    // No post length info - default distribution
    lengthMode = pickWeighted<LengthMode>({
      short: 0.40,
      medium: 0.50,
      long: 0.10,
    });
  }
  
  // Get persona tone
  const tonePrefix = getPersonaTone(persona);
  
  // FIX 3: Enhanced comment intros (with new natural options)
  const commentIntroOptions = [
    'Real talk —',
    'Honestly —',
    'Not gonna lie —',
    'Lowkey —',
    'True story —',
    'Quick thought —',
    'Hot take —',
    tonePrefix, // Include persona tone as option
  ];
  
  // FIX 7: Prevent duplicate comments
  // PART 6: Pick seeds with week-level anti-repetition
  const struggleSeed = pickWeekUnique(struggleSeeds, weekSeedHistory.struggles);
  const adviceSeed = pickWeekUnique(adviceSeeds, weekSeedHistory.advice);
  const closingSeed = pickWeekUnique(closingSeeds, weekSeedHistory.closings);
  
  // FIX 3: Only add intro 20% of the time
  const useIntro = Math.random() < 0.20;
  
  // FIX 6: Natural phrase insertion for comments
  const topicRefMode = pickTopicRefMode();
  const topicRef = getTopicReference(topicSimple, topicRefMode);
  
  // Inject topics
  const struggle = injectTopic(struggleSeed, topicRefMode === 'direct' ? topicSimple : topicRef);
  
  // PART 5: Company mention throttling (20% chance) with FIX 4 - No raw company value leaks
  let advice: string;
  if (shouldMentionCompany()) {
    // FIX 4: Prevent raw company value proposition leaks - use natural, vague phrasing
    const vp = company.valueProp.toLowerCase();
    if (vp.includes('tasks') || vp.includes('smart prioritization') || vp.includes('prioritization')) {
      advice = 'Using tools that automate small decisions really helped me.';
    } else if (vp.includes('progress') || vp.includes('track')) {
      advice = 'Tracking my progress in a simple way helped me stay consistent.';
    } else if (vp.includes('focus') || vp.includes('suggestions')) {
      advice = 'Breaking things into simple daily focus points made a difference.';
    } else {
      advice = 'Using tools that simplify the process really helped me.';
    }
  } else {
    advice = injectTopic(adviceSeed, topicRef);
  }
  
  // PART 2: Short comments
  if (lengthMode === 'short') {
    const shortReply = pickWeekUnique(shortReplySeeds, weekSeedHistory.shortReplies);
    const affirmation = Math.random() < 0.5 
      ? pickWeekUnique(affirmationSeeds, weekSeedHistory.affirmations)
      : '';
    
    let commentIntro = '';
    
    const tokens: PatternTokens = {
      intro: commentIntro,
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
    
    // FIX 7: Prevent duplicate comments
    let result: string;
    let attempts = 0;
    do {
      const pattern = pick(shortCommentPatterns);
      result = applyPattern(pattern, tokens);
      attempts++;
    } while (result === lastComment && attempts < 10);
    
    // FIX 3: Add intro only if comment >= 12 words (after cleanup)
    // FIX 4: Remove any raw company value proposition leaks
    if (company.valueProp) {
      result = result.replace(new RegExp(company.valueProp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
    }
    
    // FIX 9: Apply cleanup pipeline
    result = simplifyTopic(result);
    result = rewriteDualThemes(result);
    result = fixImprovingMyPhrases(result);
    result = removeFillerPhrases(result);
    result = polishGrammar(result);
    result = humanSmooth(result);
    result = smoothText(result);
    result = removeDuplicateSentences(result); // FIX 1: Remove duplicate sentences
    
    // FIX 3: Add intro only if comment >= 12 words and useIntro is true
    const wordCount = result.trim().split(/\s+/).length;
    if (useIntro && wordCount >= 12) {
      const selectedIntro = pick(commentIntroOptions);
      result = `${selectedIntro} ${result}`;
    }
    
    // FIX 6: Enhance short comments (< 8 words)
    const finalWordCount = result.trim().split(/\s+/).length;
    if (finalWordCount < 8) {
      // FIX 4: Ultra-short natural comment option (15% chance)
      if (finalWordCount < 10 && Math.random() < 0.15) {
        const ultraShortComments = [
          'Same.',
          'Totally relate.',
          'Oh wow, this is me.',
          'Following.',
          'Needed to hear this.',
          'Honestly — same boat.'
        ];
        result = pick(ultraShortComments);
      } else {
        const enhancers = [
          'Same here.',
          'Been dealing with this too.',
          'Following for more ideas.',
          'Would love to hear more viewpoints.',
          'Honestly, this hits home.'
        ];
        const enhancer = pick(enhancers);
        result = `${result} ${enhancer}`;
      }
    }
    
    // FIX 7: Track last comment to prevent repetition
    lastComment = result;
    
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
  let commentIntro = '';
  
  const tokens: PatternTokens = {
    intro: commentIntro,
    struggle,
    advice,
    closing: closingSeed,
    affirmation,
    reflection: '', // Not used in comments, but may be in some patterns
  };
  
  // Apply pattern
  let result = applyPattern(pattern, tokens);
  
  // FIX 4: Remove any raw company value proposition leaks
  if (company.valueProp) {
    result = result.replace(new RegExp(company.valueProp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
  }
  
  // FIX 9: Apply cleanup pipeline
  result = simplifyTopic(result);
  result = rewriteDualThemes(result);
  result = fixImprovingMyPhrases(result);
  result = removeFillerPhrases(result);
  result = replaceTopicRepetition(result, topicSimple);
  result = polishGrammar(result);
  result = humanSmooth(result);
  result = smoothText(result);
  result = removeDuplicateSentences(result); // FIX 1: Remove duplicate sentences
  
  // FIX 3: Add intro only if comment >= 12 words and useIntro is true
  const introWordCount = result.trim().split(/\s+/).length;
  if (useIntro && introWordCount >= 12) {
    const selectedIntro = pick(commentIntroOptions);
    result = `${selectedIntro} ${result}`;
  }
  
  // FIX 6: Enhance short comments (< 8 words)
  const wordCount = result.trim().split(/\s+/).length;
  if (wordCount < 8) {
    // FIX 4: Ultra-short natural comment option (15% chance)
    if (wordCount < 10 && Math.random() < 0.15) {
      const ultraShortComments = [
        'Same.',
        'Totally relate.',
        'Oh wow, this is me.',
        'Following.',
        'Needed to hear this.',
        'Honestly — same boat.'
      ];
      result = pick(ultraShortComments);
    } else {
      const enhancers = [
        'Same here.',
        'Been dealing with this too.',
        'Following for more ideas.',
        'Would love to hear more viewpoints.',
        'Honestly, this hits home.'
      ];
      const enhancer = pick(enhancers);
      result = `${result} ${enhancer}`;
    }
  }
  
  // FIX 7: Track last comment to prevent repetition
  lastComment = result;
  
  return result;
}
