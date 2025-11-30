"""
Routes package initializer
"""
from app.routes.auth import auth_bp
from app.routes.api import api_bp
from app.routes.main import main_bp

__all__ = ['auth_bp', 'api_bp', 'main_bp']
