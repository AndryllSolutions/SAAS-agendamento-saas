"""
Row Level Security (RLS) Tests

This test suite validates that PostgreSQL RLS policies correctly isolate tenant data.
These are critical security tests that must pass before deploying RLS to production.
"""
import pytest
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine
from app.core.tenant_context import set_tenant_context, get_tenant_context, clear_tenant_context
from app.models.client import Client
from app.models.service import Service
from app.models.appointment import Appointment
from app.models.company import Company


@pytest.fixture
def db_session():
    """Create a fresh database session for each test"""
    session = SessionLocal()
    try:
        yield session
        session.rollback()
    finally:
        session.close()


@pytest.fixture
def setup_test_data(db_session: Session):
    """
    Setup test data for two different companies.
    Returns dict with company IDs and created records.
    """
    # Create two companies
    company1 = Company(
        name="Company 1",
        slug="company-1",
        email="company1@test.com",
        is_active=True
    )
    company2 = Company(
        name="Company 2", 
        slug="company-2",
        email="company2@test.com",
        is_active=True
    )
    
    db_session.add(company1)
    db_session.add(company2)
    db_session.flush()
    
    # Create clients for each company
    client1 = Client(
        company_id=company1.id,
        full_name="Client from Company 1",
        email="client1@company1.com",
        phone="11111111111"
    )
    
    client2 = Client(
        company_id=company2.id,
        full_name="Client from Company 2",
        email="client2@company2.com",
        phone="22222222222"
    )
    
    db_session.add(client1)
    db_session.add(client2)
    db_session.commit()
    
    return {
        "company1_id": company1.id,
        "company2_id": company2.id,
        "client1_id": client1.id,
        "client2_id": client2.id,
    }


class TestRLSReadIsolation:
    """Test that RLS correctly isolates read operations"""
    
    def test_read_own_company_data(self, db_session: Session, setup_test_data):
        """Users can read their own company's data"""
        company_id = setup_test_data["company1_id"]
        
        # Set tenant context to company 1
        set_tenant_context(db_session, company_id)
        
        # Should see company 1's clients
        clients = db_session.query(Client).all()
        assert len(clients) == 1
        assert clients[0].full_name == "Client from Company 1"
    
    def test_cannot_read_other_company_data(self, db_session: Session, setup_test_data):
        """Users cannot read other company's data"""
        company1_id = setup_test_data["company1_id"]
        
        # Set tenant context to company 1
        set_tenant_context(db_session, company1_id)
        
        # Should NOT see company 2's clients
        clients = db_session.query(Client).all()
        assert len(clients) == 1
        assert all(c.company_id == company1_id for c in clients)
    
    def test_read_without_context_returns_nothing(self, db_session: Session, setup_test_data):
        """Without tenant context set, queries return no data"""
        # Don't set any tenant context
        clients = db_session.query(Client).all()
        
        # Should return empty (RLS blocks everything)
        assert len(clients) == 0
    
    def test_context_switch_changes_visible_data(self, db_session: Session, setup_test_data):
        """Switching context changes which data is visible"""
        company1_id = setup_test_data["company1_id"]
        company2_id = setup_test_data["company2_id"]
        
        # First, set context to company 1
        set_tenant_context(db_session, company1_id)
        clients_1 = db_session.query(Client).all()
        assert len(clients_1) == 1
        assert clients_1[0].full_name == "Client from Company 1"
        
        # Then switch to company 2
        set_tenant_context(db_session, company2_id)
        clients_2 = db_session.query(Client).all()
        assert len(clients_2) == 1
        assert clients_2[0].full_name == "Client from Company 2"


