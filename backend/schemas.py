from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Product Schemas ---

class ProductBase(BaseModel):
    product_code: str = Field(..., example="P-2610")
    product_brand: str = Field(..., example="B-659")
    item_category: str = Field(..., example="bags wallets belts")
    subcategory_1: Optional[str] = Field("unknown", example="bags")
    subcategory_2: Optional[str] = Field("unknown", example="hand bags")
    item_rating: float = Field(..., ge=0.0, le=5.0, example=4.3)
    listing_date: Optional[str] = Field("01-01-2024", example="02-03-2017")
    selling_price: float = Field(..., ge=0.0, example=291.0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    product_code: Optional[str] = None
    product_brand: Optional[str] = None
    item_category: Optional[str] = None
    subcategory_1: Optional[str] = None
    subcategory_2: Optional[str] = None
    item_rating: Optional[float] = None
    listing_date: Optional[str] = None
    selling_price: Optional[float] = None

class ProductResponse(ProductBase):
    id: int
    predicted_price: Optional[float] = None
    margin_uplift: Optional[float] = None
    margin_uplift_pct: Optional[float] = None
    pricing_status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# --- ML & Simulation Schemas ---

class RealTimePredictRequest(BaseModel):
    product_code: Optional[str] = "P-SAMPLE"
    product_brand: str
    item_category: str
    subcategory_1: Optional[str] = "unknown"
    subcategory_2: Optional[str] = "unknown"
    item_rating: float = Field(..., ge=0.0, le=5.0)
    listing_date: Optional[str] = "01-01-2024"
    selling_price: float = Field(..., ge=0.0)

class RealTimePredictResponse(BaseModel):
    predicted_price: float
    actual_price: float
    margin_uplift: float
    margin_uplift_pct: float
    pricing_status: str  # 'Underpriced' | 'Overpriced' | 'Optimized'
    recommendation: str
    confidence_score: float
    feature_contributions: Dict[str, Any]

class RetrainResponse(BaseModel):
    success: bool
    model_version: str
    r2_score: float
    mae: float
    rmse: float
    samples_trained: int
    trained_at: datetime
    message: str

# --- Analytics Schemas ---

class ExecutiveOverviewKPIs(BaseModel):
    total_products: int
    total_catalog_revenue: float
    avg_actual_price: float
    avg_predicted_price: float
    potential_revenue_uplift: float
    potential_uplift_pct: float
    underpriced_count: int
    overpriced_count: int
    optimized_count: int
    model_r2: float
    model_version: str

class CategoryAnalytics(BaseModel):
    category: str
    product_count: int
    avg_actual_price: float
    avg_predicted_price: float
    total_uplift: float

class PriceScatterPoint(BaseModel):
    id: int
    product_code: str
    actual_price: float
    predicted_price: float
    item_rating: float
    item_category: str

class DropdownOptions(BaseModel):
    products: List[str]
    brands: List[str]
    categories: List[str]
    subcategories_1: List[str]
    subcategories_2: List[str]
