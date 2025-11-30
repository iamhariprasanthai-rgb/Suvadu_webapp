"""
Employee Separation Management System - Application Factory
"""
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from flask_mail import Mail
from flask_migrate import Migrate
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()


def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///separation.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Mail configuration
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@company.com')
    
    # Google OAuth configuration
    app.config['GOOGLE_CLIENT_ID'] = os.environ.get('GOOGLE_CLIENT_ID')
    app.config['GOOGLE_CLIENT_SECRET'] = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    # JWT configuration
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
    
    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    
    # Enable CORS for React frontend
    cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    CORS(app, resources={
        r"/*": {
            "origins": cors_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Configure login manager
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'
    
    # Import and register blueprints
    from app.routes.auth import auth_bp
    from app.routes.api import api_bp
    from app.routes.main import main_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(main_bp)
    
    # Register CLI commands
    from app.cli import register_commands
    register_commands(app)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app


@login_manager.user_loader
def load_user(user_id):
    from app.models import User
    return User.query.get(int(user_id))
