import type {
  GenerationInput,
  WeeklyCalendar,
  CalendarPost,
  Persona,
} from '@/lib/models/types';
import { generateHybridPost, generateHybridComment, resetWeekHistory } from './hybridGenerator';
import { cleanTopic } from './topicTools';

// ====================================================================
// PART 7: Smart Randomization Helper
// ====================================================================
/**
 * Chooses a random element from an array
 */
function choose<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ====================================================================
// PART 1: Subreddit Formatting Normalization
// ====================================================================
/**
 * Normalizes subreddit names to ensure proper "r/subreddit" format
 * Prevents issues like "r/r/tennis" by removing leading "r/"
 */
function normalizeSubreddit(sub: string): string {
  return `r/${sub.replace(/^r\//, '').trim()}`;
}

// ====================================================================
// PART 2: Topic Expansion Engine
// ====================================================================
/**
 * Expands a single theme into multiple natural topic variations
 */
function expandTheme(theme: string): string[] {
  return [
    `best practices for ${theme}`,
    `struggles people face with ${theme}`,
    `tips on improving at ${theme}`,
    `how to get better at ${theme}`,
    `common mistakes in ${theme}`,
    `what people overlook about ${theme}`,
    `advice for newcomers on ${theme}`,
  ];
}

/**
 * Expands all themes into a comprehensive list of topics
 * PART 1: Applies cleanTopic() to all expanded topics
 */
function expandThemesToTopics(themes: string[]): string[] {
  const allTopics: string[] = [];
  themes.forEach((theme) => {
    // Clean the base theme first
    const cleanTheme = cleanTopic(theme);
    allTopics.push(...expandTheme(cleanTheme).map(cleanTopic));
    // Also include the cleaned base theme
    allTopics.push(cleanTheme);
  });
  return allTopics;
}

// ====================================================================
// PART 6: Improved Shuffle Function
// ====================================================================
/**
 * Shuffles an array using Fisher-Yates algorithm with random sorting
 * Ensures non-repetitive, randomized output
 */
function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((x) => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((obj) => obj.x);
}

// ====================================================================
// PART 8: Persona Selection Helper
// ====================================================================
/**
 * Picks a different persona from the poster
 * Ensures commenter is always different from poster
 */
function pickDifferentPersona(personas: Persona[], poster: Persona): Persona {
  const filtered = personas.filter((p) => p.name !== poster.name);
  if (filtered.length === 0) {
    // Fallback if somehow all personas are the same (shouldn't happen)
    return personas[0];
  }
  return choose(filtered);
}

// ====================================================================
// Date Helper Functions
// ====================================================================
// Get Monday of the current week
function getMondayOfWeek(): Date {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(today.setDate(diff));
  return monday;
}

