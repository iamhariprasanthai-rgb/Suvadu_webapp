import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { separationService } from '../../services';
import { SignOff } from '../../types';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const PendingSignoffsPage: React.FC = () => {
  const [signoffs, setSignoffs] = useState<SignOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchSignoffs();
  }, []);

  const fetchSignoffs = async () => {
    setLoading(true);
    try {
      const data = await separationService.getPendingSignoffs();
      setSignoffs(data.signoffs);
    } catch (error) {
      toast.error('Failed to load sign-offs');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (signoff: SignOff, status: 'approved' | 'rejected') => {
    setProcessingId(signoff.id);
    try {
      await separationService.processSignoff(
        signoff.separation_case_id,
        signoff.id,
        status,
        comments[signoff.id]
      );
      toast.success(`Sign-off ${status}`);
      fetchSignoffs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to process sign-off');
    } finally {
      setProcessingId(null);
    }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Sign-offs</h1>
        <p className="text-gray-600">Review and process sign-off requests</p>
      </div>

      {signoffs.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <CheckCircleIcon className="w-16 h-16 mx-auto text-green-300" />
            <h3 className="text-lg font-medium text-gray-900 mt-4">All caught up!</h3>
            <p className="text-gray-500 mt-2">You have no pending sign-offs to process.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {signoffs.map((signoff) => (
            <div key={signoff.id} className="card">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <ClockIcon className="w-8 h-8 text-yellow-500" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {signoff.department?.name} Sign-off
                        </h3>
                        <p className="text-sm text-gray-500">
                          Case #{signoff.separation_case_id} • Assigned {new Date(signoff.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={`/separations/${signoff.separation_case_id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
                      >
                        View Case
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                      </Link>
                    </div>

                    {/* Comment Input */}
                    <div className="mt-4">
                      <textarea
                        className="input text-sm"
                        placeholder="Add comments (optional)..."
                        value={comments[signoff.id] || ''}
                        onChange={(e) =>
                          setComments({ ...comments, [signoff.id]: e.target.value })
                        }
                        rows={2}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleProcess(signoff, 'approved')}
                        disabled={processingId === signoff.id}
                        className="btn-success flex-1 sm:flex-none"
                      >
                        {processingId === signoff.id ? (
                          'Processing...'
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleProcess(signoff, 'rejected')}
                        disabled={processingId === signoff.id}
                        className="btn-danger flex-1 sm:flex-none"
                      >
                        {processingId === signoff.id ? (
                          'Processing...'
                        ) : (
                          <>
                            <XCircleIcon className="w-5 h-5 mr-2" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingSignoffsPage;
