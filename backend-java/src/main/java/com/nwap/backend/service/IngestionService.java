package com.nwap.backend.service;

import com.nwap.backend.config.AppConfig;
import com.nwap.backend.dto.AiAnalysisResultDto;
import com.nwap.backend.entity.DataSourceStatus;
import com.nwap.backend.entity.WeatherReport;
import com.nwap.backend.repository.DataSourceStatusRepository;
import com.nwap.backend.repository.WeatherReportRepository;
import com.nwap.backend.util.WeatherNormalization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Ingestion service – Java equivalent of Python ingestion_service.py.
 *
 * Handles:
 *  1. Citizen report processing pipeline
 *  2. Background ingestion from Open-Meteo & OpenWeather
 *  3. Multi-signal verification scoring
 */
@Service
public class IngestionService {

    private static final Logger logger = LoggerFactory.getLogger(IngestionService.class);

    // Key Indian hubs for periodic polling (matches Python TARGET_INDIAN_HUBS)
    private static final List<Map<String, Object>> TARGET_INDIAN_HUBS = List.of(
            hub("Chennai",     "Tamil Nadu",   13.0827, 80.2707),
            hub("Mumbai",      "Maharashtra",  19.0760, 72.8777),
            hub("Delhi",       "Delhi",        28.6139, 77.2090),
            hub("Kolkata",     "West Bengal",  22.5726, 88.3639),
            hub("Bengaluru",   "Karnataka",    12.9716, 77.5946),
            hub("Hyderabad",   "Telangana",    17.3850, 78.4867),
            hub("Guwahati",    "Assam",        26.1445, 91.7362),
            hub("Ahmedabad",   "Gujarat",      23.0225, 72.5714),
            hub("Jaipur",      "Rajasthan",    26.9124, 75.7873),
            hub("Kochi",       "Kerala",        9.9312, 76.2673)
    );

    private final AppConfig appConfig;
    private final WeatherReportRepository reportRepository;
    private final DataSourceStatusRepository sourceStatusRepository;
    private final OpenMeteoService openMeteoService;
    private final OpenWeatherService openWeatherService;
    private final DuplicateService duplicateService;
    private final GeminiService geminiService;
    private final GroqService groqService;

    public IngestionService(AppConfig appConfig,
                             WeatherReportRepository reportRepository,
                             DataSourceStatusRepository sourceStatusRepository,
                             OpenMeteoService openMeteoService,
                             OpenWeatherService openWeatherService,
                             DuplicateService duplicateService,
                             GeminiService geminiService,
                             GroqService groqService) {
        this.appConfig = appConfig;
        this.reportRepository = reportRepository;
        this.sourceStatusRepository = sourceStatusRepository;
        this.openMeteoService = openMeteoService;
        this.openWeatherService = openWeatherService;
        this.duplicateService = duplicateService;
        this.geminiService = geminiService;
        this.groqService = groqService;
    }

    // ---- Citizen Report Pipeline ----

    /**
     * Full pipeline for a new citizen report submission.
     * Mirrors Python process_and_save_citizen_report().
     */
    @Transactional
    public WeatherReport processAndSaveCitizenReport(Map<String, Object> reportDict) {
        String desc = String.valueOf(reportDict.getOrDefault("description", ""));
        String eventType = reportDict.get("event_type") != null
                ? (String) reportDict.get("event_type")
                : WeatherNormalization.detectEventTypeFromText(desc);
        String severity = WeatherNormalization.estimateSeverity(eventType, desc);
        double lat = toDouble(reportDict.get("latitude"), 0.0);
        double lng = toDouble(reportDict.get("longitude"), 0.0);

        reportDict.put("event_type", eventType);
        reportDict.put("severity", severity);
        if (reportDict.get("timestamp") == null) {
            reportDict.put("timestamp", LocalDateTime.now());
        }

        // 1. Duplicate detection (last 24h reports)
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<WeatherReport> recentDbReports = reportRepository.findRecentReports(cutoff);
        List<Map<String, Object>> recentDicts = new ArrayList<>();
        for (WeatherReport r : recentDbReports) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("latitude", r.getLatitude());
            m.put("longitude", r.getLongitude());
            m.put("description", r.getDescription());
            m.put("event_type", r.getEventType());
            m.put("timestamp", r.getTimestamp());
            recentDicts.add(m);
        }
        DuplicateService.DuplicateResult dupResult = duplicateService.calculateDuplicateProbability(
                reportDict, recentDicts, null);

