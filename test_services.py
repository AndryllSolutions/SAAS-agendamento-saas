#!/usr/bin/env python3
from app.models.service import Service
from app.core.database import Session
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = sessionmaker(settings.SQLALCHEMY_DATABASE_URL)
db = Session()

try:
    services = db.query(Service).filter(Service.is_active == True).limit(1).all()
    print(f"Found {len(services)} services")
    for service in services:
        print(f"Service: {service.id} - {service.name}")
        print(f"  available_online: {service.available_online}")
        print(f"  online_booking_enabled: {service.online_booking_enabled}")
        print(f"  Type: {type(service.available_online)}")
        print(f"  Type: {type(service.online_booking_enabled)}")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
