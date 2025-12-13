import { NextResponse } from 'next/server';
import type { GenerationInput, CompanyInfo, Persona } from '@/lib/models/types';
import { generateWeeklyCalendar } from '@/lib/utils/calendarGenerator';

// Validation helper functions
function validateCompanyInfo(company: any): company is CompanyInfo {
  return (
    company &&
    typeof company === 'object' &&
    typeof company.name === 'string' &&
    company.name.trim() !== '' &&
    typeof company.valueProp === 'string' &&
    company.valueProp.trim() !== '' &&
    typeof company.idealCustomer === 'string' &&
    company.idealCustomer.trim() !== '' &&
    typeof company.tone === 'string' &&
    company.tone.trim() !== ''
  );
}

function validatePersona(persona: any): persona is Persona {
  return (
    persona &&
    typeof persona === 'object' &&
    typeof persona.name === 'string' &&
    persona.name.trim() !== '' &&
    typeof persona.background === 'string' &&
    persona.background.trim() !== '' &&
    typeof persona.voice === 'string' &&
    persona.voice.trim() !== '' &&
    Array.isArray(persona.painPoints) &&
    persona.painPoints.every((pp: any) => typeof pp === 'string' && pp.trim() !== '')
  );
}

function validateGenerationInput(input: any): { valid: boolean; error?: string } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  // Validate company
  if (!validateCompanyInfo(input.company)) {
    return {
      valid: false,
      error: 'Missing or invalid company fields. Required: name, valueProp, idealCustomer, tone',
    };
  }

  // Validate personas
  if (!Array.isArray(input.personas) || input.personas.length === 0) {
    return {
      valid: false,
      error: 'Missing or invalid personas. Must be a non-empty array',
    };
  }

  for (let i = 0; i < input.personas.length; i++) {
    if (!validatePersona(input.personas[i])) {
      return {
        valid: false,
        error: `Invalid persona at index ${i}. Required: name, background, voice, painPoints (array of strings)`,
      };
    }
  }

  // Validate subreddits
  if (
    !Array.isArray(input.subreddits) ||
    input.subreddits.length === 0 ||
    !input.subreddits.every((s: any) => typeof s === 'string' && s.trim() !== '')
  ) {
    return {
      valid: false,
      error: 'Missing or invalid subreddits. Must be a non-empty array of strings',
    };
  }

  // Validate themes
  if (
    !Array.isArray(input.themes) ||
    input.themes.length === 0 ||
    !input.themes.every((t: any) => typeof t === 'string' && t.trim() !== '')
  ) {
    return {
      valid: false,
      error: 'Missing or invalid themes. Must be a non-empty array of strings',
    };
  }

  // Validate postsPerWeek
  if (
    typeof input.postsPerWeek !== 'number' ||
    input.postsPerWeek <= 0 ||
    !Number.isInteger(input.postsPerWeek)
  ) {
    return {
      valid: false,
      error: 'Missing or invalid postsPerWeek. Must be a positive integer',
    };
  }

  // Check minimum personas requirement
  if (input.personas.length < 2) {
    return {
      valid: false,
      error: 'At least 2 personas are required for calendar generation',
    };
  }

  return { valid: true };
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateGenerationInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Extract optional weekStart override
    const { weekStart: weekStartOverride, ...input } = body;

    // Generate calendar
    const calendar = generateWeeklyCalendar(
      input as GenerationInput,
      weekStartOverride
    );

    // Return calendar
    return NextResponse.json(calendar);
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError || (error as any).message?.includes('JSON')) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // Handle validation/generation errors
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

