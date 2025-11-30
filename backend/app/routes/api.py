"""
REST API Routes for Employee Separation Management
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from app import db
from app.models import (
    User, Department, SeparationCase, ChecklistItem, ChecklistTemplate,
    SignOff, HandoverSchedule, EmailLog, UserRole, CaseStatus, SignOffStatus
)
from app.routes.auth import token_required, role_required
from app.services.email_service import EmailService
from app.services.calendar_service import CalendarService

api_bp = Blueprint('api', __name__)


# ==================== SEPARATION CASES ====================

@api_bp.route('/separations', methods=['GET'])
@token_required
def get_separations():
    """Get separation cases based on user role"""
    user = request.current_user
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')
    
    query = SeparationCase.query
    
    # Filter based on role
    if user.role == UserRole.EMPLOYEE:
        query = query.filter_by(employee_id=user.id)
    elif user.role == UserRole.DIRECT_MANAGER:
        query = query.filter_by(direct_manager_id=user.id)
    elif user.role == UserRole.DEPARTMENT_MANAGER:
        # Get cases with sign-offs assigned to this manager
        signoff_case_ids = db.session.query(SignOff.separation_case_id).filter_by(
            assigned_to=user.id
        ).subquery()
        query = query.filter(SeparationCase.id.in_(signoff_case_ids))
    # Separation managers can see all cases
    
    if status:
        query = query.filter_by(status=status)
    
    query = query.order_by(SeparationCase.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'cases': [case.to_dict() for case in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@api_bp.route('/separations', methods=['POST'])
@token_required
def create_separation():
    """Create a new separation case"""
    user = request.current_user
    data = request.get_json()
    
    # Only employees or separation managers can create cases
    if user.role not in [UserRole.EMPLOYEE, UserRole.SEPARATION_MANAGER]:
        return jsonify({'error': 'Unauthorized to create separation cases'}), 403
    
    # Determine employee
    employee_id = data.get('employee_id', user.id)
    if employee_id != user.id and not user.is_separation_manager():
        return jsonify({'error': 'Can only create case for yourself'}), 403
    
    employee = User.query.get(employee_id)
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404
    
    # Check for existing active case
    existing_case = SeparationCase.query.filter(
        SeparationCase.employee_id == employee_id,
        SeparationCase.status.notin_([CaseStatus.COMPLETED, CaseStatus.CANCELLED])
    ).first()
    
    if existing_case:
        return jsonify({'error': 'An active separation case already exists'}), 400
    
    # Create case
    case = SeparationCase(
        employee_id=employee_id,
        direct_manager_id=data.get('direct_manager_id') or employee.manager_id,
        separation_manager_id=data.get('separation_manager_id'),
        resignation_date=datetime.strptime(data['resignation_date'], '%Y-%m-%d').date(),
        last_working_day=datetime.strptime(data['last_working_day'], '%Y-%m-%d').date(),
        reason=data.get('reason'),
        notes=data.get('notes'),
        status=CaseStatus.CHECKLIST_PENDING
    )
    case.generate_case_number()
    
    db.session.add(case)
    db.session.commit()
    
    # Create default checklist items from templates
    templates = ChecklistTemplate.query.filter_by(is_active=True).all()
    for template in templates:
        item = ChecklistItem(
            separation_case_id=case.id,
            template_id=template.id,
            name=template.name,
            description=template.description,
            category=template.category,
            is_mandatory=template.is_mandatory,
            order=template.order
        )
        db.session.add(item)
    
    db.session.commit()
    
    # Send notification email
    EmailService.send_case_created_notification(case)
    
    return jsonify({
        'message': 'Separation case created successfully',
        'case': case.to_dict(include_details=True)
    }), 201


@api_bp.route('/separations/<int:case_id>', methods=['GET'])
@token_required
def get_separation(case_id):
    """Get a specific separation case"""
    user = request.current_user
    case = SeparationCase.query.get_or_404(case_id)
    
    # Check access
    if not can_access_case(user, case):
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({'case': case.to_dict(include_details=True)}), 200


@api_bp.route('/separations/<int:case_id>', methods=['PUT'])
@token_required
def update_separation(case_id):
    """Update a separation case"""
    user = request.current_user
    case = SeparationCase.query.get_or_404(case_id)
    data = request.get_json()
    
    # Check access
    if not can_access_case(user, case, write=True):
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Update fields
    if 'last_working_day' in data:
        case.last_working_day = datetime.strptime(data['last_working_day'], '%Y-%m-%d').date()
    if 'reason' in data:
        case.reason = data['reason']
    if 'notes' in data:
        case.notes = data['notes']
    if 'status' in data and user.is_separation_manager():
        case.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Case updated successfully',
        'case': case.to_dict()
    }), 200


@api_bp.route('/separations/<int:case_id>/assign-signoff-manager', methods=['POST'])
@token_required
@role_required(UserRole.SEPARATION_MANAGER)
def assign_signoff_manager(case_id):
    """Assign a manager for sign-off"""
    case = SeparationCase.query.get_or_404(case_id)
    data = request.get_json()
    
    manager_id = data.get('manager_id')
    department_id = data.get('department_id')
    
    if not manager_id or not department_id:
        return jsonify({'error': 'Manager ID and Department ID are required'}), 400
    
    manager = User.query.get(manager_id)
    if not manager or not manager.is_manager():
        return jsonify({'error': 'Invalid manager'}), 400
    
    department = Department.query.get(department_id)
    if not department:
        return jsonify({'error': 'Invalid department'}), 400
    
    # Check if sign-off already exists
    existing = SignOff.query.filter_by(
        separation_case_id=case_id,
        department_id=department_id
    ).first()
    
    if existing:
        return jsonify({'error': 'Sign-off already assigned for this department'}), 400
    
    signoff = SignOff(
        separation_case_id=case_id,
        department_id=department_id,
        assigned_to=manager_id
    )
    
    db.session.add(signoff)
    
    # Update case status if needed
    if case.status == CaseStatus.CHECKLIST_SUBMITTED:
        case.status = CaseStatus.SIGNOFF_PENDING
    
    db.session.commit()
    
    # Send notification
    EmailService.send_signoff_assignment_notification(signoff)
    
    return jsonify({
        'message': 'Sign-off manager assigned',
        'signoff': signoff.to_dict()
    }), 201


# ==================== CHECKLIST ====================

@api_bp.route('/separations/<int:case_id>/checklist', methods=['GET'])
@token_required
def get_checklist(case_id):
    """Get checklist items for a case"""
    user = request.current_user
    case = SeparationCase.query.get_or_404(case_id)
    
    if not can_access_case(user, case):
        return jsonify({'error': 'Unauthorized'}), 403
    
    items = ChecklistItem.query.filter_by(
        separation_case_id=case_id
    ).order_by(ChecklistItem.order).all()
    
    return jsonify({
        'items': [item.to_dict() for item in items],
        'progress': case.get_progress()
    }), 200


@api_bp.route('/separations/<int:case_id>/checklist/<int:item_id>', methods=['PUT'])
@token_required
def update_checklist_item(case_id, item_id):
    """Update a checklist item"""
    user = request.current_user
    case = SeparationCase.query.get_or_404(case_id)
    
    # Only employee or separation manager can update
    if case.employee_id != user.id and not user.is_separation_manager():
        return jsonify({'error': 'Unauthorized'}), 403
    
    item = ChecklistItem.query.filter_by(
        id=item_id,
        separation_case_id=case_id
    ).first_or_404()
    
    data = request.get_json()
    
    if 'is_completed' in data:
        item.is_completed = data['is_completed']
        if data['is_completed']:
            item.completed_at = datetime.utcnow()
            item.completed_by = user.id
        else:
            item.completed_at = None
            item.completed_by = None
    
    if 'notes' in data:
        item.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Item updated',
        'item': item.to_dict(),
        'progress': case.get_progress()
    }), 200


@api_bp.route('/separations/<int:case_id>/checklist/submit', methods=['POST'])
@token_required
def submit_checklist(case_id):
    """Submit completed checklist for approval"""
    user = request.current_user
    case = SeparationCase.query.get_or_404(case_id)
    
    if case.employee_id != user.id:
        return jsonify({'error': 'Only the employee can submit their checklist'}), 403
    
    # Check mandatory items
    mandatory_incomplete = ChecklistItem.query.filter_by(
        separation_case_id=case_id,
        is_mandatory=True,
        is_completed=False
    ).count()
    
    if mandatory_incomplete > 0:
        return jsonify({
            'error': f'{mandatory_incomplete} mandatory items are not completed'
        }), 400
    
    case.status = CaseStatus.CHECKLIST_SUBMITTED
    case.checklist_submitted_at = datetime.utcnow()
    db.session.commit()
    
    # Notify direct manager
    if case.direct_manager:
        EmailService.send_checklist_submitted_notification(case)
    
    return jsonify({
        'message': 'Checklist submitted successfully',
        'case': case.to_dict()
    }), 200


# ==================== SIGN-OFFS ====================

@api_bp.route('/separations/<int:case_id>/signoffs', methods=['GET'])
@token_required
def get_signoffs(case_id):
    """Get sign-offs for a case"""
    user = request.current_user
    case = SeparationCase.query.get_or_404(case_id)
    
    if not can_access_case(user, case):
        return jsonify({'error': 'Unauthorized'}), 403
    
    signoffs = SignOff.query.filter_by(separation_case_id=case_id).all()
    
    return jsonify({
        'signoffs': [s.to_dict() for s in signoffs],
        'progress': case.get_signoff_progress()
    }), 200


@api_bp.route('/separations/<int:case_id>/signoffs/<int:signoff_id>', methods=['PUT'])
@token_required
def process_signoff(case_id, signoff_id):
    """Approve or reject a sign-off"""
    user = request.current_user
    signoff = SignOff.query.filter_by(
        id=signoff_id,
        separation_case_id=case_id
    ).first_or_404()
    
    # Check if user is assigned to this sign-off
    if signoff.assigned_to != user.id and not user.is_separation_manager():
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    status = data.get('status')
    
    if status not in [SignOffStatus.APPROVED, SignOffStatus.REJECTED]:
        return jsonify({'error': 'Invalid status'}), 400
    
    signoff.status = status
    signoff.comments = data.get('comments')
    signoff.completed_at = datetime.utcnow()
    
    case = signoff.separation_case
    
    # Check if all sign-offs are complete
    pending_signoffs = SignOff.query.filter_by(
        separation_case_id=case_id,
        status=SignOffStatus.PENDING
    ).count()
    
    if pending_signoffs == 0:
        # Check if any were rejected
        rejected = SignOff.query.filter_by(
            separation_case_id=case_id,
            status=SignOffStatus.REJECTED
        ).count()
        
        if rejected == 0:
            case.status = CaseStatus.COMPLETED
            case.completed_at = datetime.utcnow()
            EmailService.send_separation_completed_notification(case)
    
    db.session.commit()
    
    # Send notification
    EmailService.send_signoff_processed_notification(signoff)
    
    return jsonify({
        'message': f'Sign-off {status}',
        'signoff': signoff.to_dict(),
        'case_status': case.status
    }), 200


@api_bp.route('/signoffs/pending', methods=['GET'])
@token_required
def get_pending_signoffs():
    """Get pending sign-offs for current user"""
    user = request.current_user
    
    if not user.is_manager():
        return jsonify({'error': 'Only managers can view sign-offs'}), 403
    
    query = SignOff.query.filter_by(status=SignOffStatus.PENDING)
    
    if not user.is_separation_manager():
        query = query.filter_by(assigned_to=user.id)
    
    signoffs = query.all()
    
    return jsonify({
        'signoffs': [s.to_dict() for s in signoffs],
        'count': len(signoffs)
    }), 200


# ==================== HANDOVER SCHEDULES ====================

@api_bp.route('/separations/<int:case_id>/handover', methods=['GET'])
@token_required
def get_handover_schedules(case_id):
    """Get handover schedules for a case"""
    user = request.current_user
    case = SeparationCase.query.get_or_404(case_id)
    
    if not can_access_case(user, case):
        return jsonify({'error': 'Unauthorized'}), 403
    
    schedules = HandoverSchedule.query.filter_by(
        separation_case_id=case_id
    ).order_by(HandoverSchedule.scheduled_date).all()
    
    return jsonify({
        'schedules': [s.to_dict() for s in schedules]
    }), 200


@api_bp.route('/separations/<int:case_id>/handover', methods=['POST'])
@token_required
def create_handover_schedule(case_id):
    """Create a new handover schedule"""
    user = request.current_user
    case = SeparationCase.query.get_or_404(case_id)
    
    # Employee or direct manager can create schedules
    if case.employee_id != user.id and case.direct_manager_id != user.id and not user.is_separation_manager():
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    schedule = HandoverSchedule(
        separation_case_id=case_id,
        title=data['title'],
        description=data.get('description'),
        scheduled_date=datetime.strptime(data['scheduled_date'], '%Y-%m-%d').date(),
        start_time=datetime.strptime(data['start_time'], '%H:%M').time(),
        end_time=datetime.strptime(data['end_time'], '%H:%M').time(),
        location=data.get('location'),
        meeting_link=data.get('meeting_link'),
        organizer_id=user.id,
        attendees=data.get('attendees', [])
    )
    
    db.session.add(schedule)
    db.session.commit()
    
    # Create calendar event
    calendar_event_id = CalendarService.create_event(schedule)
    if calendar_event_id:
        schedule.calendar_event_id = calendar_event_id
        db.session.commit()
    
    return jsonify({
        'message': 'Handover scheduled',
        'schedule': schedule.to_dict()
    }), 201


@api_bp.route('/separations/<int:case_id>/handover/<int:schedule_id>', methods=['PUT'])
@token_required
def update_handover_schedule(case_id, schedule_id):
    """Update a handover schedule"""
    user = request.current_user
    schedule = HandoverSchedule.query.filter_by(
        id=schedule_id,
        separation_case_id=case_id
    ).first_or_404()
    
    case = schedule.separation_case
    if case.employee_id != user.id and case.direct_manager_id != user.id and not user.is_separation_manager():
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        schedule.title = data['title']
    if 'description' in data:
        schedule.description = data['description']
    if 'scheduled_date' in data:
        schedule.scheduled_date = datetime.strptime(data['scheduled_date'], '%Y-%m-%d').date()
    if 'start_time' in data:
        schedule.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
    if 'end_time' in data:
        schedule.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
    if 'location' in data:
        schedule.location = data['location']
    if 'meeting_link' in data:
        schedule.meeting_link = data['meeting_link']
    if 'attendees' in data:
        schedule.attendees = data['attendees']
    if 'is_completed' in data:
        schedule.is_completed = data['is_completed']
    if 'notes' in data:
        schedule.notes = data['notes']
    
    db.session.commit()
    
    # Update calendar event
    CalendarService.update_event(schedule)
    
    return jsonify({
        'message': 'Schedule updated',
        'schedule': schedule.to_dict()
    }), 200


@api_bp.route('/separations/<int:case_id>/handover/<int:schedule_id>', methods=['DELETE'])
@token_required
def delete_handover_schedule(case_id, schedule_id):
    """Delete a handover schedule"""
    user = request.current_user
    schedule = HandoverSchedule.query.filter_by(
        id=schedule_id,
        separation_case_id=case_id
    ).first_or_404()
    
    case = schedule.separation_case
    if case.employee_id != user.id and case.direct_manager_id != user.id and not user.is_separation_manager():
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Delete calendar event
    CalendarService.delete_event(schedule)
    
    db.session.delete(schedule)
    db.session.commit()
    
    return jsonify({'message': 'Schedule deleted'}), 200


# ==================== ORGANIZATION ====================

@api_bp.route('/organization/tree', methods=['GET'])
@token_required
def get_organization_tree():
    """Get organizational hierarchy"""
    user = request.current_user
    
    if user.role == UserRole.EMPLOYEE:
        # Employees can only see their direct manager
        if user.manager:
            return jsonify({
                'tree': [{
                    'user': user.manager.to_dict(),
                    'reports': [user.to_dict()]
                }]
            }), 200
        return jsonify({'tree': []}), 200
    
    # Build tree for managers
    def build_tree(manager):
        return {
            'user': manager.to_dict(),
            'reports': [build_tree(report) for report in manager.direct_reports if report.is_active]
        }
    
    if user.is_separation_manager():
        # Full tree from root managers
        root_managers = User.query.filter(
            User.manager_id.is_(None),
            User.is_active == True,
            User.role.in_([UserRole.DIRECT_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.SEPARATION_MANAGER])
        ).all()
        tree = [build_tree(m) for m in root_managers]
    else:
        # Only this manager's team
        tree = [build_tree(user)]
    
    return jsonify({'tree': tree}), 200


@api_bp.route('/departments', methods=['GET'])
@token_required
def get_departments():
    """Get all departments"""
    departments = Department.query.all()
    return jsonify({
        'departments': [d.to_dict() for d in departments]
    }), 200


@api_bp.route('/departments', methods=['POST'])
@token_required
@role_required(UserRole.SEPARATION_MANAGER)
def create_department():
    """Create a new department"""
    data = request.get_json()
    
    if Department.query.filter_by(code=data['code']).first():
        return jsonify({'error': 'Department code already exists'}), 400
    
    department = Department(
        name=data['name'],
        code=data['code'],
        description=data.get('description'),
        parent_id=data.get('parent_id')
    )
    
    db.session.add(department)
    db.session.commit()
    
    return jsonify({
        'message': 'Department created',
        'department': department.to_dict()
    }), 201


# ==================== TEMPLATES ====================

@api_bp.route('/templates', methods=['GET'])
@token_required
def get_templates():
    """Get checklist templates"""
    templates = ChecklistTemplate.query.filter_by(is_active=True).order_by(
        ChecklistTemplate.order
    ).all()
    
    return jsonify({
        'templates': [t.to_dict() for t in templates]
    }), 200


@api_bp.route('/templates', methods=['POST'])
@token_required
@role_required(UserRole.SEPARATION_MANAGER)
def create_template():
    """Create a checklist template"""
    user = request.current_user
    data = request.get_json()
    
    template = ChecklistTemplate(
        name=data['name'],
        description=data.get('description'),
        category=data.get('category'),
        department_id=data.get('department_id'),
        is_mandatory=data.get('is_mandatory', False),
        order=data.get('order', 0),
        created_by=user.id
    )
    
    db.session.add(template)
    db.session.commit()
    
    return jsonify({
        'message': 'Template created',
        'template': template.to_dict()
    }), 201


@api_bp.route('/templates/<int:template_id>', methods=['PUT'])
@token_required
@role_required(UserRole.SEPARATION_MANAGER)
def update_template(template_id):
    """Update a checklist template"""
    template = ChecklistTemplate.query.get_or_404(template_id)
    data = request.get_json()
    
    if 'name' in data:
        template.name = data['name']
    if 'description' in data:
        template.description = data['description']
    if 'category' in data:
        template.category = data['category']
    if 'department_id' in data:
        template.department_id = data['department_id']
    if 'is_mandatory' in data:
        template.is_mandatory = data['is_mandatory']
    if 'order' in data:
        template.order = data['order']
    if 'is_active' in data:
        template.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Template updated',
        'template': template.to_dict()
    }), 200


@api_bp.route('/templates/<int:template_id>', methods=['DELETE'])
@token_required
@role_required(UserRole.SEPARATION_MANAGER)
def delete_template(template_id):
    """Delete (deactivate) a checklist template"""
    template = ChecklistTemplate.query.get_or_404(template_id)
    template.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'Template deleted'}), 200


# ==================== USER MANAGEMENT ====================

@api_bp.route('/users', methods=['GET'])
@token_required
def get_users():
    """Get all users (filtered by role for non-admins)"""
    user = request.current_user
    role = request.args.get('role')
    department_id = request.args.get('department_id', type=int)
    
    query = User.query.filter_by(is_active=True)
    
    if role:
        query = query.filter_by(role=role)
    if department_id:
        query = query.filter_by(department_id=department_id)
    
    # Non-admins can only see users in their department or reports
    if not user.is_separation_manager():
        if user.department_id:
            query = query.filter_by(department_id=user.department_id)
    
    users = query.order_by(User.first_name, User.last_name).all()
    
    return jsonify({
        'users': [u.to_dict() for u in users]
    }), 200


@api_bp.route('/users', methods=['POST'])
@token_required
@role_required(UserRole.SEPARATION_MANAGER)
def create_user():
    """Create a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email'].lower()).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data['email'].lower(),
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data.get('role', UserRole.EMPLOYEE),
        department_id=data.get('department_id'),
        manager_id=data.get('manager_id'),
        phone=data.get('phone'),
        employee_id=data.get('employee_id')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User created',
        'user': user.to_dict()
    }), 201


