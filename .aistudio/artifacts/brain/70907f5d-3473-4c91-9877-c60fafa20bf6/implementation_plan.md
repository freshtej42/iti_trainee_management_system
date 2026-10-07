# Strict Instructor Student Scoping & Isolation

Enforce strict multi-tenant student scoping so that Trade Instructors can only view and manage students assigned to their own Trade, Batch, and Unit hierarchy (or directly enrolled under their instructor ID), while Super Admins retain global visibility across all trades and institutions.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed through user clarification:

- **Confirmed Decision 1 (Ownership Matching Criterion)**: A student is strictly identified as belonging to an instructor by matching the Trade, Batch, and Unit assigned to that instructor in their profile and academic hierarchy (or matching the `instructor_id` foreign key).
- **Confirmed Decision 2 (Super Admin Access)**: The Super Admin role maintains global administrative oversight to view all students across all trades, batches, and ITI institutions.
- **Confirmed Decision 3 (Enrollment & Import Scoping)**: When an instructor enrolls a single trainee or batch imports trainees from Excel/CSV, the system automatically tags those trainees with the instructor's `id`, `iti_name`, and active `trade`, `batch`, and `unit`.
- **Elimination of Leaky Fallbacks**: Remove previous legacy bypasses (e.g., hardcoded instructor ID bypasses and fallback clauses that exposed all trainees when zero trainees were matched). If an instructor has no students yet, they see a clean empty state with an enrollment action.

---

## 1. Overview & Core Concept

- **What It Does**: Establishes strict data boundaries for ITI trade instructors. An instructor teaching COPA in Shankheshwar ITI only sees COPA trainees in that unit. A Fitter or Electrician instructor only sees their respective trainees. Attendance records, low-attendance warnings (<80%), letter generation, and outward dispatch registers are strictly filtered to the instructor's active students.
- **Target Audience / Persona**: ITI Trade Supervisors and Craft Instructors who require isolated class rosters, preventing cross-trade data contamination while enabling full administrative oversight for the Director/Super Admin.
- **Key Value**: Privacy, departmental accountability, and elimination of data clutter. Instructors will never accidentally issue notices or modify attendance for students belonging to another trade or teacher.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Instructor Dashboard Experience**:
   - An instructor logs in (e.g., Pravinbhai Suthar - COPA Trade).
   - The navigation badge, trainee roster, monthly attendance table, and report generator automatically restrict their view to COPA Unit A/B trainees.
   - The header displays their active trade and count of *their* students only (e.g., "12 Registered Trainees in COPA").
   - If an instructor is newly registered and has zero students, an elegant empty state appears: *"તમારા ટ્રેડમાં હજુ સુધી કોઈ તાલીમાર્થી નોંધાયેલ નથી"* with a direct CTA button to *"નવો તાલીમાર્થી ઉમેરો (Enroll Trainee)"* or *"એક્સેલ આયાત (Import Excel)"*.

2. **Trainee Enrollment & Excel Import**:
   - In **Trainee Manager**, the "+ નવો તાલીમાર્થી" modal pre-selects and locks the trainee's trade, batch, and unit to the instructor's configured hierarchy.
   - In **Excel Import**, newly parsed rows are automatically assigned the instructor's `id`, `trade`, and selected batch/unit, preventing orphaned or misassigned records.

3. **Super Admin Experience**:
   - Super Admin (Tejas Suthar / Directorate Admin) logs into the Super Admin console.
   - Has full visibility across all ITI institutes, instructors, trades, and trainees with filtering by institute, trade, and instructor.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Criterion Matching (Trade/Batch/Unit Hierarchy + Instructor ID)**:
  - *Chosen Approach*: Match trainee `t` if `t.instructor_id === instructor.id` OR if `t.trade` belongs to the instructor's allowed trades (`trades` list or `trade`), and matches the instructor's batch and unit hierarchy.
  - *Why*: Accommodates both legacy trainees (who may have been created with trade matching) and newly imported trainees who have explicit `instructor_id` links.
  - *Trade-off*: Prevents cross-trade visibility even if an instructor switches views, while preserving academic hierarchy integrity.

- **Decision 2: Strict Exclusion of Leaky Fallbacks**:
  - *Chosen Approach*: If `instructorTrainees` returns an empty array, it stays empty. The previous `if (list.length === 0) return trainees;` fallback is removed entirely.
  - *Why*: The fallback was the direct cause of instructors seeing all students in the database.

- **Decision 3: Downstream Scoping Propagation**:
  - *Chosen Approach*: Feed `instructorTrainees` into all downstream components (`AttendanceTracker`, `ReportGenerator`, `TemplateStudio`, `DispatchHistory`, and `lowAttendanceCount`).
  - *Why*: Guarantees that attendance calculations, <80% warning badges, mail-merge previews, and dispatch history records reflect only the instructor's own students.

---

## 4. Technical Architecture & Data Strategy

### Scoping Architecture & Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Database (All Trainees)                       │
│    COPA Trainees │ Fitter Trainees │ Electrician Trainees │ Welder     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx Scoping Gate                            │
│                                                                        │
│  isSuperAdmin ? ──> ALL Trainees                                       │
│                                                                        │
│  Regular Instructor ? ──> Filter by:                                   │
│    (t.instructor_id === instructor.id) OR                              │
│    (allowedTrades.has(t.trade) && allowedUnits.has(t.unit))            │
│    NO FALLBACK TO ALL TRAINEES!                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Scoped instructorTrainees                      │
└───────────────┬───────────────────┬───────────────────┬────────────────┘
                │                   │                   │
                ▼                   ▼                   ▼
    ┌───────────────────────┐ ┌───────────┐ ┌───────────────────────┐
    │    TraineeManager     │ │Attendance │ │    ReportGenerator    │
    │  • Roster & Units     │ │ • Monthly │ │  • Mail-Merge Notices │
    │  • Scoped Add/Import  │ │ • Low %   │ │  • Scoped Registers   │
    └───────────────────────┘ └───────────┘ └───────────────────────┘
```

### Key Implementation Steps

1. **`App.tsx` Filter Logic Refactoring**:
   - Refactor `instructorTrainees` `useMemo` to remove hardcoded ID bypasses (`'inst-shankheshwar'`, `'inst-tejas'`) and the `return trainees;` fallback.
   - Compute `allowedTrades`, `allowedBatches`, and `allowedUnits` from `currentInstructor.academic_hierarchy`, `currentInstructor.trades`, and `currentInstructor.units`.
   - Filter `trainees` strictly to matching records.
2. **Dispatch History Scoping**:
   - Pass `instructorTrainees` into `DispatchHistory.tsx` and ensure `scopedLogs` defaults to the instructor's trade/trainees (`scopeFilter: 'my_trade'`) for non-super-admins.
3. **Attendance Calculation Scoping**:
   - Ensure `lowAttendanceCount` only checks attendance records whose `trainee_id` exists in `instructorTrainees`.
4. **Excel Import & Enrollment Enforcement**:
   - Verify that adding a new trainee or importing via Excel in `TraineeManager` / `TraineeImportModal` tags each record with `instructor.id`, `instructor.trade`, and active unit.
5. **Testing & Verification**:
   - Test login with different instructors (COPA, Fitter, Electrician) and verify that each only sees their respective students.
   - Test Super Admin login and verify global system access.
   - Run `lint_applet` and `compile_applet`.
