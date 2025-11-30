"""
Authentication Routes
"""
from datetime import datetime
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
import jwt
from app import db
from app.models import User, UserRole

auth_bp = Blueprint('auth', __name__)


def generate_token(user):
    """Generate JWT token for user"""
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.utcnow().timestamp() + current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 86400)
    }
    token = jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    return token


def token_required(f):
    """Decorator to require JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            user = User.query.get(payload['user_id'])
            if not user or not user.is_active:
                return jsonify({'error': 'Invalid or inactive user'}), 401
            request.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated


def role_required(*roles):
    """Decorator to require specific roles"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = getattr(request, 'current_user', None) or current_user
            if not user or not user.is_authenticated:
                return jsonify({'error': 'Authentication required'}), 401
            if user.role not in roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email'].lower()).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create new user
    user = User(
        email=data['email'].lower(),
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data.get('role', UserRole.EMPLOYEE),
        department_id=data.get('department_id'),
        phone=data.get('phone'),
        employee_id=data.get('employee_id')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate token
    token = generate_token(user)
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict(),
        'token': token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with email and password"""
    data = request.get_json()
    
    email = data.get('email', '').lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 401
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Login user for session-based auth
    login_user(user)
    
    # Generate token
    token = generate_token(user)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(include_sensitive=True),
        'token': token
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout user"""
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current authenticated user"""
    return jsonify({
        'user': request.current_user.to_dict(include_sensitive=True)
    }), 200


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user profile"""
    data = request.get_json()
    user = request.current_user
    
    # Update allowed fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict(include_sensitive=True)
    }), 200


@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    """Change user password"""
    data = request.get_json()
    user = request.current_user
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current and new passwords are required'}), 400
    
    if not user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    data = request.get_json()
    email = data.get('email', '').lower()
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    # Always return success to prevent email enumeration
    if user:
        # TODO: Generate reset token and send email
        pass
    
    return jsonify({
        'message': 'If the email exists, a password reset link will be sent'
    }), 200


@auth_bp.route('/google', methods=['POST'])
def google_login():
    """Login with Google OAuth token"""
    data = request.get_json()
    google_token = data.get('token')
    
    if not google_token:
        return jsonify({'error': 'Google token is required'}), 400
    
    try:
        # Verify Google token
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        idinfo = id_token.verify_oauth2_token(
            google_token, 
            google_requests.Request(), 
            current_app.config['GOOGLE_CLIENT_ID']
        )
        
        google_id = idinfo['sub']
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        profile_picture = idinfo.get('picture', '')
        
        # Find or create user
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            user = User.query.filter_by(email=email).first()
            if user:
                # Link existing account with Google
                user.google_id = google_id
                user.profile_picture = profile_picture
            else:
                # Create new user
                user = User(
                    email=email,
                    google_id=google_id,
                    first_name=first_name,
                    last_name=last_name,
                    profile_picture=profile_picture,
                    role=UserRole.EMPLOYEE
                )
                db.session.add(user)
        
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        login_user(user)
        token = generate_token(user)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(include_sensitive=True),
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Google authentication failed: {str(e)}'}), 401


@auth_bp.route('/refresh', methods=['POST'])
@token_required
def refresh_token():
    """Refresh JWT token"""
    user = request.current_user
    token = generate_token(user)
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200
