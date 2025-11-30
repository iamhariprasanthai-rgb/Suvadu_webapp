# Employee Separation Management System - Backend

Flask Python backend API for the Employee Separation Management System.

## Features

- RESTful API for separation case management
- JWT-based authentication with token refresh
- Role-based access control
- Email notifications
- Calendar integration (mock)
- SQLAlchemy ORM with migration support

## Tech Stack

- Flask 3.0.0
- SQLAlchemy 2.0.23
- Flask-Login 0.6.3
- Flask-CORS 4.0.0
- Flask-Mail 0.9.1
- Flask-Migrate 4.0.5
- PyJWT 2.8.0
- Authlib 1.2.1 (Google OAuth)

## Getting Started

### Prerequisites

- Python 3.9+
- pip

### Installation

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration.

5. Initialize the database:
```bash
flask init-db
```

6. (Optional) Create sample users:
```bash
flask create-sample-users
```

7. Run the development server:
```bash
python run.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/profile` | Update profile |
| POST | `/auth/change-password` | Change password |
| POST | `/auth/refresh` | Refresh token |

### Separation Cases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/separations` | List cases |
| POST | `/api/separations` | Create case |
| GET | `/api/separations/:id` | Get case |
| PUT | `/api/separations/:id` | Update case |
| DELETE | `/api/separations/:id` | Cancel case |

### Checklist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/separations/:id/checklist` | Get items |
| POST | `/api/separations/:id/checklist` | Add item |
| PUT | `/api/checklist/:id` | Update item |
| DELETE | `/api/checklist/:id` | Delete item |

### Sign-offs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/separations/:id/signoffs` | Get sign-offs |
| POST | `/api/separations/:id/signoffs` | Create sign-off |
| PUT | `/api/signoffs/:id` | Update sign-off |
| GET | `/api/signoffs/pending` | Pending sign-offs |

### Handover
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/separations/:id/handover` | Get schedule |
| POST | `/api/separations/:id/handover` | Schedule session |
| PUT | `/api/handover/:id` | Update session |
| DELETE | `/api/handover/:id` | Cancel session |

### Users & Organization
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/organization/tree` | Org hierarchy |
| GET | `/api/departments` | List departments |
| POST | `/api/departments` | Create department |

### Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List templates |
| POST | `/api/templates` | Create template |
| PUT | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |

## Database Models

### User
- Roles: employee, direct_manager, department_manager, separation_manager
- Relationships: Department, Manager, Direct Reports

### SeparationCase
- Status: draft, pending_approval, in_progress, completed, cancelled
- Relationships: Employee, Manager, Checklist, Sign-offs, Handover

### ChecklistItem
- Category-based organization
- Completion tracking

### SignOff
- Status: pending, approved, rejected
- Multi-level approval hierarchy

### HandoverSchedule
- Session scheduling with attendees
- Calendar integration ready

## CLI Commands

```bash
# Initialize database
flask init-db

# Create sample users for testing
flask create-sample-users
```

## Sample Users

After running `flask create-sample-users`:

| Role | Email | Password |
|------|-------|----------|
| Separation Manager | admin@example.com | password123 |
| Direct Manager | manager@example.com | password123 |
| Employee | employee@example.com | password123 |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Environment | development |
| `SECRET_KEY` | Flask secret key | - |
| `JWT_SECRET_KEY` | JWT signing key | - |
| `DATABASE_URL` | Database connection | sqlite:///app.db |
| `MAIL_SERVER` | SMTP server | - |
| `MAIL_PORT` | SMTP port | 587 |
| `MAIL_USERNAME` | SMTP username | - |
| `MAIL_PASSWORD` | SMTP password | - |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - |

## Project Structure

```
app/
├── __init__.py          # App factory
├── models.py            # SQLAlchemy models
├── cli.py               # CLI commands
├── routes/
│   ├── __init__.py      # Blueprint exports
│   ├── auth.py          # Authentication
│   ├── api.py           # REST API
│   └── main.py          # Root endpoint
└── services/
    ├── __init__.py      # Service exports
    ├── email_service.py # Email notifications
    └── calendar_service.py # Calendar integration
```
