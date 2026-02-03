"""
Commands Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.command import Command, CommandItem, CommandStatus, CommandItemType
from app.models.client import Client
from app.models.service import Service
from app.models.product import Product
from app.models.package import Package
from app.schemas.command import (
    CommandCreate, CommandCreatePublic, CommandUpdate, CommandResponse, CommandItemCreate, CommandItemResponse,
    CommandFinish
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


def generate_command_number(company_id: int, db: Session) -> str:
    """Generate unique command number"""
    from app.models.command import Command
    today = datetime.now().date()
    count = db.query(Command).filter(
        Command.company_id == company_id,
        Command.created_at >= datetime.combine(today, datetime.min.time())
    ).count()
    
    return f"CMD-{today.strftime('%Y%m%d')}-{count + 1:04d}"


@router.post("", response_model=CommandResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CommandResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_command(
    command_data: CommandCreatePublic,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new command (company_id auto-filled from auth)"""
    # Verify client exists
    client = db.query(Client).filter(
        Client.id == command_data.client_crm_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Generate command number
    command_number = generate_command_number(current_user.company_id, db)
    
    # Create command
    command = Command(
        company_id=current_user.company_id,
        client_crm_id=command_data.client_crm_id,
        professional_id=command_data.professional_id,
        appointment_id=command_data.appointment_id,
        number=command_number,
        date=command_data.date,
        notes=command_data.notes,
        status=CommandStatus.OPEN
    )
    db.add(command)
    db.flush()
    
    # Add items
    total_value = Decimal(0)
    for item_data in command_data.items:
        # Verify item exists
        if item_data.item_type == CommandItemType.SERVICE:
            item_ref = db.query(Service).filter(
                Service.id == item_data.service_id,
                Service.company_id == current_user.company_id
            ).first()
            if not item_ref:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Serviço {item_data.service_id} não encontrado"
                )
        elif item_data.item_type == CommandItemType.PRODUCT:
            item_ref = db.query(Product).filter(
                Product.id == item_data.product_id,
                Product.company_id == current_user.company_id
            ).first()
            if not item_ref:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Produto {item_data.product_id} não encontrado"
                )
        elif item_data.item_type == CommandItemType.PACKAGE:
            item_ref = db.query(Package).filter(
                Package.id == item_data.package_id,
                Package.company_id == current_user.company_id
            ).first()
            if not item_ref:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Pacote {item_data.package_id} não encontrado"
                )
        
        item_total = item_data.unit_value * item_data.quantity
        total_value += item_total
        
        # Determine reference_id based on item type
        reference_id = None
        if item_data.item_type == CommandItemType.SERVICE:
            reference_id = item_data.service_id
        elif item_data.item_type == CommandItemType.PRODUCT:
            reference_id = item_data.product_id
        elif item_data.item_type == CommandItemType.PACKAGE:
            reference_id = item_data.package_id
        
        item = CommandItem(
            command_id=command.id,
            item_type=item_data.item_type,
            reference_id=reference_id,
            service_id=item_data.service_id,
            product_id=item_data.product_id,
            package_id=item_data.package_id,
            professional_id=item_data.professional_id,
            quantity=item_data.quantity,
            unit_value=item_data.unit_value,
            total_value=item_total,
            commission_percentage=item_data.commission_percentage
        )
        db.add(item)
    
    command.total_value = total_value
    command.net_value = total_value
    
    db.commit()
    db.refresh(command)
    
    return CommandResponse.model_validate(command)


