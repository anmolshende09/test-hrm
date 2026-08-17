# HRMS — Human Resource Management System

A full-stack HRMS built with **React (Vite) + Tailwind CSS** on the frontend and **Node.js/Express + MongoDB (Mongoose)** on the backend. Covers the full HR lifecycle: organization structure, workforce, attendance, recruitment, training, payroll, assets, contracts/documents, and system administration.

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB/Mongoose, JWT + bcrypt auth, Multer (file uploads), express-validator, pdfkit
**Frontend:** React 18 (Vite), Tailwind CSS, React Router, Axios, Lucide icons
**Design system:** Apple-inspired — Action Blue (`#0066cc`) accent, Inter font, pill-radius buttons, hairline borders (no shadows)

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or a connection URI (Atlas, etc.)

### 1. Clone and install
```bash
git clone <repo-url>
cd <repo-name>

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` in `backend/` and fill in real values:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/hrms

# Auth
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:5173
```

The frontend needs its own `.env` (see `frontend/.env.example` if present) with at least:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This **wipes every collection** and repopulates realistic sample data: branches, departments, designations, a full employee reporting hierarchy, attendance, leave, payroll, recruitment pipeline, and lifecycle records (promotions, assets, contracts, awards, calendar events).

### 4. Run the app

```bash
# backend (from backend/)
npm run dev        # nodemon, auto-restart
# or
npm start          # plain node