class TestRLSWriteIsolation:
    """Test that RLS correctly isolates write operations"""
    
    def test_can_insert_with_correct_context(self, db_session: Session, setup_test_data):
        """Can insert data when context matches company_id"""
        company_id = setup_test_data["company1_id"]
        
        set_tenant_context(db_session, company_id)
        
        # Insert client for the correct company
        new_client = Client(
            company_id=company_id,
            full_name="New Client",
            email="new@company1.com",
            phone="33333333333"
        )
        db_session.add(new_client)
        db_session.commit()
        
        # Should succeed
        assert new_client.id is not None
    
    def test_cannot_insert_for_wrong_company(self, db_session: Session, setup_test_data):
        """Cannot insert data for a different company than the context"""
        company1_id = setup_test_data["company1_id"]
        company2_id = setup_test_data["company2_id"]
        
        # Set context to company 1
        set_tenant_context(db_session, company1_id)
        
        # Try to insert client for company 2
        wrong_client = Client(
            company_id=company2_id,  # Different from context!
            full_name="Wrong Client",
            email="wrong@company2.com",
            phone="44444444444"
        )
        db_session.add(wrong_client)
        
        # Should fail with RLS violation
        with pytest.raises(Exception):  # PostgreSQL will raise an error
            db_session.commit()
        
        db_session.rollback()
    
    def test_cannot_update_other_company_data(self, db_session: Session, setup_test_data):
        """Cannot update data from another company"""
        company1_id = setup_test_data["company1_id"]
        client2_id = setup_test_data["client2_id"]
        
        # Set context to company 1
        set_tenant_context(db_session, company1_id)
        
        # Try to fetch and update company 2's client (should not be visible)
        client = db_session.query(Client).filter(Client.id == client2_id).first()
        
        # Should not find it due to RLS
        assert client is None
    
    def test_cannot_delete_other_company_data(self, db_session: Session, setup_test_data):
        """Cannot delete data from another company"""
        company1_id = setup_test_data["company1_id"]
        client2_id = setup_test_data["client2_id"]
        
        # Set context to company 1
        set_tenant_context(db_session, company1_id)
        
        # Try to delete company 2's client
        result = db_session.query(Client).filter(Client.id == client2_id).delete()
        
        # Should delete 0 rows (client not visible)
        assert result == 0


class TestTenantContextManagement:
    """Test the tenant context management utilities"""
    
    def test_set_and_get_context(self, db_session: Session, setup_test_data):
        """Can set and retrieve tenant context"""
        company_id = setup_test_data["company1_id"]
        
        set_tenant_context(db_session, company_id)
        retrieved_id = get_tenant_context(db_session)
        
        assert retrieved_id == company_id
    
    def test_clear_context(self, db_session: Session, setup_test_data):
        """Can clear tenant context"""
        company_id = setup_test_data["company1_id"]
        
        set_tenant_context(db_session, company_id)
        assert get_tenant_context(db_session) == company_id
        
        clear_tenant_context(db_session)
        assert get_tenant_context(db_session) is None
    
    def test_invalid_company_id_raises_error(self, db_session: Session):
        """Setting invalid company_id raises ValueError"""
        with pytest.raises(ValueError):
            set_tenant_context(db_session, -1)
        
        with pytest.raises(ValueError):
            set_tenant_context(db_session, 0)
        
        with pytest.raises(ValueError):
            set_tenant_context(db_session, "invalid")


class TestRLSMultipleTables:
    """Test RLS across multiple related tables"""
    
    def test_related_data_isolation(self, db_session: Session, setup_test_data):
        """Related data (services, appointments) are also isolated"""
        company1_id = setup_test_data["company1_id"]
        company2_id = setup_test_data["company2_id"]
        
        # Create services for both companies (without RLS context for setup)
        clear_tenant_context(db_session)
        
        service1 = Service(
            company_id=company1_id,
            name="Service 1",
            price=100.0,
            duration_minutes=60
        )
        service2 = Service(
            company_id=company2_id,
            name="Service 2",
            price=200.0,
            duration_minutes=90
        )
        
        db_session.add(service1)
        db_session.add(service2)
        db_session.commit()
        
        # Now query with company 1 context
        set_tenant_context(db_session, company1_id)
        services = db_session.query(Service).all()
        
        # Should only see company 1's service
        assert len(services) == 1
        assert services[0].name == "Service 1"


class TestRLSPerformance:
    """Test that RLS doesn't significantly impact query performance"""
    
    def test_rls_uses_indexes(self, db_session: Session, setup_test_data):
        """Verify RLS policies use existing indexes"""
        company_id = setup_test_data["company1_id"]
        set_tenant_context(db_session, company_id)
        
        # Execute EXPLAIN to check query plan
        result = db_session.execute(
            text("EXPLAIN SELECT * FROM clients WHERE company_id = :company_id"),
            {"company_id": company_id}
        )
        
        plan = "\n".join([row[0] for row in result])
        
        # Should use index scan, not sequential scan
        assert "Index Scan" in plan or "Bitmap" in plan


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
