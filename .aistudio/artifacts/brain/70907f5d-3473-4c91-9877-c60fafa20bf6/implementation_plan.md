# Single-Page Multi-Student Office Forwarding Letter & Address Table

A comprehensive enhancement to the Report Generator and Batch Notice system allowing instructors to generate official forwarding letters and office intimations featuring multiple trainees' names, addresses, and attendance details consolidated in a professional table on a single A4 page.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your clarifications, you need to inform the ITI office or Principal regarding multiple students on a single page, formatted as a multi-row table containing student names, addresses, and relevant details rather than printing separate individual letter pages for each student.

- **Confirmed Decision 1 (Document Scope)**: Consolidated Forwarding Letters and Office Intimation documents will format all selected students into a single multi-row table on one page (or sequential continuous pages if there are 20+ students), eliminating unwanted separate page breaks per student.
- **Confirmed Decision 2 (Table Content & Layout)**: The consolidated table will include Sr. No., Trainee Full Name & Roll Number, Parent Name, Full Postal Address (Village, Taluka, District, Pincode), Mobile Contact, and Attendance / Irregularity Remarks.
- **Recommended Default (Letter Mode Selector)**: In the Report Generator and Batch Notice dialogs, instructors can toggle between **"Individual Notices (1 Page Per Trainee)"** (for dispatching to parents) and **"Consolidated Office Forwarding Letter (Table on Single Document)"** (for intimating the ITI office/Principal).
- **Recommended Default (Pre-configured Forwarding Templates)**: Include official Gujarati forwarding letter templates out-of-the-box (e.g., "કચેરી/આચાર્યશ્રીને તાલીમાર્થીઓની યાદી અને સરનામા સહિત ફોરવર્ડિંગ પત્ર" and "ગેરહાજર તાલીમાર્થીઓની સરનામા પત્રક સહિત રજૂઆત").

---

## 1. Overview & Core Concept

### What It Does
When instructors communicate with the ITI administrative office, Principal, or Apprenticeship branch, they frequently need to report a list of trainees (e.g., continuous absentees, examination eligibility warnings, stipend disqualifications, or address verification rosters). 

Currently, selecting multiple trainees generates individual letter copies, printing each student on a separate page. This new feature introduces a **Consolidated Office Forwarding Letter Mode** that combines all selected trainees into an official forwarding memorandum containing a clean, structured table with their full names, parent details, complete postal addresses, attendance statistics, and action remarks—all fitting on a single page or clean continuous memo.

### Target Audience & Persona
- **ITI Trade Instructors & Supervisors**: Who need to submit official forwarding notes, monthly absent reports, and parent communication records to the ITI office and Principal without wasting dozens of paper sheets.
- **ITI Administrative Staff & Principals**: Who require a single consolidated document listing all affected trainees with verified postal addresses and roll numbers for dispatch or official review.

### Key Value Delivered
- Eliminates redundant single-page generation when reporting multiple trainees to internal offices.
- Produces clean, institutional Gujarati A4 documents formatted with official letterheads, outward references, and structured tabular layouts.
- Gives instructors one-click control over which columns to display (Address, Roll No., Parent Name, Attendance %, Remarks).

---

## 2. User Experience & Visual Design

### Key User Flows

```
[Report Generator / Batch Notices]
               │
               ▼
   [Select Trainees from List] (e.g. 5 students)
               │
               ▼
    [Toggle Document Format Mode]
    ┌──────────────────────────────────────────────┐
    │  ○ Individual Notices (1 Page Per Student)   │
    │  ● Consolidated Office Letter (Single Table) │
    └──────────────────────────────────────────────┘
               │
               ▼
 [Customize Columns & Table Format in Real-Time]
 ┌────────────────────────────────────────────────────────┐
 │ [x] Address  [x] Parent Name  [x] Attendance  [x] Phone │
 └────────────────────────────────────────────────────────┘
               │
               ▼
[Live A4 Single-Page Preview with Official Letterhead]
               │
               ▼
     [Print / Export High-Res A4 PDF]
```

