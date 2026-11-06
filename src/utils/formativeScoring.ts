import {
  FormativeScores,
  FormativeScoreKey,
  FormativeCategoryTotals,
  FormativePracticalEntry,
  SemesterCurriculum,
  PracticalCurriculumItem,
  LOCurriculumItem,
} from '../types';

export interface FormativeSubParamDef {
  key: FormativeScoreKey;
  colIndex: number;
  categoryIndex: number;
  categoryName: string;
  categoryNameGu: string;
  subParamName: string;
  subParamNameGu: string;
  maxMarks: number;
}

export interface FormativeCategoryDef {
  index: number;
  name: string;
  nameGu: string;
  totalColIndex: number;
  maxMarks: number;
  subParamKeys: FormativeScoreKey[];
}

export const FORMATIVE_CATEGORIES: FormativeCategoryDef[] = [
  {
    index: 1,
    name: 'Safety consciousness',
    nameGu: 'સલામતી જાગૃતિ',
    totalColIndex: 6,
    maxMarks: 15,
    subParamKeys: ['safety_dress', 'safety_ppe', 'safety_apply'],
  },
  {
    index: 2,
    name: 'Workplace hygiene & economical use of materials',
    nameGu: 'કાર્યસ્થળ સ્વચ્છતા અને કરકસર',
    totalColIndex: 10,
    maxMarks: 10,
    subParamKeys: ['hygiene_clean', 'hygiene_scrap', 'hygiene_material'],
  },
  {
    index: 3,
    name: 'Attendance/Punctuality',
    nameGu: 'હાજરી / સમયપાલન',
    totalColIndex: 14,
    maxMarks: 10,
    subParamKeys: ['attendance_initiative', 'attendance_accountability', 'attendance_participative'],
  },
  {
    index: 4,
    name: 'Ability to follow manuals',
    nameGu: 'મેન્યુઅલ અનુસરવાની ક્ષમતા',
    totalColIndex: 18,
    maxMarks: 5,
    subParamKeys: ['manuals_select', 'manuals_search', 'manuals_interpret'],
  },
  {
    index: 5,
    name: 'Application of knowledge',
    nameGu: 'જ્ઞાનનો વ્યવહારિક ઉપયોગ',
    totalColIndex: 22,
    maxMarks: 10,
    subParamKeys: ['knowledge_plan', 'knowledge_tools', 'knowledge_review'],
  },
  {
    index: 6,
    name: 'Skills to handle tools & equipment',
    nameGu: 'સાધનો અને ઉપકરણો વાપરવાની કુશળતા',
    totalColIndex: 26,
    maxMarks: 10,
    subParamKeys: ['tools_handle', 'tools_safety', 'tools_maintain'],
  },
  {
    index: 7,
    name: 'Speed in doing work',
    nameGu: 'કાર્ય પૂર્ણ કરવાની ઝડપ',
    totalColIndex: 30,
    maxMarks: 10,
    subParamKeys: ['speed_sequence', 'speed_technique', 'speed_review'],
  },
  {
    index: 8,
    name: 'Quality in workmanship',
    nameGu: 'કાર્યકારી ગુણવત્તા',
    totalColIndex: 34,
    maxMarks: 15,
    subParamKeys: ['quality_accuracy', 'quality_conform', 'quality_purpose'],
  },
  {
    index: 9,
    name: 'VIVA',
    nameGu: 'રૂબરૂ પ્રશ્નોત્તરી (વાઈવા)',
    totalColIndex: 35,
    maxMarks: 15,
    subParamKeys: ['viva_clarity'],
  },
];

