# Full TinyMCE Letterhead Editor: Replacing Fixed Form Inputs with Freeform WYSIWYG

A complete transformation from rigid letterhead form fields to a 100% flexible TinyMCE rich-text letterhead experience. Instructors will have complete creative freedom to design, layout, format, and align official letterheads without being bound to rigid input forms.

---

## 1. User Intent & Architecture Overview

The user explicitly requested:
> *"instead of using form to get details of the letterhead let's use tinyMCE text editor which gives flexibility to user insted of bind in the fixed format."*
- **Placement**: Both on the A4 canvas above the document body and in a dedicated expansive popup modal.
- **Starting Canvas**: Start with a clean/blank TinyMCE canvas for complete custom design freedom, with optional presets for quick reference.
- **Elimination of Form**: Completely remove the rigid form inputs (`institute_name_gu`, `institute_name_en`, `department_subtitle`, `address`, `contact_info`, fixed border dropdowns, etc.) from the letterhead editing workflow and rely entirely on TinyMCE rich HTML.

---

## 2. Core Architectural Changes

### A. Dedicated TinyMCE Letterhead Modal (`TinyMceLetterheadModal.tsx`)
- Replaces the 860-line `LetterheadEditorModal.tsx` form.
- Provides a distraction-free, full-featured dialog for designing letterheads:
  - Full TinyMCE editor loaded with Table tools, Font Families (Noto Sans Gujarati, Shruti, Arial, etc.), Font Sizes, Colors, Alignment, Logo/Image upload or embedding, Horizontal rules, and Outward/Date tags.
  - Scope Selector: **ગ્લોબલ ડિફોલ્ટ (Global Default)** vs **આ ટેમ્પ્લેટ ખાસ (Template-Specific)**.
  - Quick Actions: **"કોરો લેટરહેડ (Blank Slate)"**, **"પ્રીસેટ પસંદ કરો (Presets)"**, **"ગ્લોબલ સાચવો (Save as Global)"**, and **"સાચવો અને લાગુ કરો (Save & Apply)"**.
  - A4 Live Width Container (`max-w-[820px]`) with real-time print styling.

### B. In-Place A4 Canvas TinyMCE Editor (`TinyMceLetterheadEditor.tsx`)
- Sits seamlessly directly above the notice body on the `#notice-a4-sheet`.
- Added an **"મોટું પોપઅપ ખોલો (Open in Full Modal)"** button in the letterhead toolbar to open the full modal whenever desired.
- Allows immediate inline editing, typing Gujarati/English, adjusting tables, or inserting logos directly on the document sheet.

### C. Deprecation of Rigid Form Schema
- Update `TemplateStudio.tsx`:
  - When clicking the prominent **"લેટરહેડ એડિટ કરો (Edit Letterhead)"** button in the top action bar or canvas badge, open the new `TinyMceLetterheadModal` instead of the old form modal.
  - Save `letterhead_html` as the primary letterhead source of truth on `LetterTemplate` and `Instructor`.
- Update `ReportGenerator.tsx` and Print Modals:
  - Render `letterhead_html` everywhere (Screen preview, A4 Print Modal, Batch Notice Modal, and native Print).

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Create `src/components/WordEditor/TinyMceLetterheadModal.tsx`
- Build a dedicated modal dialog for rich-text letterhead authoring.
- Include TinyMCE with table controls (columns, borders, background colors), image insertion, font styling, merge tags (`{{Ref_No}}`, `{{Current_Date}}`), blank reset, preset selector, and global vs template scope.

### Task 2: Update `src/components/WordEditor/TinyMceLetterheadEditor.tsx`
- Add an "Open in Full Modal" action button to the canvas toolbar.
- Support "Start Blank" action for complete freeform designing.
- Ensure seamless two-way state synchronization between canvas editor and modal editor.

### Task 3: Replace `LetterheadEditorModal` in `src/components/TemplateStudio.tsx`
- Replace imports and usage of the old form-based `LetterheadEditorModal` with `TinyMceLetterheadModal`.
- Wire top bar "લેટરહેડ એડિટ કરો" button to open the TinyMCE modal.
- Ensure saving persists to `template.letterhead_html` and `instructor.letterhead_html` without prompting for form fields.

### Task 4: Clean up and retire `LetterheadEditorModal.tsx`
- Remove unused form logic and legacy code to eliminate any remaining fixed-form binding.

### Task 5: Compilation and Verification
- Run `compile_applet` and `lint_applet` to ensure 0 build errors.
- Test letterhead editing on canvas, in modal, blank slate creation, global saving, and verify print/PDF output.
