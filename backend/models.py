from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.sql import func
from backend.database import Base

class Product(Base):
    """
    Product inventory and dynamic pricing entity.
    Stores raw attributes, actual selling price, and ML pipeline predictions.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_code = Column(String(100), index=True, nullable=False)  # e.g., 'P-2610'
    product_brand = Column(String(100), index=True, nullable=False)  # e.g., 'B-659'
    item_category = Column(String(150), index=True, nullable=False)  # e.g., 'bags wallets belts'
    subcategory_1 = Column(String(150), index=True, nullable=True)  # e.g., 'bags'
    subcategory_2 = Column(String(150), index=True, nullable=True)  # e.g., 'hand bags'
    item_rating = Column(Float, nullable=False, default=3.0)  # e.g., 4.3
    listing_date = Column(String(50), nullable=True)  # e.g., '02-03-2017'
    
    # Pricing Metrics
    selling_price = Column(Float, nullable=False)  # Actual Selling Price entered by business
    predicted_price = Column(Float, nullable=True)  # Optimal price predicted by Random Forest
    margin_uplift = Column(Float, nullable=True)  # (predicted_price - selling_price)
    margin_uplift_pct = Column(Float, nullable=True)  # ((predicted_price - selling_price) / selling_price) * 100
    pricing_status = Column(String(50), default="Optimized")  # 'Underpriced', 'Overpriced', 'Optimized'
    
    # Audit & Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class BatchUpload(Base):
    """
    Tracks bulk CSV batch ingestion jobs.
    """
    __tablename__ = "batch_uploads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    total_records = Column(Integer, default=0)
    successful_records = Column(Integer, default=0)
    failed_records = Column(Integer, default=0)
    status = Column(String(50), default="Completed")  # 'Processing', 'Completed', 'Failed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ModelMetadata(Base):
    """
    Stores Random Forest model versioning, accuracy metrics, and feature importances.
    """
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model_version = Column(String(50), default="v1.0.0")
    algorithm = Column(String(100), default="Random Forest Regressor")
    n_estimators = Column(Integer, default=100)
    r2_score = Column(Float, nullable=True)
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    total_training_samples = Column(Integer, default=0)
    feature_importances = Column(JSON, nullable=True)
    trained_at = Column(DateTime(timezone=True), server_default=func.now())
