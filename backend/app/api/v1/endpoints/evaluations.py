"""
Evaluations Endpoints - Now uses Review model (merged)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import func, case

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.review import Review  # ATUALIZADO: usando Review model
from app.models.client import Client
from app.schemas.evaluation import (
    EvaluationCreate, EvaluationUpdate, EvaluationResponse,
    EvaluationAnswer, EvaluationStats
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


@router.post("", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_evaluation(
    evaluation_data: EvaluationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new evaluation"""
    if evaluation_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Verify client exists
    client = db.query(Client).filter(
        Client.id == evaluation_data.client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    evaluation = Review(
        company_id=evaluation_data.company_id,
        client_crm_id=evaluation_data.client_id,
        professional_id=evaluation_data.professional_id,
        appointment_id=evaluation_data.appointment_id,
        rating=evaluation_data.rating,
        comment=evaluation_data.comment,
        origin=evaluation_data.origin or 'other',  # evaluations não são post_service
        is_answered=False,
        is_visible=True,
        is_approved=True
    )
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)
    return EvaluationResponse.model_validate(evaluation)


@router.get("", response_model=List[EvaluationResponse])
@router.get("/", response_model=List[EvaluationResponse], include_in_schema=False)
async def list_evaluations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    client_id: Optional[int] = None,
    professional_id: Optional[int] = None,
    rating: Optional[int] = None,
    is_answered: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List evaluations - now uses reviews with origin filter"""
    query = db.query(Review).filter(
        Review.company_id == current_user.company_id,
        Review.origin.in_(['link', 'app', 'other'])  # Não é post_service
    )
    
    if client_id:
        query = query.filter(Review.client_crm_id == client_id)
    
    if professional_id:
        query = query.filter(Review.professional_id == professional_id)
    
    if rating:
        query = query.filter(Review.rating == rating)
    
    if is_answered is not None:
        query = query.filter(Review.is_answered == is_answered)
    
    evaluations = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    return [EvaluationResponse.model_validate(e) for e in evaluations]


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
async def get_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get evaluation by ID - now uses reviews with origin filter"""
    evaluation = db.query(Review).filter(
        Review.id == evaluation_id,
        Review.company_id == current_user.company_id,
        Review.origin.in_(['link', 'app', 'other'])
    ).first()
    
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return EvaluationResponse.model_validate(evaluation)


@router.put("/{evaluation_id}", response_model=EvaluationResponse)
async def update_evaluation(
    evaluation_id: int,
    evaluation_data: EvaluationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update evaluation - now uses reviews with origin filter"""
    evaluation = db.query(Review).filter(
        Review.id == evaluation_id,
        Review.company_id == current_user.company_id,
        Review.origin.in_(['link', 'app', 'other'])
    ).first()
    
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = evaluation_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(evaluation, field, value)
    
    db.commit()
    db.refresh(evaluation)
    return EvaluationResponse.model_validate(evaluation)


@router.post("/{evaluation_id}/answer", response_model=EvaluationResponse)
async def answer_evaluation(
    evaluation_id: int,
    answer_data: EvaluationAnswer,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Answer an evaluation - now uses reviews with origin filter"""
    evaluation = db.query(Review).filter(
        Review.id == evaluation_id,
        Review.company_id == current_user.company_id,
        Review.origin.in_(['link', 'app', 'other'])
    ).first()
    
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if evaluation.is_answered:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Avaliação já foi respondida"
        )
    
    evaluation.is_answered = True
    evaluation.answer_date = datetime.now()
    evaluation.answer_text = answer_data.answer_text
    
    db.commit()
    db.refresh(evaluation)
    return EvaluationResponse.model_validate(evaluation)


@router.get("/stats/summary", response_model=EvaluationStats)
async def get_evaluation_stats(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get evaluation statistics - now uses reviews with origin filter"""
    query = db.query(Review).filter(
        Review.company_id == current_user.company_id,
        Review.origin.in_(['link', 'app', 'other'])
    )
    
    if start_date:
        query = query.filter(Review.created_at >= start_date)
    
    if end_date:
        query = query.filter(Review.created_at <= end_date)
    
    evaluations = query.all()
    
    if not evaluations:
        return EvaluationStats(
            average_rating=0,
            total_evaluations=0,
            response_rate=0,
            rating_distribution={1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            professionals_stats=[]
        )
    
    # Calculate average rating
    total_rating = sum(e.rating for e in evaluations)
    average_rating = total_rating / len(evaluations)
    
    # Calculate response rate
    answered = sum(1 for e in evaluations if e.is_answered)
    response_rate = (answered / len(evaluations)) * 100 if evaluations else 0
    
    # Rating distribution
    rating_distribution = {i: sum(1 for e in evaluations if e.rating == i) for i in range(1, 6)}
    
    # Professionals stats
    from app.models.user import User
    professionals_stats = []
    professional_ids = set(e.professional_id for e in evaluations if e.professional_id)
    
    for prof_id in professional_ids:
        prof_evaluations = [e for e in evaluations if e.professional_id == prof_id]
        if prof_evaluations:
            prof_avg = sum(e.rating for e in prof_evaluations) / len(prof_evaluations)
            professional = db.query(User).filter(User.id == prof_id).first()
            professionals_stats.append({
                "professional_id": prof_id,
                "professional_name": professional.full_name if professional else "Desconhecido",
                "average_rating": prof_avg,
                "total_evaluations": len(prof_evaluations)
            })
    
    return EvaluationStats(
        average_rating=average_rating,
        total_evaluations=len(evaluations),
        response_rate=response_rate,
        rating_distribution=rating_distribution,
        professionals_stats=professionals_stats
    )


@router.delete("/{evaluation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete evaluation"""
    evaluation = db.query(Evaluation).filter(
        Evaluation.id == evaluation_id,
        Evaluation.company_id == current_user.company_id
    ).first()
    
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(evaluation)
    db.commit()
    return None

