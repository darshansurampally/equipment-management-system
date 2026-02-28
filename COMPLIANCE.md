# COMPLIANCE.md — Equipment Management System

This file confirms compliance with all requirements specified in the assignment PDF.

---

## UI Compliance

| Requirement | Status | Notes |
|---|---|---|
| No inline styles (`style={{}}`) | ✅ Compliant | Zero inline style attributes used anywhere in the frontend. All styling via Tailwind utility classes only. |
| No raw HTML form elements (`<input>`, `<select>`, `<button>`) | ✅ Compliant | All form elements use shadcn/ui components: `<Input>`, `<Select>`, `<Button>`, `<Textarea>`, `<Label>` from `@/components/ui/`. |
| Add and Edit reuse the same form component | ✅ Compliant | A single `EquipmentForm.jsx` component is used for both Add and Edit flows, receiving an optional `initialData` prop to pre-populate fields. |

---

## Database Compliance

| Requirement | Status | Notes |
|---|---|---|
| Equipment types are NOT hardcoded in the schema | ✅ Compliant | Equipment types live in a dedicated `equipment_types` table. New types can be added, edited, or removed via SQL or a future admin UI with zero code changes. |
| Types are modifiable without code changes | ✅ Compliant | The `equipment_types` table is seeded with initial values but fully open for modification at the database level. |

---

## Business Rule Compliance

| Rule | Enforced In | Description |
|---|---|---|
| Workflow 1 — Maintenance auto-updates status + last_cleaned_date | `MaintenanceService.java` | Adding a maintenance log atomically sets `equipment.status = 'Active'` and `equipment.last_cleaned_date = maintenanceDate` inside a single `@Transactional` method. |
| Workflow 2 — 30-day Active status constraint | `EquipmentService.java` | `enforceActiveStatusRule()` is called on every create/update. Throws `BusinessRuleException` (HTTP 422) if `lastCleanedDate` is older than 30 days when status = 'Active'. |
| Meaningful error shown in UI | `GlobalExceptionHandler.java` + Frontend | Backend returns structured JSON `{ status, error, message, timestamp }`. Frontend displays the `message` field in a visible error alert. |

---

## Query Safety

| Requirement | Status |
|---|---|
| No raw string concatenation in SQL/JPQL | ✅ Compliant — all queries use JPA named parameters (`:param`) or derived query methods |
| Parameterized queries throughout | ✅ Compliant |

---

## Architecture Compliance

| Requirement | Status |
|---|---|
| Layered architecture (Controller → Service → Repository) | ✅ Compliant |
| Business logic only in Service layer | ✅ Compliant |
| Proper HTTP status codes | ✅ Compliant (201 Created, 204 No Content, 400, 404, 409, 422, 500) |
| Exception handling via @RestControllerAdvice | ✅ Compliant |
