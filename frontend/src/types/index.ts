// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  department_id: number | null;
  department: Department | null;
  manager_id: number | null;
  employee_id: string | null;
  phone: string | null;
  profile_picture: string | null;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export type UserRole = 'employee' | 'direct_manager' | 'department_manager' | 'separation_manager';

// Department types
export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  parent_id: number | null;
  manager_id: number | null;
  created_at: string;
}

// Separation Case types
export interface SeparationCase {
  id: number;
  case_number: string;
  employee_id: number;
  employee: User;
  direct_manager_id: number | null;
  direct_manager: User | null;
  separation_manager_id: number | null;
  resignation_date: string;
  last_working_day: string;
  reason: string | null;
  status: CaseStatus;
  progress: number;
  signoff_progress: number;
  created_at: string;
  updated_at: string;
  notes: string | null;
  checklist_items?: ChecklistItem[];
  signoffs?: SignOff[];
  handover_schedules?: HandoverSchedule[];
}

export type CaseStatus = 
  | 'initiated' 
  | 'checklist_pending' 
  | 'checklist_submitted' 
  | 'signoff_pending' 
  | 'completed' 
  | 'cancelled';

// Checklist types
export interface ChecklistItem {
  id: number;
  separation_case_id: number;
  template_id: number | null;
  name: string;
  description: string | null;
  category: string | null;
  is_mandatory: boolean;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: number | null;
  notes: string | null;
  order: number;
}

export interface ChecklistTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  department_id: number | null;
  department: Department | null;
  is_mandatory: boolean;
  order: number;
  is_active: boolean;
  items: string[];
}

// Sign-off types
export interface SignOff {
  id: number;
  separation_case_id: number;
  department_id: number;
  department: Department;
  assigned_to: number;
  assignee: User;
  status: SignOffStatus;
  comments: string | null;
  assigned_at: string;
  completed_at: string | null;
}

export type SignOffStatus = 'pending' | 'approved' | 'rejected';

// Handover Schedule types
export interface HandoverSchedule {
  id: number;
  separation_case_id: number;
  title: string;
  description: string | null;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  meeting_link: string | null;
  organizer_id: number;
  organizer: User;
  attendees: number[];
  calendar_event_id: string | null;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
}

// Organization Tree types
export interface OrgTreeNode {
  user: User;
  reports: OrgTreeNode[];
}

// Dashboard Stats types
export interface DashboardStats {
  total_cases: number;
  active_cases: number;
  completed_cases: number;
  pending_signoffs: number;
  recent_cases: SeparationCase[];
  // Employee specific
  has_case?: boolean;
  case?: SeparationCase;
  progress?: number;
  signoff_progress?: number;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  current_page: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  employee_id?: string;
  department_id?: number;
}

export interface CreateSeparationFormData {
  employee_id?: number;
  direct_manager_id?: number;
  resignation_date: string;
  last_working_day: string;
  reason?: string;
  notes?: string;
}

export interface CreateHandoverFormData {
  title: string;
  description?: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  meeting_link?: string;
  attendees?: number[];
}

export interface AssignSignoffFormData {
  manager_id: number;
  department_id: number;
}
