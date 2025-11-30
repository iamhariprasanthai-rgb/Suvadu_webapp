import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { separationService } from '../services';
import { DashboardStats, SeparationCase } from '../types';
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await separationService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const isEmployee = user?.role === 'employee';
  const isManager = user?.role && ['direct_manager', 'department_manager', 'separation_manager'].includes(user.role);
  const isAdmin = user?.role === 'separation_manager';

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      initiated: { label: 'Initiated', color: 'badge-gray' },
      checklist_pending: { label: 'Checklist Pending', color: 'badge-warning' },
      checklist_submitted: { label: 'Submitted', color: 'badge-info' },
      signoff_pending: { label: 'Sign-off Pending', color: 'badge-warning' },
      completed: { label: 'Completed', color: 'badge-success' },
      cancelled: { label: 'Cancelled', color: 'badge-danger' },
    };
    const { label, color } = statusConfig[status] || { label: status, color: 'badge-gray' };
    return <span className={color}>{label}</span>;
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your separation cases
        </p>
      </div>

      {/* Employee Dashboard */}
      {isEmployee && (
        <>
          {stats?.has_case && stats.case ? (
            <div className="space-y-6">
              {/* Current Case Status */}
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Your Separation Case</h2>
                  {getStatusBadge(stats.case.status)}
                </div>
                <div className="card-body">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Case Number</p>
                      <p className="font-medium">{stats.case.case_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Working Day</p>
                      <p className="font-medium">{stats.case.last_working_day}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Checklist Progress</span>
                      <span className="font-medium">{stats.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill bg-primary-600"
                        style={{ width: `${stats.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Sign-off Progress</span>
                      <span className="font-medium">{stats.signoff_progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill bg-green-600"
                        style={{ width: `${stats.signoff_progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/separations/${stats.case.id}`}
                    className="btn-primary mt-6 inline-flex items-center"
                  >
                    View Details
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-12">
                <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mt-4">No Active Separation Case</h3>
                <p className="text-gray-500 mt-2">
                  You don't have any active separation cases at the moment.
                </p>
                <Link to="/separations/new" className="btn-primary mt-6 inline-flex items-center">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Start Separation Process
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* Manager/Admin Dashboard */}
      {isManager && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Cases</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_cases || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Active Cases</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.active_cases || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.completed_cases || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <ClipboardDocumentCheckIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Pending Sign-offs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.pending_signoffs || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Cases */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
              <Link to="/separations" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Case #</th>
                    <th>Employee</th>
                    <th>Last Working Day</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats?.recent_cases?.length ? (
                    stats.recent_cases.map((case_: SeparationCase) => (
                      <tr key={case_.id}>
                        <td className="font-medium">{case_.case_number}</td>
                        <td>{case_.employee?.full_name}</td>
                        <td>{case_.last_working_day}</td>
                        <td>{getStatusBadge(case_.status)}</td>
                        <td>
                          <div className="w-24">
                            <div className="progress-bar h-1.5">
                              <div
                                className="progress-bar-fill bg-primary-600"
                                style={{ width: `${case_.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <Link
                            to={`/separations/${case_.id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No recent cases
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          {isAdmin && (
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <Link
                to="/separations/new"
                className="card hover:shadow-md transition-shadow"
              >
                <div className="card-body flex items-center">
                  <div className="p-3 rounded-lg bg-primary-100">
                    <PlusIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Create New Case</p>
                    <p className="text-sm text-gray-500">Start a separation process</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/signoffs"
                className="card hover:shadow-md transition-shadow"
              >
                <div className="card-body flex items-center">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <ClipboardDocumentCheckIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Pending Sign-offs</p>
                    <p className="text-sm text-gray-500">{stats?.pending_signoffs || 0} awaiting approval</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/templates"
                className="card hover:shadow-md transition-shadow"
              >
                <div className="card-body flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Manage Templates</p>
                    <p className="text-sm text-gray-500">Configure checklists</p>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
