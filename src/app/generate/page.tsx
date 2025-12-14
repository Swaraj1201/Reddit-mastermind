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
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-8 rounded-t-xl">
            <h1 className="text-3xl font-bold text-white mb-2">
              Generate Reddit Content Calendar
            </h1>
            <p className="text-indigo-100 text-base">
              Fill in the details below to create your weekly content plan
            </p>
          </div>

          <div className="p-8">
            {/* Info Box */}
            <div className="mb-8 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg">
              <h3 className="text-sm font-semibold text-indigo-900 mb-1.5">
                💡 What is this?
              </h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                This form helps you create a weekly Reddit content calendar. Fill in your company details, create personas (different characters who will post), 
                choose subreddits where you want to engage, and set your content themes. We'll generate natural-sounding posts and comments that feel authentic.
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in fade-in duration-300">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Company Info */}
              <section className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#111827] mb-6 pb-3 border-b border-[#e5e7eb]">
                  Company Information
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#6b7280] mb-2">
                      Company Name *
                    </label>
                    <p className="text-xs text-[#6b7280] mb-3">
                      The name of your company or brand
                    </p>
                    <input
                      type="text"
                      required
                      value={company.name}
                      onChange={(e) => updateCompany('name', e.target.value)}
                      className="w-full px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                      placeholder="e.g., TechStart, FitLife, DesignStudio"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6b7280] mb-2">
                      Value Proposition *
                    </label>
                    <p className="text-xs text-[#6b7280] mb-3">
                      What makes your product or service unique and valuable? This will be subtly mentioned in posts.
                    </p>
                    <textarea
                      required
                      value={company.valueProp}
                      onChange={(e) => updateCompany('valueProp', e.target.value)}
                      className="w-full px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 resize-y"
                      rows={3}
                      placeholder="e.g., automates workout planning, helps track fitness goals, provides personalized meal plans"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6b7280] mb-2">
                      Ideal Customer *
                    </label>
                    <p className="text-xs text-[#6b7280] mb-3">
                      Who is your target audience? Describe them in a few words.
                    </p>
                    <input
                      type="text"
                      required
                      value={company.idealCustomer}
                      onChange={(e) => updateCompany('idealCustomer', e.target.value)}
                      className="w-full px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                      placeholder="e.g., fitness enthusiasts, small business owners, college students"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6b7280] mb-2">
                      Tone *
                    </label>
                    <p className="text-xs text-[#6b7280] mb-3">
                      How should the content sound? Choose: casual, friendly, professional, analytical, or formal
                    </p>
                    <input
                      type="text"
                      required
                      value={company.tone}
                      onChange={(e) => updateCompany('tone', e.target.value)}
                      className="w-full px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                      placeholder="e.g., friendly, professional, casual"
                    />
                  </div>
                </div>
              </section>

              {/* Personas */}
              <section className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#e5e7eb]">
                  <h2 className="text-xl font-semibold text-[#111827]">Personas</h2>
                  <button
                    type="button"
                    onClick={addPersona}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    + Add Persona
                  </button>
                </div>
                <div className="space-y-5">
                  {personas.map((persona, index) => (
                    <div
                      key={index}
                      className="p-5 border-2 border-[#e5e7eb] rounded-xl bg-white hover:border-indigo-300 transition-all duration-150"
                    >
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-base font-semibold text-[#111827]">
                          Persona {index + 1}
                        </h3>
                        {personas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePersona(index)}
                            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-150"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-[#6b7280] mb-2">
                            Persona Name
                          </label>
                          <input
                            type="text"
                            value={persona.name}
                            onChange={(e) => updatePersona(index, 'name', e.target.value)}
                            className="w-full px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                            placeholder="e.g., Alex, Sarah, Mike"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#6b7280] mb-2">
                            Background
                          </label>
                          <p className="text-xs text-[#6b7280] mb-2">
                            What's their role or background? This helps shape their perspective.
                          </p>
                          <textarea
                            value={persona.background}
                            onChange={(e) => updatePersona(index, 'background', e.target.value)}
                            className="w-full px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 resize-y"
                            rows={2}
                            placeholder="e.g., fitness trainer, software developer, marketing professional"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#6b7280] mb-2">
                            Voice / Communication Style
                          </label>
                          <p className="text-xs text-[#6b7280] mb-2">
                            How do they talk? Choose: casual, friendly, professional, analytical, or formal
                          </p>
                          <textarea
                            value={persona.voice}
                            onChange={(e) => updatePersona(index, 'voice', e.target.value)}
                            className="w-full px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 resize-y"
                            rows={2}
                            placeholder="e.g., friendly, analytical, casual"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#6b7280] mb-2">
                            Pain Points
                          </label>
                          <p className="text-xs text-[#6b7280] mb-2">
                            What challenges or frustrations does this persona face? These will be naturally woven into posts.
                          </p>
                          <div className="space-y-2">
                            {persona.painPoints.map((painPoint, pi) => (
                              <div key={pi} className="flex gap-2">
                                <input
                                  type="text"
                                  value={painPoint}
                                  onChange={(e) => updatePainPoint(index, pi, e.target.value)}
                                  className="flex-1 px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                                  placeholder="e.g., time management, staying motivated, finding resources"
                                />
                                {persona.painPoints.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removePainPoint(index, pi)}
                                    className="px-4 py-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-150"
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
                            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-150"
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
              <section className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#e5e7eb]">
                  <div>
                    <h2 className="text-xl font-semibold text-[#111827] mb-1">Subreddits</h2>
                    <p className="text-sm text-[#6b7280]">
                      Add the Reddit communities where you want to post. You can type with or without "r/"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSubreddit}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                        className="flex-1 px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                        placeholder="e.g., r/fitness, fitness, r/running"
                      />
                      {subreddits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubreddit(index)}
                          className="px-5 py-2.5 text-sm text-[#6b7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 border border-[#e5e7eb] hover:border-red-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Themes */}
              <section className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#e5e7eb]">
                  <div>
                    <h2 className="text-xl font-semibold text-[#111827] mb-1">Themes</h2>
                    <p className="text-sm text-[#6b7280]">
                      Main topics or subjects for your content. These will be expanded into various discussion topics.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addTheme}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                        className="flex-1 px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                        placeholder="e.g., fitness, productivity, entrepreneurship, health"
                      />
                      {themes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTheme(index)}
                          className="px-5 py-2.5 text-sm text-[#6b7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 border border-[#e5e7eb] hover:border-red-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Posts per week */}
              <section className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
                <label className="block text-sm font-medium text-[#6b7280] mb-2">
                  Posts Per Week
                </label>
                <p className="text-sm text-[#6b7280] mb-4">
                  How many posts do you want to generate? Posts will be distributed across Monday-Sunday. (Recommended: 5-10)
                </p>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={postsPerWeek}
                  onChange={(e) => setPostsPerWeek(parseInt(e.target.value) || 5)}
                  className="w-32 px-4 py-2.5 text-base text-[#111827] border border-[#e5e7eb] rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                  placeholder="5"
                />
              </section>

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3.5 bg-indigo-600 text-white text-base font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-150 transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating content...
                    </span>
                  ) : (
                    'Generate Calendar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
