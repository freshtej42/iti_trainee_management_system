import { Trainee, AttendanceRecord, Instructor, DispatchLog, MultiStudentTableColumnKey, CustomTableTemplate } from '../types';

export interface MergeContext {
  trainee: Trainee;
  attendance?: AttendanceRecord;
  instructor: Instructor;
  refNumber?: string;
  referenceNumber?: string;
  issueDate?: string;
  noticeIssueDate?: string;
  lastNoticeDate?: string;
  previousNoticeDates?: string;
  firstNoticeDate?: string;
  secondNoticeDate?: string;
  dispatchLogs?: DispatchLog[];
  allLowAttendanceTrainees?: Array<{ trainee: Trainee; attendance?: AttendanceRecord }>;
  selectedTrainees?: Array<{ trainee: Trainee; attendance?: AttendanceRecord }>;
  selectedTableColumns?: MultiStudentTableColumnKey[];
  customTableTemplates?: CustomTableTemplate[];
  aiCommentary?: string;
  language?: 'Gujarati' | 'Hindi' | 'English';
  monthYear?: string;
  workingDays?: number;
  presentDays?: number;
  absentDays?: number;
  attendancePercentage?: number;
  progressiveAttendancePercentage?: number;
  progressiveRecordedMonths?: number;
  progressiveStatus?: string;
  absentFromDate?: string;
  absentToDate?: string;
  continuousAbsentSince?: string;
  remarks?: string;
}

/**
 * Generates an official ITI outward dispatch reference number
 */
export function generateOutwardReference(
  trade: string,
  rollNo: string,
  monthYear: string = 'Current',
  prefix?: string
): string {
  const year = new Date().getFullYear();
  if (prefix) {
    return `${prefix}/${year}/${rollNo}`;
  }
  const cleanMonth = monthYear.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  return `ITI/${trade.toUpperCase()}/${year}/IRR/${cleanMonth}-${rollNo}`;
}

/**
 * Available merge tags for the MS Word editor variable insertion dropdown
 */
export const AVAILABLE_MERGE_TAGS = [
  { tag: '{{Full_Name}}', label: 'Trainee Full Name (પૂર્ણ નામ)', category: 'Trainee' },
  { tag: '{{Trainee_Roll_No}}', label: 'Roll Number (રોલ નં.)', category: 'Trainee' },
  { tag: '{{Enrollment_No}}', label: 'Enrollment No (એનરોલમેન્ટ નં.)', category: 'Trainee' },
  { tag: '{{Parent_Full_Name}}', label: 'Parent Full Name (વાલી પૂર્ણ નામ: પિતા+દાદા+અટક)', category: 'Trainee' },
  { tag: '{{Father_Name}}', label: "Father's Name (પિતાનું નામ)", category: 'Trainee' },
  { tag: '{{Grandfather_Name}}', label: "Grandfather's Name (દાદાનું નામ)", category: 'Trainee' },
  { tag: '{{Surname}}', label: 'Surname (અટક / સરનેમ)', category: 'Trainee' },
  { tag: '{{Trainee_Relation}}', label: 'Relation (પુત્રી/પત્ની અથવા પુત્ર/પુત્રી)', category: 'Trainee' },
  { tag: '{{Full_Address}}', label: 'Full Address (સંપૂર્ણ સરનામું)', category: 'Address' },
  { tag: '{{Village}}', label: 'Village (ગામ)', category: 'Address' },
  { tag: '{{Taluka}}', label: 'Taluka (તાલુકો)', category: 'Address' },
  { tag: '{{District}}', label: 'District (જિલ્લો)', category: 'Address' },
  { tag: '{{Pincode}}', label: 'Pincode (પિનકોડ)', category: 'Address' },
  { tag: '{{ITI_Name}}', label: 'ITI Institute Name (સંસ્થાનું નામ)', category: 'Institute' },
  { tag: '{{Institution_Address}}', label: 'Institute Address (સંસ્થાનું સરનામું)', category: 'Institute' },
  { tag: '{{Instructor_Name}}', label: 'Supervisor Instructor Name (સુ.ઇ. નામ)', category: 'Institute' },
  { tag: '{{Designation}}', label: 'Designation (હોદ્દો)', category: 'Institute' },
  { tag: '{{Trade}}', label: 'Trade (ટ્રેડ - દા.ત. કોપા, ફીટર)', category: 'Institute' },
  { tag: '{{Batch}}', label: 'Batch Year (બેચ વર્ષ)', category: 'Institute' },
  { tag: '{{Unit}}', label: 'Unit (યુનિટ)', category: 'Institute' },
  { tag: '{{Month_Year}}', label: 'Month & Year (માસ અને વર્ષ)', category: 'Attendance' },
  { tag: '{{Working_Days}}', label: 'Total Working Days (કુલ કામકાજના દિવસો)', category: 'Attendance' },
  { tag: '{{Present_Days}}', label: 'Present Days (હાજર દિવસો)', category: 'Attendance' },
  { tag: '{{Absent_Days}}', label: 'Absent Days (ગેરહાજર દિવસો)', category: 'Attendance' },
  { tag: '{{Attendance_Percentage}}', label: 'Attendance % (હાજરીની ટકાવારી)', category: 'Attendance' },
  { tag: '{{Progressive_Attendance_Percentage}}', label: 'Progressive Attendance % (પ્રગતિશીલ હાજરી ટકાવારી)', category: 'Attendance' },
  { tag: '{{Progressive_Recorded_Months}}', label: 'Progressive Recorded Months (નોંધાયેલ માસ સંખ્યા)', category: 'Attendance' },
  { tag: '{{Progressive_Status}}', label: 'Progressive Status (પ્રગતિશીલ સ્થિતિ: સુરક્ષિત / નિયમિત)', category: 'Attendance' },
  { tag: '{{Absent_From_Date}}', label: 'Absent From Date (તારીખથી ગેરહાજર)', category: 'Attendance' },
  { tag: '{{Absent_To_Date}}', label: 'Absent To Date (તારીખ સુધી ગેરહાજર)', category: 'Attendance' },
  { tag: '{{Continuous_Absent_Since}}', label: 'Continuous Absent Since (કઈ તારીખથી સતત ગેરહાજર)', category: 'Attendance' },
  { tag: '{{Remarks}}', label: 'Remarks / Notes (નોંધ)', category: 'Attendance' },
  { tag: '{{Notice_Issue_Date}}', label: 'Notice Issue Date (નોટિસ તારીખ)', category: 'Dispatch' },
  { tag: '{{Reference_Number}}', label: 'Outward Reference No (સંદર્ભ જા. નં.)', category: 'Dispatch' },
  { tag: '{{Last_Notice_Date}}', label: 'Last Notice Date (અગાઉની નોટિસ તારીખ)', category: 'Dispatch' },
  { tag: '{{Previous_Notice_Dates}}', label: 'Previous Notice Dates (અગાઉ આપેલ નોટિસ તારીખો / પ્રથમ હોય તો "-")', category: 'Dispatch' },
  { tag: '{{First_Notice_Date}}', label: '1st Notice Date (પ્રથમ નોટિસ તારીખ / "-")', category: 'Dispatch' },
  { tag: '{{Second_Notice_Date}}', label: '2nd Notice Date (દ્વિતીય નોટિસ તારીખ / "-")', category: 'Dispatch' },
  { tag: '{{AI_Commentary}}', label: 'વાલી પરામર્શ / વિશેષ નિર્દેશ (Parent Advisory)', category: 'Advisory' },
  // Multi-Student & Forwarding Office Intimation Table Tags
  { tag: '{{Selected_Trainees_Table}}', label: 'Multi-Student Table (પસંદ કરેલ વિદ્યાર્થીઓનું સંયુક્ત પત્રક)', category: 'MultiStudent' },
  { tag: '{{Trainee_Address_Table}}', label: 'Trainee Address Table (વિદ્યાર્થીઓનું પૂરું સરનામું અને સંપર્ક પત્રક)', category: 'MultiStudent' },
  { tag: '{{Trainee_Attendance_Table}}', label: 'Attendance Forwarding Table (હાજરી / ગેરહાજરી પત્રક)', category: 'MultiStudent' },
  { tag: '{{Custom_Table:Student_Address_Remarks}}', label: 'Custom Table: નામ, સરનામું અને ખાલી નોંધ (Name, Address & Blank Remarks)', category: 'MultiStudent' },
  { tag: '{{Custom_Table:Parent_Meeting_Sign}}', label: 'Custom Table: વાલી મીટિંગ સહી પત્રક (Parent Sign Sheet)', category: 'MultiStudent' },
  { tag: '{{Total_Selected_Trainees}}', label: 'Total Students Count (પસંદ કરેલ વિદ્યાર્થીઓની કુલ સંખ્યા)', category: 'MultiStudent' },
  { tag: '{{Selected_Trainees_Roll_List}}', label: 'Selected Roll Numbers (પસંદ કરેલ રોલ નંબરો)', category: 'MultiStudent' },
  { tag: '{{Selected_Trainees_Names_List}}', label: 'Selected Trainees Names (પસંદ કરેલ વિદ્યાર્થીઓના નામો)', category: 'MultiStudent' },
];

