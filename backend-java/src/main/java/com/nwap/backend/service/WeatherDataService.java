package com.nwap.backend.service;

import com.nwap.backend.dto.*;
import com.nwap.backend.entity.WeatherAlert;
import com.nwap.backend.entity.WeatherReport;
import com.nwap.backend.repository.WeatherAlertRepository;
import com.nwap.backend.repository.WeatherReportRepository;
import com.nwap.backend.util.DtoMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Analytics & reporting service – covers all analytics, reports,
 * alerts queries. Mirrors Python analytics.py and reports.py logic.
 */
@Service
public class WeatherDataService {

    private final WeatherReportRepository reportRepository;
    private final WeatherAlertRepository alertRepository;

    public WeatherDataService(WeatherReportRepository reportRepository,
                               WeatherAlertRepository alertRepository) {
        this.reportRepository = reportRepository;
        this.alertRepository = alertRepository;
    }

    // ---- Analytics ----

    public AnalyticsSummaryDto getAnalyticsSummary() {
        long total = reportRepository.count();
        long verified = reportRepository.countByVerificationStatus("verified");
        long unverified = reportRepository.countByVerificationStatus("unverified");
        long suspicious = reportRepository.countByVerificationStatus("suspicious");
        long duplicate = reportRepository.countByIsDuplicate(true);
        long activeAlerts = alertRepository.countByIsActive(true);

        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        long reportsToday = reportRepository.countByCreatedAtAfter(todayStart);

        return AnalyticsSummaryDto.builder()
                .totalReports(total)
                .verifiedReports(verified)
                .unverifiedReports(unverified)
                .suspiciousReports(suspicious)
                .duplicateReports(duplicate)
                .activeAlerts(activeAlerts)
                .reportsToday(reportsToday)
                .build();
    }

    public List<EventDistributionItemDto> getEventDistribution() {
        long total = Math.max(1, reportRepository.count());
        List<Object[]> rows = reportRepository.countGroupByEventType();
        List<EventDistributionItemDto> results = new ArrayList<>();
        for (Object[] row : rows) {
            String eventType = String.valueOf(row[0]);
            long count = ((Number) row[1]).longValue();
            double pct = Math.round((double) count / total * 1000.0) / 10.0;
            // capitalize and replace underscore (matches Python .capitalize().replace("_", " "))
            String displayType = Character.toUpperCase(eventType.charAt(0)) + eventType.substring(1).replace("_", " ");
            results.add(EventDistributionItemDto.builder()
                    .eventType(displayType).count(count).percentage(pct).build());
        }
        return results;
    }

    public List<StateAnalyticsItemDto> getStateAnalytics() {
        List<Object[]> rows = reportRepository.countGroupByState();
        List<StateAnalyticsItemDto> results = new ArrayList<>();
        int limit = Math.min(12, rows.size());
        for (int i = 0; i < limit; i++) {
            Object[] row = rows.get(i);
            String state = String.valueOf(row[0]);
            long total = ((Number) row[1]).longValue();
            long floodCount = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            long alertCnt = alertRepository.countByStateAndIsActive(state, true);
            results.add(StateAnalyticsItemDto.builder()
                    .state(state).count(total).floodCount(floodCount).alertsCount(alertCnt).build());
        }
        return results;
    }

