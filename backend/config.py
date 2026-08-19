from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pricelytics Enterprise"
    API_V1_STR: str = "/api"
    
    # Database configuration
    # Default fallback to SQLite if PostgreSQL is not specified, but supports full PostgreSQL connection
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./pricelytics.db"
    )
    
    # ML Model configuration
    MODEL_PATH: str = os.getenv("MODEL_PATH", "dynamic_pricing_pipeline.pkl")
    DATASET_PATH: str = os.getenv("DATASET_PATH", "Train.csv")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
