"""
Pydantic schemas for public API endpoints
"""
from pydantic import BaseModel, EmailStr
from typing import List, Optional

class CompanyProfile(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    instagram: Optional[str] = None
    status: str  # "open" or "closed"

class ServiceItem(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    duration: int  # in minutes
    category: Optional[str] = None

class ProfessionalItem(BaseModel):
    id: int
    name: str
    full_name: Optional[str] = None
    photo_url: Optional[str] = None
    specialties: List[str] = []

class AvailabilityResponse(BaseModel):
    date: str
    slots: List[str]

class CustomerData(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    notes: Optional[str] = None

class CreatePublicAppointmentRequest(BaseModel):
    companyId: int
    serviceId: int
    professionalId: int
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    customer: CustomerData

class CreatePublicAppointmentResponse(BaseModel):
    ok: bool
    appointmentId: Optional[int] = None
