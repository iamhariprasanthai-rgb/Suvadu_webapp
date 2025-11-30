import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services';
import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);

  // Profile form
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_new_case: true,
    email_status_change: true,
    email_signoff_request: true,
    email_handover_reminder: true,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedUser = await authService.updateProfile(profileData);
      if (updatedUser && user) {
        setUser({ ...user, ...profileData });
      }
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      await authService.changePassword(passwordData.current_password, passwordData.new_password);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    const newSettings = { ...notifications, [key]: value };
    setNotifications(newSettings);
    // API call to update notification settings would go here
    toast.success('Notification settings updated');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      employee: 'Employee',
      direct_manager: 'Direct Manager',
      department_manager: 'Department Manager',
      separation_manager: 'HR Admin / Separation Manager',
    };
    return labels[role] || role;
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'password', label: 'Password', icon: KeyIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="card">
            <div className="card-body p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* User Info Card */}
          <div className="card mt-4">
            <div className="card-body text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary-700 font-semibold text-2xl">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{user?.full_name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary-600">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>{getRoleLabel(user?.role || '')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your personal information</p>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      className="input bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">Update your password regularly for security</p>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="input"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Choose what notifications you want to receive</p>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">New Case Notifications</p>
                      <p className="text-sm text-gray-500">Receive emails when a new separation case is created</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email_new_case}
                        onChange={(e) => handleNotificationUpdate('email_new_case', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Status Change Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when a case status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email_status_change}
                        onChange={(e) => handleNotificationUpdate('email_status_change', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Sign-off Requests</p>
                      <p className="text-sm text-gray-500">Receive notifications for pending sign-off approvals</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email_signoff_request}
                        onChange={(e) => handleNotificationUpdate('email_signoff_request', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Handover Reminders</p>
                      <p className="text-sm text-gray-500">Get reminders for upcoming handover sessions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email_handover_reminder}
                        onChange={(e) => handleNotificationUpdate('email_handover_reminder', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
