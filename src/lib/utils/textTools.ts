/**
 * Text Tools - Grammar Polishing and Text Smoothing
 */

// ====================================================================
// PART 4: Pick Functions
// ====================================================================
/**
 * Returns a random element from an array
 */
export function pick<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('Cannot pick from empty array');
  return arr[Math.floor(Math.random() * arr.length)];
}

// ====================================================================
// FIX 3: Topic Repetition Replacement
// ====================================================================
/**
 * Replaces topic repetition with pronouns - keeps first occurrence, replaces others
 */
export function replaceTopicRepetition(text: string, topic: string): string {
  if (!text || !topic) return text;
  
  // Create regex pattern for the topic (case insensitive, word boundaries)
  const topicWords = topic.trim().split(/\s+/);
  const topicPattern = new RegExp(`\\b${topicWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')}\\b`, 'gi');
  
  // Find all matches
  const matches = [...text.matchAll(topicPattern)];
  
  // If less than 2 matches, no repetition to fix
  if (matches.length < 2) return text;
  
  // Keep first match, replace others with pronouns
  const pronouns = [
    'this',
    'these challenges',
    'this issue',
    'what I\'m dealing with',
    'this part of it',
    'this whole thing',
    'that',
    'these',
  ];
  
  let result = text;
  let replacementCount = 0;
  
  // Replace all occurrences after the first
  result = result.replace(topicPattern, (match, offset) => {
    // Find which occurrence this is
    const beforeText = text.substring(0, offset);
    const occurrenceIndex = (beforeText.match(topicPattern) || []).length;
    
    // Keep first, replace others
    if (occurrenceIndex === 0) {
      return match;
    }
    
    replacementCount++;
    const pronoun = pick(pronouns);
    return pronoun;
  });
  
  return result;
}

// ====================================================================
// PART 4: Text Smoothing Function
// ====================================================================
/**
 * Smooths and polishes text output
 * - Trims whitespace
 * - Collapses multiple spaces
 * - Fixes punctuation spacing
 * - Ensures sentence starts capitalized
 * - Removes repeated words
 * - Removes awkward transitions
 */
export function smoothText(str: string): string {
  if (!str) return '';
  
  let smoothed = str
    .trim()                           // Trim whitespace
    .replace(/\s+/g, ' ')            // Collapse multiple spaces
    .replace(/\s+([.,!?;:])/g, '$1') // Fix punctuation spacing (remove space before punctuation)
    .replace(/([.,!?;:])\s*/g, '$1 ') // Ensure space after punctuation
    .replace(/\s+/g, ' ')            // Collapse again after punctuation fixes
    .trim();
  
  // Remove repeated words (simple check for consecutive duplicate words)
  // But be careful with phrases like "I I" or "a a"
  smoothed = smoothed.replace(/\b(\w+)\s+\1\b/gi, '$1');
  
  // Handle phrases that might repeat due to topic injection (up to 5 words)
  // e.g., "with getting started getting started" -> "with getting started"
  for (let len = 5; len >= 1; len--) {
    const pattern = `\\b((?:\\w+\\s+){${len - 1}}\\w+)\\s+\\1\\b`;
    smoothed = smoothed.replace(new RegExp(pattern, 'gi'), '$1');
  }
  
  // Fix awkward repetitions with prepositions: "with X with X" -> "with X"
  smoothed = smoothed.replace(/\b(with|for|at|on|about|around|of|in)\s+(\w+(?:\s+\w+){0,5})\s+\1\s+\2\b/gi, '$1 $2');
  
  // Remove awkward phrase combinations like "What I'm learning is that What really helped"
  smoothed = smoothed.replace(/\b(what|that|how|when|where)\s+[^.]{0,30}\s+(?:is|was|are|were)\s+(?:that\s+)?(what|that|how)\s+/gi, (match, start, end) => {
    // Remove the redundant second "what/that/how"
    return match.replace(new RegExp(`\\s+(?:that\\s+)?${end}\\s+`, 'i'), ' ');
  });
  
  // Remove redundant "I found that" / "I learned that" combinations
  smoothed = smoothed.replace(/\bI (?:found|learned|realized|discovered) (?:that )?I (?:found|learned|realized|discovered)/gi, 'I found');
  smoothed = smoothed.replace(/\bwhat (?:I|you|we) (?:found|learned|realized|discovered) (?:that )?is (?:that )?(what|I found)/gi, 'what I found is ');
  
  // Fix "What I'm learning is that What..." patterns
  smoothed = smoothed.replace(/\b(What|That|How)\s+\w+(?:\s+\w+){0,5}\s+is\s+(?:that\s+)?(What|That|How)\s+/gi, '$1 I\'m learning is ');
  
  // FIX 1: Fix unnatural phrase "What I'm finding is I'm working on works best..."
  smoothed = smoothed.replace(/what I'm finding is I'm working on works best/gi,
                    "what I'm finding is the system I'm using works best");
  smoothed = smoothed.replace(/what I'm working on works best/gi,
                    "the system I'm using works best");
  
  // FIX 3: Reduce repetitive phrase "what I've been dealing with"
  const dealingWithVariants = [
    "what I'm working through",
    "what's been on my plate",
    "what I'm trying to figure out",
    "the stuff I'm sorting out"
  ];
  smoothed = smoothed.replace(/what I've been dealing with/gi, () => {
    return dealingWithVariants[Math.floor(Math.random() * dealingWithVariants.length)];
  });
  
  // FIX 2: Reduce repetition of "the part I struggle with"
  const struggleVariants = [
    "the thing that gets in my way",
    "the habit I keep slipping on",
    "the part that trips me up",
    "what I'm still figuring out"
  ];
  smoothed = smoothed.replace(/the part I struggle with/gi, () => {
    return struggleVariants[Math.floor(Math.random() * struggleVariants.length)];
  });
  
  // Remove awkward transitions
  smoothed = smoothed.replace(/\bbut but\b/gi, 'but');
  smoothed = smoothed.replace(/\band and\b/gi, 'and');
  smoothed = smoothed.replace(/\bso so\b/gi, 'so');
  smoothed = smoothed.replace(/\bhowever however\b/gi, 'however');
  
  // FIX 5: Strengthen intro smoothing
  smoothed = smoothed.replace(/—\s*—/g, '—');
  smoothed = smoothed.replace(/,+\s*,/g, ',');
  
  // Remove duplicate punctuation
  smoothed = smoothed.replace(/\.\.+/g, '.');
  smoothed = smoothed.replace(/\?\!+/g, '?');
  smoothed = smoothed.replace(/\!\?+/g, '!');
  
  // Ensure first letter is capitalized
  if (smoothed.length > 0) {
    smoothed = smoothed.charAt(0).toUpperCase() + smoothed.slice(1);
  }
  
  // Fix spacing around em dashes
  smoothed = smoothed.replace(/\s*—\s*/g, ' — ');
  smoothed = smoothed.replace(/\s{2,}/g, ' '); // Final space collapse
  
  return smoothed.trim();
}

