export interface CompanyInfo {
  name: string;
  valueProp: string;
  idealCustomer: string;
  tone: string;
}

export interface Persona {
  name: string;
  background: string;
  voice: string;
  painPoints: string[];
}

export type Subreddit = string;
export type Theme = string;

export interface CalendarPost {
  date: string;
  subreddit: string;
  poster: string;
  commenter: string;
  topic: string;
  postText: string;
  commentText: string;
}

export interface WeeklyCalendar {
  weekStart: string;
  posts: CalendarPost[];
}

export interface GenerationInput {
  company: CompanyInfo;
  personas: Persona[];
  subreddits: Subreddit[];
  themes: Theme[];
  postsPerWeek: number;
}

