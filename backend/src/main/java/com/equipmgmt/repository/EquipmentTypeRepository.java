package com.equipmgmt.repository;

import com.equipmgmt.entity.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentTypeRepository extends JpaRepository<EquipmentType, Long> {
    boolean existsByNameIgnoreCase(String name);
}
