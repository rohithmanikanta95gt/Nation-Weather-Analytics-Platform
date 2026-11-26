package com.nwap.backend.service;

import com.nwap.backend.config.AppConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Spring Scheduler – Java equivalent of Python scheduler.py (APScheduler).
 * Runs background weather data ingestion periodically.
 * Uses Spring's @Scheduled with configurable fixed-rate from application.properties.
 */
@Component
public class WeatherIngestionScheduler {

    private static final Logger logger = LoggerFactory.getLogger(WeatherIngestionScheduler.class);

    private final IngestionService ingestionService;
    private final AppConfig appConfig;

    public WeatherIngestionScheduler(IngestionService ingestionService, AppConfig appConfig) {
        this.ingestionService = ingestionService;
        this.appConfig = appConfig;
    }

    /**
     * Scheduled ingestion job.
     * Fixed delay = 10 minutes (600000ms) by default; controlled via BACKGROUND_SYNC_INTERVAL_MINUTES.
     * Uses fixedDelayString with SpEL to pick up the config value.
     */
    @Scheduled(fixedDelayString = "#{${app.background-sync-interval-minutes:10} * 60 * 1000}",
               initialDelayString = "#{${app.background-sync-interval-minutes:10} * 60 * 1000}")
    public void scheduledIngestionJob() {
        logger.info("Executing scheduled weather ingestion job...");
        try {
            var result = ingestionService.runBackgroundIngestion();
            logger.info("Scheduled ingestion completed: Open-Meteo={}, OpenWeather={}",
                    result.get("openmeteo_records"), result.get("openweather_records"));
        } catch (Exception e) {
            logger.error("Scheduled ingestion job error: {}", e.getMessage(), e);
        }
    }
}
