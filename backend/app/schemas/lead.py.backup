from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class LeadBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    whatsapp: Optional[str] = Field(None, max_length=20)

    source: Optional[str] = Field(None, max_length=50)
    stage: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=20)

    notes: Optional[str] = None

    wa_chat_title: Optional[str] = Field(None, max_length=255)
    wa_last_message: Optional[str] = None
    wa_url: Optional[str] = Field(None, max_length=500)

    raw_payload: Optional[dict] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    whatsapp: Optional[str] = Field(None, max_length=20)

    source: Optional[str] = Field(None, max_length=50)
    stage: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=20)

    notes: Optional[str] = None

    wa_chat_title: Optional[str] = Field(None, max_length=255)
    wa_last_message: Optional[str] = None
    wa_url: Optional[str] = Field(None, max_length=500)

    raw_payload: Optional[dict] = None

    is_converted: Optional[bool] = None


class LeadResponse(LeadBase):
    id: int
    company_id: int

    created_by_user_id: Optional[int] = None
    converted_client_id: Optional[int] = None

    is_converted: bool

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
