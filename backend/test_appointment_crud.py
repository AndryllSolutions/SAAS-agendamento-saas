#!/usr/bin/env python3
"""
Teste completo do CRUD de Appointments
Valida CREATE, READ, UPDATE, DELETE
"""
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class AppointmentCRUDTest:
    def __init__(self, base_url: str = "http://localhost:8000/api/v1"):
        self.base_url = base_url
        self.api_url = base_url.replace("/api/v1", "/api")  # Ajuste para VPS
        self.token = None
        self.company_id = None
        self.user_id = None
        self.created_appointment_id = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log formatado"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def login(self, email: str = "admin@demo.com", password: str = "demo123") -> bool:
        """Realiza login e obtém token"""
        try:
            self.log("Tentando login...")
            
            # Tente diferentes endpoints de auth
            auth_endpoints = [
                f"{self.api_url}/api/v1/auth/login",
                f"{self.base_url}/auth/login",
                f"{self.api_url}/auth/login"
            ]
            
            for endpoint in auth_endpoints:
                try:
                    response = requests.post(
                        endpoint,
                        json={"email": email, "password": password},
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        self.token = data.get("access_token") or data.get("token")
                        
                        if self.token:
                            self.log(f"Login successful via {endpoint}")
                            
                            # Extrair informações do usuário
                            if "user" in data:
                                self.user_id = data["user"].get("id")
                                self.company_id = data["user"].get("company_id")
                            
                            return True
                            
                except requests.exceptions.RequestException:
                    continue
                    
            self.log("Login failed - all endpoints tried", "ERROR")
            return False
            
        except Exception as e:
            self.log(f"Login error: {str(e)}", "ERROR")
            return False
    
    def get_headers(self) -> Dict[str, str]:
        """Retorna headers com autenticação"""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers
    
    def test_health(self) -> bool:
        """Testa se API está respondendo"""
        try:
            self.log("Testing API health...")
            
            health_endpoints = [
                f"{self.api_url}/health",
                f"{self.base_url}/health",
                f"{self.api_url}/api/health"
            ]
            
            for endpoint in health_endpoints:
                try:
                    response = requests.get(endpoint, timeout=5)
                    if response.status_code == 200:
                        self.log(f"API health OK via {endpoint}")
                        return True
                except requests.exceptions.RequestException:
                    continue
                    
            self.log("API health check failed", "ERROR")
            return False
            
        except Exception as e:
            self.log(f"Health check error: {str(e)}", "ERROR")
            return False
    
    def test_create_appointment(self) -> Optional[Dict[str, Any]]:
        """Testa CREATE appointment"""
        try:
            self.log("Testing CREATE appointment...")
            
            # Dados para criação
            start_time = (datetime.now() + timedelta(hours=24)).isoformat()
            appointment_data = {
                "service_id": 1,  # Assume que existe serviço com ID 1
                "professional_id": 1,  # Assume que existe profissional com ID 1
                "start_time": start_time,
                "client_notes": "Teste de criação via API"
            }
            
            endpoints_to_try = [
                f"{self.api_url}/api/v1/appointments",
                f"{self.base_url}/appointments",
                f"{self.api_url}/appointments"
            ]
            
            for endpoint in endpoints_to_try:
                try:
                    response = requests.post(
                        endpoint,
                        json=appointment_data,
                        headers=self.get_headers(),
                        timeout=10
                    )
                    
                    self.log(f"CREATE response: {response.status_code} from {endpoint}")
                    
                    if response.status_code == 201:
                        appointment = response.json()
                        self.created_appointment_id = appointment.get("id")
                        self.log(f"Appointment created successfully: ID {self.created_appointment_id}")
                        return appointment
                    else:
                        self.log(f"CREATE failed: {response.text}", "WARNING")
                        
                except requests.exceptions.RequestException as e:
                    self.log(f"CREATE request error: {str(e)}", "WARNING")
                    continue
            
            self.log("CREATE appointment failed - all endpoints tried", "ERROR")
            return None
            
        except Exception as e:
            self.log(f"CREATE appointment error: {str(e)}", "ERROR")
            return None
    
    def test_read_appointment(self, appointment_id: int) -> Optional[Dict[str, Any]]:
        """Testa READ appointment"""
        try:
            self.log(f"Testing READ appointment ID: {appointment_id}...")
            
            endpoints_to_try = [
                f"{self.api_url}/api/v1/appointments/{appointment_id}",
                f"{self.base_url}/appointments/{appointment_id}",
                f"{self.api_url}/appointments/{appointment_id}"
            ]
            
            for endpoint in endpoints_to_try:
                try:
                    response = requests.get(
                        endpoint,
                        headers=self.get_headers(),
                        timeout=10
                    )
                    
                    self.log(f"READ response: {response.status_code} from {endpoint}")
                    
                    if response.status_code == 200:
                        appointment = response.json()
                        self.log(f"Appointment read successfully: ID {appointment.get('id')}")
                        return appointment
                    else:
                        self.log(f"READ failed: {response.text}", "WARNING")
                        
                except requests.exceptions.RequestException as e:
                    self.log(f"READ request error: {str(e)}", "WARNING")
                    continue
            
            self.log("READ appointment failed - all endpoints tried", "ERROR")
            return None
            
        except Exception as e:
            self.log(f"READ appointment error: {str(e)}", "ERROR")
            return None
    
    def test_update_appointment(self, appointment_id: int) -> Optional[Dict[str, Any]]:
        """Testa UPDATE appointment"""
        try:
            self.log(f"Testing UPDATE appointment ID: {appointment_id}...")
            
            # Dados para atualização
            update_data = {
                "client_notes": "Teste de atualização via API",
                "professional_notes": "Notas do profissional atualizadas"
            }
            
            endpoints_to_try = [
                f"{self.api_url}/api/v1/appointments/{appointment_id}",
                f"{self.base_url}/appointments/{appointment_id}",
                f"{self.api_url}/appointments/{appointment_id}"
            ]
            
            for endpoint in endpoints_to_try:
                try:
                    response = requests.put(
                        endpoint,
                        json=update_data,
                        headers=self.get_headers(),
                        timeout=10
                    )
                    
                    self.log(f"UPDATE response: {response.status_code} from {endpoint}")
                    
                    if response.status_code == 200:
                        appointment = response.json()
                        self.log(f"Appointment updated successfully: ID {appointment.get('id')}")
                        return appointment
                    else:
                        self.log(f"UPDATE failed: {response.text}", "WARNING")
                        
                except requests.exceptions.RequestException as e:
                    self.log(f"UPDATE request error: {str(e)}", "WARNING")
                    continue
            
            self.log("UPDATE appointment failed - all endpoints tried", "ERROR")
            return None
            
        except Exception as e:
            self.log(f"UPDATE appointment error: {str(e)}", "ERROR")
            return None
    
    def test_delete_appointment(self, appointment_id: int) -> bool:
        """Testa DELETE appointment"""
        try:
            self.log(f"Testing DELETE appointment ID: {appointment_id}...")
            
            endpoints_to_try = [
                f"{self.api_url}/api/v1/appointments/{appointment_id}",
                f"{self.base_url}/appointments/{appointment_id}",
                f"{self.api_url}/appointments/{appointment_id}"
            ]
            
            for endpoint in endpoints_to_try:
                try:
                    response = requests.delete(
                        endpoint,
                        headers=self.get_headers(),
                        timeout=10
                    )
                    
                    self.log(f"DELETE response: {response.status_code} from {endpoint}")
                    
                    if response.status_code == 204:
                        self.log(f"Appointment deleted successfully: ID {appointment_id}")
                        return True
                    else:
                        self.log(f"DELETE failed: {response.text}", "WARNING")
                        
                except requests.exceptions.RequestException as e:
                    self.log(f"DELETE request error: {str(e)}", "WARNING")
                    continue
            
            self.log("DELETE appointment failed - all endpoints tried", "ERROR")
            return False
            
        except Exception as e:
            self.log(f"DELETE appointment error: {str(e)}", "ERROR")
            return False
    
    def run_full_crud_test(self) -> Dict[str, Any]:
        """Executa teste completo do CRUD"""
        results = {
            "login": False,
            "health": False,
            "create": False,
            "read": False,
            "update": False,
            "delete": False,
            "appointment_id": None,
            "errors": []
        }
        
        try:
            # 1. Health Check
            results["health"] = self.test_health()
            if not results["health"]:
                results["errors"].append("API health check failed")
                return results
            
            # 2. Login
            results["login"] = self.login()
            if not results["login"]:
                results["errors"].append("Login failed")
                return results
            
            # 3. Create
            appointment = self.test_create_appointment()
            if appointment:
                results["create"] = True
                results["appointment_id"] = appointment.get("id")
                
                # 4. Read
                read_appointment = self.test_read_appointment(appointment.get("id"))
                if read_appointment:
                    results["read"] = True
                    
                    # 5. Update
                    updated_appointment = self.test_update_appointment(appointment.get("id"))
                    if updated_appointment:
                        results["update"] = True
                        
                        # 6. Delete
                        results["delete"] = self.test_delete_appointment(appointment.get("id"))
                    else:
                        results["errors"].append("UPDATE failed")
                else:
                    results["errors"].append("READ failed")
            else:
                results["errors"].append("CREATE failed")
                
        except Exception as e:
            results["errors"].append(f"Test execution error: {str(e)}")
            self.log(f"Test execution error: {str(e)}", "ERROR")
        
        return results
    
    def print_results(self, results: Dict[str, Any]):
        """Imprime resultados formatados"""
        print("\n" + "="*60)
        print("APPOINTMENT CRUD TEST RESULTS")
        print("="*60)
        
        status_map = {
            "login": "LOGIN",
            "health": "HEALTH",
            "create": "CREATE",
            "read": "READ",
            "update": "UPDATE",
            "delete": "DELETE"
        }
        
        for key, label in status_map.items():
            status = "✅ PASS" if results[key] else "❌ FAIL"
            print(f"{label:10} : {status}")
        
        if results["appointment_id"]:
            print(f"{'APPOINTMENT ID':10} : {results['appointment_id']}")
        
        if results["errors"]:
            print("\nERRORS:")
            for error in results["errors"]:
                print(f"  - {error}")
        
        # Summary
        passed = sum(1 for k in status_map.keys() if results[k])
        total = len(status_map)
        print(f"\nSUMMARY: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED - CRUD is working!")
        else:
            print("⚠️  Some tests failed - check errors above")
        
        print("="*60)


def main():
    """Função principal"""
    print("Starting Appointment CRUD Test...")
    print("Make sure the API server is running!")
    print("-" * 60)
    
    # Configurar base URL
    base_urls = [
        "http://localhost:8000/api/v1",
        "http://127.0.0.1:8000/api/v1",
        "http://72.62.138.239/api/v1"  # VPS
    ]
    
    for base_url in base_urls:
        print(f"\nTrying base URL: {base_url}")
        
        tester = AppointmentCRUDTest(base_url)
        results = tester.run_full_crud_test()
        tester.print_results(results)
        
        # Se todos os testes passaram, para
        if all(results[k] for k in ["login", "health", "create", "read", "update", "delete"]):
            print(f"\n✅ Success with {base_url}")
            break
        else:
            print(f"\n❌ Failed with {base_url}, trying next...")


if __name__ == "__main__":
    main()
