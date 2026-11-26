package com.nwap.backend.controller;

import com.nwap.backend.config.AppConfig;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Root health/status endpoint – matches Python's @app.get("/")
 */
@RestController
public class RootController {

    private final AppConfig appConfig;

    public RootController(AppConfig appConfig) {
        this.appConfig = appConfig;
    }

    @GetMapping("/")
    public Map<String, Object> rootStatus() {
        return Map.of(
                "status", "online",
                "service", "National Weather Big Data Analytics Platform (NWAP-India)",
                "version", "1.0.0",
                "documentation", "/docs",
                "ai_provider", appConfig.getAiProvider(),
                "database", "SQLite (weather.db)",
                "cors_allowed_origins", appConfig.getCorsOriginsList()
        );
    }
}
