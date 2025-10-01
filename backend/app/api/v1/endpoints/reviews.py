"""
Reviews Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.review import Review
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from pydantic import BaseModel, Field

router = APIRouter()


class ReviewCreate(BaseModel):
    appointment_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str = None


class ReviewResponse(BaseModel):
    id: int
    appointment_id: int
    client_id: int
    professional_id: int
    rating: int
    comment: str = None
    response: str = None
    response_at: str = None
    is_visible: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReviewResponseCreate(BaseModel):
    response: str


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a review for a completed appointment
    """
    # Check if appointment exists and is completed
    appointment = db.query(Appointment).filter(
        Appointment.id == review_data.appointment_id,
        Appointment.client_id == current_user.id,
        Appointment.status == AppointmentStatus.COMPLETED
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado ou não está completo"
        )
    
    # Check if review already exists
    existing_review = db.query(Review).filter(
        Review.appointment_id == review_data.appointment_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Avaliação já existe para este agendamento"
        )
    
    review = Review(
        company_id=current_user.company_id,
        appointment_id=review_data.appointment_id,
        client_id=current_user.id,
        professional_id=appointment.professional_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review


@router.get("/", response_model=List[ReviewResponse])
async def list_reviews(
    professional_id: int = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List reviews
    """
    query = db.query(Review).filter(
        Review.company_id == current_user.company_id,
        Review.is_visible == True
    )
    
    if professional_id:
        query = query.filter(Review.professional_id == professional_id)
    
    reviews = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    return reviews


@router.get("/professional/{professional_id}/stats")
async def get_professional_review_stats(
    professional_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get review statistics for a professional
    """
    from sqlalchemy import func
    
    stats = db.query(
        func.count(Review.id).label("total"),
        func.avg(Review.rating).label("average"),
        func.sum(func.case([(Review.rating == 5, 1)], else_=0)).label("five_stars"),
        func.sum(func.case([(Review.rating == 4, 1)], else_=0)).label("four_stars"),
        func.sum(func.case([(Review.rating == 3, 1)], else_=0)).label("three_stars"),
        func.sum(func.case([(Review.rating == 2, 1)], else_=0)).label("two_stars"),
        func.sum(func.case([(Review.rating == 1, 1)], else_=0)).label("one_star"),
    ).filter(
        Review.professional_id == professional_id,
        Review.company_id == current_user.company_id,
        Review.is_visible == True
    ).first()
    
    return {
        "total_reviews": stats.total or 0,
        "average_rating": float(stats.average) if stats.average else 0,
        "rating_distribution": {
            "5": stats.five_stars or 0,
            "4": stats.four_stars or 0,
            "3": stats.three_stars or 0,
            "2": stats.two_stars or 0,
            "1": stats.one_star or 0,
        }
    }


@router.post("/{review_id}/response", response_model=ReviewResponse)
async def respond_to_review(
    review_id: int,
    response_data: ReviewResponseCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Professional responds to a review
    """
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.professional_id == current_user.id
    ).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada"
        )
    
    review.response = response_data.response
    review.response_at = datetime.utcnow().isoformat()
    
    db.commit()
    db.refresh(review)
    
    return review
