"""
Client Notes Endpoints - CRUD inline para notas do cliente
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User, UserRole
from app.models.client import Client

router = APIRouter(redirect_slashes=False)


# ========== SCHEMAS ==========

class ClientNoteBase(BaseModel):
    """Base schema for client note"""
    content: str
    is_private: bool = False  # Private notes only visible to staff


class ClientNoteCreate(ClientNoteBase):
    """Schema for creating a client note"""
    pass


class ClientNoteUpdate(BaseModel):
    """Schema for updating a client note"""
    content: Optional[str] = None
    is_private: Optional[bool] = None


class ClientNoteResponse(ClientNoteBase):
    """Schema for client note response"""
    id: int
    client_id: int
    created_by_id: int
    created_by_name: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ========== TEMPORARY MODEL (will be migrated to proper table later) ==========
# For now, we'll store notes in client.notes JSON field as array of objects

def _get_client_notes(client: Client) -> List[dict]:
    """Get notes from client.notes JSON field"""
    if not client.notes:
        return []
    
    # If notes is a string (old format), convert to new format
    if isinstance(client.notes, str):
        return [{
            "id": 1,
            "content": client.notes,
            "is_private": False,
            "created_by_id": 0,
            "created_by_name": "Sistema",
            "created_at": client.created_at.isoformat() if client.created_at else datetime.utcnow().isoformat(),
            "updated_at": client.updated_at.isoformat() if client.updated_at else datetime.utcnow().isoformat()
        }]
    
    # If notes is already a list, return it
    if isinstance(client.notes, list):
        return client.notes
    
    return []


def _save_client_notes(client: Client, notes: List[dict]):
    """Save notes to client.notes JSON field"""
    client.notes = notes


# ========== ENDPOINTS ==========

@router.get("/{client_id}/notes", response_model=List[ClientNoteResponse])
async def get_client_notes(
    client_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all notes for a client
    """
    # Get client
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Get notes
    notes = _get_client_notes(client)
    
    # Filter private notes if user is a client
    if current_user.role == UserRole.CLIENT:
        notes = [n for n in notes if not n.get("is_private", False)]
    
    return notes


@router.post("/{client_id}/notes", response_model=ClientNoteResponse, status_code=status.HTTP_201_CREATED)
async def create_client_note(
    client_id: int,
    note_data: ClientNoteCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new note for a client
    """
    # Get client
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Get existing notes
    notes = _get_client_notes(client)
    
    # Generate new ID
    new_id = max([n.get("id", 0) for n in notes], default=0) + 1
    
    # Create new note
    now = datetime.utcnow()
    new_note = {
        "id": new_id,
        "content": note_data.content,
        "is_private": note_data.is_private,
        "created_by_id": current_user.id,
        "created_by_name": current_user.full_name,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    # Add to notes
    notes.append(new_note)
    _save_client_notes(client, notes)
    
    db.commit()
    db.refresh(client)
    
    return new_note


@router.put("/{client_id}/notes/{note_id}", response_model=ClientNoteResponse)
async def update_client_note(
    client_id: int,
    note_id: int,
    note_data: ClientNoteUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a client note
    """
    # Get client
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Get notes
    notes = _get_client_notes(client)
    
    # Find note
    note = None
    note_index = None
    for i, n in enumerate(notes):
        if n.get("id") == note_id:
            note = n
            note_index = i
            break
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota não encontrada"
        )
    
    # Check permissions (only creator or admin can edit)
    if current_user.role not in [UserRole.OWNER, UserRole.MANAGER]:
        if note.get("created_by_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para editar esta nota"
            )
    
    # Update note
    if note_data.content is not None:
        note["content"] = note_data.content
    if note_data.is_private is not None:
        note["is_private"] = note_data.is_private
    note["updated_at"] = datetime.utcnow().isoformat()
    
    # Save
    notes[note_index] = note
    _save_client_notes(client, notes)
    
    db.commit()
    db.refresh(client)
    
    return note


@router.delete("/{client_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client_note(
    client_id: int,
    note_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a client note
    """
    # Get client
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Get notes
    notes = _get_client_notes(client)
    
    # Find note
    note = None
    note_index = None
    for i, n in enumerate(notes):
        if n.get("id") == note_id:
            note = n
            note_index = i
            break
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota não encontrada"
        )
    
    # Check permissions (only creator or admin can delete)
    if current_user.role not in [UserRole.OWNER, UserRole.MANAGER]:
        if note.get("created_by_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para deletar esta nota"
            )
    
    # Remove note
    notes.pop(note_index)
    _save_client_notes(client, notes)
    
    db.commit()
    
    return None