export const FORMATIVE_SUB_PARAMETERS: FormativeSubParamDef[] = [
  // 1. Safety consciousness (15)
  {
    key: 'safety_dress',
    colIndex: 3,
    categoryIndex: 1,
    categoryName: 'Safety consciousness',
    categoryNameGu: 'સલામતી જાગૃતિ',
    subParamName: 'Dress code',
    subParamNameGu: 'ડ્રેસ કોડ',
    maxMarks: 2,
  },
  {
    key: 'safety_ppe',
    colIndex: 4,
    categoryIndex: 1,
    categoryName: 'Safety consciousness',
    categoryNameGu: 'સલામતી જાગૃતિ',
    subParamName: 'Use PPE',
    subParamNameGu: 'PPE નો ઉપયોગ',
    maxMarks: 5,
  },
  {
    key: 'safety_apply',
    colIndex: 5,
    categoryIndex: 1,
    categoryName: 'Safety consciousness',
    categoryNameGu: 'સલામતી જાગૃતિ',
    subParamName: 'Apply/practice safety',
    subParamNameGu: 'સુરક્ષા નિયમોનો અમલ',
    maxMarks: 8,
  },

  // 2. Workplace hygiene (10)
  {
    key: 'hygiene_clean',
    colIndex: 7,
    categoryIndex: 2,
    categoryName: 'Workplace hygiene & economical use of materials',
    categoryNameGu: 'કાર્યસ્થળ સ્વચ્છતા અને કરકસર',
    subParamName: 'Cleanliness',
    subParamNameGu: 'સ્વચ્છતા',
    maxMarks: 3,
  },
  {
    key: 'hygiene_scrap',
    colIndex: 8,
    categoryIndex: 2,
    categoryName: 'Workplace hygiene & economical use of materials',
    categoryNameGu: 'કાર્યસ્થળ સ્વચ્છતા અને કરકસર',
    subParamName: 'Dispose scrap',
    subParamNameGu: 'સ્ક્રેપ નિકાલ',
    maxMarks: 2,
  },
  {
    key: 'hygiene_material',
    colIndex: 9,
    categoryIndex: 2,
    categoryName: 'Workplace hygiene & economical use of materials',
    categoryNameGu: 'કાર્યસ્થળ સ્વચ્છતા અને કરકસર',
    subParamName: 'Select material',
    subParamNameGu: 'સામગ્રી પસંદગી',
    maxMarks: 5,
  },

  // 3. Attendance/Punctuality (10)
  {
    key: 'attendance_initiative',
    colIndex: 11,
    categoryIndex: 3,
    categoryName: 'Attendance/Punctuality',
    categoryNameGu: 'હાજરી / સમયપાલન',
    subParamName: 'Initiative',
    subParamNameGu: 'પહેલ વૃત્તિ',
    maxMarks: 3,
  },
  {
    key: 'attendance_accountability',
    colIndex: 12,
    categoryIndex: 3,
    categoryName: 'Attendance/Punctuality',
    categoryNameGu: 'હાજરી / સમયપાલન',
    subParamName: 'Accountability',
    subParamNameGu: 'જવાબદારી',
    maxMarks: 3,
  },
  {
    key: 'attendance_participative',
    colIndex: 13,
    categoryIndex: 3,
    categoryName: 'Attendance/Punctuality',
    categoryNameGu: 'હાજરી / સમયપાલન',
    subParamName: 'Participative',
    subParamNameGu: 'સક્રિય સહભાગિતા',
    maxMarks: 4,
  },

  // 4. Ability to follow manuals (5)
  {
    key: 'manuals_select',
    colIndex: 15,
    categoryIndex: 4,
    categoryName: 'Ability to follow manuals',
    categoryNameGu: 'મેન્યુઅલ અનુસરવાની ક્ષમતા',
    subParamName: 'Select manual',
    subParamNameGu: 'યોગ્ય મેન્યુઅલ પસંદગી',
    maxMarks: 1,
  },
  {
    key: 'manuals_search',
    colIndex: 16,
    categoryIndex: 4,
    categoryName: 'Ability to follow manuals',
    categoryNameGu: 'મેન્યુઅલ અનુસરવાની ક્ષમતા',
    subParamName: 'Search topic',
    subParamNameGu: 'ટોપિક શોધવાની આવડત',
    maxMarks: 2,
  },
  {
    key: 'manuals_interpret',
    colIndex: 17,
    categoryIndex: 4,
    categoryName: 'Ability to follow manuals',
    categoryNameGu: 'મેન્યુઅલ અનુસરવાની ક્ષમતા',
    subParamName: 'Read/interpret',
    subParamNameGu: 'સમજીને અમલ કરવો',
    maxMarks: 2,
  },

  // 5. Application of knowledge (10)
  {
    key: 'knowledge_plan',
    colIndex: 19,
    categoryIndex: 5,
    categoryName: 'Application of knowledge',
    categoryNameGu: 'જ્ઞાનનો વ્યવહારિક ઉપયોગ',
    subParamName: 'Plan work',
    subParamNameGu: 'આયોજન',
    maxMarks: 4,
  },
  {
    key: 'knowledge_tools',
    colIndex: 20,
    categoryIndex: 5,
    categoryName: 'Application of knowledge',
    categoryNameGu: 'જ્ઞાનનો વ્યવહારિક ઉપયોગ',
    subParamName: 'Select tools',
    subParamNameGu: 'સાધન પસંદગી',
    maxMarks: 3,
  },
  {
    key: 'knowledge_review',
    colIndex: 21,
    categoryIndex: 5,
    categoryName: 'Application of knowledge',
    categoryNameGu: 'જ્ઞાનનો વ્યવહારિક ઉપયોગ',
    subParamName: 'Review work',
    subParamNameGu: 'કામની સમીક્ષા',
    maxMarks: 3,
  },

  // 6. Skills to handle tools & equipment (10)
  {
    key: 'tools_handle',
    colIndex: 23,
    categoryIndex: 6,
    categoryName: 'Skills to handle tools & equipment',
    categoryNameGu: 'સાધનો વાપરવાની કુશળતા',
    subParamName: 'Handle/use',
    subParamNameGu: 'ઉપયોગ / હેન્ડલિંગ',
    maxMarks: 4,
  },
  {
    key: 'tools_safety',
    colIndex: 24,
    categoryIndex: 6,
    categoryName: 'Skills to handle tools & equipment',
    categoryNameGu: 'સાધનો વાપરવાની કુશળતા',
    subParamName: 'Maintain safety',
    subParamNameGu: 'સલામતી જાળવણી',
    maxMarks: 3,
  },
  {
    key: 'tools_maintain',
    colIndex: 25,
    categoryIndex: 6,
    categoryName: 'Skills to handle tools & equipment',
    categoryNameGu: 'સાધનો વાપરવાની કુશળતા',
    subParamName: 'Care/maintain',
    subParamNameGu: 'સંભાળ / મેઇન્ટેનન્સ',
    maxMarks: 3,
  },

  // 7. Speed in doing work (10)
  {
    key: 'speed_sequence',
    colIndex: 27,
    categoryIndex: 7,
    categoryName: 'Speed in doing work',
    categoryNameGu: 'કાર્ય પૂર્ણ કરવાની ઝડપ',
    subParamName: 'Sequence',
    subParamNameGu: 'કાર્ય ક્રમબદ્ધતા',
    maxMarks: 3,
  },
  {
    key: 'speed_technique',
    colIndex: 28,
    categoryIndex: 7,
    categoryName: 'Speed in doing work',
    categoryNameGu: 'કાર્ય પૂર્ણ કરવાની ઝડપ',
    subParamName: 'Technique',
    subParamNameGu: 'ટેકનીક / પદ્ધતિ',
    maxMarks: 5,
  },
  {
    key: 'speed_review',
    colIndex: 29,
    categoryIndex: 7,
    categoryName: 'Speed in doing work',
    categoryNameGu: 'કાર્ય પૂર્ણ કરવાની ઝડપ',
    subParamName: 'Review during execution',
    subParamNameGu: 'ચાલુ કામે ચકાસણી',
    maxMarks: 2,
  },

  // 8. Quality in workmanship (15)
  {
    key: 'quality_accuracy',
    colIndex: 31,
    categoryIndex: 8,
    categoryName: 'Quality in workmanship',
    categoryNameGu: 'કાર્યકારી ગુણવત્તા',
    subParamName: 'Accuracy',
    subParamNameGu: 'ચોકસાઈ / એક્યુરસી',
    maxMarks: 7,
  },
  {
    key: 'quality_conform',
    colIndex: 32,
    categoryIndex: 8,
    categoryName: 'Quality in workmanship',
    categoryNameGu: 'કાર્યકારી ગુણવત્તા',
    subParamName: 'Conform',
    subParamNameGu: 'માનકોનું પાલન',
    maxMarks: 3,
  },
  {
    key: 'quality_purpose',
    colIndex: 33,
    categoryIndex: 8,
    categoryName: 'Quality in workmanship',
    categoryNameGu: 'કાર્યકારી ગુણવત્તા',
    subParamName: 'Satisfy purpose',
    subParamNameGu: 'ઉદ્દેશ્ય પરિપૂર્ણતા',
    maxMarks: 5,
  },

  // 9. VIVA (15)
  {
    key: 'viva_clarity',
    colIndex: 35,
    categoryIndex: 9,
    categoryName: 'VIVA',
    categoryNameGu: 'વાઈવા / રૂબરૂ',
    subParamName: 'Response clarity',
    subParamNameGu: 'જવાબ સ્પષ્ટતા',
    maxMarks: 15,
  },
];

