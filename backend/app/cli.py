"""
CLI Commands for the application
"""
import click
from flask.cli import with_appcontext
from app import db
from app.models import User, Department, ChecklistTemplate, UserRole


def register_commands(app):
    """Register CLI commands with the app"""
    
    @app.cli.command('init-db')
    @with_appcontext
    def init_db():
        """Initialize the database"""
        db.create_all()
        click.echo('Database initialized.')
    
    @app.cli.command('drop-db')
    @with_appcontext
    def drop_db():
        """Drop all database tables"""
        if click.confirm('Are you sure you want to drop all tables?'):
            db.drop_all()
            click.echo('Database dropped.')
    
    @app.cli.command('create-sample-users')
    @with_appcontext
    def create_sample_users():
        """Create sample users for testing"""
        
        # Create departments
        departments_data = [
            {'name': 'Human Resources', 'code': 'HR', 'description': 'Human Resources Department'},
            {'name': 'Engineering', 'code': 'ENG', 'description': 'Software Engineering'},
            {'name': 'Information Technology', 'code': 'IT', 'description': 'IT Infrastructure'},
            {'name': 'Finance', 'code': 'FIN', 'description': 'Finance and Accounting'},
            {'name': 'Operations', 'code': 'OPS', 'description': 'Operations and Facilities'},
        ]
        
        departments = {}
        for dept_data in departments_data:
            dept = Department.query.filter_by(code=dept_data['code']).first()
            if not dept:
                dept = Department(**dept_data)
                db.session.add(dept)
                click.echo(f"Created department: {dept_data['name']}")
            departments[dept_data['code']] = dept
        
        db.session.commit()
        
        # Create users
        users_data = [
            {
                'email': 'hr.admin@company.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'role': UserRole.SEPARATION_MANAGER,
                'department_code': 'HR',
                'employee_id': 'EMP001',
                'phone': '+1-555-0101'
            },
            {
                'email': 'eng.lead@company.com',
                'first_name': 'Michael',
                'last_name': 'Chen',
                'role': UserRole.DIRECT_MANAGER,
                'department_code': 'ENG',
                'employee_id': 'EMP002',
                'phone': '+1-555-0102'
            },
            {
                'email': 'it.manager@company.com',
                'first_name': 'Jennifer',
                'last_name': 'Williams',
                'role': UserRole.DEPARTMENT_MANAGER,
                'department_code': 'IT',
                'employee_id': 'EMP003',
                'phone': '+1-555-0103'
            },
            {
                'email': 'fin.manager@company.com',
                'first_name': 'David',
                'last_name': 'Brown',
                'role': UserRole.DEPARTMENT_MANAGER,
                'department_code': 'FIN',
                'employee_id': 'EMP004',
                'phone': '+1-555-0104'
            },
            {
                'email': 'employee1@company.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': UserRole.EMPLOYEE,
                'department_code': 'ENG',
                'employee_id': 'EMP005',
                'phone': '+1-555-0105',
                'manager_email': 'eng.lead@company.com'
            },
            {
                'email': 'employee2@company.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'role': UserRole.EMPLOYEE,
                'department_code': 'ENG',
                'employee_id': 'EMP006',
                'phone': '+1-555-0106',
                'manager_email': 'eng.lead@company.com'
            },
        ]
        
        created_users = {}
        for user_data in users_data:
            user = User.query.filter_by(email=user_data['email']).first()
            if not user:
                user = User(
                    email=user_data['email'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    role=user_data['role'],
                    department_id=departments[user_data['department_code']].id,
                    employee_id=user_data['employee_id'],
                    phone=user_data.get('phone')
                )
                user.set_password('password123')
                db.session.add(user)
                click.echo(f"Created user: {user_data['email']}")
            created_users[user_data['email']] = user
        
        db.session.commit()
        
        # Set manager relationships
        for user_data in users_data:
            if 'manager_email' in user_data:
                user = created_users[user_data['email']]
                manager = created_users.get(user_data['manager_email'])
                if manager and user.manager_id != manager.id:
                    user.manager_id = manager.id
                    click.echo(f"Set manager for {user_data['email']}: {user_data['manager_email']}")
        
        db.session.commit()
        
        click.echo('\nSample users created successfully!')
        click.echo('Default password: password123')
        click.echo('\nAvailable accounts:')
        click.echo('- hr.admin@company.com (Separation Manager)')
        click.echo('- eng.lead@company.com (Direct Manager)')
        click.echo('- it.manager@company.com (Department Manager)')
        click.echo('- fin.manager@company.com (Department Manager)')
        click.echo('- employee1@company.com (Employee)')
        click.echo('- employee2@company.com (Employee)')
    
    @app.cli.command('create-templates')
    @with_appcontext
    def create_checklist_templates():
        """Create default checklist templates"""
        
        templates_data = [
            # IT Department
            {'name': 'Return Laptop', 'description': 'Return company-issued laptop to IT department', 'category': 'IT', 'is_mandatory': True, 'order': 1},
            {'name': 'Return Mobile Device', 'description': 'Return company mobile phone if issued', 'category': 'IT', 'is_mandatory': False, 'order': 2},
            {'name': 'Revoke System Access', 'description': 'IT to revoke all system access and credentials', 'category': 'IT', 'is_mandatory': True, 'order': 3},
            {'name': 'Transfer Files', 'description': 'Transfer all work files to designated team member', 'category': 'IT', 'is_mandatory': True, 'order': 4},
            {'name': 'Delete Personal Data', 'description': 'Remove personal data from company devices', 'category': 'IT', 'is_mandatory': True, 'order': 5},
            
            # HR Department
            {'name': 'Exit Interview', 'description': 'Complete exit interview with HR', 'category': 'HR', 'is_mandatory': True, 'order': 6},
            {'name': 'Final Settlement', 'description': 'Process final salary and benefits settlement', 'category': 'HR', 'is_mandatory': True, 'order': 7},
            {'name': 'Return ID Card', 'description': 'Return employee ID card and access badges', 'category': 'HR', 'is_mandatory': True, 'order': 8},
            {'name': 'Benefits Transition', 'description': 'Complete health insurance and benefits transition paperwork', 'category': 'HR', 'is_mandatory': True, 'order': 9},
            {'name': 'Reference Letter', 'description': 'Request experience/reference letter if needed', 'category': 'HR', 'is_mandatory': False, 'order': 10},
            
            # Finance Department
            {'name': 'Expense Reports', 'description': 'Submit all pending expense reports', 'category': 'Finance', 'is_mandatory': True, 'order': 11},
            {'name': 'Corporate Card', 'description': 'Return corporate credit card and settle pending charges', 'category': 'Finance', 'is_mandatory': True, 'order': 12},
            {'name': 'Travel Advances', 'description': 'Clear any outstanding travel advances', 'category': 'Finance', 'is_mandatory': True, 'order': 13},
            
            # Operations/Facilities
            {'name': 'Return Keys', 'description': 'Return office keys, locker keys, and parking passes', 'category': 'Operations', 'is_mandatory': True, 'order': 14},
            {'name': 'Clean Workspace', 'description': 'Clear personal belongings from workspace', 'category': 'Operations', 'is_mandatory': True, 'order': 15},
            {'name': 'Return Equipment', 'description': 'Return any other company equipment (tools, uniforms, etc.)', 'category': 'Operations', 'is_mandatory': False, 'order': 16},
            
            # Knowledge Transfer
            {'name': 'Document Processes', 'description': 'Document all ongoing projects and processes', 'category': 'Knowledge Transfer', 'is_mandatory': True, 'order': 17},
            {'name': 'Handover Sessions', 'description': 'Complete knowledge transfer sessions with team', 'category': 'Knowledge Transfer', 'is_mandatory': True, 'order': 18},
            {'name': 'Update Documentation', 'description': 'Update project documentation and runbooks', 'category': 'Knowledge Transfer', 'is_mandatory': True, 'order': 19},
            {'name': 'Share Contacts', 'description': 'Share relevant client/vendor contacts with successor', 'category': 'Knowledge Transfer', 'is_mandatory': False, 'order': 20},
        ]
        
        for template_data in templates_data:
            template = ChecklistTemplate.query.filter_by(name=template_data['name']).first()
            if not template:
                template = ChecklistTemplate(**template_data)
                db.session.add(template)
                click.echo(f"Created template: {template_data['name']}")
        
        db.session.commit()
        click.echo('\nChecklist templates created successfully!')
    
    @app.cli.command('seed-all')
    @with_appcontext
    def seed_all():
        """Run all seed commands"""
        click.echo('Seeding database...\n')
        
        # Initialize database
        db.create_all()
        click.echo('Database initialized.\n')
        
        # Create sample users (includes departments)
        from flask import current_app
        ctx = current_app.test_cli_runner()
        ctx.invoke(create_sample_users)
        
        click.echo('')
        ctx.invoke(create_checklist_templates)
        
        click.echo('\nDatabase seeded successfully!')
