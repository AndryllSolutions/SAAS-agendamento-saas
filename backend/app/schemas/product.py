"""
Product Schemas
"""
from typing import Optional, List, Union
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from datetime import datetime
from decimal import Decimal


class BrandBase(BaseModel):
    """Base brand schema"""
    name: str = Field(..., min_length=1, max_length=255)
    notes: Optional[str] = None


class BrandCreate(BrandBase):
    """Schema for creating a brand (internal - requires company_id)"""
    company_id: int


class BrandCreatePublic(BrandBase):
    """Schema for creating a brand via API (company_id auto-filled from auth)"""
    pass


class BrandUpdate(BaseModel):
    """Schema for updating a brand"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    notes: Optional[str] = None


class BrandResponse(BrandBase):
    """Schema for brand response"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductCategoryBase(BaseModel):
    """Base product category schema"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class ProductCategoryCreate(ProductCategoryBase):
    """Schema for creating a product category (internal - requires company_id)"""
    company_id: int


class ProductCategoryCreatePublic(ProductCategoryBase):
    """Schema for creating a product category via API (company_id auto-filled from auth)"""
    pass


class ProductCategoryUpdate(BaseModel):
    """Schema for updating a product category"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ProductCategoryResponse(ProductCategoryBase):
    """Schema for product category response"""
    id: int
    company_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    """Base product schema - accepts both alias and actual field names"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    # Accept both stock and stock_current
    stock: Optional[int] = Field(None, ge=0)
    stock_current: Optional[int] = Field(None, ge=0, alias="stock")
    stock_minimum: int = 0
    unit: str = "UN"
    # Accept both price/cost and sale_price/cost_price
    price: Optional[Decimal] = Field(None, gt=0)
    sale_price: Optional[Decimal] = Field(None, gt=0, alias="price")
    cost: Optional[Decimal] = Field(None, gt=0)
    cost_price: Optional[Decimal] = Field(None, gt=0, alias="cost")
    commission_percentage: int = Field(0, ge=0, le=100)
    barcode: Optional[str] = None
    images: Optional[List[str]] = None
    image_url: Optional[str] = None
    
    @model_validator(mode='after')
    def normalize_fields(self):
        """Normalize fields after validation"""
        # Use stock if provided, otherwise stock_current
        if self.stock is not None:
            self.stock_current = self.stock
        elif self.stock_current is None:
            self.stock_current = 0
        
        # Use price if provided, otherwise sale_price
        if self.price is not None:
            self.sale_price = self.price
        if self.sale_price is None:
            raise ValueError('price (or sale_price) is required')
        
        # Use cost if provided, otherwise cost_price (default to 0 if not provided)
        if self.cost is not None:
            self.cost_price = self.cost
        if self.cost_price is None:
            self.cost_price = Decimal('0.00')  # Default to 0 instead of raising error
        
        return self
    
    class Config:
        populate_by_name = True  # Allow both alias and field name


class ProductCreate(ProductBase):
    """Schema for creating a product"""
    company_id: int
    brand_id: Optional[int] = None
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    stock_current: Optional[int] = None
    stock_minimum: Optional[int] = None
    unit: Optional[str] = None
    cost_price: Optional[Decimal] = Field(None, gt=0)
    sale_price: Optional[Decimal] = Field(None, gt=0)
    commission_percentage: Optional[int] = Field(None, ge=0, le=100)
    barcode: Optional[str] = None
    brand_id: Optional[int] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    images: Optional[List[str]] = None
    image_url: Optional[str] = None


class ProductResponse(BaseModel):
    """Schema for product response"""
    id: int
    company_id: int
    name: str
    description: Optional[str] = None
    stock: int  # Alias for stock_current
    stock_minimum: int = 0
    unit: str = "UN"
    cost: Decimal  # Alias for cost_price
    price: Decimal  # Alias for sale_price
    commission_percentage: int = 0
    barcode: Optional[str] = None
    brand_id: Optional[int] = None
    category_id: Optional[int] = None
    is_active: bool
    images: Optional[List[str]] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    @classmethod
    def from_model(cls, product):
        """Create response from Product model"""
        return cls(
            id=product.id,
            company_id=product.company_id,
            name=product.name,
            description=product.description,
            stock=product.stock_current,
            stock_minimum=product.stock_minimum,
            unit=product.unit,
            cost=product.cost_price,
            price=product.sale_price,
            commission_percentage=product.commission_percentage,
            barcode=product.barcode,
            brand_id=product.brand_id,
            category_id=product.category_id,
            is_active=product.is_active,
            images=product.images,
            image_url=product.image_url,
            created_at=product.created_at,
            updated_at=product.updated_at,
        )
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class StockAdjustment(BaseModel):
    """Schema for stock adjustment"""
    quantity: int
    reason: Optional[str] = None

