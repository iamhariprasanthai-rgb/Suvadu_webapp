import React, { useState } from 'react';
import { HandoverSchedule, CreateHandoverFormData } from '../../types';
import { separationService } from '../../services';
import toast from 'react-hot-toast';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';

interface HandoverSectionProps {
  caseId: number;
  schedules: HandoverSchedule[];
  canEdit: boolean;
  onUpdate: () => void;
}

const HandoverSection: React.FC<HandoverSectionProps> = ({
  caseId,
  schedules,
  canEdit,
  onUpdate,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<HandoverSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateHandoverFormData>();

  const openCreateModal = () => {
    reset({
      title: '',
      description: '',
      scheduled_date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      meeting_link: '',
    });
    setEditingSchedule(null);
    setShowModal(true);
  };

  const openEditModal = (schedule: HandoverSchedule) => {
    reset({
      title: schedule.title,
      description: schedule.description || '',
      scheduled_date: schedule.scheduled_date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      location: schedule.location || '',
      meeting_link: schedule.meeting_link || '',
    });
    setEditingSchedule(schedule);
    setShowModal(true);
  };

  const onSubmit = async (data: CreateHandoverFormData) => {
    setLoading(true);
    try {
      if (editingSchedule) {
        await separationService.updateHandoverSchedule(caseId, editingSchedule.id, data);
        toast.success('Schedule updated');
      } else {
        await separationService.createHandoverSchedule(caseId, data);
        toast.success('Schedule created');
      }
      setShowModal(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    setDeletingId(scheduleId);
    try {
      await separationService.deleteHandoverSchedule(caseId, scheduleId);
      toast.success('Schedule deleted');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete schedule');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkComplete = async (schedule: HandoverSchedule) => {
    try {
      await separationService.updateHandoverSchedule(caseId, schedule.id, {
        is_completed: !schedule.is_completed,
      });
      toast.success(schedule.is_completed ? 'Marked as incomplete' : 'Marked as complete');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  const sortedSchedules = [...schedules].sort(
    (a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      {canEdit && (
        <div className="flex justify-end">
          <button onClick={openCreateModal} className="btn-primary inline-flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            Schedule Handover
          </button>
        </div>
      )}

      {/* Schedules List */}
      {sortedSchedules.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <CalendarDaysIcon className="w-12 h-12 mx-auto text-gray-300" />
            <p className="text-gray-500 mt-4">No handover sessions scheduled</p>
            {canEdit && (
              <button onClick={openCreateModal} className="btn-primary mt-4 inline-flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                Schedule First Session
              </button>
            )}
          </div>
        </div>
      ) : (
        sortedSchedules.map((schedule) => (
          <div
            key={schedule.id}
            className={`card ${schedule.is_completed ? 'bg-gray-50' : ''}`}
          >
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-medium ${schedule.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {schedule.title}
                    </h3>
                    {schedule.is_completed && (
                      <span className="badge-success">Completed</span>
                    )}
                  </div>
                  
                  {schedule.description && (
                    <p className="text-sm text-gray-500 mt-1">{schedule.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                    <span className="inline-flex items-center">
                      <CalendarDaysIcon className="w-4 h-4 mr-1" />
                      {new Date(schedule.scheduled_date).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {schedule.start_time} - {schedule.end_time}
                    </span>
                    {schedule.location && (
                      <span className="inline-flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {schedule.location}
                      </span>
                    )}
                    {schedule.meeting_link && (
                      <a
                        href={schedule.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700"
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Join Meeting
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    Organized by: {schedule.organizer?.full_name}
                  </p>
                </div>

                {/* Actions */}
                {canEdit && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleMarkComplete(schedule)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title={schedule.is_completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      disabled={deletingId === schedule.id}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Create/Edit Modal */}
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowModal(false)}>
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
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {editingSchedule ? 'Edit Handover Session' : 'Schedule Handover Session'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                    <div>
                      <label className="label">Title *</label>
                      <input
                        type="text"
                        className={`input ${errors.title ? 'input-error' : ''}`}
                        placeholder="e.g., Project Documentation Review"
                        {...register('title', { required: 'Title is required' })}
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Description</label>
                      <textarea
                        className="input"
                        placeholder="What will be covered in this session?"
                        rows={2}
                        {...register('description')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Date *</label>
                        <input
                          type="date"
                          className={`input ${errors.scheduled_date ? 'input-error' : ''}`}
                          {...register('scheduled_date', { required: 'Date is required' })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="label">Start *</label>
                          <input
                            type="time"
                            className="input"
                            {...register('start_time', { required: true })}
                          />
                        </div>
                        <div>
                          <label className="label">End *</label>
                          <input
                            type="time"
                            className="input"
                            {...register('end_time', { required: true })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="label">Location</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g., Conference Room A"
                        {...register('location')}
                      />
                    </div>

                    <div>
                      <label className="label">Meeting Link</label>
                      <input
                        type="url"
                        className="input"
                        placeholder="https://meet.google.com/..."
                        {...register('meeting_link')}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex-1"
                      >
                        {loading ? 'Saving...' : editingSchedule ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default HandoverSection;
