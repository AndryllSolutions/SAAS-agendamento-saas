"""
Public API endpoints for online booking
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.company import Company
from app.models.service import Service
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.public import (
    CompanyProfile,
    ServiceItem,
    ProfessionalItem,
    AvailabilityResponse,
    CreatePublicAppointmentRequest,
    CreatePublicAppointmentResponse
)
# from app.services.availability_service import AvailabilityService
# from app.services.appointment_service import AppointmentService

router = APIRouter()

@router.get("/companies/{slug}", response_model=CompanyProfile)
async def get_public_company(slug: str, db: Session = Depends(get_db)):
    """Get company profile for public booking"""
    company = db.query(Company).filter(
        Company.slug == slug,
        Company.is_active == True,
        Company.status == "active"
    ).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    
    return CompanyProfile(
        id=company.id,
        name=company.name,
        description=company.description,
        logo_url=company.logo_url,
        address=company.address,
        phone=company.phone,
        whatsapp=company.whatsapp,
        instagram=company.instagram,
        status="open" if company.status == "active" else "closed"
    )

@router.get("/services", response_model=List[ServiceItem])
async def get_public_services(
    companyId: int = Query(...),
    db: Session = Depends(get_db)
):
    """Get public services for a company"""
    services = db.query(Service).filter(
        Service.company_id == companyId,
        Service.is_active == True
    ).all()
    
    return [
        ServiceItem(
            id=service.id,
            name=service.name,
            description=service.description,
            price=float(service.price),
            duration=service.duration,
            category=service.category
        )
        for service in services
    ]

@router.get("/professionals", response_model=List[ProfessionalItem])
async def get_public_professionals(
    companyId: int = Query(...),
    db: Session = Depends(get_db)
):
    """Get public professionals for a company"""
    professionals = db.query(User).filter(
        User.company_id == companyId,
        User.role == 'PROFESSIONAL',
        User.is_active == True
    ).all()
    
    return [
        ProfessionalItem(
            id=prof.id,
            name=prof.full_name or prof.name,
            full_name=prof.full_name,
            photo_url=prof.avatar_url,
            specialties=prof.specialties or []
        )
        for prof in professionals
    ]

@router.get("/availability", response_model=AvailabilityResponse)
async def get_public_availability(
    companyId: int = Query(...),
    serviceId: int = Query(...),
    professionalId: int = Query(...),
    date: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get available time slots for booking"""
    try:
        selected_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # TODO: Implement availability service
    # For now, return empty slots
    return AvailabilityResponse(
        date=date,
        available_slots=[],
        professional_id=professionalId,
        service_id=serviceId
    )

@router.post("/appointments", response_model=CreatePublicAppointmentResponse)
async def create_public_appointment(
    request: CreatePublicAppointmentRequest,
    db: Session = Depends(get_db)
):
    """Create a new appointment through public booking"""
    raise HTTPException(status_code=501, detail="Appointment creation not implemented yet")
