package com.equipmgmt.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class EquipmentResponseDTO {

    private Long id;
    private String name;
    private Long typeId;
    private String typeName;
    private String status;
    private LocalDate lastCleanedDate;
    private Instant createdAt;
    private Instant updatedAt;
}
