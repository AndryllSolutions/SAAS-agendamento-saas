"""
Resources Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.resource import Resource
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()


class ResourceBase(BaseModel):
    name: str
    description: str = None
    resource_type: str
    location: str = None
    capacity: int = 1


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    name: str = None
    description: str = None
    is_active: bool = None
    is_available: bool = None
    location: str = None
    capacity: int = None


class ResourceResponse(ResourceBase):
    id: int
    company_id: int
    is_active: bool
    is_available: bool
    image_url: str = None
    
    class Config:
        from_attributes = True


@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource_data: ResourceCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Create a resource (Manager/Admin only)
    """
    resource = Resource(
        **resource_data.dict(),
        company_id=current_user.company_id
    )
    
    db.add(resource)
    db.commit()
    db.refresh(resource)
    
    return resource


@router.get("/", response_model=List[ResourceResponse])
async def list_resources(
    resource_type: str = None,
    is_available: bool = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List resources
    """
    query = db.query(Resource).filter(
        Resource.company_id == current_user.company_id,
        Resource.is_active == True
    )
    
    if resource_type:
        query = query.filter(Resource.resource_type == resource_type)
    
    if is_available is not None:
        query = query.filter(Resource.is_available == is_available)
    
    resources = query.all()
    return resources


@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get resource by ID
    """
    resource = db.query(Resource).filter(
        Resource.id == resource_id,
        Resource.company_id == current_user.company_id
    ).first()
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurso não encontrado"
        )
    
    return resource


@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: int,
    resource_data: ResourceUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Update resource (Manager/Admin only)
    """
    resource = db.query(Resource).filter(
        Resource.id == resource_id,
        Resource.company_id == current_user.company_id
    ).first()
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurso não encontrado"
        )
    
    update_data = resource_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resource, field, value)
    
    db.commit()
    db.refresh(resource)
    
    return resource


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Delete resource (Manager/Admin only)
    """
    resource = db.query(Resource).filter(
        Resource.id == resource_id,
        Resource.company_id == current_user.company_id
    ).first()
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurso não encontrado"
        )
    
    resource.is_active = False
    db.commit()
    
    return None
