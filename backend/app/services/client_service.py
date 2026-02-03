"""
Client Service - Helpers para gerenciar a relacao User <-> Client

Este servico contem funcoes utilitarias para:
1. Criar/vincular clients a partir de users
2. Criar/vincular users a partir de clients
3. Sincronizar dados entre users e clients
4. Buscar clients de forma unificada

Arquitetura:
- users: Autenticacao e permissoes (pode ter role CLIENT)
- clients: CRM completo (vendas, pacotes, marketing)
- Ponte: clients.user_id -> users.id (opcional, 1:1)
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.client import Client


def get_or_create_client_for_user(
    db: Session,
    user: User,
    auto_create: bool = True
) -> Optional[Client]:
    """
    Busca ou cria um Client (CRM) para um User existente.
    
    Fluxo:
    1. Se user ja tem client_crm, retorna ele
    2. Se existe client com user_id = user.id, retorna ele
    3. Se existe client com mesmo email/phone, vincula e retorna
    4. Se auto_create=True, cria novo client vinculado
    5. Se auto_create=False, retorna None
    
    Args:
        db: Sessao do banco
        user: Usuario para vincular/criar client
        auto_create: Se True, cria client se nao existir
    
    Returns:
        Client object ou None
    
    Exemplo:
        >>> user = db.query(User).filter(User.email == "teste@example.com").first()
        >>> client = get_or_create_client_for_user(db, user)
        >>> print(f"Client ID: {client.id}, Credits: {client.credits}")
    """
    # 1. Verificar se user ja tem client via relationship
    if user.client_crm:
        return user.client_crm
    
    # 2. Buscar client que ja aponta para esse user (garantia)
    existing = db.query(Client).filter(Client.user_id == user.id).first()
    if existing:
        return existing
    
    # 3. Buscar client com mesmo email (se email existir)
    if user.email:
        by_email = db.query(Client).filter(
            Client.company_id == user.company_id,
            Client.email == user.email,
            Client.user_id.is_(None)  # Ainda nao vinculado
        ).first()
        
        if by_email:
            # Vincular client existente ao user
            by_email.user_id = user.id
            db.commit()
            db.refresh(by_email)
            return by_email
    
    # 4. Buscar client com mesmo telefone (se telefone existir)
    if user.phone:
        by_phone = db.query(Client).filter(
            Client.company_id == user.company_id,
            Client.cellphone == user.phone,
            Client.user_id.is_(None)  # Ainda nao vinculado
        ).first()
        
        if by_phone:
            # Vincular client existente ao user
            by_phone.user_id = user.id
            db.commit()
            db.refresh(by_phone)
            return by_phone
    
    # 5. Criar novo client se auto_create=True
    if auto_create:
        new_client = Client(
            company_id=user.company_id,
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            cellphone=user.phone,
            date_of_birth=None,  # user.date_of_birth if isinstance(user.date_of_birth, date) else None
            address=user.address,
            city=user.city,
            state=user.state,
            zip_code=user.postal_code,
            notes=user.notes,
            is_active=user.is_active,
            credits=0,  # Saldo inicial zero
            marketing_email=True,  # Opt-in padrao
            marketing_whatsapp=True
        )
        
        db.add(new_client)
        db.commit()
        db.refresh(new_client)
        return new_client
    
    # 6. Nao criar, retornar None
    return None


def get_or_link_user_for_client(
    db: Session,
    client: Client,
    password: Optional[str] = None,
    auto_create: bool = False
) -> Optional[User]:
    """
    Busca ou cria um User (autenticacao) para um Client existente.
    
    Fluxo:
    1. Se client ja tem user, retorna ele
    2. Se existe user com mesmo email, vincula e retorna
    3. Se auto_create=True e password fornecido, cria novo user vinculado
    4. Se auto_create=False, retorna None
    
    Args:
        db: Sessao do banco
        client: Cliente para vincular/criar user
        password: Senha para criar novo user (obrigatorio se auto_create=True)
        auto_create: Se True, cria user se nao existir
    
    Returns:
        User object ou None
    
    Raises:
        ValueError: Se auto_create=True mas password nao fornecido
    
    Exemplo:
        >>> client = db.query(Client).filter(Client.cpf == "12345678900").first()
        >>> user = get_or_link_user_for_client(db, client, password="senha123", auto_create=True)
        >>> print(f"User pode fazer login: {user.email}")
    """
    # 1. Verificar se client ja tem user via relationship
    if client.user:
        return client.user
    
    # 2. Buscar user que ja aponta para esse client (garantia)
    if client.user_id:
        existing = db.query(User).filter(User.id == client.user_id).first()
        if existing:
            return existing
    
    # 3. Buscar user com mesmo email (se email existir)
    if client.email:
        by_email = db.query(User).filter(
            User.company_id == client.company_id,
            User.email == client.email,
            User.role == UserRole.CLIENT
        ).first()
        
        if by_email:
            # Verificar se user ja tem outro client
            if by_email.client_crm and by_email.client_crm.id != client.id:
                # User ja tem outro client, nao vincular
                return None
            
            # Vincular user existente ao client
            client.user_id = by_email.id
            db.commit()
            db.refresh(client)
            return by_email
    
    # 4. Criar novo user se auto_create=True
    if auto_create:
        if not password:
            raise ValueError("Password obrigatorio para criar novo user")
        
        if not client.email:
            raise ValueError("Client precisa ter email para criar user")
        
        from app.core.security import get_password_hash
        
        new_user = User(
            company_id=client.company_id,
            email=client.email,
            password_hash=get_password_hash(password),
            full_name=client.full_name,
            phone=client.cellphone,
            role=UserRole.CLIENT,
            is_active=client.is_active,
            is_verified=False,  # Requer verificacao de email
            address=client.address,
            city=client.city,
            state=client.state,
            postal_code=client.zip_code,
            notes=client.notes
        )
        
        db.add(new_user)
        db.flush()  # Gera user.id sem commit
        
        # Vincular client ao novo user
        client.user_id = new_user.id
        db.commit()
        db.refresh(new_user)
        db.refresh(client)
        
        return new_user
    
    # 5. Nao criar, retornar None
    return None


def sync_client_to_user(db: Session, client: Client) -> bool:
    """
    Sincroniza dados do Client para User vinculado.
    
    Atualiza campos basicos do User com dados do Client.
    Util apos atualizacoes no CRM para refletir no login.
    
    Args:
        db: Sessao do banco
        client: Cliente fonte dos dados
    
    Returns:
        True se sincronizou, False se nao tem user vinculado
    
    Exemplo:
        >>> client.full_name = "Novo Nome"
        >>> sync_client_to_user(db, client)
        >>> print(client.user.full_name)  # "Novo Nome"
    """
    if not client.user:
        return False
    
    user = client.user
    
    # Atualizar campos basicos
    user.full_name = client.full_name
    user.phone = client.cellphone or user.phone
    user.address = client.address or user.address
    user.city = client.city or user.city
    user.state = client.state or user.state
    user.postal_code = client.zip_code or user.postal_code
    user.is_active = client.is_active
    
    db.commit()
    return True


def sync_user_to_client(db: Session, user: User) -> bool:
    """
    Sincroniza dados do User para Client vinculado.
    
    Atualiza campos basicos do Client com dados do User.
    Util apos atualizacoes no perfil para refletir no CRM.
    
    Args:
        db: Sessao do banco
        user: Usuario fonte dos dados
    
    Returns:
        True se sincronizou, False se nao tem client vinculado
    
    Exemplo:
        >>> user.full_name = "Nome Atualizado"
        >>> sync_user_to_client(db, user)
        >>> print(user.client_crm.full_name)  # "Nome Atualizado"
    """
    if not user.client_crm:
        return False
    
    client = user.client_crm
    
    # Atualizar campos basicos
    client.full_name = user.full_name
    client.cellphone = user.phone or client.cellphone
    client.address = user.address or client.address
    client.city = user.city or client.city
    client.state = user.state or client.state
    client.zip_code = user.postal_code or client.zip_code
    client.is_active = user.is_active
    
    db.commit()
    return True


def find_client_by_user_or_id(
    db: Session,
    company_id: int,
    user_id: Optional[int] = None,
    client_id: Optional[int] = None
) -> Optional[Client]:
    """
    Busca client de forma flexivel por user_id ou client_id.
    
    Util para endpoints que podem receber tanto user quanto client.
    Prioriza client_id se ambos forem fornecidos.
    
    Args:
        db: Sessao do banco
        company_id: ID da empresa (tenant)
        user_id: ID do usuario (opcional)
        client_id: ID do cliente (opcional)
    
    Returns:
        Client object ou None
    
    Exemplo:
        >>> # Buscar por client_id
        >>> client = find_client_by_user_or_id(db, company_id=1, client_id=123)
        >>> 
        >>> # Buscar por user_id
        >>> client = find_client_by_user_or_id(db, company_id=1, user_id=456)
    """
    # Priorizar client_id se fornecido
    if client_id:
        return db.query(Client).filter(
            Client.id == client_id,
            Client.company_id == company_id
        ).first()
    
    # Buscar por user_id
    if user_id:
        return db.query(Client).filter(
            Client.user_id == user_id,
            Client.company_id == company_id
        ).first()
    
    return None


def unlink_user_from_client(db: Session, client: Client) -> bool:
    """
    Remove vinculo entre Client e User.
    
    O client continua no CRM, mas nao tera mais login associado.
    O user continua podendo fazer login, mas nao tera ficha CRM.
    
    Args:
        db: Sessao do banco
        client: Cliente para desvincular
    
    Returns:
        True se desvinculou, False se ja estava desvinculado
    
    Exemplo:
        >>> client = db.query(Client).filter(Client.id == 123).first()
        >>> unlink_user_from_client(db, client)
        >>> # Agora client.user_id = None e client.user = None
    """
    if not client.user_id:
        return False
    
    client.user_id = None
    db.commit()
    db.refresh(client)
    return True
