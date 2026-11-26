package com.nwap.backend.repository;

import com.nwap.backend.entity.WeatherAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeatherAlertRepository extends JpaRepository<WeatherAlert, Long> {

    List<WeatherAlert> findByIsActiveOrderByIssuedAtDesc(boolean isActive);

    @Query("SELECT a FROM WeatherAlert a WHERE a.isActive = :active " +
            "AND (:severity IS NULL OR LOWER(a.severity) = LOWER(:severity)) " +
            "AND (:state IS NULL OR LOWER(a.state) LIKE LOWER(CONCAT('%', :state, '%'))) " +
            "ORDER BY a.issuedAt DESC")
    List<WeatherAlert> findFiltered(@Param("active") boolean active,
                                    @Param("severity") String severity,
                                    @Param("state") String state);

    long countByIsActive(boolean isActive);

    long countByStateAndIsActive(String state, boolean isActive);

    boolean existsByAlertCode(String alertCode);
}