export const TOTAL_MAX_MARKS = 100;

/**
 * REVERSE SCORING ENGINE:
 * Takes an overall mark out of 100 (e.g. 78, 82, 90) and distributes it
 * across the 24 sub-parameters proportionally to their maximum marks.
 * Guarantees that:
 * 1. Every sub-parameter score satisfies 0 <= score <= maxMarks
 * 2. The exact sum of all 24 sub-parameters equals targetTotalMarks exactly.
 */
export function distributeTarget100Marks(
  targetTotalMarks: number,
  options?: {
    varianceFactor?: number; // e.g. 0 to 1 for realistic student variation
    saltIndex?: number;
  }
): FormativeScores {
  // Clamp target between 0 and 100
  const clampedTarget = Math.max(0, Math.min(TOTAL_MAX_MARKS, Math.round(targetTotalMarks)));

  if (clampedTarget === 0) {
    return createEmptyScores();
  }

  const ratio = clampedTarget / TOTAL_MAX_MARKS;
  const result: Partial<FormativeScores> = {};
  const variance = options?.varianceFactor ?? 0.15;
  const salt = options?.saltIndex ?? 1;

  // Step 1: Base proportional allocation with subtle realistic human variance
  let runningSum = 0;
  FORMATIVE_SUB_PARAMETERS.forEach((p, idx) => {
    const rawExpected = p.maxMarks * ratio;
    let allocated = Math.round(rawExpected);

    // Apply natural slight variance if requested and score is not boundary (0 or 100)
    if (variance > 0 && clampedTarget > 15 && clampedTarget < 95) {
      const pseudoRand = ((Math.sin(salt * 13 + idx * 7.7) + 1) / 2) - 0.5; // -0.5 to +0.5
      const delta = Math.round(pseudoRand * Math.max(1, p.maxMarks * variance));
      allocated = Math.max(0, Math.min(p.maxMarks, allocated + delta));
    } else {
      allocated = Math.max(0, Math.min(p.maxMarks, allocated));
    }

    result[p.key] = allocated;
    runningSum += allocated;
  });

  // Step 2: Invariant reconciliation: adjust difference to guarantee sum === clampedTarget
  let diff = clampedTarget - runningSum;

  if (diff !== 0) {
    // Sort parameters by maxMarks descending so larger categories absorb adjustments naturally
    const sortedKeys = [...FORMATIVE_SUB_PARAMETERS].sort((a, b) => b.maxMarks - a.maxMarks);

    let loopGuard = 0;
    while (diff !== 0 && loopGuard < 200) {
      loopGuard++;
      let adjustedInPass = false;

      for (const p of sortedKeys) {
        if (diff === 0) break;

        const currentVal = (result[p.key] as number) || 0;
        if (diff > 0 && currentVal < p.maxMarks) {
          result[p.key] = currentVal + 1;
          diff--;
          adjustedInPass = true;
        } else if (diff < 0 && currentVal > 0) {
          result[p.key] = currentVal - 1;
          diff++;
          adjustedInPass = true;
        }
      }

      if (!adjustedInPass) break;
    }
  }

  return result as FormativeScores;
}

export function createEmptyScores(): FormativeScores {
  return {
    safety_dress: 0,
    safety_ppe: 0,
    safety_apply: 0,
    hygiene_clean: 0,
    hygiene_scrap: 0,
    hygiene_material: 0,
    attendance_initiative: 0,
    attendance_accountability: 0,
    attendance_participative: 0,
    manuals_select: 0,
    manuals_search: 0,
    manuals_interpret: 0,
    knowledge_plan: 0,
    knowledge_tools: 0,
    knowledge_review: 0,
    tools_handle: 0,
    tools_safety: 0,
    tools_maintain: 0,
    speed_sequence: 0,
    speed_technique: 0,
    speed_review: 0,
    quality_accuracy: 0,
    quality_conform: 0,
    quality_purpose: 0,
    viva_clarity: 0,
  };
}

