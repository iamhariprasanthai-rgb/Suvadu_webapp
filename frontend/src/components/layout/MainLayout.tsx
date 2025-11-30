import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import SuvaduLogo from '../common/SuvaduLogo';
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentDuplicateIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManager = user?.role && ['direct_manager', 'department_manager', 'separation_manager'].includes(user.role);
  const isAdmin = user?.role === 'separation_manager';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Separations', href: '/separations', icon: DocumentTextIcon },
  ];

  const managerNavigation = [
    { name: 'Pending Sign-offs', href: '/signoffs', icon: ClipboardDocumentCheckIcon },
    { name: 'Team View', href: '/team', icon: UsersIcon },
  ];

  const adminNavigation = [
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Departments', href: '/admin/departments', icon: BuildingOfficeIcon },
    { name: 'Templates', href: '/admin/templates', icon: DocumentDuplicateIcon },
    { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
  ];

  const getRoleBadge = (role: string) => {
    const roleLabels: Record<string, { label: string; color: string }> = {
      employee: { label: 'Employee', color: 'bg-gray-100 text-gray-700' },
      direct_manager: { label: 'Manager', color: 'bg-blue-100 text-blue-700' },
      department_manager: { label: 'Dept. Manager', color: 'bg-purple-100 text-purple-700' },
      separation_manager: { label: 'HR Admin', color: 'bg-green-100 text-green-700' },
    };
    const { label, color } = roleLabels[role] || { label: role, color: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <Transition show={sidebarOpen} as={Fragment}>
        <div className="fixed inset-0 z-40 lg:hidden">
          <Transition.Child
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          </Transition.Child>
        </div>
      </Transition>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <SuvaduLogo size="sm" />
            </div>
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </div>

            {isManager && (
              <>
                <div className="mt-6 mb-2 px-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Management
                  </h3>
                </div>
                <div className="space-y-1">
                  {managerNavigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </>
            )}

            {isAdmin && (
              <>
                <div className="mt-6 mb-2 px-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administration
                  </h3>
                </div>
                <div className="space-y-1">
                  {adminNavigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-medium">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name}
                </p>
                {user?.role && getRoleBadge(user.role)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 text-sm font-medium">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.first_name}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 focus:outline-none">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/settings')}
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                      >
                        <UserCircleIcon className="w-5 h-5 text-gray-400" />
                        Profile
                      </button>
                    )}
                  </Menu.Item>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/settings')}
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                      >
                        <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
                        Settings
                      </button>
                    )}
                  </Menu.Item>
                  
                  <div className="border-t border-gray-100 mt-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600`}
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
