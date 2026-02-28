# Equipment Management System
## Screenshots

![Dashboard](Screenshot%202026-02-28%20132237.png)
A full-stack web application to manage equipment and their maintenance lifecycle.

**Stack:** React + shadcn/ui + Tailwind CSS | Spring Boot 3 (Java 17) | PostgreSQL 15

---

## Project Structure

```
equipment-management/          ← monorepo root
├── README.md
├── COMPLIANCE.md
├── docker-compose.yml
├── db/
│   └── schema.sql             ← Full DB schema + seed data
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/equipmgmt/
│       ├── controller/        ← REST controllers (HTTP layer)
│       ├── service/           ← Business logic (rules enforced here)
│       ├── repository/        ← Data access (JPA, parameterized queries)
│       ├── entity/            ← JPA-mapped POJOs
│       ├── dto/               ← Request/Response objects
│       ├── exception/         ← Custom exceptions + global handler
│       └── config/            ← CORS configuration
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── components/
        │   ├── ui/            ← shadcn/ui components
        │   ├── EquipmentTable.jsx
        │   ├── EquipmentForm.jsx   ← Shared Add + Edit form
        │   └── MaintenanceModal.jsx
        ├── pages/
        │   └── EquipmentPage.jsx
        ├── services/
        │   └── api.js         ← Axios API client
        └── App.jsx
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 15+ |
| Docker + Docker Compose | (optional, for Docker setup) |

---

## Option A — Run with Docker (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd equipment-management

# 2. Start everything (DB + Backend + Frontend)
docker-compose up --build

# 3. Open in browser
#    Frontend: http://localhost:3000
#    Backend:  http://localhost:8080
```

To stop:
```bash
docker-compose down
# To also remove the database volume:
docker-compose down -v
```

---

## Option B — Run Manually

### 1. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE equipment_db;"
psql -U postgres -c "CREATE USER admin WITH PASSWORD 'secret';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE equipment_db TO admin;"

# Run the schema (creates tables + seeds equipment types)
psql -U admin -d equipment_db -f db/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies + build
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**

To use a different database URL, edit `src/main/resources/application.properties` or set environment variables:
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/equipment_db
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=secret
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Install shadcn/ui components
npx shadcn-ui@latest init   # choose defaults, select "New York" style
npx shadcn-ui@latest add button input label select textarea table badge dialog

# Start the dev server
npm run dev
```

The frontend starts on **http://localhost:3000**

---

## REST API Reference

### Equipment

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/equipment` | List all equipment (supports `?search=`, `?status=`, `?page=`, `?size=`, `?sortBy=`, `?sortDir=`) |
| GET | `/api/equipment/{id}` | Get single equipment |
| POST | `/api/equipment` | Create equipment |
| PUT | `/api/equipment/{id}` | Update equipment |
| DELETE | `/api/equipment/{id}` | Delete equipment |

### Maintenance

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/maintenance` | Log a maintenance event (auto-updates equipment) |
| GET | `/api/equipment/{id}/maintenance` | Get maintenance history for equipment |

### Equipment Types

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/equipment-types` | Get all equipment types (for dropdown) |

---

## Business Rules

1. **Maintenance Auto-Update (Workflow 1):** When a maintenance log is added, the referenced equipment's `status` is automatically set to `Active` and `lastCleanedDate` is updated to the maintenance date.

2. **30-Day Active Constraint (Workflow 2):** Equipment cannot be set to `Active` if `lastCleanedDate` is older than 30 days. The backend returns HTTP 422 with a descriptive error message displayed in the UI.

---

## Additional Libraries Used

| Library | Purpose | Install |
|---|---|---|
| Lombok | Reduces Java boilerplate | Included in `pom.xml` — `mvn install` handles it |
| shadcn/ui | React UI components | `npx shadcn-ui@latest add ...` (see Frontend Setup) |
| Axios | HTTP client for React | `npm install axios` |
| React Query (TanStack) | Server state management | `npm install @tanstack/react-query` |

---

## Assumptions

- Equipment types are seeded via `db/schema.sql`. No admin UI is provided to manage them (as per the PDF: "You are not required to build a UI to manage equipment types").
- `lastCleanedDate` is optional when creating equipment with `Inactive` or `Under Maintenance` status.
- When status is set to `Active` via maintenance log, the 30-day check is bypassed because the maintenance date itself is the new cleaning date.
- Deleting equipment also deletes all associated maintenance logs (ON DELETE CASCADE).
