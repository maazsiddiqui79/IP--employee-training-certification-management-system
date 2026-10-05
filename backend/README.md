# ETCMS - Employee Training & Certification Management System Backend

Enterprise-ready Java Spring Boot backend for the **Employee Training & Certification Management System (ETCMS)**.

---

## 🚀 Features

- **Spring Boot 3.3.4 & Java 17+ (Java 25 compatible)**
- **Spring Data JPA & Hibernate ORM**
- **Relational Data Model**:
  - `Designation`
  - `Employee`
  - `AppUser` (`users` table)
  - `UploadedCertificate` (`uploaded_certificates` table with BLOB file storage & base64 support)
  - `AdminAssessment` (`admin_assessments` table with many-to-many assigned employees)
  - `AssessmentResult` (`assessment_results` table with marks, status, and remarks)
  - `ActivityLog` (`activity_logs` table)
- **Automatic Seed Data (`DataLoader.java`)**: Pre-populated with sample employees, designations, certificates, assessments, and users on first run.
- **Dual Database Profiles**:
  - **H2 In-Memory (Default)**: Instant startup, zero installation or database setup needed.
  - **MySQL (Production / Local Server)**: Ready for MySQL 8.x with connection pooling and schema sync.
- **CORS Configured**: Seamless communication with React frontend (`http://localhost:3000`).
- **RESTful Endpoints & Relational Sync**: Individual REST APIs + `/api/data/all` snapshot endpoint for instant synchronization.

---

## 📋 Default Credentials (Pre-seeded)

| Role | Email | Password | Assigned Employee |
|------|-------|----------|-------------------|
| **Admin** | `admin@example.com` | `admin123` | System Administrator |
| **Employee** | `alice@example.com` | `alice123` | Alice Johnson (Software Developer) |
| **Employee** | `bob@example.com` | `bob123` | Bob Smith (QA Engineer) |
| **Employee** | `carol@example.com` | `carol123` | Carol Williams (Project Manager) |
| **Employee** | `david@example.com` | `david123` | David Brown (Business Analyst) |
| **Employee** | `eve@example.com` | `eve123` | Eve Davis (DevOps Engineer) |

---

## 🛠️ How to Run the Backend

### Option 1: In-Memory H2 Database (Recommended for instant testing)

From the `backend` directory, run:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Or with Maven installed globally
mvn spring-boot:run
```

The application starts on: **`http://localhost:8080`**

- **H2 Web Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - JDBC URL: `jdbc:h2:mem:etcmsdb`
  - Username: `sa`
  - Password: *(leave blank)*

---

### Option 2: MySQL Database

1. Ensure MySQL is running on port 3306.
2. In `src/main/resources/application-mysql.properties`, verify your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/etcms_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=root
   ```
3. Run with the `mysql` profile:
   ```bash
   .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

---

## 🧪 Running Tests

To execute the automated JUnit 5 / Spring Boot integration tests:

```bash
.\mvnw.cmd test
```

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user (returns user info, role, employeeId, token)
- `POST /api/auth/logout` - Invalidate session

### 👥 Employees (`/api/employees`)
- `GET /api/employees` - List all employees with designations and user roles
- `GET /api/employees/{id}` - Get employee details
- `POST /api/employees` - Create employee and user credentials
- `PUT /api/employees/{id}` - Update employee and role/password
- `DELETE /api/employees/{id}` - Delete employee and cascade-clean all associated data

### 🏷️ Designations (`/api/designations`)
- `GET /api/designations` - List designations
- `POST /api/designations` - Create a new designation

### 📜 Certificates (`/api/certificates`)
- `GET /api/certificates` - List certificates (optional filter `?employeeId=1&status=PENDING`)
- `GET /api/certificates/{id}` - Get certificate detail
- `POST /api/certificates/upload` - Upload certificate (JSON with base64 file data)
- `POST /api/certificates/upload-file` - Upload certificate with multipart file
- `GET /api/certificates/{id}/download` - Download certificate binary file
- `PUT /api/certificates/{id}/status` - Approve or reject certificate (`APPROVED` / `REJECTED`)
- `DELETE /api/certificates/{id}` - Delete certificate

### 📊 Assessments (`/api/assessments`)
- `GET /api/assessments` - List assessments
- `GET /api/assessments/{id}` - Get assessment detail
- `POST /api/assessments` - Create assessment (auto-initializes `PENDING` results for assigned employees)
- `DELETE /api/assessments/{id}` - Delete assessment and results
- `GET /api/assessments/results` - Get results (`?assessmentId=1` or `?employeeId=1`)
- `PUT /api/assessments/{assessmentId}/results/{employeeId}` - Save/update marks and remarks

### 🕒 Activity Log (`/api/activities`)
- `GET /api/activities` - Recent system audit activities
- `POST /api/activities` - Log a new activity

### 🔄 Data Synchronization (`/api/data`)
- `GET /api/data/all` - Complete relational database snapshot matching React frontend state structure