/**
 * Available row-level merge tags when designing a Custom Table row format
 */
export const ROW_CELL_MERGE_TAGS = [
  { tag: '{{Sr_No}}', label: 'ક્રમ (1, 2, 3...)' },
  { tag: '{{Sr_No_Gu}}', label: 'ગુજરાતી ક્રમ (૧, ૨, ૩...)' },
  { tag: '{{Full_Name}}', label: 'તાલીમાર્થીનું પૂર્ણ નામ (Full Name)' },
  { tag: '{{Trainee_Roll_No}}', label: 'રોલ નંબર (Roll No)' },
  { tag: '{{Enrollment_No}}', label: 'એનરોલમેન્ટ નં. (Enrollment No)' },
  { tag: '{{Parent_Full_Name}}', label: 'વાલીનું પૂર્ણ નામ (Parent Name)' },
  { tag: '{{Father_Name}}', label: 'પિતાનું નામ (Father Name)' },
  { tag: '{{Full_Address}}', label: 'સંપૂર્ણ સરનામું (Full Address)' },
  { tag: '{{Village}}', label: 'ગામ (Village)' },
  { tag: '{{Taluka}}', label: 'તાલુકો (Taluka)' },
  { tag: '{{District}}', label: 'જિલ્લો (District)' },
  { tag: '{{Pincode}}', label: 'પિનકોડ (Pincode)' },
  { tag: '{{Parent_Mobile}}', label: 'વાલી મોબાઈલ નં. (Parent Mobile)' },
  { tag: '{{Mobile}}', label: 'તાલીમાર્થી મોબાઈલ (Student Mobile)' },
  { tag: '{{Attendance_Percentage}}', label: 'માસિક હાજરી % (Monthly %)' },
  { tag: '{{Progressive_Attendance_Percentage}}', label: 'સંચિત હાજરી % (Progressive %)' },
  { tag: '{{Present_Days}}', label: 'હાજર દિવસો (Present Days)' },
  { tag: '{{Absent_Days}}', label: 'ગેરહાજર દિવસો (Absent Days)' },
  { tag: '{{Continuous_Absent_Since}}', label: 'ક્યારથી ગેરહાજર (Absent Since)' },
  { tag: '{{Remarks}}', label: 'સિસ્ટમ નોંધ (System Remarks)' },
  { tag: '{{Trade}}', label: 'ટ્રેડ (Trade)' },
  { tag: '{{Batch}}', label: 'બેચ (Batch)' },
  { tag: '{{Unit}}', label: 'યુનિટ (Unit)' },
];

export const DEFAULT_CUSTOM_TABLE_TEMPLATES: CustomTableTemplate[] = [
  {
    id: 'ctbl-student-address-remarks',
    name: 'નામ, સરનામું અને ખાલી નોંધ પત્રક (Name, Address & Blank Remarks)',
    tag_key: '{{Custom_Table:Student_Address_Remarks}}',
    description: 'તાલીમાર્થીનું નામ, રોલ નંબર, સંપૂર્ણ સરનામું અને પ્રિન્ટ બાદ હાથથી લખવા માટે ખાલી નોંધ/સહી કોલમ',
    row_min_height_px: 34,
    columns: [
      { id: 'c1', header: 'ક્રમ', cell_template: '{{Sr_No_Gu}}', align: 'center', width: '6%', bold: true },
      { id: 'c2', header: 'રોલ નં.', cell_template: '{{Trainee_Roll_No}}', align: 'center', width: '10%', bold: true },
      { id: 'c3', header: 'તાલીમાર્થીનું નામ', cell_template: '{{Full_Name}}', align: 'left', width: '24%', bold: true },
      { id: 'c4', header: 'સંપૂર્ણ સરનામું અને મોબાઈલ', cell_template: '{{Full_Address}} (મો: {{Parent_Mobile}})', align: 'left', width: '36%' },
      { id: 'c5', header: 'નોંધ / સહી', cell_template: '', is_blank_for_handwriting: true, align: 'left', width: '24%' },
    ],
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'ctbl-parent-meeting-sign',
    name: 'વાલી મીટિંગ સહી અને સંપર્ક પત્રક (Parent Meeting Sign Sheet)',
    tag_key: '{{Custom_Table:Parent_Meeting_Sign}}',
    description: 'વાલી મીટિંગ કે રૂબરૂ મુલાકાત વખતે પ્રિન્ટ કાઢી વાલીની સહી અને અભિપ્રાય લેવા માટેનું તૈયાર ટેબલ',
    row_min_height_px: 38,
    columns: [
      { id: 'c1', header: 'ક્રમ', cell_template: '{{Sr_No_Gu}}', align: 'center', width: '6%', bold: true },
      { id: 'c2', header: 'તાલીમાર્થીનું નામ (રોલ નં.)', cell_template: '{{Full_Name}} ({{Trainee_Roll_No}})', align: 'left', width: '26%', bold: true },
      { id: 'c3', header: 'વાલીનું નામ અને મોબાઈલ', cell_template: '{{Parent_Full_Name}} - {{Parent_Mobile}}', align: 'left', width: '28%' },
      { id: 'c4', header: 'હાજરી %', cell_template: '{{Attendance_Percentage}}', align: 'center', width: '12%', bold: true },
      { id: 'c5', header: 'વાલીની સહી / રૂબરૂ નોંધ', cell_template: '', is_blank_for_handwriting: true, align: 'left', width: '28%' },
    ],
    created_at: '2025-08-01T10:00:00Z',
  },
];

