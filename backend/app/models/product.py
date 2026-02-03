"""
Product Model - Produtos do sistema
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, JSON
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Brand(BaseModel):
    """Brand model - Marcas de produtos"""
    
    __tablename__ = "brands"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(255), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="brands")
    products = relationship("Product", back_populates="brand", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Brand {self.name}>"


class ProductCategory(BaseModel):
    """Product Category model - Categorias de produtos"""
    
    __tablename__ = "product_categories"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship("Company", back_populates="product_categories")
    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ProductCategory {self.name}>"


class Product(BaseModel):
    """Product model - Produtos vendidos"""
    
    __tablename__ = "products"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True)
    category_id = Column(Integer, ForeignKey("product_categories.id", ondelete="SET NULL"), nullable=True)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Inventory
    stock_current = Column(Integer, default=0)
    stock_minimum = Column(Integer, default=0)
    unit = Column(String(20), default="UN")  # UN, KG, L, etc.
    
    # Pricing
    cost_price = Column(Numeric(10, 2), nullable=False)
    sale_price = Column(Numeric(10, 2), nullable=False)
    commission_percentage = Column(Integer, default=0)  # Percentual de comissão
    
    # Barcode
    barcode = Column(String(100), nullable=True, index=True)
    
    # Images
    images = Column(JSON, nullable=True)  # Lista de URLs de imagens
    image_url = Column(String(500), nullable=True)  # URL da imagem principal (para compatibilidade)
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    
    # Relationships
    company = relationship("Company", back_populates="products")
    brand = relationship("Brand", back_populates="products")
    category = relationship("ProductCategory", back_populates="products")
    command_items = relationship("CommandItem", back_populates="product")
    purchase_items = relationship("PurchaseItem", back_populates="product")
    
    def __repr__(self):
        return f"<Product {self.name}>"

