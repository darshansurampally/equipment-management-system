package com.equipmgmt.controller;

import com.equipmgmt.dto.MaintenanceRequestDTO;
import com.equipmgmt.dto.MaintenanceResponseDTO;
import com.equipmgmt.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    // -------------------------------------------------------
    // POST /api/maintenance  → 201 Created
    // Logs a maintenance event + auto-updates equipment
    // -------------------------------------------------------
    @PostMapping("/maintenance")
    public ResponseEntity<MaintenanceResponseDTO> logMaintenance(
            @Valid @RequestBody MaintenanceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(maintenanceService.logMaintenance(dto));
    }

    // -------------------------------------------------------
    // GET /api/equipment/{id}/maintenance  → 200 OK
    // Returns maintenance history for a specific equipment
    // -------------------------------------------------------
    @GetMapping("/equipment/{id}/maintenance")
    public ResponseEntity<List<MaintenanceResponseDTO>> getMaintenanceHistory(
            @PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getByEquipmentId(id));
    }
}
