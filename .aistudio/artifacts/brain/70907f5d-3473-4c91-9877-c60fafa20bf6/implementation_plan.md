# Fix Template Studio Toolbar & Expandable Template Name Input

Resolve the layout clipping and overlapping issue in Template Studio on PC and desktop displays by re-architecting the editor toolbar into an elegant, responsive two-tier layout where the template title receives dedicated, unobstructed typing space and action tools are cleanly organized as compact badges.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following layout and ergonomic decisions were confirmed based on your selections:
> - **Two-Tier Toolbar Architecture**: Separates document identification (Template Name, Type, Letterhead toggle) onto the top primary row, and document actions (Save, Copy, Table Tag, Upload, Letterhead Editor, Report Generator) onto a dedicated secondary action bar.
> - **Wide Expandable Template Name Input**: The title field spans the full available width of Tier 1 with clean visual boundaries, providing ample space for long Gujarati titles (e.g. *વાલી મિટિંગ આમંત્રણ પત્ર* or *તાલીમાર્થી અનિયમિતતા ચેતવણી નોટિસ*) without truncation or squeezing.
> - **All Actions Visible as Compact Badges**: Preserves instant 1-click access to all 8 action tools formatted as compact, high-contrast badges with zero clipping or text wrapping.

---

## 1. Overview & Problem Diagnosis

### Root Cause in Current Layout
In `src/components/TemplateStudio.tsx` (lines 1229–1372), the editor header currently attempts to render 11 distinct interactive elements inside a single flex row:
1. `← Templates` back navigation
2. `Name:` input field (`min-w-[160px] sm:min-w-[240px]`)
3. `Notice Type` selector
4. `Letterhead: On/Off` toggle
5. `Save` (primary emerald button)
6. `Save Copy` button
7. `Upload Image` button
8. `+ Custom Table Tag` button
9. `Report Generator` button
10. `Edit Letterhead` button
11. `Print` and `Export PDF` button group

Because the action button cluster uses `shrink-0` with fixed horizontal padding while the left container has `min-w-0 flex-wrap sm:flex-nowrap`, standard PC viewport widths (1024px to 1440px) cause the right action container to physically intrude into the left boundary, rendering the green **Save** button and adjacent tools directly over the **Template Name** input field.

---

## 2. User Experience & Visual Design

### Two-Tier Responsive Toolbar Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TIER 1: TEMPLATE IDENTITY & METADATA BAR (bg-[#185abd] text-white px-4 py-2.5)                         │
│ ┌──────────────┐   ┌───────────────────────────────────────────────────────────────┐  ┌─────────────┐  │
│ │ ← Templates  │ │ │ Name / શીર્ષક: [ તાલીમાર્થી હાજરી પ્રમાણપત્ર ............. ] │  │ Type: [ ▼ ] │  │
│ └──────────────┘   └───────────────────────────────────────────────────────────────┘  └─────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TIER 2: ACTION & TOOLBAR ROW (bg-[#104899] text-white px-4 py-2 flex flex-wrap justify-between)         │
│  [💾 Save Template]  [📋 Save Copy]  [🖼️ Upload Image]  [⊞ + Custom Table Tag]                         │
│                                           [⚡ Report Generator]  [🏛️ Edit Letterhead]  [🖨️] [📥]         │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SUB-BAR: NOTICE SUBJECT & PRINT WORKSPACE CONTROLS (bg-[#f3f6f9] border-b border-slate-300 px-4 py-2)  │
│  Subject: [ Enter official notice subject...                               ]   [Zoom: - 100% +] [📐20mm]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Visual Specifications
- **Tier 1 (Identity Bar - `bg-[#185abd]` / Darker Blue)**:
  - **Back Button**: Crisp `← Templates` link with hover state.
  - **Template Name Input**: Takes `flex-1 min-w-[240px]`, styled with `bg-[#104899] hover:bg-[#0e3f85] focus:bg-[#0c3774] text-white font-bold text-sm px-3.5 py-1.5 rounded-lg border border-blue-400/50 shadow-inner focus:ring-2 focus:ring-white`.
  - **Notice Type**: Select dropdown cleanly positioned alongside the title.
  - **Letterhead Toggle**: Quick On/Off toggle indicating header state.
- **Tier 2 (Action Bar - `bg-[#104899] border-t border-blue-500/30` / Deeper Indigo-Blue)**:
  - **Primary Actions**:
    - `Save`: Emerald button (`bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm`).
    - `Save Copy`: Semi-transparent blue button (`bg-blue-800/80 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg border border-blue-400/30`).
    - `Upload Image`: Dedicated file picker for stamps/logos.
    - `+ Custom Table Tag`: Direct modal trigger for trainee data tables.
  - **Workflow & Output Actions**:
    - `Report Generator`: Amber accent button (`bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg`).
    - `Edit Letterhead`: Gold gradient button (`from-amber-400 to-amber-500`).
    - `Print` & `Download PDF`: Integrated icon buttons.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Two-Tier Separation vs Dropdown Collapse**:
  - *Chosen Approach*: Two explicit tiers with dedicated rows for Identity vs Actions.
  - *Why*: Instructors frequently switch between naming/saving templates and inserting table tags or adjusting letterheads. Hiding primary tools inside a dropdown menu would add unnecessary clicks, while the two-tier layout permanently eliminates overlapping while keeping every action immediately accessible.
- **Decision 2: Expandable Full-Width Name Input**:
  - *Chosen Approach*: `flex-1` width on the title input container with clear labels in both English and Gujarati (*Name / શીર્ષક*).
  - *Why*: ITI notices have long formal titles (e.g., *અભ્યાસક્રમ પૂર્ણતા પ્રમાણપત્ર અને ચારિત્ર્ય સર્ટીફીકેટ*). An expandable input ensures the entire title remains legible without horizontal scroll or truncated text.

---

## 4. Technical Architecture & Component Mapping

### Component Modification Scope
- **File**: `src/components/TemplateStudio.tsx`
  - Refactor lines 1229–1372:
    - Split single parent `<div className="bg-[#185abd] ...">` into:
      1. `<div className="template-identity-bar bg-[#185abd] ...">` (Tier 1: Back, Name input, Notice type, Letterhead toggle).
      2. `<div className="template-action-bar bg-[#104899] ...">` (Tier 2: Save, Save Copy, Upload Image, Custom Table Tag, Report Generator, Edit Letterhead, Print, Export PDF).
  - Ensure all event handlers (`handleSaveCurrentTemplate`, `setIsSaveAsModalOpen`, `handleInsertImageIntoTemplate`, `setIsCustomTableBuilderOpen`, `onUseTemplateForReport`, `setIsHeaderModalOpen`, `handlePrint`, `handleExportPdf`) remain identical and bound with zero regressions.

---

## 5. Verification Plan

1. **Compilation & Lint Verification**:
   - Run `compile_applet` to confirm clean build.
   - Run `lint_applet` (`tsc --noEmit`) to verify zero TypeScript errors.
2. **Browser Layout & Responsive Testing**:
   - Verify on desktop viewport (1024px, 1280px, 1440px, 1920px):
     - Template Name input has ample width and is 100% clickable with no buttons overlapping.
     - Long Gujarati names (*વાલી મિટિંગ આમંત્રણ પત્ર (Parent-Teacher Meeting Notice)*) can be typed and edited comfortably.
     - All 8 action buttons in Tier 2 remain clickable with proper visual feedback.
   - Verify on mobile/tablet viewports to ensure seamless wrapping without horizontal overflow.
