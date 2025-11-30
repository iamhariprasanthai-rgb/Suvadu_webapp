import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { separationService } from '../../services';
import { useAuthStore } from '../../store/authStore';
import { SeparationCase, ChecklistItem, SignOff, HandoverSchedule } from '../../types';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import ChecklistSection from '../../components/separation/ChecklistSection';
import SignoffSection from '../../components/separation/SignoffSection';
import HandoverSection from '../../components/separation/HandoverSection';
import AssignSignoffModal from '../../components/separation/AssignSignoffModal';

const SeparationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [separationCase, setSeparationCase] = useState<SeparationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'checklist' | 'signoffs' | 'handover'>('checklist');
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await separationService.getSeparation(parseInt(id));
      setSeparationCase(data);
    } catch (error) {
      toast.error('Failed to load separation case');
      navigate('/separations');
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistUpdate = async (itemId: number, isCompleted: boolean, notes?: string) => {
    if (!separationCase) return;
    try {
      const result = await separationService.updateChecklistItem(
        separationCase.id,
        itemId,
        { is_completed: isCompleted, notes }
      );
      setSeparationCase((prev) =>
        prev
          ? {
              ...prev,
              progress: result.progress,
              checklist_items: prev.checklist_items?.map((item) =>
                item.id === itemId ? result.item : item
              ),
            }
          : null
      );
      toast.success(isCompleted ? 'Item completed' : 'Item marked incomplete');
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleSubmitChecklist = async () => {
    if (!separationCase) return;
    try {
      const updatedCase = await separationService.submitChecklist(separationCase.id);
      setSeparationCase(updatedCase);
      toast.success('Checklist submitted for approval');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit checklist');
    }
  };

  const handleSignoffAssigned = () => {
    setShowAssignModal(false);
    fetchCase();
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      initiated: { label: 'Initiated', color: 'bg-gray-100 text-gray-700', icon: <ClockIcon className="w-4 h-4" /> },
      checklist_pending: { label: 'Checklist Pending', color: 'bg-yellow-100 text-yellow-700', icon: <ClockIcon className="w-4 h-4" /> },
      checklist_submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: <CheckCircleIcon className="w-4 h-4" /> },
      signoff_pending: { label: 'Sign-off Pending', color: 'bg-orange-100 text-orange-700', icon: <ClockIcon className="w-4 h-4" /> },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircleIcon className="w-4 h-4" /> },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <XCircleIcon className="w-4 h-4" /> },
    };
    const { label, color, icon } = config[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {icon}
        {label}
      </span>
    );
  };

  const isEmployee = separationCase?.employee_id === user?.id;
  const isAdmin = user?.role === 'separation_manager';
  const canEdit = isEmployee || isAdmin;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!separationCase) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Separation case not found</p>
        <Link to="/separations" className="btn-primary mt-4">
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <Link
        to="/separations"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Separations
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {separationCase.case_number}
                </h1>
                {getStatusBadge(separationCase.status)}
              </div>
              <p className="text-gray-500 mt-1">
                Created {new Date(separationCase.created_at).toLocaleDateString()}
              </p>
            </div>

            {isAdmin && separationCase.status !== 'completed' && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="btn-secondary inline-flex items-center"
              >
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Assign Sign-off Manager
              </button>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            <div>
              <p className="text-sm text-gray-500">Employee</p>
              <p className="font-medium">{separationCase.employee?.full_name}</p>
              <p className="text-sm text-gray-500">{separationCase.employee?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{separationCase.employee?.department?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Resignation Date</p>
              <p className="font-medium">{separationCase.resignation_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Working Day</p>
              <p className="font-medium">{separationCase.last_working_day}</p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Checklist Progress</span>
                <span className="font-medium">{separationCase.progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-primary-600"
                  style={{ width: `${separationCase.progress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Sign-off Progress</span>
                <span className="font-medium">{separationCase.signoff_progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-green-600"
                  style={{ width: `${separationCase.signoff_progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'checklist'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Checklist
          </button>
          <button
            onClick={() => setActiveTab('signoffs')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'signoffs'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign-offs
          </button>
          <button
            onClick={() => setActiveTab('handover')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'handover'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Handover Schedule
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'checklist' && (
        <ChecklistSection
          items={separationCase.checklist_items || []}
          canEdit={canEdit && separationCase.status === 'checklist_pending'}
          onUpdate={handleChecklistUpdate}
          onSubmit={handleSubmitChecklist}
          canSubmit={isEmployee && separationCase.status === 'checklist_pending'}
        />
      )}

      {activeTab === 'signoffs' && (
        <SignoffSection
          caseId={separationCase.id}
          signoffs={separationCase.signoffs || []}
          onUpdate={fetchCase}
        />
      )}

      {activeTab === 'handover' && (
        <HandoverSection
          caseId={separationCase.id}
          schedules={separationCase.handover_schedules || []}
          canEdit={canEdit}
          onUpdate={fetchCase}
        />
      )}

      {/* Assign Sign-off Modal */}
      {showAssignModal && (
        <AssignSignoffModal
          caseId={separationCase.id}
          onClose={() => setShowAssignModal(false)}
          onAssigned={handleSignoffAssigned}
        />
      )}
    </div>
  );
};

export default SeparationDetailPage;