/**
 * Returns merged list of default + instructor/localStorage custom table templates
 */
export function getEffectiveCustomTables(
  instructor?: Instructor,
  extraCustomTables?: CustomTableTemplate[]
): CustomTableTemplate[] {
  let storedLocal: CustomTableTemplate[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('iti_custom_table_templates');
      if (raw) {
        storedLocal = JSON.parse(raw);
      }
    } catch {
      // ignore parse errors
    }
  }

  const fromInstructor = instructor?.custom_table_templates || [];
  const combined = [
    ...(extraCustomTables || []),
    ...fromInstructor,
    ...storedLocal,
    ...DEFAULT_CUSTOM_TABLE_TEMPLATES,
  ];

  const seenTags = new Set<string>();
  const unique: CustomTableTemplate[] = [];
  for (const item of combined) {
    if (!item || !item.tag_key) continue;
    const normKey = item.tag_key.trim().toLowerCase();
    if (!seenTags.has(normKey)) {
      seenTags.add(normKey);
      unique.push(item);
    }
  }
  return unique;
}

export interface NoticeHistory {
  previousNoticeDates: string; // Comma separated list of dates or "-" if none
  firstNoticeDate: string; // Date of 1st notice or "-"
  secondNoticeDate: string; // Date of 2nd notice or "-"
  lastNoticeDate: string; // Most recent notice date or "-"
  priorNoticeCount: number;
}

/**
 * Computes full notice history for a trainee from prior dispatch logs.
 * If this is the first notice (no prior logs), returns "-" for date fields as required.
 */