export function calculateCategoryTotals(scores: FormativeScores): FormativeCategoryTotals {
  const safety_total =
    (scores.safety_dress || 0) + (scores.safety_ppe || 0) + (scores.safety_apply || 0);

  const hygiene_total =
    (scores.hygiene_clean || 0) + (scores.hygiene_scrap || 0) + (scores.hygiene_material || 0);

  const attendance_total =
    (scores.attendance_initiative || 0) +
    (scores.attendance_accountability || 0) +
    (scores.attendance_participative || 0);

  const manuals_total =
    (scores.manuals_select || 0) + (scores.manuals_search || 0) + (scores.manuals_interpret || 0);

  const knowledge_total =
    (scores.knowledge_plan || 0) + (scores.knowledge_tools || 0) + (scores.knowledge_review || 0);

  const tools_total =
    (scores.tools_handle || 0) + (scores.tools_safety || 0) + (scores.tools_maintain || 0);

  const speed_total =
    (scores.speed_sequence || 0) + (scores.speed_technique || 0) + (scores.speed_review || 0);

  const quality_total =
    (scores.quality_accuracy || 0) +
    (scores.quality_conform || 0) +
    (scores.quality_purpose || 0);

  const viva_total = scores.viva_clarity || 0;

  const grand_total =
    safety_total +
    hygiene_total +
    attendance_total +
    manuals_total +
    knowledge_total +
    tools_total +
    speed_total +
    quality_total +
    viva_total;

  return {
    safety_total,
    hygiene_total,
    attendance_total,
    manuals_total,
    knowledge_total,
    tools_total,
    speed_total,
    quality_total,
    viva_total,
    grand_total,
  };
}

export interface FormativeLOAverage {
  lo_number: string;
  count: number;
  averages: Record<FormativeScoreKey, number>;
  categoryAverages: {
    safety_avg: number;
    hygiene_avg: number;
    attendance_avg: number;
    manuals_avg: number;
    knowledge_avg: number;
    tools_avg: number;
    speed_avg: number;
    quality_avg: number;
    viva_avg: number;
    grand_avg: number;
  };
}

export function calculateLOAverages(practicals: FormativePracticalEntry[]): FormativeLOAverage[] {
  // Group by LO
  const grouped: Record<string, FormativePracticalEntry[]> = {};
  practicals.forEach((p) => {
    const lo = p.lo_number || 'LO1';
    if (!grouped[lo]) grouped[lo] = [];
    grouped[lo].push(p);
  });

  return Object.keys(grouped).map((lo) => {
    // Only average active, non-cleared practicals
    const activePracticals = grouped[lo].filter((p) => !p.is_cleared);
    const list = activePracticals.length > 0 ? activePracticals : grouped[lo];
    const n = Math.max(1, list.length);

    const averages: Partial<Record<FormativeScoreKey, number>> = {};
    FORMATIVE_SUB_PARAMETERS.forEach((param) => {
      const sum = list.reduce((acc, curr) => acc + (curr.scores[param.key] || 0), 0);
      averages[param.key] = Math.round(sum / n);
    });

    const categoryAverages = {
      safety_avg: Math.round(
        list.reduce(
          (acc, curr) => acc + calculateCategoryTotals(curr.scores).safety_total,
          0
        ) / n
      ),
      hygiene_avg: Math.round(
        list.reduce(
          (acc, curr) => acc + calculateCategoryTotals(curr.scores).hygiene_total,
          0
        ) / n
      ),
      attendance_avg: Math.round(
        list.reduce(
          (acc, curr) => acc + calculateCategoryTotals(curr.scores).attendance_total,
          0
        ) / n
      ),
      manuals_avg: Math.round(
        list.reduce(
          (acc, curr) => acc + calculateCategoryTotals(curr.scores).manuals_total,
          0
        ) / n
      ),
      knowledge_avg: Math.round(
        list.reduce(
          (acc, curr) => acc + calculateCategoryTotals(curr.scores).knowledge_total,
          0
        ) / n
      ),
      tools_avg: Math.round(
        list.reduce(
          (acc, curr) => acc + calculateCategoryTotals(curr.scores).tools_total,
          0
        ) / n
      ),
      speed_avg: Math.round(
        list.reduce(
          (acc, curr) => acc + calculateCategoryTotals(curr.scores).speed_total,
          0
        ) / n
      ),
      quality_avg: Math.round(
        list.reduce(
          (acc, curr) => acc + calculateCategoryTotals(curr.scores).quality_total,
          0
        ) / n
      ),
      viva_avg: Math.round(
        list.reduce(
          (acc, curr) => acc + calculateCategoryTotals(curr.scores).viva_total,
          0
        ) / n
      ),
      grand_avg: Math.round(
        list.reduce(
          (acc, curr) => acc + calculateCategoryTotals(curr.scores).grand_total,
          0
        ) / n
      ),
    };

    return {
      lo_number: lo,
      count: list.length,
      averages: averages as Record<FormativeScoreKey, number>,
      categoryAverages,
    };
  });
}

/**
 * Generate standard default practicals list for an ITI trade matching FAR-1 format
 * (LO1: P1..P7 and LO2: P33..P52 matching the official government sheet)
 */
export function generateDefaultPracticals(
  defaultScore: number = 82,
  semester: number = 1
): FormativePracticalEntry[] {
  const result: FormativePracticalEntry[] = [];

  // LO1: P1 to P7 (7 practicals)
  const lo1Scores = generateVaryingPracticalScores(defaultScore, 7, { maxSpread: 4 });
  for (let i = 1; i <= 7; i++) {
    const pScore = lo1Scores[i - 1] ?? defaultScore;
    result.push({
      id: `lo1-p${i}`,
      semester,
      lo_number: 'LO1',
      practical_number: `P${i}`,
      practical_title: `Practical Skill Exercise ${i}`,
      target_marks_100: pScore,
      scores: distributeTarget100Marks(pScore, { saltIndex: i }),
    });
  }

  // LO2: P33 to P52 (20 practicals)
  const lo2Scores = generateVaryingPracticalScores(defaultScore, 20, { maxSpread: 4 });
  for (let i = 33; i <= 52; i++) {
    const pScore = lo2Scores[i - 33] ?? defaultScore;
    result.push({
      id: `lo2-p${i}`,
      semester,
      lo_number: 'LO2',
      practical_number: `P${i}`,
      practical_title: `Practical Skill Exercise ${i}`,
      target_marks_100: pScore,
      scores: distributeTarget100Marks(pScore, { saltIndex: i }),
    });
  }

  return result;
}

