from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, asc
from typing import Optional, List, Dict, Any
import pandas as pd
from backend.models import Product, BatchUpload, ModelMetadata
from backend.schemas import ProductCreate, ProductUpdate
from backend.ml_pipeline import ml_engine

def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()

def get_product_by_code(db: Session, product_code: str) -> Optional[Product]:
    return db.query(Product).filter(Product.product_code == product_code).first()

def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    pricing_status: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    sort_by: str = "id",
    sort_order: str = "desc"
) -> Dict[str, Any]:
    """Retrieves paginated and filtered product catalog."""
    query = db.query(Product)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Product.product_code.ilike(search_pattern),
                Product.product_brand.ilike(search_pattern),
                Product.item_category.ilike(search_pattern),
                Product.subcategory_1.ilike(search_pattern),
                Product.subcategory_2.ilike(search_pattern)
            )
        )

    if category and category != "all":
        query = query.filter(Product.item_category == category)

    if brand and brand != "all":
        query = query.filter(Product.product_brand == brand)

    if pricing_status and pricing_status != "all":
        query = query.filter(Product.pricing_status == pricing_status)

    if min_rating is not None:
        query = query.filter(Product.item_rating >= min_rating)
    if max_rating is not None:
        query = query.filter(Product.item_rating <= max_rating)

    total = query.count()

    # Sorting
    sort_column = getattr(Product, sort_by, Product.id)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    items = query.offset(skip).limit(limit).all()
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1 if limit > 0 else 1,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit if limit > 0 else 1
    }

def create_product(db: Session, product_in: ProductCreate) -> Product:
    """
    Creates a new product in the PostgreSQL database.
    Passes data through the Random Forest pipeline to auto-calculate dynamic optimal price in real-time.
    """
    prod_dict = product_in.model_dump()
    
    # Run real-time ML inference
    pred_result = ml_engine.predict_single(prod_dict)

    db_product = Product(
        product_code=prod_dict["product_code"],
        product_brand=prod_dict["product_brand"],
        item_category=prod_dict["item_category"],
        subcategory_1=prod_dict.get("subcategory_1", "unknown"),
        subcategory_2=prod_dict.get("subcategory_2", "unknown"),
        item_rating=prod_dict["item_rating"],
        listing_date=prod_dict.get("listing_date", "01-01-2024"),
        selling_price=prod_dict["selling_price"],
        predicted_price=pred_result["predicted_price"],
        margin_uplift=pred_result["margin_uplift"],
        margin_uplift_pct=pred_result["margin_uplift_pct"],
        pricing_status=pred_result["pricing_status"]
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, db_product: Product, product_in: ProductUpdate) -> Product:
    """
    Updates an existing product and recalculates its dynamic price via ML pipeline.
    """
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)

    # Re-evaluate dynamic pricing with updated parameters
    current_dict = {
        "product_code": db_product.product_code,
        "product_brand": db_product.product_brand,
        "item_category": db_product.item_category,
        "subcategory_1": db_product.subcategory_1,
        "subcategory_2": db_product.subcategory_2,
        "item_rating": db_product.item_rating,
        "listing_date": db_product.listing_date,
        "selling_price": db_product.selling_price
    }
    pred_result = ml_engine.predict_single(current_dict)
    db_product.predicted_price = pred_result["predicted_price"]
    db_product.margin_uplift = pred_result["margin_uplift"]
    db_product.margin_uplift_pct = pred_result["margin_uplift_pct"]
    db_product.pricing_status = pred_result["pricing_status"]

    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int) -> bool:
    """Deletes a product by ID."""
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True

def bulk_insert_products_from_df(db: Session, df: pd.DataFrame, batch_filename: str = "upload.csv") -> Dict[str, Any]:
    """
    Processes uploaded batch data through the Random Forest pipeline and commits to PostgreSQL.
    """
    # Rename columns if needed
    column_mapping = {
        'Product': 'product_code',
        'Product_Brand': 'product_brand',
        'Item_Category': 'item_category',
        'Subcategory_1': 'subcategory_1',
        'Subcategory_2': 'subcategory_2',
        'Item_Rating': 'item_rating',
        'Date': 'listing_date',
        'Selling_Price': 'selling_price'
    }
    for old_col, new_col in column_mapping.items():
        if old_col in df.columns:
            df = df.rename(columns={old_col: new_col})

    # Run ML Batch Inference
    df_processed = ml_engine.predict_batch(df)

    products_to_add = []
    for _, row in df_processed.iterrows():
        prod = Product(
            product_code=str(row.get('product_code', 'P-UNKNOWN')),
            product_brand=str(row.get('product_brand', 'B-UNKNOWN')),
            item_category=str(row.get('item_category', 'general')),
            subcategory_1=str(row.get('subcategory_1', 'unknown')),
            subcategory_2=str(row.get('subcategory_2', 'unknown')),
            item_rating=float(row.get('item_rating', 3.0)),
            listing_date=str(row.get('listing_date', '01-01-2024')),
            selling_price=float(row.get('selling_price', 0.0)),
            predicted_price=float(row.get('predicted_price', 0.0)),
            margin_uplift=float(row.get('margin_uplift', 0.0)),
            margin_uplift_pct=float(row.get('margin_uplift_pct', 0.0)),
            pricing_status=str(row.get('pricing_status', 'Optimized'))
        )
        products_to_add.append(prod)

    db.bulk_save_objects(products_to_add)

    # Record batch log
    batch_log = BatchUpload(
        filename=batch_filename,
        total_records=len(products_to_add),
        successful_records=len(products_to_add),
        failed_records=0,
        status="Completed"
    )
    db.add(batch_log)
    db.commit()

    return {
        "inserted_count": len(products_to_add),
        "batch_id": batch_log.id
    }