@router.get("", response_model=List[CommandResponse])
@router.get("/", response_model=List[CommandResponse], include_in_schema=False)
async def list_commands(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    client_id: Optional[int] = None,
    professional_id: Optional[int] = None,
    status: Optional[CommandStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List commands (Optimized with eager loading)"""
    from sqlalchemy.orm import joinedload, selectinload
    
    # Optimized query with eager loading to avoid N+1 queries
    query = db.query(Command).options(
        joinedload(Command.client),
        joinedload(Command.professional),
        selectinload(Command.items).joinedload(CommandItem.service),
        selectinload(Command.items).joinedload(CommandItem.product),
        selectinload(Command.items).joinedload(CommandItem.package),
    ).filter(Command.company_id == current_user.company_id)
    
    if client_id:
        query = query.filter(Command.client_id == client_id)
    
    if professional_id:
        query = query.filter(Command.professional_id == professional_id)
    
    if status:
        query = query.filter(Command.status == status)
    
    commands = query.order_by(Command.date.desc()).offset(skip).limit(limit).all()
    return [CommandResponse.model_validate(cmd) for cmd in commands]


@router.get("/{command_id}", response_model=CommandResponse)
async def get_command(
    command_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get command by ID"""
    command = db.query(Command).filter(
        Command.id == command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comanda não encontrada"
        )
    
    return CommandResponse.model_validate(command)


@router.put("/{command_id}", response_model=CommandResponse)
async def update_command(
    command_id: int,
    command_data: CommandUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update command"""
    command = db.query(Command).filter(
        Command.id == command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comanda não encontrada"
        )
    
    if command.status == CommandStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comanda finalizada não pode ser alterada"
        )
    
    update_data = command_data.dict(exclude_unset=True)
    
    # Recalculate net value if discount changed
    if "discount_value" in update_data:
        command.discount_value = update_data["discount_value"]
        command.net_value = command.total_value - command.discount_value
    
    for field, value in update_data.items():
        if field != "discount_value":
            setattr(command, field, value)
    
    db.commit()
    db.refresh(command)
    
    return CommandResponse.model_validate(command)


@router.post("/{command_id}/add-item", response_model=CommandItemResponse)
async def add_command_item(
    command_id: int,
    item_data: CommandItemCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Add item to command"""
    command = db.query(Command).filter(
        Command.id == command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comanda não encontrada"
        )
    
    if command.status == CommandStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível adicionar itens a uma comanda finalizada"
        )
    
    item_total = item_data.unit_value * item_data.quantity
    
    item = CommandItem(
        command_id=command.id,
        item_type=item_data.item_type,
        service_id=item_data.service_id,
        product_id=item_data.product_id,
        package_id=item_data.package_id,
        professional_id=item_data.professional_id,
        quantity=item_data.quantity,
        unit_value=item_data.unit_value,
        total_value=item_total,
        commission_percentage=item_data.commission_percentage
    )
    db.add(item)
    
    # Update command total
    command.total_value += item_total
    command.net_value = command.total_value - command.discount_value
    
    db.commit()
    db.refresh(item)
    
    return item


@router.delete("/{command_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_command_item(
    command_id: int,
    item_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Remove item from command"""
    command = db.query(Command).filter(
        Command.id == command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comanda não encontrada"
        )
    
    item = db.query(CommandItem).filter(
        CommandItem.id == item_id,
        CommandItem.command_id == command_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado"
        )
    
    # Update command total
    command.total_value -= item.total_value
    command.net_value = command.total_value - command.discount_value
    
    db.delete(item)
    db.commit()
    
    return None


@router.post("/{command_id}/finish", response_model=CommandResponse)
async def finish_command(
    command_id: int,
    finish_data: CommandFinish,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Finish command and create financial transaction"""
    command = db.query(Command).filter(
        Command.id == command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comanda não encontrada"
        )
    
    if command.status == CommandStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comanda já está finalizada"
        )
    
    # ✅ CORREÇÃO: Validate product stock before finalizing
    for item in command.items:
        if item.item_type == CommandItemType.PRODUCT and item.product_id:
            product = db.query(Product).filter(
                Product.id == item.product_id
            ).first()
            
            if product:
                if product.stock_current < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Estoque insuficiente para '{product.name}'. Disponível: {product.stock_current}, Necessário: {item.quantity}"
                    )
                
                # Decrement stock
                product.stock_current -= item.quantity
    
    # Update command status
    command.status = CommandStatus.FINISHED
    command.payment_received = True
    command.payment_summary = ", ".join([f"{p['method']}: {p['value']}" for p in finish_data.payment_methods])
    
    # Create financial transaction
    from app.models.financial import FinancialTransaction, TransactionType, TransactionOrigin, TransactionStatus
    # Get first payment method (if any) for relationship with financial transaction
    payment_method = None
    if finish_data.payment_methods:
        first_method = finish_data.payment_methods[0]
        payment_method = first_method.get("method")

    transaction = FinancialTransaction(
        company_id=current_user.company_id,
        type=TransactionType.INCOME,
        origin=TransactionOrigin.COMMAND,
        command_id=command.id,
        client_id=command.client.id if command.client else None,
        value=command.net_value,
        date=datetime.now(),
        description=f"Comanda {command.number}",
        status=TransactionStatus.LIQUIDATED,
        payment_method=payment_method,
    )
    db.add(transaction)
    
    # Create commissions
    from app.models.commission import Commission, CommissionStatus
    for item in command.items:
        if item.professional_id and item.commission_percentage > 0:
            commission_value = (item.total_value * item.commission_percentage) / 100
            commission = Commission(
                company_id=current_user.company_id,
                command_id=command.id,
                command_item_id=item.id,
                professional_id=item.professional_id,
                base_value=item.total_value,
                commission_percentage=item.commission_percentage,
                commission_value=commission_value,
                status=CommissionStatus.PENDING
            )
            db.add(commission)
    
    db.commit()
    db.refresh(command)
    
    return command


@router.delete("/{command_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_command(
    command_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete command"""
    command = db.query(Command).filter(
        Command.id == command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comanda não encontrada"
        )
    
    if command.status == CommandStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comanda finalizada não pode ser deletada"
        )
    
    db.delete(command)
    db.commit()
    
    return None


@router.get("/{command_id}/print")
async def print_command(
    command_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get command data for printing"""
    command = db.query(Command).filter(
        Command.id == command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comanda não encontrada"
        )
    
    # Return formatted data for printing
    return {
        "command_number": command.number,
        "date": command.date.isoformat(),
        "client_name": command.client.full_name if command.client else None,
        "professional_name": command.professional.full_name if command.professional else None,
        "items": [
            {
                "description": item.service.name if item.service else (item.product.name if item.product else (item.package.name if item.package else "Item")),
                "quantity": item.quantity,
                "unit_value": float(item.unit_value),
                "total_value": float(item.total_value)
            }
            for item in command.items
        ],
        "subtotal": float(command.total_value),
        "discount": float(command.discount_value),
        "total": float(command.net_value),
        "payment_summary": command.payment_summary,
        "status": command.status.value
    }


@router.post("/{command_id}/apply-discount", response_model=CommandResponse)
async def apply_discount(
    command_id: int,
    discount_value: Decimal,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Apply discount to command"""
    command = db.query(Command).filter(
        Command.id == command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comanda não encontrada"
        )
    
    if command.status == CommandStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível aplicar desconto em comanda finalizada"
        )
    
    if discount_value < 0 or discount_value > command.total_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valor de desconto inválido"
        )
    
    command.discount_value = discount_value
    command.net_value = command.total_value - discount_value
    
    db.commit()
    db.refresh(command)
    
    return command


@router.post("/{command_id}/apply-cashback", response_model=CommandResponse)
async def apply_cashback(
    command_id: int,
    cashback_amount: Decimal,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Apply cashback to command"""
    from app.models.cashback import CashbackBalance, CashbackTransaction
    
    command = db.query(Command).filter(
        Command.id == command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comanda não encontrada"
        )
    
    if command.status == CommandStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível aplicar cashback em comanda finalizada"
        )
    
    # Get client cashback balance
    balance = db.query(CashbackBalance).filter(
        CashbackBalance.client_id == command.client_id,
        CashbackBalance.company_id == current_user.company_id
    ).first()
    
    if not balance or balance.balance < cashback_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Saldo de cashback insuficiente"
        )
    
    # Apply cashback as discount
    if cashback_amount > command.net_value:
        cashback_amount = command.net_value
    
    command.discount_value += cashback_amount
    command.net_value = command.total_value - command.discount_value
    
    # Deduct from balance
    balance.balance -= cashback_amount
    
    # Create transaction
    transaction = CashbackTransaction(
        company_id=current_user.company_id,
        balance_id=balance.id,
        transaction_type="used",
        amount=cashback_amount,
        description=f"Uso em comanda {command.number}"
    )
    db.add(transaction)
    
    db.commit()
    db.refresh(command)
    
    return command