# frontend (from frontend/, separate terminal)
npm run dev         # Vite dev server, http://localhost:5173
```

---

## Seed Login Credentials

After running `npm run seed`, these accounts are available (from `backend/utils/seeders/core.js`):

| Role | Email | Password | Notes |
|---|---|---|---|
| **Admin** | `admin@hrms.local` | `Admin@123` | Full system access — required for Users, Roles, and Settings |
| **HR Manager** | `hr@hrms.local` | `HRManager@123` | Linked to the seeded "Carol HRMgr" employee record |
| **Employee** | `employee@hrms.local` | `Employee@123` | Linked to the seeded junior engineer employee record — self-service view |

⚠️ These are development-only credentials seeded into a local/dev database. Never seed this data into a production environment, and change `JWT_SECRET` before deploying anywhere real.

---

## Available Scripts

**Backend** (`backend/package.json`):
| Script | Command | Purpose |
|---|---|---|
| `npm start` | `node server.js` | Run the API server (production-style, no auto-restart) |
| `npm run dev` | `nodemon server.js` | Run with auto-restart on file changes |
| `npm run seed` | `node utils/seed.js` | Wipe and reseed the database |

**Frontend** (`frontend/package.json`):
| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Start the Vite dev server |
| `npm run build` | `vite build` | Production build to `dist/` |
| `npm run preview` | `vite preview` | Preview the production build locally |
| `npm run lint` | `eslint .` | Lint the frontend source |

---

## Feature Modules

The sidebar (`frontend/src/layouts/Sidebar.jsx`) is the source of truth for app navigation and scope. Everything below is a mounted, working module unless noted.

| Section | Modules |
|---|---|
| **Overview** | Dashboard (stat cards, charts, widgets), Calendar |
| **Workforce Management** | Employees, Organization Chart, Organization Structure (Branches, Departments, Designations, Holidays, Announcements, Award Types, Document Types), Attendance (Records, Shifts, Policies, Regularizations), Leave Management |
| **Talent & Growth** | Recruitment (Candidates, Interviews, Offers, Job Categories, Job Types), Employee Lifecycle (Promotions, Warnings, Resignations, Terminations), Training & Development (Training Types, Training Programs, Employee Trainings, Training Dashboard) |
| **Finance & Assets** | Payroll Management (Salary Components, Employee Salaries, Payroll Runs, Payslips), Asset Management (Dashboard, Assets, Depreciation, Asset Types) |
| **Document** | Contracts (Contract Types, Employee Contracts, Contract Templates, Document Categories, HR Documents, Document Templates), Media Library |
| **System Control** | System Users (Users, Roles), Currencies, Settings (System, Brand, Email, Working Days, Storage) |

**Known scope notes:**
- **Roles** currently manages a permission catalog and role records only — `User.role` is still a fixed string enum (`admin` / `hr_manager` / `employee`), not yet wired to the dynamic Role system. Route-level `authorize()` checks across the app still use the string enum.
- **Job Postings** and a standalone **Jobs**/**Career Page** module were explicitly out of scope — `Candidate.job` is free text, not a reference to a posting.
- **Document Acknowledgments** (tracking who has read/signed a document) is not built.
- Settings' **Brand** page has Text/Theme tabs visible in the UI with no fields wired up yet (no spec existed for them). **Storage**'s Wasabi tab is similarly a placeholder.

---

## Project Structure

### Backend (`backend/`)

```
backend/
├── config/          # DB connection + Multer upload configs (per-module upload dirs/filters)
├── constants/        # Shared enums: leave types, permission catalog
├── controllers/      # Request handlers — one file per resource
├── middleware/        # JWT auth guard (protect/authorize), global error handler
├── models/           # Mongoose schemas — one file per collection
├── routes/           # Express routers — URL → middleware → controller
├── uploads/           # Persisted uploaded files (gitignored), one subfolder per upload type
├── utils/            # Shared helpers (async wrapper, CSV, iCal, JWT, template merge, seeders)
├── validators/        # express-validator rule sets, paired with each controller
└── server.js          # App bootstrap — middleware, static files, all route mounts
```

**By module** (backend: model → controller → validator → routes, unless noted):

| Module | Files |
|---|---|
| **Auth** | `authController.js`, `authValidator.js`, `authRoutes.js`, `middleware/auth.js` (JWT guard + role check), `utils/generateToken.js` |
| **Dashboard** | `dashboardController.js` (aggregated stats + `hiring-trend`/`payroll-trend` sub-endpoints), `dashboardRoutes.js` |
| **Org Structure** | `Branch`, `Department`, `Designation`, `Holiday`, `Announcement` (+ upload config), `AwardType`, `DocumentType` — each with model/controller/validator/routes |
| **Employees** | `Employee` model (includes `dateOfBirth`, `shift`, `manager` self-ref for org chart), `employeeController.js` (CRUD + CSV import), `config/csvUpload.js` |
| **Attendance** | `Attendance`, `Shift`, `AttendancePolicy`, `AttendanceRegularization` — matrix view, CSV export, regularization approve/reject workflow |
| **Leave** | `LeaveRequest` model/controller/validator/routes — submit, list, approve/reject |
| **Calendar** | `CalendarEvent` model/controller/validator/routes + `utils/ical.js` for `.ics` export |
| **Recruitment** | `Candidate`, `Interview`, `Offer`, `JobCategory`, `JobType` — full ATS pipeline (`applied → screening → interview → offer → hired/rejected`) |
| **Employee Lifecycle** | `Promotion`, `Warning` (no DELETE route — audit integrity), `Resignation`, `Termination` — each with `+config/lifecycleDocumentUpload.js` for supporting docs |
| **Training & Development** | `TrainingType`, `TrainingProgram`, `EmployeeTraining` (+ `config/trainingCertificateUpload.js`), `trainingDashboardController.js` (separate aggregation endpoint) |
| **Payroll** | `SalaryComponent`, `EmployeeSalary`, `PayrollRun` (auto-generates Payslips on run), `Payslip` |
| **Assets** | `AssetType`, `Asset` (straight-line depreciation + maintenance schedule sub-docs) |
| **Contracts & Documents** | `ContractType`, `EmployeeContract` (amendments + renewal tracking), `ContractTemplate` (`{{variable}}` merge → generates a real `EmployeeContract`), `DocumentCategory`, `HRDocument` (+ `config/hrDocumentUpload.js`, approve/publish + download tracking), `DocumentTemplate` (`{{placeholder}}` merge preview only) |
| **Media Library** | `MediaFolder`, `MediaFile` (+ `config/mediaUpload.js`, multi-file upload, live-computed folder counts) |
| **System Users** | `User` model, `userController.js` (admin-only), `Role` model, `roleController.js` (admin-only), `constants/permissionCatalog.js` (309 real permissions across 42 modules — see inline comments for why not 606) |
| **Settings** | `Settings` model (singleton document, one section per page), `settingsController.js`, `config/brandUpload.js` (logo/favicon uploads) |

### Frontend (`frontend/src/`)

```
frontend/src/
├── components/       # Reusable UI, grouped by common/ + one folder per feature module
├── constants/         # Dropdown options, role constants
├── context/           # AuthContext (session/JWT), ToastContext (notifications)
├── hooks/             # useDebounce (search input throttling)
├── layouts/           # DashboardLayout (shell), Sidebar (nav source of truth), Topbar, SettingsLayout
├── pages/             # One file per full page/route
├── routes/            # ProtectedRoute guard
├── services/           # One Axios wrapper file per backend resource
├── utils/             # format.js (dates/currency/initials), download.js, avatar.js, calendarGrid.js
├── App.jsx            # Route tree
└── main.jsx           # Entry point
```

**Common components** (`components/common/`): `Button`, `Modal`, `ConfirmDialog`, `FormField` (Text/TextArea/Select), `Table`, `Pagination`, `SearchBar`, `LoadingSpinner`, `EmptyState`, `StatusBadge`, `StatCard`, `CheckboxMultiSelect`, `Toggle`, `Tabs` — the last two (`Toggle`, `Tabs`) were added specifically for Settings, since nothing like them existed before.

**By module** (frontend: page(s) → components/&lt;module&gt;/ → service):

| Module | Pages | Notes |
|---|---|---|
| **Dashboard** | `Dashboard.jsx` | 8 stat cards, Today's Birthdays, Recent Candidates, Leave Overview (SVG donut), Attendance Last 7 Days, Asset Status, Candidate Pipeline, self-fetching Hiring/Payroll Trend with year selectors, Refresh button |
| **Org Structure** | `Branches`, `Departments`, `Designations`, `Holidays`, `Announcements`, `AwardTypes`, `DocumentTypes` | Standard Table + Modal CRUD pattern used throughout the app |
| **Employees / Org Chart** | `Employees.jsx`, `OrgChart.jsx` | Org chart renders `Employee.manager` self-reference as a tree |
| **Attendance** | `Attendance`, `Shifts`, `AttendancePolicies`, `AttendanceRegularizations` | Matrix view + CSV export |
| **Leave** | `Leaves.jsx` | Approve/reject modal |
| **Recruitment** | `Candidates`, `Interviews`, `Offers`, `JobCategories`, `JobTypes` | |
| **Lifecycle** | `Promotions`, `Warnings`, `Resignations`, `Terminations` | |
| **Training** | `TrainingTypes`, `TrainingPrograms`, `EmployeeTrainings` (+ Assign/Bulk Assign forms), `TrainingDashboard` | |
| **Payroll** | `SalaryComponents`, `EmployeeSalaries`, `PayrollRuns`, `Payslips` | |
| **Assets** | `AssetTypes`, `Assets`, `Depreciation`, `AssetDashboard` | |
| **Contracts/Documents** | `ContractTypes`, `EmployeeContracts` (+ renew/amendment modals), `ContractTemplates` (generates a real contract), `DocumentCategories`, `HRDocuments`, `DocumentTemplates` (merge preview) | |
| **Media Library** | `MediaLibrary.jsx` | Sidebar (folders/quick access/storage) + grid/list toolbar + upload/details modals |
| **System Users** | `Users.jsx`, `Roles.jsx` + `AddRole.jsx` | Add/Edit Role is a full page (breadcrumb + Back), not a modal — the only module that breaks the modal convention, per its own spec |
| **Settings** | `SystemSettings`, `BrandSettings`, `EmailSettings`, `WorkingDaysSettings`, `StorageSettings` | All under `SettingsLayout.jsx` (left nav + `<Outlet>`) |

---

## Architecture Notes

- **Auth:** JWT in `Authorization: Bearer` header, injected via an Axios request interceptor in `services/api.js`. `middleware/auth.js` exports `protect` (valid token required) and `authorize(...roles)` (role check against the literal string enum).
- **File uploads:** Each module with file upload has its own `config/*Upload.js` Multer instance (separate upload directory, file-type filter, size limit) rather than one shared uploader.
- **Singleton pattern:** `Settings` uses a single document (`key: "app_settings"`, upserted) rather than a table — appropriate for app-wide config, not per-record data.
- **Template merge:** `utils/templateMerge.js` implements `{{variable}}` substitution, shared by Contract Templates (generates a real `EmployeeContract`) and Document Templates (returns merged text only, no file/PDF generation).
- **Permission catalog:** `constants/permissionCatalog.js` is deliberately **not** padded to a round number — it contains exactly what's real (309 permissions), with inline notes on every deliberate gap.