@api_bp.route('/users/<int:user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    """Get user details"""
    user = User.query.get_or_404(user_id)
    return jsonify({'user': user.to_dict()}), 200


@api_bp.route('/users/<int:user_id>', methods=['PUT'])
@token_required
@role_required(UserRole.SEPARATION_MANAGER)
def update_user(user_id):
    """Update user details"""
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'role' in data:
        user.role = data['role']
    if 'department_id' in data:
        user.department_id = data['department_id']
    if 'manager_id' in data:
        user.manager_id = data['manager_id']
    if 'phone' in data:
        user.phone = data['phone']
    if 'is_active' in data:
        user.is_active = data['is_active']
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'User updated',
        'user': user.to_dict()
    }), 200


@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
@role_required(UserRole.SEPARATION_MANAGER)
def delete_user(user_id):
    """Delete (deactivate) a user"""
    user = User.query.get_or_404(user_id)
    user.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'User deleted'}), 200


# ==================== ORGANIZATION ====================

@api_bp.route('/organization/tree', methods=['GET'])
@token_required
def get_org_tree():
    """Get organizational hierarchy tree"""
    user = request.current_user
    
    def build_tree(manager_id):
        reports = User.query.filter_by(
            manager_id=manager_id,
            is_active=True
        ).order_by(User.first_name).all()
        
        return [{
            'user': u.to_dict(),
            'reports': build_tree(u.id) if u.role in [UserRole.DIRECT_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.SEPARATION_MANAGER] else []
        } for u in reports]
    
    # Start from top-level managers (no manager) or from current user's reports
    if user.is_separation_manager():
        # Get top-level managers
        top_users = User.query.filter(
            User.manager_id.is_(None),
            User.is_active == True
        ).order_by(User.first_name).all()
        
        tree = [{
            'user': u.to_dict(),
            'reports': build_tree(u.id)
        } for u in top_users]
    else:
        # Show current user's direct reports
        tree = build_tree(user.id)
        # Add current user as root
        tree = [{
            'user': user.to_dict(),
            'reports': tree
        }]
    
    return jsonify({'tree': tree}), 200


