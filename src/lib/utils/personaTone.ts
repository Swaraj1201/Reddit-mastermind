import type { Persona } from '@/lib/models/types';
import { pick } from './textTools';

/**
 * Persona Tone System - Generates tone-appropriate prefixes based on persona voice
 */

// ====================================================================
// PART 3: Tone Prefixes by Persona Voice
// ====================================================================
const tonePrefixes: Record<string, string[]> = {
  casual: ['Hey —', 'Hi folks —', 'Quick thought —', 'Yo —', 'What\'s up —'],
  friendly: ['Hey team —', 'Hope you\'re well —', 'Just wanted to ask —', 'Hi there —', 'Hey everyone —'],
  analytical: ['From my experience —', 'Looking at this logically —', 'Analyzing this —', 'Data point —', 'From what I\'ve observed —'],
  formal: ['Greetings —', 'A question for the community —', 'I\'d appreciate insights —', 'Good day —', 'I\'d like to inquire —'],
  professional: ['Hello —', 'I have a question —', 'Seeking advice —', 'Wondering if anyone can help —', 'Looking for guidance —'],
};

/**
 * Gets a tone-appropriate prefix based on persona voice
 * Falls back to friendly if voice not recognized
 */
export function getPersonaTone(persona: Persona): string {
  const voice = persona.voice?.toLowerCase() || 'friendly';
  const options = tonePrefixes[voice] ?? tonePrefixes.friendly;
  return pick(options);
}

// ====================================================================
// PART 4: Style Modes
// ====================================================================
export type StyleMode = 'analytical' | 'introspective' | 'motivational' | 'casual';

const stylePrefixes: Record<StyleMode, string[]> = {
  analytical: [
    'Looking at this logically —',
    'From a practical standpoint —',
    'Analyzing this objectively —',
    'From a data perspective —',
  ],
  introspective: [
    'Lately I\'ve been thinking a lot about this —',
    'Something I\'ve noticed in myself —',
    'I\'ve been reflecting on this —',
    'This made me realize —',
  ],
  motivational: [
    'You\'re not alone in this —',
    'Honestly, small wins add up —',
    'Keep pushing forward —',
    'Remember, progress takes time —',
  ],
  casual: [
    'Not gonna lie —',
    'Real talk —',
    'Honestly —',
    'Gonna be real with you —',
  ],
};

/**
 * Gets a style-appropriate prefix based on style mode
 */
export function getStylePrefix(style: StyleMode): string {
  return pick(stylePrefixes[style]);
}