### Visual Identity & Styling
- **Typography**: Clean Gujarati typography using `Noto Sans Gujarati` paired with `Plus Jakarta Sans` for headers and tabular numbers (`tabular-nums`) for roll numbers, dates, and attendance percentages.
- **Palette**: Neutral administrative palette (`slate-900` text, `slate-200` hairline dividers, `slate-50` subtle table header tint, `sky-700` institutional accents).
- **A4 Single-Page Geometry**:
  - Top header: Official ITI letterhead banner or configured text header with Ja. No. (જા.નં.) and Date.
  - Memorandum subject line: Clean bold text with underline/border highlight.
  - Body preamble: Short formal office memorandum paragraph in Gujarati.
  - Consolidated Table: High-density, professional border styling with clear padding:
    - Col 1: ક્રમ (Sr. No.) [5%]
    - Col 2: રોલ નં. (Roll No.) [8%]
    - Col 3: તાલીમાર્થીનું નામ (Trainee Full Name) [24%]
    - Col 4: વાલીનું નામ અને સરનામું (Parent Name & Full Address) [35%]
    - Col 5: સંપર્ક / મો. (Mobile) [12%]
    - Col 6: હાજરી / નોંધ (Attendance % & Remarks) [16%]
  - Closing & Signatures: Signature space for Supervisor Instructor (સુપરવાઇઝર ઇન્સ્ટ્રક્ટર) and endorsement space for Principal (આચાર્યશ્રી).
- **Anti-Slop Discipline**: Zero pill badges inside the printed document; strict hairline borders (`1px solid #334155`); clean, natural Gujarati administrative phrasing.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Dual Mode vs. Separate Page Generator
- **Chosen Approach**: Integrate the **Consolidated Forwarding Mode** directly into the existing `ReportGenerator.tsx` and `BatchNoticeModal.tsx` as a prominent mode selector toggle, rather than creating a disconnected new screen.
- **Why**: Instructors are already accustomed to filtering trainees by Trade, Batch, and Unit in the Report Generator. Seamlessly switching between "Individual Notices" and "Consolidated Office Letter" preserves their mental model and current workflow.
- **Alternatives Considered**: Creating an entirely separate menu item was rejected to avoid feature fragmentation and duplicate trainee filtering logic.

### Decision 2: Dynamic Template Merge Tag `{{Selected_Trainees_Table}}`
- **Chosen Approach**: Introduce a dedicated tag `{{Selected_Trainees_Table}}` and `{{Trainee_Address_Table}}` in the merge tag engine that dynamically compiles the exact subset of *checked/selected* trainees into an institutional HTML table with address columns.
- **Why**: Allows complete customization through the existing Word / TinyMCE letterhead editor, while also working seamlessly in standard templates.
- **Alternatives Considered**: Hardcoded table layout without merge tag flexibility would make it impossible for instructors to adjust letter text or rearrange columns.

### Decision 3: Configurable Table Columns
- **Chosen Approach**: Provide interactive checkboxes in the Report Generator sidebar to toggle table columns on or off (e.g., Include Full Address, Include Mobile, Include Attendance %, Include Absent Dates).
- **Why**: Different office letters require different data points; an address verification letter requires full addresses, whereas an examination warning letter requires attendance percentages.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                    ReportGenerator / View                     │
├───────────────────────────────┬───────────────────────────────┤
│  Trainee Selection & Filter   │ Mode Selector:                │
│  - Trade / Batch / Unit       │ [ Individual Notice (1/pg) ]  │
│  - Multi-select Checkboxes    │ [ Consolidated Letter (Table) ]│
└───────────────┬───────────────┴───────────────┬───────────────┘
                │                               │
                ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  mergeTemplateTags Engine    │ │ Column Configurator          │
