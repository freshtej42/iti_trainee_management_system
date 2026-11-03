# Custom Table Dimension Controls & True-Scale A4 Paper Print Preview

Deliver direct drag-to-resize column dividers and row height controls in the Custom Table Builder with natural auto-wrap content expansion, plus a realistic true-to-scale A4 paper print simulation with print margins, page-break indicators, and interactive zoom controls in the Template Studio.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed through interactive clarification and define the implementation strategy:

- **Confirmed Decision 1 (Column Width & Height Adjustment)**: Direct drag-to-resize column divider handles directly on the live table preview in the Custom Table Builder, supplemented by precise numeric inputs and min-height sliders.
- **Confirmed Decision 2 (Print Preview Experience)**: Realistic photorealistic A4 paper sheet simulation with standard official print margins (20mm), page-break boundary indicators, and zoom scale controls (75%, 100%, 125%, Fit-to-screen) in the Template Studio.
- **Confirmed Decision 3 (Cell Overflow Behavior)**: Auto-wrap text with natural vertical row expansion (`word-break: break-word`, `overflow-wrap: anywhere`, `white-space: normal`), preserving the user's minimum height and width while naturally growing to prevent clipped trainee text.

---

## 1. Overview & Core Concept

Industrial Training Institute (ITI) instructors routinely generate formal administrative letters, warning notices, and multi-student attendance rosters. Currently:
1. **Custom Table Formatting Limitation**: Instructors could not adjust individual column widths or row heights visually, and blank columns for handwritten notes after printing lacked customized minimum vertical spacing.
2. **Uncertain Paper Output**: In the template editor, instructors cannot accurately visualize how text, tables, and official letterheads will map to physical A4 paper, leading to accidental page overflows or awkward line wrapping during real printing.

This upgrade empowers instructors to:
- Visually drag column divider lines in real time to allocate column percentages and minimum pixel widths.
- Set a minimum row height so printed documents leave generous physical space for handwriting remarks/signatures, while dynamically expanding row height if long trainee addresses or names require multiple lines.
- Preview letters in a true-to-scale A4 sheet container with visible 20mm print margins, page overflow indicators, and interactive zoom scaling.

---

## 2. User Experience & Visual Design

### A. Custom Table Builder Drag-to-Resize Studio
- **Interactive Drag Dividers**: The live preview table in `CustomTableBuilderModal` features vertical column divider grab handles (`cursor-col-resize`) that highlight with a subtle emerald line (`bg-[#346739]`) on hover and active drag.
- **Live Tooltip & Metric Indicator**: As the user drags, a floating badge displays the live column width (e.g., `28% · min 110px`) with smooth mouse-tracking math.
- **Minimum Row Height Slider**: A dedicated slider (`28px` to `120px`) with preset badges (`Compact 32px`, `Standard 40px`, `Handwriting 56px`, `Signature 72px`) for quick tactile sizing.
- **Auto-Expansion Visualizer**: A test toggle ("Show long text sample") simulates long trainee addresses and notes to demonstrate how the table naturally wraps lines and expands downward while respecting minimum dimensions.

### B. True-Scale A4 Paper Print Simulation (Template Studio)
- **Realistic A4 Sheet Viewport**: The preview canvas is styled as an authentic white A4 sheet (`210mm × 297mm`, calibrated aspect ratio at `1:1.414`) resting on a neutral architectural drafting desk (`bg-slate-200/90`) with soft realistic paper shadow (`shadow-2xl ring-1 ring-slate-300`).
- **Print Margin Boundary Guides**: Subtle hairline dashed lines mark the standard 20mm printable area margins, giving instructors immediate visual confirmation of header and table boundaries without cluttering the print output.
- **Page Overflow & Break Indicator**: If template content exceeds a single A4 page height (approx. `1050px`), a distinct page-divider bar ("--- Page 2 Begins ---") appears, alerting the instructor before they send it to the physical printer.
- **Interactive Zoom Toolbar**: Segmented zoom pill control (`75%`, `100% (1:1)`, `125%`, `Fit Page`) in the top bar using CSS `transform: scale(...)` and `transform-origin: top center` so instructors on any laptop screen can inspect fine print details comfortably.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Table Layout & Sizing Model (CSS Table Algorithm)
- **Chosen Approach**: `table-layout: fixed; width: 100%;` combined with individual column `width: X%` and `min-width: Ypx`, with cells styled as `word-break: break-word; overflow-wrap: anywhere; vertical-align: top;`.
- **Why**: Pure `table-layout: auto` causes columns to jitter unpredictably based on trainee name lengths, ruining column alignment across different pages. Using `table-layout: fixed` with explicit percentages and minimum pixel constraints ensures stable columns while letting HTML `<tr>` height expand naturally downward when text wraps onto multiple lines.
- **Alternatives Considered**: Pure `div` CSS Grid tables were considered, but standard HTML `<table>` elements have superior cross-browser fidelity when printed via `@media print` and exported to PDF via `html2pdf.js` / browser print engines.

