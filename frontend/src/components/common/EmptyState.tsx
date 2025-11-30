import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center">
        {icon || <ExclamationTriangleIcon className="w-16 h-16 text-gray-300" />}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="text-gray-500 mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
