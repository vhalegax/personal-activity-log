'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type Task = {
  taskId: string;
  title: string;
  type: string;
  hours: number;
  logCount: number;
};

type TypeSummary = {
  type: string;
  totalHours: number;
  taskCount: number;
};

export default function ReportsPage() {
  const [range, setRange] = useState('today');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [byType, setByType] = useState<TypeSummary[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('mvp_email');
    if (!email) {
      setUnauthorized(true);
      return;
    }
    fetchReport('today');
  }, []);

  async function fetchReport(r: string, start?: string, end?: string) {
    setLoading(true);
    try {
      const url = new URL('/api/reports/daily', window.location.origin);
      url.searchParams.set('range', r);
      if (start) url.searchParams.set('start', start);
      if (end) url.searchParams.set('end', end);

      const res = await fetch(url);
      const data = await res.json();

      setTasks(data.tasks || []);
      setByType(data.byType || []);
      setTotalHours(data.totalHours || 0);
    } catch (err) {
      console.error('Report error:', err);
      alert('Failed to load report');
    } finally {
      setLoading(false);
    }
  }

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    if (newRange === 'custom') {
      // Don't fetch yet; wait for custom dates
      return;
    }
    fetchReport(newRange);
  };

  const handleCustomReport = () => {
    if (!customStart || !customEnd) {
      alert('Please select both start and end dates');
      return;
    }
    fetchReport('custom', customStart, customEnd);
    setRange('custom');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Working':
        return 'bg-blue-100 text-blue-800';
      case 'Learning':
        return 'bg-purple-100 text-purple-800';
      case 'Other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (unauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <h1 className="mb-4 text-2xl font-bold">Please Log In First</h1>
          <p className="mb-6 text-gray-600">You need to log in to view your reports.</p>
          <Link href="/">
            <Button>Go Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-sm text-gray-600">Track your time and productivity</p>
          </div>

          <Link href="/">
            <Button variant="outline">Back to Tasks</Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="">
        {/* Date Range Selector */}
        <div className="mb-8 rounded-lg bg-white shadow">
          <h2 className="mb-4 text-xl font-bold">Select Date Range</h2>

          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              variant={range === 'today' ? 'default' : 'outline'}
              onClick={() => handleRangeChange('today')}
            >
              Today
            </Button>
            <Button
              variant={range === 'week' ? 'default' : 'outline'}
              onClick={() => handleRangeChange('week')}
            >
              This Week
            </Button>
            <Button
              variant={range === 'custom' ? 'default' : 'outline'}
              onClick={() => handleRangeChange('custom')}
            >
              Custom
            </Button>
          </div>

          {range === 'custom' && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <Button onClick={handleCustomReport} disabled={loading}>
                {loading ? 'Loading...' : 'Load Report'}
              </Button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Total Hours</h3>
            <p className="text-3xl font-bold text-blue-600">{totalHours.toFixed(2)}</p>
            <p className="mt-2 text-xs text-gray-500">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} tracked
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-sm font-medium text-gray-600">By Type</h3>
            <div className="space-y-2">
              {byType.length === 0 ? (
                <p className="text-sm text-gray-500">No data</p>
              ) : (
                byType.map((item) => (
                  <div key={item.type} className="flex justify-between">
                    <span className="text-sm font-medium">{item.type}</span>
                    <span className="text-sm text-gray-600">{item.totalHours.toFixed(2)}h</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tasks Breakdown */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold">Tasks Breakdown</h2>
          </div>

          {tasks.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No time logs for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Sessions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.taskId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.title}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-medium ${getTypeColor(task.type)}`}
                        >
                          {task.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {task.hours.toFixed(2)}h
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {task.logCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
