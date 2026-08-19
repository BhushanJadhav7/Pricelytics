import os
import pandas as pd
from sqlalchemy.orm import Session
from backend.database import SessionLocal, init_db
from backend.models import Product
from backend.crud import bulk_insert_products_from_df
from backend.config import settings

def seed_database_if_empty():
    """Initializes schema and seeds historical dataset into PostgreSQL/SQLite if products table is empty."""
    init_db()
    db: Session = SessionLocal()
    try:
        count = db.query(Product).count()
        if count == 0:
            dataset_path = settings.DATASET_PATH
            if os.path.exists(dataset_path):
                print(f"[Seed] Loading seed dataset from {dataset_path}...")
                df = pd.read_csv(dataset_path)
                res = bulk_insert_products_from_df(db, df, batch_filename="Train.csv (Initial Seed)")
                print(f"[Seed] Successfully seeded {res['inserted_count']} records with real-time ML predictions into database.")
            else:
                print(f"[Seed] Dataset {dataset_path} not found. Skipping auto-seed.")
        else:
            print(f"[Seed] Database already contains {count} products. Skipping seed.")
    except Exception as e:
        print(f"[Seed] Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database_if_empty()
