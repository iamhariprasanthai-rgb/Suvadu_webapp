import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { separationService, organizationService } from '../../services';
import { User, Department, AssignSignoffFormData } from '../../types';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AssignSignoffModalProps {
  caseId: number;
  onClose: () => void;
  onAssigned: () => void;
}

const AssignSignoffModal: React.FC<AssignSignoffModalProps> = ({
  caseId,
  onClose,
  onAssigned,
}) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignSignoffFormData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptData, mgrData] = await Promise.all([
          organizationService.getDepartments(),
          organizationService.getUsers(),
        ]);
        setDepartments(deptData);
        setManagers(mgrData.filter((u) => 
          ['direct_manager', 'department_manager', 'separation_manager'].includes(u.role)
        ));
      } catch (error) {
        console.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: AssignSignoffFormData) => {
    setLoading(true);
    try {
      await separationService.assignSignoffManager(caseId, {
        manager_id: Number(data.manager_id),
        department_id: Number(data.department_id),
      });
      toast.success('Sign-off manager assigned');
      onAssigned();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to assign manager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Assign Sign-off Manager
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="label">Department *</label>
                    <select
                      className={`input ${errors.department_id ? 'input-error' : ''}`}
                      {...register('department_id', { required: 'Please select a department' })}
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {errors.department_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Manager *</label>
                    <select
                      className={`input ${errors.manager_id ? 'input-error' : ''}`}
                      {...register('manager_id', { required: 'Please select a manager' })}
                    >
                      <option value="">Select manager</option>
                      {managers.map((mgr) => (
                        <option key={mgr.id} value={mgr.id}>
                          {mgr.full_name} ({mgr.department?.name || 'No department'})
                        </option>
                      ))}
                    </select>
                    {errors.manager_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.manager_id.message}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AssignSignoffModal;
