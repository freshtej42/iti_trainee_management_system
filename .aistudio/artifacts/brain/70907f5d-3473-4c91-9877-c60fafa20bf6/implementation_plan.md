# Randomized Practical Score Distribution for Formative Assessment

Realistic, natural variation across individual practical marks under each Learning Outcome (LO) while strictly preserving the instructor's target whole-number average.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters were confirmed during clarification and govern the distribution algorithm:
> - **Score Variance**: Subtle, realistic score spread between $\pm 3$ and $\pm 5$ marks around the target average (e.g., for target 81: practical marks vary across 78, 83, 79, 84, 82, 81).
> - **Zero Uniformity Guarantee**: For any LO with 2 or more practicals, marks are guaranteed not to be all identical.
> - **Average Invariance**: The whole-number standard average ($\text{round}(\sum S_i / N)$) is mathematically anchored to equal the exact target score entered by the instructor.
> - **Automatic Execution**: Distribution runs seamlessly whenever LO marks or overall 100-mark targets are input in the batch trainee roster or sheet editor.

---

## 1. Overview & Core Concept

When an ITI instructor enters a target mark for a Learning Outcome (e.g., **81** for LO1 or LO2), the system currently assigns 81 to every practical under that LO. In genuine classroom assessment, student performance naturally fluctuates across different practical exercises (some tasks executed at 78, others at 83, 85, or 80) while yielding an authentic overall average of 81.

This feature introduces an **integer partitioning algorithm with bounded random noise ($\pm 3$ to $\pm 5$)** that distributes varying whole-number scores to each practical in the LO such that:
1. Every practical receives a whole-number score out of 100 with realistic variance.
2. The practicals do not all share the same score.
3. The average of all active practicals in that LO strictly equals the target score entered by the instructor.
4. Each practical's assigned score is partitioned into the 27 formative assessment sub-parameters matching the ITI FAR-1 blueprint.

---

## 2. User Experience & Visual Flow

### Instructor Workflow
```
┌────────────────────────────────────────────────────────┐
│ Trainee Roster / Marks Entry (LO-Wise or Batch 100)    │
│ Instructor inputs: "81" for LO2 (contains 6 practicals) │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Randomized Practical Marks Generator                   │
│ • Bounded noise generation: [-4, +3, -2, +4, -1, 0]   │
│ • Integer balance adjustment: sum = N * Target         │
│ • Generated practical scores: [77, 84, 79, 85, 80, 81] │
│ • Verified Average: 486 / 6 = 81.00 (Exact match)     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Sub-Parameter Reverse Distribution                     │
│ Each practical's score (e.g. 77, 84...) is distributed │
│ across 27 sub-parameters as whole numbers             │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Live Assessment Sheet & Exports                        │
│ • Formative table displays unique marks per practical  │
│ • LO summary row displays exact average: 81            │
│ • Footer Vertical Average reflects exact performance   │
│ • Print preview & Excel exports reflect real variation │
└────────────────────────────────────────────────────────┘
```

### Key UI Features
- **Instant Visual Feedback**: Entering `81` immediately populates practical rows with natural scores (e.g., P33: 82, P34: 78, P35: 84, P36: 80, P37: 85, P38: 77).
- **Badge Indicators**: The practical row total column highlights the computed mark for that practical.
- **Cleared Trainee Safety**: Any practical marked as cleared (e.g. student who left after P36) remains at `0 [Left]` and is untouched by the distribution algorithm.

---

## 3. Technical Architecture & Algorithm Strategy

### System Architecture
```
┌──────────────────────────────────────────────────────────────┐
│                    FormativeAssessmentView                   │
│          Batch Trainee Roster & LO-Wise Input Modal          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  formativeScoring.ts Engine                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ generateVaryingPracticalScores(target, count, spread) │  │
│  │ • Computes delta array with sum = 0                    │  │
│  │ • Enforces non-identical values                        │  │
│  │ • Clamps within [0, 100]                               │  │
│  └───────────────────────────┬────────────────────────────┘  │
│                              ▼                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ distributeTargetMarksToLO(practicals, loNumber, score) │  │
│  │ • Identifies active practicals in target LO            │  │
│  │ • Assigns randomized total score per practical         │  │
│  │ • Runs distributeTarget100Marks per practical score    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│               Data Consumers (Print, PDF, Excel)             │
│ • Main Sheet Table & Footer Average                          │
│ • FAR-1 Government Print Preview Modal                       │
│ • Formative Excel Export (.xlsx)                             │
└──────────────────────────────────────────────────────────────┘
```

### Mathematical Formulation
For an LO with $N$ active practicals and target score $T$:
1. If $N = 1$: Assign $S_1 = T$.
2. If $N \ge 2$:
   - Generate initial random deviations $d_i \in [-\text{spread}, +\text{spread}]$ where $\text{spread} = 4$ (providing $\pm 3$ to $\pm 5$ range).
   - Check condition: Ensure not all $d_i$ are equal (if all equal, perturb at least two items: $d_1 \gets d_1 + 2, d_2 \gets d_2 - 2$).
   - Balance step: Let $R = \sum_{i=1}^N d_i$. Distribute $-R$ across the practicals by adding $\pm 1$ iteratively until $\sum d_i = 0$.
   - Calculate raw scores: $S_i = \text{clamp}(T + d_i, 0, 100)$.
   - Final balancing: If clamping changed the sum, redistribute the difference to unclamped indices so $\sum S_i = N \times T$ (or within $| \sum S_i - N \times T | < N / 2$).
   - Standard rounding check: $\text{round}\left(\frac{\sum S_i}{N}\right) = T$ is mathematically guaranteed.

---

## 4. Verification Plan

1. **Unit Verification via Script/Tests**:
   - Test with target 81 across various practical counts ($N = 2, 4, 7, 12$).
   - Verify that all generated scores are in range $[76, 86]$.
   - Verify that $\text{round}(\text{average}) === 81$.
   - Verify that not all practical scores are identical.
2. **Applet Compilation & Linting**:
   - Run `compile_applet` and `lint_applet` to confirm clean build.
3. **End-to-End Verification**:
   - Enter marks in LO-Wise batch input.
   - Verify live table rows display varied marks and LO average matches target.
   - Verify PDF preview and Excel export reflect the randomized values.

---

## 5. Updates Applied (Current Turn)
- **Removed LO-Wise Bulk Presets**: Cleared the preset buttons strip (`LO1: 75, 80...`) from the Batch Trainee Roster so instructors enter marks directly per trainee or via attendance calculation without clutter.
- **Added Column 36 (TOTAL / 100)**: Added Column 36 to:
  1. Main Interactive Assessment Table
  2. A4 Landscape Print Preview & PDF Dialog
  3. Formative Excel Export (`.xlsx`)
- **Column 36 Vertical Average Calculation**: In the bottom vertical summary row (`AVERAGE / ઊભી સરેરાશ`), Column 36 is calculated strictly as the **average of all the LO marks assessed by the Instructor**.
- **Batch Roster LO Average Column**: Added a calculated `LO સરેરાશ / ૧૦૦ (Avg of All LOs)` column in the Batch Trainee Roster table.
