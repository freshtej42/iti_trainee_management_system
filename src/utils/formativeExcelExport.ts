import * as XLSX from 'xlsx';
import { FormativeAssessmentSheet, FormativePracticalEntry } from '../types';
import {
  FORMATIVE_SUB_PARAMETERS,
  calculateCategoryTotals,
  calculateLOAverages,
  calculateVerticalTotalsAndAverages,
} from './formativeScoring';

export function exportFormativeAssessmentToExcel(
  sheet: FormativeAssessmentSheet,
  filteredPracticals?: FormativePracticalEntry[]
) {
  const wb = XLSX.utils.book_new();

  // Prepare 2D grid
  const data: (string | number)[][] = [];

  // Title
  data.push(['નમૂનો - ૨ (FAR-1) - Format for Internal Assessment']);
  data.push([]); // blank

  // Header metadata block
  data.push([
    'Name of Trainee:',
    sheet.trainee_name || '-',
    '',
    '',
    'Roll No:',
    sheet.roll_no || '-',
    '',
    '',
    'Year of Enrollment:',
    sheet.session_year || '2026-27',
  ]);

  data.push([
    'Name & Address of ITI:',
    sheet.iti_name || '-',
    '',
    '',
    '',
    '',
    '',
    '',
    'Date of Assessment:',
    sheet.assessment_date || new Date().toLocaleDateString('gu-IN'),
  ]);

  data.push([
    'Name & Address of the Industry:',
    sheet.industry_name || 'Govt. ITI Workshop',
    '',
    '',
    '',
    '',
    '',
    '',
    'Assessment Location:',
    sheet.assessment_location || 'ITI',
  ]);

  data.push([
    'Trade Name:',
    sheet.trade_name || 'COPA',
    '',
    '',
    'Batch No:',
    sheet.batch_no || '84 (A)',
    'Semester:',
    `Semester ${sheet.semester || 1}`,
    'Duration of Trade/course:',
    sheet.duration || (sheet.total_semesters === 4 ? '2 Years' : '1 Year'),
  ]);

  data.push([]); // blank

  // Category Names (Row 7)
  const catRow: (string | number)[] = [
    'Learning Outcome',
    'Practical Skill Number',
    'Safety consciousness',
    '',
    '',
    '',
    'Workplace hygiene & economical use',
    '',
    '',
    '',
    'Attendance/Punctuality',
    '',
    '',
    '',
    'Ability to follow manuals',
    '',
    '',
    '',
    'Application of knowledge',
    '',
    '',
    '',
    'Skills to handle tools & equipment',
    '',
    '',
    '',
    'Speed in doing work',
    '',
    '',
    '',
    'Quality in workmanship',
    '',
    '',
    '',
    'VIVA',
    'TOTAL (કુલ ગુણ)',
  ];
  data.push(catRow);

  // Sub-Parameters Names (Row 8)
  const subRow: (string | number)[] = [
    'LO Number',
    'Practical #',
    'Dress code',
    'Use PPE',
    'Apply safety',
    'TOTAL',
    'Cleanliness',
    'Dispose scrap',
    'Select material',
    'TOTAL',
    'Initiative',
    'Accountability',
    'Participative',
    'TOTAL',
    'Select manual',
    'Search topic',
    'Read/interpret',
    'TOTAL',
    'Plan work',
    'Select tools',
    'Review work',
    'TOTAL',
    'Handle/use',
    'Maintain safety',
    'Care/maintain',
    'TOTAL',
    'Sequence',
    'Technique',
    'Review exec',
    'TOTAL',
    'Accuracy',
    'Conform',
    'Satisfy purpose',
    'TOTAL',
    'Response clarity',
    'TOTAL / 100',
  ];
  data.push(subRow);

  // Maximum Marks (Row 9)
  const maxRow: (string | number)[] = [
    '',
    '',
    2,
    5,
    8,
    15,
    3,
    2,
    5,
    10,
    3,
    3,
    4,
    10,
    1,
    2,
    2,
    5,
    4,
    3,
    3,
    10,
    4,
    3,
    3,
    10,
    3,
    5,
    2,
    10,
    7,
    3,
    5,
    15,
    15,
    100,
  ];
  data.push(maxRow);

  // Column numbers (Row 10)
  const colIndexRow: (string | number)[] = [];
  for (let c = 1; c <= 36; c++) {
    colIndexRow.push(c);
  }
  data.push(colIndexRow);

  // Use filtered practicals if provided, otherwise all sheet practicals
  const practicalsToExport =
    filteredPracticals && filteredPracticals.length > 0 ? filteredPracticals : sheet.practicals;

  // Group practicals by LO
  const loGroups: Record<string, FormativePracticalEntry[]> = {};
  practicalsToExport.forEach((p) => {
    const lo = p.lo_number || 'LO1';
    if (!loGroups[lo]) loGroups[lo] = [];
    loGroups[lo].push(p);
  });

  const loAverages = calculateLOAverages(practicalsToExport);

  // Data rows
  Object.keys(loGroups).forEach((lo) => {
    const groupPracticals = loGroups[lo];

    groupPracticals.forEach((p) => {
      const catTotals = calculateCategoryTotals(p.scores);
      const isCleared = p.is_cleared;

      const row: (string | number)[] = [
        p.lo_number,
        isCleared ? `${p.practical_number} (Left)` : p.practical_number,
        // Safety (3-6)
        isCleared ? 0 : p.scores.safety_dress,
        isCleared ? 0 : p.scores.safety_ppe,
        isCleared ? 0 : p.scores.safety_apply,
        isCleared ? 0 : catTotals.safety_total,
        // Hygiene (7-10)
        isCleared ? 0 : p.scores.hygiene_clean,
        isCleared ? 0 : p.scores.hygiene_scrap,
        isCleared ? 0 : p.scores.hygiene_material,
        isCleared ? 0 : catTotals.hygiene_total,
        // Attendance (11-14)
        isCleared ? 0 : p.scores.attendance_initiative,
        isCleared ? 0 : p.scores.attendance_accountability,
        isCleared ? 0 : p.scores.attendance_participative,
        isCleared ? 0 : catTotals.attendance_total,
        // Manuals (15-18)
        isCleared ? 0 : p.scores.manuals_select,
        isCleared ? 0 : p.scores.manuals_search,
        isCleared ? 0 : p.scores.manuals_interpret,
        isCleared ? 0 : catTotals.manuals_total,
        // Knowledge (19-22)
        isCleared ? 0 : p.scores.knowledge_plan,
        isCleared ? 0 : p.scores.knowledge_tools,
        isCleared ? 0 : p.scores.knowledge_review,
        isCleared ? 0 : catTotals.knowledge_total,
        // Tools (23-26)
        isCleared ? 0 : p.scores.tools_handle,
        isCleared ? 0 : p.scores.tools_safety,
        isCleared ? 0 : p.scores.tools_maintain,
        isCleared ? 0 : catTotals.tools_total,
        // Speed (27-30)
        isCleared ? 0 : p.scores.speed_sequence,
        isCleared ? 0 : p.scores.speed_technique,
        isCleared ? 0 : p.scores.speed_review,
        isCleared ? 0 : catTotals.speed_total,
        // Quality (31-34)
        isCleared ? 0 : p.scores.quality_accuracy,
        isCleared ? 0 : p.scores.quality_conform,
        isCleared ? 0 : p.scores.quality_purpose,
        isCleared ? 0 : catTotals.quality_total,
        // Viva (35)
        isCleared ? 0 : p.scores.viva_clarity,
        // Column 36 (TOTAL / 100)
        isCleared ? 0 : catTotals.grand_total,
      ];
      data.push(row);
    });

    // LO Average row
    const loAvg = loAverages.find((a) => a.lo_number === lo);
    if (loAvg) {
      const avgRow: (string | number)[] = [
        `${lo} Avg`,
        '',
        // Safety
        loAvg.averages.safety_dress,
        loAvg.averages.safety_ppe,
        loAvg.averages.safety_apply,
        loAvg.categoryAverages.safety_avg,
        // Hygiene
        loAvg.averages.hygiene_clean,
        loAvg.averages.hygiene_scrap,
        loAvg.averages.hygiene_material,
        loAvg.categoryAverages.hygiene_avg,
        // Attendance
        loAvg.averages.attendance_initiative,
        loAvg.averages.attendance_accountability,
        loAvg.averages.attendance_participative,
        loAvg.categoryAverages.attendance_avg,
        // Manuals
        loAvg.averages.manuals_select,
        loAvg.averages.manuals_search,
        loAvg.averages.manuals_interpret,
        loAvg.categoryAverages.manuals_avg,
        // Knowledge
        loAvg.averages.knowledge_plan,
        loAvg.averages.knowledge_tools,
        loAvg.averages.knowledge_review,
        loAvg.categoryAverages.knowledge_avg,
        // Tools
        loAvg.averages.tools_handle,
        loAvg.averages.tools_safety,
        loAvg.averages.tools_maintain,
        loAvg.categoryAverages.tools_avg,
        // Speed
        loAvg.averages.speed_sequence,
        loAvg.averages.speed_technique,
        loAvg.averages.speed_review,
        loAvg.categoryAverages.speed_avg,
        // Quality
        loAvg.averages.quality_accuracy,
        loAvg.averages.quality_conform,
        loAvg.averages.quality_purpose,
        loAvg.categoryAverages.quality_avg,
        // Viva
        loAvg.averages.viva_clarity,
        // Column 36 (TOTAL / 100)
        loAvg.categoryAverages.grand_avg,
      ];
      data.push(avgRow);
    }
  });

  // Calculate Vertical Summary (Totals and Averages across all displayed practicals)
  const verticalSummary = calculateVerticalTotalsAndAverages(practicalsToExport);

  // Blank separator before grand summary
  data.push([]);


  // Grand Vertical Average Row (Strictly Whole Numbers)
  const vertAvgRow: (string | number)[] = [
    'AVERAGE (ઊભી સરેરાશ)',
    `(${verticalSummary.activeCount} Practicals)`,
    verticalSummary.averages.subParams.safety_dress,
    verticalSummary.averages.subParams.safety_ppe,
    verticalSummary.averages.subParams.safety_apply,
    verticalSummary.averages.categoryAverages.safety_avg,
    verticalSummary.averages.subParams.hygiene_clean,
    verticalSummary.averages.subParams.hygiene_scrap,
    verticalSummary.averages.subParams.hygiene_material,
    verticalSummary.averages.categoryAverages.hygiene_avg,
    verticalSummary.averages.subParams.attendance_initiative,
    verticalSummary.averages.subParams.attendance_accountability,
    verticalSummary.averages.subParams.attendance_participative,
    verticalSummary.averages.categoryAverages.attendance_avg,
    verticalSummary.averages.subParams.manuals_select,
    verticalSummary.averages.subParams.manuals_search,
    verticalSummary.averages.subParams.manuals_interpret,
    verticalSummary.averages.categoryAverages.manuals_avg,
    verticalSummary.averages.subParams.knowledge_plan,
    verticalSummary.averages.subParams.knowledge_tools,
    verticalSummary.averages.subParams.knowledge_review,
    verticalSummary.averages.categoryAverages.knowledge_avg,
    verticalSummary.averages.subParams.tools_handle,
    verticalSummary.averages.subParams.tools_safety,
    verticalSummary.averages.subParams.tools_maintain,
    verticalSummary.averages.categoryAverages.tools_avg,
    verticalSummary.averages.subParams.speed_sequence,
    verticalSummary.averages.subParams.speed_technique,
    verticalSummary.averages.subParams.speed_review,
    verticalSummary.averages.categoryAverages.speed_avg,
    verticalSummary.averages.subParams.quality_accuracy,
    verticalSummary.averages.subParams.quality_conform,
    verticalSummary.averages.subParams.quality_purpose,
    verticalSummary.averages.categoryAverages.quality_avg,
    verticalSummary.averages.subParams.viva_clarity,
    // Column 36: Average of all LO marks assessed by Instructor
    verticalSummary.averages.categoryAverages.grand_avg,
  ];
  data.push(vertAvgRow);

  data.push([]);
  data.push([
    'Sign of F.I.',
    ...Array(34).fill(''),
    'Supervisor Instructor Sign',
  ]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths (36 columns total)
  const colWidths = [
    { wch: 16 }, // LO / Total
    { wch: 14 }, // Practical #
    // 24 sub-parameters & totals + Viva + Column 36 (TOTAL / 100) = 34 columns
    ...Array(34).fill({ wch: 8 }),
  ];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'FAR-1 Assessment');

  const fileName = `FAR-1_Sem${sheet.semester || 1}_${(sheet.trainee_name || 'Trainee').replace(/[^a-zA-Z0-9]/g, '_')}_Roll_${sheet.roll_no}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

