"""
Core validation utilities
"""
import re
from datetime import datetime, time
from typing import Optional, List
from sqlalchemy.orm import Session

from app.core.exceptions import ValidationError, BusinessRuleError
from app.models.user import User
from app.models.service import Service
from app.models.appointment import Appointment


class BusinessValidator:
    """Business rules validator"""
    
    @staticmethod
    def validate_cpf(cpf: str) -> bool:
        """Validate CPF"""
        if not cpf:
            return True  # Optional field
            
        # Remove formatting
        cpf = re.sub(r'[^0-9]', '', cpf)
        
        if len(cpf) != 11:
            return False
            
        # Check for known invalid CPFs
        if cpf in ['00000000000', '11111111111', '22222222222', '33333333333',
                   '44444444444', '55555555555', '66666666666', '77777777777',
                   '88888888888', '99999999999']:
            return False
            
        # Calculate verification digits
        def calculate_digit(digits):
            total = sum(int(digit) * weight for digit, weight in zip(digits, range(len(digits) + 1, 1, -1)))
            remainder = total % 11
            return 0 if remainder < 2 else 11 - remainder
        
        first_digit = calculate_digit(cpf[:9])
        second_digit = calculate_digit(cpf[:10])
        
        return cpf[9] == str(first_digit) and cpf[10] == str(second_digit)
    
    @staticmethod
    def validate_cnpj(cnpj: str) -> bool:
        """Validate CNPJ"""
        if not cnpj:
            return True  # Optional field
            
        # Remove formatting
        cnpj = re.sub(r'[^0-9]', '', cnpj)
        
        if len(cnpj) != 14:
            return False
            
        # Check for known invalid CNPJs
        if cnpj in ['00000000000000', '11111111111111', '22222222222222']:
            return False
            
        # Calculate verification digits
        def calculate_digit(digits, weights):
            total = sum(int(digit) * weight for digit, weight in zip(digits, weights))
            remainder = total % 11
            return 0 if remainder < 2 else 11 - remainder
        
        weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        
        first_digit = calculate_digit(cnpj[:12], weights1)
        second_digit = calculate_digit(cnpj[:13], weights2)
        
        return cnpj[12] == str(first_digit) and cnpj[13] == str(second_digit)
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        if not email:
            return True  # Optional field
            
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone format"""
        if not phone:
            return True  # Optional field
            
        # Remove formatting
        phone = re.sub(r'[^0-9]', '', phone)
        
        # Brazilian phone: 10-11 digits
        return len(phone) in [10, 11]
    
    @staticmethod
    def validate_business_hours(start_time: time, end_time: time) -> bool:
        """Validate business hours"""
        if not start_time or not end_time:
            return False
            
        return start_time < end_time
    
    @staticmethod
    def validate_appointment_time(
        db: Session,
        professional_id: int,
        start_time: datetime,
        end_time: datetime,
        company_id: int,
        exclude_appointment_id: Optional[int] = None
    ) -> bool:
        """Validate appointment time conflicts"""
        query = db.query(Appointment).filter(
            Appointment.professional_id == professional_id,
            Appointment.company_id == company_id,
            Appointment.status.in_(['pending', 'confirmed', 'in_progress']),
            # Check for time overlap
            Appointment.start_time < end_time,
            Appointment.end_time > start_time
        )
        
        if exclude_appointment_id:
            query = query.filter(Appointment.id != exclude_appointment_id)
            
        return query.first() is None
    
    @staticmethod
    def validate_plan_limits(
        db: Session,
        company_id: int,
        resource_type: str,
        current_count: Optional[int] = None
    ) -> bool:
        """Validate plan resource limits"""
        # This would integrate with the plan service to check limits
        # For now, returning True (implement based on plan service)
        return True


class InputValidator:
    """Input validation utilities"""
    
    @staticmethod
    def validate_required_fields(data: dict, required_fields: List[str]):
        """Validate required fields are present"""
        missing_fields = []
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                missing_fields.append(field)
        
        if missing_fields:
            raise ValidationError(f"Missing required fields: {', '.join(missing_fields)}")
    
    @staticmethod
    def validate_string_length(value: str, field_name: str, min_length: int = 0, max_length: int = 255):
        """Validate string length"""
        if value and (len(value) < min_length or len(value) > max_length):
            raise ValidationError(f"{field_name} must be between {min_length} and {max_length} characters")
    
    @staticmethod
    def validate_numeric_range(value: float, field_name: str, min_value: float = None, max_value: float = None):
        """Validate numeric range"""
        if min_value is not None and value < min_value:
            raise ValidationError(f"{field_name} must be at least {min_value}")
        if max_value is not None and value > max_value:
            raise ValidationError(f"{field_name} must be at most {max_value}")
    
    @staticmethod
    def validate_datetime_range(start_dt: datetime, end_dt: datetime, field_prefix: str = ""):
        """Validate datetime range"""
        if start_dt >= end_dt:
            raise ValidationError(f"{field_prefix}Start time must be before end time")
    
    @staticmethod
    def sanitize_string(value: str) -> str:
        """Sanitize string input"""
        if not value:
            return value
        
        # Remove potentially dangerous characters
        value = value.strip()
        # Add more sanitization as needed
        return value


def validate_user_data(data: dict):
    """Validate user creation/update data"""
    InputValidator.validate_required_fields(data, ['email'])
    
    if 'email' in data and not BusinessValidator.validate_email(data['email']):
        raise ValidationError("Invalid email format")
    
    if 'cpf' in data and not BusinessValidator.validate_cpf(data['cpf']):
        raise ValidationError("Invalid CPF format")
    
    if 'phone' in data and not BusinessValidator.validate_phone(data['phone']):
        raise ValidationError("Invalid phone format")


def validate_appointment_data(data: dict, db: Session, company_id: int):
    """Validate appointment data"""
    InputValidator.validate_required_fields(data, ['start_time', 'end_time', 'service_id'])
    
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    
    if isinstance(start_time, str):
        start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
    if isinstance(end_time, str):
        end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
    
    InputValidator.validate_datetime_range(start_time, end_time, "Appointment ")
    
    # Check professional availability if specified
    if 'professional_id' in data and data['professional_id']:
        if not BusinessValidator.validate_appointment_time(
            db, data['professional_id'], start_time, end_time, company_id
        ):
            raise BusinessRuleError("Professional not available at the requested time")


def validate_service_data(data: dict):
    """Validate service data"""
    InputValidator.validate_required_fields(data, ['name', 'price', 'duration_minutes'])
    
    if 'name' in data:
        InputValidator.validate_string_length(data['name'], 'Service name', 1, 255)
    
    if 'price' in data:
        InputValidator.validate_numeric_range(data['price'], 'Price', 0)
    
    if 'duration_minutes' in data:
        InputValidator.validate_numeric_range(data['duration_minutes'], 'Duration', 1, 1440)  # Max 24 hours