export function getNoticeHistory(
  traineeId: string,
  dispatchLogs?: DispatchLog[]
): NoticeHistory {
  if (!dispatchLogs || dispatchLogs.length === 0) {
    return {
      previousNoticeDates: '-',
      firstNoticeDate: '-',
      secondNoticeDate: '-',
      lastNoticeDate: '-',
      priorNoticeCount: 0,
    };
  }

  // Find all outward notices sent for this trainee
  const priorLogs = dispatchLogs
    .filter(
      (log) =>
        log.trainee_id === traineeId &&
        (log.entry_type === 'outward' || !log.entry_type) &&
        (log.status === 'Dispatched' || log.status === 'Printed' || log.status === 'Acknowledged' || log.status === 'Delivered')
    )
    .sort((a, b) => {
      const dateA = new Date(a.issue_date || a.issued_date || a.created_at).getTime();
      const dateB = new Date(b.issue_date || b.issued_date || b.created_at).getTime();
      return dateA - dateB; // chronological oldest first
    });

  if (priorLogs.length === 0) {
    return {
      previousNoticeDates: '-',
      firstNoticeDate: '-',
      secondNoticeDate: '-',
      lastNoticeDate: '-',
      priorNoticeCount: 0,
    };
  }

  const formatLogDate = (log: DispatchLog): string => {
    const raw = log.issue_date || log.issued_date || log.created_at;
    if (!raw) return '-';
    if (raw.includes('-')) {
      const parts = raw.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return raw;
  };

  const dates = priorLogs.map(formatLogDate);
  const uniqueDates = Array.from(new Set(dates));

  return {
    previousNoticeDates: uniqueDates.join(', '),
    firstNoticeDate: dates[0] || '-',
    secondNoticeDate: dates[1] || '-',
    lastNoticeDate: dates[dates.length - 1] || '-',
    priorNoticeCount: priorLogs.length,
  };
}

/**
 * Converts English digits to Gujarati numerals (e.g. 123 -> ૧૨૩)
 */
export function toGujaratiNumerals(num: number | string): string {
  const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return String(num).replace(/[0-9]/g, (d) => gujaratiDigits[parseInt(d, 10)]);
}

export const DEFAULT_MULTI_STUDENT_COLUMNS: MultiStudentTableColumnKey[] = [
  'sr_no',
  'roll_no',
  'full_name',
  'address',
  'mobile',
  'attendance_pct',
  'remarks',
];

/**
 * Generates a customizable multi-student table featuring multiple trainees with selected columns.
 * Ideal for office forwarding letters and consolidated notices on a single page.
 */
export function generateSelectedTraineesTable(
  traineesList: Array<{ trainee: Trainee; attendance?: AttendanceRecord }>,
  columns: MultiStudentTableColumnKey[] = DEFAULT_MULTI_STUDENT_COLUMNS,
  preferEnglish = false
): string {
  if (!traineesList || traineesList.length === 0) {
    return `<table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px;" border="1" cellpadding="6">
      <tbody>
        <tr>
          <td style="border: 1px solid #333; padding: 12px; text-align: center; color: #64748b; font-style: italic;">
            ${preferEnglish ? 'No trainees selected for this consolidated table.' : 'આ પત્રક માટે કોઈ તાલીમાર્થી પસંદ કરેલ નથી. કૃપા કરીને યાદીમાંથી તાલીમાર્થીઓ પસંદ કરો.'}
          </td>
        </tr>
      </tbody>
    </table>`;
  }

  // Column definitions with headers and rendering logic
  const columnDefs: Record<MultiStudentTableColumnKey, { header: string; width: string; align: 'left' | 'center' | 'right' }> = {
    sr_no: { header: preferEnglish ? 'Sr.' : 'ક્રમ', width: '5%', align: 'center' },
    roll_no: { header: preferEnglish ? 'Roll No' : 'રોલ નં.', width: '9%', align: 'center' },
    enrollment_no: { header: preferEnglish ? 'Enrollment No' : 'એનરોલમેન્ટ નં.', width: '13%', align: 'center' },
    full_name: { header: preferEnglish ? 'Trainee Full Name' : 'તાલીમાર્થીનું નામ', width: '22%', align: 'left' },
    parent_name: { header: preferEnglish ? 'Parent / Guardian' : 'વાલીનું નામ', width: '20%', align: 'left' },
    address: { header: preferEnglish ? 'Full Address (Village/Taluka/Dist)' : 'રહેઠાણનું સંપૂર્ણ સરનામું', width: '26%', align: 'left' },
    mobile: { header: preferEnglish ? 'Mobile No' : 'મોબાઈલ નં.', width: '11%', align: 'center' },
    attendance_pct: { header: preferEnglish ? 'Att. %' : 'હાજરી %', width: '9%', align: 'center' },
    absent_since: { header: preferEnglish ? 'Absent Since' : 'ક્યારથી ગેરહાજર?', width: '12%', align: 'center' },
    remarks: { header: preferEnglish ? 'Remarks' : 'વિગત / નોંધ', width: '14%', align: 'left' },
  };

  const activeCols = columns.length > 0 ? columns : DEFAULT_MULTI_STUDENT_COLUMNS;

  // Header row
  const headerCells = activeCols
    .map((colKey) => {
      const def = columnDefs[colKey] || { header: colKey, width: 'auto', align: 'left' };
      return `<th style="border: 1px solid #333; padding: 6px 8px; text-align: ${def.align}; background-color: #f1f5f9; font-size: 12.5px; width: ${def.width};">${def.header}</th>`;
    })
    .join('');

  // Body rows
  const rows = traineesList
    .map((item, index) => {
      const tr = item.trainee;
      const att = item.attendance;
      const fullName = formatFullName(tr, preferEnglish);
      const parentName = formatParentFullName(tr, preferEnglish);
      const fullAddress = formatFullAddress(tr, preferEnglish);
      const mobile = tr.parent_mobile || tr.mobile || '-';
      const pct = att?.attendance_percentage !== undefined ? `${att.attendance_percentage.toFixed(1)}%` : '-';
      const absentSince = att?.continuous_absent_since || att?.absent_from_date || '-';
      const remarks = att?.remarks || (preferEnglish ? 'Absentee intimation' : 'કચેરી જાણ સારૂ');

      const cells = activeCols
        .map((colKey) => {
          switch (colKey) {
            case 'sr_no':
              return `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-weight: bold; vertical-align: top;">${index + 1}</td>`;
            case 'roll_no':
              return `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-weight: 600; vertical-align: top;">${tr.roll_no}</td>`;
            case 'enrollment_no':
              return `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 11.5px; vertical-align: top;">${tr.enrollment_no || '-'}</td>`;
            case 'full_name':
              return `<td style="border: 1px solid #333; padding: 6px; vertical-align: top;"><strong>${fullName}</strong></td>`;
            case 'parent_name':
              return `<td style="border: 1px solid #333; padding: 6px; vertical-align: top;">${parentName}</td>`;
            case 'address':
              return `<td style="border: 1px solid #333; padding: 6px; font-size: 11.5px; line-height: 1.4; vertical-align: top;">${fullAddress}</td>`;
            case 'mobile':
              return `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 12px; vertical-align: top;">${mobile}</td>`;
            case 'attendance_pct': {
              const isLow = (att?.attendance_percentage ?? 100) < 80;
              return `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-weight: bold; color: ${isLow ? '#b91c1c' : '#0f172a'}; vertical-align: top;">${pct}</td>`;
            }
            case 'absent_since':
              return `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 12px; vertical-align: top;">${absentSince}</td>`;
            case 'remarks':
              return `<td style="border: 1px solid #333; padding: 6px; font-size: 12px; vertical-align: top;">${remarks}</td>`;
            default:
              return `<td style="border: 1px solid #333; padding: 6px; vertical-align: top;">-</td>`;
          }
        })
        .join('');

      return `<tr>${cells}</tr>`;
    })
    .join('\n');

  return `<table style="width: 100%; border-collapse: collapse; margin: 12px 0 16px 0; font-size: 12.5px; line-height: 1.35;" border="1" cellpadding="6">
    <thead>
      <tr style="text-align: center; font-weight: bold;">
        ${headerCells}
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`;
}

/**
 * Specialized Trainee Address Table for official forwarding letters and dispatch intimation
 * Containing Roll No, Student Full Name, Parent Name, Complete Postal Address, and Contact Mobile.
 */
export function generateTraineeAddressTable(
  traineesList: Array<{ trainee: Trainee; attendance?: AttendanceRecord }>,
  preferEnglish = false
): string {
  if (!traineesList || traineesList.length === 0) {
    return `<table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px;" border="1" cellpadding="6">
      <tbody>
        <tr>
          <td style="border: 1px solid #333; padding: 12px; text-align: center; color: #64748b; font-style: italic;">
            ${preferEnglish ? 'No trainee records found.' : 'કોઈ તાલીમાર્થી પસંદ કરેલ નથી.'}
          </td>
        </tr>
      </tbody>
    </table>`;
  }

  const rows = traineesList
    .map((item, index) => {
      const tr = item.trainee;
      const fullName = formatFullName(tr, preferEnglish);
      const parentName = formatParentFullName(tr, preferEnglish);
      const fullAddress = formatFullAddress(tr, preferEnglish);
      const mobile = tr.parent_mobile || tr.mobile || '-';

      return `<tr>
        <td style="border: 1px solid #333; text-align: center; font-weight: bold; vertical-align: top; padding: 6px 8px; width: 6%;">${index + 1}</td>
        <td style="border: 1px solid #333; text-align: center; font-weight: 600; vertical-align: top; padding: 6px 8px; width: 10%;">${tr.roll_no}</td>
        <td style="border: 1px solid #333; vertical-align: top; padding: 6px 8px; width: 24%;">
          <strong>${fullName}</strong>
          ${tr.enrollment_no ? `<br/><span style="font-size: 11px; color: #475569;">(${tr.enrollment_no})</span>` : ''}
        </td>
        <td style="border: 1px solid #333; vertical-align: top; padding: 6px 8px; width: 22%;">${parentName}</td>
        <td style="border: 1px solid #333; vertical-align: top; padding: 6px 8px; font-size: 12px; line-height: 1.4; width: 28%;">${fullAddress}</td>
        <td style="border: 1px solid #333; text-align: center; vertical-align: top; padding: 6px 8px; font-size: 12px; width: 10%;">${mobile}</td>
      </tr>`;
    })
    .join('\n');

  return `<table style="width: 100%; border-collapse: collapse; margin: 12px 0 16px 0; font-size: 13px;" border="1" cellpadding="6">
    <thead>
      <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
        <th style="border: 1px solid #333; padding: 6px 8px; width: 6%;">${preferEnglish ? 'Sr.' : 'ક્રમ'}</th>
        <th style="border: 1px solid #333; padding: 6px 8px; width: 10%;">${preferEnglish ? 'Roll No' : 'રોલ નં.'}</th>
        <th style="border: 1px solid #333; padding: 6px 8px; width: 24%; text-align: left;">${preferEnglish ? 'Trainee Full Name' : 'તાલીમાર્થીનું નામ'}</th>
        <th style="border: 1px solid #333; padding: 6px 8px; width: 22%; text-align: left;">${preferEnglish ? 'Parent / Father Name' : 'વાલી / પિતાનું નામ'}</th>
        <th style="border: 1px solid #333; padding: 6px 8px; width: 28%; text-align: left;">${preferEnglish ? 'Full Residential Postal Address' : 'રહેઠાણનું સંપૂર્ણ ટપાલ સરનામું'}</th>
        <th style="border: 1px solid #333; padding: 6px 8px; width: 10%;">${preferEnglish ? 'Mobile No' : 'મોબાઈલ નં.'}</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`;
}

/**
 * Generates the official table of attendance / low attendance trainees
 * for embedding into report templates via {{Trainee_Attendance_Table}}.
 */
export function generateTraineeAttendanceTable(
  traineesList: Array<{ trainee: Trainee; attendance?: AttendanceRecord }>,
  preferEnglish = false
): string {
  if (!traineesList || traineesList.length === 0) {
    return `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13.5px;" border="1" cellpadding="6">
      <thead>
        <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
          <th style="width: 6%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Sr.' : 'ક્રમ'}</th>
          <th style="width: 38%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Trainee Name & Address' : 'તાલીમાર્થીનું નામ અને સરનામું'}</th>
          <th style="width: 18%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Absent Since' : 'કઈ તારીખથી સતત ગેરહાજર?'}</th>
          <th style="width: 12%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Monthly %' : 'માસિક %'}</th>
          <th style="width: 12%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Prog. %' : 'સંચિત %'}</th>
          <th style="width: 14%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Remarks' : 'નોંધ'}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="6" style="border: 1px solid #333; padding: 12px; text-align: center; color: #64748b; font-style: italic;">
            ${preferEnglish ? 'No trainees with attendance below 80%.' : 'આ માસ માટે ૮૦% થી ઓછી સંચિત હાજરી વાળો કોઈ તાલીમાર્થી નથી (તમામ તાલીમાર્થીઓ નિયમ અનુસાર છે).'}
          </td>
        </tr>
      </tbody>
    </table>`;
  }

  const rows = traineesList
    .map((item, index) => {
      const tr = item.trainee;
      const att = item.attendance;
      const fullName = formatFullName(tr, preferEnglish);
      const fullAddress = formatFullAddress(tr, preferEnglish);
      const absentSince = att?.continuous_absent_since || att?.absent_from_date || '-';
      const pct = att?.attendance_percentage !== undefined ? `${att.attendance_percentage.toFixed(1)}%` : '-';
      const progPct = att?.progressive_attendance_percentage !== undefined ? `${att.progressive_attendance_percentage.toFixed(1)}%` : pct;
      const remarks = att?.remarks || (preferEnglish ? 'Parent intimation' : 'વાલીને રૂબરૂ બોલાવવા અંગે');

      return `<tr>
        <td style="border: 1px solid #333; text-align: center; font-weight: bold; vertical-align: top; padding: 6px;">${index + 1}</td>
        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
          <strong>${fullName}</strong> (રોલ નં: ${tr.roll_no})<br/>
          <span style="font-size: 12px; color: #334155;">${fullAddress}</span>
        </td>
        <td style="border: 1px solid #333; text-align: center; vertical-align: top; padding: 6px;">${absentSince}</td>
        <td style="border: 1px solid #333; text-align: center; font-weight: bold; vertical-align: top; padding: 6px; color: #b91c1c;">${pct}</td>
        <td style="border: 1px solid #333; text-align: center; font-weight: bold; vertical-align: top; padding: 6px; color: #0369a1;">${progPct}</td>
        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">${remarks}</td>
      </tr>`;
    })
    .join('\n');

  return `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13.5px;" border="1" cellpadding="6">
    <thead>
      <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
        <th style="width: 6%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Sr.' : 'ક્રમ'}</th>
        <th style="width: 38%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Trainee Name & Address' : 'તાલીમાર્થીનું નામ અને સરનામું'}</th>
        <th style="width: 18%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Absent Since' : 'કઈ તારીખથી સતત ગેરહાજર?'}</th>
        <th style="width: 12%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Monthly %' : 'માસિક %'}</th>
        <th style="width: 12%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Prog. %' : 'સંચિત %'}</th>
        <th style="width: 14%; border: 1px solid #333; padding: 6px;">${preferEnglish ? 'Remarks' : 'નોંધ'}</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`;
}

/**
 * Computes the Last Notice Date for a trainee from prior dispatch logs.
 */
export function getPreviousNoticeDate(
  traineeId: string,
  dispatchLogs: DispatchLog[],
  language: 'Gujarati' | 'Hindi' | 'English' = 'Gujarati'
): string {
  const priorLogs = dispatchLogs
    .filter((log) => log.trainee_id === traineeId)
    .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());

  if (priorLogs.length > 0) {
    const d = new Date(priorLogs[0].issue_date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  if (language === 'Gujarati') return 'કોઈ અગાઉની નોટિસ નથી (પ્રથમ નોટિસ)';
  if (language === 'Hindi') return 'कोई पूर्व सूचना नहीं (प्रथम सूचना)';
  return 'None on record (First Notice)';
}

/**
 * Builds the smart formatted parent full name with Grandfather name: {{father_name}} {{grandfather_name}} {{surname}}
 */
export function formatParentFullName(trainee: Trainee, preferEnglish = false): string {
  if (preferEnglish) {
    const father = trainee.father_name_en || trainee.father_name || '';
    const grandfather = trainee.grandfather_name_en || trainee.grandfather_name || '';
    const surname = trainee.surname_en || trainee.surname || '';
    const parts = [father, grandfather, surname].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : `${trainee.father_name} ${trainee.surname}`;
  }
  const parts = [trainee.father_name, trainee.grandfather_name, trainee.surname].filter(Boolean);
  return parts.join(' ').trim();
}

/**
 * Builds the smart full name in regional script or English
 */
export function formatFullName(trainee: Trainee, preferEnglish = false): string {
  if (preferEnglish) {
    const parts = [trainee.surname_en, trainee.student_name_en, trainee.father_name_en].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : `${trainee.surname} ${trainee.student_name}`;
  }
  const parts = [trainee.surname, trainee.student_name, trainee.father_name].filter(Boolean);
  return parts.join(' ');
}

/**
 * Builds the smart formatted full address
 */
export function formatFullAddress(trainee: Trainee, preferEnglish = false): string {
  if (preferEnglish) {
    const villLabel = 'Vill:';
    const talLabel = 'Tal:';
    const distLabel = 'Dist:';
    return `${trainee.address}, ${villLabel} ${trainee.village}, ${talLabel} ${trainee.taluka}, ${distLabel} ${trainee.district} - ${trainee.pincode}`;
  }
  return `${trainee.address}, મુ. ${trainee.village}, તા. ${trainee.taluka}, જિ. ${trainee.district} - ${trainee.pincode}`;
}

/**
 * Replaces all merge tags in a given HTML or text string with resolved context data.
 */
export function mergeTemplateTags(templateHtml: string, context: MergeContext): string {
  const {
    trainee,
    attendance,
    instructor,
    refNumber,
    referenceNumber,
    issueDate,
    noticeIssueDate,
    lastNoticeDate,
    previousNoticeDates,
    firstNoticeDate,
    secondNoticeDate,
    dispatchLogs,
    allLowAttendanceTrainees,
    aiCommentary = 'વિદ્યાર્થીની નિયમિતતા તેમના કૌશલ્ય વિકાસ માટે અનિવાર્ય છે. કૃપા કરીને તાત્કાલિક સંસ્થાનો સંપર્ક કરવો.',
    language = 'Gujarati',
  } = context;

  // Resolve notice history dynamically from dispatchLogs if available
  const history = getNoticeHistory(trainee.id, dispatchLogs);
  const resolvedPrevDates =
    previousNoticeDates !== undefined
      ? previousNoticeDates
      : history.previousNoticeDates;
  const resolvedFirstNotice =
    firstNoticeDate !== undefined
      ? firstNoticeDate
      : history.firstNoticeDate;
  const resolvedSecondNotice =
    secondNoticeDate !== undefined
      ? secondNoticeDate
      : history.secondNoticeDate;
  const resolvedLastNotice =
    lastNoticeDate !== undefined
      ? lastNoticeDate
      : history.lastNoticeDate !== '-'
      ? history.lastNoticeDate
      : '-';
  const resolvedPriorCount = history.priorNoticeCount;

  // Determine effective selected trainees list for multi-student tables and reports
  const selectedTraineesList =
    context.selectedTrainees && context.selectedTrainees.length > 0
      ? context.selectedTrainees
      : (allLowAttendanceTrainees && allLowAttendanceTrainees.length > 0
      ? allLowAttendanceTrainees
      : [{ trainee, attendance }]);

  // Generate Multi-Student Table with customizable columns
  const selectedTraineesTableHtml = generateSelectedTraineesTable(
    selectedTraineesList,
    context.selectedTableColumns,
    language === 'English'
  );

  // Generate Specialized Trainee Address Table for official forwarding letters
  const traineeAddressTableHtml = generateTraineeAddressTable(
    selectedTraineesList,
    language === 'English'
  );

  // Generate Low Attendance Trainee Table (<80%) for Principal Forwarding reports
  const lowAttendanceTableHtml = generateTraineeAttendanceTable(
    context.selectedTrainees && context.selectedTrainees.length > 0
      ? context.selectedTrainees
      : (allLowAttendanceTrainees || [])
  );

  const totalSelectedCount = selectedTraineesList.length;
  const totalSelectedCountGu = toGujaratiNumerals(totalSelectedCount);
  const selectedRollsList = selectedTraineesList
    .map((item) => item.trainee.roll_no)
    .filter(Boolean)
    .join(', ');
  const selectedNamesList = selectedTraineesList
    .map((item) => formatFullName(item.trainee, language === 'English'))
    .filter(Boolean)
    .join(', ');

  const resolvedRefNumber =
    referenceNumber ||
    refNumber ||
    `ITI/${instructor.trade.toUpperCase()}/${new Date().getFullYear()}/IRR-${trainee.roll_no}`;

  const resolvedIssueDate =
    noticeIssueDate ||
    issueDate ||
    new Date().toLocaleDateString('en-GB');

  const preferEn = language === 'English';
  const fullName = formatFullName(trainee, preferEn);
  const parentFullName = formatParentFullName(trainee, preferEn);
  const fullAddress = formatFullAddress(trainee, preferEn);

  const workingDays = context.workingDays ?? attendance?.total_working_days ?? 24;
  const presentDays = context.presentDays ?? attendance?.present_days ?? 0;
  const absentDays = context.absentDays ?? attendance?.absent_days ?? (workingDays - presentDays);
  const percentage = context.attendancePercentage !== undefined
    ? context.attendancePercentage.toFixed(2)
    : attendance?.attendance_percentage !== undefined
    ? attendance.attendance_percentage.toFixed(2)
    : workingDays > 0 ? ((presentDays / workingDays) * 100).toFixed(2) : '0.00';
  const monthYear = context.monthYear ?? attendance?.month_year ?? 'Current Month';

  const progPercentage = context.progressiveAttendancePercentage !== undefined
    ? context.progressiveAttendancePercentage.toFixed(2)
    : attendance?.progressive_attendance_percentage !== undefined
    ? attendance.progressive_attendance_percentage.toFixed(2)
    : percentage;
  const progMonths = context.progressiveRecordedMonths ?? attendance?.progressive_recorded_months ?? 1;
  const progStatus = context.progressiveStatus || (Number(progPercentage) >= 80 ? 'પ્રગતિશીલ સુરક્ષિત (≥૮૦%)' : 'ચેતવણીપાત્ર (<૮૦%)');

  const absentFrom = context.absentFromDate || attendance?.absent_from_date || '૦૧/૦૯/૨૦૨૫';
  const absentTo = context.absentToDate || attendance?.absent_to_date || resolvedIssueDate;
  const contAbsent = context.continuousAbsentSince || attendance?.continuous_absent_since || absentFrom;
  const remarksText = context.remarks || attendance?.remarks || 'વાલીને રૂબરૂ બોલાવવા માટે નોંધ કરેલ છે.';
  const instAddress = instructor.institution_address || 'બક્ષીપંચ હોસ્ટેલની બાજુમાં, સમી-શંખેશ્વર હાઈવે, તા. શંખેશ્વર, જી. પાટણ-૩૮૪૨૪૨';

  const fatherVal = preferEn ? (trainee.father_name_en || trainee.father_name) : trainee.father_name;
  const grandfatherVal = preferEn ? (trainee.grandfather_name_en || trainee.grandfather_name) : trainee.grandfather_name;
  const surnameVal = preferEn ? (trainee.surname_en || trainee.surname) : trainee.surname;

  const replacements: Record<string, string> = {
    // Both full and shorthand tags supported for MS Word templates
    '{{Full_Name}}': fullName,
    '{{full_name}}': fullName,
    '{{Trainee_Full_Name}}': fullName,
    '{{trainee_full_name}}': fullName,
    '{{Trainee_Name}}': fullName,
    '{{trainee_name}}': fullName,
    '{{Trainee_Name_EN}}': formatFullName(trainee, true),
    '{{Parent_Full_Name}}': parentFullName,
    '{{parent_full_name}}': parentFullName,
    '{{Parent_Name}}': parentFullName,
    '{{parent_name}}': parentFullName,
    '{{Father_Full_Name}}': parentFullName,
    '{{father_full_name}}': parentFullName,
    '{{Trainee_Roll_No}}': trainee.roll_no,
    '{{trainee_roll_no}}': trainee.roll_no,
    '{{Roll_No}}': trainee.roll_no,
    '{{roll_no}}': trainee.roll_no,
    '{{Enrollment_No}}': trainee.enrollment_no,
    '{{enrollment_no}}': trainee.enrollment_no,
    '{{Father_Name}}': fatherVal,
    '{{father_name}}': fatherVal,
    '{{Grandfather_Name}}': grandfatherVal,
    '{{grandfather_name}}': grandfatherVal,
    '{{Surname}}': surnameVal,
    '{{surname}}': surnameVal,
    '{{Trainee_Relation}}': 'પુત્રી/પત્ની',
    '{{Full_Address}}': fullAddress,
    '{{Address}}': trainee.address || fullAddress,
    '{{Village}}': trainee.village,
    '{{Taluka}}': trainee.taluka,
    '{{District}}': trainee.district,
    '{{Pincode}}': trainee.pincode,
    '{{Mobile}}': trainee.mobile || '',
    '{{Parent_Mobile}}': trainee.parent_mobile || trainee.mobile || '',
    '{{Category}}': trainee.category || 'General',
    '{{ITI_Name}}': instructor.iti_name,
    '{{Institution_Address}}': instAddress,
    '{{Instructor_Name}}': instructor.name,
    '{{Designation}}': instructor.designation || 'સુપરવાઇઝર ઇન્સ્ટ્રક્ટર',
    '{{Principal_Designation}}': 'આચાર્યશ્રી / વર્ગ-૨ અધિકારી',
    '{{Trade}}': trainee.trade || instructor.trade,
    '{{Batch}}': trainee.batch || instructor.batch,
    '{{Unit}}': trainee.unit || instructor.unit,
    '{{Month_Year}}': monthYear,
    '{{Working_Days}}': String(workingDays),
    '{{Total_Working_Days}}': String(workingDays),
    '{{Present_Days}}': String(presentDays),
    '{{Absent_Days}}': String(absentDays),
    '{{Attendance_Percentage}}%': String(percentage) + '%',
    '{{Attendance_Percentage}}': String(percentage) + '%',
    '{{Progressive_Attendance_Percentage}}%': String(progPercentage) + '%',
    '{{Progressive_Attendance_Percentage}}': String(progPercentage) + '%',
    '{{progressive_attendance_percentage}}': String(progPercentage) + '%',
    '{{Progressive_Recorded_Months}}': String(progMonths),
    '{{progressive_recorded_months}}': String(progMonths),
    '{{Progressive_Status}}': progStatus,
    '{{progressive_status}}': progStatus,
    '{{Absent_From_Date}}': absentFrom,
    '{{Absent_To_Date}}': absentTo,
    '{{Continuous_Absent_Since}}': contAbsent,
    '{{Remarks}}': remarksText,
    '{{Notice_Issue_Date}}': resolvedIssueDate,
    '{{Current_Date}}': resolvedIssueDate,
    '{{Reference_Number}}': resolvedRefNumber,
    '{{Ref_No}}': resolvedRefNumber,
    '{{Outward_No}}': resolvedRefNumber,
    '{{Last_Notice_Date}}': resolvedLastNotice,
    '{{last_notice_date}}': resolvedLastNotice,
    '{{Previous_Notice_Dates}}': resolvedPrevDates,
    '{{previous_notice_dates}}': resolvedPrevDates,
    '{{First_Notice_Date}}': resolvedFirstNotice,
    '{{first_notice_date}}': resolvedFirstNotice,
    '{{Second_Notice_Date}}': resolvedSecondNotice,
    '{{second_notice_date}}': resolvedSecondNotice,
    '{{Trainee_Attendance_Table}}': lowAttendanceTableHtml,
    '{{trainee_attendance_table}}': lowAttendanceTableHtml,
    '{{Selected_Trainees_Table}}': selectedTraineesTableHtml,
    '{{selected_trainees_table}}': selectedTraineesTableHtml,
    '{{Trainee_Address_Table}}': traineeAddressTableHtml,
    '{{trainee_address_table}}': traineeAddressTableHtml,
    '{{Total_Selected_Trainees}}': `${totalSelectedCountGu} (${totalSelectedCount})`,
    '{{total_selected_trainees}}': `${totalSelectedCountGu} (${totalSelectedCount})`,
    '{{Total_Selected_Count}}': `${totalSelectedCountGu}`,
    '{{total_selected_count}}': `${totalSelectedCountGu}`,
    '{{Selected_Trainees_Roll_List}}': selectedRollsList,
    '{{selected_trainees_roll_list}}': selectedRollsList,
    '{{Selected_Trainees_Names_List}}': selectedNamesList,
    '{{selected_trainees_names_list}}': selectedNamesList,
    '{{AI_Commentary}}': aiCommentary,
  };

  let rendered = templateHtml;
  for (const [tag, val] of Object.entries(replacements)) {
    // Replace all occurrences of the tag
    rendered = rendered.split(tag).join(val);
  }

  // Evaluate and replace any Instructor Custom Table Merge Tags (e.g. {{Custom_Table:...}})
  const activeCustomTables = getEffectiveCustomTables(instructor, context.customTableTemplates);
  for (const tableDef of activeCustomTables) {
    if (
      rendered.includes(tableDef.tag_key) ||
      rendered.toLowerCase().includes(tableDef.tag_key.toLowerCase())
    ) {
      const tableHtml = generateCustomTableHtml(tableDef, selectedTraineesList, context);
      // Replace exact and case-insensitive matches
      rendered = rendered.split(tableDef.tag_key).join(tableHtml);
      const lowerTag = tableDef.tag_key.toLowerCase();
      if (rendered.toLowerCase().includes(lowerTag)) {
        const regex = new RegExp(tableDef.tag_key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        rendered = rendered.replace(regex, tableHtml);
      }
    }
  }

  return rendered;
}

/**
 * Generates an HTML table from an Instructor-designed CustomTableTemplate
 * iterating across all selected trainees and evaluating merge tags per cell.
 */
export function generateCustomTableHtml(
  tableDef: CustomTableTemplate,
  traineesList: Array<{ trainee: Trainee; attendance?: AttendanceRecord }>,
  baseContext: MergeContext
): string {
  const preferEnglish = baseContext.language === 'English';
  const cols = tableDef.columns || [];
  const minHeight = tableDef.row_min_height_px || 32;

  if (cols.length === 0) {
    return '';
  }

  const headerCells = cols
    .map((col) => {
      const align = col.align || 'left';
      const widthStyle = col.width ? `width: ${col.width};` : '';
      return `<th style="border: 1px solid #333; padding: 7px 8px; text-align: ${align}; background-color: #f1f5f9; font-size: 12.5px; font-weight: bold; ${widthStyle}">${col.header}</th>`;
    })
    .join('');

  if (!traineesList || traineesList.length === 0) {
    return `<table style="width: 100%; border-collapse: collapse; margin: 12px 0 16px 0; font-size: 12.5px;" border="1" cellpadding="6">
      <thead>
        <tr>${headerCells}</tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="${cols.length}" style="border: 1px solid #333; padding: 12px; text-align: center; color: #64748b; font-style: italic;">
            ${preferEnglish ? 'No trainees selected for this table.' : 'આ પત્રક માટે કોઈ તાલીમાર્થી પસંદ કરેલ નથી.'}
          </td>
        </tr>
      </tbody>
    </table>`;
  }

  const rowsHtml = traineesList
    .map((item, rowIndex) => {
      const tr = item.trainee;
      const att = item.attendance;
      const fullName = formatFullName(tr, preferEnglish);
      const parentFullName = formatParentFullName(tr, preferEnglish);
      const fullAddress = formatFullAddress(tr, preferEnglish);
      const workingDays = att?.total_working_days ?? baseContext.workingDays ?? 24;
      const presentDays = att?.present_days ?? 0;
      const absentDays = att?.absent_days ?? Math.max(0, workingDays - presentDays);
      const pct =
        att?.attendance_percentage !== undefined
          ? `${att.attendance_percentage.toFixed(1)}%`
          : workingDays > 0
          ? `${((presentDays / workingDays) * 100).toFixed(1)}%`
          : '-';
      const progPct =
        att?.progressive_attendance_percentage !== undefined
          ? `${att.progressive_attendance_percentage.toFixed(1)}%`
          : pct;
      const absentSince = att?.continuous_absent_since || att?.absent_from_date || '-';
      const remarksVal = att?.remarks || '';
      const fatherVal = preferEnglish ? (tr.father_name_en || tr.father_name) : tr.father_name;
      const grandfatherVal = preferEnglish ? (tr.grandfather_name_en || tr.grandfather_name) : tr.grandfather_name;
      const surnameVal = preferEnglish ? (tr.surname_en || tr.surname) : tr.surname;

      const rowMap: Record<string, string> = {
        '{{Sr_No}}': String(rowIndex + 1),
        '{{sr_no}}': String(rowIndex + 1),
        '{{Sr_No_Gu}}': toGujaratiNumerals(rowIndex + 1),
        '{{sr_no_gu}}': toGujaratiNumerals(rowIndex + 1),
        '{{Full_Name}}': fullName,
        '{{full_name}}': fullName,
        '{{Trainee_Full_Name}}': fullName,
        '{{Trainee_Name}}': fullName,
        '{{students name}}': fullName,
        '{{Student_Name}}': fullName,
        '{{student_name}}': fullName,
        '{{Parent_Full_Name}}': parentFullName,
        '{{Parent_Name}}': parentFullName,
        '{{Father_Name}}': fatherVal,
        '{{Grandfather_Name}}': grandfatherVal,
        '{{Surname}}': surnameVal,
        '{{Trainee_Roll_No}}': tr.roll_no || '',
        '{{Roll_No}}': tr.roll_no || '',
        '{{roll_no}}': tr.roll_no || '',
        '{{Enrollment_No}}': tr.enrollment_no || '-',
        '{{enrollment_no}}': tr.enrollment_no || '-',
        '{{Full_Address}}': fullAddress,
        '{{full_address}}': fullAddress,
        '{{Address}}': fullAddress,
        '{{address}}': fullAddress,
        '{{Village}}': tr.village || '',
        '{{Taluka}}': tr.taluka || '',
        '{{District}}': tr.district || '',
        '{{Pincode}}': tr.pincode || '',
        '{{Mobile}}': tr.mobile || tr.parent_mobile || '-',
        '{{Parent_Mobile}}': tr.parent_mobile || tr.mobile || '-',
        '{{Category}}': tr.category || 'General',
        '{{Trade}}': tr.trade || baseContext.instructor.trade || '',
        '{{Batch}}': tr.batch || baseContext.instructor.batch || '',
        '{{Unit}}': tr.unit || baseContext.instructor.unit || '',
        '{{Working_Days}}': String(workingDays),
        '{{Present_Days}}': String(presentDays),
        '{{Absent_Days}}': String(absentDays),
        '{{Attendance_Percentage}}': pct,
        '{{Attendance_Percentage}}%': pct,
        '{{Progressive_Attendance_Percentage}}': progPct,
        '{{Progressive_Attendance_Percentage}}%': progPct,
        '{{Continuous_Absent_Since}}': absentSince,
        '{{Absent_From_Date}}': att?.absent_from_date || '-',
        '{{Remarks}}': remarksVal,
      };

      const rowCells = cols
        .map((col) => {
          const align = col.align || 'left';
          const weightStyle = col.bold ? 'font-weight: bold;' : '';
          const widthStyle = col.width ? `width: ${col.width};` : '';

          if (col.is_blank_for_handwriting || !col.cell_template || !col.cell_template.trim()) {
            // Blank column to write by hand after printing on paper
            return `<td style="border: 1px solid #333; padding: 6px 8px; text-align: ${align}; vertical-align: middle; height: ${minHeight}px; ${widthStyle}"><div style="min-height: ${Math.max(18, minHeight - 12)}px;">&nbsp;</div></td>`;
          }

          let evaluated = col.cell_template;
          for (const [k, v] of Object.entries(rowMap)) {
            evaluated = evaluated.split(k).join(v);
          }

          return `<td style="border: 1px solid #333; padding: 6px 8px; text-align: ${align}; vertical-align: top; line-height: 1.4; height: ${minHeight}px; ${weightStyle} ${widthStyle}">${evaluated}</td>`;
        })
        .join('');

      return `<tr>${rowCells}</tr>`;
    })
    .join('\n');

  return `<table style="width: 100%; border-collapse: collapse; margin: 12px 0 16px 0; font-size: 12.5px; line-height: 1.35;" border="1" cellpadding="6">
    <thead>
      <tr style="background-color: #f1f5f9;">
        ${headerCells}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>`;
}
