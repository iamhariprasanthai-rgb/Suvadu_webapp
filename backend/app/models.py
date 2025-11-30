"""
Database Models for Employee Separation Management System
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db


# User Roles Enum
class UserRole:
    EMPLOYEE = 'employee'
    DIRECT_MANAGER = 'direct_manager'
    DEPARTMENT_MANAGER = 'department_manager'
    SEPARATION_MANAGER = 'separation_manager'
    
    @classmethod
    def all_roles(cls):
        return [cls.EMPLOYEE, cls.DIRECT_MANAGER, cls.DEPARTMENT_MANAGER, cls.SEPARATION_MANAGER]


# Separation Case Status Enum
class CaseStatus:
    INITIATED = 'initiated'
    CHECKLIST_PENDING = 'checklist_pending'
    CHECKLIST_SUBMITTED = 'checklist_submitted'
    SIGNOFF_PENDING = 'signoff_pending'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'


# Sign-off Status Enum
class SignOffStatus:
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'


class Department(db.Model):
    """Department model"""
    __tablename__ = 'departments'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    code = db.Column(db.String(20), nullable=False, unique=True)
    description = db.Column(db.Text)
    parent_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = db.relationship('Department', remote_side=[id], backref='children')
    users = db.relationship('User', back_populates='department', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'parent_id': self.parent_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class User(UserMixin, db.Model):
    """User model with role-based access"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(30), nullable=False, default=UserRole.EMPLOYEE)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    employee_id = db.Column(db.String(20), unique=True)
    phone = db.Column(db.String(20))
    profile_picture = db.Column(db.String(255))
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    department = db.relationship('Department', back_populates='users')
    manager = db.relationship('User', remote_side=[id], backref='direct_reports')
    separation_cases = db.relationship('SeparationCase', foreign_keys='SeparationCase.employee_id', 
                                       back_populates='employee', lazy='dynamic')
    managed_cases = db.relationship('SeparationCase', foreign_keys='SeparationCase.direct_manager_id',
                                    back_populates='direct_manager', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def is_separation_manager(self):
        return self.role == UserRole.SEPARATION_MANAGER
    
    def is_manager(self):
        return self.role in [UserRole.DIRECT_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.SEPARATION_MANAGER]
    
    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'role': self.role,
            'department_id': self.department_id,
            'department': self.department.to_dict() if self.department else None,
            'manager_id': self.manager_id,
            'employee_id': self.employee_id,
            'phone': self.phone,
            'profile_picture': self.profile_picture,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_sensitive:
            data['last_login'] = self.last_login.isoformat() if self.last_login else None
        return data


class SeparationCase(db.Model):
    """Main separation case tracking"""
    __tablename__ = 'separation_cases'
    
    id = db.Column(db.Integer, primary_key=True)
    case_number = db.Column(db.String(20), unique=True, nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    direct_manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    separation_manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Separation details
    resignation_date = db.Column(db.Date, nullable=False)
    last_working_day = db.Column(db.Date, nullable=False)
    reason = db.Column(db.Text)
    status = db.Column(db.String(30), default=CaseStatus.INITIATED)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    checklist_submitted_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    # Notes
    notes = db.Column(db.Text)
    
    # Relationships
    employee = db.relationship('User', foreign_keys=[employee_id], back_populates='separation_cases')
    direct_manager = db.relationship('User', foreign_keys=[direct_manager_id], back_populates='managed_cases')
    separation_manager = db.relationship('User', foreign_keys=[separation_manager_id])
    checklist_items = db.relationship('ChecklistItem', back_populates='separation_case', 
                                      lazy='dynamic', cascade='all, delete-orphan')
    signoffs = db.relationship('SignOff', back_populates='separation_case', 
                               lazy='dynamic', cascade='all, delete-orphan')
    handover_schedules = db.relationship('HandoverSchedule', back_populates='separation_case',
                                         lazy='dynamic', cascade='all, delete-orphan')
    
    def generate_case_number(self):
        """Generate unique case number"""
        from datetime import datetime
        year = datetime.now().year
        count = SeparationCase.query.filter(
            db.extract('year', SeparationCase.created_at) == year
        ).count() + 1
        self.case_number = f"SEP-{year}-{count:04d}"
        return self.case_number
    
    def get_progress(self):
        """Calculate separation progress percentage"""
        total_items = self.checklist_items.count()
        if total_items == 0:
            return 0
        completed_items = self.checklist_items.filter_by(is_completed=True).count()
        return int((completed_items / total_items) * 100)
    
    def get_signoff_progress(self):
        """Calculate sign-off progress"""
        total_signoffs = self.signoffs.count()
        if total_signoffs == 0:
            return 0
        approved_signoffs = self.signoffs.filter_by(status=SignOffStatus.APPROVED).count()
        return int((approved_signoffs / total_signoffs) * 100)
    
    def to_dict(self, include_details=False):
        data = {
            'id': self.id,
            'case_number': self.case_number,
            'employee_id': self.employee_id,
            'employee': self.employee.to_dict() if self.employee else None,
            'direct_manager_id': self.direct_manager_id,
            'direct_manager': self.direct_manager.to_dict() if self.direct_manager else None,
            'separation_manager_id': self.separation_manager_id,
            'resignation_date': self.resignation_date.isoformat() if self.resignation_date else None,
            'last_working_day': self.last_working_day.isoformat() if self.last_working_day else None,
            'reason': self.reason,
            'status': self.status,
            'progress': self.get_progress(),
            'signoff_progress': self.get_signoff_progress(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'notes': self.notes
        }
        if include_details:
            data['checklist_items'] = [item.to_dict() for item in self.checklist_items.all()]
            data['signoffs'] = [signoff.to_dict() for signoff in self.signoffs.all()]
            data['handover_schedules'] = [schedule.to_dict() for schedule in self.handover_schedules.all()]
        return data


class ChecklistTemplate(db.Model):
    """Reusable checklist templates"""
    __tablename__ = 'checklist_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    is_mandatory = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relationships
    department = db.relationship('Department')
    creator = db.relationship('User')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'department_id': self.department_id,
            'department': self.department.to_dict() if self.department else None,
            'is_mandatory': self.is_mandatory,
            'order': self.order,
            'is_active': self.is_active
        }


class ChecklistItem(db.Model):
    """Individual checklist items for a separation case"""
    __tablename__ = 'checklist_items'
    
    id = db.Column(db.Integer, primary_key=True)
    separation_case_id = db.Column(db.Integer, db.ForeignKey('separation_cases.id'), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey('checklist_templates.id'), nullable=True)
    
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    is_mandatory = db.Column(db.Boolean, default=False)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    completed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    notes = db.Column(db.Text)
    order = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    separation_case = db.relationship('SeparationCase', back_populates='checklist_items')
    template = db.relationship('ChecklistTemplate')
    completer = db.relationship('User', foreign_keys=[completed_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'separation_case_id': self.separation_case_id,
            'template_id': self.template_id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'is_mandatory': self.is_mandatory,
            'is_completed': self.is_completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'completed_by': self.completed_by,
            'notes': self.notes,
            'order': self.order
        }


class SignOff(db.Model):
    """Department sign-offs for separation cases"""
    __tablename__ = 'signoffs'
    
    id = db.Column(db.Integer, primary_key=True)
    separation_case_id = db.Column(db.Integer, db.ForeignKey('separation_cases.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    status = db.Column(db.String(20), default=SignOffStatus.PENDING)
    comments = db.Column(db.Text)
    
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Relationships
    separation_case = db.relationship('SeparationCase', back_populates='signoffs')
    department = db.relationship('Department')
    assignee = db.relationship('User', foreign_keys=[assigned_to])
    
    def to_dict(self):
        return {
            'id': self.id,
            'separation_case_id': self.separation_case_id,
            'department_id': self.department_id,
            'department': self.department.to_dict() if self.department else None,
            'assigned_to': self.assigned_to,
            'assignee': self.assignee.to_dict() if self.assignee else None,
            'status': self.status,
            'comments': self.comments,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class HandoverSchedule(db.Model):
    """Handover meeting schedules"""
    __tablename__ = 'handover_schedules'
    
    id = db.Column(db.Integer, primary_key=True)
    separation_case_id = db.Column(db.Integer, db.ForeignKey('separation_cases.id'), nullable=False)
    
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    scheduled_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(200))
    meeting_link = db.Column(db.String(500))
    
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    attendees = db.Column(db.JSON)  # List of user IDs
    
    calendar_event_id = db.Column(db.String(100))  # External calendar ID
    is_completed = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    separation_case = db.relationship('SeparationCase', back_populates='handover_schedules')
    organizer = db.relationship('User', foreign_keys=[organizer_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'separation_case_id': self.separation_case_id,
            'title': self.title,
            'description': self.description,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'location': self.location,
            'meeting_link': self.meeting_link,
            'organizer_id': self.organizer_id,
            'organizer': self.organizer.to_dict() if self.organizer else None,
            'attendees': self.attendees,
            'calendar_event_id': self.calendar_event_id,
            'is_completed': self.is_completed,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class EmailLog(db.Model):
    """Email audit trail"""
    __tablename__ = 'email_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    separation_case_id = db.Column(db.Integer, db.ForeignKey('separation_cases.id'), nullable=True)
    
    recipient_email = db.Column(db.String(120), nullable=False)
    recipient_name = db.Column(db.String(100))
    subject = db.Column(db.String(200), nullable=False)
    template_name = db.Column(db.String(100))
    status = db.Column(db.String(20), default='sent')  # sent, failed, pending
    error_message = db.Column(db.Text)
    
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'separation_case_id': self.separation_case_id,
            'recipient_email': self.recipient_email,
            'recipient_name': self.recipient_name,
            'subject': self.subject,
            'template_name': self.template_name,
            'status': self.status,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None
        }
