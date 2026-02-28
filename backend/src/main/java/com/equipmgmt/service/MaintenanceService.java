package com.equipmgmt.service;

import com.equipmgmt.dto.MaintenanceRequestDTO;
import com.equipmgmt.dto.MaintenanceResponseDTO;
import com.equipmgmt.entity.Equipment;
import com.equipmgmt.entity.MaintenanceLog;
import com.equipmgmt.repository.MaintenanceLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final EquipmentService         equipmentService;

    // -------------------------------------------------------
    // CREATE — Workflow 1
    // -------------------------------------------------------
    /**
     * Logs a maintenance event and atomically:
     *   1. Sets equipment.status  → "Active"
     *   2. Sets equipment.last_cleaned_date → maintenanceDate
     *
     * The @Transactional ensures both the log save and the
     * equipment update either succeed together or roll back.
     */
    @Transactional
    public MaintenanceResponseDTO logMaintenance(MaintenanceRequestDTO dto) {
        // Resolve equipment — throws 404 if not found
        Equipment equipment = equipmentService.findEquipmentOrThrow(dto.getEquipmentId());

        // Save the maintenance log
        MaintenanceLog log = MaintenanceLog.builder()
                .equipment(equipment)
                .maintenanceDate(dto.getMaintenanceDate())
                .notes(dto.getNotes())
                .performedBy(dto.getPerformedBy())
                .build();

        MaintenanceLog saved = maintenanceLogRepository.save(log);

        // Auto-update equipment: status → Active, lastCleanedDate → maintenanceDate
        // Note: this uses a dedicated method that bypasses the 30-day check
        // because the new maintenance date IS the cleaning date (always fresh).
        equipmentService.applyMaintenanceUpdate(equipment, dto.getMaintenanceDate());

        return toResponseDTO(saved);
    }

    // -------------------------------------------------------
    // READ — maintenance history for one equipment
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public List<MaintenanceResponseDTO> getByEquipmentId(Long equipmentId) {
        // Verify equipment exists first — throws 404 if not
        equipmentService.findEquipmentOrThrow(equipmentId);

        return maintenanceLogRepository
                .findByEquipmentIdOrderByMaintenanceDateDesc(equipmentId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // Mapper
    // -------------------------------------------------------
    private MaintenanceResponseDTO toResponseDTO(MaintenanceLog log) {
        return MaintenanceResponseDTO.builder()
                .id(log.getId())
                .equipmentId(log.getEquipment().getId())
                .equipmentName(log.getEquipment().getName())
                .maintenanceDate(log.getMaintenanceDate())
                .notes(log.getNotes())
                .performedBy(log.getPerformedBy())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
