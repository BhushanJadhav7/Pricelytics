from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.database import get_db
from backend.schemas import ExecutiveOverviewKPIs, CategoryAnalytics, PriceScatterPoint
from backend.crud import get_executive_kpis, get_category_analytics, get_price_scatter_sample
from backend.ml_pipeline import ml_engine

router = APIRouter(prefix="/analytics", tags=["Executive Analytics"])

@router.get("/overview", response_model=ExecutiveOverviewKPIs)
def executive_overview(db: Session = Depends(get_db)):
    """Executive KPI metrics: Total Catalog Revenue, Uplift Potential, Counts, Model Accuracy."""
    return get_executive_kpis(db)

@router.get("/categories", response_model=List[CategoryAnalytics])
def category_breakdown(limit: int = Query(8, ge=1, le=50), db: Session = Depends(get_db)):
    """Top categories by inventory volume, actual vs. predicted pricing, and total uplift."""
    return get_category_analytics(db, limit=limit)

@router.get("/scatter", response_model=List[PriceScatterPoint])
def price_scatter(sample_size: int = Query(250, ge=10, le=1000), db: Session = Depends(get_db)):
    """Sample of catalog items for Actual vs. Optimal Predicted Price scatter plot."""
    return get_price_scatter_sample(db, sample_size=sample_size)

@router.get("/feature-importances")
def feature_importance():
    """Returns Random Forest feature importance rankings."""
    return ml_engine.get_feature_importances()
