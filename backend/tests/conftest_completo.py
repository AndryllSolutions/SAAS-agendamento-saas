"""
Pytest Configuration and Global Fixtures - COMPLETE VERSION
==========================================

Este arquivo contém todas as fixtures globais reutilizáveis para os testes.
Fixtures organizadas por categoria para fácil manutenção.
"""
import sys
import os
from typing import Generator, Dict
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.service import Service
from app.models.professional import Professional
from app.models.client import Client
from app.models.appointment import Appointment

# ============================================================================
# DATABASE FIXTURES
# ============================================================================

# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine
@pytest.fixture(scope="session")
def engine():
    """Create test database engine"""
    return create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


@pytest.fixture(scope="function")
def db_session(engine) -> Generator[Session, None, None]:
    """
    Create a fresh database session for each test.
    
    Scope: function (nova sessão para cada teste)
    Yields: SQLAlchemy Session
    """
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        Base.metadata.drop_all(bind=engine)


# ============================================================================
# CLIENT FIXTURES
# ============================================================================

@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with database override.
    
    Usage:
        def test_something(client):
            response = client.get("/api/v1/endpoint")
            assert response.status_code == 200
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


# ============================================================================
# COMPANY FIXTURES
# ============================================================================

@pytest.fixture(scope="function")
def test_company(db_session: Session) -> Company:
    """
    Create a test company.
    
    Returns: Company object with ID
    """
    company = Company(
        name="Test Company",
        email="company@test.com",
        phone="11999999999",
        address="Test Address, 123",
        cnpj="12345678000100"
    )
    db_session.add(company)
    db_session.commit()
    db_session.refresh(company)
    return company


@pytest.fixture(scope="function")
def second_company(db_session: Session) -> Company:
    """
    Create a second company for multi-tenant testing.
    
    Returns: Company object with different ID
    """
    company = Company(
        name="Second Company",
        email="second@test.com",
        phone="11988888888",
        address="Second Address, 456",
        cnpj="98765432000199"
    )
    db_session.add(company)
    db_session.commit()
    db_session.refresh(company)
    return company


# ============================================================================
# USER FIXTURES
# ============================================================================

