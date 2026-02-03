"""
Evaluation Schemas
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.evaluation import EvaluationOrigin


class EvaluationBase(BaseModel):
    """Base evaluation schema"""
    client_id: int
    professional_id: Optional[int] = None
    appointment_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    origin: EvaluationOrigin


class EvaluationCreate(EvaluationBase):
    """Schema for creating an evaluation"""
    company_id: int


class EvaluationUpdate(BaseModel):
    """Schema for updating an evaluation"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class EvaluationResponse(EvaluationBase):
    """Schema for evaluation response"""
    id: int
    company_id: int
    is_answered: bool
    answer_date: Optional[datetime] = None
    answer_text: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EvaluationAnswer(BaseModel):
    """Schema for answering an evaluation"""
    answer_text: str = Field(..., min_length=1)


class EvaluationStats(BaseModel):
    """Schema for evaluation statistics"""
    average_rating: float
    total_evaluations: int
    response_rate: float
    average_response_time: Optional[float] = None
    rating_distribution: dict
    professionals_stats: List[dict] = []

