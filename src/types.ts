export type Language = 'Gujarati' | 'Hindi' | 'English';

export type UserRole = 'super_admin' | 'instructor' | 'guest';
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

export type TradeType = 'engineering' | 'non_engineering';

export interface AcademicTrade {
  id: string;
  name: string; // e.g. "કોપા (COPA)" or "ઇલેક્ટ્રિશિયન (Electrician)"
  trade_type?: TradeType; // 'engineering' or 'non_engineering'
  semester_count?: 2 | 4; // 2 for non-engineering, 4 for engineering
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
  // Custom Letterhead Facilities
  letterhead_mode?: 'tinymce_canvas' | 'standard' | 'custom_banner' | 'blank_for_preprinted';
  letterhead_html?: string; // Rich-text HTML content created and edited via TinyMCE
  custom_banner_image_url?: string; // Pre-designed full letterhead graphic/banner
  custom_banner_height_mm?: number; // Height in mm for custom banner (e.g. 35-50mm)
  custom_banner_margin_bottom_mm?: number; // Space below banner
}

export interface Instructor {
  id: string;
  user_id?: string; // Official User ID / Employee Code (e.g. iti.shankheshwar)
  username?: string; // Optional handle
  name: string; // Name in English
  name_gu?: string; // Name in Gujarati
  email: string;
  phone: string; // Official Mobile Number (10 digits) - used as Login ID along with Email
  role?: UserRole; // 'super_admin' or 'instructor' or 'guest'
  is_guest?: boolean; // Read-only guest mode to check portal facilities before paying
  status?: UserStatus; // 'pending' | 'approved' | 'rejected' | 'suspended'
  email_verified?: boolean; // Whether instructor email has been verified
  mobile_verified?: boolean;
  password?: string;
  iti_name: string; // ITI Name in English
  iti_name_gu?: string; // ITI Name in Gujarati
  trade: string; // Primary active trade in English
  trade_gu?: string; // Trade in Gujarati
  trades?: string[]; // All configured trades
  batch: string; // Primary active batch
  batches?: string[]; // Configured batches
  unit: string; // Primary active unit
  units?: string[]; // Configured units e.g. ['Unit A', 'Unit B']
  academic_hierarchy?: AcademicTrade[]; // Strict Trade -> Batch -> Unit hierarchy tree
  designation: string; // Designation in English
  designation_gu?: string; // Designation in Gujarati
  institution_address?: string; // Address in English
  institution_address_gu?: string; // Address in Gujarati
  outward_code_prefix?: string;
  letterhead_header_url?: string;
  letterhead_html?: string; // Global default TinyMCE rich-text letterhead HTML
  signature_footer_url?: string;
  header_config?: HeaderConfig;
  payment_screenshot_url?: string; // Uploaded payment receipt image
  payment_utr?: string; // UTR or UPI Transaction Reference Number
  payment_mobile?: string; // Mobile number used for payment
  payment_amount?: number; // Payment amount (default 9)
  payment_submitted_at?: string; // Timestamp when payment screenshot was uploaded
  payment_verified_at?: string; // Super Admin verification timestamp
  approved_at?: string;
  approved_by?: string;
  valid_until?: string; // Account expiration timestamp (1 year from approval date, undefined/lifetime for super admin)
  custom_table_templates?: CustomTableTemplate[]; // User-created custom table merge tags
  created_at: string;
  updated_at?: string;
}

