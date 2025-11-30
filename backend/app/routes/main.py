"""
Main Routes
"""
from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """API root endpoint"""
    return jsonify({
        'name': 'Suvadu API',
        'version': '1.0.0',
        'description': 'The path of those who went before - Employee transition management',
        'endpoints': {
            'auth': '/auth',
            'api': '/api',
            'docs': '/api/docs'
        }
    }), 200


@main_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'suvadu-api'
    }), 200


@main_bp.route('/api/docs')
def api_docs():
    """API documentation endpoint"""
    return jsonify({
        'title': 'Employee Separation Management API',
        'version': '1.0.0',
        'endpoints': {
            'authentication': {
                'POST /auth/register': 'Register new user',
                'POST /auth/login': 'Login with email/password',
                'POST /auth/logout': 'Logout',
                'GET /auth/me': 'Get current user',
                'POST /auth/change-password': 'Change password',
                'POST /auth/google': 'Google OAuth login',
                'POST /auth/refresh': 'Refresh JWT token'
            },
            'separations': {
                'GET /api/separations': 'List separation cases',
                'POST /api/separations': 'Create new case',
                'GET /api/separations/<id>': 'Get case details',
                'PUT /api/separations/<id>': 'Update case',
                'POST /api/separations/<id>/assign-signoff-manager': 'Assign sign-off manager'
            },
            'checklist': {
                'GET /api/separations/<id>/checklist': 'Get checklist items',
                'PUT /api/separations/<id>/checklist/<item_id>': 'Update item',
                'POST /api/separations/<id>/checklist/submit': 'Submit checklist'
            },
            'signoffs': {
                'GET /api/separations/<id>/signoffs': 'Get sign-offs',
                'PUT /api/separations/<id>/signoffs/<signoff_id>': 'Process sign-off',
                'GET /api/signoffs/pending': 'Get pending sign-offs'
            },
            'handover': {
                'GET /api/separations/<id>/handover': 'Get schedules',
                'POST /api/separations/<id>/handover': 'Create schedule',
                'PUT /api/separations/<id>/handover/<schedule_id>': 'Update schedule',
                'DELETE /api/separations/<id>/handover/<schedule_id>': 'Delete schedule'
            },
            'organization': {
                'GET /api/organization/tree': 'Get org hierarchy',
                'GET /api/departments': 'List departments',
                'POST /api/departments': 'Create department',
                'GET /api/users': 'List users'
            },
            'templates': {
                'GET /api/templates': 'Get templates',
                'POST /api/templates': 'Create template',
                'PUT /api/templates/<id>': 'Update template',
                'DELETE /api/templates/<id>': 'Delete template'
            },
            'reports': {
                'GET /api/reports/dashboard': 'Dashboard statistics'
            }
        }
    }), 200
