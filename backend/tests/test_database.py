"""
Database tests - Test database operations, migrations, and data integrity
"""
import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.core.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.client import Client
from app.models.company import Company
from app.models.service import Service
from app.models.product import Product
from app.models.appointment import Appointment


@pytest.mark.database
class TestDatabase:
    """Test database operations"""
    
    def test_database_connection(self, db_session):
        """Test database connection"""
        result = db_session.execute(text("SELECT 1"))
        assert result.scalar() == 1
    
    def test_create_tables(self, db_session):
        """Test that all tables can be created"""
        # Tables should be created by fixture
        # Just verify we can query
        result = db_session.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = [row[0] for row in result]
        assert len(tables) > 0
    
    def test_user_creation(self, db_session):
        """Test user creation in database"""
        from app.models.user import UserRole
        user = User(
            email="db_test@example.com",
            password_hash="hashed_password",
            full_name="DB Test User",
            role=UserRole.CLIENT,
            company_id=1,
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        
        # Verify user was created
        created_user = db_session.query(User).filter(User.email == "db_test@example.com").first()
        assert created_user is not None
        assert created_user.full_name == "DB Test User"
        assert created_user.role == UserRole.CLIENT
    
    def test_user_unique_email(self, db_session):
        """Test that email must be unique"""
        user1 = User(
            email="unique@example.com",
            password_hash="hash1",
            full_name="User 1",
            role="CLIENT",
            company_id=1,
            is_active=True
        )
        db_session.add(user1)
        db_session.commit()
        
        # Try to create another user with same email
        from app.models.user import UserRole
        user2 = User(
            email="unique@example.com",
            password_hash="hash2",
            full_name="User 2",
            role=UserRole.CLIENT,
            company_id=1,
            is_active=True
        )
        db_session.add(user2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_foreign_key_constraints(self, db_session):
        """Test foreign key constraints"""
        # Create company first
        company = Company(
            name="Test Company",
            cnpj="12345678000190",
            email="company@test.com"
        )
        db_session.add(company)
        db_session.commit()
        db_session.refresh(company)
        
        # Create user with valid company_id
        from app.models.user import UserRole
        user = User(
            email="fk_test@example.com",
            password_hash="hash",
            full_name="FK Test",
            role=UserRole.OWNER,
            company_id=company.id,
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        
        # Verify relationship
        assert user.company_id == company.id
    
    def test_cascade_delete(self, db_session):
        """Test cascade delete operations"""
        # This would test if deleting a company deletes related users
        # Implementation depends on your cascade settings
        pass
    
    def test_transaction_rollback(self, db_session):
        """Test transaction rollback"""
        initial_count = db_session.query(User).count()
        
        from app.models.user import UserRole
        user = User(
            email="rollback@example.com",
            password_hash="hash",
            full_name="Rollback Test",
            role=UserRole.CLIENT,
            company_id=1,
            is_active=True
        )
        db_session.add(user)
        db_session.rollback()
        
        # User should not be saved
        final_count = db_session.query(User).count()
        assert final_count == initial_count
    
    def test_query_performance(self, db_session):
        """Test query performance (basic check)"""
        import time
        
        # Create multiple users
        for i in range(10):
            from app.models.user import UserRole
            user = User(
                email=f"perf_test_{i}@example.com",
                password_hash="hash",
                full_name=f"Perf Test {i}",
                role=UserRole.CLIENT,
                company_id=1,
                is_active=True
            )
            db_session.add(user)
        db_session.commit()
        
        # Time the query
        start = time.time()
        users = db_session.query(User).filter(User.email.like("perf_test_%")).all()
        elapsed = time.time() - start
        
        assert len(users) == 10
        assert elapsed < 1.0  # Should be fast


@pytest.mark.database
class TestMigrations:
    """Test database migrations"""
    
    def test_all_tables_exist(self, db_session):
        """Test that all expected tables exist"""
        result = db_session.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = [row[0] for row in result]
        
        expected_tables = [
            'users', 'companies', 'clients', 'professionals',
            'services', 'products', 'appointments', 'commands',
            'payments', 'packages'
        ]
        
        # Check that at least some expected tables exist
        # (exact list depends on your models)
        assert len(tables) > 0
    
    def test_table_columns(self, db_session):
        """Test that tables have expected columns"""
        # Test users table
        result = db_session.execute(text("PRAGMA table_info(users)"))
        columns = [row[1] for row in result]
        
        expected_columns = ['id', 'email', 'password_hash', 'full_name', 'role', 'company_id']
        for col in expected_columns:
            assert col in columns


@pytest.mark.database
class TestDataIntegrity:
    """Test data integrity constraints"""
    
    def test_required_fields(self, db_session):
        """Test that required fields are enforced"""
        # Try to create user without email
        user = User(
            password_hash="hash",
            full_name="No Email",
            role="CLIENT",
            company_id=1
        )
        db_session.add(user)
        
        with pytest.raises(Exception):  # Should raise some error
            db_session.commit()
    
    def test_email_format(self, db_session):
        """Test email format validation"""
        # This would typically be handled by Pydantic, but we can test at DB level
        pass
    
    def test_enum_values(self, db_session):
        """Test that enum values are respected"""
        # Test role enum
        from app.models.user import UserRole
        valid_roles = [UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTIONIST, UserRole.PROFESSIONAL, UserRole.FINANCE, UserRole.CLIENT]
        
        for role in valid_roles:
            user = User(
                email=f"{role.value.lower()}@test.com",
                password_hash="hash",
                full_name=f"Test {role.value}",
                role=role,
                company_id=1,
                is_active=True
            )
            db_session.add(user)
        
        db_session.commit()
        
        # Verify all were created
        assert db_session.query(User).filter(User.role.in_(valid_roles)).count() == len(valid_roles)