export interface SuperAdminSettings {
  upi_id: string; // e.g. tejassuthar21696@okhdfcbank
  payee_name: string; // e.g. Tejas Suthar
  fee_amount: number; // ₹49
  payment_instructions?: string;
  qr_enabled: boolean;
  qr_image_url?: string; // QR code image added/uploaded by super admin for payment
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
  // Regional script fields (Gujarati)
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
  // Address fields in English & Gujarati
  address: string; // English Address
  address_gu?: string; // Gujarati Address
  village: string; // English Village / City
  village_gu?: string; // Gujarati Village / City
  taluka: string; // English Taluka
  taluka_gu?: string; // Gujarati Taluka
  district: string; // English District
  district_gu?: string; // Gujarati District
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
  // Progressive Attendance fields
  progressive_attendance_percentage?: number; // Average of recorded monthly percentages
  progressive_recorded_months?: number; // Total months recorded in session
  progressive_safe?: boolean; // Monthly < 80% but Progressive >= 80% (Exempt from notice)
  requires_notice?: boolean; // Progressive < 80%
  continuous_absent_since?: string; // e.g. "12/08/2026" or "૧૨/૦૮/૨૦૨૬"
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
  category?: 'attendance_warning' | 'irregularity_notice' | 'general_report' | 'principal_report' | 'general_notice' | 'custom';
  notice_type: '1st Warning' | '2nd Warning' | 'Final Notice' | 'General Notice' | 'Parent Notice' | 'Report';
  subject: string;
  content_html: string;
  header_config?: HeaderConfig;
  letterhead_html?: string; // Template-specific TinyMCE rich-text letterhead HTML
  use_custom_letterhead?: boolean; // True if using template-specific letterhead rather than global instructor default
  show_letterhead?: boolean; // Facility to toggle letterhead per template
  required_fields?: string[];
  multi_student_mode?: 'individual' | 'consolidated' | 'both';
  table_columns?: string[];
  created_at: string;
  updated_at?: string;
}

export interface CustomTableColumn {
  id: string;
  header: string; // Column header name, e.g. 'તાલીમાર્થીનું નામ', 'સરનામું', 'નોંધ / સહી'
  cell_template: string; // Merge tag expression e.g. '{{Full_Name}}' or '' if left blank for writing on paper
  is_blank_for_handwriting?: boolean; // True when column is left blank to write by hand after printing
  align?: 'left' | 'center' | 'right';
  width?: string; // e.g. '25%' or 'auto'
  min_width_px?: number; // Minimum width in px e.g. 70, 120
  bold?: boolean;
}

export interface CustomTableTemplate {
  id: string;
  name: string; // Display label e.g. 'વાલી મીટિંગ સહી પત્રક'
  tag_key: string; // Merge tag e.g. '{{Custom_Table:Vali_Meeting_Sign}}'
  description?: string;
  columns: CustomTableColumn[];
  row_min_height_px?: number; // Minimum height in px to allow comfortable handwriting after print
  created_at: string;
  updated_at?: string;
}

export type MultiStudentTableColumnKey =
  | 'sr_no'
  | 'roll_no'
  | 'enrollment_no'
  | 'full_name'
  | 'parent_name'
  | 'address'
  | 'mobile'
  | 'attendance_pct'
  | 'absent_since'
  | 'remarks';

export interface MultiStudentTableColumnDef {
  key: MultiStudentTableColumnKey;
  labelGu: string;
  labelEn: string;
  defaultVisible: boolean;
  width?: string;
}


export interface DispatchLog {
  id: string;
  trainee_id: string;
  instructor_id: string;
  ref_number?: string;
  outward_number?: string; // alias
  notice_type: string;
  issued_date?: string;
  issue_date?: string; // alias
  attendance_percentage?: number;
  month_year: string;
  status: 'Dispatched' | 'Printed' | 'Drafted' | 'Acknowledged' | 'Delivered';
  subject?: string;
  sender_recipient?: string;
  notes?: string;
  tracking_number?: string;
  dispatch_mode?: string;
  entry_type?: 'outward' | 'inward';
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

// ----------------------------------------------------
// FORMATIVE ASSESSMENT (FAR-1) TYPES
// ----------------------------------------------------

export interface FormativeScores {
  // 1. Safety consciousness (Max: 15)
  safety_dress: number; // Max 2
  safety_ppe: number; // Max 5
  safety_apply: number; // Max 8

  // 2. Workplace hygiene & economical use of materials (Max: 10)
  hygiene_clean: number; // Max 3
  hygiene_scrap: number; // Max 2
  hygiene_material: number; // Max 5

