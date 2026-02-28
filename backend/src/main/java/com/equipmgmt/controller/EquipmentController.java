package com.equipmgmt.controller;

import com.equipmgmt.dto.EquipmentRequestDTO;
import com.equipmgmt.dto.EquipmentResponseDTO;
import com.equipmgmt.dto.PagedResponseDTO;
import com.equipmgmt.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    // -------------------------------------------------------
    // GET /api/equipment
    // Supports: ?search=, ?status=, ?page=, ?size=, ?sortBy=, ?sortDir=
    // -------------------------------------------------------
    @GetMapping
    public ResponseEntity<PagedResponseDTO<EquipmentResponseDTO>> getAll(
            @RequestParam(required = false)              String search,
            @RequestParam(required = false)              String status,
            @RequestParam(defaultValue = "0")            int    page,
            @RequestParam(defaultValue = "10")           int    size,
            @RequestParam(defaultValue = "createdAt")    String sortBy,
            @RequestParam(defaultValue = "desc")         String sortDir
    ) {
        return ResponseEntity.ok(
            equipmentService.getAll(search, status, page, size, sortBy, sortDir)
        );
    }

    // -------------------------------------------------------
    // GET /api/equipment/{id}
    // -------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<EquipmentResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.getById(id));
    }

    // -------------------------------------------------------
    // POST /api/equipment  → 201 Created
    // -------------------------------------------------------
    @PostMapping
    public ResponseEntity<EquipmentResponseDTO> create(
            @Valid @RequestBody EquipmentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(equipmentService.create(dto));
    }

    // -------------------------------------------------------
    // PUT /api/equipment/{id}  → 200 OK
    // -------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<EquipmentResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequestDTO dto) {
        return ResponseEntity.ok(equipmentService.update(id, dto));
    }

    // -------------------------------------------------------
    // DELETE /api/equipment/{id}  → 204 No Content
    // -------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