### Decision 2: Drag Divider Calculation
- **Chosen Approach**: Normalizes adjacent column percentage widths during mouse drag events (`clientX` delta relative to total table bounding client rect), clamping each column between `5%` and `70%`.
- **Why**: Preserves total table width at exactly 100% so the table never spills past the page margins during resize.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Template Studio / Canvas                        │
├────────────────────────────────────────────────────────────────────────┤
│  Top Action Bar: Zoom Toolbar (75% · 100% · 125% · Fit)                │
│  Mode Switcher: [Rich Editor]  ⇄  [A4 Print Sheet Preview]             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   Realistic A4 Canvas Viewport (Desk Background: #d8dfe6)              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ A4 Paper Container (210mm x 297mm, aspect ratio 1:1.414)     │     │
│   │ [Margin Guides: 20mm dashed hairline boundary]               │     │
│   │                                                              │     │
│   │ • Header / Letterhead Workspace                              │     │
│   │ • Letter Body Prose                                          │     │
│   │ • Dynamic Custom Table:                                      │     │
│   │   ┌────────────┬──────────────────┬────────────────────────┐ │     │
│   │   │ Col 1 (7%) │ Col 2 (30%)      │ Col 3 (63%)            │ │     │
│   │   │ (Sr No)    │ (Trainee Name)   │ (Address & Remarks)    │ │     │
│   │   │ Min: 45px  │ Min: 140px       │ Min: 200px             │ │     │
│   │   └────────────┴──────────────────┴────────────────────────┘ │     │
│   │                                                              │     │
│   │ [- - - - - - Page Break Boundary (approx 1050px) - - - - -]  │     │
│   │ Page 2 Overflow Zone (if content exceeds 1 sheet)            │     │
│   └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Custom Table Builder Modal (Resize Studio)               │
├────────────────────────────────────────────────────────────────────────┤
│  Interactive Preview Grid with Drag Divider Handles (col-resize)       │
│  Slider: Row Minimum Height (28px - 120px)                             │
│  Per-column min-width & width percentage sync                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

1. **`src/types.ts`**:
   - Update `CustomTableColumn`: add optional `min_width_px?: number`.
   - Ensure `CustomTableTemplate.row_min_height_px?: number` is strongly typed.

2. **`src/utils/mergeTags.ts`**:
   - Update `generateCustomTableHtml`:
     - Style `<table>` with `table-layout: fixed; width: 100%; border-collapse: collapse;`.
     - Style `<th>` and `<td>` with `width: ${col.width}; min-width: ${col.min_width_px || 60}px; word-break: break-word; overflow-wrap: anywhere; white-space: normal; vertical-align: top;`.
     - Blank handwriting cells render `<div style="min-height: ${Math.max(22, minHeight - 12)}px;">&nbsp;</div>` to enforce handwriting physical gap.

3. **`src/components/CustomTableBuilderModal.tsx`**:
   - Implement `isDraggingCol` state, `dragColIndex`, and global `mousemove`/`mouseup` listeners.
   - Render vertical draggable divider handles between headers.
   - Provide row height slider with quick preset buttons (`32px`, `42px`, `56px`, `72px`).
   - Add test toggle to preview long content auto-wrapping.

4. **`src/components/TemplateStudio.tsx`**:
   - Add A4 zoom state (`zoomLevel`: `0.75 | 0.9 | 1.0 | 1.25 | 'fit'`).
   - Wrap A4 document in an A4 sheet presentation container with:
     - 20mm margin guide toggle.
     - Dynamic height observer calculating page break thresholds (at multiples of `1050px` / `297mm`).
     - Zoom controller toolbar in preview mode.

---

## 5. Verification & Acceptance Criteria

1. **Column Dragging**: Instructors can grab any column divider line and drag horizontally to resize widths smoothly; percentage values and pixel minimums update live.
2. **Auto-Wrap & Natural Height Growth**: Trainees with long addresses or lengthy text do not get truncated or pushed outside cell borders; the row height automatically grows to fit the content cleanly.
3. **Handwriting Height Preservation**: Blank columns maintain at least the instructor's configured minimum height floor for pen handwriting.
4. **Realistic A4 Paper Preview**: In Template Studio, instructors can zoom in/out, view the exact 20mm print margins, and clearly see if the document fits on 1 page or spills onto a 2nd page before printing.
5. **Compilation & Linting**: Zero TypeScript errors (`tsc --noEmit`), build passes cleanly with `npm run build`.