  // 3. Attendance/Punctuality (Max: 10)
  attendance_initiative: number; // Max 3
  attendance_accountability: number; // Max 3
  attendance_participative: number; // Max 4

  // 4. Ability to follow manuals (Max: 5)
  manuals_select: number; // Max 1
  manuals_search: number; // Max 2
  manuals_interpret: number; // Max 2

  // 5. Application of knowledge (Max: 10)
  knowledge_plan: number; // Max 4
  knowledge_tools: number; // Max 3
  knowledge_review: number; // Max 3

  // 6. Skills to handle tools & equipment (Max: 10)
  tools_handle: number; // Max 4
  tools_safety: number; // Max 3
  tools_maintain: number; // Max 3

  // 7. Speed in doing work (Max: 10)
  speed_sequence: number; // Max 3
  speed_technique: number; // Max 5
  speed_review: number; // Max 2

  // 8. Quality in workmanship (Max: 15)
  quality_accuracy: number; // Max 7
  quality_conform: number; // Max 3
  quality_purpose: number; // Max 5

  // 9. VIVA (Max: 15)
  viva_clarity: number; // Max 15
}

export type FormativeScoreKey = keyof FormativeScores;

export interface FormativeCategoryTotals {
  safety_total: number; // Max 15
  hygiene_total: number; // Max 10
  attendance_total: number; // Max 10
  manuals_total: number; // Max 5
  knowledge_total: number; // Max 10
  tools_total: number; // Max 10
  speed_total: number; // Max 10
  quality_total: number; // Max 15
  viva_total: number; // Max 15
  grand_total: number; // Max 100
}

export interface FormativePracticalEntry {
  id: string;
  semester?: number; // 1, 2, 3, or 4
  lo_number: string; // e.g. "LO1", "LO2"
  practical_number: string; // e.g. "P1", "P2", "P33"
  practical_title?: string; // Optional descriptive title
  target_marks_100: number; // Target score out of 100 (e.g. 82)
  scores: FormativeScores;
  is_cleared?: boolean; // True if trainee left institute / absent for this practical
  cleared_reason?: string; // e.g. "Left institute after P36 on 05-11-2026"
}

export interface FormativeAssessmentSheet {
  id: string;
  instructor_id: string;
  trainee_id: string;
  trainee_name: string;
  roll_no: string | number;
  trade_name: string;
  trade_type?: TradeType;
  semester: number; // 1, 2, 3, or 4
  total_semesters?: 2 | 4;
  batch_no: string;
  session_year: string; // e.g. "2026-27"
  assessment_date: string;
  iti_name: string;
  industry_name?: string;
  assessment_location: 'ITI' | 'Industry';
  duration: string; // e.g. "1 Year" or "2 Years"
  practicals: FormativePracticalEntry[];
  sign_fi?: string;
  left_institute?: boolean; // Trainee left institute
  leaving_date?: string; // Date trainee left
  last_appeared_practical?: string; // Cutoff practical e.g. "P36"
  updated_at: string;
}

export interface PracticalCurriculumItem {
  id: string;
  practical_number: string; // e.g. "P1"
  practical_title: string;
}

export interface LOCurriculumItem {
  id: string;
  lo_number: string; // e.g. "LO1"
  lo_title: string;
  practicals: PracticalCurriculumItem[];
}

export interface SemesterCurriculum {
  semester: number; // 1, 2, 3, 4
  learning_outcomes: LOCurriculumItem[];
}

export interface BatchTraineeScoreRow {
  trainee: Trainee;
  target_marks_100: number;
  lo_marks?: Record<string, number>; // Marks per LO e.g. { LO1: 85, LO2: 80 }
  is_distributed: boolean;
  total_practical_count: number;
  attendance_percentage: number;
  left_institute?: boolean;
  leaving_date?: string;
  last_appeared_practical?: string;
  last_updated?: string;
}