        // 2. AI Analysis
        AiAnalysisResultDto aiResult = dispatchAiAnalysis(reportDict);

        // 3. Weather API cross-reference
        boolean weatherAligned = true;
        try {
            Map<String, Object> liveWeather = openMeteoService.getCurrentWeather(lat, lng);
            Object wCode = liveWeather.get("weather_code");
            if (wCode != null) {
                int code = (int) Double.parseDouble(wCode.toString());
                if ((eventType.equals("flood") || eventType.equals("thunderstorm")) && code == 0) {
                    weatherAligned = false;
                }
            }
        } catch (Exception e) {
            // Don't fail report processing due to weather API issues
        }

        // 4. Multi-signal verification scoring
        String source = String.valueOf(reportDict.getOrDefault("source", "Citizen Report"));
        VerificationResult vr = calculateVerificationComposite(
                source, aiResult.getCredibility(), aiResult.getConfidence(),
                dupResult.probability(), weatherAligned);

        String finalStatus = dupResult.isDuplicate() ? "duplicate" : vr.status();

        // 5. Build and save entity
        WeatherReport entity = new WeatherReport();
        entity.setSource(source);
        entity.setSourceReportId((String) reportDict.get("source_report_id"));
        entity.setTimestamp((LocalDateTime) reportDict.getOrDefault("timestamp", LocalDateTime.now()));
        entity.setCountry("India");
        entity.setState(String.valueOf(reportDict.getOrDefault("state", "India")));
        entity.setCity(String.valueOf(reportDict.getOrDefault("city", "Unknown")));
        entity.setDistrict((String) reportDict.get("district"));
        entity.setLatitude(lat);
        entity.setLongitude(lng);
        entity.setEventType(!"other".equals(aiResult.getEventType()) ? aiResult.getEventType() : eventType);
        entity.setDescription(desc);
        entity.setSeverity(aiResult.getSeverity() != null ? aiResult.getSeverity() : severity);
        entity.setImageUrl((String) reportDict.get("image_url"));
        entity.setVideoUrl((String) reportDict.get("video_url"));
        entity.setOriginalText(desc);
        entity.setVerificationStatus(finalStatus);
        entity.setVerificationScore(vr.score());
        entity.setVerificationReason(vr.reason() + " AI Note: " + aiResult.getReason());
        entity.setAiConfidence(Math.round(aiResult.getConfidence() * 100.0) / 100.0);
        entity.setDuplicateProbability(dupResult.probability());
        entity.setIsDuplicate(dupResult.isDuplicate());
        entity.setDuplicateOfId(dupResult.matchedId());

