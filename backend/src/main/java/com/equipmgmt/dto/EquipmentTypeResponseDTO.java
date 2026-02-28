package com.equipmgmt.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EquipmentTypeResponseDTO {

    private Long id;
    private String name;
}
