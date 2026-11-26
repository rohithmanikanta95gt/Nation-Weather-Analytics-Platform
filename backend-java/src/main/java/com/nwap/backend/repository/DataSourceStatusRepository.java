package com.nwap.backend.repository;

import com.nwap.backend.entity.DataSourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DataSourceStatusRepository extends JpaRepository<DataSourceStatus, Long> {

    Optional<DataSourceStatus> findBySource(String source);
}
