import { Trainee, AttendanceRecord, Instructor, DispatchLog } from '../types';

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
  aiCommentary?: string;
  language?: 'Gujarati' | 'Hindi' | 'English';
  monthYear?: string;
  workingDays?: number;
  presentDays?: number;
  absentDays?: number;
  attendancePercentage?: number;
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
  { tag: '{{Prior_Notice_Count}}', label: 'Prior Notice Count (અગાઉ મોકલેલ નોટિસ સંખ્યા)', category: 'Dispatch' },
  { tag: '{{Trainee_Attendance_Table}}', label: 'Low Attendance Trainees Table (ઓછી હાજરી વાળા તાલીમાર્થીઓનું પત્રક - આચાર્ય રિપોર્ટ માટે)', category: 'Attendance' },
  { tag: '{{AI_Commentary}}', label: 'AI Smart Parent Advisory (વિશેષ નિર્દેશ)', category: 'Smart AI' },
];

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
 * Generates the official 5-column table of low attendance trainees (<80%)
 * for embedding into the Principal Forwarding Report template via {{Trainee_Attendance_Table}}.
 */
export function generateTraineeAttendanceTable(
  traineesList: Array<{ trainee: Trainee; attendance?: AttendanceRecord }>
): string {
  if (!traineesList || traineesList.length === 0) {
    return `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13.5px;" border="1" cellpadding="6">
      <thead>
        <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
          <th style="width: 8%; border: 1px solid #333; padding: 6px;">ક્રમ</th>
          <th style="width: 44%; border: 1px solid #333; padding: 6px;">તાલીમાર્થીનું નામ અને સરનામું</th>
          <th style="width: 20%; border: 1px solid #333; padding: 6px;">કઈ તારીખથી સતત ગેરહાજર છે?</th>
          <th style="width: 14%; border: 1px solid #333; padding: 6px;">માસ અંતિત હાજરીના ટકા</th>
          <th style="width: 14%; border: 1px solid #333; padding: 6px;">નોંધ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="5" style="border: 1px solid #333; padding: 12px; text-align: center; color: #64748b; font-style: italic;">
            આ માસ માટે ૮૦% થી ઓછી હાજરી વાળો કોઈ તાલીમાર્થી નથી.
          </td>
        </tr>
      </tbody>
    </table>`;
  }

  const rows = traineesList
    .map((item, index) => {
      const tr = item.trainee;
      const att = item.attendance;
      const fullName = formatFullName(tr);
      const fullAddress = formatFullAddress(tr);
      const absentSince = att?.continuous_absent_since || att?.absent_from_date || '-';
      const pct = att?.attendance_percentage !== undefined ? `${att.attendance_percentage.toFixed(2)}%` : '-';
      const remarks = att?.remarks || 'વાલીને રૂબરૂ બોલાવવા અંગે';

      return `<tr>
        <td style="border: 1px solid #333; text-align: center; font-weight: bold; vertical-align: top; padding: 6px;">${index + 1}</td>
        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
          <strong>${fullName}</strong> (રોલ નં: ${tr.roll_no})<br/>
          <span style="font-size: 12px; color: #334155;">${fullAddress}</span>
        </td>
        <td style="border: 1px solid #333; text-align: center; vertical-align: top; padding: 6px;">${absentSince}</td>
        <td style="border: 1px solid #333; text-align: center; font-weight: bold; vertical-align: top; padding: 6px; color: #b91c1c;">${pct}</td>
        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">${remarks}</td>
      </tr>`;
    })
    .join('\\n');

  return `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13.5px;" border="1" cellpadding="6">
    <thead>
      <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
        <th style="width: 8%; border: 1px solid #333; padding: 6px;">ક્રમ</th>
        <th style="width: 44%; border: 1px solid #333; padding: 6px;">તાલીમાર્થીનું નામ અને સરનામું</th>
        <th style="width: 20%; border: 1px solid #333; padding: 6px;">કઈ તારીખથી સતત ગેરહાજર છે?</th>
        <th style="width: 14%; border: 1px solid #333; padding: 6px;">માસ અંતિત હાજરીના ટકા</th>
        <th style="width: 14%; border: 1px solid #333; padding: 6px;">નોંધ</th>
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

  // Generate Low Attendance Trainee Table (<80%) for Principal Forwarding reports
  const lowAttendanceTableHtml = generateTraineeAttendanceTable(
    allLowAttendanceTrainees || []
  );

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
    '{{Prior_Notice_Count}}': String(resolvedPriorCount),
    '{{prior_notice_count}}': String(resolvedPriorCount),
    '{{Trainee_Attendance_Table}}': lowAttendanceTableHtml,
    '{{trainee_attendance_table}}': lowAttendanceTableHtml,
    '{{AI_Commentary}}': aiCommentary,
  };

  let rendered = templateHtml;
  for (const [tag, val] of Object.entries(replacements)) {
    // Replace all occurrences of the tag
    rendered = rendered.split(tag).join(val);
  }

  return rendered;
}
