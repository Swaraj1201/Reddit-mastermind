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

      // Update state
      setCalendar(newCalendar);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading calendar...</div>
      </div>
    );
  }

  if (error && !calendar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md bg-white p-6 rounded-lg shadow">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/generate')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Generate Page
          </button>
        </div>
      </div>
    );
  }

  if (!calendar) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Content Calendar
                </h1>
                <p className="text-blue-100 mt-2">
                  Week of {formatDateDisplay(calendar.weekStart)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/generate')}
                  className="px-5 py-2.5 border-2 border-white/30 bg-white/10 backdrop-blur text-white rounded-lg hover:bg-white/20 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
                >
                  Generate New
                </button>
                <button
                  onClick={handleGenerateNextWeek}
                  disabled={generating}
                  className="px-6 py-2.5 bg-white text-blue-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
                >
                  {generating ? 'Generating...' : 'Generate Next Week'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Calendar Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Subreddit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Poster
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Topic
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Post Text
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Commenter
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Comment Text
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calendar.posts.map((post, index) => (
                    <tr
                      key={index}
                      className={`transition-colors ${
                        index % 2 === 0
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-gray-50/50 hover:bg-gray-100'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                        {formatDateDisplay(post.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 border-r border-gray-200">
                        {post.subreddit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                        {post.poster}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs border-r border-gray-200">
                        {post.topic}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-md border-r border-gray-200">
                        <div className="max-h-32 overflow-y-auto pr-2">
                          {post.postText}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                        {post.commenter}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                        <div className="max-h-32 overflow-y-auto pr-2">
                          {post.commentText}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {calendar.posts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No posts scheduled for this week.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
