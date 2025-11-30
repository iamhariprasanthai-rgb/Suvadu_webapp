import React, { useEffect, useState } from 'react';
import { organizationService } from '../../services';
import { Department, User } from '../../types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_id: '' as string | number,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptData, userData] = await Promise.all([
        organizationService.getDepartments(),
        organizationService.getUsers(),
      ]);
      setDepartments(deptData);
      setUsers(userData);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        description: dept.description || '',
        manager_id: dept.manager_id || '',
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        description: '',
        manager_id: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDept(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        manager_id: formData.manager_id ? Number(formData.manager_id) : null,
      };

      if (editingDept) {
        await organizationService.updateDepartment(editingDept.id, payload);
        toast.success('Department updated successfully');
      } else {
        await organizationService.createDepartment(payload);
        toast.success('Department created successfully');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error('Failed to save department');
    }
  };

  const handleDelete = async (deptId: number) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }
    
    try {
      await organizationService.deleteDepartment(deptId);
      toast.success('Department deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete department. Make sure no employees are assigned to it.');
    }
  };

  const getManagerName = (managerId: number | null) => {
    if (!managerId) return null;
    const manager = users.find((u) => u.id === managerId);
    return manager ? manager.full_name : 'Unknown';
  };

  const getEmployeeCount = (deptId: number) => {
    return users.filter((u) => u.department_id === deptId).length;
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage organization departments</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Department
        </button>
      </div>

      {/* Departments List */}
      {departments.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No departments yet</h3>
            <p className="text-gray-500 mt-2">Create your first department to organize your team.</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary mt-4"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Department
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(dept)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                {dept.description && (
                  <p className="text-sm text-gray-500 mt-1">{dept.description}</p>
                )}

                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Manager</span>
                    <span className="font-medium text-gray-900">
                      {getManagerName(dept.manager_id) || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      Employees
                    </span>
                    <span className="font-medium text-gray-900">{getEmployeeCount(dept.id)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={handleCloseModal}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingDept ? 'Edit Department' : 'Add New Department'}
                  </h3>
                </div>

                <div className="px-6 py-4 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="e.g., Engineering"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input"
                      rows={3}
                      placeholder="Brief description of the department..."
                    />
                  </div>

                  {/* Manager */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Manager
                    </label>
                    <select
                      value={formData.manager_id}
                      onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                      className="input"
                    >
                      <option value="">Select a manager</option>
                      {users
                        .filter((u) => u.role !== 'employee')
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name} ({user.role.replace('_', ' ')})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingDept ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
