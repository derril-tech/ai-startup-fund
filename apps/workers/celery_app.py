# Created automatically by Cursor AI (2024-12-19)

from celery import Celery
import os

# Celery configuration
celery_app = Celery(
    "ai_startup_fund_workers",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    include=[
        "workers.pitch_ingest",
        "workers.metric_normalizer", 
        "workers.valuation_engine",
        "workers.cap_table_engine",
        "workers.risk_engine",
        "workers.panel_simulator",
        "workers.term_sheet_drafter",
        "workers.exporter"
    ]
)

# Celery settings
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

if __name__ == "__main__":
    celery_app.start()
