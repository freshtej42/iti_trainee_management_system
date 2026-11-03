# Completed: Custom Table Column Width/Height Controls & Realistic A4 Paper Print Simulation

## 1. Custom Table Merge Tag Column Width & Row Height Facility
- **Minimum Row Height & Column Widths**:
  - Instructors can specify custom minimum row heights (`min_row_height_px`) ranging from `24px` to `120px` with presets for `Compact (30px)`, `Standard (38px)`, `Handwriting (54px)`, and `Sign / Remarks (72px)`.
  - Column width controls: numeric percentage widths (`width_percent`) and minimum widths (`min_width_px`) editable per column in the Custom Table Builder.
- **Direct Drag-to-Resize Column Handles**:
  - Live preview table in Step 3 of the Custom Table Builder features interactive draggable column divider handles (`cursor-col-resize`) with live percentage indicator badges.
- **Natural Auto-Wrap & Row Expansion**:
  - Generated table HTML applies `table-layout: fixed; width: 100%; border-collapse: collapse;` with cell styling `word-break: break-word; overflow-wrap: anywhere; white-space: normal; vertical-align: top;`.
  - When trainee data (such as long Gujarati addresses or names) exceeds minimum dimensions, rows automatically expand vertically to accommodate the text without clipping or horizontal blowout.
  - Interactive "ટેસ્ટ મોડ: લાંબા લખાણ સાથે ટેસ્ટ કરો" (Test with Long Content) toggle lets instructors verify auto-wrapping behavior directly inside the builder modal before inserting tags.

## 2. Realistic A4 Paper Print Simulation in Template Studio
- **True A4 Physical Dimensions (210 × 297 mm)**:
  - The document workspace in Template Studio renders on a textured desk canvas with realistic A4 aspect ratio (`210mm` width, `297mm` minimum height) and soft elevation shadow (`shadow-2xl`).
- **Interactive Zoom Toolbar**:
  - Easy zoom controls (`75%`, `90%`, `100%`, `110%`, `125%`, and 1:1 reset) allow instructors to inspect typography and tables comfortably at any screen resolution.
- **20mm Official Printable Margin Guide**:
  - Toggleable visual guide displays the standard 20mm printable margin boundary (`print:hidden`), marking safe printing zones.
- **Dynamic Page 1 Fit & Page 2 Overflow Detector**:
  - Real-time height measurement detects whether letter content and tables fit neatly onto a single A4 sheet (`✓ Fits 1 Page`) or flow over into Page 2 (`⚠️ Page 1 Overflow`).
- **Pristine Print & PDF Export**:
  - `@media print` rules ensure zoom wrappers, margin guides, and status badges are cleanly hidden during physical printing and PDF export, outputting pure official letters.