@pytest.fixture(scope="function")
def test_user(db_session: Session, test_company: Company) -> User:
    """
    Create a test user (OWNER role).
    
    Login: test@example.com / test123456
    Returns: User object with company
    """
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("test123456"),
        full_name="Test User",
        role=UserRole.OWNER,
        company_id=test_company.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def manager_user(db_session: Session, test_company: Company) -> User:
    """
    Create a manager user.
    
    Login: manager@example.com / manager123
    Returns: User with MANAGER role
    """
    user = User(
        email="manager@example.com",
        password_hash=get_password_hash("manager123"),
        full_name="Manager User",
        role=UserRole.MANAGER,
        company_id=test_company.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def professional_user(db_session: Session, test_company: Company) -> User:
    """
    Create a professional user.
    
    Login: professional@example.com / prof123
    Returns: User with PROFESSIONAL role
    """
    user = User(
        email="professional@example.com",
        password_hash=get_password_hash("prof123"),
        full_name="Professional User",
        role=UserRole.PROFESSIONAL,
        company_id=test_company.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def client_user(db_session: Session, test_company: Company) -> User:
    """
    Create a client user.
    
    Login: client@example.com / client123
    Returns: User with CLIENT role
    """
    user = User(
        email="client@example.com",
        password_hash=get_password_hash("client123"),
        full_name="Client User",
        role=UserRole.CLIENT,
        company_id=test_company.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def inactive_user(db_session: Session, test_company: Company) -> User:
    """
    Create an inactive user (for testing inactive access).
    
    Login: inactive@example.com / inactive123
    Returns: Inactive user
    """
    user = User(
        email="inactive@example.com",
        password_hash=get_password_hash("inactive123"),
        full_name="Inactive User",
        role=UserRole.CLIENT,
        company_id=test_company.id,
        is_active=False  # Inativo!
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def other_company_user(db_session: Session, second_company: Company) -> User:
    """
    Create a user from another company (for multi-tenant testing).
    
    Login: other@example.com / other123
    Returns: User from second company
    """
    user = User(
        email="other@example.com",
        password_hash=get_password_hash("other123"),
        full_name="Other Company User",
        role=UserRole.OWNER,
        company_id=second_company.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


# ============================================================================
# AUTHENTICATION FIXTURES
# ============================================================================

@pytest.fixture(scope="function")
def auth_headers(client: TestClient, test_user: User) -> Dict[str, str]:
    """
    Get authentication headers for test user (OWNER).
    
    Usage:
        def test_protected(client, auth_headers):
            response = client.get("/api/v1/users/me", headers=auth_headers)
            assert response.status_code == 200
    
    Returns: {"Authorization": "Bearer <token>"}
    """
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "test123456"
        }
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def manager_headers(client: TestClient, manager_user: User) -> Dict[str, str]:
    """Get authentication headers for manager user."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": manager_user.email,
            "password": "manager123"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def professional_headers(client: TestClient, professional_user: User) -> Dict[str, str]:
    """Get authentication headers for professional user."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": professional_user.email,
            "password": "prof123"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def client_headers(client: TestClient, client_user: User) -> Dict[str, str]:
    """Get authentication headers for client user."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": client_user.email,
            "password": "client123"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def other_company_headers(client: TestClient, other_company_user: User) -> Dict[str, str]:
    """Get authentication headers for user from other company."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": other_company_user.email,
            "password": "other123"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def invalid_token_headers() -> Dict[str, str]:
    """Get invalid authentication headers for testing 401."""
    return {"Authorization": "Bearer invalid_token_here"}


@pytest.fixture(scope="function")
def expired_token_headers(test_user: User) -> Dict[str, str]:
    """Get expired token headers for testing 401."""
    # Create token that expired 1 day ago
    expired_token = create_access_token(
        data={"sub": str(test_user.id)},
        expires_delta=timedelta(days=-1)
    )
    return {"Authorization": f"Bearer {expired_token}"}


# ============================================================================
# BUSINESS DOMAIN FIXTURES
# ============================================================================

@pytest.fixture(scope="function")
def test_service(db_session: Session, test_company: Company) -> Service:
    """
    Create a test service.
    
    Returns: Service object (1 hour duration, R$ 100)
    """
    service = Service(
        company_id=test_company.id,
        name="Test Service",
        description="Test service description",
        duration_minutes=60,
        price=100.00,
        is_active=True
    )
    db_session.add(service)
    db_session.commit()
    db_session.refresh(service)
    return service


@pytest.fixture(scope="function")
def test_professional(db_session: Session, test_company: Company, professional_user: User) -> Professional:
    """
    Create a test professional.
    
    Returns: Professional linked to professional_user
    """
    professional = Professional(
        company_id=test_company.id,
        user_id=professional_user.id,
        name=professional_user.full_name,
        specialization="Test Specialization",
        is_active=True
    )
    db_session.add(professional)
    db_session.commit()
    db_session.refresh(professional)
    return professional


@pytest.fixture(scope="function")
def test_appointment(
    db_session: Session,
    test_company: Company,
    client_user: User,
    test_professional: Professional,
    test_service: Service
) -> Appointment:
    """
    Create a test appointment.
    
    Returns: Appointment for tomorrow at 10:00
    """
    tomorrow = datetime.now() + timedelta(days=1)
    start_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
    end_time = start_time + timedelta(minutes=test_service.duration_minutes)
    
    appointment = Appointment(
        company_id=test_company.id,
        client_id=client_user.id,
        professional_id=test_professional.id,
        service_id=test_service.id,
        start_time=start_time,
        end_time=end_time,
        client_notes="Test appointment notes",
        check_in_code="TEST123"
    )
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)
    return appointment


# ============================================================================
# UTILITY FIXTURES
# ============================================================================

@pytest.fixture(scope="function")
def fake_data():
    """
    Faker instance for generating fake data.
    
    Usage:
        def test_something(fake_data):
            email = fake_data.email()
            name = fake_data.name()
    """
    from faker import Faker
    return Faker('pt_BR')


@pytest.fixture(scope="session")
def base_url():
    """Base URL for API endpoints."""
    return "/api/v1"


# ============================================================================
# MARKERS
# ============================================================================

def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "slow: mark test as slow running")
    config.addinivalue_line("markers", "integration: mark test as integration test")
    config.addinivalue_line("markers", "unit: mark test as unit test")
    config.addinivalue_line("markers", "api: mark test as API test")
    config.addinivalue_line("markers", "auth: mark test as authentication test")
    config.addinivalue_line("markers", "payment: mark test as payment test")
    config.addinivalue_line("markers", "smoke: mark test as smoke test")
    config.addinivalue_line("markers", "performance: mark test as performance test")
