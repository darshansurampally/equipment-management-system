package com.equipmgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EquipmentRequestDTO {

    @NotBlank(message = "Equipment name is required")
    private String name;

    @NotNull(message = "Equipment type is required")
    private Long typeId;

    @NotBlank(message = "Status is required")
    @Pattern(
        regexp = "Active|Inactive|Under Maintenance",
        message = "Status must be one of: Active, Inactive, Under Maintenance"
    )
    private String status;

    private LocalDate lastCleanedDate;
}
