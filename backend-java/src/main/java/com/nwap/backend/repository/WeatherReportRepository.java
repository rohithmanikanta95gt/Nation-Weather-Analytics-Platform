package com.nwap.backend.repository;

import com.nwap.backend.entity.WeatherReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WeatherReportRepository extends JpaRepository<WeatherReport, Long>,
        JpaSpecificationExecutor<WeatherReport> {

    long countByVerificationStatus(String status);

    long countByIsDuplicate(boolean isDuplicate);

    @Query("SELECT COUNT(r) FROM WeatherReport r WHERE r.createdAt >= :start")
    long countByCreatedAtAfter(@Param("start") LocalDateTime start);

    @Query("SELECT COUNT(r) FROM WeatherReport r WHERE r.verificationStatus = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT r.eventType, COUNT(r) as cnt FROM WeatherReport r GROUP BY r.eventType ORDER BY COUNT(r) DESC")
    List<Object[]> countGroupByEventType();

    @Query("SELECT r.state, COUNT(r) as total, " +
            "SUM(CASE WHEN r.eventType = 'flood' THEN 1 ELSE 0 END) as floodCount " +
            "FROM WeatherReport r GROUP BY r.state ORDER BY COUNT(r) DESC")
    List<Object[]> countGroupByState();

    @Query("SELECT COUNT(r) FROM WeatherReport r WHERE r.timestamp >= :start AND r.timestamp <= :end")
    long countByTimestampBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(r) FROM WeatherReport r WHERE r.timestamp >= :start AND r.timestamp <= :end AND r.verificationStatus = :status")
    long countByTimestampBetweenAndStatus(@Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end,
                                          @Param("status") String status);

    @Query("SELECT r FROM WeatherReport r WHERE r.createdAt >= :cutoff ORDER BY r.createdAt DESC")
    List<WeatherReport> findRecentReports(@Param("cutoff") LocalDateTime cutoff);

    List<WeatherReport> findTop300ByOrderByTimestampDesc();
}
