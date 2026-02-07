"""
WhatsApp Data Sanitizer - Limpeza e validação de dados capturados pela extensão do Chrome

Estratégia:
1. Remover caracteres especiais de números de telefone
2. Validar formato de telefone brasileiro
3. Limpar nomes de espaços extras
4. Extrair número de telefone de strings brutas
5. Normalizar URLs de chat do WhatsApp
"""

import re
from typing import Optional, Tuple
from urllib.parse import urlparse, parse_qs


def sanitize_phone_number(phone: Optional[str]) -> Optional[str]:
    """
    Sanitiza um número de telefone para o formato padrão brasileiro.
    
    Exemplos:
    - "(11) 98765-4321" -> "11987654321"
    - "+55 11 98765-4321" -> "11987654321"
    - "11 9 8765-4321" -> "11987654321"
    - "5511987654321" -> "11987654321"
    
    Args:
        phone: Número de telefone em qualquer formato
        
    Returns:
        Número sanitizado (apenas dígitos) ou None se inválido
    """
    if not phone:
        return None
    
    # Remove espaços, parênteses, hífens, pontos
    cleaned = re.sub(r'[\s\(\)\-\.]', '', phone)
    
    # Remove caracteres não numéricos
    cleaned = re.sub(r'[^\d]', '', cleaned)
    
    # Se começar com +55, remove (código do Brasil)
    if cleaned.startswith('55'):
        cleaned = cleaned[2:]
    
    # Se começar com 0, remove (prefixo de longa distância)
    if cleaned.startswith('0'):
        cleaned = cleaned[1:]
    
    # Valida se tem 10 ou 11 dígitos (celular com 9º dígito ou sem)
    if len(cleaned) == 11 and cleaned[2] == '9':
        # Celular com 9º dígito (11 dígitos) - válido
        return cleaned
    elif len(cleaned) == 10:
        # Celular sem 9º dígito (10 dígitos) - adiciona o 9
        # Formato: (XX) 8765-4321 -> XX987654321
        area_code = cleaned[:2]
        number = cleaned[2:]
        return f"{area_code}9{number}"
    elif len(cleaned) == 11 and cleaned[2] != '9':
        # Pode ser um número fixo com 11 dígitos, mantém como está
        return cleaned
    
    # Se não se encaixa em nenhum padrão, retorna None
    return None


def sanitize_name(name: Optional[str]) -> Optional[str]:
    """
    Sanitiza um nome removendo espaços extras e caracteres especiais.
    
    Args:
        name: Nome em qualquer formato
        
    Returns:
        Nome sanitizado ou None se vazio
    """
    if not name:
        return None
    
    # Remove espaços extras
    name = ' '.join(name.split())
    
    # Remove caracteres especiais mantendo letras, números e espaços
    # Mantém acentuação
    name = re.sub(r'[^\w\s\-àáâãäåèéêëìíîïòóôõöùúûüýÿñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÑÇ]', '', name)
    
    # Remove espaços extras novamente após limpeza
    name = ' '.join(name.split())
    
    if not name or len(name) < 2:
        return None
    
    return name.strip()


def extract_phone_from_wa_url(wa_url: Optional[str]) -> Optional[str]:
    """
    Extrai o número de telefone de uma URL do WhatsApp Web.
    
    Exemplos:
    - "https://web.whatsapp.com/send?phone=5511987654321" -> "11987654321"
    - "https://wa.me/5511987654321" -> "11987654321"
    
    Args:
        wa_url: URL do WhatsApp Web
        
    Returns:
        Número de telefone sanitizado ou None
    """
    if not wa_url:
        return None
    
    try:
        parsed = urlparse(wa_url)
        
        # Tenta extrair do parâmetro phone (WhatsApp Web)
        if parsed.query:
            params = parse_qs(parsed.query)
            if 'phone' in params:
                phone = params['phone'][0]
                return sanitize_phone_number(phone)
        
        # Tenta extrair do path (wa.me)
        if '/send' in parsed.path or parsed.netloc == 'wa.me':
            # Extrai número do path
            match = re.search(r'(\d+)', parsed.path)
            if match:
                phone = match.group(1)
                return sanitize_phone_number(phone)
    
    except Exception:
        pass
    
    return None


def extract_phone_from_text(text: Optional[str]) -> Optional[str]:
    """
    Tenta extrair um número de telefone de um texto livre.
    
    Busca por padrões como:
    - (11) 98765-4321
    - 11 98765-4321
    - 11987654321
    - +55 11 98765-4321
    
    Args:
        text: Texto que pode conter um número de telefone
        
    Returns:
        Número de telefone sanitizado ou None
    """
    if not text:
        return None
    
    # Padrão para números brasileiros
    patterns = [
        r'\+?55\s*\(?(\d{2})\)?\s*9?\s*(\d{4})-?(\d{4})',  # +55 (11) 9 8765-4321
        r'\(?(\d{2})\)?\s*9?\s*(\d{4})-?(\d{4})',  # (11) 9 8765-4321
        r'(\d{2})\s*9\s*(\d{4})-?(\d{4})',  # 11 9 8765-4321
        r'(\d{2})9(\d{4})(\d{4})',  # 1198765432
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            # Reconstrói o número
            groups = match.groups()
            if len(groups) >= 3:
                phone = f"{groups[0]}9{groups[1]}{groups[2]}"
                return sanitize_phone_number(phone)
    
    return None


def sanitize_lead_data(
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    whatsapp: Optional[str] = None,
    wa_url: Optional[str] = None,
    email: Optional[str] = None,
) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Sanitiza todos os dados de um lead capturado pela extensão.
    
    Estratégia de fallback para número:
    1. Usa whatsapp se fornecido
    2. Tenta extrair de wa_url
    3. Tenta extrair de phone
    4. Tenta extrair de full_name
    
    Args:
        full_name: Nome completo
        phone: Número de telefone
        whatsapp: Número do WhatsApp
        wa_url: URL da conversa no WhatsApp
        email: Email do contato
        
    Returns:
        Tupla (full_name_sanitizado, phone_sanitizado, whatsapp_sanitizado)
    """
    # Sanitiza nome
    clean_name = sanitize_name(full_name)
    
    # Tenta obter número de telefone em ordem de prioridade
    clean_phone = None
    
    if whatsapp:
        clean_phone = sanitize_phone_number(whatsapp)
    
    if not clean_phone and wa_url:
        clean_phone = extract_phone_from_wa_url(wa_url)
    
    if not clean_phone and phone:
        clean_phone = sanitize_phone_number(phone)
    
    if not clean_phone and full_name:
        clean_phone = extract_phone_from_text(full_name)
    
    return clean_name, clean_phone, clean_phone


def validate_lead_data(
    full_name: Optional[str],
    phone: Optional[str],
) -> Tuple[bool, Optional[str]]:
    """
    Valida se os dados do lead são suficientes para captura.
    
    Requisitos mínimos:
    - Nome com pelo menos 2 caracteres
    - Número de telefone válido
    
    Args:
        full_name: Nome sanitizado
        phone: Número de telefone sanitizado
        
    Returns:
        Tupla (é_válido, mensagem_de_erro)
    """
    if not full_name or len(full_name) < 2:
        return False, "Nome inválido ou muito curto"
    
    if not phone or len(phone) < 10:
        return False, "Número de telefone inválido"
    
    return True, None
