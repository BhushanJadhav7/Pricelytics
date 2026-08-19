from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from backend.database import get_db
from backend.schemas import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse, DropdownOptions
from backend.crud import (
    get_products,
    get_product_by_id,
    create_product,
    update_product,
    delete_product,
    get_dropdown_options
)
from backend.routers.websocket import notify_clients_of_update

router = APIRouter(prefix="/products", tags=["Products & CRUD"])

@router.get("", response_model=ProductListResponse)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    pricing_status: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    max_rating: Optional[float] = Query(None),
    sort_by: str = Query("id"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db)
):
    """
    Paginated, filtered, and searchable product catalog endpoint.
    """
    skip = (page - 1) * page_size
    result = get_products(
        db=db,
        skip=skip,
        limit=page_size,
        search=search,
        category=category,
        brand=brand,
        pricing_status=pricing_status,
        min_rating=min_rating,
        max_rating=max_rating,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return result

@router.get("/dropdown-options", response_model=DropdownOptions)
def dropdown_options(db: Session = Depends(get_db)):
    """Provides unique categories, brands, and subcategories for UI forms and filters."""
    return get_dropdown_options(db)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Retrieve single product by ID."""
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {product_id} not found")
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def add_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """
    Create a new product. Automatically executes real-time Random Forest inference
    and broadcasts a WebSocket live update to connected dashboards.
    """
    new_product = create_product(db, product_in)
    await notify_clients_of_update({
        "event": "PRODUCT_CREATED",
        "product_id": new_product.id,
        "product_code": new_product.product_code,
        "selling_price": new_product.selling_price,
        "predicted_price": new_product.predicted_price,
        "pricing_status": new_product.pricing_status
    })
    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
async def modify_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """
    Update product details and recalculate dynamic price via the ML pipeline.
    """
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {product_id} not found")
    updated = update_product(db, product, product_in)
    await notify_clients_of_update({
        "event": "PRODUCT_UPDATED",
        "product_id": updated.id,
        "product_code": updated.product_code,
        "selling_price": updated.selling_price,
        "predicted_price": updated.predicted_price,
        "pricing_status": updated.pricing_status
    })
    return updated

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
async def remove_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product from the database."""
    success = delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {product_id} not found")
    await notify_clients_of_update({
        "event": "PRODUCT_DELETED",
        "product_id": product_id
    })
    return {"message": f"Product {product_id} deleted successfully"}
