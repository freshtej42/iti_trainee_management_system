export type Language = 'Gujarati' | 'Hindi' | 'English';

export interface Instructor {
  id: string;
  user_id?: string; // Official User ID / Employee Code (e.g. iti.shankheshwar)
  username?: string; // Optional handle
  name: string;
  email: string;
  email_verified?: boolean; // Whether instructor email has been verified via link
  password?: string;
  iti_name: string;
  trade: string;
  batch: string;
  batches?: string[]; // Multiple batches configured by instructor
  unit: string;
  units?: string[]; // Configured units e.g. ['Unit A', 'Unit B', 'Unit C']
  designation: string;
  phone?: string;
  institution_address?: string;
  outward_code_prefix?: string;
  letterhead_header_url?: string;
  signature_footer_url?: string;
  created_at: string;
}

export interface Trainee {
  id: string;
  instructor_id: string;
  roll_no: string;
  enrollment_no: string;
  trade: string;
  batch: string;
  unit: string; // Unit A, Unit B, Unit C
  // Regional script fields (Gujarati or Hindi)
  surname: string;
  student_name: string;
  father_name: string;
  grandfather_name: string;
  // English script fields
  surname_en: string;
  student_name_en: string;
  father_name_en: string;
  grandfather_name_en: string;
  // Contact & demographic details
  mobile?: string;
  parent_mobile?: string;
  gender?: string;
  category?: string;
  // Address fields
  address: string;
  village: string;
  taluka: string;
  district: string;
  pincode: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  trainee_id: string;
  instructor_id: string;
  month_year: string;
  total_working_days: number;
  present_days: number;
  absent_days: number;
  attendance_percentage: number;
  flagged_low: boolean; // percentage < 80%
  continuous_absent_since?: string; // e.g. "12/08/2025" or "૧૨/૦૮/૨૦૨૫"
  absent_from_date?: string;
  absent_to_date?: string;
  remarks?: string;
  updated_at: string;
}

export interface LetterTemplate {
  id: string;
  instructor_id: string; // 'global' or specific instructor
  template_name: string;
  name?: string; // convenient alias
  language: Language;
  notice_type: '1st Warning' | '2nd Warning' | 'Final Notice' | 'General Notice' | 'Report';
  subject: string;
  content_html: string;
  created_at: string;
  updated_at?: string;
}

export interface DispatchLog {
  id: string;
  trainee_id: string;
  instructor_id: string;
  ref_number?: string;
  outward_number?: string; // alias
  notice_type: '1st Warning' | '2nd Warning' | 'Final Notice' | 'General Notice' | 'Report';
  issued_date?: string;
  issue_date?: string; // alias
  attendance_percentage: number;
  month_year: string;
  status: 'Dispatched' | 'Printed' | 'Drafted' | 'Acknowledged' | 'Delivered';
  notes?: string;
  created_at: string;
}

export interface MergedNoticeData {
  trainee: Trainee;
  attendance: AttendanceRecord;
  instructor: Instructor;
  refNumber: string;
  noticeIssueDate: string;
  lastNoticeDate: string;
  aiCommentary?: string;
  renderedHtml: string;
}
