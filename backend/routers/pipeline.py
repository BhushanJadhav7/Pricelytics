from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
import pandas as pd
import io
from typing import Dict, Any
from backend.database import get_db
from backend.schemas import RealTimePredictRequest, RealTimePredictResponse, RetrainResponse
from backend.ml_pipeline import ml_engine
from backend.crud import bulk_insert_products_from_df
from backend.models import Product
from backend.routers.websocket import notify_clients_of_update

router = APIRouter(prefix="/pipeline", tags=["Real-Time Pipeline & ML"])

@router.post("/predict-realtime", response_model=RealTimePredictResponse)
def predict_realtime(payload: RealTimePredictRequest):
    """
    On-the-fly real-time inference using the Random Forest dynamic pricing pipeline.
    Used by the What-If Simulator and instant frontend pricing calculators.
    """
    try:
        result = ml_engine.predict_single(payload.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"ML Pipeline error: {str(e)}")

@router.post("/upload-csv")
async def upload_batch_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Bulk uploads product data via CSV.
    Each record immediately flows through the Random Forest pipeline for optimal price calculation
    and is stored in PostgreSQL.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file must be a .csv file")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        required_cols = ['Product', 'Product_Brand', 'Item_Category', 'Item_Rating', 'Selling_Price']
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"CSV missing mandatory columns: {', '.join(missing)}"
            )

        res = bulk_insert_products_from_df(db, df, batch_filename=file.filename)
        
        await notify_clients_of_update({
            "event": "BATCH_UPLOADED",
            "filename": file.filename,
            "count": res["inserted_count"],
            "batch_id": res["batch_id"]
        })

        return {
            "success": True,
            "message": f"Successfully ingested and priced {res['inserted_count']} records in real-time.",
            "batch_id": res["batch_id"],
            "total_processed": res["inserted_count"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process CSV: {str(e)}")

@router.post("/retrain", response_model=RetrainResponse)
async def retrain_model(db: Session = Depends(get_db)):
    """
    Triggers automated model retraining using the latest data from the PostgreSQL database.
    Calculates updated R2, MAE, and RMSE metrics and refreshes the in-memory pipeline.
    """
    try:
        # Fetch current database records
        products = db.query(Product).all()
        if len(products) < 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Need at least 20 records to retrain the model. Current count: {len(products)}"
            )

        data = [{
            "Product": p.product_code,
            "Product_Brand": p.product_brand,
            "Item_Category": p.item_category,
            "Subcategory_1": p.subcategory_1,
            "Subcategory_2": p.subcategory_2,
            "Item_Rating": p.item_rating,
            "Date": p.listing_date or "01-01-2024",
            "Selling_Price": p.selling_price
        } for p in products]

        df = pd.DataFrame(data)
        metrics = ml_engine.train_pipeline(df)

        await notify_clients_of_update({
            "event": "MODEL_RETRAINED",
            "metrics": metrics
        })

        return {
            "success": True,
            "model_version": metrics["model_version"],
            "r2_score": metrics["r2_score"],
            "mae": metrics["mae"],
            "rmse": metrics["rmse"],
            "samples_trained": metrics["samples_trained"],
            "trained_at": metrics["last_trained"],
            "message": f"Model successfully retrained on {metrics['samples_trained']} live database records."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Retraining failed: {str(e)}")

@router.get("/metrics")
def get_model_diagnostics():
    """Retrieves current Random Forest operational metrics and training telemetry."""
    return ml_engine.metrics
