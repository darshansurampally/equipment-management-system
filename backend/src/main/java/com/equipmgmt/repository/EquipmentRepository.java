package com.equipmgmt.repository;

import com.equipmgmt.entity.Equipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    /**
     * Search + filter with native PostgreSQL query.
     * Casting :search and :status explicitly to TEXT fixes the lower(bytea) error.
     */
    @Query(
        value = """
            SELECT * FROM equipment e
            WHERE (:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%')))
              AND (:status IS NULL OR e.status = CAST(:status AS TEXT))
            """,
        countQuery = """
            SELECT COUNT(*) FROM equipment e
            WHERE (:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%')))
              AND (:status IS NULL OR e.status = CAST(:status AS TEXT))
            """,
        nativeQuery = true
    )
    Page<Equipment> findBySearchAndStatus(
            @Param("search") String search,
            @Param("status") String status,
            Pageable pageable
    );
}