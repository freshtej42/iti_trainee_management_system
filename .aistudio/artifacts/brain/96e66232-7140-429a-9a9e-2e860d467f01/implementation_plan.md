# Configurable Template Letterhead Facility & Complete Footer Removal

Introduce a flexible, per-template letterhead toggle so instructors can decide whether each template includes the official ITI header banner or starts cleanly at the top of the page for pre-printed letterhead paper. Completely remove the default automated bottom footer and signature stamp block across all templates, editors, batch notices, and print modals.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed based on your preferences:

- **Confirmed Decision 1 (Letterhead Facility)**: Letterhead inclusion will be managed per template with an intuitive toggle switch in the editor toolbar, Template Studio, and header settings, and persisted in Firestore and template records (`show_letterhead: boolean`, defaulting to `true` for standard warning letters and customizable per template).
- **Confirmed Decision 2 (Footer Removal)**: The hardcoded bottom signature/stamp overlay box (ITI Seal stamp box + instructor signature lines) is completely removed from templates, A4 canvas, single print previews, batch notice generators, and batch print previews. Templates can contain their own custom sign-off naturally within their document body if desired, with no unwanted forced duplicate footers.
- **Confirmed Decision 3 (Stationery Spacing)**: When letterhead is toggled off, the letter content flows immediately from the standard top margin without unnecessary artificial top whitespace, ensuring clean alignment when printed onto official pre-printed letterhead sheets or plain paper.

---

### 1. Overview & Core Concept

Industrial Training Institutes (ITIs) generate various types of official documents. Some documents (e.g. notices mailed directly to parents or general announcements) require a full printed letterhead banner with logos, department subtitles, and institute address. Other documents (e.g. letters printed onto pre-printed government letterhead stationery, or internal administrative reports) must not print a duplicate header banner. Furthermore, standard government letter bodies often contain their own custom closing or sign-off lines, making a fixed bottom stamp/signature overlay redundant and cluttering.

This upgrade provides:
1. **Per-Template Letterhead Toggle**: An accessible, responsive switch in both the MS Word-style WordEditor and TinyMCE Template Studio that lets users turn the header banner on or off per template, saving the preference directly into the template definition.
2. **Clean Pre-Printed Stationery Support**: When letterhead is disabled, content starts at standard document margins with zero artificial gaps.
3. **Complete Removal of Fixed Footers**: Eradicates the duplicate footer/stamp box across all editor canvases, modals, and PDF/print outputs.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **In Template Studio**:
   - The instructor selects a template from the gallery or creates a new one.
   - In the editor top bar and options bar, an intuitive switch `[🏛️ લેટરહેડ / Letterhead: On/Off]` is visible next to the template name and notice type.
   - Toggling the switch instantly toggles the top letterhead banner in the A4 preview canvas.
   - Clicking "Save" persists `show_letterhead` to Firestore.

2. **In Word Editor (Single Trainee Notice)**:
   - When switching between templates, the editor automatically respects the template's saved `show_letterhead` preference.
   - An instant switch in the ribbon (under Home / Layout) lets the instructor toggle the letterhead for one-off prints.
   - The artificial bottom signature/stamp footer is absent, providing an authentic, distraction-free document layout.

3. **In Batch Notice Generation & Print Previews**:
   - Both single A4 print preview and Batch Notice print preview modal respect each template's letterhead setting.
   - Printing on pre-printed stationery prints just the clean document body with natural margins.

#### Visual Hierarchy & Styling
- **Toggle Control**: Clean, styled toggle button with icon (`Building2`), clear Indic/English dual label ("લેટરહેડ: હા/ના" / "Letterhead: On/Off"), matching the ITI deep blue / slate administrative theme.
- **Canvas Margin Math**:
  - When Letterhead is enabled: Renders the standard double-bordered ITI header banner, followed by document body.
  - When Letterhead is disabled: Header is hidden; body starts smoothly at the page's standard top margin (`pt-8` / `10mm-15mm`).