// ====================================================================
// FIX 1: Replace Generic Fillers
// ====================================================================
/**
 * Replaces "this part of it" with varied natural alternatives
 */
export function replaceGenericFillers(text: string): string {
  const variants = [
    'this',
    'this issue',
    'this challenge',
    'what I\'m working on',
    'my routine',
    'the habit I\'m building',
    'the part that trips me up',
    'this goal',
    'what I\'m dealing with',
    'this area I\'m trying to improve',
  ];
  
  return text.replace(/this part of it/gi, () => {
    return pick(variants);
  });
}

// ====================================================================
// FINAL POLISH FIX 1: Remove Duplicate Sentences
// ====================================================================
/**
 * Removes duplicate sentences from posts and comments
 */
export function removeDuplicateSentences(text: string): string {
  if (!text || text.trim().length === 0) return text;
  
  const parts = text.split(/(?<=[.!?])\s+/);
  const filtered: string[] = [];
  let last = '';
  
  for (const p of parts) {
    const trimmed = p.trim();
    if (trimmed && trimmed.toLowerCase() !== last.toLowerCase()) {
      filtered.push(trimmed);
      last = trimmed;
    }
  }
  
  return filtered.join(' ');
}

// ====================================================================
// FIX 5: Enhanced Grammar Polishing Engine with Punctuation Fixes
// ====================================================================
/**
 * Advanced grammar polishing - fixes verb agreement, plural issues, awkward phrasing, and punctuation
 */
