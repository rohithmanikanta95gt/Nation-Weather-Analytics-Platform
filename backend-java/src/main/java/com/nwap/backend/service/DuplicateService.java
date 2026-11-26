package com.nwap.backend.service;

import com.nwap.backend.config.AppConfig;
import com.nwap.backend.util.WeatherHelpers;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Duplicate detection service – Java equivalent of Python duplicate_service.py.
 *
 * Uses:
 *  1. Haversine geographic proximity (< 20km)
 *  2. Temporal closeness (< 12 hours decay)
 *  3. Event type agreement
 *  4. TF-IDF cosine similarity (pure-Java implementation) or Jaccard fallback
 *
 * Result tuple: [duplicateProbability, matchedId (or null), isDuplicate]
 */
@Service
public class DuplicateService {

    private final AppConfig appConfig;

    public DuplicateService(AppConfig appConfig) {
        this.appConfig = appConfig;
    }

    public record DuplicateResult(double probability, Long matchedId, boolean isDuplicate) {}

    /**
     * Jaccard similarity between two tokenized texts.
     */
    private static double jaccardSimilarity(String text1, String text2) {
        List<String> t1 = WeatherHelpers.cleanTextTokens(text1);
        List<String> t2 = WeatherHelpers.cleanTextTokens(text2);
        if (t1.isEmpty() || t2.isEmpty()) return 0.0;
        Set<String> s1 = new HashSet<>(t1);
        Set<String> s2 = new HashSet<>(t2);
        Set<String> intersection = new HashSet<>(s1);
        intersection.retainAll(s2);
        Set<String> union = new HashSet<>(s1);
        union.addAll(s2);
        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

    /**
     * Pure-Java TF-IDF cosine similarity for two documents.
     * This replaces sklearn's TfidfVectorizer + cosine_similarity.
     */
    private static double tfidfCosineSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null || text1.isBlank() || text2.isBlank()) return 0.0;

        List<String> tokens1 = WeatherHelpers.cleanTextTokens(text1);
        List<String> tokens2 = WeatherHelpers.cleanTextTokens(text2);

        if (tokens1.isEmpty() || tokens2.isEmpty()) return 0.0;

        // Build vocabulary
        Set<String> vocab = new LinkedHashSet<>(tokens1);
        vocab.addAll(tokens2);

        // Term frequency
        Map<String, Double> tf1 = termFrequency(tokens1);
        Map<String, Double> tf2 = termFrequency(tokens2);

        // IDF (with corpus of size 2)
        Map<String, Double> idf = new HashMap<>();
        for (String term : vocab) {
            int docCount = (tf1.containsKey(term) ? 1 : 0) + (tf2.containsKey(term) ? 1 : 0);
            idf.put(term, Math.log((2.0 + 1.0) / (docCount + 1.0)) + 1.0); // smoothed
        }

        // TF-IDF vectors
        double[] v1 = tfidfVector(vocab, tf1, idf);
        double[] v2 = tfidfVector(vocab, tf2, idf);

