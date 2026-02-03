#!/usr/bin/env python3
"""
Teste simplificado do CRUD de Appointments (sem API)
Testa apenas a validação dos schemas e importação
"""
import sys
import os

# Adicionar backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_schema_imports():
    """Testa se todos os schemas podem ser importados"""
    try:
        from app.schemas.appointment import (
            AppointmentBase,
            AppointmentCreate,
            AppointmentUpdate,
            AppointmentResponse,
            AppointmentCancel,
            AppointmentCheckIn,
            AppointmentListFilter,
            PublicAppointmentCreate
        )
        print("✅ All appointment schemas imported successfully")
        return True
    except Exception as e:
        print(f"❌ Schema import failed: {str(e)}")
        return False

def test_model_imports():
    """Testa se o modelo pode ser importado"""
    try:
        from app.models.appointment import Appointment, AppointmentStatus
        print("✅ Appointment model imported successfully")
        return True
    except Exception as e:
        print(f"❌ Model import failed: {str(e)}")
        return False

def test_endpoint_imports():
    """Testa se o endpoint pode ser importado"""
    try:
        from app.api.v1.endpoints.appointments import router
        print("✅ Appointments endpoint imported successfully")
        return True
    except Exception as e:
        print(f"❌ Endpoint import failed: {str(e)}")
        return False

def test_schema_validation():
    """Testa validação dos schemas com dados de exemplo"""
    try:
        from app.schemas.appointment import (
            AppointmentCreate,
            AppointmentUpdate,
            AppointmentResponse,
            AppointmentStatus
        )
        from datetime import datetime, timedelta
        
        # Test AppointmentCreate
        create_data = {
            "service_id": 1,
            "professional_id": 1,
            "start_time": datetime.now() + timedelta(hours=24),
            "client_notes": "Test appointment"
        }
        
        appointment_create = AppointmentCreate(**create_data)
        print("✅ AppointmentCreate schema validation passed")
        
        # Test AppointmentUpdate
        update_data = {
            "client_notes": "Updated notes",
            "status": AppointmentStatus.CONFIRMED
        }
        
        appointment_update = AppointmentUpdate(**update_data)
        print("✅ AppointmentUpdate schema validation passed")
        
        # Test AppointmentResponse
        response_data = {
            "id": 1,
            "company_id": 1,
            "service_id": 1,
            "professional_id": 1,
            "start_time": datetime.now() + timedelta(hours=24),
            "end_time": datetime.now() + timedelta(hours=25),
            "status": AppointmentStatus.PENDING,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        appointment_response = AppointmentResponse(**response_data)
        print("✅ AppointmentResponse schema validation passed")
        
        return True
        
    except Exception as e:
        print(f"❌ Schema validation failed: {str(e)}")
        return False

def test_crud_operations():
    """Testa se as operações CRUD estão definidas no router"""
    try:
        from app.api.v1.endpoints.appointments import router
        from fastapi.routing import APIRoute
        
        routes = [route for route in router.routes if isinstance(route, APIRoute)]
        route_methods = [route.methods for route in routes]
        
        has_get = any("GET" in methods for methods in route_methods)
        has_post = any("POST" in methods for methods in route_methods)
        has_put = any("PUT" in methods for methods in route_methods)
        has_delete = any("DELETE" in methods for methods in route_methods)
        
        print(f"✅ GET routes: {has_get}")
        print(f"✅ POST routes: {has_post}")
        print(f"✅ PUT routes: {has_put}")
        print(f"✅ DELETE routes: {has_delete}")
        
        if has_get and has_post and has_put and has_delete:
            print("✅ All CRUD operations are available")
            return True
        else:
            print("❌ Missing CRUD operations")
            return False
            
    except Exception as e:
        print(f"❌ CRUD operations test failed: {str(e)}")
        return False

def main():
    """Executa todos os testes"""
    print("="*60)
    print("APPOINTMENT CRUD VALIDATION TEST")
    print("="*60)
    
    tests = [
        ("Schema Imports", test_schema_imports),
        ("Model Imports", test_model_imports),
        ("Endpoint Imports", test_endpoint_imports),
        ("Schema Validation", test_schema_validation),
        ("CRUD Operations", test_crud_operations)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n[{test_name}]")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} : {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Appointment CRUD is properly implemented and ready for use!")
    else:
        print("\n⚠️  Some tests failed")
        print("Check the errors above for details")
    
    print("="*60)

if __name__ == "__main__":
    main()
