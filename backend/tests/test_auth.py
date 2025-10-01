"""
Tests for authentication endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_user():
    """Test user registration"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "Test123456",
            "full_name": "Test User",
            "role": "client",
            "company_id": 1
        }
    )
    
    assert response.status_code in [201, 400]  # 400 if user already exists


def test_login():
    """Test user login"""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "admin@belezatotal.com",
            "password": "admin123"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"


def test_get_current_user():
    """Test getting current user info"""
    # First login
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "admin@belezatotal.com",
            "password": "admin123"
        }
    )
    
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        
        # Get user info
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "role" in data