/**
 * Default multi-semester curriculum master
 * - Non-Engineering trades (COPA, etc.): 2 Semesters
 * - Engineering trades (Fitter, Electrician, etc.): 4 Semesters
 */
export function getDefaultCurriculum(
  tradeType: 'engineering' | 'non_engineering' = 'non_engineering',
  totalSemesters: 2 | 4 = 2
): SemesterCurriculum[] {
  if (tradeType === 'engineering' || totalSemesters === 4) {
    return [
      {
        semester: 1,
        learning_outcomes: [
          {
            id: 'eng-sem1-lo1',
            lo_number: 'LO1',
            lo_title: 'Safety consciousness, Fitting & Hand Tools Practice',
            practicals: Array.from({ length: 7 }, (_, i) => ({
              id: `s1-p${i + 1}`,
              practical_number: `P${i + 1}`,
              practical_title: `Workshop Measurement & Safety Exercise ${i + 1}`,
            })),
          },
          {
            id: 'eng-sem1-lo2',
            lo_number: 'LO2',
            lo_title: 'Marking, Filing, Sawing & Precision Layout',
            practicals: Array.from({ length: 12 }, (_, i) => ({
              id: `s1-p${i + 8}`,
              practical_number: `P${i + 8}`,
              practical_title: `Precision Bench Work ${i + 8}`,
            })),
          },
        ],
      },
      {
        semester: 2,
        learning_outcomes: [
          {
            id: 'eng-sem2-lo3',
            lo_number: 'LO3',
            lo_title: 'Sheet Metal, Basic Welding & Fastening Operations',
            practicals: Array.from({ length: 8 }, (_, i) => ({
              id: `s2-p${i + 21}`,
              practical_number: `P${i + 21}`,
              practical_title: `Fabrication Practice ${i + 21}`,
            })),
          },
          {
            id: 'eng-sem2-lo4',
            lo_number: 'LO4',
            lo_title: 'Lathe Operations, Turning & Plain Step Turning',
            practicals: Array.from({ length: 12 }, (_, i) => ({
              id: `s2-p${i + 29}`,
              practical_number: `P${i + 29}`,
              practical_title: `Lathe Component Processing ${i + 29}`,
            })),
          },
        ],
      },
      {
        semester: 3,
        learning_outcomes: [
          {
            id: 'eng-sem3-lo5',
            lo_number: 'LO5',
            lo_title: 'Milling, Shaping & Grinding Precision Machine Work',
            practicals: Array.from({ length: 8 }, (_, i) => ({
              id: `s3-p${i + 41}`,
              practical_number: `P${i + 41}`,
              practical_title: `Surface Grinding & Shaping Exercise ${i + 41}`,
            })),
          },
          {
            id: 'eng-sem3-lo6',
            lo_number: 'LO6',
            lo_title: 'Assembly, Tolerances & Preventative Maintenance',
            practicals: Array.from({ length: 10 }, (_, i) => ({
              id: `s3-p${i + 49}`,
              practical_number: `P${i + 49}`,
              practical_title: `Mechanical Assembly & Testing ${i + 49}`,
            })),
          },
        ],
      },
      {
        semester: 4,
        learning_outcomes: [
          {
            id: 'eng-sem4-lo7',
            lo_number: 'LO7',
            lo_title: 'CNC Programming, Offsets & Part Simulation',
            practicals: Array.from({ length: 8 }, (_, i) => ({
              id: `s4-p${i + 61}`,
              practical_number: `P${i + 61}`,
              practical_title: `CNC Operation & Tool Offsetting ${i + 61}`,
            })),
          },
          {
            id: 'eng-sem4-lo8',
            lo_number: 'LO8',
            lo_title: 'Inspection, CMM Quality Control & Final Project Work',
            practicals: Array.from({ length: 10 }, (_, i) => ({
              id: `s4-p${i + 69}`,
              practical_number: `P${i + 69}`,
              practical_title: `Major Project Manufacturing & Inspection ${i + 69}`,
            })),
          },
        ],
      },
    ];
  }

  // Non-Engineering (2 Semesters - COPA, etc.)
  return [
    {
      semester: 1,
      learning_outcomes: [
        {
          id: 'noneng-sem1-lo1',
          lo_number: 'LO1',
          lo_title: 'Computer Hardware, OS Installation & Safe Working Practices',
          practicals: [
            { id: 'p1', practical_number: 'P1', practical_title: 'Computer Hardware Identification & Assembly' },
            { id: 'p2', practical_number: 'P2', practical_title: 'OS Installation (Windows/Linux dual boot)' },
            { id: 'p3', practical_number: 'P3', practical_title: 'Device Drivers Configuration & Utilities' },
            { id: 'p4', practical_number: 'P4', practical_title: 'Command Line Interface (CLI) & Batch Files' },
            { id: 'p5', practical_number: 'P5', practical_title: 'Linux Commands & User Management' },
            { id: 'p6', practical_number: 'P6', practical_title: 'Word Processing & Document Layout' },
            { id: 'p7', practical_number: 'P7', practical_title: 'Mail Merge, Official Gujarati Letters & Notices' },
          ],
        },
        {
          id: 'noneng-sem1-lo2',
          lo_number: 'LO2',
          lo_title: 'Spreadsheets, Formulae, Charts & Presentations',
          practicals: [
            { id: 'p33', practical_number: 'P33', practical_title: 'Spreadsheet Basic Formulas & Conditional Formatting' },
            { id: 'p34', practical_number: 'P34', practical_title: 'Advanced Financial & Statistical Formulas' },
            { id: 'p35', practical_number: 'P35', practical_title: 'Data Validation, Sorting & Filtering' },
            { id: 'p36', practical_number: 'P36', practical_title: 'Pivot Tables & 2D/3D Data Charts' },
            { id: 'p37', practical_number: 'P37', practical_title: 'Presentation Slides with Transitions & Audio' },
            { id: 'p38', practical_number: 'P38', practical_title: 'Master Slide Design & Multimedia Embeds' },
            { id: 'p39', practical_number: 'P39', practical_title: 'Database Creation in MS Access / LibreOffice' },
            { id: 'p40', practical_number: 'P40', practical_title: 'Table Relationships & Foreign Keys' },
            { id: 'p41', practical_number: 'P41', practical_title: 'Queries with Multiple Conditions & Joins' },
            { id: 'p42', practical_number: 'P42', practical_title: 'Form Design & Data Entry Controls' },
            { id: 'p43', practical_number: 'P43', practical_title: 'Report Generation with Grouping & Summaries' },
            { id: 'p44', practical_number: 'P44', practical_title: 'Computer Network Configuration (LAN/WLAN)' },
            { id: 'p45', practical_number: 'P45', practical_title: 'IP Addressing, Subnetting & File Sharing' },
            { id: 'p46', practical_number: 'P46', practical_title: 'Internet Browsing, Security Protocols & HTTPS' },
            { id: 'p47', practical_number: 'P47', practical_title: 'Email Client Setup (IMAP/POP3) & Netiquette' },
            { id: 'p48', practical_number: 'P48', practical_title: 'Antivirus Installation & Malware Scanning' },
            { id: 'p49', practical_number: 'P49', practical_title: 'System Backup, Restore & Cloud Storage' },
            { id: 'p50', practical_number: 'P50', practical_title: 'Printer, Scanner & Biometric Installation' },
            { id: 'p51', practical_number: 'P51', practical_title: 'Routine PC Preventive Maintenance' },
            { id: 'p52', practical_number: 'P52', practical_title: 'Workplace Ergonomics & E-waste Disposal' },
          ],
        },
      ],
    },
    {
      semester: 2,
      learning_outcomes: [
        {
          id: 'noneng-sem2-lo3',
          lo_number: 'LO3',
          lo_title: 'Web Design, HTML5, CSS3, JavaScript & Database Programming',
          practicals: Array.from({ length: 12 }, (_, i) => ({
            id: `sem2-p${i + 1}`,
            practical_number: `P${i + 1}`,
            practical_title: `Web Design & Front-end Development Practical ${i + 1}`,
          })),
        },
        {
          id: 'noneng-sem2-lo4',
          lo_number: 'LO4',
          lo_title: 'Python Programming, Cloud Computing & Cyber Security',
          practicals: Array.from({ length: 15 }, (_, i) => ({
            id: `sem2-p${i + 13}`,
            practical_number: `P${i + 13}`,
            practical_title: `Python Scripting & Cybersecurity Exercise ${i + 13}`,
          })),
        },
      ],
    },
  ];
}