// Parse date string (YYYY-MM-DD) to Date
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ====================================================================
// Main Calendar Generation Function
// ====================================================================
export function generateWeeklyCalendar(
  input: GenerationInput,
  weekStartOverride?: string
): WeeklyCalendar {
  // PART 7: Reset week-level seed history at start of new week generation
  resetWeekHistory();
  
  const { company, personas, subreddits, themes, postsPerWeek } = input;

  // Validate inputs
  if (personas.length < 2) {
    throw new Error('At least 2 personas are required');
  }
  if (subreddits.length === 0) {
    throw new Error('At least 1 subreddit is required');
  }
  if (themes.length === 0) {
    throw new Error('At least 1 theme is required');
  }

  // PART 2: Expand themes into comprehensive topic list
  // PART 1: cleanTopic() is applied inside expandThemesToTopics()
  const allTopics = expandThemesToTopics(themes);
  
  // PART 8: Shuffle everything at week start for maximum variety
  const shuffledTopics = shuffle(allTopics);
  const shuffledPersonas = shuffle([...personas]);
  const shuffledSubreddits = shuffle([...subreddits]);

  // Get week start (Monday) - use override if provided
  const weekStart = weekStartOverride
    ? parseDate(weekStartOverride)
    : getMondayOfWeek();
  const weekStartStr = formatDate(weekStart);

  // Distribute posts across the week (Monday to Sunday)
  const posts: CalendarPost[] = [];
  const usedTopics = new Set<string>();

  // Track used subreddits per day to avoid duplicates on same day
  const usedSubredditsPerDay = new Map<number, Set<string>>();
  
  // PART 8: Track last subreddit to avoid repeating two days in a row
  let lastSubreddit: string | null = null;

  let topicIndex = 0;
  let subredditIndex = 0;
  let personaIndex = 0;

  // Generate posts for each day of the week
  for (let dayOffset = 0; dayOffset < 7 && posts.length < postsPerWeek; dayOffset++) {
    const currentDate = addDays(weekStart, dayOffset);
    const dateStr = formatDate(currentDate);

    // Initialize set for this day if not exists
    if (!usedSubredditsPerDay.has(dayOffset)) {
      usedSubredditsPerDay.set(dayOffset, new Set());
    }
    const daySubreddits = usedSubredditsPerDay.get(dayOffset)!;

    // Calculate how many posts for this day
    const remainingDays = 7 - dayOffset;
    const remainingPosts = postsPerWeek - posts.length;
    const postsToday = Math.ceil(remainingPosts / remainingDays);

    // Generate posts for this day
    for (let i = 0; i < postsToday && posts.length < postsPerWeek; i++) {
      // Select topic (no repeats)
      // PART 1: Topics are already cleaned in expandThemesToTopics()
      let topic: string;
      do {
        if (topicIndex >= shuffledTopics.length) {
          // If we run out of unique topics, cycle back with index offset
          topicIndex = 0;
          const baseTheme = cleanTopic(themes[posts.length % themes.length]);
          topic = `${baseTheme} - part ${Math.floor(posts.length / themes.length) + 2}`;
        } else {
          topic = shuffledTopics[topicIndex];
          topicIndex++;
        }
      } while (usedTopics.has(topic) && usedTopics.size < allTopics.length);
      usedTopics.add(topic);

      // PART 8: Select subreddit (rotate, no duplicates on same day, avoid consecutive days)
      let rawSubreddit: string;
      let attempts = 0;
      do {
        rawSubreddit = shuffledSubreddits[subredditIndex % shuffledSubreddits.length];
        subredditIndex++;
        attempts++;
        
        // Skip if it's the same as last subreddit (avoid consecutive days)
        if (rawSubreddit === lastSubreddit && shuffledSubreddits.length > 1) {
          continue;
        }
      } while (
        (daySubreddits.has(rawSubreddit) || rawSubreddit === lastSubreddit) &&
        attempts < shuffledSubreddits.length * 3
      );

      daySubreddits.add(rawSubreddit);
      lastSubreddit = rawSubreddit;

      // PART 1: Normalize subreddit format
      const subreddit = normalizeSubreddit(rawSubreddit);

      // PART 8: Select poster persona
      const poster = shuffledPersonas[personaIndex % shuffledPersonas.length];
      personaIndex++;

      // PART 8: Ensure commenter is different from poster using helper
      const commenter = pickDifferentPersona(shuffledPersonas, poster);

      // PART 7: Generate text content using hybrid generator
      const postText = generateHybridPost(poster, topic, company);
      const commentText = generateHybridComment(commenter, topic, company);

      // Create calendar post
      // PART 5: Full topic (cleaned) is stored, simplified version used in text
      const post: CalendarPost = {
        date: dateStr,
        subreddit, // Already normalized
        poster: poster.name,
        commenter: commenter.name,
        topic, // Full cleaned topic for calendar display
        postText,
        commentText,
      };

      posts.push(post);
    }
  }

  return {
    weekStart: weekStartStr,
    posts,
  };
}
