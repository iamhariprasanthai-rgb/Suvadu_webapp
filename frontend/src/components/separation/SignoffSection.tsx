import React, { useState } from 'react';
import { SignOff } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { separationService } from '../../services';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface SignoffSectionProps {
  caseId: number;
  signoffs: SignOff[];
  onUpdate: () => void;
}

const SignoffSection: React.FC<SignoffSectionProps> = ({
  caseId,
  signoffs,
  onUpdate,
}) => {
  const { user } = useAuthStore();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});

  const handleProcess = async (signoff: SignOff, status: 'approved' | 'rejected') => {
    setProcessingId(signoff.id);
    try {
      await separationService.processSignoff(
        caseId,
        signoff.id,
        status,
        comments[signoff.id]
      );
      toast.success(`Sign-off ${status}`);
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to process sign-off');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ClockIcon className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pending', color: 'badge-warning' },
      approved: { label: 'Approved', color: 'badge-success' },
      rejected: { label: 'Rejected', color: 'badge-danger' },
    };
    const { label, color } = config[status] || { label: status, color: 'badge-gray' };
    return <span className={color}>{label}</span>;
  };

  const canProcess = (signoff: SignOff) => {
    return (
      signoff.status === 'pending' &&
      (signoff.assigned_to === user?.id || user?.role === 'separation_manager')
    );
  };

  return (
    <div className="space-y-4">
      {signoffs.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <ClockIcon className="w-12 h-12 mx-auto text-gray-300" />
            <p className="text-gray-500 mt-4">No sign-offs assigned yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Sign-offs will be assigned by the separation manager
            </p>
          </div>
        </div>
      ) : (
        signoffs.map((signoff) => (
          <div key={signoff.id} className="card">
            <div className="card-body">
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0">{getStatusIcon(signoff.status)}</div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {signoff.department?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Assigned to: {signoff.assignee?.full_name}
                      </p>
                    </div>
                    {getStatusBadge(signoff.status)}
                  </div>

                  {/* Completed info */}
                  {signoff.completed_at && (
                    <p className="text-sm text-gray-500 mt-2">
                      {signoff.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                      {new Date(signoff.completed_at).toLocaleDateString()}
                    </p>
                  )}

                  {/* Comments */}
                  {signoff.comments && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{signoff.comments}</p>
                    </div>
                  )}

                  {/* Actions for pending sign-offs */}
                  {canProcess(signoff) && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        className="input text-sm"
                        placeholder="Add comments (optional)..."
                        value={comments[signoff.id] || ''}
                        onChange={(e) =>
                          setComments({ ...comments, [signoff.id]: e.target.value })
                        }
                        rows={2}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleProcess(signoff, 'approved')}
                          disabled={processingId === signoff.id}
                          className="btn-success flex-1"
                        >
                          {processingId === signoff.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleProcess(signoff, 'rejected')}
                          disabled={processingId === signoff.id}
                          className="btn-danger flex-1"
                        >
                          {processingId === signoff.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SignoffSection;
