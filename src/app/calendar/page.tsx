'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { WeeklyCalendar, GenerationInput } from '@/lib/models/types';

// Helper to add days to a date string (YYYY-MM-DD)
function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date for display
function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format date for table (shorter format)
function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${dayName}, ${monthDay}`;
}

export default function CalendarPage() {
  const router = useRouter();
  const [calendar, setCalendar] = useState<WeeklyCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load calendar from localStorage
    const calendarData = localStorage.getItem('redditCalendar');
    if (calendarData) {
      try {
        setCalendar(JSON.parse(calendarData));
      } catch (err) {
        setError('Failed to load calendar data');
      }
    } else {
      setError('No calendar found. Please generate one first.');
    }
    setLoading(false);
  }, []);

  const handleGenerateNextWeek = async () => {
    if (!calendar) return;

    setGenerating(true);
    setError(null);

    try {
      // Get saved input
      const inputData = localStorage.getItem('redditCalendarInput');
      if (!inputData) {
        throw new Error('Original input data not found');
      }

      const input: GenerationInput = JSON.parse(inputData);

      // Calculate next week's Monday (add 7 days to current weekStart)
      const nextWeekStart = addDaysToDate(calendar.weekStart, 7);

      // Call API with next week's start date
      const response = await fetch('/api/generateCalendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...input,
          weekStart: nextWeekStart,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate calendar');
      }

      const newCalendar = await response.json();

      // Save to localStorage
      localStorage.setItem('redditCalendar', JSON.stringify(newCalendar));

      // Update state with fade-in animation
      setCalendar(newCalendar);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-base text-[#6b7280]">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error && !calendar) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-[#e5e7eb] shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Error</h3>
            <p className="text-sm text-[#6b7280] mb-6">{error}</p>
            <button
              onClick={() => router.push('/generate')}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Go to Generate Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!calendar) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Content Calendar
                </h1>
                <p className="text-indigo-100 text-base">
                  Week of {formatDateDisplay(calendar.weekStart)}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => router.push('/generate')}
                  className="px-5 py-2.5 border-2 border-white/30 bg-white/10 backdrop-blur text-white rounded-lg hover:bg-white/20 transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
                >
                  Generate New
                </button>
                <button
                  onClick={handleGenerateNextWeek}
                  disabled={generating}
                  className="px-6 py-2.5 bg-white text-indigo-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {generating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Generate Next Week'
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in fade-in duration-300">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Calendar Table */}
            <div className="overflow-x-auto border border-[#e5e7eb] rounded-lg">
              <table className="min-w-full divide-y divide-[#e5e7eb]">
                <thead className="bg-[#fafafa]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider border-r border-[#e5e7eb]">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider border-r border-[#e5e7eb]">
                      Subreddit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider border-r border-[#e5e7eb]">
                      Poster
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider border-r border-[#e5e7eb]">
                      Topic
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider border-r border-[#e5e7eb]">
                      Post Text
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider border-r border-[#e5e7eb]">
                      Commenter
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                      Comment Text
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e5e7eb]">
                  {calendar.posts.map((post, index) => (
                    <tr
                      key={index}
                      className={`transition-all duration-150 hover:bg-indigo-50/50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'
                      }`}
                    >
                      <td className="px-6 py-5 whitespace-nowrap border-r border-[#e5e7eb]">
                        <div className="text-sm font-semibold text-[#111827]">
                          {formatDateShort(post.date)}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap border-r border-[#e5e7eb]">
                        <span className="text-sm font-medium text-indigo-600">
                          {post.subreddit}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap border-r border-[#e5e7eb]">
                        <span className="text-sm text-[#111827]">
                          {post.poster}
                        </span>
                      </td>
                      <td className="px-6 py-5 border-r border-[#e5e7eb]">
                        <span className="text-sm text-[#111827] max-w-xs inline-block">
                          {post.topic}
                        </span>
                      </td>
                      <td className="px-6 py-5 border-r border-[#e5e7eb]">
                        <div className="rounded-xl border border-[#e5e7eb] p-4 bg-white shadow-sm max-w-md">
                          <p className="text-sm text-[#111827] leading-relaxed whitespace-pre-wrap break-words">
                            {post.postText}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap border-r border-[#e5e7eb]">
                        <span className="text-sm text-[#111827]">
                          {post.commenter}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="rounded-xl border border-[#e5e7eb] p-4 bg-white shadow-sm max-w-md">
                          <p className="text-sm text-[#111827] leading-relaxed whitespace-pre-wrap break-words">
                            {post.commentText}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {calendar.posts.length === 0 && (
              <div className="text-center py-12 text-[#6b7280]">
                <p className="text-base">No posts scheduled for this week.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
