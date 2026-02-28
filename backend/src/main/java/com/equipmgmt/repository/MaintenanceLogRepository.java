package com.equipmgmt.repository;

import com.equipmgmt.entity.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {

    /**
     * Fetch all maintenance logs for a given equipment, ordered newest first.
     * Parameterized with named parameter — no string concatenation.
     */
    @Query("""
            SELECT m FROM MaintenanceLog m
            WHERE m.equipment.id = :equipmentId
            ORDER BY m.maintenanceDate DESC, m.createdAt DESC
            """)
    List<MaintenanceLog> findByEquipmentIdOrderByMaintenanceDateDesc(
            @Param("equipmentId") Long equipmentId
    );
}