│  (src/utils/mergeTags.ts)    │ │ - Address / Village / Taluka │
├──────────────────────────────┤ │ - Parent Name / Mobile       │
│ Generates:                   │ │ - Attendance % / Absent Date │
│ - {{Selected_Trainees_Table}}│ └──────────────┬───────────────┘
│ - {{Trainee_Address_Table}}  │                │
└───────────────┬──────────────┘                │
                └───────────────┬───────────────┘
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                 A4PrintPreviewModal Container                 │
├───────────────────────────────────────────────────────────────┤
│  - Single-Page A4 Sheet Canvas (794px x 1123px)               │
│  - Institutional Letterhead & Outward Dispatch Ref            │
│  - Compact Multi-Row Trainee Address Table                    │
│  - Instructor & Principal Signature Blocks                    │
├───────────────────────────────┬───────────────────────────────┤
│ Action: Clean Print (CSS)     │ Action: High-Res PDF Export   │
└───────────────────────────────┴───────────────────────────────┘
```

### Key Technical Modifications & Additions

1. **`src/utils/mergeTags.ts`**:
   - Enhance `generateTraineeAttendanceTable` to support customizable columns:
     - Full address format (`મુ. [ગામ], તા. [તાલુકો], જિ. [જિલ્લો] - [પિન]`)
     - Parent full name (`[પિતા] [દાદા] [અટક]`)
     - Contact numbers and roll numbers
   - Add new merge tags: `{{Selected_Trainees_Table}}` and `{{Trainee_Address_Table}}`.
   - Update tag replacement so that when rendering in Consolidated mode, `allLowAttendanceTrainees` or `selectedTrainees` directly populates the table based on the user's manual selection.

2. **`src/data/initialData.ts` & `src/data/demoData.ts`**:
   - Add a new built-in template:
     - `tpl-office-forwarding-address`: **કચેરી ફોરવર્ડિંગ પત્ર (વિદ્યાર્થીઓની યાદી અને સરનામા પત્રક)**
     - Preset with formal Gujarati office header, subject line, dynamic multi-trainee address table, and official closing.

3. **`src/components/ReportGenerator.tsx`**:
   - Add **Letter Layout Mode** switch:
     - `individual` (1 Page Per Trainee) vs. `consolidated_table` (All Trainees in 1 Table on Single Page).
   - Add Column Toggle checkboxes for the consolidated table.
   - When in `consolidated_table` mode, render a single consolidated A4 letter view displaying all checked trainees in the table, with single-page print and PDF export.

4. **`src/components/BatchNoticeModal.tsx`**:
   - Add a quick action button: **"કચેરી ફોરવર્ડિંગ પત્ર તરીકે પ્રિન્ટ કરો (Print as Consolidated Office Letter)"** to immediately open the single-page table preview for the checked trainees.

5. **`src/components/A4PrintPreviewModal.tsx` & PDF Export**:
   - Verify that table styling respects A4 printable margins, avoids text clipping, and handles clean printing on both standard printers and mobile PDF engines.

---

## 5. Verification & Testing Plan

1. **Selection & Rendering Verification**:
   - Select 2, 5, or 10 trainees with diverse address lengths in `ReportGenerator`.
   - Switch to "Consolidated Office Letter" mode.
   - Verify that all selected trainees appear in a single table on one A4 preview sheet without triggering multiple pages.
2. **Column Customization Verification**:
   - Toggle "Address", "Parent Name", and "Attendance %" options and confirm the table updates reactively in real time.
3. **Print & PDF Verification**:
   - Trigger browser Print Preview (`Ctrl+P`) and verify single-page A4 output formatting.
   - Click "Save as PDF" and verify generated PDF downloads cleanly with Gujarati fonts rendered crisply.
4. **Build & Lint Verification**:
   - Run `compile_applet` and `lint_applet` to guarantee clean TypeScript compilation and zero runtime errors.
