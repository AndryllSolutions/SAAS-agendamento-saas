"""
Custom exceptions for better error handling
"""
from fastapi import HTTPException, status
from typing import Any, Dict, Optional


class BaseCustomException(HTTPException):
    """Base custom exception"""
    
    def __init__(
        self,
        detail: Any = None,
        headers: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(status_code=self.status_code, detail=detail, headers=headers)


class ValidationError(BaseCustomException):
    """Validation error"""
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY


class NotFoundError(BaseCustomException):
    """Resource not found"""
    status_code = status.HTTP_404_NOT_FOUND


class PermissionError(BaseCustomException):
    """Permission denied"""
    status_code = status.HTTP_403_FORBIDDEN


class BusinessRuleError(BaseCustomException):
    """Business rule violation"""
    status_code = status.HTTP_400_BAD_REQUEST


class ConflictError(BaseCustomException):
    """Resource conflict"""
    status_code = status.HTTP_409_CONFLICT


class RateLimitError(BaseCustomException):
    """Rate limit exceeded"""
    status_code = status.HTTP_429_TOO_MANY_REQUESTS


class ServiceUnavailableError(BaseCustomException):
    """Service unavailable"""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


# Specific business exceptions
class PlanLimitExceededError(BusinessRuleError):
    """Plan limit exceeded"""
    pass


class FeatureNotAvailableError(PermissionError):
    """Feature not available for current plan"""
    pass


class AppointmentConflictError(ConflictError):
    """Appointment time conflict"""
    pass


class InsufficientCreditsError(BusinessRuleError):
    """Insufficient client credits"""
    pass


class InvalidBusinessHoursError(ValidationError):
    """Invalid business hours"""
    pass


class DuplicateResourceError(ConflictError):
    """Duplicate resource"""
    pass
