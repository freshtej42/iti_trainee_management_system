# Execution Checklist

- [ ] Task 1: Create `src/components/WordEditor/TinyMceLetterheadModal.tsx` for full popup editing of letterheads with TinyMCE, tables, image insertion, blank canvas, presets, and scope control.
- [ ] Task 2: Enhance `src/components/WordEditor/TinyMceLetterheadEditor.tsx` with "Open in Full Modal" button and "Start Blank" quick action.
- [ ] Task 3: Replace old `LetterheadEditorModal` in `src/components/TemplateStudio.tsx` with `TinyMceLetterheadModal`.
- [ ] Task 4: Clean up `src/components/LetterheadEditorModal.tsx` or replace its contents with the new TinyMCE modal for backwards compatibility.
- [ ] Task 5: Run `compile_applet` and `lint_applet` to verify clean build with zero errors.