export function polishGrammar(text: string): string {
  if (!text) return '';
  
  let polished = text;
  
  // FIX 1: Intro de-duplication - remove repeated persona intros
  polished = polished.replace(/(\b[A-Z][a-z]+ —\s*)\1+/g, '$1');
  polished = polished.replace(/(\b[A-Za-z]+,?\s*—\s*)\1+/gi, '$1');
  
  // FIX 2: Bad determiners correction
  polished = polished
    .replace(/this these/gi, 'these')
    .replace(/that this/gi, 'that')
    .replace(/this this/gi, 'this');
  
  // FIX 3: Remove sentence fragments caused by empty intros (floating periods)
  polished = polished
    .replace(/^\s*\.\s*/g, '')
    .replace(/\s+\.\s+/g, '. ');
  
  // FIX 6: Punctuation correction (ensure complete)
  polished = polished
    .replace(/—\./g, '—')           // Remove period after em dash
    .replace(/\.{2,}/g, '.')        // Multiple periods -> single period
    .replace(/—{2,}/g, '—')         // Multiple em dashes -> single
    .replace(/\s+([.,!?])/g, match => match.trim()) // Remove space before punctuation
    .replace(/!+/g, '!')            // Multiple exclamation marks -> single
    .replace(/\?+/g, '?')           // Multiple question marks -> single
    .replace(/\.\s+\./g, '.')       // Period space period -> period
    .replace(/\s+—/g, ' —')         // Ensure space before em dash
    .replace(/—\s+/g, ' — ');       // Ensure space after em dash
  
  // FIX 2: Grammar + verb agreement corrections
  // Fix plural/singular verb issues
  polished = polished.replace(/challenges? (I'm|I am) facing (in|with) [^ ]+ has /gi, 'the challenges I\'m facing have ');
  polished = polished.replace(/challenges? (seems|seem) harder/gi, 'these challenges seem harder');
  
  // Fix "mistakes people make in my workload"
  polished = polished.replace(/mistakes people make in my workload/gi, 'mistakes people make when managing their workload');
  
  // Fix "mistakes people make in productivity that lasts"
  polished = polished.replace(/mistakes people make in productivity that lasts/gi, 'mistakes people make when trying to stay productive');
  
  // Fix verb agreement with plural subjects
  // "blind spots seems" -> "blind spots seem"
  polished = polished.replace(/\b(spots|points|things|items|elements|aspects|factors|challenges|issues|problems)\s+(seems|is|was)\b/gi, '$1 seem');
  polished = polished.replace(/\b(spots|points|things|items|elements|aspects|factors|challenges|issues|problems)\s+are\s+(seems|is|was)\b/gi, '$1 are');
  
  // Fix verb agreement: "X seems they" -> "X seem they"
  polished = polished.replace(/\b(\w+(?:s|es))\s+seems\s+they\b/gi, '$1 seem they');
  
  // Remove repeated words/phrases (more aggressive than smoothText)
  polished = polished.replace(/\b(\w+)\s+\1\b/gi, '$1');
  
  // Fix awkward time repetition: "improving over time time" -> "improving over time"
  polished = polished.replace(/\b(time|day|week|month|year)\s+\1\b/gi, '$1');
  
  // Fix "common blind spots seems" -> "common blind spots seem"
  polished = polished.replace(/\b(common|certain|many|some|various|different)\s+(\w+(?:s|es))\s+(seems|is|was)\b/gi, '$1 $2 seem');
  
  // Ensure each sentence ends with punctuation
  if (!/[.!?]$/.test(polished.trim())) {
    polished = polished.trim() + '.';
  }
  
  // Capitalize first character of every sentence
  polished = polished.replace(/(^|\.\s+|!\s+|\?\s+)([a-z])/g, (match, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });
  
  // Fix spacing issues after capitalization
  polished = polished.replace(/\s+/g, ' ').trim();
  
  // Fix double spaces after punctuation
  polished = polished.replace(/([.!?])\s{2,}/g, '$1 ');
  
  // Remove awkward "that that" -> "that"
  polished = polished.replace(/\bthat that\b/gi, 'that');
  
  // Fix "it it" -> "it"
  polished = polished.replace(/\bit it\b/gi, 'it');
  
  // Fix "a a" or "an an" -> "a" or "an"
  polished = polished.replace(/\b(a|an)\s+\1\b/gi, '$1');
  
  // Ensure proper spacing around punctuation
  polished = polished.replace(/\s+([.,!?;:])/g, '$1');
  polished = polished.replace(/([.,!?;:])([^\s])/g, '$1 $2');
  
  // Final check: ensure all sentences end properly
  polished = polished.replace(/([.!?])\s*([a-z])/g, '$1 $2');
  
  return polished.trim();
}

/**
 * Weighted random selection
 * Weights don't need to include all possible values
 */
export function pickWeighted<T extends string>(
  weights: Partial<Record<T, number>>
): T {
  const items = Object.keys(weights) as T[];
  const total = items.reduce((sum, item) => sum + (weights[item] || 0), 0);
  let random = Math.random() * total;
  
  for (const item of items) {
    random -= weights[item] || 0;
    if (random <= 0) {
      return item;
    }
  }
  
  return items[items.length - 1];
}

// ====================================================================
// FIX 3: Remove Unnatural Filler Phrases (alias for replaceGenericFillers)
// ====================================================================
/**
 * Removes unnatural filler phrases like "this part of it"
 * Alias for replaceGenericFillers to match naming convention
 */
export function removeFillerPhrases(text: string): string {
  return replaceGenericFillers(text);
}

// ====================================================================
// FIX 8: Human Rewrite Pass (Final Smoothing)
// ====================================================================
/**
 * Final human rewrite pass for natural, conversational tone
 */
export function humanSmooth(text: string): string {
  return text
    .replace(/the challenges I'm facing in handling my workload has/gi,
             'the challenges I\'m facing in handling my workload have')
    .replace(/avoids mistakes people make/gi,
             'mistakes people often make')
    .replace(/what work for you guys/gi,
             'what works for you?')
    .replace(/I keep running into the same mistakes repeatedly/gi,
             'I keep running into the same mistakes over and over')
    .replace(/common blind spots seem that/gi,
             'common blind spots is that')
    .replace(/common blind spots are that/gi,
             'common blind spots is that')
    .replace(/what I've learned about (getting started|improving) am that/gi,
             'what I\'ve learned about $1 is that')
    .replace(/Focus come easier/gi,
             'Focus comes easier')
    .replace(/would appreciate hearing what work for me is/gi,
             'would appreciate hearing what works for you')
    .replace(/Would loves to hear/gi,
             'Would love to hear');
}