/**
 * Generate randomized integer scores for practicals under an LO with natural subtle variance (±3 to ±5)
 * such that:
 * 1. Their whole-number standard average strictly equals targetScore.
 * 2. When count >= 2, the practicals do not all have identical scores (some may be equal, but not all).
 * 3. Each practical score is bounded within [0, 100].
 */
export function generateVaryingPracticalScores(
  targetScore: number,
  count: number,
  options?: {
    maxSpread?: number;
    saltSeed?: number;
  }
): number[] {
  const target = Math.max(0, Math.min(100, Math.round(targetScore)));
  if (count <= 0) return [];
  if (count === 1) return [target];

  // Subtle realistic spread between ±3 and ±5 (default 4)
  const maxSpread = Math.max(3, Math.min(5, options?.maxSpread ?? 4));

  // Extreme boundary edge-cases
  if (target === 0) return new Array(count).fill(0);
  if (target === 100) return new Array(count).fill(100);

  // Generate random integer perturbations from [-maxSpread, maxSpread]
  const deltas: number[] = [];
  for (let i = 0; i < count; i++) {
    const spreadSpan = maxSpread * 2 + 1; // e.g. 4 * 2 + 1 = 9
    const d = Math.floor(Math.random() * spreadSpan) - maxSpread;
    deltas.push(d);
  }

  // Guarantee not all deltas are identical
  if (deltas.every((d) => d === deltas[0])) {
    deltas[0] = Math.min(maxSpread, deltas[0] + 2);
    deltas[1] = Math.max(-maxSpread, deltas[1] - 2);
  }

  // The sum of deltas must equal 0 so the average is target
  let currentDeltaSum = deltas.reduce((sum, d) => sum + d, 0);

  // Adjust deltas until sum is exactly 0
  let loopCount = 0;
  while (currentDeltaSum !== 0 && loopCount < 300) {
    loopCount++;
    if (currentDeltaSum > 0) {
      let maxIdx = 0;
      for (let i = 1; i < count; i++) {
        if (deltas[i] > deltas[maxIdx]) maxIdx = i;
      }
      deltas[maxIdx]--;
      currentDeltaSum--;
    } else {
      let minIdx = 0;
      for (let i = 1; i < count; i++) {
        if (deltas[i] < deltas[minIdx]) minIdx = i;
      }
      deltas[minIdx]++;
      currentDeltaSum++;
    }
  }

  // Form base scores
  let scores = deltas.map((d) => Math.max(0, Math.min(100, target + d)));

  // If clamping to [0, 100] caused the sum to diverge from target * count:
  const targetSum = count * target;
  let scoreSum = scores.reduce((sum, s) => sum + s, 0);
  let diff = targetSum - scoreSum;
  loopCount = 0;
  while (diff !== 0 && loopCount < 300) {
    loopCount++;
    if (diff > 0) {
      let candidateIdx = -1;
      let minVal = 101;
      for (let i = 0; i < count; i++) {
        if (scores[i] < 100 && scores[i] < minVal) {
          minVal = scores[i];
          candidateIdx = i;
        }
      }
      if (candidateIdx === -1) break;
      scores[candidateIdx]++;
      diff--;
    } else {
      let candidateIdx = -1;
      let maxVal = -1;
      for (let i = 0; i < count; i++) {
        if (scores[i] > 0 && scores[i] > maxVal) {
          maxVal = scores[i];
          candidateIdx = i;
        }
      }
      if (candidateIdx === -1) break;
      scores[candidateIdx]--;
      diff++;
    }
  }

  // Ensure they are not all identical (when target is between 3 and 97)
  if (count >= 2 && scores.every((s) => s === scores[0]) && target >= 3 && target <= 97) {
    scores[0] = Math.min(100, scores[0] + 2);
    scores[1] = Math.max(0, scores[1] - 2);
  }

  // Final verification: ensure average rounds to exact target
  const finalAvg = Math.round(scores.reduce((a, b) => a + b, 0) / count);
  if (finalAvg !== target) {
    const correction = target * count - scores.reduce((a, b) => a + b, 0);
    scores[0] = Math.max(0, Math.min(100, scores[0] + correction));
  }

  return scores;
}

