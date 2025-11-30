import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { separationService, organizationService } from '../../services';
import { useAuthStore } from '../../store/authStore';
import { User, CreateSeparationFormData } from '../../types';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CreateSeparationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);

  const isAdmin = user?.role === 'separation_manager';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSeparationFormData>({
    defaultValues: {
      resignation_date: new Date().toISOString().split('T')[0],
      last_working_day: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const [empData, mgrData] = await Promise.all([
        organizationService.getUsers({ role: 'employee' }),
        organizationService.getUsers({ role: 'direct_manager' }),
      ]);
      setEmployees(empData);
      setManagers(mgrData);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const onSubmit = async (data: CreateSeparationFormData) => {
    setLoading(true);
    try {
      const caseData = isAdmin
        ? data
        : { ...data, employee_id: user?.id };
      
      const newCase = await separationService.createSeparation(caseData);
      toast.success('Separation case created successfully');
      navigate(`/separations/${newCase.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create separation case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="card">
        <div className="card-header">
          <h1 className="text-xl font-semibold text-gray-900">
            {isAdmin ? 'Create New Separation Case' : 'Start Separation Process'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin
              ? 'Create a separation case for an employee'
              : 'Begin your separation process by filling out the form below'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card-body space-y-6">
          {/* Employee Selection (Admin only) */}
          {isAdmin && (
            <div>
              <label className="label">Employee *</label>
              <select
                className={`input ${errors.employee_id ? 'input-error' : ''}`}
                {...register('employee_id', { required: 'Please select an employee' })}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.email})
                  </option>
                ))}
              </select>
              {errors.employee_id && (
                <p className="mt-1 text-sm text-red-600">{errors.employee_id.message}</p>
              )}
            </div>
          )}

          {/* Direct Manager (Admin only) */}
          {isAdmin && (
            <div>
              <label className="label">Direct Manager</label>
              <select className="input" {...register('direct_manager_id')}>
                <option value="">Select manager (optional)</option>
                {managers.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.full_name} ({mgr.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Resignation Date */}
          <div>
            <label className="label">Resignation Date *</label>
            <input
              type="date"
              className={`input ${errors.resignation_date ? 'input-error' : ''}`}
              {...register('resignation_date', { required: 'Resignation date is required' })}
            />
            {errors.resignation_date && (
              <p className="mt-1 text-sm text-red-600">{errors.resignation_date.message}</p>
            )}
          </div>

          {/* Last Working Day */}
          <div>
            <label className="label">Last Working Day *</label>
            <input
              type="date"
              className={`input ${errors.last_working_day ? 'input-error' : ''}`}
              {...register('last_working_day', { required: 'Last working day is required' })}
            />
            {errors.last_working_day && (
              <p className="mt-1 text-sm text-red-600">{errors.last_working_day.message}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="label">Reason for Leaving</label>
            <textarea
              className="input min-h-[100px]"
              placeholder="Optional: Provide a reason for leaving..."
              {...register('reason')}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Additional Notes</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Any additional information..."
              {...register('notes')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Separation Case'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSeparationPage;
