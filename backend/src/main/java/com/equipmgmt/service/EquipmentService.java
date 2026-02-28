package com.equipmgmt.service;

import com.equipmgmt.dto.EquipmentRequestDTO;
import com.equipmgmt.dto.EquipmentResponseDTO;
import com.equipmgmt.dto.PagedResponseDTO;
import com.equipmgmt.entity.Equipment;
import com.equipmgmt.entity.EquipmentType;
import com.equipmgmt.exception.BusinessRuleException;
import com.equipmgmt.exception.ResourceNotFoundException;
import com.equipmgmt.repository.EquipmentRepository;
import com.equipmgmt.repository.EquipmentTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.JpaSort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private static final String STATUS_ACTIVE           = "Active";
    private static final int    MAX_DAYS_SINCE_CLEANING = 30;

    private final EquipmentRepository     equipmentRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;

    // -------------------------------------------------------
    // READ — paginated, filterable, searchable, sortable
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public PagedResponseDTO<EquipmentResponseDTO> getAll(
            String search, String status,
            int page, int size,
            String sortBy, String sortDir) {

        // Map Java field names to database column names for native query sorting
        String dbColumn = mapFieldToColumn(sortBy);
        
        // Use JpaSort.unsafe() to pass column name directly for native queries
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? JpaSort.unsafe(Sort.Direction.DESC, dbColumn)
                : JpaSort.unsafe(Sort.Direction.ASC, dbColumn);

        Pageable pageable = PageRequest.of(page, size, sort);

        // Use null to mean "no filter" — the JPQL handles both cases
        String searchParam = (search == null || search.isBlank()) ? null : search.trim();
        String statusParam = (status == null || status.isBlank()) ? null : status.trim();

        Page<Equipment> resultPage = equipmentRepository.findBySearchAndStatus(
                searchParam, statusParam, pageable);

        List<EquipmentResponseDTO> content = resultPage.getContent()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());

        return PagedResponseDTO.<EquipmentResponseDTO>builder()
                .content(content)
                .page(resultPage.getNumber())
                .size(resultPage.getSize())
                .totalElements(resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .last(resultPage.isLast())
                .build();
    }

    // -------------------------------------------------------
    // READ ONE
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public EquipmentResponseDTO getById(Long id) {
        Equipment equipment = findEquipmentOrThrow(id);
        return toResponseDTO(equipment);
    }

    // -------------------------------------------------------
    // CREATE
    // -------------------------------------------------------
    @Transactional
    public EquipmentResponseDTO create(EquipmentRequestDTO dto) {
        EquipmentType type = findTypeOrThrow(dto.getTypeId());

        // Business Rule: enforce 30-day constraint before persisting
        enforceActiveStatusRule(dto.getStatus(), dto.getLastCleanedDate());

        Equipment equipment = Equipment.builder()
                .name(dto.getName())
                .type(type)
                .status(dto.getStatus())
                .lastCleanedDate(dto.getLastCleanedDate())
                .build();

        return toResponseDTO(equipmentRepository.save(equipment));
    }

    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------
    @Transactional
    public EquipmentResponseDTO update(Long id, EquipmentRequestDTO dto) {
        Equipment equipment = findEquipmentOrThrow(id);
        EquipmentType type  = findTypeOrThrow(dto.getTypeId());

        // Business Rule: enforce 30-day constraint before persisting
        enforceActiveStatusRule(dto.getStatus(), dto.getLastCleanedDate());

        equipment.setName(dto.getName());
        equipment.setType(type);
        equipment.setStatus(dto.getStatus());
        equipment.setLastCleanedDate(dto.getLastCleanedDate());

        return toResponseDTO(equipmentRepository.save(equipment));
    }

    // -------------------------------------------------------
    // DELETE
    // -------------------------------------------------------
    @Transactional
    public void delete(Long id) {
        Equipment equipment = findEquipmentOrThrow(id);
        equipmentRepository.delete(equipment);
        // Maintenance logs are removed by ON DELETE CASCADE in the DB
    }

    // -------------------------------------------------------
    // Internal helper — used by MaintenanceService to bypass
    // the 30-day check when a fresh maintenance record sets
    // last_cleaned_date to today.
    // -------------------------------------------------------
    @Transactional
    public void applyMaintenanceUpdate(Equipment equipment, LocalDate maintenanceDate) {
        equipment.setStatus(STATUS_ACTIVE);
        equipment.setLastCleanedDate(maintenanceDate);
        equipmentRepository.save(equipment);
    }

    // -------------------------------------------------------
    // Business Rule: Status Constraint (Workflow 2)
    // Equipment cannot be set to "Active" if last cleaned date
    // is more than 30 days ago.
    // -------------------------------------------------------
    private void enforceActiveStatusRule(String status, LocalDate lastCleanedDate) {
        if (!STATUS_ACTIVE.equals(status)) {
            return; // rule only applies when setting to Active
        }
        if (lastCleanedDate == null) {
            throw new BusinessRuleException(
                "Cannot set status to 'Active': Last Cleaned Date is required when activating equipment.");
        }
        long daysSince = ChronoUnit.DAYS.between(lastCleanedDate, LocalDate.now());
        if (daysSince > MAX_DAYS_SINCE_CLEANING) {
            throw new BusinessRuleException(
                "Cannot set status to 'Active': Last Cleaned Date is " + daysSince +
                " days ago. Equipment must have been cleaned within the last " +
                MAX_DAYS_SINCE_CLEANING + " days to be marked Active.");
        }
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------
    
    /**
     * Maps Java field names to database column names for native query sorting.
     * This is needed because native queries don't auto-translate camelCase to snake_case.
     */
    private String mapFieldToColumn(String fieldName) {
        return switch (fieldName) {
            case "createdAt" -> "created_at";
            case "updatedAt" -> "updated_at";
            case "lastCleanedDate" -> "last_cleaned_date";
            case "typeId" -> "type_id";
            default -> fieldName; // name, status, id already match
        };
    }
    
    Equipment findEquipmentOrThrow(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", id));
    }

    private EquipmentType findTypeOrThrow(Long typeId) {
        return equipmentTypeRepository.findById(typeId)
                .orElseThrow(() -> new ResourceNotFoundException("EquipmentType", typeId));
    }

    public EquipmentResponseDTO toResponseDTO(Equipment e) {
        return EquipmentResponseDTO.builder()
                .id(e.getId())
                .name(e.getName())
                .typeId(e.getType().getId())
                .typeName(e.getType().getName())
                .status(e.getStatus())
                .lastCleanedDate(e.getLastCleanedDate())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