- **Footer Cleanup**: Bottom stamp frame and duplicate signature lines removed from canvas and `@media print` styles.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Persist `show_letterhead` on `LetterTemplate`**:
  - *Chosen Approach*: Add `show_letterhead: boolean` directly to the `LetterTemplate` interface, in initial seed data, and in Firestore `saveTemplateToCloud`.
  - *Why*: Allows templates tailored for pre-printed letterhead paper to automatically load with the header turned off, while notices destined for plain paper load with the full header.
  - *Alternative Considered*: Only storing a session toggle in the editor. Rejected because instructors would have to re-toggle every time they select a template.

- **Decision 2: Total Removal of Automated Signature/Stamp Footer**:
  - *Chosen Approach*: Remove the forced bottom signature block from `A4Canvas`, `WordEditor`, `TemplateStudio`, `BatchNoticeModal`, and `A4PrintPreviewModal`.
  - *Why*: User explicitly requested that footers are not required and should be removed. Official letters routinely format the signatory (`સુપરવાઈઝર ઇન્સ્ટ્રક્ટર...`) directly within the letter text.
  - *Alternative Considered*: Retaining an optional footer toggle. Rejected per explicit user selection to remove default footer entirely.

- **Decision 3: Zero Extra Top Gap When Letterhead is Off**:
  - *Chosen Approach*: Let standard page margin handle top spacing rather than preserving an empty header box.
  - *Why*: Confirmed by user in clarifying questionnaire. Pre-printed stationery feeds into printers with the top margin aligned to the printable area.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   LetterTemplate                       │
│  - id: string                                          │
│  - template_name: string                               │
│  - content_html: string                                │
│  - header_config?: HeaderConfig                        │
│  - show_letterhead?: boolean  ◄── (New Field)          │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│     TemplateStudio      │         │       WordEditor        │
│ - Header On/Off Switch  │         │ - Header On/Off Toggle  │
│ - TinyMCE Live Canvas   │         │ - Ribbon Toolbar Switch │
│ - [Footer Removed]      │         │ - [Footer Removed]      │
└────────────┬────────────┘         └────────────┬────────────┘
             │                                   │
             └─────────────────┬─────────────────┘
                               ▼
        ┌──────────────────────────────────────────────┐
        │        A4 Canvas & Print Engines             │
        │  - A4Canvas (Interactive & Merged Preview)   │
        │  - A4PrintPreviewModal (Single Export)       │
        │  - BatchNoticePrintPreviewModal (Multi Page) │
        │  - [Footer Overlay Completely Removed]       │
        │  - Responsive Top Margin (No Excess Spacing) │
        └──────────────────────────────────────────────┘
```

#### Files Planned for Updates
1. `src/types.ts`: Add `show_letterhead?: boolean` to `LetterTemplate`.
2. `src/data/initialData.ts`: Update default starter templates to include `show_letterhead: true` (or `false` for reports as appropriate).
3. `src/components/WordEditor/A4Canvas.tsx`:
   - Respect `showLetterhead` prop.
   - Remove bottom signature & ITI seal footer overlay block completely.
   - Adjust top padding when letterhead is disabled.
4. `src/components/WordEditor/WordEditor.tsx`:
   - Initialize and update `showLetterhead` from `currentTemplate.show_letterhead`.
   - Add letterhead toggle in the ribbon and top action bar.
   - Remove `showSignature` state and unused signature controls.
5. `src/components/TemplateStudio.tsx`:
   - Add `show_letterhead` toggle to template editing controls.
   - Persist `show_letterhead` during Save and Save As.
   - Remove bottom signature block from editor canvas and print/PDF views.
6. `src/components/BatchNoticeModal.tsx` & `src/components/BatchNoticePrintPreviewModal.tsx`:
   - Respect `template.show_letterhead`.
   - Remove bottom signature overlay.
7. `firebase-blueprint.json`: Update schema document definitions for `letter_templates`.
