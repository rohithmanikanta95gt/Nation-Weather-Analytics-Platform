import logging
import asyncio
from apscheduler.schedulers.background import BackgroundScheduler
from app.config import settings
from app.database.connection import SessionLocal

logger = logging.getLogger("scheduler")

scheduler = BackgroundScheduler()


def scheduled_ingestion_job():
    """Run periodic data collection in background."""
    logger.info("Executing scheduled weather ingestion job...")
    db = SessionLocal()
    try:
        from app.services.ingestion_service import run_background_ingestion

        # Run async ingestion function in loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_background_ingestion(db))
        loop.close()
        logger.info("Scheduled weather ingestion completed.")
    except Exception as e:
        logger.error(f"Scheduled ingestion job error: {e}")
    finally:
        db.close()


def start_scheduler():
    """Start APScheduler background runner."""
    interval = max(2, settings.BACKGROUND_SYNC_INTERVAL_MINUTES)
    scheduler.add_job(
        scheduled_ingestion_job,
        "interval",
        minutes=interval,
        id="weather_ingestion_job",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(f"APScheduler started. Ingestion job scheduled every {interval} minutes.")


def stop_scheduler():
    """Shutdown APScheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped.")