/**
 * Generate practical entries for a specific semester using curriculum definition
 */
export function generatePracticalsFromCurriculum(
  curriculumList: SemesterCurriculum[],
  semester: number,
  targetScore: number = 82,
  varianceFactor: number = 0.15
): FormativePracticalEntry[] {
  const semCurriculum =
    curriculumList.find((c) => c.semester === semester) || curriculumList[0];

  if (!semCurriculum) {
    return generateDefaultPracticals(targetScore, semester);
  }

  const result: FormativePracticalEntry[] = [];
  let saltCounter = 1;

  semCurriculum.learning_outcomes.forEach((lo) => {
    // Generate natural varying practical scores per LO with average = targetScore
    const loScores = generateVaryingPracticalScores(
      targetScore,
      lo.practicals.length,
      { maxSpread: 4 }
    );

    lo.practicals.forEach((p, pIdx) => {
      const pScore = loScores[pIdx] ?? targetScore;
      result.push({
        id: `sem${semester}-${lo.lo_number.toLowerCase()}-${p.practical_number.toLowerCase()}`,
        semester,
        lo_number: lo.lo_number,
        practical_number: p.practical_number,
        practical_title: p.practical_title,
        target_marks_100: pScore,
        scores: distributeTarget100Marks(pScore, {
          varianceFactor,
          saltIndex: saltCounter++,
        }),
      });
    });
  });

  return result;
}

/**
 * Distribute target marks out of 100 specifically to practicals belonging to a single Learning Outcome (LO)
 * with natural practical score randomization (±3 to ±5) while strictly preserving targetMarks average.
 */
export function distributeTargetMarksToLO(
  practicals: FormativePracticalEntry[],
  loNumber: string,
  targetMarks: number,
  options?: { varianceFactor?: number; maxSpread?: number }
): FormativePracticalEntry[] {
  const clamped = Math.max(0, Math.min(100, Math.round(targetMarks)));
  const variance = options?.varianceFactor ?? 0.15;
  const cleanLo = loNumber.trim().toUpperCase();

  // Find all active, non-cleared practicals belonging to this LO
  const activeLOPracticals = practicals.filter(
    (p) => p.lo_number.trim().toUpperCase() === cleanLo && !p.is_cleared
  );

  // Generate varying practical scores with average = clamped
  const practicalScores = generateVaryingPracticalScores(
    clamped,
    activeLOPracticals.length,
    { maxSpread: options?.maxSpread ?? 4 }
  );

  let activeIdx = 0;
  return practicals.map((p, overallIdx) => {
    if (p.lo_number.trim().toUpperCase() === cleanLo && !p.is_cleared) {
      const assignedScore = practicalScores[activeIdx] ?? clamped;
      activeIdx++;

      return {
        ...p,
        target_marks_100: assignedScore,
        scores: distributeTarget100Marks(assignedScore, {
          varianceFactor: variance,
          saltIndex: overallIdx + 1,
        }),
      };
    }
    return p;
  });
}

/**
 * Clear marks of practicals after a specified cutoff practical (e.g. trainee left institute after P36)
 */
export function clearMarksAfterCutoff(
  practicals: FormativePracticalEntry[],
  cutoffPracticalNumber: string, // e.g. "P36"
  leavingDate?: string
): FormativePracticalEntry[] {
  const cleanCutoff = cutoffPracticalNumber.trim().toUpperCase();
  let foundCutoff = false;

  return practicals.map((p) => {
    const pNum = p.practical_number.trim().toUpperCase();
    if (foundCutoff) {
      // Clear all sub-parameter scores
      return {
        ...p,
        is_cleared: true,
        cleared_reason: leavingDate
          ? `Left institute on ${leavingDate} (after ${cleanCutoff})`
          : `Left institute after ${cleanCutoff}`,
        target_marks_100: 0,
        scores: {
          safety_dress: 0,
          safety_ppe: 0,
          safety_apply: 0,
          hygiene_clean: 0,
          hygiene_scrap: 0,
          hygiene_material: 0,
          attendance_initiative: 0,
          attendance_accountability: 0,
          attendance_participative: 0,
          manuals_select: 0,
          manuals_search: 0,
          manuals_interpret: 0,
          knowledge_plan: 0,
          knowledge_tools: 0,
          knowledge_review: 0,
          tools_handle: 0,
          tools_safety: 0,
          tools_maintain: 0,
          speed_sequence: 0,
          speed_technique: 0,
          speed_review: 0,
          quality_accuracy: 0,
          quality_conform: 0,
          quality_purpose: 0,
          viva_clarity: 0,
        },
      };
    }

    if (pNum === cleanCutoff) {
      foundCutoff = true;
    }

    return { ...p, is_cleared: false, cleared_reason: undefined };
  });
}

/**
 * Clear all marks for a trainee who left without appearing in practicals
 */
