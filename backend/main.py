from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from backend.config import settings
from backend.database import init_db
from backend.seed_data import seed_database_if_empty
from backend.routers import products, analytics, pipeline, websocket

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB schema & seed default historical data if empty
    print("[Startup] Initializing Database Schema...")
    init_db()
    seed_database_if_empty()
    print("[Startup] System is ready to accept requests.")
    yield
    print("[Shutdown] Cleaning up resources...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Automated Dynamic Pricing Platform powered by PostgreSQL, Random Forest ML Pipeline, and Real-Time Business Dashboard.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(pipeline.router, prefix=settings.API_V1_STR)
app.include_router(websocket.router)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "Online",
        "database": "PostgreSQL Ready",
        "ml_model": "Random Forest Regressor Pipeline (Active)",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ml_engine": "operational",
        "api_version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
