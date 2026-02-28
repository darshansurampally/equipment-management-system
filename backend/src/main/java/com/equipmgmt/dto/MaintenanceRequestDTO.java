package com.equipmgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MaintenanceRequestDTO {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Maintenance date is required")
    private LocalDate maintenanceDate;

    private String notes;

    @NotBlank(message = "Performed by is required")
    private String performedBy;
}