def get_executive_kpis(db: Session) -> Dict[str, Any]:
    """Aggregates executive dashboard metrics."""
    total_products = db.query(func.count(Product.id)).scalar() or 0
    if total_products == 0:
        return {
            "total_products": 0,
            "total_catalog_revenue": 0.0,
            "avg_actual_price": 0.0,
            "avg_predicted_price": 0.0,
            "potential_revenue_uplift": 0.0,
            "potential_uplift_pct": 0.0,
            "underpriced_count": 0,
            "overpriced_count": 0,
            "optimized_count": 0,
            "model_r2": ml_engine.metrics.get("r2_score", 0.88),
            "model_version": ml_engine.metrics.get("model_version", "v1.2.0")
        }

    total_catalog_revenue = db.query(func.sum(Product.selling_price)).scalar() or 0.0
    avg_actual_price = db.query(func.avg(Product.selling_price)).scalar() or 0.0
    avg_predicted_price = db.query(func.avg(Product.predicted_price)).scalar() or 0.0
    
    total_predicted_revenue = db.query(func.sum(Product.predicted_price)).scalar() or 0.0
    potential_revenue_uplift = round(total_predicted_revenue - total_catalog_revenue, 2)
    potential_uplift_pct = round((potential_revenue_uplift / total_catalog_revenue * 100) if total_catalog_revenue > 0 else 0.0, 2)

    underpriced = db.query(func.count(Product.id)).filter(Product.pricing_status == "Underpriced").scalar() or 0
    overpriced = db.query(func.count(Product.id)).filter(Product.pricing_status == "Overpriced").scalar() or 0
    optimized = db.query(func.count(Product.id)).filter(Product.pricing_status == "Optimized").scalar() or 0

    return {
        "total_products": total_products,
        "total_catalog_revenue": round(float(total_catalog_revenue), 2),
        "avg_actual_price": round(float(avg_actual_price), 2),
        "avg_predicted_price": round(float(avg_predicted_price), 2),
        "potential_revenue_uplift": potential_revenue_uplift,
        "potential_uplift_pct": potential_uplift_pct,
        "underpriced_count": underpriced,
        "overpriced_count": overpriced,
        "optimized_count": optimized,
        "model_r2": ml_engine.metrics.get("r2_score", 0.884),
        "model_version": ml_engine.metrics.get("model_version", "v1.2.0-RF")
    }

def get_category_analytics(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    """Category breakdown of volume, average pricing, and pricing uplift."""
    results = db.query(
        Product.item_category,
        func.count(Product.id).label("product_count"),
        func.avg(Product.selling_price).label("avg_actual_price"),
        func.avg(Product.predicted_price).label("avg_predicted_price"),
        func.sum(Product.margin_uplift).label("total_uplift")
    ).group_by(Product.item_category).order_by(desc("product_count")).limit(limit).all()

    return [
        {
            "category": r.item_category,
            "product_count": r.product_count,
            "avg_actual_price": round(float(r.avg_actual_price or 0.0), 2),
            "avg_predicted_price": round(float(r.avg_predicted_price or 0.0), 2),
            "total_uplift": round(float(r.total_uplift or 0.0), 2)
        }
        for r in results
    ]

def get_price_scatter_sample(db: Session, sample_size: int = 300) -> List[Dict[str, Any]]:
    """Sample of products for Actual vs. Predicted scatter plot."""
    items = db.query(Product).order_by(Product.id.desc()).limit(sample_size).all()
    return [
        {
            "id": item.id,
            "product_code": item.product_code,
            "actual_price": item.selling_price,
            "predicted_price": item.predicted_price or item.selling_price,
            "item_rating": item.item_rating,
            "item_category": item.item_category
        }
        for item in items
    ]

def get_dropdown_options(db: Session) -> Dict[str, List[str]]:
    """Unique lists for dropdown selections."""
    brands = [r[0] for r in db.query(Product.product_brand).distinct().order_by(Product.product_brand).limit(100).all() if r[0]]
    categories = [r[0] for r in db.query(Product.item_category).distinct().order_by(Product.item_category).limit(100).all() if r[0]]
    sub1 = [r[0] for r in db.query(Product.subcategory_1).distinct().order_by(Product.subcategory_1).limit(100).all() if r[0]]
    sub2 = [r[0] for r in db.query(Product.subcategory_2).distinct().order_by(Product.subcategory_2).limit(100).all() if r[0]]
    
    return {
        "products": ["P-NEW-SKU", "P-2610", "P-2453", "P-6802", "P-4452"],
        "brands": brands if brands else ["B-659", "B-3078", "B-1810", "B-1487", "B-2830"],
        "categories": categories if categories else ["clothing", "bags wallets belts", "beauty and personal care", "home decor festive needs", "footwear", "computers", "kitchen dining"],
        "subcategories_1": sub1 if sub1 else ["women s clothing", "men s clothing", "bags", "eye care", "showpieces", "casual shoes", "cookware"],
        "subcategories_2": sub2 if sub2 else ["western wear", "t shirts", "hand bags", "ethnic", "pots pans", "paintings"]
    }
