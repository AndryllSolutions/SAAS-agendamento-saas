"""
API Keys Management Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.api_key import APIKey
from app.schemas.api_key import (
    APIKeyCreate,
    APIKeyUpdate,
    APIKeyResponse,
    APIKeyCreatedResponse,
    AvailableScopesResponse
)

router = APIRouter()


@router.get("/scopes", response_model=AvailableScopesResponse)
async def get_available_scopes():
    """Get list of available API scopes"""
    return AvailableScopesResponse()


@router.get("", response_model=List[APIKeyResponse])
@router.get("/", response_model=List[APIKeyResponse], include_in_schema=False)
async def list_api_keys(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List all API keys for the current user's company
    """
    api_keys = db.query(APIKey).filter(
        APIKey.company_id == current_user.company_id
    ).order_by(APIKey.created_at.desc()).all()
    
    return api_keys


@router.post("", response_model=APIKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=APIKeyCreatedResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_api_key(
    api_key_data: APIKeyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new API key
    
    **Important:** The full API key will only be shown once.
    Make sure to save it securely!
    """
    # Generate API key
    full_key, key_hash = APIKey.generate_key()
    
    # Get prefix from full key
    key_prefix = full_key[:9]  # "ak_live_"
    
    # Convert scopes list to JSON string
    scopes_json = json.dumps(api_key_data.scopes) if api_key_data.scopes else None
    
    # Convert IP whitelist to JSON string
    ip_whitelist_json = json.dumps(api_key_data.ip_whitelist) if api_key_data.ip_whitelist else None
    
    # Create API key record
    api_key = APIKey(
        company_id=current_user.company_id,
        user_id=current_user.id,
        name=api_key_data.name,
        key_prefix=key_prefix,
        key_hash=key_hash,
        description=api_key_data.description,
        scopes=scopes_json,
        expires_at=api_key_data.expires_at,
        ip_whitelist=ip_whitelist_json,
        is_active=True,
        usage_count=0
    )
    
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    
    # Return response with full key
    response_data = APIKeyResponse.model_validate(api_key).model_dump()
    response_data['api_key'] = full_key
    
    return response_data


@router.get("/{api_key_id}", response_model=APIKeyResponse)
async def get_api_key(
    api_key_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific API key"""
    api_key = db.query(APIKey).filter(
        APIKey.id == api_key_id,
        APIKey.company_id == current_user.company_id
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Key not found"
        )
    
    return api_key


@router.patch("/{api_key_id}", response_model=APIKeyResponse)
async def update_api_key(
    api_key_id: int,
    api_key_data: APIKeyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an API key"""
    api_key = db.query(APIKey).filter(
        APIKey.id == api_key_id,
        APIKey.company_id == current_user.company_id
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Key not found"
        )
    
    # Update fields
    update_data = api_key_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == 'scopes' and value is not None:
            setattr(api_key, field, json.dumps(value))
        elif field == 'ip_whitelist' and value is not None:
            setattr(api_key, field, json.dumps(value))
        else:
            setattr(api_key, field, value)
    
    db.commit()
    db.refresh(api_key)
    
    return api_key


@router.delete("/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    api_key_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete an API key (revoke access)
    """
    api_key = db.query(APIKey).filter(
        APIKey.id == api_key_id,
        APIKey.company_id == current_user.company_id
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Key not found"
        )
    
    db.delete(api_key)
    db.commit()
    
    return None


@router.post("/{api_key_id}/rotate", response_model=APIKeyCreatedResponse)
async def rotate_api_key(
    api_key_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Rotate an API key (generate new key, keep same permissions)
    
    **Important:** The old key will be invalidated immediately.
    The new key will only be shown once. Make sure to save it!
    """
    api_key = db.query(APIKey).filter(
        APIKey.id == api_key_id,
        APIKey.company_id == current_user.company_id
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Key not found"
        )
    
    # Generate new key
    full_key, key_hash = APIKey.generate_key()
    key_prefix = full_key[:9]
    
    # Update API key
    api_key.key_hash = key_hash
    api_key.key_prefix = key_prefix
    api_key.usage_count = 0
    api_key.last_used_at = None
    
    db.commit()
    db.refresh(api_key)
    
    # Return response with full key
    response_data = APIKeyResponse.model_validate(api_key).model_dump()
    response_data['api_key'] = full_key
    
    return response_data

