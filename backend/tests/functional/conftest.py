"""
Pytest fixtures para testes funcionais de planos
"""
import pytest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal


@pytest.fixture(scope="function")
def db() -> Session:
    """Database session para testes funcionais"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def client() -> TestClient:
    """Test client para requisicoes API"""
    return TestClient(app)
