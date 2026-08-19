# **Pricelytics Enterprise** 🚀
### Automated Real-Time Dynamic Pricing & Inventory Intelligence Platform

**Pricelytics Enterprise** is a production-grade, full-stack business application designed for retail, e-commerce, and merchandising teams to optimize selling prices, maximize profit margins, and monitor catalog equilibrium in real-time.

Powered by **PostgreSQL**, an automated **Real-Time Random Forest Machine Learning Pipeline**, and an executive **Business Dashboard** built with **React and Tailwind CSS**.

---

## 🌟 Key Architecture & Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│               EXECUTIVE FRONTEND DASHBOARD (React + Tailwind)          │
│  - Executive Pulse (KPIs)       - Product Inventory CRUD Grid          │
│  - Real-Time Price Simulator    - CSV Batch Pipeline Studio            │
│  - ML Model & DB Diagnostics    - Live WebSocket Event Stream          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API + WebSockets
┌───────────────────────────────────▼────────────────────────────────────┐
│                    FASTAPI ASYNC BACKEND ENGINE                        │
│  - CRUD Controllers             - Batch File Ingestion Service         │
│  - Analytics Aggregator         - WebSocket Real-Time Broadcast Manager│
└───────────────┬───────────────────────────────────┬────────────────────┘
                │                                   │
┌───────────────▼───────────────────┐ ┌─────────────▼────────────────────┐
│      POSTGRESQL DATABASE          │ │  RANDOM FOREST ML PIPELINE       │
│  - ACID Product Inventory Schema  │ │  - Real-Time Dynamic Pricing     │
│  - Batch Upload & Audit Logs      │ │  - Elasticity & Uplift Engine    │
│  - Model Metadata & Metrics Logs  │ │  - On-Demand Live Retraining     │
└───────────────────────────────────┘ └──────────────────────────────────┘
```

---

## ⚡ Core Features

### 1. 🗄️ PostgreSQL Database Pipeline & Full CRUD
- **Real-Time Data Ingestion**: Relational schema storing product code, brand, category, subcategories, customer ratings, dates, and historical prices.
- **Automated Pricing Calculation**: When products are created or updated, they automatically pass through the Random Forest pipeline to compute the optimal dynamic price and margin uplift.
- **Search, Filter & Sort**: Fast indexing on categories, brands, price bands, ratings, and pricing health status.

### 2. 🤖 Real-Time Random Forest ML Pipeline
- **Continuous Valuation**: Predicts optimal selling prices using multi-variable regression (Brand power, Category baseline, Quality sentiment, Date trends).
- **Price Elasticity & What-If Simulation**: Interactive playground for pricing managers to model expected dynamic prices across rating and category scenarios.
- **One-Click Live Retraining**: Retrain the Random Forest model on the live PostgreSQL dataset with real-time performance evaluation (R² score, MAE, RMSE).

### 3. 📊 Executive Business Dashboard (Tailwind CSS)
- **Executive Pulse**: High-impact KPI cards for total catalog revenue, margin uplift potential, underpriced SKU opportunities, and model accuracy.
- **Interactive Visualizations**: Actual vs. Predicted scatter plot matrix, category volume/pricing bar charts, pricing equilibrium donut charts.
- **Batch CSV Studio**: Drag & drop bulk CSV file upload with streaming progress and real-time inference telemetry.
- **Live Stream**: Instant WebSocket updates when new items are added, updated, or retrained.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Uvicorn, WebSockets, Pydantic V2
- **Database**: PostgreSQL 16 (with SQLite zero-config fallback)
- **Machine Learning**: Scikit-Learn (Random Forest Regressor), Joblib, Pandas, NumPy
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios
- **DevOps**: Docker, Docker Compose, Nginx

---

## 🚀 Quickstart Guide

### Option 1: Run with Docker Compose (Recommended)

To launch PostgreSQL, FastAPI Backend, and Vite React Frontend with 1 command:

```bash
docker-compose up --build
```

- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: `localhost:5432` (`pricelytics_db`)

---

### Option 2: Local Development

#### 1. Backend Setup:
```bash
# Install dependencies
pip install -r requirements.txt

# (Optional) Configure .env with your PostgreSQL credentials
# If skipped, SQLite will automatically be used for local testing.

# Run database schema initialization & seed
python -m backend.seed_data

# Start FastAPI backend server
uvicorn backend.main:app --reload --port 8000
```

#### 2. Frontend Setup:
```bash
cd frontend

# Install frontend dependencies
npm install

# Start Vite dev server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser!

---

## 📑 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Paginated, filtered product inventory list |
| `POST` | `/api/products` | Create product + run real-time ML dynamic price calculation |
| `PUT` | `/api/products/{id}` | Update product attributes + recalculate optimal price |
| `DELETE` | `/api/products/{id}` | Remove product from PostgreSQL database |
| `GET` | `/api/analytics/overview` | Executive KPI Pulse (Catalog value, margin uplift, SKU counts) |
| `GET` | `/api/analytics/categories` | Category pricing and volume breakdown |
| `GET` | `/api/analytics/scatter` | Actual vs. Predicted price scatter matrix |
| `POST` | `/api/pipeline/predict-realtime` | On-the-fly Random Forest inference & what-if simulator |
| `POST` | `/api/pipeline/upload-csv` | Bulk CSV batch ingestion with streaming inference |
| `POST` | `/api/pipeline/retrain` | Retrain Random Forest model on live PostgreSQL database |
| `WS` | `/ws/live-feed` | Real-time WebSocket event stream |
