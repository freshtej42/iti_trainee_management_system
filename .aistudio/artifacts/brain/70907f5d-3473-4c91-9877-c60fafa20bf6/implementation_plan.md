# Custom Table Merge Tag Builder & Reusable Multi-Student Table System

An interactive **Custom Table Merge Tag Studio** that empowers ITI Instructors to design their own custom table layouts with user-defined column headers, populate row cells using any existing student/attendance merge tags (such as `{{Full_Name}}`, `{{Full_Address}}`, `{{Roll_No}}`, `{{Mobile}}`, `{{Attendance_Percentage}}`, or auto-numbered `{{Sr_No}}`), or intentionally leave columns blank (such as "સહી / Remarks / નોંધ") for handwritten entries after printing on A4 paper. Each saved table format automatically registers as a reusable custom merge tag (e.g., `{{Custom_Table:My_Table}}`) that can be inserted into any letter or report for selected or all students.

---

## User Review & Key Product Decisions

### Key Design Decisions
1. **Visual Row-Template Table Designer (`CustomTableBuilderModal.tsx`)**:
   - Instructors can create, edit, duplicate, and delete custom table formats from both the **Report & Notice Generator** and **Template Studio**.
   - Each custom table has:
     - **Table Name & Merge Tag Key**: e.g., Name: *"વાલી મીટિંગ સહી પત્રક"* → Auto-generates tag `{{Custom_Table:Vali_Meeting_Sign}}` (or custom slug).
     - **Dynamic Columns Configuration**: Add, reorder, resize width (`auto`, `%`), align (`left`, `center`, `right`), or remove columns.
     - **Header Label**: Custom Gujarati/English column header (e.g., `ક્રમ`, `તાલીમાર્થીનું નામ અને રોલ નં.`, `સંપૂર્ણ સરનામું`, `વાલીની સહી / નોંધ`).
     - **Row Cell Template**: Each column's data row cell can contain:
       - **Single or Multiple Merge Tags**: Click-to-insert from existing tags (`{{Sr_No}}`, `{{Full_Name}}`, `{{Roll_No}}`, `{{Full_Address}}`, `{{Parent_Mobile}}`, `{{Attendance_Percentage}}`, etc.), allowing rich combinations like `<strong>{{Full_Name}}</strong><br/>(રોલ નં: {{Roll_No}})`.
       - **Blank / Handwritten Entry Mode**: A 1-click toggle *"પ્રિન્ટ બાદ હાથથી લખવા ખાલી રાખો (Leave Blank for Handwritten Entry)"* with configurable minimum row height (e.g., comfortable space for physical signature or remarks on printed paper).

2. **Seamless Integration as First-Class Merge Tags**:
   - Every custom table created by the instructor immediately appears in:
     - **Draggable Fields Palette (`DraggableFieldsPalette.tsx`)** under the **બહુવિધ ટેબલ (Multi-Student)** category with a special *"કસ્ટમ ટેબલ"* badge and quick *"Edit / + New Custom Table"* button.
     - **Template Studio (`TinyMceEditor.tsx`)** variable insertion dropdown.
   - When the tag (e.g., `{{Custom_Table:Vali_Meeting}}`) is placed inside **any** letter template:
     - The merge engine (`mergeTemplateTags` in `src/utils/mergeTags.ts`) iterates over all currently **selected trainees** (or all filtered trainees) and renders a print-ready bordered HTML table where each row is evaluated against that student's merge context.
     - Automatically triggers **Consolidated Single-Page Mode** when a custom table tag is detected in a letter, while still allowing manual mode switching.

3. **Cloud & Local Persistence**:
   - Custom table definitions (`custom_table_templates: CustomTableTemplate[]`) are stored on the `Instructor` profile (persisted to Firestore via `saveInstructorToCloud` and cached in `localStorage`) alongside 2 pre-configured starter custom tables so instructors can test and customize immediately.

---

