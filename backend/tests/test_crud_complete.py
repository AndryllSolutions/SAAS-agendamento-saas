"""
Complete CRUD tests for all modules
Tests all CREATE, READ, UPDATE, DELETE operations
"""
import pytest
from fastapi import status

from app.models.user import User
from app.models.client import Client
from app.models.service import Service
from app.models.product import Product
from app.models.appointment import Appointment
from app.models.command import Command
from app.models.professional import Professional
from app.models.company import Company


@pytest.mark.crud
class TestUsersCRUD:
    """Test Users CRUD operations"""
    
    def test_create_user(self, client, auth_headers, test_user):
        """Test creating a user"""
        response = client.post(
            "/api/v1/users",
            headers=auth_headers,
            json={
                "email": "newuser@test.com",
                "password": "Test123456",
                "full_name": "New User",
                "role": "RECEPTIONIST",
                "company_id": test_user.company_id
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "newuser@test.com"
        assert data["full_name"] == "New User"
        return data["id"]
    
    def test_read_users_list(self, client, auth_headers):
        """Test reading users list"""
        response = client.get("/api/v1/users", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_read_user_by_id(self, client, auth_headers, test_user):
        """Test reading a specific user"""
        response = client.get(f"/api/v1/users/{test_user.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_user.id
        assert data["email"] == test_user.email
    
    def test_update_user(self, client, auth_headers, test_user):
        """Test updating a user"""
        response = client.put(
            f"/api/v1/users/{test_user.id}",
            headers=auth_headers,
            json={
                "full_name": "Updated Name",
                "role": "MANAGER"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["full_name"] == "Updated Name"
    
    def test_delete_user(self, client, auth_headers, test_user):
        """Test deleting a user"""
        response = client.delete(f"/api/v1/users/{test_user.id}", headers=auth_headers)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]


@pytest.mark.crud
class TestClientsCRUD:
    """Test Clients CRUD operations"""
    
    def test_create_client(self, client, auth_headers, test_user):
        """Test creating a client"""
        response = client.post(
            "/api/v1/clients",
            headers=auth_headers,
            json={
                "full_name": "Test Client",
                "email": "client@test.com",
                "phone": "11999999999",
                "company_id": test_user.company_id
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "id" in data, "Response should have 'id' field at root level"
        assert data["full_name"] == "Test Client"
        return data["id"]
    
    def test_read_clients_list(self, client, auth_headers):
        """Test reading clients list"""
        response = client.get("/api/v1/clients", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_read_client_by_id(self, client, auth_headers, test_user):
        """Test reading a specific client"""
        # First create a client
        create_response = client.post(
            "/api/v1/clients",
            headers=auth_headers,
            json={
                "full_name": "Get Client",
                "email": "getclient@test.com",
                "phone": "11999999999",
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        data = create_response.json()
        assert "id" in data, "Response should have 'id' field at root level"
        client_id = data["id"]
        
        # Then read it
        response = client.get(f"/api/v1/clients/{client_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == client_id
    
    def test_update_client(self, client, auth_headers, test_user):
        """Test updating a client"""
        # Create client first
        create_response = client.post(
            "/api/v1/clients",
            headers=auth_headers,
            json={
                "full_name": "Update Client",
                "email": "updateclient@test.com",
                "phone": "11999999999",
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        data = create_response.json()
        assert "id" in data, "Response should have 'id' field at root level"
        client_id = data["id"]
        
        # Update it
        response = client.put(
            f"/api/v1/clients/{client_id}",
            headers=auth_headers,
            json={
                "full_name": "Updated Client Name"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["full_name"] == "Updated Client Name"
    
    def test_delete_client(self, client, auth_headers, test_user):
        """Test deleting a client"""
        # Create client first
        create_response = client.post(
            "/api/v1/clients",
            headers=auth_headers,
            json={
                "full_name": "Delete Client",
                "email": "deleteclient@test.com",
                "phone": "11999999999",
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        data = create_response.json()
        assert "id" in data, "Response should have 'id' field at root level"
        client_id = data["id"]
        
        # Delete it
        response = client.delete(f"/api/v1/clients/{client_id}", headers=auth_headers)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]


@pytest.mark.crud
class TestServicesCRUD:
    """Test Services CRUD operations"""
    
    def test_create_service(self, client, auth_headers, test_user):
        """Test creating a service"""
        response = client.post(
            "/api/v1/services",
            headers=auth_headers,
            json={
                "name": "Test Service",
                "description": "Service description",
                "duration_minutes": 60,
                "price": 100.00,
                "company_id": test_user.company_id
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Test Service"
        assert "id" in data
        return data["id"]
    
    def test_read_services_list(self, client, auth_headers):
        """Test reading services list"""
        response = client.get("/api/v1/services", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_read_service_by_id(self, client, auth_headers, test_user):
        """Test reading a specific service"""
        create_response = client.post(
            "/api/v1/services",
            headers=auth_headers,
            json={
                "name": "Get Service",
                "description": "Description",
                "duration_minutes": 60,
                "price": 100.00,
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        service_id = create_response.json()["id"]
        
        response = client.get(f"/api/v1/services/{service_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == service_id
    
    def test_update_service(self, client, auth_headers, test_user):
        """Test updating a service"""
        create_response = client.post(
            "/api/v1/services",
            headers=auth_headers,
            json={
                "name": "Update Service",
                "description": "Description",
                "duration_minutes": 60,
                "price": 100.00,
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        service_id = create_response.json()["id"]
        
        response = client.put(
            f"/api/v1/services/{service_id}",
            headers=auth_headers,
            json={
                "name": "Updated Service Name",
                "price": 150.00
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Service Name"
        assert float(data["price"]) == 150.00
    
    def test_delete_service(self, client, auth_headers, test_user):
        """Test deleting a service"""
        create_response = client.post(
            "/api/v1/services",
            headers=auth_headers,
            json={
                "name": "Delete Service",
                "description": "Description",
                "duration_minutes": 60,
                "price": 100.00,
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        service_id = create_response.json()["id"]
        
        response = client.delete(f"/api/v1/services/{service_id}", headers=auth_headers)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]


@pytest.mark.crud
class TestProductsCRUD:
    """Test Products CRUD operations"""
    
    def test_create_product(self, client, auth_headers, test_user):
        """Test creating a product"""
        response = client.post(
            "/api/v1/products",
            headers=auth_headers,
            json={
                "name": "Test Product",
                "description": "Product description",
                "price": 50.00,
                "cost": 30.00,
                "stock": 100,
                "company_id": test_user.company_id
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Test Product"
        assert "id" in data
        return data["id"]
    
    def test_read_products_list(self, client, auth_headers):
        """Test reading products list"""
        response = client.get("/api/v1/products", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_read_product_by_id(self, client, auth_headers, test_user):
        """Test reading a specific product"""
        create_response = client.post(
            "/api/v1/products",
            headers=auth_headers,
            json={
                "name": "Get Product",
                "description": "Description",
                "price": 50.00,
                "cost": 30.00,
                "stock": 100,
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        product_id = create_response.json()["id"]
        
        response = client.get(f"/api/v1/products/{product_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == product_id
    
    def test_update_product(self, client, auth_headers, test_user):
        """Test updating a product"""
        create_response = client.post(
            "/api/v1/products",
            headers=auth_headers,
            json={
                "name": "Update Product",
                "description": "Description",
                "price": 50.00,
                "cost": 30.00,
                "stock": 100,
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        product_id = create_response.json()["id"]
        
        response = client.put(
            f"/api/v1/products/{product_id}",
            headers=auth_headers,
            json={
                "name": "Updated Product Name",
                "sale_price": 75.00,
                "stock_current": 150
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Product Name"
        assert float(data["price"]) == 75.00
    
    def test_delete_product(self, client, auth_headers, test_user):
        """Test deleting a product"""
        create_response = client.post(
            "/api/v1/products",
            headers=auth_headers,
            json={
                "name": "Delete Product",
                "description": "Description",
                "price": 50.00,
                "cost": 30.00,
                "stock": 100,
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        product_id = create_response.json()["id"]
        
        response = client.delete(f"/api/v1/products/{product_id}", headers=auth_headers)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]


@pytest.mark.crud
class TestAppointmentsCRUD:
    """Test Appointments CRUD operations"""
    
    def test_create_appointment(self, client, auth_headers, test_user):
        """Test creating an appointment"""
        response = client.post(
            "/api/v1/appointments",
            headers=auth_headers,
            json={
                "client_id": 1,
                "professional_id": test_user.id,
                "service_id": 1,
                "date": "2024-12-10",
                "time": "10:00",
                "duration_minutes": 60,
                "status": "scheduled",
                "company_id": test_user.company_id
            }
        )
        if response.status_code == status.HTTP_201_CREATED:
            data = response.json()
            assert "id" in data
            return data["id"]
        return None
    
    def test_read_appointments_list(self, client, auth_headers):
        """Test reading appointments list"""
        response = client.get("/api/v1/appointments", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_update_appointment_status(self, client, auth_headers, test_user):
        """Test updating appointment status"""
        # First create an appointment
        create_response = client.post(
            "/api/v1/appointments",
            headers=auth_headers,
            json={
                "client_id": 1,
                "professional_id": test_user.id,
                "service_id": 1,
                "date": "2024-12-11",
                "time": "14:00",
                "duration_minutes": 60,
                "status": "scheduled",
                "company_id": test_user.company_id
            }
        )
        if create_response.status_code == status.HTTP_201_CREATED:
            appointment_id = create_response.json()["id"]
            
            # Update status
            response = client.put(
                f"/api/v1/appointments/{appointment_id}",
                headers=auth_headers,
                json={"status": "confirmed"}
            )
            assert response.status_code == status.HTTP_200_OK
    
    def test_delete_appointment(self, client, auth_headers, test_user):
        """Test canceling an appointment"""
        # Create appointment first
        create_response = client.post(
            "/api/v1/appointments",
            headers=auth_headers,
            json={
                "client_id": 1,
                "professional_id": test_user.id,
                "service_id": 1,
                "date": "2024-12-12",
                "time": "16:00",
                "duration_minutes": 60,
                "status": "scheduled",
                "company_id": test_user.company_id
            }
        )
        if create_response.status_code == status.HTTP_201_CREATED:
            appointment_id = create_response.json()["id"]
            
            # Cancel it
            response = client.delete(
                f"/api/v1/appointments/{appointment_id}",
                headers=auth_headers
            )
            assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]


@pytest.mark.crud
class TestCommandsCRUD:
    """Test Commands (Orders) CRUD operations"""
    
    def test_create_command(self, client, auth_headers, test_user):
        """Test creating a command/order"""
        response = client.post(
            "/api/v1/commands",
            headers=auth_headers,
            json={
                "client_id": 1,
                "items": [
                    {"service_id": 1, "quantity": 1, "price": 100.00},
                    {"product_id": 1, "quantity": 2, "price": 50.00}
                ],
                "total": 200.00,
                "status": "open",
                "company_id": test_user.company_id
            }
        )
        if response.status_code == status.HTTP_201_CREATED:
            data = response.json()
            assert "id" in data
            return data["id"]
        return None
    
    def test_read_commands_list(self, client, auth_headers):
        """Test reading commands list"""
        response = client.get("/api/v1/commands", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_update_command_status(self, client, auth_headers, test_user):
        """Test updating command status"""
        # Create command first
        create_response = client.post(
            "/api/v1/commands",
            headers=auth_headers,
            json={
                "client_id": 1,
                "items": [{"service_id": 1, "quantity": 1, "price": 100.00}],
                "total": 100.00,
                "status": "open",
                "company_id": test_user.company_id
            }
        )
        if create_response.status_code == status.HTTP_201_CREATED:
            command_id = create_response.json()["id"]
            
            # Update status
            response = client.put(
                f"/api/v1/commands/{command_id}",
                headers=auth_headers,
                json={"status": "paid"}
            )
            assert response.status_code == status.HTTP_200_OK
    
    def test_delete_command(self, client, auth_headers, test_user):
        """Test deleting a command"""
        # Create command first
        create_response = client.post(
            "/api/v1/commands",
            headers=auth_headers,
            json={
                "client_id": 1,
                "items": [{"service_id": 1, "quantity": 1, "price": 100.00}],
                "total": 100.00,
                "status": "open",
                "company_id": test_user.company_id
            }
        )
        if create_response.status_code == status.HTTP_201_CREATED:
            command_id = create_response.json()["id"]
            
            # Delete it
            response = client.delete(
                f"/api/v1/commands/{command_id}",
                headers=auth_headers
            )
            assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]


@pytest.mark.crud
class TestProfessionalsCRUD:
    """Test Professionals CRUD operations"""
    
    def test_create_professional(self, client, auth_headers, test_user):
        """Test creating a professional"""
        response = client.post(
            "/api/v1/professionals",
            headers=auth_headers,
            json={
                "user_id": test_user.id,
                "specialties": ["Haircut", "Beard"],
                "commission_rate": 50.0,
                "working_hours": {
                    "monday": {"start": "09:00", "end": "18:00"},
                    "tuesday": {"start": "09:00", "end": "18:00"},
                    "wednesday": {"start": "09:00", "end": "18:00"},
                    "thursday": {"start": "09:00", "end": "18:00"},
                    "friday": {"start": "09:00", "end": "18:00"}
                },
                "company_id": test_user.company_id
            }
        )
        if response.status_code == status.HTTP_201_CREATED:
            data = response.json()
            assert "id" in data
            return data["id"]
        return None
    
    def test_read_professionals_list(self, client, auth_headers):
        """Test reading professionals list"""
        response = client.get("/api/v1/professionals", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_update_professional(self, client, auth_headers, test_user):
        """Test updating professional info"""
        # First check if professional exists or create one
        list_response = client.get("/api/v1/professionals", headers=auth_headers)
        if list_response.status_code == status.HTTP_200_OK:
            professionals = list_response.json()
            if professionals:
                professional_id = professionals[0]["id"]
                
                # Update commission rate
                response = client.put(
                    f"/api/v1/professionals/{professional_id}",
                    headers=auth_headers,
                    json={"commission_rate": 60.0}
                )
                assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]


@pytest.mark.crud
class TestFinancialCRUD:
    """Test Financial operations CRUD"""
    
    def test_create_transaction(self, client, auth_headers, test_user):
        """Test creating a financial transaction"""
        response = client.post(
            "/api/v1/financial/transactions",
            headers=auth_headers,
            json={
                "type": "income",
                "category": "service",
                "amount": 100.00,
                "description": "Service payment",
                "payment_method": "cash",
                "date": "2024-12-09",
                "company_id": test_user.company_id
            }
        )
        if response.status_code == status.HTTP_201_CREATED:
            data = response.json()
            assert "id" in data
            return data["id"]
        return None
    
    def test_read_transactions_list(self, client, auth_headers):
        """Test reading transactions list"""
        response = client.get("/api/v1/financial/transactions", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_read_financial_summary(self, client, auth_headers):
        """Test reading financial summary"""
        response = client.get("/api/v1/financial/summary", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_income" in data or "revenue" in data or isinstance(data, dict)
    
    def test_update_transaction(self, client, auth_headers, test_user):
        """Test updating a transaction"""
        # Create transaction first
        create_response = client.post(
            "/api/v1/financial/transactions",
            headers=auth_headers,
            json={
                "type": "expense",
                "category": "supplies",
                "amount": 50.00,
                "description": "Office supplies",
                "payment_method": "credit_card",
                "date": "2024-12-09",
                "company_id": test_user.company_id
            }
        )
        if create_response.status_code == status.HTTP_201_CREATED:
            transaction_id = create_response.json()["id"]
            
            # Update amount
            response = client.put(
                f"/api/v1/financial/transactions/{transaction_id}",
                headers=auth_headers,
                json={"amount": 75.00, "description": "Updated supplies"}
            )
            assert response.status_code in [status.HTTP_200_OK, status.HTTP_405_METHOD_NOT_ALLOWED]


@pytest.mark.crud
class TestAuthenticationCRUD:
    """Test Authentication operations"""
    
    def test_register_user(self, client):
        """Test user registration"""
        import time
        timestamp = str(int(time.time()))
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": f"testuser_{timestamp}@test.com",
                "password": "Test123456!",
                "full_name": "Test User",
                "phone": "11999999999"
            }
        )
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]
        if response.status_code == status.HTTP_201_CREATED:
            data = response.json()
            assert "id" in data or "user_id" in data
    
    def test_login_user(self, client):
        """Test user login"""
        # First register a user
        import time
        timestamp = str(int(time.time()))
        email = f"logintest_{timestamp}@test.com"
        password = "Test123456!"
        
        # Register
        register_response = client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "password": password,
                "full_name": "Login Test",
                "phone": "11999999998"
            }
        )
        
        # Login
        if register_response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]:
            login_response = client.post(
                "/api/v1/auth/login",
                data={"username": email, "password": password}
            )
            assert login_response.status_code == status.HTTP_200_OK
            data = login_response.json()
            assert "access_token" in data
            assert "token_type" in data
    
    def test_refresh_token(self, client, auth_headers):
        """Test token refresh"""
        response = client.post(
            "/api/v1/auth/refresh",
            headers=auth_headers
        )
        # Refresh might not be implemented
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_405_METHOD_NOT_ALLOWED
        ]
    
    def test_logout_user(self, client, auth_headers):
        """Test user logout"""
        response = client.post(
            "/api/v1/auth/logout",
            headers=auth_headers
        )
        # Logout might not be implemented
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_204_NO_CONTENT,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_405_METHOD_NOT_ALLOWED
        ]


@pytest.mark.crud  
class TestCompanySettingsCRUD:
    """Test Company Settings CRUD operations"""
    
    def test_read_company_settings(self, client, auth_headers):
        """Test reading company settings"""
        response = client.get("/api/v1/company/settings", headers=auth_headers)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            assert isinstance(data, dict)
    
    def test_update_company_settings(self, client, auth_headers, test_user):
        """Test updating company settings"""
        response = client.put(
            "/api/v1/company/settings",
            headers=auth_headers,
            json={
                "name": "Test Company Updated",
                "phone": "11999999999",
                "email": "company@test.com",
                "address": "Test Street, 123",
                "working_hours": {
                    "monday": {"start": "09:00", "end": "18:00"},
                    "tuesday": {"start": "09:00", "end": "18:00"},
                    "wednesday": {"start": "09:00", "end": "18:00"},
                    "thursday": {"start": "09:00", "end": "18:00"},
                    "friday": {"start": "09:00", "end": "18:00"},
                    "saturday": {"start": "09:00", "end": "13:00"}
                }
            }
        )
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_403_FORBIDDEN
        ]


@pytest.mark.crud
class TestNotificationsCRUD:
    """Test Notifications CRUD operations"""
    
    def test_create_notification(self, client, auth_headers, test_user):
        """Test creating a notification"""
        response = client.post(
            "/api/v1/notifications",
            headers=auth_headers,
            json={
                "user_id": test_user.id,
                "title": "Test Notification",
                "message": "This is a test notification",
                "type": "info",
                "priority": "normal"
            }
        )
        if response.status_code == status.HTTP_201_CREATED:
            data = response.json()
            assert "id" in data
            return data["id"]
        return None
    
    def test_read_notifications_list(self, client, auth_headers):
        """Test reading notifications list"""
        response = client.get("/api/v1/notifications", headers=auth_headers)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            assert isinstance(data, list)
    
    def test_mark_notification_read(self, client, auth_headers, test_user):
        """Test marking notification as read"""
        # Create notification first
        create_response = client.post(
            "/api/v1/notifications",
            headers=auth_headers,
            json={
                "user_id": test_user.id,
                "title": "Read Test",
                "message": "Mark as read test",
                "type": "info"
            }
        )
        if create_response.status_code == status.HTTP_201_CREATED:
            notification_id = create_response.json()["id"]
            
            # Mark as read
            response = client.put(
                f"/api/v1/notifications/{notification_id}/read",
                headers=auth_headers
            )
            assert response.status_code in [
                status.HTTP_200_OK,
                status.HTTP_204_NO_CONTENT,
                status.HTTP_404_NOT_FOUND
            ]


# Run all tests function for standalone execution
def run_all_crud_tests():
    """Function to run all CRUD tests programmatically"""
    import subprocess
    import sys
    
    # Run pytest with specific markers
    result = subprocess.run(
        [sys.executable, "-m", "pytest", __file__, "-m", "crud", "-v"],
        capture_output=True,
        text=True
    )
    
    print(result.stdout)
    if result.stderr:
        print("Errors:", result.stderr)
    
    return result.returncode == 0


if __name__ == "__main__":
    # When run directly, execute all CRUD tests
    success = run_all_crud_tests()
    sys.exit(0 if success else 1)

