# Employee Separation Management System

A comprehensive full-stack application for managing employee separation processes, built with React JS frontend and Flask Python backend.

## 🚀 Features

### Role-Based Access Control
- **Employee (Suvadu)**: View and manage personal separation checklist and handover
- **Direct Manager**: Approve sign-offs, view team separations
- **Separation Manager (HR/Admin)**: Full administrative control, reports, user management

### Core Features
- **Checklist Management**: Customizable separation checklists with progress tracking
- **Sign-off Workflow**: Multi-level approval hierarchy
- **Handover Scheduling**: Calendar integration for knowledge transfer sessions
- **Email Notifications**: Automated notifications for status changes
- **Reports & Analytics**: Dashboard with metrics and trends

## 📁 Project Structure

```
suvadu/
├── backend/                    # Flask Python Backend
│   ├── app/
│   │   ├── __init__.py        # App factory with extensions
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── cli.py             # CLI commands
│   │   ├── routes/
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── api.py         # REST API endpoints
│   │   │   └── main.py        # Root endpoint
│   │   └── services/
│   │       ├── email_service.py
│   │       └── calendar_service.py
│   ├── requirements.txt
│   ├── run.py
│   └── .env.example
│
└── frontend/                   # React TypeScript Frontend
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/        # Shared components
    │   │   ├── layout/        # Layout components
    │   │   └── separation/    # Separation-specific components
    │   ├── pages/
    │   │   ├── auth/          # Login, Register
    │   │   ├── separations/   # Case management
    │   │   ├── manager/       # Manager-specific pages
    │   │   └── admin/         # Admin pages
    │   ├── services/          # API services
    │   ├── store/             # Zustand state management
    │   └── types/             # TypeScript interfaces
    ├── package.json
    ├── tailwind.config.js
    └── tsconfig.json
```

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 3.0.0
- **Database ORM**: SQLAlchemy 2.0.23
- **Authentication**: Flask-Login + JWT (PyJWT)
- **CORS**: Flask-CORS
- **Email**: Flask-Mail
- **Migration**: Flask-Migrate

### Frontend
- **Framework**: React 18.2.0 with TypeScript
- **Routing**: React Router DOM 6.20.1
- **State Management**: Zustand
- **Styling**: Tailwind CSS 3.3.6
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **UI Components**: Headless UI, Heroicons
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize the database:
```bash
flask init-db
flask create-sample-users  # Optional: creates test users
```

6. Run the development server:
```bash
python run.py
# Or: flask run --debug
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `POST /auth/change-password` - Change password

### Separation Cases
- `GET /api/separations` - List separation cases
- `POST /api/separations` - Create new case
- `GET /api/separations/:id` - Get case details
- `PUT /api/separations/:id` - Update case
- `DELETE /api/separations/:id` - Cancel case

### Checklist
- `GET /api/separations/:id/checklist` - Get checklist items
- `POST /api/separations/:id/checklist` - Add checklist item
- `PUT /api/checklist/:id` - Update checklist item
- `DELETE /api/checklist/:id` - Delete checklist item

### Sign-offs
- `GET /api/separations/:id/signoffs` - Get sign-offs
- `POST /api/separations/:id/signoffs` - Create sign-off
- `PUT /api/signoffs/:id` - Update sign-off
- `GET /api/signoffs/pending` - Get pending sign-offs for current user

### Handover
- `GET /api/separations/:id/handover` - Get handover schedule
- `POST /api/separations/:id/handover` - Schedule handover session
- `PUT /api/handover/:id` - Update handover
- `DELETE /api/handover/:id` - Cancel handover

### Organization
- `GET /api/organization/tree` - Get org hierarchy
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Departments
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Templates
- `GET /api/templates` - List checklist templates
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

## 👥 Sample Users

After running `flask create-sample-users`, the following test accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Separation Manager | admin@example.com | password123 |
| Direct Manager | manager@example.com | password123 |
| Employee | employee@example.com | password123 |

## 📝 Database Models

### User
- id, email, password_hash
- first_name, last_name, phone
- role (employee, direct_manager, department_manager, separation_manager)
- department_id, manager_id
- is_active, last_login

### Department
- id, name, description
- manager_id

### SeparationCase
- id, case_number
- employee_id, direct_manager_id, separation_manager_id
- resignation_date, last_working_date
- reason, notes, status

### ChecklistItem
- id, separation_case_id
- title, description, category
- is_completed, completed_at, completed_by

### ChecklistTemplate
- id, name, description
- category, department_id
- is_mandatory, is_active

### SignOff
- id, separation_case_id
- assigned_to, type
- status, comments
- signed_at

### HandoverSchedule
- id, separation_case_id
- title, description
- scheduled_date, duration
- attendees, location, status

## 🔒 Security

- JWT-based authentication with token refresh
- Password hashing with Werkzeug
- Role-based access control
- CORS configuration for cross-origin requests
- Input validation and sanitization

## 🎨 UI Components

The frontend includes:
- Responsive sidebar navigation
- Role-based menu items
- Dashboard with statistics
- Data tables with pagination
- Modal dialogs
- Form validation
- Toast notifications
- Loading states
- Empty states

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
