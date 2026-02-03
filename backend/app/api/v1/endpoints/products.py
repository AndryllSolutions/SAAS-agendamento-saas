"""
Products Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.product import Product, Brand, ProductCategory
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse,
    BrandCreate, BrandCreatePublic, BrandUpdate, BrandResponse,
    ProductCategoryCreate, ProductCategoryCreatePublic, ProductCategoryUpdate, ProductCategoryResponse,
    StockAdjustment
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== BRANDS ==========

@router.post("/brands", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
async def create_brand(
    brand_data: BrandCreatePublic,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new brand"""
    brand_dict = brand_data.dict()
    brand_dict['company_id'] = current_user.company_id
    
    brand = Brand(**brand_dict)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return BrandResponse.model_validate(brand)


@router.get("/brands", response_model=List[BrandResponse])
async def list_brands(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List brands"""
    brands = db.query(Brand).filter(Brand.company_id == current_user.company_id).all()
    return [BrandResponse.model_validate(b) for b in brands]


@router.get("/brands/{brand_id}", response_model=BrandResponse)
async def get_brand(
    brand_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get brand by ID"""
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.company_id == current_user.company_id
    ).first()
    
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marca não encontrada")
    
    return BrandResponse.model_validate(brand)


@router.put("/brands/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: int,
    brand_data: BrandUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update brand"""
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.company_id == current_user.company_id
    ).first()
    
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = brand_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(brand, field, value)
    
    db.commit()
    db.refresh(brand)
    return BrandResponse.model_validate(brand)


@router.delete("/brands/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_brand(
    brand_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete brand"""
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.company_id == current_user.company_id
    ).first()
    
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(brand)
    db.commit()
    return None


# ========== PRODUCT CATEGORIES ==========

@router.post("/categories", response_model=ProductCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_product_category(
    category_data: ProductCategoryCreatePublic,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new product category (company_id auto-filled from auth)"""
    category = ProductCategory(**category_data.model_dump(), company_id=current_user.company_id)
    db.add(category)
    db.commit()
    db.refresh(category)
    return ProductCategoryResponse.model_validate(category)


@router.get("/categories", response_model=List[ProductCategoryResponse])
async def list_product_categories(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List product categories"""
    categories = db.query(ProductCategory).filter(
        ProductCategory.company_id == current_user.company_id
    ).all()
    return [ProductCategoryResponse.model_validate(c) for c in categories]


@router.get("/categories/{category_id}", response_model=ProductCategoryResponse)
async def get_product_category(
    category_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get product category by ID"""
    category = db.query(ProductCategory).filter(
        ProductCategory.id == category_id,
        ProductCategory.company_id == current_user.company_id
    ).first()
    
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria não encontrada")
    
    return ProductCategoryResponse.model_validate(category)


@router.put("/categories/{category_id}", response_model=ProductCategoryResponse)
async def update_product_category(
    category_id: int,
    category_data: ProductCategoryUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update product category"""
    category = db.query(ProductCategory).filter(
        ProductCategory.id == category_id,
        ProductCategory.company_id == current_user.company_id
    ).first()
    
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = category_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    return ProductCategoryResponse.model_validate(category)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_category(
    category_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete product category"""
    category = db.query(ProductCategory).filter(
        ProductCategory.id == category_id,
        ProductCategory.company_id == current_user.company_id
    ).first()
    
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(category)
    db.commit()
    return None


# ========== PRODUCTS ==========

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new product"""
    from app.core.cache import delete_pattern
    from app.core.tenant_context import set_tenant_context
    
    # Set tenant context for RLS
    if current_user.company_id:
        set_tenant_context(db, current_user.company_id)
    
    if product_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # ProductCreate already normalizes fields (price->sale_price, cost->cost_price, stock->stock_current)
    # Use model_dump to get normalized fields, excluding aliases
    product_dict = product_data.model_dump(
        exclude={'company_id', 'price', 'cost', 'stock'},
        exclude_none=True
    )
    # Add normalized fields
    product_dict['sale_price'] = product_data.sale_price
    product_dict['cost_price'] = product_data.cost_price
    product_dict['stock_current'] = product_data.stock_current
    
    product = Product(
        **product_dict,
        company_id=current_user.company_id
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Invalidate cache
    delete_pattern(f"products:list:{current_user.company_id}:*")
    
    return ProductResponse.from_model(product)


@router.get("", response_model=List[ProductResponse])
@router.get("/", response_model=List[ProductResponse], include_in_schema=False)
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    brand_id: Optional[int] = None,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List products (Cached for 2 minutes, optimized with eager loading)"""
    from app.core.cache import get_cache, set_cache, delete_pattern
    from sqlalchemy.orm import joinedload
    
    # Cache key
    cache_key = f"products:list:{current_user.company_id}:{skip}:{limit}:{search}:{brand_id}:{category_id}:{is_active}"
    
    # Try cache first (only for first page without search)
    if skip == 0 and not search:
        cached = await get_cache(cache_key)
        if cached:
            # ✅ CORREÇÃO: Retornar lista de ProductResponse do cache
            return [ProductResponse(**item) for item in cached]
    
    # Optimized query with eager loading
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category)
    ).filter(Product.company_id == current_user.company_id)
    
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    if brand_id:
        query = query.filter(Product.brand_id == brand_id)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    
    products = query.order_by(Product.name).offset(skip).limit(limit).all()
    
    # Convert to Pydantic models
    result = [ProductResponse.from_model(p) for p in products]
    
    # ✅ CORREÇÃO: Cache usando model_dump para serialização correta
    # Cache result (only for first page without search)
    if skip == 0 and not search:
        cache_data = [r.model_dump() for r in result]
        await set_cache(cache_key, cache_data, ttl=120)  # 2 minutes
    
    return result


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get product by ID"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return ProductResponse.from_model(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return ProductResponse.from_model(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(product)
    db.commit()
    return None


@router.post("/{product_id}/adjust-stock", response_model=ProductResponse)
async def adjust_stock(
    product_id: int,
    adjustment: StockAdjustment,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Adjust product stock"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    product.stock_current += adjustment.quantity
    
    if product.stock_current < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estoque não pode ficar negativo"
        )
    
    db.commit()
    db.refresh(product)
    return ProductResponse.from_model(product)

