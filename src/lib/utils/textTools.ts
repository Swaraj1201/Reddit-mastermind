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

/**
 * Picks a unique element, avoiding the last used value
 * Ensures variety in consecutive selections
 */
export function pickUnique<T>(arr: T[], lastValue: T | null): T {
  if (arr.length === 0) throw new Error('Cannot pick from empty array');
  if (arr.length === 1) return arr[0];
  
  // Filter out last value if present
  const filtered = lastValue !== null ? arr.filter(item => item !== lastValue) : arr;
  
  // If filtered array is empty (shouldn't happen), return any element
  if (filtered.length === 0) return pick(arr);
  
  return pick(filtered);
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
  
  // Remove awkward transitions
  smoothed = smoothed.replace(/\bbut but\b/gi, 'but');
  smoothed = smoothed.replace(/\band and\b/gi, 'and');
  smoothed = smoothed.replace(/\bso so\b/gi, 'so');
  smoothed = smoothed.replace(/\bhowever however\b/gi, 'however');
  
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
  smoothed = smoothed.replace(/\s+/g, ' '); // Final space collapse
  
  return smoothed.trim();
}

// ====================================================================
// PART 6: Grammar Polishing Engine
// ====================================================================
/**
 * Advanced grammar polishing - fixes verb agreement, plural issues, and awkward phrasing
 */
export function polishGrammar(text: string): string {
  if (!text) return '';
  
  let polished = text;
  
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
  
  return polished.trim();
}

/**
 * Weighted random selection
 */
export function pickWeighted<T extends string>(
  weights: Record<T, number>
): T {
  const items = Object.keys(weights) as T[];
  const total = items.reduce((sum, item) => sum + weights[item], 0);
  let random = Math.random() * total;
  
  for (const item of items) {
    random -= weights[item];
    if (random <= 0) {
      return item;
    }
  }
  
  return items[items.length - 1];
}

