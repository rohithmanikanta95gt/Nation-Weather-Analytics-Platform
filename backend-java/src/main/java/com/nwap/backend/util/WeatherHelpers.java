package com.nwap.backend.util;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Utility helpers – Java equivalents of Python helpers.py
 * Haversine distance, text tokenization, city metadata.
 */
@Component
public class WeatherHelpers {

    private static final double EARTH_RADIUS_KM = 6371.0;

    // Reference coordinates for major Indian cities (mirrors Python dict)
    public static final Map<String, Map<String, Object>> INDIAN_CITIES_COORDINATES;

    static {
        Map<String, Map<String, Object>> cities = new LinkedHashMap<>();
        cities.put("chennai",        cityEntry("Tamil Nadu",       13.0827,  80.2707));
        cities.put("mumbai",         cityEntry("Maharashtra",      19.0760,  72.8777));
        cities.put("delhi",          cityEntry("Delhi",            28.6139,  77.2090));
        cities.put("new delhi",      cityEntry("Delhi",            28.6139,  77.2090));
        cities.put("kolkata",        cityEntry("West Bengal",      22.5726,  88.3639));
        cities.put("bengaluru",      cityEntry("Karnataka",        12.9716,  77.5946));
        cities.put("bangalore",      cityEntry("Karnataka",        12.9716,  77.5946));
        cities.put("hyderabad",      cityEntry("Telangana",        17.3850,  78.4867));
        cities.put("guwahati",       cityEntry("Assam",            26.1445,  91.7362));
        cities.put("ahmedabad",      cityEntry("Gujarat",          23.0225,  72.5714));
        cities.put("jaipur",         cityEntry("Rajasthan",        26.9124,  75.7873));
        cities.put("kochi",          cityEntry("Kerala",            9.9312,  76.2673));
        cities.put("cochin",         cityEntry("Kerala",            9.9312,  76.2673));
        cities.put("srinagar",       cityEntry("Jammu & Kashmir",  34.0837,  74.7973));
        cities.put("bhubaneswar",    cityEntry("Odisha",           20.2961,  85.8245));
        cities.put("pune",           cityEntry("Maharashtra",      18.5204,  73.8567));
        cities.put("surat",          cityEntry("Gujarat",          21.1702,  72.8311));
        cities.put("patna",          cityEntry("Bihar",            25.5941,  85.1376));
        cities.put("lucknow",        cityEntry("Uttar Pradesh",    26.8467,  80.9462));
        cities.put("visakhapatnam", cityEntry("Andhra Pradesh",    17.6868,  83.2185));
        INDIAN_CITIES_COORDINATES = Collections.unmodifiableMap(cities);
    }

    private static Map<String, Object> cityEntry(String state, double lat, double lng) {
        Map<String, Object> m = new HashMap<>();
        m.put("state", state);
        m.put("lat", lat);
        m.put("lng", lng);
        return m;
    }

    /**
     * Haversine great-circle distance between two lat/lng points in km.
     */
    public static double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double deltaPhi = Math.toRadians(lat2 - lat1);
        double deltaLambda = Math.toRadians(lon2 - lon1);

        double a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2)
                + Math.cos(phi1) * Math.cos(phi2)
                * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Lowercase, remove punctuation, tokenize – mirrors Python clean_text_tokens().
     */
    public static List<String> cleanTextTokens(String text) {
        if (text == null || text.isBlank()) return Collections.emptyList();
        String clean = Pattern.compile("[^\\w\\s]").matcher(text.toLowerCase()).replaceAll(" ");
        List<String> tokens = new ArrayList<>();
        for (String word : clean.split("\\s+")) {
            if (word.length() > 2) tokens.add(word);
        }
        return tokens;
    }

    /**
     * Lookup Indian city metadata.
     */
    public static Optional<Map<String, Object>> findCityMetadata(String cityName) {
        if (cityName == null || cityName.isBlank()) return Optional.empty();
        return Optional.ofNullable(INDIAN_CITIES_COORDINATES.get(cityName.trim().toLowerCase()));
    }
}