export function clearAllMarks(
  practicals: FormativePracticalEntry[],
  reason: string = 'Left institute'
): FormativePracticalEntry[] {
  return practicals.map((p) => ({
    ...p,
    is_cleared: true,
    cleared_reason: reason,
    target_marks_100: 0,
    scores: {
      safety_dress: 0,
      safety_ppe: 0,
      safety_apply: 0,
      hygiene_clean: 0,
      hygiene_scrap: 0,
      hygiene_material: 0,
      attendance_initiative: 0,
      attendance_accountability: 0,
      attendance_participative: 0,
      manuals_select: 0,
      manuals_search: 0,
      manuals_interpret: 0,
      knowledge_plan: 0,
      knowledge_tools: 0,
      knowledge_review: 0,
      tools_handle: 0,
      tools_safety: 0,
      tools_maintain: 0,
      speed_sequence: 0,
      speed_technique: 0,
      speed_review: 0,
      quality_accuracy: 0,
      quality_conform: 0,
      quality_purpose: 0,
      viva_clarity: 0,
    },
  }));
}

export interface FormativeVerticalSummary {
  activeCount: number;
  totalCount: number;
  totals: {
    subParams: Record<FormativeScoreKey, number>;
    categories: FormativeCategoryTotals;
  };
  averages: {
    subParams: Record<FormativeScoreKey, number>;
    categoryAverages: {
      safety_avg: number;
      hygiene_avg: number;
      attendance_avg: number;
      manuals_avg: number;
      knowledge_avg: number;
      tools_avg: number;
      speed_avg: number;
      quality_avg: number;
      viva_avg: number;
      grand_avg: number;
    };
  };
}

/**
 * Calculate vertical column totals and averages across a filtered list of practicals
 */
export function calculateVerticalTotalsAndAverages(
  practicals: FormativePracticalEntry[]
): FormativeVerticalSummary {
  const activePracticals = practicals.filter((p) => !p.is_cleared);
  const totalCount = practicals.length;
  const activeCount = activePracticals.length;
  const n = Math.max(1, activeCount);

  // Sub-parameters vertical sums
  const subParamTotals: Partial<Record<FormativeScoreKey, number>> = {};
  const subParamAverages: Partial<Record<FormativeScoreKey, number>> = {};

  FORMATIVE_SUB_PARAMETERS.forEach((param) => {
    const sum = activePracticals.reduce((acc, curr) => acc + (curr.scores[param.key] || 0), 0);
    subParamTotals[param.key] = sum;
    subParamAverages[param.key] = Math.round(sum / n);
  });

  // Category totals
  const safetySum = activePracticals.reduce(
    (acc, curr) => acc + calculateCategoryTotals(curr.scores).safety_total,
    0
  );
  const hygieneSum = activePracticals.reduce(
    (acc, curr) => acc + calculateCategoryTotals(curr.scores).hygiene_total,
    0
  );
  const attendanceSum = activePracticals.reduce(
    (acc, curr) => acc + calculateCategoryTotals(curr.scores).attendance_total,
    0
  );
  const manualsSum = activePracticals.reduce(
    (acc, curr) => acc + calculateCategoryTotals(curr.scores).manuals_total,
    0
  );
  const knowledgeSum = activePracticals.reduce(
    (acc, curr) => acc + calculateCategoryTotals(curr.scores).knowledge_total,
    0
  );
  const toolsSum = activePracticals.reduce(
    (acc, curr) => acc + calculateCategoryTotals(curr.scores).tools_total,
    0
  );
  const speedSum = activePracticals.reduce(
    (acc, curr) => acc + calculateCategoryTotals(curr.scores).speed_total,
    0
  );
  const qualitySum = activePracticals.reduce(
    (acc, curr) => acc + calculateCategoryTotals(curr.scores).quality_total,
    0
  );
  const vivaSum = activePracticals.reduce(
    (acc, curr) => acc + (curr.scores.viva_clarity || 0),
    0
  );
  const grandSum =
    safetySum +
    hygieneSum +
    attendanceSum +
    manualsSum +
    knowledgeSum +
    toolsSum +
    speedSum +
    qualitySum +
    vivaSum;

  const categoryTotals: FormativeCategoryTotals = {
    safety_total: safetySum,
    hygiene_total: hygieneSum,
    attendance_total: attendanceSum,
    manuals_total: manualsSum,
    knowledge_total: knowledgeSum,
    tools_total: toolsSum,
    speed_total: speedSum,
    quality_total: qualitySum,
    viva_total: vivaSum,
    grand_total: grandSum,
  };

  // User Requirement: Column 36 vertical average must be calculated as average of all the LO marks assessed by Instructor
  const loAverages = calculateLOAverages(activePracticals);
  const loGrandScores = loAverages
    .map((la) => la.categoryAverages.grand_avg)
    .filter((g) => g > 0);
  const loAverageOfAllLOs =
    loGrandScores.length > 0
      ? Math.round(loGrandScores.reduce((sum, s) => sum + s, 0) / loGrandScores.length)
      : Math.round(grandSum / n);

  const categoryAverages = {
    safety_avg: Math.round(safetySum / n),
    hygiene_avg: Math.round(hygieneSum / n),
    attendance_avg: Math.round(attendanceSum / n),
    manuals_avg: Math.round(manualsSum / n),
    knowledge_avg: Math.round(knowledgeSum / n),
    tools_avg: Math.round(toolsSum / n),
    speed_avg: Math.round(speedSum / n),
    quality_avg: Math.round(qualitySum / n),
    viva_avg: Math.round(vivaSum / n),
    grand_avg: loAverageOfAllLOs,
  };

  return {
    activeCount,
    totalCount,
    totals: {
      subParams: subParamTotals as Record<FormativeScoreKey, number>,
      categories: categoryTotals,
    },
    averages: {
      subParams: subParamAverages as Record<FormativeScoreKey, number>,
      categoryAverages,
    },
  };
}