## Technical Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   Custom Table Merge Tag Studio (Modal)                  │
│  ┌──────────────┬────────────────────────┬────────────────────────────┐  │
│  │ Column 1     │ Column 2               │ Column 3                   │  │
│  │ Header: ક્રમ  │ Header: નામ અને સરનામું │ Header: સહી / હાથથી નોંધ    │  │
│  │ Cell:        │ Cell:                  │ Cell:                      │  │
│  │ {{Sr_No}}    │ {{Full_Name}}          │ [Blank for Handwriting]    │  │
│  │              │ {{Full_Address}}       │ (Min Height: 32px)         │  │
│  └──────────────┴────────────────────────┴────────────────────────────┘  │
│         ▼ Saves as CustomTableTemplate → Tag: {{Custom_Table:ID}}        │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│          DraggableFieldsPalette  &  TinyMCE Template Studio              │
│   Displays {{Custom_Table:...}} chips → Drag/Click into any Letter       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                  mergeTemplateTags() in mergeTags.ts                     │
│   For each {{Custom_Table:ID}} in template:                              │
│     Loops over Selected Trainees (1..N):                                 │
│       Evaluates each column's Cell Template with student's MergeContext  │
│       Outputs crisp A4-bordered HTML <table> with all N student rows     │
└──────────────────────────────────────────────────────────────────────────┘
```

### Files to Create & Modify

1. **`src/types.ts`**:
   - Define `CustomTableColumn`:
     - `id: string`
     - `header: string` (Column title in Gujarati/English)
     - `cell_template: string` (Merge tags like `{{Full_Name}}` or empty string for blank column)
     - `is_blank_for_handwriting?: boolean` (Leaves cell empty with adequate vertical padding for pen writing/signature)
     - `align?: 'left' | 'center' | 'right'`
     - `width?: string`
     - `bold?: boolean`
   - Define `CustomTableTemplate`:
     - `id: string`
     - `name: string` (Display name, e.g., *"વિદ્યાર્થી સરનામા અને સહી પત્રક"*)
     - `tag_key: string` (e.g., `{{Custom_Table:Student_Sign_Sheet}}`)
     - `description?: string`
     - `columns: CustomTableColumn[]`
     - `row_min_height_px?: number` (For comfortable handwriting after print)
     - `created_at: string`
   - Add `custom_table_templates?: CustomTableTemplate[]` to `Instructor`.

2. **`src/utils/mergeTags.ts`**:
   - Add `{{Sr_No}}` (Serial Number `1, 2, 3...`) and `{{Sr_No_Gu}}` (`૧, ૨, ૩...`) row-level tags.
   - Add `DEFAULT_CUSTOM_TABLE_TEMPLATES: CustomTableTemplate[]` so instructors have ready-to-use examples right away.
   - Implement `generateCustomTableHtml(tableDef: CustomTableTemplate, traineesList, baseContext)`:
     - Iterates through `traineesList` (`selectedTrainees` or all trainees).
     - For each student row, resolves all standard merge tags (`{{Full_Name}}`, `{{Full_Address}}`, `{{Roll_No}}`, `{{Mobile}}`, `{{Attendance_Percentage}}`, `{{Sr_No}}`, etc.) inside each column's `cell_template`.
     - If `is_blank_for_handwriting` is true (or `cell_template` is empty), renders `&nbsp;` with minimum height so the printed A4 table row has clean space to write by hand.
   - Update `mergeTemplateTags()` to dynamically replace all `{{Custom_Table:...}}` tags using `context.customTableTemplates`.

3. **`src/components/CustomTableBuilderModal.tsx` (New Component)**:
   - Interactive visual table designer where the instructor:
     - Enters the Table Name (auto-generating the `{{Custom_Table:...}}` tag).
     - Adds/edits/reorders columns with header names.
     - For each column, either clicks merge field chips (`+ {{Full_Name}}`, `+ {{Full_Address}}`, `+ {{Roll_No}}`, `+ {{Parent_Mobile}}`, `+ {{Sr_No}}`, etc.) to build the cell value, OR toggles **"હાથથી લખવા ખાલી કોલમ (Blank for Handwriting/Remarks)"**.
     - Sees a **Live Sample Table Preview** with real student rows right inside the modal before saving.
     - Can click **"Save & Insert Tag into Letter"** to immediately place the new table tag into their active letter.

4. **`src/components/DraggableFieldsPalette.tsx`**:
   - Accept `customTableTemplates?: CustomTableTemplate[]` and `onOpenCustomTableBuilder?: () => void`.
   - Display saved custom table merge tags in the palette and provide a **"+ નવું કસ્ટમ ટેબલ બનાવો (Create Custom Table Tag)"** button.

5. **`src/components/ReportGenerator.tsx` & `src/components/TemplateStudio.tsx` & `src/App.tsx`**:
   - Wire `customTableTemplates` from `instructor.custom_table_templates` (with default presets and Firestore/localStorage persistence).
   - Add **"કસ્ટમ ટેબલ મેકર (Custom Table Tag Builder)"** button in the Report Generator toolbar and Template Studio so instructors can design a custom table and insert its merge tag in one click.
   - Automatically recognize `{{Custom_Table:...}}` in `isTemplateMultiStudent` so any letter containing a custom table tag defaults to single-page consolidated table rendering for all selected students.

---

## Verification Plan
- Create a custom table with columns: `ક્રમ ({{Sr_No}})`, `તાલીમાર્થીનું નામ ({{Full_Name}})`, `સરનામું ({{Full_Address}})`, and `નોંધ / સહી (Blank)`.
- Insert the generated `{{Custom_Table:...}}` tag into any letter template.
- Select multiple students (or all students) in Report Generator and verify that Live Preview and A4 Print/PDF Preview render a single consolidated letter containing the custom table populated with each student's data and blank write-in cells.
- Verify compilation (`compile_applet`) and TypeScript linting (`lint_applet`).
