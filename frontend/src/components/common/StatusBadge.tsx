import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      draft: {
        label: 'Draft',
        color: 'bg-gray-100 text-gray-700',
        icon: <PencilSquareIcon className="w-4 h-4" />,
      },
      pending_approval: {
        label: 'Pending Approval',
        color: 'bg-yellow-100 text-yellow-700',
        icon: <ClockIcon className="w-4 h-4" />,
      },
      in_progress: {
        label: 'In Progress',
        color: 'bg-blue-100 text-blue-700',
        icon: <ExclamationCircleIcon className="w-4 h-4" />,
      },
      completed: {
        label: 'Completed',
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircleIcon className="w-4 h-4" />,
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-700',
        icon: <XCircleIcon className="w-4 h-4" />,
      },
      // SignOff statuses
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-700',
        icon: <ClockIcon className="w-4 h-4" />,
      },
      approved: {
        label: 'Approved',
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircleIcon className="w-4 h-4" />,
      },
      rejected: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-700',
        icon: <XCircleIcon className="w-4 h-4" />,
      },
      // Handover statuses
      scheduled: {
        label: 'Scheduled',
        color: 'bg-blue-100 text-blue-700',
        icon: <ClockIcon className="w-4 h-4" />,
      },
    };

    return configs[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-700',
      icon: null,
    };
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${sizeClasses}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