        return reportRepository.save(entity);
    }

    // ---- AI Provider Dispatch ----

    private AiAnalysisResultDto dispatchAiAnalysis(Map<String, Object> reportData) {
        String provider = appConfig.getAiProvider().toLowerCase();
        return switch (provider) {
            case "groq" -> groqService.analyzeReport(reportData);
            case "gemini" -> geminiService.analyzeReport(reportData);
            default -> geminiService.ruleBasedFallback(reportData);
        };
    }

    // ---- Multi-Signal Verification Scoring ----

    record VerificationResult(String status, double score, String reason) {}

    /**
     * Implements multi-signal credibility scoring.
     * Mirrors Python calculate_verification_composite().
     */
    private VerificationResult calculateVerificationComposite(
            String source, String aiCredibility, double aiConfidence,
            double duplicateProb, boolean hasWeatherAlignment) {

        // 1. Source trust
        double sourceTrust = switch (source) {
            case "IMD", "Open-Meteo", "OpenWeather", "CWC" -> 0.95;
            case "Citizen Report" -> 0.65;
            case "Social Media" -> 0.45;
            default -> 0.50;
        };

        // 2. AI signal
        double aiWeight = switch (aiCredibility != null ? aiCredibility : "") {
            case "verified" -> 0.85;
            case "unverified" -> 0.60;
            case "suspicious" -> 0.35;
            case "rejected" -> 0.15;
            default -> 0.50;
        };

        // 3. Weather API alignment
        double weatherSignal = hasWeatherAlignment ? 0.85 : 0.50;

        // 4. Duplicate penalty
        double duplicatePenalty = duplicateProb * 0.40;

        double composite = (sourceTrust * 0.35) + (aiWeight * 0.35) + (aiConfidence * 0.15)
                + (weatherSignal * 0.15) - duplicatePenalty;
        composite = Math.round(composite * 100.0) / 100.0;
        composite = Math.max(0.05, Math.min(0.99, composite));

        if (duplicateProb >= appConfig.getDuplicateSimilarityThreshold()) {
            return new VerificationResult("duplicate", composite,
                    "High similarity (" + (int)(duplicateProb * 100) + "%) with prior recent report in locality.");
        }
        if (composite >= 0.75) {
            return new VerificationResult("verified", composite,
                    "High multi-signal credibility supported by AI analysis and consistent physical parameters.");
        }
        if (composite >= 0.50) {
            return new VerificationResult("unverified", composite,
                    "Plausible report pending additional sensor corroboration.");
        }
        if (composite >= 0.30) {
            return new VerificationResult("suspicious", composite,
                    "Flagged due to conflicting observations or ambiguous language.");
        }
        return new VerificationResult("rejected", composite,
                "Rejected due to improbable claims, severe metadata conflicts, or disinformation.");
    }

    // ---- Background Ingestion ----

    /**
     * Fetch live weather from Open-Meteo & OpenWeather for Indian hubs.
     * Mirrors Python run_background_ingestion().
     */
    @Transactional
    public Map<String, Object> runBackgroundIngestion() {
        int openMeteoCount = 0;
        int openWeatherCount = 0;

        // Open-Meteo ingestion (all hubs)
        for (Map<String, Object> hub : TARGET_INDIAN_HUBS) {
            try {
                Map<String, Object> raw = openMeteoService.getCurrentWeather(
                        (double) hub.get("lat"), (double) hub.get("lng"));
                if ("success".equals(raw.get("status"))) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> rawData = (Map<String, Object>) raw.get("raw");
                    Map<String, Object> norm = WeatherNormalization.normalizeOpenMeteoData(
                            rawData, (String) hub.get("city"), (String) hub.get("state"), null);
                    reportRepository.save(mapToEntity(norm));
                    openMeteoCount++;
                }
            } catch (Exception e) {
                logger.warn("Open-Meteo sync failed for {}: {}", hub.get("city"), e.getMessage());
            }
        }

        // Update Open-Meteo source status
        updateSourceStatus("Open-Meteo", "online", openMeteoCount,
                45.0, "api.open-meteo.com/v1/forecast");

        // OpenWeather ingestion (top 3 hubs only to conserve API quota)
        String owKey = appConfig.getOpenweatherApiKey();
        if (owKey != null && !owKey.isBlank()) {
            List<Map<String, Object>> top3 = TARGET_INDIAN_HUBS.subList(0, Math.min(3, TARGET_INDIAN_HUBS.size()));
            for (Map<String, Object> hub : top3) {
                try {
                    Map<String, Object> res = openWeatherService.getCurrentWeather(
                            (double) hub.get("lat"), (double) hub.get("lng"));
                    if ("success".equals(res.get("status"))) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> data = (Map<String, Object>) res.get("data");
                        Map<String, Object> norm = WeatherNormalization.normalizeOpenWeatherData(
                                data, (String) hub.get("city"), (String) hub.get("state"), null);
                        reportRepository.save(mapToEntity(norm));
                        openWeatherCount++;
                    }
                } catch (Exception e) {
                    logger.warn("OpenWeather sync failed for {}: {}", hub.get("city"), e.getMessage());
                }
            }
        }
        updateSourceStatus("OpenWeather",
                owKey != null && !owKey.isBlank() ? "online" : "not_configured",
                openWeatherCount, owKey != null && !owKey.isBlank() ? 95.0 : 0.0,
                "api.openweathermap.org/data/2.5/weather");

        // IMD status
        DataSourceStatus imdStatus = sourceStatusRepository.findBySource("IMD")
                .orElseGet(() -> {
                    DataSourceStatus s = new DataSourceStatus();
                    s.setSource("IMD");
                    s.setEndpoint("api.imd.gov.in/v2");
                    return s;
                });
        String imdKey = appConfig.getImdApiKey();
        imdStatus.setStatus(imdKey != null && !imdKey.isBlank() ? "online" : "not_configured");
        sourceStatusRepository.save(imdStatus);

        logger.info("Background ingestion: Open-Meteo={}, OpenWeather={}", openMeteoCount, openWeatherCount);
        return Map.of(
                "status", "success",
                "openmeteo_records", openMeteoCount,
                "openweather_records", openWeatherCount,
                "timestamp", LocalDateTime.now().toString()
        );
    }

    // ---- Helper methods ----

    private void updateSourceStatus(String sourceName, String status, int newRecords,
                                     double latency, String endpoint) {
        DataSourceStatus s = sourceStatusRepository.findBySource(sourceName)
                .orElseGet(() -> {
                    DataSourceStatus ns = new DataSourceStatus();
                    ns.setSource(sourceName);
                    return ns;
                });
        s.setStatus(status);
        s.setLastSync(LocalDateTime.now());
        s.setRecordsReceived(s.getRecordsReceived() + newRecords);
        s.setLatencyMs(latency);
        s.setEndpoint(endpoint);
        sourceStatusRepository.save(s);
    }

    private WeatherReport mapToEntity(Map<String, Object> norm) {
        WeatherReport r = new WeatherReport();
        r.setSource(str(norm, "source"));
        r.setSourceReportId(str(norm, "source_report_id"));
        r.setTimestamp((LocalDateTime) norm.getOrDefault("timestamp", LocalDateTime.now()));
        r.setCountry(str(norm, "country", "India"));
        r.setState(str(norm, "state", "India"));
        r.setCity(str(norm, "city", "Unknown"));
        r.setDistrict(str(norm, "district"));
        r.setLatitude(toDouble(norm.get("latitude"), 0.0));
        r.setLongitude(toDouble(norm.get("longitude"), 0.0));
        r.setEventType(str(norm, "event_type", "other"));
        r.setDescription(str(norm, "description", ""));
        r.setTemperature(toDoubleOrNull(norm.get("temperature")));
        r.setHumidity(toDoubleOrNull(norm.get("humidity")));
        r.setRainfall(toDoubleOrNull(norm.get("rainfall")));
        r.setWindSpeed(toDoubleOrNull(norm.get("wind_speed")));
        r.setSeverity(str(norm, "severity", "moderate"));
        r.setVerificationStatus(str(norm, "verification_status", "unverified"));
        r.setVerificationScore(toDouble(norm.get("verification_score"), 0.5));
        r.setVerificationReason(str(norm, "verification_reason"));
        r.setAiConfidence(toDouble(norm.get("ai_confidence"), 0.0));
        r.setDuplicateProbability(toDouble(norm.get("duplicate_probability"), 0.0));
        r.setIsDuplicate((Boolean) norm.getOrDefault("is_duplicate", false));
        return r;
    }

    private static Map<String, Object> hub(String city, String state, double lat, double lng) {
        Map<String, Object> m = new HashMap<>();
        m.put("city", city);
        m.put("state", state);
        m.put("lat", lat);
        m.put("lng", lng);
        return m;
    }

    private static String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString() : null;
    }

    private static String str(Map<String, Object> m, String key, String def) {
        Object v = m.get(key);
        return v != null ? v.toString() : def;
    }

    private static double toDouble(Object val, double def) {
        if (val == null) return def;
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return def; }
    }

    private static Double toDoubleOrNull(Object val) {
        if (val == null) return null;
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return null; }
    }
}
