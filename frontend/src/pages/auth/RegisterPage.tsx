import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { organizationService } from '../../services';
import { Department } from '../../types';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone?: string;
  employee_id?: string;
  department_id?: number;
}

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await organizationService.getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Failed to fetch departments');
      }
    };
    fetchDepartments();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        employee_id: data.employee_id,
        department_id: data.department_id ? Number(data.department_id) : undefined,
      });
      toast.success('Registration successful! Welcome!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Separation Manager</h1>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
        <p className="mt-2 text-gray-600">Get started with the separation management system</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={clearError} className="text-sm text-red-700 underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="label">
              First name
            </label>
            <input
              id="first_name"
              type="text"
              className={`input ${errors.first_name ? 'input-error' : ''}`}
              placeholder="John"
              {...register('first_name', { required: 'First name is required' })}
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="last_name" className="label">
              Last name
            </label>
            <input
              id="last_name"
              type="text"
              className={`input ${errors.last_name ? 'input-error' : ''}`}
              placeholder="Doe"
              {...register('last_name', { required: 'Last name is required' })}
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="you@company.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="employee_id" className="label">
              Employee ID (optional)
            </label>
            <input
              id="employee_id"
              type="text"
              className="input"
              placeholder="EMP001"
              {...register('employee_id')}
            />
          </div>

          <div>
            <label htmlFor="department_id" className="label">
              Department (optional)
            </label>
            <select id="department_id" className="input" {...register('department_id')}>
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="label">
            Phone number (optional)
          </label>
          <input
            id="phone"
            type="tel"
            className="input"
            placeholder="+1-555-0100"
            {...register('phone')}
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
              placeholder="Create a password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <EyeIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="Confirm your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
