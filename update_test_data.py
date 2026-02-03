#!/usr/bin/env python3

from app.core.database import get_db
from app.models.company_configurations import CompanyDetails

def update_test_data():
    db = next(get_db())
    
    # Buscar os detalhes da empresa do usuário
    details = db.query(CompanyDetails).filter(CompanyDetails.company_id == 4).first()
    
    if details:
        print(f"Details found for company_id 4")
        print(f"Current data: {details.__dict__}")
        
        # Atualizar com dados de teste
        details.company_type = "pessoa_fisica"
        details.document_number = "483.736.638-43"
        details.company_name = "Andryll Solutions"
        details.email = "contato@andryllsolutions.com"
        details.phone = "(11) 99999-9999"
        details.whatsapp = "(11) 99999-9999"
        details.postal_code = "01310-100"
        details.address = "Avenida Paulista"
        details.address_number = "1000"
        details.address_complement = "Sala 100"
        details.neighborhood = "Bela Vista"
        details.city = "São Paulo"
        details.state = "SP"
        details.country = "BR"
        
        db.commit()
        print("✅ Test data updated successfully!")
        
        # Verificar dados atualizados
        updated = db.query(CompanyDetails).filter(CompanyDetails.company_id == 4).first()
        print(f"Updated data: {updated.__dict__}")
        
    else:
        print("No details found for company_id 4")

if __name__ == "__main__":
    update_test_data()
