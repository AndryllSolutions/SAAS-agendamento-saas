"""
Query optimization utilities
"""
from sqlalchemy.orm import joinedload, selectinload, contains_eager
from sqlalchemy.orm import Session
from typing import Type, List, Optional


def optimize_query_with_relationships(
    query,
    model: Type,
    relationships: Optional[List[str]] = None
):
    """
    Optimize query by eager loading relationships
    
    Args:
        query: SQLAlchemy query object
        model: SQLAlchemy model class
        relationships: List of relationship names to eager load
    
    Returns:
        Optimized query
    """
    if not relationships:
        return query
    
    for rel_name in relationships:
        if hasattr(model, rel_name):
            # Use selectinload for one-to-many and many-to-many
            # Use joinedload for many-to-one and one-to-one
            rel = getattr(model, rel_name)
            if rel.property.direction.name in ['ONETOMANY', 'MANYTOMANY']:
                query = query.options(selectinload(rel))
            else:
                query = query.options(joinedload(rel))
    
    return query


def get_optimized_list_query(
    db: Session,
    model: Type,
    company_id: int,
    relationships: Optional[List[str]] = None,
    filters: Optional[dict] = None,
    order_by: Optional[str] = None
):
    """
    Get optimized query for listing with relationships
    
    Args:
        db: Database session
        model: SQLAlchemy model class
        company_id: Company ID for filtering
        relationships: List of relationship names to eager load
        filters: Dictionary of filters to apply
        order_by: Field name to order by
    
    Returns:
        Optimized query
    """
    query = db.query(model).filter(model.company_id == company_id)
    
    # Apply filters
    if filters:
        for field, value in filters.items():
            if hasattr(model, field) and value is not None:
                query = query.filter(getattr(model, field) == value)
    
    # Optimize with relationships
    query = optimize_query_with_relationships(query, model, relationships)
    
    # Apply ordering
    if order_by and hasattr(model, order_by):
        query = query.order_by(getattr(model, order_by))
    
    return query


# Common relationship patterns for each model
MODEL_RELATIONSHIPS = {
    'Client': ['appointments', 'commands', 'packages', 'anamneses', 'evaluations'],
    'Service': ['category', 'appointments'],
    'Product': ['brand', 'category', 'command_items'],
    'Command': ['client', 'professional', 'items', 'appointment'],
    'Appointment': ['client', 'professional', 'service', 'command'],
    'Package': ['client', 'predefined_package', 'items'],
    'Professional': ['appointments', 'commissions', 'goals'],
    'Commission': ['professional', 'command', 'command_item'],
    'Purchase': ['supplier', 'items'],
    'FinancialTransaction': ['account', 'category', 'payment_form'],
    'Evaluation': ['client', 'professional', 'appointment'],
    'Anamnesis': ['client', 'professional', 'model'],
}
