import React, { useEffect, useState } from 'react';
import { separationService } from '../../services';
import { SeparationCase } from '../../types';
import {
  ChartBarIcon,
  DocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface ReportStats {
  total: number;
  byStatus: Record<string, number>;
  byDepartment: Array<{ name: string; count: number }>;
  avgCompletionDays: number;
  monthlyTrend: Array<{ month: string; count: number }>;
}

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [cases, setCases] = useState<SeparationCase[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await separationService.getSeparations(1, 1000);
      setCases(response.cases);
      calculateStats(response.cases);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (casesData: SeparationCase[]) => {
    // Filter by date range
    const filteredCases = casesData.filter((c) => {
      const caseDate = new Date(c.created_at);
      return caseDate >= new Date(dateRange.start) && caseDate <= new Date(dateRange.end);
    });

    // By status
    const byStatus: Record<string, number> = {};
    filteredCases.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    });

    // By department
    const deptCounts: Record<string, number> = {};
    filteredCases.forEach((c) => {
      const deptName = c.employee?.department?.name || 'Unknown';
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
    });
    const byDepartment = Object.entries(deptCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Average completion days
    const completedCases = filteredCases.filter((c) => c.status === 'completed');
    const avgDays = completedCases.length > 0
      ? completedCases.reduce((sum, c) => {
          const created = new Date(c.created_at);
          const lastWork = new Date(c.last_working_day);
          return sum + Math.ceil((lastWork.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / completedCases.length
      : 0;

    // Monthly trend
    const monthCounts: Record<string, number> = {};
    filteredCases.forEach((c) => {
      const month = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    const monthlyTrend = Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .slice(-6);

    setStats({
      total: filteredCases.length,
      byStatus,
      byDepartment,
      avgCompletionDays: Math.round(avgDays),
      monthlyTrend,
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      pending_approval: 'Pending Approval',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      pending_approval: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Overview of separation case metrics</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Cases</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.byStatus['completed'] || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.byStatus['in_progress'] || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg. Completion (days)</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgCompletionDays}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <DocumentCheckIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Status Distribution</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {Object.entries(stats.byStatus).map(([status, count]) => {
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {getStatusLabel(status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${getStatusColor(status)} h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* By Department */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Cases by Department</h3>
              </div>
              <div className="card-body">
                {stats.byDepartment.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {stats.byDepartment.slice(0, 6).map((dept, index) => (
                      <div key={dept.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{dept.count} cases</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Monthly Trend</h3>
            </div>
            <div className="card-body">
              {stats.monthlyTrend.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data available</p>
              ) : (
                <div className="flex items-end justify-between gap-4 h-48">
                  {stats.monthlyTrend.map((month, index) => {
                    const maxCount = Math.max(...stats.monthlyTrend.map(m => m.count));
                    const height = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
                    const prevCount = index > 0 ? stats.monthlyTrend[index - 1].count : month.count;
                    const trend = month.count - prevCount;
                    
                    return (
                      <div key={month.month} className="flex-1 flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-sm font-medium text-gray-900">{month.count}</span>
                          {trend > 0 && <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />}
                          {trend < 0 && <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="w-full bg-gray-100 rounded-t-lg flex-1 flex items-end">
                          <div
                            className="w-full bg-primary-500 rounded-t-lg transition-all duration-300"
                            style={{ height: `${height}%`, minHeight: month.count > 0 ? '8px' : '0' }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Cases Table */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Recent Cases</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Working Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.slice(0, 10).map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {caseItem.employee?.full_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {caseItem.employee?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.employee?.department?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {caseItem.reason?.replace('_', ' ') || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(caseItem.last_working_day).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          caseItem.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : caseItem.status === 'signoff_pending'
                            ? 'bg-blue-100 text-blue-700'
                            : caseItem.status === 'checklist_pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : caseItem.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {getStatusLabel(caseItem.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
