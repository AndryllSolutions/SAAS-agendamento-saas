"""
Goals Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, date
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.goal import Goal, GoalType
from app.schemas.goal import GoalCreate, GoalCreatePublic, GoalUpdate, GoalResponse

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


def calculate_goal_progress(goal: Goal, db: Session) -> tuple:
    """Calculate goal progress"""
    from app.models.command import Command, CommandStatus
    from app.models.financial import FinancialTransaction, TransactionType, TransactionStatus
    
    current_value = 0
    
    if goal.type == GoalType.REVENUE:
        # Calculate revenue from finished commands
        if goal.professional_id:
            commands = db.query(Command).filter(
                Command.company_id == goal.company_id,
                Command.professional_id == goal.professional_id,
                Command.status == CommandStatus.FINISHED,
                Command.date >= goal.period_start,
                Command.date <= goal.period_end
            ).all()
            current_value = sum(float(c.net_value) for c in commands)
        else:
            transactions = db.query(FinancialTransaction).filter(
                FinancialTransaction.company_id == goal.company_id,
                FinancialTransaction.type == TransactionType.INCOME,
                FinancialTransaction.status == TransactionStatus.LIQUIDATED,
                FinancialTransaction.date >= goal.period_start,
                FinancialTransaction.date <= goal.period_end
            ).all()
            current_value = sum(float(t.value) for t in transactions)
    
    elif goal.type == GoalType.APPOINTMENTS:
        from app.models.appointment import Appointment, AppointmentStatus
        if goal.professional_id:
            appointments = db.query(Appointment).filter(
                Appointment.company_id == goal.company_id,
                Appointment.professional_id == goal.professional_id,
                Appointment.status == AppointmentStatus.COMPLETED,
                Appointment.start_time >= goal.period_start,
                Appointment.start_time <= goal.period_end
            ).count()
        else:
            appointments = db.query(Appointment).filter(
                Appointment.company_id == goal.company_id,
                Appointment.status == AppointmentStatus.COMPLETED,
                Appointment.start_time >= goal.period_start,
                Appointment.start_time <= goal.period_end
            ).count()
        current_value = appointments
    
    elif goal.type == GoalType.PRODUCT_SALES:
        from app.models.command import CommandItem, CommandItemType, CommandStatus
        if goal.professional_id:
            items = db.query(CommandItem).join(Command).filter(
                Command.company_id == goal.company_id,
                Command.professional_id == goal.professional_id,
                Command.status == CommandStatus.FINISHED,
                CommandItem.item_type == CommandItemType.PRODUCT,
                Command.date >= goal.period_start,
                Command.date <= goal.period_end
            ).all()
        else:
            items = db.query(CommandItem).join(Command).filter(
                Command.company_id == goal.company_id,
                Command.status == CommandStatus.FINISHED,
                CommandItem.item_type == CommandItemType.PRODUCT,
                Command.date >= goal.period_start,
                Command.date <= goal.period_end
            ).all()
        current_value = sum(item.quantity for item in items)
    
    progress_percentage = int((current_value / float(goal.target_value)) * 100) if goal.target_value > 0 else 0
    if progress_percentage > 100:
        progress_percentage = 100
    
    return current_value, progress_percentage


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_goal(
    goal_data: GoalCreatePublic,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new goal (company_id auto-filled from auth)"""
    goal = Goal(**goal_data.model_dump(), company_id=current_user.company_id)
    goal.current_value = 0
    goal.progress_percentage = 0
    
    db.add(goal)
    db.commit()
    db.refresh(goal)
    
    # Calculate initial progress
    current_value, progress = calculate_goal_progress(goal, db)
    goal.current_value = current_value
    goal.progress_percentage = progress
    db.commit()
    db.refresh(goal)
    
    return GoalResponse.model_validate(goal)


@router.get("", response_model=List[GoalResponse])
@router.get("/", response_model=List[GoalResponse], include_in_schema=False)
async def list_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    professional_id: Optional[int] = None,
    type: Optional[GoalType] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List goals"""
    query = db.query(Goal).filter(Goal.company_id == current_user.company_id)
    
    if professional_id:
        query = query.filter(Goal.professional_id == professional_id)
    
    if type:
        query = query.filter(Goal.type == type)
    
    if is_active is not None:
        query = query.filter(Goal.is_active == is_active)
    
    goals = query.order_by(Goal.period_start.desc()).offset(skip).limit(limit).all()
    
    # Update progress for all goals
    for goal in goals:
        current_value, progress = calculate_goal_progress(goal, db)
        goal.current_value = current_value
        goal.progress_percentage = progress
    
    db.commit()
    
    return [GoalResponse.model_validate(g) for g in goals]


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get goal by ID"""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.company_id == current_user.company_id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Update progress
    current_value, progress = calculate_goal_progress(goal, db)
    goal.current_value = current_value
    goal.progress_percentage = progress
    db.commit()
    db.refresh(goal)
    
    return GoalResponse.model_validate(goal)


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update goal"""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.company_id == current_user.company_id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = goal_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    # Recalculate progress
    current_value, progress = calculate_goal_progress(goal, db)
    goal.current_value = current_value
    goal.progress_percentage = progress
    
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete goal"""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.company_id == current_user.company_id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(goal)
    db.commit()
    return None


@router.get("/progress/all", response_model=List[GoalResponse])
async def calculate_all_goals_progress(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Calculate progress for all active goals"""
    goals = db.query(Goal).filter(
        Goal.company_id == current_user.company_id,
        Goal.is_active == True
    ).all()
    
    for goal in goals:
        current_value, progress = calculate_goal_progress(goal, db)
        goal.current_value = current_value
        goal.progress_percentage = progress
    
    db.commit()
    return goals

