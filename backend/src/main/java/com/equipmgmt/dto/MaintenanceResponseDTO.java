package com.equipmgmt.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class MaintenanceResponseDTO {

    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private LocalDate maintenanceDate;
    private String notes;
    private String performedBy;
    private Instant createdAt;
}
