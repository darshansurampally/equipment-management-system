package com.equipmgmt.controller;

import com.equipmgmt.dto.EquipmentTypeResponseDTO;
import com.equipmgmt.service.EquipmentTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/equipment-types")
@RequiredArgsConstructor
public class EquipmentTypeController {

    private final EquipmentTypeService equipmentTypeService;

    // -------------------------------------------------------
    // GET /api/equipment-types  → 200 OK
    // Used by the frontend to populate the Type dropdown
    // -------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<EquipmentTypeResponseDTO>> getAll() {
        return ResponseEntity.ok(equipmentTypeService.getAll());
    }
}
