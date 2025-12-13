/**
 * Post Pattern Templates
 * Defines various patterns for constructing Reddit posts and comments
 */

export interface PatternTokens {
  intro: string;
  reflection?: string;
  struggle: string;
  advice: string;
  closing: string;
  shortReply?: string;
  affirmation?: string;
  humor?: string;
}

/**
 * Post patterns for medium and long posts
 */
export const postPatterns = [
  '{intro} {reflection}. {struggle}. {advice}. {closing}',
  '{intro} {reflection}. {closing}',
  '{intro} {struggle}. {closing}',
  '{intro} {advice}. {closing}',
  '{intro} {reflection}. {struggle}. {closing}',
  '{intro} {reflection}. {reflection}. {closing}',
  '{intro} {struggle}. {advice}. {closing}',
  '{intro} {reflection}. {struggle}. {advice}. {closing}',
  '{intro} {reflection}. {advice}. {advice}. {closing}',
];

/**
 * Comment patterns (more concise)
 */
export const commentPatterns = [
  '{intro} {struggle}. {advice}. {closing}',
  '{intro} I\'ve been there. {struggle}. {advice}.',
  '{intro} {struggle}. {advice}.',
  '{intro} I relate to this. {advice}. {closing}',
  '{intro} {struggle}. {advice}. {closing}',
  '{intro} {affirmation}. {advice}.',
  '{intro} {shortReply} {advice}.',
];

/**
 * Short reply patterns
 */
export const shortPatterns = [
  '{shortReply}',
  '{intro} {shortReply}',
  '{intro} {shortReply} {closing}',
  '{shortReply} {affirmation}',
  '{intro} {humor}',
  '{intro} {shortReply} {humor}',
];

/**
 * Replaces pattern tokens with actual values
 */
export function applyPattern(pattern: string, tokens: PatternTokens): string {
  let result = pattern;
  
  // Replace tokens in order
  result = result.replace(/{intro}/g, tokens.intro);
  result = result.replace(/{reflection}/g, tokens.reflection || '');
  result = result.replace(/{struggle}/g, tokens.struggle);
  result = result.replace(/{advice}/g, tokens.advice);
  result = result.replace(/{closing}/g, tokens.closing);
  result = result.replace(/{shortReply}/g, tokens.shortReply || '');
  result = result.replace(/{affirmation}/g, tokens.affirmation || '');
  result = result.replace(/{humor}/g, tokens.humor || '');
  
  // Clean up any leftover tokens
  result = result.replace(/{\w+}/g, '');
  
  return result;
}

