import React, { useEffect, useState } from 'react';
import { organizationService } from '../../services';
import { User, Department } from '../../types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    department_id: '' as string | number,
    manager_id: '' as string | number,
    password: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, filterDept, allUsers]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userData, deptData] = await Promise.all([
        organizationService.getUsers(),
        organizationService.getDepartments(),
      ]);
      setAllUsers(userData);
      setUsers(userData);
      setDepartments(deptData);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...allUsers];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.full_name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    if (filterRole) {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    if (filterDept) {
      filtered = filtered.filter((u) => u.department_id === parseInt(filterDept));
    }

    setUsers(filtered);
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        department_id: user.department_id || '',
        manager_id: user.manager_id || '',
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'employee',
        department_id: '',
        manager_id: '',
        password: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        department_id: formData.department_id ? Number(formData.department_id) : null,
        manager_id: formData.manager_id ? Number(formData.manager_id) : null,
        role: formData.role as 'employee' | 'direct_manager' | 'department_manager' | 'separation_manager',
      };

      if (editingUser) {
        // Remove password if empty for update
        if (!payload.password) {
          delete (payload as any).password;
        }
        await organizationService.updateUser(editingUser.id, payload);
        toast.success('User updated successfully');
      } else {
        await organizationService.createUser(payload as any);
        toast.success('User created successfully');
      }
      handleCloseModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await organizationService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      employee: 'bg-gray-100 text-gray-700',
      direct_manager: 'bg-blue-100 text-blue-700',
      department_manager: 'bg-purple-100 text-purple-700',
      separation_manager: 'bg-green-100 text-green-700',
    };
    const roleLabels: Record<string, string> = {
      employee: 'Employee',
      direct_manager: 'Manager',
      department_manager: 'Dept. Manager',
      separation_manager: 'HR Admin',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleStyles[role] || roleStyles.employee}`}>
        {roleLabels[role] || role}
      </span>
    );
  };

  const getDepartmentName = (deptId: number | null) => {
    if (!deptId) return '-';
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : '-';
  };

  const getManagerName = (managerId: number | null) => {
    if (!managerId) return '-';
    const manager = allUsers.find((u) => u.id === managerId);
    return manager ? manager.full_name : '-';
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input py-2"
              >
                <option value="">All Roles</option>
                <option value="employee">Employee</option>
                <option value="direct_manager">Manager</option>
                <option value="department_manager">Dept. Manager</option>
                <option value="separation_manager">HR Admin</option>
              </select>
            </div>

            {/* Department Filter */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="input py-2"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <UserCircleIcon className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="text-gray-500 mt-2">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-700 font-medium text-sm">
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDepartmentName(user.department_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getManagerName(user.manager_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded ml-1"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={handleCloseModal}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h3>
                </div>

                <div className="px-6 py-4 space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      placeholder="user@example.com"
                      required
                      disabled={!!editingUser}
                    />
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {editingUser ? '(leave empty to keep current)' : '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input"
                      placeholder="••••••••"
                      required={!editingUser}
                      minLength={6}
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="employee">Employee</option>
                      <option value="direct_manager">Manager</option>
                      <option value="department_manager">Department Manager</option>
                      <option value="separation_manager">HR Admin</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="input"
                    >
                      <option value="">No Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Manager */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reports To
                    </label>
                    <select
                      value={formData.manager_id}
                      onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                      className="input"
                    >
                      <option value="">No Manager</option>
                      {allUsers
                        .filter((u) => u.id !== editingUser?.id && u.role !== 'employee')
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
                    {editingUser ? 'Update' : 'Create'}
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

export default UsersPage;