# ==================== REPORTS ====================

@api_bp.route('/reports/dashboard', methods=['GET'])
@token_required
def get_dashboard_stats():
    """Get dashboard statistics"""
    user = request.current_user
    
    if user.role == UserRole.EMPLOYEE:
        # Employee stats
        case = SeparationCase.query.filter_by(employee_id=user.id).first()
        return jsonify({
            'has_case': case is not None,
            'case': case.to_dict() if case else None,
            'progress': case.get_progress() if case else 0,
            'signoff_progress': case.get_signoff_progress() if case else 0
        }), 200
    
    # Manager/Admin stats
    stats = {
        'total_cases': SeparationCase.query.count(),
        'active_cases': SeparationCase.query.filter(
            SeparationCase.status.notin_([CaseStatus.COMPLETED, CaseStatus.CANCELLED])
        ).count(),
        'completed_cases': SeparationCase.query.filter_by(status=CaseStatus.COMPLETED).count(),
        'pending_signoffs': SignOff.query.filter_by(status=SignOffStatus.PENDING).count()
    }
    
    if not user.is_separation_manager():
        # Filter by managed cases
        stats['pending_signoffs'] = SignOff.query.filter_by(
            assigned_to=user.id,
            status=SignOffStatus.PENDING
        ).count()
    
    # Recent cases
    recent_cases = SeparationCase.query.order_by(
        SeparationCase.created_at.desc()
    ).limit(5).all()
    
    stats['recent_cases'] = [c.to_dict() for c in recent_cases]
    
    return jsonify(stats), 200


# ==================== HELPER FUNCTIONS ====================

def can_access_case(user, case, write=False):
    """Check if user can access a separation case"""
    if user.is_separation_manager():
        return True
    if case.employee_id == user.id:
        return True
    if case.direct_manager_id == user.id:
        return True
    
    # Check if user has a sign-off for this case
    signoff = SignOff.query.filter_by(
        separation_case_id=case.id,
        assigned_to=user.id
    ).first()
    
    if signoff:
        return not write  # Can view but not edit
    
    return False
