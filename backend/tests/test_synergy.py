"""
Synergy tests - Verify that frontend and backend respond the same way
Tests API responses match expected frontend format
"""
import pytest
from fastapi import status


@pytest.mark.integration
class TestFrontendBackendSynergy:
    """Test that backend responses match frontend expectations"""
    
    def test_user_response_format(self, client, auth_headers, test_user):
        """Test that user response has all fields frontend expects"""
        response = client.get(f"/api/v1/users/{test_user.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        # Frontend expects these fields
        required_fields = ["id", "email", "full_name", "role", "company_id"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
    
    def test_clients_list_format(self, client, auth_headers):
        """Test that clients list response matches frontend expectations"""
        response = client.get("/api/v1/clients", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            client_data = data[0]
            # Frontend expects these fields
            expected_fields = ["id", "full_name", "email"]
            for field in expected_fields:
                assert field in client_data, f"Missing field: {field}"
    
    def test_services_response_format(self, client, auth_headers, test_user):
        """Test that services response matches frontend format"""
        # Create a service
        create_response = client.post(
            "/api/v1/services",
            headers=auth_headers,
            json={
                "name": "Synergy Test Service",
                "description": "Test",
                "duration_minutes": 60,
                "price": 100.00,
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        data = create_response.json()
        assert "id" in data, "Response should have 'id' field at root level"
        service_id = data["id"]
        
        # Get the service
        response = client.get(f"/api/v1/services/{service_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        # Frontend expects these fields
        expected_fields = ["id", "name", "description", "duration", "price"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
    
    def test_products_response_format(self, client, auth_headers, test_user):
        """Test that products response matches frontend format"""
        create_response = client.post(
            "/api/v1/products",
            headers=auth_headers,
            json={
                "name": "Synergy Test Product",
                "description": "Test",
                "price": 50.00,
                "cost": 30.00,
                "stock": 100,
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        data = create_response.json()
        assert "id" in data, "Response should have 'id' field at root level"
        product_id = data["id"]
        
        response = client.get(f"/api/v1/products/{product_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        # Frontend expects these fields
        expected_fields = ["id", "name", "price", "cost", "stock"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
    
    def test_appointments_response_format(self, client, auth_headers):
        """Test that appointments response matches frontend format"""
        response = client.get("/api/v1/appointments", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            appointment = data[0]
            # Frontend expects these fields
            expected_fields = ["id", "client_id", "service_id", "scheduled_at", "status"]
            for field in expected_fields:
                assert field in appointment, f"Missing field: {field}"
    
    def test_error_response_format(self, client, auth_headers):
        """Test that error responses match frontend expectations"""
        # Try to get non-existent resource
        response = client.get("/api/v1/clients/99999", headers=auth_headers)
        
        # Should return 404 or 404-like error
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST]
        
        # Error response should have detail or message
        data = response.json()
        assert "detail" in data or "message" in data
    
    def test_pagination_format(self, client, auth_headers):
        """Test that paginated responses match frontend expectations"""
        # Many endpoints should support pagination
        response = client.get("/api/v1/clients?skip=0&limit=10", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        # Should be a list (or dict with items key for pagination)
        assert isinstance(data, (list, dict))
    
    def test_create_response_format(self, client, auth_headers, test_user):
        """Test that create responses match frontend expectations"""
        response = client.post(
            "/api/v1/clients",
            headers=auth_headers,
            json={
                "full_name": "Synergy Test Client",
                "email": "synergy@test.com",
                "phone": "11999999999",
                "company_id": test_user.company_id
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        # Should return created object with id at root level (not nested)
        assert "id" in data, "Response should have 'id' field at root level"
        assert data["full_name"] == "Synergy Test Client"
    
    def test_update_response_format(self, client, auth_headers, test_user):
        """Test that update responses match frontend expectations"""
        # Create first
        create_response = client.post(
            "/api/v1/clients",
            headers=auth_headers,
            json={
                "full_name": "Update Test",
                "email": "updatetest@test.com",
                "phone": "11999999999",
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        client_id = create_response.json()["id"]
        
        # Update
        response = client.put(
            f"/api/v1/clients/{client_id}",
            headers=auth_headers,
            json={
                "full_name": "Updated Name"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        # Should return updated object with id at root level
        assert "id" in data
        assert data["full_name"] == "Updated Name"
    
    def test_delete_response_format(self, client, auth_headers, test_user):
        """Test that delete responses match frontend expectations"""
        # Create first
        create_response = client.post(
            "/api/v1/clients",
            headers=auth_headers,
            json={
                "full_name": "Delete Test",
                "email": "deletetest@test.com",
                "phone": "11999999999",
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        client_id = create_response.json()["id"]
        
        # Delete
        response = client.delete(f"/api/v1/clients/{client_id}", headers=auth_headers)
        # Should return 200 or 204
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]
    
    def test_authentication_token_format(self, client, test_user):
        """Test that auth token response matches frontend expectations"""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "test123456"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        # Frontend expects these fields
        required_fields = ["access_token", "refresh_token", "token_type"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        assert data["token_type"] == "bearer"


@pytest.mark.integration
class TestDataConsistency:
    """Test data consistency between frontend and backend"""
    
    def test_id_types(self, client, auth_headers):
        """Test that IDs are integers (not strings)"""
        response = client.get("/api/v1/clients", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        if len(data) > 0:
            assert isinstance(data[0]["id"], int), "ID should be integer"
    
    def test_date_formats(self, client, auth_headers):
        """Test that dates are in ISO format"""
        # This would test appointment dates, etc.
        # Implementation depends on your date fields
        pass
    
    def test_decimal_precision(self, client, auth_headers, test_user):
        """Test that prices/decimals maintain precision"""
        create_response = client.post(
            "/api/v1/products",
            headers=auth_headers,
            json={
                "name": "Precision Test",
                "price": 99.99,
                "cost": 50.50,
                "stock": 100,
                "company_id": test_user.company_id
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        product_id = create_response.json()["id"]
        
        response = client.get(f"/api/v1/products/{product_id}", headers=auth_headers)
        data = response.json()
        
        # Prices should maintain precision (2 decimal places)
        assert abs(float(data["price"]) - 99.99) < 0.01
        assert abs(float(data["cost"]) - 50.50) < 0.01

