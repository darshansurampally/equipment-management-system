package com.equipmgmt.service;

import com.equipmgmt.dto.EquipmentTypeResponseDTO;
import com.equipmgmt.repository.EquipmentTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentTypeService {

    private final EquipmentTypeRepository equipmentTypeRepository;

    @Transactional(readOnly = true)
    public List<EquipmentTypeResponseDTO> getAll() {
        return equipmentTypeRepository.findAll()
                .stream()
                .map(t -> EquipmentTypeResponseDTO.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .build())
                .collect(Collectors.toList());
    }
}
