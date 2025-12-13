'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GenerationInput, Persona } from '@/lib/models/types';

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Company info state
  const [company, setCompany] = useState({
    name: '',
    valueProp: '',
    idealCustomer: '',
    tone: '',
  });

  // Personas state
  const [personas, setPersonas] = useState<Persona[]>([
    {
      name: '',
      background: '',
      voice: '',
      painPoints: [''],
    },
  ]);

  // Subreddits state
  const [subreddits, setSubreddits] = useState<string[]>(['']);

  // Themes state
  const [themes, setThemes] = useState<string[]>(['']);

  // Posts per week
  const [postsPerWeek, setPostsPerWeek] = useState<number>(5);

  // Company handlers
  const updateCompany = (field: keyof typeof company, value: string) => {
    setCompany((prev) => ({ ...prev, [field]: value }));
  };

  // Persona handlers
  const addPersona = () => {
    setPersonas([
      ...personas,
      { name: '', background: '', voice: '', painPoints: [''] },
    ]);
  };

  const removePersona = (index: number) => {
    if (personas.length > 1) {
      setPersonas(personas.filter((_, i) => i !== index));
    }
  };

  const updatePersona = (index: number, field: keyof Persona, value: string | string[]) => {
    setPersonas(
      personas.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const addPainPoint = (personaIndex: number) => {
    setPersonas(
      personas.map((p, i) =>
        i === personaIndex
          ? { ...p, painPoints: [...p.painPoints, ''] }
          : p
      )
    );
  };

  const removePainPoint = (personaIndex: number, painPointIndex: number) => {
    setPersonas(
      personas.map((p, i) =>
        i === personaIndex
          ? {
              ...p,
              painPoints: p.painPoints.filter((_, pi) => pi !== painPointIndex),
            }
          : p
      )
    );
  };

  const updatePainPoint = (personaIndex: number, painPointIndex: number, value: string) => {
    setPersonas(
      personas.map((p, i) =>
        i === personaIndex
          ? {
              ...p,
              painPoints: p.painPoints.map((pp, pi) =>
                pi === painPointIndex ? value : pp
              ),
            }
          : p
      )
    );
  };

  // Subreddit handlers
  const addSubreddit = () => {
    setSubreddits([...subreddits, '']);
  };

  const removeSubreddit = (index: number) => {
    if (subreddits.length > 1) {
      setSubreddits(subreddits.filter((_, i) => i !== index));
    }
  };

  const updateSubreddit = (index: number, value: string) => {
    setSubreddits(subreddits.map((s, i) => (i === index ? value : s)));
  };

  // Theme handlers
  const addTheme = () => {
    setThemes([...themes, '']);
  };

  const removeTheme = (index: number) => {
    if (themes.length > 1) {
      setThemes(themes.filter((_, i) => i !== index));
    }
  };

  const updateTheme = (index: number, value: string) => {
    setThemes(themes.map((t, i) => (i === index ? value : t)));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Filter out empty values
      const filteredPersonas = personas
        .map((p) => ({
          ...p,
          painPoints: p.painPoints.filter((pp) => pp.trim() !== ''),
        }))
        .filter((p) => p.name.trim() !== '');

      const filteredSubreddits = subreddits.filter((s) => s.trim() !== '');
      const filteredThemes = themes.filter((t) => t.trim() !== '');

      // Basic validation
      if (!company.name.trim() || !company.valueProp.trim()) {
        throw new Error('Company name and value proposition are required');
      }

      if (filteredPersonas.length < 2) {
        throw new Error('At least 2 personas are required');
      }

      if (filteredSubreddits.length === 0) {
        throw new Error('At least 1 subreddit is required');
      }

      if (filteredThemes.length === 0) {
        throw new Error('At least 1 theme is required');
      }

      // Prepare input
      const input: GenerationInput = {
        company,
        personas: filteredPersonas,
        subreddits: filteredSubreddits,
        themes: filteredThemes,
        postsPerWeek,
      };

      // Send POST request
      const response = await fetch('/api/generateCalendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate calendar');
      }

      const calendar = await response.json();

      // Save to localStorage
      localStorage.setItem('redditCalendar', JSON.stringify(calendar));
      localStorage.setItem('redditCalendarInput', JSON.stringify(input));

      // Redirect to calendar page
      router.push('/calendar');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              Generate Reddit Content Calendar
            </h1>
            <p className="text-blue-100 mt-2">
              Fill in the details below to create your weekly content plan
            </p>
          </div>

          <div className="p-8">
            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                💡 What is this?
              </h3>
              <p className="text-sm text-blue-800">
                This form helps you create a weekly Reddit content calendar. Fill in your company details, create personas (different characters who will post), 
                choose subreddits where you want to engage, and set your content themes. We'll generate natural-sounding posts and comments that feel authentic.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Company Info */}
              <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  Company Information
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      The name of your company or brand
                    </p>
                    <input
                      type="text"
                      required
                      value={company.name}
                      onChange={(e) => updateCompany('name', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                      placeholder="e.g., TechStart, FitLife, DesignStudio"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value Proposition *
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      What makes your product or service unique and valuable? This will be subtly mentioned in posts.
                    </p>
                    <textarea
                      required
                      value={company.valueProp}
                      onChange={(e) => updateCompany('valueProp', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y text-gray-900"
                      rows={3}
                      placeholder="e.g., automates workout planning, helps track fitness goals, provides personalized meal plans"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ideal Customer *
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Who is your target audience? Describe them in a few words.
                    </p>
                    <input
                      type="text"
                      required
                      value={company.idealCustomer}
                      onChange={(e) => updateCompany('idealCustomer', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                      placeholder="e.g., fitness enthusiasts, small business owners, college students"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone *
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      How should the content sound? Choose: casual, friendly, professional, analytical, or formal
                    </p>
                    <input
                      type="text"
                      required
                      value={company.tone}
                      onChange={(e) => updateCompany('tone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                      placeholder="e.g., friendly, professional, casual"
                    />
                  </div>
                </div>
              </section>

              {/* Personas */}
              <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Personas</h2>
                <button
                  type="button"
                  onClick={addPersona}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  + Add Persona
                </button>
              </div>
              <div className="space-y-4">
                {personas.map((persona, index) => (
                  <div
                    key={index}
                    className="p-5 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Persona {index + 1}
                      </h3>
                      {personas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePersona(index)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Persona Name
                        </label>
                        <input
                          type="text"
                          value={persona.name}
                          onChange={(e) => updatePersona(index, 'name', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                          placeholder="e.g., Alex, Sarah, Mike"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Background
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          What's their role or background? This helps shape their perspective.
                        </p>
                        <textarea
                          value={persona.background}
                          onChange={(e) => updatePersona(index, 'background', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y text-gray-900"
                          rows={2}
                          placeholder="e.g., fitness trainer, software developer, marketing professional"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Voice / Communication Style
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          How do they talk? Choose: casual, friendly, professional, analytical, or formal
                        </p>
                        <textarea
                          value={persona.voice}
                          onChange={(e) => updatePersona(index, 'voice', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y text-gray-900"
                          rows={2}
                          placeholder="e.g., friendly, analytical, casual"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Pain Points
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          What challenges or frustrations does this persona face? These will be naturally woven into posts.
                        </p>
                        <div className="space-y-2">
                          {persona.painPoints.map((painPoint, pi) => (
                            <div key={pi} className="flex gap-2">
                              <input
                                type="text"
                                value={painPoint}
                                onChange={(e) => updatePainPoint(index, pi, e.target.value)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                                placeholder="e.g., time management, staying motivated, finding resources"
                              />
                              {persona.painPoints.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePainPoint(index, pi)}
                                  className="px-4 py-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => addPainPoint(index)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          + Add Pain Point
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </section>

              {/* Subreddits */}
              <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Subreddits</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Add the Reddit communities where you want to post. You can type with or without "r/"
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSubreddit}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  + Add Subreddit
                </button>
              </div>
              <div className="space-y-3">
                {subreddits.map((subreddit, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={subreddit}
                      onChange={(e) => updateSubreddit(index, e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                      placeholder="e.g., r/fitness, fitness, r/running"
                    />
                    {subreddits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubreddit(index)}
                        className="px-4 py-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              </section>

              {/* Themes */}
              <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Themes</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Main topics or subjects for your content. These will be expanded into various discussion topics.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTheme}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  + Add Theme
                </button>
              </div>
              <div className="space-y-3">
                {themes.map((theme, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={theme}
                      onChange={(e) => updateTheme(index, e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                      placeholder="e.g., fitness, productivity, entrepreneurship, health"
                    />
                    {themes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTheme(index)}
                        className="px-4 py-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              </section>

            {/* Posts per week */}
            <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posts Per Week
              </label>
              <p className="text-xs text-gray-500 mb-3">
                How many posts do you want to generate? Posts will be distributed across Monday-Sunday. (Recommended: 5-10)
              </p>
              <input
                type="number"
                min="1"
                max="28"
                value={postsPerWeek}
                onChange={(e) => setPostsPerWeek(parseInt(e.target.value) || 5)}
                className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                placeholder="5"
              />
            </section>

              {/* Submit button */}
              <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Generating Calendar...' : 'Generate Calendar'}
              </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
