# Reddit Mastermind

An AI-powered content calendar generator for Reddit that creates natural, engaging posts and comments using persona-based personas.

## Features

- **Weekly Content Calendar Generation** - Automatically generates a full week of Reddit content
- **Persona-Based Content** - Create multiple personas with unique voices and backgrounds
- **Natural Language Generation** - Ultra-realistic posts and comments that sound human
- **Smart Topic Expansion** - Automatically expands themes into varied discussion topics
- **Subreddit Management** - Distribute content across multiple subreddits with smart rotation
- **Next Week Generation** - Easily generate subsequent weeks with one click

## Getting Started

### Prerequisites

- Node.js 18+ (Next.js 14 requires this)
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Navigate to the generate page (default route)
2. Fill in your company information
3. Create 2+ personas with unique voices and backgrounds
4. Add target subreddits
5. Set your content themes (topics to target)
6. Choose number of posts per week
7. Generate your calendar
8. Use "Generate Next Week" to create subsequent weeks

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **LocalStorage** - Client-side data persistence (ready for Supabase migration)

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── generate/     # Main form page
│   ├── calendar/     # Calendar display page
│   └── api/          # API routes
└── lib/
    ├── models/       # TypeScript interfaces
    ├── ai/seeds/     # Seed libraries for content generation
    └── utils/        # Core algorithms and utilities
```

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm run build
```

Then deploy to Vercel or your preferred hosting platform.

## License

This project is part of a technical assessment.
