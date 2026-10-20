# Full Interactive Demo Account & Rich Sample Data Plan

Enable all portal facilities in the Demo Account (`guest@itidemo.gov.in`) as an interactive in-session sandbox and enrich the pre-loaded demo dataset so prospective instructors can experience every feature before deciding to register and pay.

## Confirmed User Preferences
1. **Interactive Session Sandbox**: Allow all actions in the Demo Account (adding/editing/deleting/importing trainees, marking/updating attendance, creating/editing templates and letterheads, logging/updating/deleting inward & outward dispatch entries, and managing academic hierarchy/batches/units) in memory during the active session, resetting cleanly on reload without writing to the production Cloud Firestore database.
2. **Comprehensive Pre-loaded Demo Dataset**:
   - **Trainees**: Realistic trainees across multiple trades (`કોપા (COPA)` and `ઇલેક્ટ્રિશિયન (Electrician)`), batches (`84`, `85`), and units (`Unit A`, `Unit B`).
   - **Multi-Month Attendance**: Attendance records across multiple session months (`July 2026`, `August 2026`, `September 2026`) showcasing regular (`≥80%`), low attendance (`<80%` requiring notice), progressive-safe (`<80%` monthly but `≥80%` cumulative), and continuous absence cases.
   - **All Official Templates**: Pre-load 1st Warning Notice, 2nd Strict Warning Notice, Final Show-Cause / Name Removal Notice, Parent Meeting Invitation, and the Principal Monthly Low-Attendance Forwarding Report (`{{Low_Attendance_Table}}`).
   - **Inward & Outward Dispatch Register**: Sample Outward parent notices (Speed Post, RPAD, Hand Delivery) and Inward correspondence (parent medical certificate reply, Principal forwarding report filing).
3. **Minimal Demo Badge UI**: Remove the bulky read-only warning banner and action-blocked modal, and display only a clean, minimal Demo badge in the header.

---

## Proposed Changes

### 1. Enrich Pre-loaded Demo Dataset (`src/data/demoData.ts`)
- **`DEMO_GUEST_INSTRUCTOR`**:
  - Update batches to `'84'` and `'85'` (matching the numeric batch format) across trades `'કોપા (COPA)'` and `'ઇલેક્ટ્રિશિયન (Electrician)'` with `'Unit A'` and `'Unit B'` in `academic_hierarchy`.
  - Update designation and labels to reflect an interactive demo account rather than view-only.
- **`DEMO_SAMPLE_TRAINEES`**:
  - Expand the trainee list to **15 trainees** spanning `કોપા (COPA)` (Batch `84` Unit A & Unit B, Batch `85` Unit A) and `ઇલેક્ટ્રિશિયન (Electrician)` (Batch `84` Unit A) with complete Gujarati/English names, enrollment numbers, parent mobile numbers, and addresses.
- **`DEMO_SAMPLE_ATTENDANCE`**:
  - Provide 3 months of session records (`July 2026`, `August 2026`, `September 2026`) for the demo trainees so month-wise columns (`Jul '26 %`, `Aug '26 %`, `Sep '26 %`), red `<80%` highlights, progressive safe badges, and notice-required filters work immediately out of the box.
- **`DEMO_SAMPLE_TEMPLATES`**:
  - Include all 5 official Gujarati templates:
    1. `પ્રથમ ગેરહાજરી ચેતવણી નોટિસ (1st Warning)`
    2. `દ્વિતીય કડક ચેતવણી નોટિસ (2nd Warning)`
    3. `આખરી કારણદર્શક નોટિસ - નામ કમી કરવા બાબત (Final Notice)`
    4. `વાલી મિટિંગ માટે હાજર રહેવા બાબત (General Notice)`
    5. `આચાર્યશ્રીને માસિક ઓછી હાજરીનો અહેવાલ (Principal Report)` with dynamic `{{Low_Attendance_Table}}`
- **`DEMO_SAMPLE_DISPATCH_LOGS`**:
  - Include 6 realistic Outward and Inward register entries across different statuses (`Dispatched`, `Delivered`, `Acknowledged`, `Printed`) and modes (`Speed Post`, `RPAD`, `Hand Delivery`, `કચેરી ફાઇલિંગ`).

### 2. Enable Full In-Session Operations for Demo Mode (`src/App.tsx`)
- Remove `notifyGuestBlocked(...)` early returns from all handlers (`handleUpdateInstructor`, `handleAddTrainee`, `handleUpdateTrainee`, `handleDeleteTrainee`, `handleBatchDeleteTrainees`, `handleAssignTraineesToUnit`, `handleImportTrainees`, `handleUpdateAttendance`, `handleLogDispatch`, `handleBatchLogDispatch`, `handleUpdateDispatchStatus`, `handleUpdateDispatchLog`, `handleDeleteDispatchLog`, `handleBatchDeleteDispatchLogs`, `handleSaveTemplate`, `handleDeleteTemplate`, `handleUpdateInstructorHeader`).
- In each handler, update React state (`setTrainees`, `setAttendanceRecords`, `setTemplates`, `setDispatchLogs`, `setInstructors`) normally so the Demo user experiences full interactivity, while guarding cloud persistence calls with `if (!isGuest)` so demo actions never touch Firestore or local storage cache.
- Remove the top read-only guest warning banner and the `guestActionBlockedNotice` modal from `src/App.tsx`.

### 3. Unlock Component-Level Controls in Demo Mode
- **`src/components/DispatchHistory.tsx`**:
  - Enable the **Add Entry (`+`)** button, **Status** dropdown, **Edit** button, and **Delete** button for the Demo account so users can test full Inward/Outward register management.
- **`src/components/ReportGenerator.tsx`**:
  - Remove the `if (isGuest)` block inside `logEntriesToRegister` so Demo users can log generated Parent Notices (Outward) and Principal Reports (Inward) directly into the register and see the confirmation toast.
- **`src/components/Header.tsx` & `src/components/InstructorAuth.tsx`**:
  - Update the header badge from `"Guest Demo (View-Only)"` to a clean, minimal `"Demo Mode"` badge.
  - Update the login screen's Instant Demo card copy to highlight that all features (attendance entry, Excel import, template studio, notice generation, and dispatch register) are unlocked for live hands-on testing.
