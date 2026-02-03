#!/usr/bin/env python3

from app.core.database import get_db
from app.models.company_configurations import CompanyDetails
from app.models.company import Company
from app.models.user import User

def check_company_data():
    db = next(get_db())
    
    # Verificar usuários
    users = db.query(User).limit(5).all()
    print(f"Users found: {len(users)}")
    
    for user in users:
        print(f"- {user.full_name} ({user.email})")
        
        # Verificar empresa
        if user.company:
            print(f"  Company: {user.company.name}")
            
            # Verificar detalhes da empresa
            details = db.query(CompanyDetails).filter(CompanyDetails.company_id == user.company_id).first()
            if details:
                print(f"  Details found:")
                print(f"    - Company Type: {details.company_type}")
                print(f"    - Document: {details.document_number}")
                print(f"    - Company Name: {details.company_name}")
                print(f"    - Email: {details.email}")
                print(f"    - Phone: {details.phone}")
                print(f"    - Address: {details.address}, {details.address_number}")
                print(f"    - City: {details.city} - {details.state}")
                print(f"    - Country: {details.country}")
            else:
                print(f"  No details found for company {user.company_id}")
        else:
            print(f"  No company found for user {user.id}")
        print()

if __name__ == "__main__":
    check_company_data()
