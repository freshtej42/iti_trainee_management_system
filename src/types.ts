export type Language = 'Gujarati' | 'Hindi' | 'English';

export type UserRole = 'super_admin' | 'instructor';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AcademicUnit {
  id: string;
  name: string; // e.g. "Unit 1" or "Unit A"
}

export interface AcademicBatch {
  id: string;
  name: string; // e.g. "2024–2026" or "2025–2026"
  units: AcademicUnit[];
}

export interface AcademicTrade {
  id: string;
  name: string; // e.g. "કોપા (COPA)" or "ઇલેક્ટ્રિશિયન (Electrician)"
  batches: AcademicBatch[];
}

export interface HeaderConfig {
  logo_url?: string;
  show_logo: boolean;
  logo_width?: number; // e.g. 64px, 80px, 100px
  right_logo_url?: string; // Right emblem / institute logo
  show_right_logo?: boolean;
  right_logo_width?: number;
  center_logo_url?: string; // Optional center emblem
  show_center_logo?: boolean;
  center_logo_width?: number;
  institute_name_gu: string;
  institute_name_en: string;
  department_subtitle: string;
  address: string;
  contact_info?: string;
  ref_prefix: string;
  banner_border_style?: 'double' | 'solid' | 'dashed' | 'none';
  banner_layout?: 'standard' | 'centered' | 'compact';
}

export interface Instructor {
  id: string;
  user_id?: string; // Official User ID / Employee Code (e.g. iti.shankheshwar)
  username?: string; // Optional handle
  name: string;
  name_gu?: string;
  email: string;
  phone: string; // Official Mobile Number (10 digits) - used as Login ID along with Email
  role?: UserRole; // 'super_admin' or 'instructor'
  status?: UserStatus; // 'pending' | 'approved' | 'rejected' | 'suspended'
  email_verified?: boolean; // Whether instructor email has been verified
  mobile_verified?: boolean;
  password?: string;
  iti_name: string;
  trade: string; // Primary active trade
  trades?: string[]; // All configured trades
  batch: string; // Primary active batch
  batches?: string[]; // Configured batches
  unit: string; // Primary active unit
  units?: string[]; // Configured units e.g. ['Unit A', 'Unit B']
  academic_hierarchy?: AcademicTrade[]; // Strict Trade -> Batch -> Unit hierarchy tree
  designation: string;
  institution_address?: string;
  outward_code_prefix?: string;
  letterhead_header_url?: string;
  signature_footer_url?: string;
  header_config?: HeaderConfig;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface Trainee {
  id: string;
  instructor_id: string;
  roll_no: string;
  enrollment_no: string;
  trade: string; // Foreign key / name to AcademicTrade
  batch: string; // Foreign key / name to AcademicBatch
  unit: string; // Foreign key / name to AcademicUnit
  // Regional script fields (Gujarati or Hindi)
  surname: string;
  student_name: string;
  father_name: string;
  grandfather_name: string;
  mother_name?: string;
  // English script fields
  surname_en: string;
  student_name_en: string;
  father_name_en: string;
  grandfather_name_en: string;
  mother_name_en?: string;
  // Contact & demographic details
  mobile?: string;
  parent_mobile?: string;
  gender?: string;
  category?: string; // General, SEBC, SC, ST, EWS
  dob?: string;
  // Address fields
  address: string;
  village: string;
  taluka: string;
  district: string;
  pincode: string;
  created_at: string;
  updated_at?: string;
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
  category?: 'attendance_warning' | 'irregularity_notice' | 'general_report' | 'custom';
  notice_type: '1st Warning' | '2nd Warning' | 'Final Notice' | 'General Notice' | 'Report';
  subject: string;
  content_html: string;
  header_config?: HeaderConfig;
  required_fields?: string[]; // dynamic field tags needed, e.g. ['Trainee_Name', 'Attendance_Percentage']
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

