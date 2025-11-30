import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { separationService } from '../../services';
import { SeparationCase } from '../../types';
import { useAuthStore } from '../../store/authStore';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const SeparationListPage: React.FC = () => {
  const { user } = useAuthStore();
  const [cases, setCases] = useState<SeparationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const perPage = 10;

  useEffect(() => {
    fetchCases();
  }, [page, statusFilter]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await separationService.getSeparations(page, perPage, statusFilter || undefined);
      setCases(response.cases);
      setTotalPages(response.pages);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

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

  const filteredCases = cases.filter((c) =>
    searchQuery
      ? c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.employee?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const isAdmin = user?.role === 'separation_manager';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Separation Cases</h1>
          <p className="text-gray-600">Manage employee separation processes</p>
        </div>
        {(isAdmin || user?.role === 'employee') && (
          <Link to="/separations/new" className="btn-primary inline-flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            New Separation
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by case number or employee name..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  className="input pl-10"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="initiated">Initiated</option>
                  <option value="checklist_pending">Checklist Pending</option>
                  <option value="checklist_submitted">Submitted</option>
                  <option value="signoff_pending">Sign-off Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No separation cases found</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Case Number</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Resignation Date</th>
                  <th>Last Working Day</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCases.map((separationCase) => (
                  <tr key={separationCase.id}>
                    <td className="font-medium text-primary-600">
                      {separationCase.case_number}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-gray-600">
                            {separationCase.employee?.first_name?.charAt(0)}
                            {separationCase.employee?.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{separationCase.employee?.full_name}</p>
                          <p className="text-sm text-gray-500">{separationCase.employee?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{separationCase.employee?.department?.name || '-'}</td>
                    <td>{separationCase.resignation_date}</td>
                    <td>{separationCase.last_working_day}</td>
                    <td>{getStatusBadge(separationCase.status)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <div className="progress-bar h-1.5">
                            <div
                              className="progress-bar-fill bg-primary-600"
                              style={{ width: `${separationCase.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{separationCase.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <Link
                        to={`/separations/${separationCase.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} cases
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-outline p-2 disabled:opacity-50"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded text-sm ${
                    page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn-outline p-2 disabled:opacity-50"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeparationListPage;