        return cosineSimilarity(v1, v2);
    }

    private static Map<String, Double> termFrequency(List<String> tokens) {
        Map<String, Integer> counts = new HashMap<>();
        for (String t : tokens) counts.merge(t, 1, Integer::sum);
        Map<String, Double> tf = new HashMap<>();
        int total = tokens.size();
        counts.forEach((k, v) -> tf.put(k, (double) v / total));
        return tf;
    }

    private static double[] tfidfVector(Set<String> vocab, Map<String, Double> tf, Map<String, Double> idf) {
        double[] vec = new double[vocab.size()];
        int i = 0;
        for (String term : vocab) {
            vec[i++] = tf.getOrDefault(term, 0.0) * idf.getOrDefault(term, 1.0);
        }
        return vec;
    }

    private static double cosineSimilarity(double[] v1, double[] v2) {
        double dot = 0, norm1 = 0, norm2 = 0;
        for (int i = 0; i < v1.length; i++) {
            dot += v1[i] * v2[i];
            norm1 += v1[i] * v1[i];
            norm2 += v2[i] * v2[i];
        }
        double denom = Math.sqrt(norm1) * Math.sqrt(norm2);
        return denom == 0 ? 0.0 : dot / denom;
    }

    private static double calculateTextSimilarity(String text1, String text2) {
        try {
            return tfidfCosineSimilarity(text1, text2);
        } catch (Exception e) {
            return jaccardSimilarity(text1, text2);
        }
    }

    /**
     * Main duplicate detection.
     * @param newReport map with keys: latitude, longitude, description, event_type, timestamp
     * @param recentReports list of maps with same keys + "id"
     * @param threshold similarity threshold (0.0–1.0)
     */
    public DuplicateResult calculateDuplicateProbability(
            Map<String, Object> newReport,
            List<Map<String, Object>> recentReports,
            Double threshold) {

        if (threshold == null) threshold = appConfig.getDuplicateSimilarityThreshold();
        if (recentReports == null || recentReports.isEmpty()) return new DuplicateResult(0.0, null, false);

        double newLat = toDouble(newReport.get("latitude"), 0.0);
        double newLng = toDouble(newReport.get("longitude"), 0.0);
        String newDesc = String.valueOf(newReport.getOrDefault("description", ""));
        String newEvent = String.valueOf(newReport.getOrDefault("event_type", "")).toLowerCase();
        LocalDateTime newTime = (LocalDateTime) newReport.getOrDefault("timestamp", LocalDateTime.now());

        double highestProb = 0.0;
        Long matchedId = null;

        for (Map<String, Object> existing : recentReports) {
            double exLat = toDouble(existing.get("latitude"), 0.0);
            double exLng = toDouble(existing.get("longitude"), 0.0);
            String exDesc = String.valueOf(existing.getOrDefault("description", ""));
            String exEvent = String.valueOf(existing.getOrDefault("event_type", "")).toLowerCase();
            LocalDateTime exTime = (LocalDateTime) existing.getOrDefault("timestamp", LocalDateTime.now());
            Long exId = toLong(existing.get("id"));

            // 1. Geographic distance
            double distKm = WeatherHelpers.haversineDistanceKm(newLat, newLng, exLat, exLng);
            if (distKm > 20.0) continue; // Cannot be duplicate if >20km apart
            double geoScore = distKm <= 15.0 ? Math.max(0.0, 1.0 - (distKm / 15.0)) : 0.0;

            // 2. Temporal closeness (decay over 12 hours)
            long timeDiffSeconds = Math.abs(ChronoUnit.SECONDS.between(newTime, exTime));
            double timeDiffHours = timeDiffSeconds / 3600.0;
            double timeScore = timeDiffHours <= 12.0 ? Math.max(0.0, 1.0 - (timeDiffHours / 12.0)) : 0.0;

            // 3. Event type match
            double eventScore = (newEvent.equals(exEvent) || "other".equals(newEvent) || "other".equals(exEvent)) ? 1.0 : 0.4;

            // 4. Text similarity
            double textScore = calculateTextSimilarity(newDesc, exDesc);

            // Weighted composite (matches Python weights exactly)
            double composite = (textScore * 0.45) + (geoScore * 0.30) + (timeScore * 0.15) + (eventScore * 0.10);

            if (composite > highestProb) {
                highestProb = Math.round(composite * 1000.0) / 1000.0;
                matchedId = exId;
            }
        }

        boolean isDuplicate = highestProb >= threshold;
        return new DuplicateResult(highestProb, isDuplicate ? matchedId : null, isDuplicate);
    }

    private static double toDouble(Object val, double def) {
        if (val == null) return def;
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return def; }
    }

    private static Long toLong(Object val) {
        if (val == null) return null;
        try { return Long.parseLong(val.toString()); } catch (Exception e) { return null; }
    }
}