    public List<TimelineItemDto> getTimelineAnalytics(int days) {
        List<TimelineItemDto> results = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime target = now.minusDays(i);
            String dayStr = target.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            LocalDateTime dStart = target.withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime dEnd = target.withHour(23).withMinute(59).withSecond(59).withNano(999999999);

            long repCount = reportRepository.countByTimestampBetween(dStart, dEnd);
            long verCount = reportRepository.countByTimestampBetweenAndStatus(dStart, dEnd, "verified");
            results.add(TimelineItemDto.builder().period(dayStr).reports(repCount).verified(verCount).build());
        }
        return results;
    }

    public VerificationAnalyticsDto getVerificationAnalytics() {
        return VerificationAnalyticsDto.builder()
                .verified(reportRepository.countByVerificationStatus("verified"))
                .unverified(reportRepository.countByVerificationStatus("unverified"))
                .suspicious(reportRepository.countByVerificationStatus("suspicious"))
                .rejected(reportRepository.countByVerificationStatus("rejected"))
                .duplicate(reportRepository.countByVerificationStatus("duplicate"))
                .build();
    }

    // ---- Reports ----

    public PaginatedReportsResponseDto getReports(
            LocalDateTime startDate, LocalDateTime endDate,
            String state, String city, String district,
            String eventType, String verificationStatus,
            String source, String severity, String search,
            int page, int limit) {

        Specification<WeatherReport> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (startDate != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), startDate));
            if (endDate != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), endDate));
            if (state != null && !state.equalsIgnoreCase("all states"))
                predicates.add(cb.equal(cb.lower(root.get("state")), state.toLowerCase()));
            if (city != null && !city.isBlank())
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.trim().toLowerCase() + "%"));
            if (district != null && !district.isBlank())
                predicates.add(cb.like(cb.lower(root.get("district")), "%" + district.trim().toLowerCase() + "%"));
            if (eventType != null && !eventType.equalsIgnoreCase("all events"))
                predicates.add(cb.equal(cb.lower(root.get("eventType")), eventType.toLowerCase()));
            if (verificationStatus != null && !verificationStatus.equalsIgnoreCase("all"))
                predicates.add(cb.equal(cb.lower(root.get("verificationStatus")), verificationStatus.toLowerCase()));
            if (source != null && !source.equalsIgnoreCase("all") && !source.equalsIgnoreCase("all sources"))
                predicates.add(cb.equal(cb.lower(root.get("source")), source.toLowerCase()));
            if (severity != null && !severity.equalsIgnoreCase("all"))
                predicates.add(cb.equal(cb.lower(root.get("severity")), severity.toLowerCase()));
            if (search != null && !search.isBlank()) {
                String s = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("description")), s),
                        cb.like(cb.lower(root.get("city")), s),
                        cb.like(cb.lower(root.get("state")), s)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<WeatherReport> pageResult = reportRepository.findAll(spec, pageable);

        List<WeatherReportResponseDto> items = pageResult.getContent().stream()
                .map(DtoMapper::toReportResponse).collect(Collectors.toList());

        return PaginatedReportsResponseDto.builder()
                .items(items).total(pageResult.getTotalElements())
                .page(page).limit(limit).build();
    }

    public WeatherReportResponseDto getReportById(Long id) {
        return reportRepository.findById(id)
                .map(DtoMapper::toReportResponse)
                .orElse(null);
    }

    public List<WeatherMapItemDto> getMapReports(String eventType) {
        List<WeatherReport> reports;
        if (eventType != null && !eventType.equalsIgnoreCase("all events")) {
            Specification<WeatherReport> spec = (root, query, cb) -> {
                query.orderBy(cb.desc(root.get("timestamp")));
                return cb.equal(cb.lower(root.get("eventType")), eventType.toLowerCase());
            };
            reports = reportRepository.findAll(spec,
                    PageRequest.of(0, 300, Sort.by(Sort.Direction.DESC, "timestamp"))).getContent();
        } else {
            reports = reportRepository.findTop300ByOrderByTimestampDesc();
        }
        return reports.stream().map(DtoMapper::toMapItem).collect(Collectors.toList());
    }

    // ---- Verification ----

    @Transactional
    public WeatherReportResponseDto updateVerificationStatus(Long reportId, String newStatus, String reason) {
        return reportRepository.findById(reportId).map(report -> {
            report.setVerificationStatus(newStatus);
            if (reason != null) report.setVerificationReason(reason);
            if ("duplicate".equals(newStatus)) report.setIsDuplicate(true);
            report.setUpdatedAt(LocalDateTime.now());
            reportRepository.save(report);
            return DtoMapper.toReportResponse(report);
        }).orElse(null);
    }
}
