# Formative Assessment (FAR-1) Implementation Status

## Implemented Enhancements

1. **Strict Whole-Number Rounding (પૂર્ણાંક ગુણ)**:
   - All 24 sub-parameters, 9 category totals, LO averages, and Grand Average scores now use standard mathematical rounding (`Math.round(val)`, where $\ge 0.5$ rounds up and $< 0.5$ rounds down).
   - Zero fractional or decimal numbers appear in any cell, average row, or printout.

2. **Dedicated Curriculum Management Section (Practicals per LO per Semester)**:
   - Added a dedicated **"સેમેસ્ટર પ્રેક્ટિકલ્સ સિલેબસ (LO Master)"** tab.
   - Allows instructors to manage Learning Outcomes (LO1, LO2, etc.) and their practical exercises (e.g., P1 to P7, P33 to P52) for each semester.
   - Instructors can add new practicals with customized titles and codes under any LO, delete practicals, add new LOs, or reset to standard NCVT syllabus defaults.

3. **Engineering (4 Semesters) vs Non-Engineering (2 Semesters) Configuration**:
   - Integrated into **Academic Hierarchy Manager** under Trade details.
   - Instructors can select between **Non-Engineering (2 Semesters / 1 Year)** and **Engineering (4 Semesters / 2 Years)** with automated preset detection (e.g. COPA/Stenographer $\to$ 2 Semesters, Fitter/Electrician/Turner $\to$ 4 Semesters) and interactive toggle badges.
   - Formative Assessment tab provides quick semester navigation tabs: `Sem 1`, `Sem 2` (plus `Sem 3`, `Sem 4` for engineering).

4. **Batch Trainee Marks Entry Roster (૧૦૦ માંથી ગુણ)**:
   - Primary view mode with a complete roster table of all trainees in the batch.
   - Shows Roll No, Gujarati & English Trainee Name, Attendance %, and a direct numeric input for Marks out of 100.
   - Quick mark presets (`70`, `75`, `80`, `82`, `85`, `90`, and `હાજરી મુજબ` based on attendance %).
   - **"તમામ તાલીમાર્થીઓના ગુણ વહેંચો (Distribute All)"**: In 1 click, iterates through all trainees in the batch, reverses their score into the 27 parameters of the active semester's practicals, and persists their individual FAR-1 sheets.
   - Quick export to Excel and Landscape A4 PDF preview/print per student or batch.
