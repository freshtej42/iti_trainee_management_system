import { Instructor, Trainee, AttendanceRecord, LetterTemplate, DispatchLog } from '../types';

/**
 * Isolated Demo Guest Instructor Profile
 * Used for prospective instructors and evaluators to explore all portal features
 * in an interactive in-session sandbox without touching production databases.
 */
export const DEMO_GUEST_INSTRUCTOR: Instructor = {
  id: 'guest-demo-instructor',
  user_id: 'iti.guest.demo',
  username: 'guest_demo',
  name: 'અતિથિ મુલાકાતી (ડેમો એકાઉન્ટ)',
  name_gu: 'અતિથિ મુલાકાતી (ડેમો એકાઉન્ટ)',
  email: 'guest@itidemo.gov.in',
  email_verified: true,
  mobile_verified: true,
  password: 'Guest@Demo2026!',
  role: 'guest',
  is_guest: true,
  status: 'approved',
  iti_name: 'ઔદ્યોગિક તાલીમ સંસ્થા, ગાંધીનગર (ડેમો કેમ્પસ)',
  trade: 'કોપા (COPA)',
  trades: ['કોપા (COPA)', 'ઇલેક્ટ્રિશિયન (Electrician)'],
  batch: '84',
  batches: ['84', '85'],
  unit: 'Unit A',
  units: ['Unit A', 'Unit B'],
  academic_hierarchy: [
    {
      id: 'trade-demo-copa',
      name: 'કોપા (COPA)',
      batches: [
        {
          id: 'batch-demo-copa-84',
          name: '84',
          units: [
            { id: 'unit-demo-copa-84-a', name: 'Unit A' },
            { id: 'unit-demo-copa-84-b', name: 'Unit B' },
          ],
        },
        {
          id: 'batch-demo-copa-85',
          name: '85',
          units: [
            { id: 'unit-demo-copa-85-a', name: 'Unit A' },
          ],
        },
      ],
    },
    {
      id: 'trade-demo-elec',
      name: 'ઇલેક્ટ્રિશિયન (Electrician)',
      batches: [
        {
          id: 'batch-demo-elec-84',
          name: '84',
          units: [
            { id: 'unit-demo-elec-84-a', name: 'Unit A' },
          ],
        },
        {
          id: 'batch-demo-elec-85',
          name: '85',
          units: [
            { id: 'unit-demo-elec-85-a', name: 'Unit A' },
          ],
        },
      ],
    },
  ],
  designation: 'સુપરવાઇઝર ઇન્સ્ટ્રક્ટર (ડેમો મોડ)',
  phone: '9999900000',
  institution_address: 'સેક્ટર-૧૫, જી.ઈ.સી. કેમ્પસ પાસે, ગાંધીનગર-૩૮૨૦૧૬',
  outward_code_prefix: 'ઔતાસં/ગાંધીનગર/ડેમો',
  header_config: {
    show_logo: true,
    institute_name_gu: 'ઔદ્યોગિક તાલીમ સંસ્થા, ગાંધીનગર (ડેમો કેમ્પસ)',
    institute_name_en: 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE, GANDHINAGAR (DEMO)',
    department_subtitle: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગુજરાત રાજ્ય',
    address: 'સેક્ટર-૧૫, જી.ઈ.સી. કેમ્પસ પાસે, ગાંધીનગર-૩૮૨૦૧૬',
    ref_prefix: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૬',
  },
  approved_at: '2026-01-01T10:00:00Z',
  valid_until: '2099-12-31T23:59:59Z',
  created_at: '2026-01-01T10:00:00Z',
};

/**
 * Isolated Sample Trainees for Demo Account across Trades (COPA, Electrician),
 * Batches (84, 85), and Units (Unit A, Unit B)
 */
export const DEMO_SAMPLE_TRAINEES: Trainee[] = [
  // --- COPA | Batch 84 | Unit A ---
  {
    id: 'demo-tr-1',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૧',
    enrollment_no: 'ITI/GNR/COPA/84/01',
    trade: 'કોપા (COPA)',
    batch: '84',
    unit: 'Unit A',
    surname: 'પટેલ',
    student_name: 'આયુષકુમાર',
    father_name: 'રમેશભાઈ',
    grandfather_name: 'કાંતિલાલ',
    surname_en: 'Patel',
    student_name_en: 'Ayushkumar',
    father_name_en: 'Rameshbhai',
    grandfather_name_en: 'Kantilal',
    mobile: '9879012341',
    parent_mobile: '9879012342',
    address: 'ઘ-૫, સેક્ટર-૨૧, ગાયત્રી મંદિર પાસે',
    village: 'ગાંધીનગર',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૦૨૧',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-2',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૨',
    enrollment_no: 'ITI/GNR/COPA/84/02',
    trade: 'કોપા (COPA)',
    batch: '84',
    unit: 'Unit A',
    surname: 'પરમાર',
    student_name: 'દિવ્યાંગ',
    father_name: 'મુકેશભાઈ',
    grandfather_name: 'ધનજીભાઈ',
    surname_en: 'Parmar',
    student_name_en: 'Divyang',
    father_name_en: 'Mukeshbhai',
    grandfather_name_en: 'Dhanjibhai',
    mobile: '9879012343',
    parent_mobile: '9879012344',
    address: 'પ્લોટ નં. ૧૪, અક્ષરધામ રોડ, સેક્ટર-૨૦',
    village: 'ગાંધીનગર',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૦૨૦',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-3',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૩',
    enrollment_no: 'ITI/GNR/COPA/84/03',
    trade: 'કોપા (COPA)',
    batch: '84',
    unit: 'Unit A',
    surname: 'શાહ',
    student_name: 'પ્રિયાબેન',
    father_name: 'જીગ્નેશભાઈ',
    grandfather_name: 'નરેન્દ્રભાઈ',
    surname_en: 'Shah',
    student_name_en: 'Priyaben',
    father_name_en: 'Jigneshbhai',
    grandfather_name_en: 'Narendrabhai',
    mobile: '9879012345',
    parent_mobile: '9879012346',
    address: 'મુ. કલોલ, સ્ટેશન રોડ, જલારામ સોસાયટી',
    village: 'કલોલ',
    taluka: 'કલોલ',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૭૨૧',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-4',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૪',
    enrollment_no: 'ITI/GNR/COPA/84/04',
    trade: 'કોપા (COPA)',
    batch: '84',
    unit: 'Unit A',
    surname: 'ઠાકોર',
    student_name: 'વિજયજી',
    father_name: 'કાંતિજી',
    grandfather_name: 'ભવાનજી',
    surname_en: 'Thakor',
    student_name_en: 'Vijayji',
    father_name_en: 'Kantiji',
    grandfather_name_en: 'Bhavanji',
    mobile: '9879012347',
    parent_mobile: '9879012348',
    address: 'મુ. માણસા, બસ સ્ટેન્ડ પાસે',
    village: 'માણસા',
    taluka: 'માણસા',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૮૪૫',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-5',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૫',
    enrollment_no: 'ITI/GNR/COPA/84/05',
    trade: 'કોપા (COPA)',
    batch: '84',
    unit: 'Unit A',
    surname: 'દેસાઈ',
    student_name: 'મિતેષકુમાર',
    father_name: 'બાબુભાઈ',
    grandfather_name: 'હરગોવનભાઈ',
    surname_en: 'Desai',
    student_name_en: 'Miteshkumar',
    father_name_en: 'Babubhai',
    grandfather_name_en: 'Hargovanbhai',
    mobile: '9879012349',
    parent_mobile: '9879012350',
    address: 'મુ. પેથાપુર, રબારી વાસ',
    village: 'પેથાપુર',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૬૧૦',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-6',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૬',
    enrollment_no: 'ITI/GNR/COPA/84/06',
    trade: 'કોપા (COPA)',
    batch: '84',
    unit: 'Unit A',
    surname: 'ચૌધરી',
    student_name: 'નેહાબેન',
    father_name: 'કાનજીભાઈ',
    grandfather_name: 'વીરાભાઈ',
    surname_en: 'Chaudhari',
    student_name_en: 'Nehaben',
    father_name_en: 'Kanjibhai',
    grandfather_name_en: 'Virabhai',
    mobile: '9879012351',
    parent_mobile: '9879012352',
    address: 'મુ. દહેગામ, નેહરુ રોડ',
    village: 'દહેગામ',
    taluka: 'દહેગામ',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૮૧૦',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-7',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૭',
    enrollment_no: 'ITI/GNR/COPA/84/07',
    trade: 'કોપા (COPA)',
    batch: '84',
    unit: 'Unit A',
    surname: 'પ્રજાપતિ',
    student_name: 'હર્ષ',
    father_name: 'મહેશભાઈ',
    grandfather_name: 'જયંતિલાલ',
    surname_en: 'Prajapati',
    student_name_en: 'Harsh',
    father_name_en: 'Maheshbhai',
    grandfather_name_en: 'Jayantilal',
    mobile: '9879012353',
    parent_mobile: '9879012354',
    address: 'સેક્ટર-૬/બી, કુંભાર વાડા',
    village: 'ગાંધીનગર',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૦૦૬',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-8',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૮',
    enrollment_no: 'ITI/GNR/COPA/84/08',
    trade: 'કોપા (COPA)',
    batch: '84',
    unit: 'Unit A',
    surname: 'વાઘેલા',
    student_name: 'રોહિત',
    father_name: 'દિનેશભાઈ',
    grandfather_name: 'કાળુભાઈ',
    surname_en: 'Vaghela',
    student_name_en: 'Rohit',
    father_name_en: 'Dineshbhai',
    grandfather_name_en: 'Kalubhai',
    mobile: '9879012355',
    parent_mobile: '9879012356',
    address: 'સેક્ટર-૨૪, ઇન્દિરા નગર',
    village: 'ગાંધીનગર',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૦૨૪',
    created_at: '2026-07-01T10:00:00Z',
  },

  // --- COPA | Batch 84 | Unit B ---
  {
    id: 'demo-tr-9',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૯',
    enrollment_no: 'ITI/GNR/COPA/84/09',
    trade: 'કોપા (COPA)',
    batch: '84',
    unit: 'Unit B',
    surname: 'સોની',
    student_name: 'દિશાબેન',
    father_name: 'સંજયભાઈ',
    grandfather_name: 'રતિલાલ',
    surname_en: 'Soni',
    student_name_en: 'Dishaben',
    father_name_en: 'Sanjaybhai',
    grandfather_name_en: 'Ratilal',
    mobile: '9879012357',
    parent_mobile: '9879012358',
    address: 'સેક્ટર-૨૨, સોની બજાર',
    village: 'ગાંધીનગર',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૦૨૨',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-10',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૧૦',
    enrollment_no: 'ITI/GNR/COPA/84/10',
    trade: 'કોપા (COPA)',
    batch: '84',
    unit: 'Unit B',
    surname: 'જોષી',
    student_name: 'ભાવેશ',
    father_name: 'પરેશભાઈ',
    grandfather_name: 'હરિશંકર',
    surname_en: 'Joshi',
    student_name_en: 'Bhavesh',
    father_name_en: 'Pareshbhai',
    grandfather_name_en: 'Harishankar',
    mobile: '9879012359',
    parent_mobile: '9879012360',
    address: 'સેક્ટર-૭, બ્રાહ્મણ સોસાયટી',
    village: 'ગાંધીનગર',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૦૦૭',
    created_at: '2026-07-01T10:00:00Z',
  },

  // --- COPA | Batch 85 | Unit A ---
  {
    id: 'demo-tr-11',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૧૧',
    enrollment_no: 'ITI/GNR/COPA/85/01',
    trade: 'કોપા (COPA)',
    batch: '85',
    unit: 'Unit A',
    surname: 'રાઠોડ',
    student_name: 'કિરણબેન',
    father_name: 'રાજેન્દ્રસિંહ',
    grandfather_name: 'પ્રતાપસિંહ',
    surname_en: 'Rathod',
    student_name_en: 'Kiranben',
    father_name_en: 'Rajendrasinh',
    grandfather_name_en: 'Pratapsinh',
    mobile: '9879012361',
    parent_mobile: '9879012362',
    address: 'મુ. અડાલજ, વાવ રોડ',
    village: 'અડાલજ',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૪૨૧',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-12',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૧૨',
    enrollment_no: 'ITI/GNR/COPA/85/02',
    trade: 'કોપા (COPA)',
    batch: '85',
    unit: 'Unit A',
    surname: 'મકવાણા',
    student_name: 'સાગરકુમાર',
    father_name: 'נתુભાઈ',
    grandfather_name: 'સોમાભાઈ',
    surname_en: 'Makwana',
    student_name_en: 'Sagarkumar',
    father_name_en: 'Natubhai',
    grandfather_name_en: 'Somabhai',
    mobile: '9879012363',
    parent_mobile: '9879012364',
    address: 'સેક્ટર-૧૩, છાપરા વિસ્તાર',
    village: 'ગાંધીનગર',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૦૧૩',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-13',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૧૩',
    enrollment_no: 'ITI/GNR/COPA/85/03',
    trade: 'કોપા (COPA)',
    batch: '85',
    unit: 'Unit A',
    surname: 'પંચાલ',
    student_name: 'નિલેશ',
    father_name: 'અશોકભાઈ',
    grandfather_name: 'મગનભાઈ',
    surname_en: 'Panchal',
    student_name_en: 'Nilesh',
    father_name_en: 'Ashokbhai',
    grandfather_name_en: 'Maganbhai',
    mobile: '9879012365',
    parent_mobile: '9879012366',
    address: 'મુ. સરગાસણ, વિશ્વકર્મા સોસાયટી',
    village: 'સરગાસણ',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૪૨૧',
    created_at: '2026-07-01T10:00:00Z',
  },

  // --- Electrician | Batch 84 | Unit A ---
  {
    id: 'demo-tr-14',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૧',
    enrollment_no: 'ITI/GNR/ELEC/84/01',
    trade: 'ઇલેક્ટ્રિશિયન (Electrician)',
    batch: '84',
    unit: 'Unit A',
    surname: 'સુથાર',
    student_name: 'ચિરાગકુમાર',
    father_name: 'વિષ્ણુભાઈ',
    grandfather_name: 'અંબાલાલ',
    surname_en: 'Suthar',
    student_name_en: 'Chiragkumar',
    father_name_en: 'Vishnubhai',
    grandfather_name_en: 'Ambalal',
    mobile: '9879012367',
    parent_mobile: '9879012368',
    address: 'મુ. કુડાસણ, રાધે પાર્ક',
    village: 'કુડાસણ',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૪૨૧',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'demo-tr-15',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૨',
    enrollment_no: 'ITI/GNR/ELEC/84/02',
    trade: 'ઇલેક્ટ્રિશિયન (Electrician)',
    batch: '84',
    unit: 'Unit A',
    surname: 'સોલંકી',
    student_name: 'અજયસિંહ',
    father_name: 'દિલીપસિંહ',
    grandfather_name: 'નારાયણસિંહ',
    surname_en: 'Solanki',
    student_name_en: 'Ajaysinh',
    father_name_en: 'Dilipsinh',
    grandfather_name_en: 'Narayansinh',
    mobile: '9879012369',
    parent_mobile: '9879012370',
    address: 'મુ. ચિલોડા, હિંમતનગર હાઈવે',
    village: 'ચિલોડા',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૩૫૫',
    created_at: '2026-07-01T10:00:00Z',
  },
];

/**
 * Isolated Multi-Month Demo Attendance Records (July 2026, August 2026, September 2026)
 * Demonstrates regular >=80%, low <80%, progressive-safe, and continuous absence cases.
 */
export const DEMO_SAMPLE_ATTENDANCE: AttendanceRecord[] = [
  // ================= JULY 2026 (24 Working Days) =================
  {
    id: 'att-demo-jul-1',
    trainee_id: 'demo-tr-1',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 23,
    absent_days: 1,
    attendance_percentage: 95.8,
    flagged_low: false,
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-2',
    trainee_id: 'demo-tr-2',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 15,
    absent_days: 9,
    attendance_percentage: 62.5,
    flagged_low: true,
    continuous_absent_since: '૧૫/૦૭/૨૦૨૬',
    absent_from_date: '૧૫/૦૭/૨૦૨૬',
    absent_to_date: '૨૪/૦૭/૨૦૨૬',
    remarks: 'પ્રથમ માસથી જ અનિયમિત.',
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-3',
    trainee_id: 'demo-tr-3',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 23,
    absent_days: 1,
    attendance_percentage: 95.8,
    flagged_low: false,
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-4',
    trainee_id: 'demo-tr-4',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 18,
    absent_days: 6,
    attendance_percentage: 75.0,
    flagged_low: true,
    remarks: 'જુલાઈમાં ૭૫% હાજરી.',
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-5',
    trainee_id: 'demo-tr-5',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 23,
    absent_days: 1,
    attendance_percentage: 95.8,
    flagged_low: false,
    remarks: 'જુલાઈમાં ઉત્તમ હાજરી (પ્રગતિશીલ સુરક્ષિત કેસ માટે મહત્વપૂર્ણ).',
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-6',
    trainee_id: 'demo-tr-6',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 22,
    absent_days: 2,
    attendance_percentage: 91.7,
    flagged_low: false,
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-7',
    trainee_id: 'demo-tr-7',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 13,
    absent_days: 11,
    attendance_percentage: 54.2,
    flagged_low: true,
    continuous_absent_since: '૧૧/૦૭/૨૦૨૬',
    absent_from_date: '૧૧/૦૭/૨૦૨૬',
    absent_to_date: '૨૨/૦૭/૨૦૨૬',
    remarks: 'સતત ગેરહાજર.',
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-8',
    trainee_id: 'demo-tr-8',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 24,
    absent_days: 0,
    attendance_percentage: 100.0,
    flagged_low: false,
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-9',
    trainee_id: 'demo-tr-9',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 21,
    absent_days: 3,
    attendance_percentage: 87.5,
    flagged_low: false,
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-10',
    trainee_id: 'demo-tr-10',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 16,
    absent_days: 8,
    attendance_percentage: 66.7,
    flagged_low: true,
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-11',
    trainee_id: 'demo-tr-11',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 22,
    absent_days: 2,
    attendance_percentage: 91.7,
    flagged_low: false,
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-12',
    trainee_id: 'demo-tr-12',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 14,
    absent_days: 10,
    attendance_percentage: 58.3,
    flagged_low: true,
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-13',
    trainee_id: 'demo-tr-13',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 20,
    absent_days: 4,
    attendance_percentage: 83.3,
    flagged_low: false,
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-14',
    trainee_id: 'demo-tr-14',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 23,
    absent_days: 1,
    attendance_percentage: 95.8,
    flagged_low: false,
    updated_at: '2026-07-31T17:00:00Z',
  },
  {
    id: 'att-demo-jul-15',
    trainee_id: 'demo-tr-15',
    instructor_id: 'guest-demo-instructor',
    month_year: 'July 2026',
    total_working_days: 24,
    present_days: 15,
    absent_days: 9,
    attendance_percentage: 62.5,
    flagged_low: true,
    updated_at: '2026-07-31T17:00:00Z',
  },

  // ================= AUGUST 2026 (25 Working Days) =================
  {
    id: 'att-demo-aug-1',
    trainee_id: 'demo-tr-1',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 23,
    absent_days: 2,
    attendance_percentage: 92.0,
    flagged_low: false,
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-2',
    trainee_id: 'demo-tr-2',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 15,
    absent_days: 10,
    attendance_percentage: 60.0,
    flagged_low: true,
    continuous_absent_since: '૧૪/૦૮/૨૦૨૬',
    absent_from_date: '૧૪/૦૮/૨૦૨૬',
    absent_to_date: '૨૫/૦૮/૨૦૨૬',
    remarks: 'તબિયત ખરાબ હોવાનું જણાવેલ પરંતુ મેડિકલ સર્ટિફિકેટ બાકી.',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-3',
    trainee_id: 'demo-tr-3',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 24,
    absent_days: 1,
    attendance_percentage: 96.0,
    flagged_low: false,
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-4',
    trainee_id: 'demo-tr-4',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 17,
    absent_days: 8,
    attendance_percentage: 68.0,
    flagged_low: true,
    continuous_absent_since: '૧૯/૦૮/૨૦૨૬',
    absent_from_date: '૧૯/૦૮/૨૦૨૬',
    absent_to_date: '૨૭/૦૮/૨૦૨૬',
    remarks: 'ખેતીકામ હોવાથી ગેરહાજર રહ્યા હોવાની મૌખિક જાણ કરેલ છે.',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-5',
    trainee_id: 'demo-tr-5',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 19,
    absent_days: 6,
    attendance_percentage: 76.0,
    flagged_low: true,
    remarks: 'ઓગસ્ટમાં ૭૬% હાજરી, પરંતુ સંચિત સરેરાશ ≥૮૦% હોવાથી પ્રગતિશીલ સુરક્ષિત.',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-6',
    trainee_id: 'demo-tr-6',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 22,
    absent_days: 3,
    attendance_percentage: 88.0,
    flagged_low: false,
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-7',
    trainee_id: 'demo-tr-7',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 14,
    absent_days: 11,
    attendance_percentage: 56.0,
    flagged_low: true,
    continuous_absent_since: '૧૧/૦૮/૨૦૨૬',
    absent_from_date: '૧૧/૦૮/૨૦૨૬',
    absent_to_date: '૨૩/૦૮/૨૦૨૬',
    remarks: 'લાંબા સમયથી ગેરહાજર, વાલીનો સંપર્ક થઈ શક્યો નથી.',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-8',
    trainee_id: 'demo-tr-8',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 25,
    absent_days: 0,
    attendance_percentage: 100.0,
    flagged_low: false,
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-9',
    trainee_id: 'demo-tr-9',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 21,
    absent_days: 4,
    attendance_percentage: 84.0,
    flagged_low: false,
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-10',
    trainee_id: 'demo-tr-10',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 18,
    absent_days: 7,
    attendance_percentage: 72.0,
    flagged_low: true,
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-11',
    trainee_id: 'demo-tr-11',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 23,
    absent_days: 2,
    attendance_percentage: 92.0,
    flagged_low: false,
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-12',
    trainee_id: 'demo-tr-12',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 16,
    absent_days: 9,
    attendance_percentage: 64.0,
    flagged_low: true,
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-13',
    trainee_id: 'demo-tr-13',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 22,
    absent_days: 3,
    attendance_percentage: 88.0,
    flagged_low: false,
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-14',
    trainee_id: 'demo-tr-14',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 24,
    absent_days: 1,
    attendance_percentage: 96.0,
    flagged_low: false,
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-demo-aug-15',
    trainee_id: 'demo-tr-15',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 25,
    present_days: 17,
    absent_days: 8,
    attendance_percentage: 68.0,
    flagged_low: true,
    updated_at: '2026-08-31T17:00:00Z',
  },

  // ================= SEPTEMBER 2026 (24 Working Days) =================
  {
    id: 'att-demo-sep-1',
    trainee_id: 'demo-tr-1',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 22,
    absent_days: 2,
    attendance_percentage: 91.7,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-2',
    trainee_id: 'demo-tr-2',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 16,
    absent_days: 8,
    attendance_percentage: 66.7,
    flagged_low: true,
    continuous_absent_since: '૧૮/૦૯/૨૦૨૬',
    absent_from_date: '૧૮/૦૯/૨૦૨૬',
    absent_to_date: '૨૬/૦૯/૨૦૨૬',
    remarks: 'પ્રથમ નોટિસ બાદ પણ હાજરીમાં પૂરતો સુધારો નથી.',
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-3',
    trainee_id: 'demo-tr-3',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 23,
    absent_days: 1,
    attendance_percentage: 95.8,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-4',
    trainee_id: 'demo-tr-4',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 17,
    absent_days: 7,
    attendance_percentage: 70.8,
    flagged_low: true,
    remarks: 'સપ્ટેમ્બરમાં પણ ૮૦% કરતા ઓછી હાજરી.',
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-5',
    trainee_id: 'demo-tr-5',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 18,
    absent_days: 6,
    attendance_percentage: 75.0,
    flagged_low: true,
    remarks: 'સપ્ટેમ્બરમાં ૭૫% માસિક હાજરી, પરંતુ ૩ માસની સંચિત હાજરી ૮૨.૨% (૬૦/૭૩ દિવસ) હોવાથી પ્રગતિશીલ સુરક્ષિત.',
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-6',
    trainee_id: 'demo-tr-6',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 21,
    absent_days: 3,
    attendance_percentage: 87.5,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-7',
    trainee_id: 'demo-tr-7',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 12,
    absent_days: 12,
    attendance_percentage: 50.0,
    flagged_low: true,
    continuous_absent_since: '૧૦/૦૯/૨૦૨૬',
    absent_from_date: '૧૦/૦૯/૨૦૨૬',
    absent_to_date: '૨૫/૦૯/૨૦૨૬',
    remarks: 'સતત ગેરહાજર - દ્વિતીય/આખરી નોટિસને પાત્ર.',
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-8',
    trainee_id: 'demo-tr-8',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 24,
    absent_days: 0,
    attendance_percentage: 100.0,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-9',
    trainee_id: 'demo-tr-9',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 21,
    absent_days: 3,
    attendance_percentage: 87.5,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-10',
    trainee_id: 'demo-tr-10',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 17,
    absent_days: 7,
    attendance_percentage: 70.8,
    flagged_low: true,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-11',
    trainee_id: 'demo-tr-11',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 22,
    absent_days: 2,
    attendance_percentage: 91.7,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-12',
    trainee_id: 'demo-tr-12',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 15,
    absent_days: 9,
    attendance_percentage: 62.5,
    flagged_low: true,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-13',
    trainee_id: 'demo-tr-13',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 21,
    absent_days: 3,
    attendance_percentage: 87.5,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-14',
    trainee_id: 'demo-tr-14',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 22,
    absent_days: 2,
    attendance_percentage: 91.7,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-demo-sep-15',
    trainee_id: 'demo-tr-15',
    instructor_id: 'guest-demo-instructor',
    month_year: 'September 2026',
    total_working_days: 24,
    present_days: 16,
    absent_days: 8,
    attendance_percentage: 66.7,
    flagged_low: true,
    updated_at: '2026-09-30T17:00:00Z',
  },
];

/**
 * Isolated Demo Dispatch Logs (Outward & Inward Register)
 */
export const DEMO_SAMPLE_DISPATCH_LOGS: DispatchLog[] = [
  {
    id: 'disp-demo-1',
    trainee_id: 'demo-tr-2',
    instructor_id: 'guest-demo-instructor',
    ref_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૬/૧૦૧',
    outward_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૬/૧૦૧',
    notice_type: '1st Warning',
    issue_date: '2026-08-26',
    issued_date: '2026-08-26',
    attendance_percentage: 60.0,
    month_year: 'August 2026',
    status: 'Delivered',
    subject: 'સંસ્થામાં અનિયમિતતા બાબતે પ્રથમ ચેતવણી પત્ર',
    sender_recipient: 'મુકેશભાઈ પરમાર (વાલી: દિવ્યાંગ પરમાર)',
    tracking_number: 'ED123456789IN',
    dispatch_mode: 'Speed Post',
    entry_type: 'outward',
    notes: 'વાલીને સ્પીડ પોસ્ટ દ્વારા પ્રથમ નોટિસ મોકલાવેલ.',
    created_at: '2026-08-26T11:00:00Z',
  },
  {
    id: 'disp-demo-2',
    trainee_id: 'demo-tr-7',
    instructor_id: 'guest-demo-instructor',
    ref_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૬/૧૦૨',
    outward_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૬/૧૦૨',
    notice_type: '1st Warning',
    issue_date: '2026-08-28',
    issued_date: '2026-08-28',
    attendance_percentage: 56.0,
    month_year: 'August 2026',
    status: 'Acknowledged',
    subject: 'સંસ્થામાં અનિયમિતતા બાબતે પ્રથમ ચેતવણી પત્ર',
    sender_recipient: 'મહેશભાઈ પ્રજાપતિ (વાલી: હર્ષ પ્રજાપતિ)',
    dispatch_mode: 'રજીસ્ટર્ડ પોસ્ટ (RPAD)',
    tracking_number: 'RG987654321IN',
    entry_type: 'outward',
    notes: 'RPAD રસીદ પરત મળેલ છે.',
    created_at: '2026-08-28T14:30:00Z',
  },
  {
    id: 'disp-demo-3',
    trainee_id: 'demo-tr-4',
    instructor_id: 'guest-demo-instructor',
    ref_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૬/૧૦૩',
    outward_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૬/૧૦૩',
    notice_type: '1st Warning',
    issue_date: '2026-09-05',
    issued_date: '2026-09-05',
    attendance_percentage: 68.0,
    month_year: 'August 2026',
    status: 'Dispatched',
    subject: 'સંસ્થામાં વગર પરવાનગીએ ગેરહાજર રહેવા બાબત પ્રથમ ચેતવણી પત્ર',
    sender_recipient: 'કાંતિજી ઠાકોર (વાલી: વિજયજી ઠાકોર)',
    dispatch_mode: 'સાદી ટપાલ / રૂબરૂ',
    entry_type: 'outward',
    created_at: '2026-09-05T10:15:00Z',
  },
  {
    id: 'disp-demo-4',
    trainee_id: 'demo-tr-2',
    instructor_id: 'guest-demo-instructor',
    ref_number: 'આવક/ગાંધીનગર/૨૦૨૬/૪૫',
    outward_number: 'આવક/ગાંધીનગર/૨૦૨૬/૪૫',
    notice_type: 'General Notice',
    issue_date: '2026-09-10',
    issued_date: '2026-09-10',
    attendance_percentage: 60.0,
    month_year: 'August 2026',
    status: 'Acknowledged',
    subject: 'તાલીમાર્થી દિવ્યાંગ પરમારના વાલીનો ખુલાસો અને મેડિકલ સર્ટિફિકેટ રજૂ કરવા બાબત',
    sender_recipient: 'મુકેશભાઈ પરમાર (વાલીશ્રી તરફથી આવક પત્ર)',
    dispatch_mode: 'રૂબરૂ (In-Person)',
    entry_type: 'inward',
    notes: 'વાલી રૂબરૂ હાજર રહી મેડિકલ પ્રમાણપત્ર રજૂ કરેલ છે.',
    created_at: '2026-09-10T12:00:00Z',
  },
  {
    id: 'disp-demo-5',
    trainee_id: 'demo-tr-7',
    instructor_id: 'guest-demo-instructor',
    ref_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૬/૧૧૫',
    outward_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૬/૧૧૫',
    notice_type: '2nd Warning',
    issue_date: '2026-10-02',
    issued_date: '2026-10-02',
    attendance_percentage: 50.0,
    month_year: 'September 2026',
    status: 'Dispatched',
    subject: 'સંસ્થામાં સતત ગેરહાજર રહેવા બાબતે દ્વિતીય અને આખરી ચેતવણી પત્ર',
    sender_recipient: 'મહેશભાઈ પ્રજાપતિ (વાલી: હર્ષ પ્રજાપતિ)',
    tracking_number: 'ED556677889IN',
    dispatch_mode: 'Speed Post',
    entry_type: 'outward',
    notes: 'સપ્ટેમ્બર માસમાં ૫૦% હાજરી હોવાથી દ્વિતીય નોટિસ પાઠવેલ.',
    created_at: '2026-10-02T15:20:00Z',
  },
  {
    id: 'disp-demo-6',
    trainee_id: 'demo-tr-1',
    instructor_id: 'guest-demo-instructor',
    ref_number: 'ઔતાસં/ગાંધીનગર/ડેમો/PRIN-IN-201',
    outward_number: 'ઔતાસં/ગાંધીનગર/ડેમો/PRIN-IN-201',
    notice_type: 'Principal Report Forwarding',
    issue_date: '2026-10-03',
    issued_date: '2026-10-03',
    attendance_percentage: 0,
    month_year: 'September 2026',
    status: 'Delivered',
    subject: 'માહે સપ્ટેમ્બર ૨૦૨૬ ના ઓછી હાજરી ધરાવતા તાલીમાર્થીઓનો આચાર્યશ્રી સમક્ષ માસિક અહેવાલ',
    sender_recipient: 'સુ.ઇ. (કોપા) → આચાર્યશ્રી, ઔ.તા.સં. ગાંધીનગર',
    dispatch_mode: 'કચેરી ફાઇલિંગ / આવક નોંધણી',
    entry_type: 'inward',
    notes: 'ટ્રેડ કોપા (COPA) ના ઓછી હાજરી વાળા તાલીમાર્થીઓનું સંકલિત પત્રક આચાર્યશ્રીને રજૂ કરેલ.',
    created_at: '2026-10-03T16:45:00Z',
  },
];

/**
 * Isolated Demo Letter Templates (All 5 Official Gujarati Formats)
 */
export const DEMO_SAMPLE_TEMPLATES: LetterTemplate[] = [
  {
    id: 'demo-tmpl-1',
    instructor_id: 'guest-demo-instructor',
    template_name: '૧. પ્રથમ ગેરહાજરી ચેતવણી નોટિસ (1st Warning Notice)',
    name: '૧. પ્રથમ ગેરહાજરી ચેતવણી નોટિસ (1st Warning Notice)',
    language: 'Gujarati',
    category: 'attendance_warning',
    notice_type: '1st Warning',
    subject: 'સંસ્થામાં વગર પરવાનગીએ ગેરહાજર રહેવા બાબત પ્રથમ ચેતવણી પત્ર.',
    content_html: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 18px;">
    <div style="text-align: left; font-size: 13px; line-height: 1.5;">
      <div><strong>જાવક ક્રમાંક:</strong> {{Ref_No}}</div>
      <div>આચાર્યશ્રીની કચેરી,</div>
      <div>{{ITI_Name}}</div>
      <div><strong>તારીખ:</strong> {{Current_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <div><strong>પ્રતિશ્રી,</strong></div>
    <div style="padding-left: 20px; margin-top: 4px;">
      <div><strong>{{Father_Name}} {{Surname}}</strong></div>
      <div>(વાલીશ્રી: <strong>{{Trainee_Name}}</strong> - રોલ નં: <strong>{{Roll_No}}</strong>)</div>
      <div>{{Address}}</div>
      <div>મોબાઈલ નં: {{Parent_Mobile}}</div>
    </div>
  </div>

  <div style="text-align: center; margin: 16px 0; font-weight: bold; font-size: 15px; text-decoration: underline;">
    વિષય :- સંસ્થામાં નિયમિત હાજર ન રહેવા અને અનિયમિતતા બાબત પ્રથમ ચેતવણી પત્ર.
  </div>

  <div style="margin-bottom: 10px;">
    <strong>મહાશય / વાલીશ્રી,</strong>
  </div>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    સવિનય જણાવવાનું કે આપનો પુત્ર/પુત્રી <strong>{{Trainee_Name}}</strong> (એનરોલમેન્ટ નં: {{Enrollment_No}}) આ સંસ્થામાં વ્યવસાય <strong>{{Trade}}</strong>, બેચ <strong>{{Batch}}</strong> ({{Unit}}) માં તાલીમ લઈ રહેલ છે. માહે <strong>{{Month_Year}}</strong> દરમિયાન કુલ કામકાજના <strong>{{Total_Working_Days}}</strong> દિવસોમાંથી તેઓ માત્ર <strong>{{Present_Days}}</strong> દિવસ હાજર રહેલ છે અને <strong>{{Absent_Days}}</strong> દિવસ વગર પરવાનગીએ ગેરહાજર રહેલ છે.
  </p>

  <div style="margin: 14px 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: center;">
      <tr style="background-color: #f1f5f9; font-weight: bold;">
        <td style="border: 1px solid #64748b; padding: 6px;">માસ</td>
        <td style="border: 1px solid #64748b; padding: 6px;">કુલ કામકાજના દિવસો</td>
        <td style="border: 1px solid #64748b; padding: 6px;">હાજર દિવસો</td>
        <td style="border: 1px solid #64748b; padding: 6px;">માસિક હાજરી %</td>
        <td style="border: 1px solid #64748b; padding: 6px;">સંચિત (Progressive) %</td>
      </tr>
      <tr>
        <td style="border: 1px solid #64748b; padding: 6px;">{{Month_Year}}</td>
        <td style="border: 1px solid #64748b; padding: 6px;">{{Total_Working_Days}}</td>
        <td style="border: 1px solid #64748b; padding: 6px;">{{Present_Days}}</td>
        <td style="border: 1px solid #64748b; padding: 6px; color: #b91c1c; font-weight: bold;">{{Attendance_Percentage}}%</td>
        <td style="border: 1px solid #64748b; padding: 6px; font-weight: bold;">{{Progressive_Attendance_Percentage}}%</td>
      </tr>
    </table>
  </div>

  <p style="margin-bottom: 14px; text-align: justify;">
    એન.સી.વી.ટી. (NCVT) અને ખાતાકીય નિયમાનુસાર વાર્ષિક પરીક્ષામાં બેસવા માટે ઓછામાં ઓછી <strong>૮૦%</strong> હાજરી અનિવાર્ય છે. આ પત્ર મળ્યેથી દિવસ-૭ માં સંસ્થા ખાતે રૂબરૂ આવી સુપરવાઇઝર ઇન્સ્ટ્રક્ટરશ્રીને મળવા વિનંતી છે.
  </p>

  <div style="display: flex; justify-content: space-between; margin-top: 36px; padding-top: 12px;">
    <div style="text-align: center;">
      <div><strong>({{Instructor_Name}})</strong></div>
      <div>સુપરવાઇઝર ઇન્સ્ટ્રક્ટર ({{Trade}})</div>
    </div>
    <div style="text-align: center;">
      <div><strong>આચાર્યશ્રી</strong></div>
      <div>{{ITI_Name}}</div>
    </div>
  </div>
</div>`,
    show_letterhead: true,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'demo-tmpl-2',
    instructor_id: 'guest-demo-instructor',
    template_name: '૨. દ્વિતીય કડક ચેતવણી નોટિસ (2nd Strict Warning Notice)',
    name: '૨. દ્વિતીય કડક ચેતવણી નોટિસ (2nd Strict Warning Notice)',
    language: 'Gujarati',
    category: 'attendance_warning',
    notice_type: '2nd Warning',
    subject: 'સંસ્થામાં સતત ગેરહાજર રહેવા બાબતે દ્વિતીય કડક ચેતવણી પત્ર.',
    content_html: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 18px;">
    <div style="text-align: left; font-size: 13px; line-height: 1.5;">
      <div><strong>જાવક ક્રમાંક:</strong> {{Ref_No}}</div>
      <div>{{ITI_Name}}</div>
      <div><strong>તારીખ:</strong> {{Current_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <div><strong>પ્રતિશ્રી,</strong></div>
    <div style="padding-left: 20px; margin-top: 4px;">
      <div><strong>{{Father_Name}} {{Surname}}</strong></div>
      <div>(વાલીશ્રી: <strong>{{Trainee_Name}}</strong> - રોલ નં: <strong>{{Roll_No}}</strong>)</div>
      <div>{{Address}}</div>
      <div>મોબાઈલ નં: {{Parent_Mobile}}</div>
    </div>
  </div>

  <div style="text-align: center; margin: 16px 0; font-weight: bold; font-size: 15px; text-decoration: underline; color: #b91c1c;">
    વિષય :- સતત ગેરહાજરી બાબત દ્વિતીય કડક ચેતવણી પત્ર.
  </div>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    અગાઉ પાઠવેલ પ્રથમ ચેતવણી પત્ર (તારીખ: <strong>{{Previous_Notice_Dates}}</strong>) છતાં આપના પાલ્ય <strong>{{Trainee_Name}}</strong> (ટ્રેડ: {{Trade}}, બેચ: {{Batch}}, {{Unit}}) ની હાજરીમાં કોઈ સુધારો થયેલ નથી. માહે <strong>{{Month_Year}}</strong> માં તેમની હાજરી માત્ર <strong>{{Attendance_Percentage}}%</strong> ({{Present_Days}}/{{Total_Working_Days}} દિવસ) છે તેમજ સત્રની સંચિત હાજરી <strong>{{Progressive_Attendance_Percentage}}%</strong> છે.
  </p>

  <p style="text-indent: 32px; margin-bottom: 14px; text-align: justify;">
    જો આ પત્ર મળ્યેથી <strong>દિવસ-૩</strong> માં વાલીશ્રી સંસ્થા ખાતે રૂબરૂ હાજર થઈ લેખિત ખુલાસો રજૂ નહીં કરે, તો તાલીમાર્થીનું સ્ટાઈપેન્ડ અટકાવવા તેમજ સંસ્થાના રજીસ્ટરમાંથી નામ કમી કરવાની કાર્યવાહી હાથ ધરવામાં આવશે, જેની ગંભીર નોંધ લેશો.
  </p>

  <div style="display: flex; justify-content: space-between; margin-top: 36px; padding-top: 12px;">
    <div style="text-align: center;">
      <div><strong>({{Instructor_Name}})</strong></div>
      <div>સુપરવાઇઝર ઇન્સ્ટ્રક્ટર ({{Trade}})</div>
    </div>
    <div style="text-align: center;">
      <div><strong>આચાર્યશ્રી</strong></div>
      <div>{{ITI_Name}}</div>
    </div>
  </div>
</div>`,
    show_letterhead: true,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'demo-tmpl-3',
    instructor_id: 'guest-demo-instructor',
    template_name: '૩. આખરી કારણદર્શક નોટિસ - નામ કમી કરવા બાબત (Final Show-Cause Notice)',
    name: '૩. આખરી કારણદર્શક નોટિસ - નામ કમી કરવા બાબત (Final Show-Cause Notice)',
    language: 'Gujarati',
    category: 'irregularity_notice',
    notice_type: 'Final Notice',
    subject: 'સંસ્થામાંથી નામ કમી કરવા અંગે આખરી કારણદર્શક નોટિસ (Final Show-Cause Notice).',
    content_html: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 18px;">
    <div style="text-align: left; font-size: 13px; line-height: 1.5;">
      <div><strong>રજી. પોસ્ટ એ.ડી. / જાવક નં:</strong> {{Ref_No}}</div>
      <div>{{ITI_Name}}</div>
      <div><strong>તારીખ:</strong> {{Current_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <div><strong>પ્રતિશ્રી,</strong></div>
    <div style="padding-left: 20px; margin-top: 4px;">
      <div><strong>{{Father_Name}} {{Surname}}</strong></div>
      <div>(વાલીશ્રી: <strong>{{Trainee_Name}}</strong> - રોલ નં: <strong>{{Roll_No}}</strong>, બેચ: {{Batch}})</div>
      <div>{{Address}}</div>
    </div>
  </div>

  <div style="text-align: center; margin: 16px 0; font-weight: bold; font-size: 15px; text-decoration: underline; color: #991b1b;">
    વિષય :- સતત ગેરહાજરી સબબ સંસ્થામાંથી નામ કમી કરવા અંગે આખરી કારણદર્શક નોટિસ.
  </div>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    આથી આપને આખરી તાકીદ કરવામાં આવે છે કે આપના પાલ્ય <strong>{{Trainee_Name}}</strong> (ટ્રેડ: {{Trade}}, બેચ: {{Batch}}) સંસ્થામાં તારીખ <strong>{{Continuous_Absent_Since}}</strong> થી સતત વગર પરવાનગીએ ગેરહાજર રહેલ છે. અગાઉ પાઠવેલ નોટિસો (તારીખ: {{Previous_Notice_Dates}}) છતાં આજદિન સુધી આપ સંસ્થામાં રૂબરૂ હાજર થયેલ નથી.
  </p>

  <p style="text-indent: 32px; margin-bottom: 14px; text-align: justify;">
    તેમની માસિક હાજરી <strong>{{Attendance_Percentage}}%</strong> અને સત્રની સંચિત હાજરી માત્ર <strong>{{Progressive_Attendance_Percentage}}%</strong> છે. આ પત્ર મળ્યેથી દિન-૩ માં આધાર-પુરાવા સાથે રૂબરૂ હાજર ન થવાના કિસ્સામાં તાલીમાર્થીને તાલીમમાં રસ નથી તેમ માની એકતરફી રીતે સંસ્થાના હાજરી પત્રકમાંથી નામ કમી કરવામાં આવશે.
  </p>

  <div style="display: flex; justify-content: space-between; margin-top: 36px; padding-top: 12px;">
    <div style="text-align: center;">
      <div><strong>({{Instructor_Name}})</strong></div>
      <div>સુપરવાઇઝર ઇન્સ્ટ્રક્ટર</div>
    </div>
    <div style="text-align: center;">
      <div><strong>આચાર્યશ્રી</strong></div>
      <div>{{ITI_Name}}</div>
    </div>
  </div>
</div>`,
    show_letterhead: true,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'demo-tmpl-4',
    instructor_id: 'guest-demo-instructor',
    template_name: '૪. વાલી મિટિંગ માટે હાજર રહેવા બાબત (Parent Meeting Invitation)',
    name: '૪. વાલી મિટિંગ માટે હાજર રહેવા બાબત (Parent Meeting Invitation)',
    language: 'Gujarati',
    category: 'general_notice',
    notice_type: 'General Notice',
    subject: 'તાલીમાર્થીની તાલીમ પ્રગતિ અને હાજરી સમીક્ષા અર્થે વાલી મિટિંગમાં હાજર રહેવા બાબત.',
    content_html: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 18px;">
    <div style="text-align: left; font-size: 13px; line-height: 1.5;">
      <div><strong>જાવક ક્રમાંક:</strong> {{Ref_No}}</div>
      <div>{{ITI_Name}}</div>
      <div><strong>તારીખ:</strong> {{Current_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <div><strong>પ્રતિશ્રી,</strong></div>
    <div style="padding-left: 20px; margin-top: 4px;">
      <div><strong>{{Father_Name}} {{Surname}}</strong></div>
      <div>(વાલીશ્રી: <strong>{{Trainee_Name}}</strong> - ટ્રેડ: {{Trade}}, બેચ: {{Batch}})</div>
      <div>{{Address}}</div>
    </div>
  </div>

  <div style="text-align: center; margin: 16px 0; font-weight: bold; font-size: 15px; text-decoration: underline;">
    વિષય :- વાલી મિટિંગમાં રૂબરૂ હાજર રહેવા બાબત.
  </div>

  <p style="text-indent: 32px; margin-bottom: 14px; text-align: justify;">
    સવિનય જણાવવાનું કે આપના પાલ્ય <strong>{{Trainee_Name}}</strong> ની માહે <strong>{{Month_Year}}</strong> ની હાજરી <strong>{{Attendance_Percentage}}%</strong> અને સંચિત હાજરી <strong>{{Progressive_Attendance_Percentage}}%</strong> નોંધાયેલ છે. તાલીમાર્થીના અભ્યાસ, પ્રેક્ટિકલ તાલીમ અને પરીક્ષાની તૈયારી અંગે ચર્ચા કરવા સંસ્થા ખાતે વાલી મિટિંગનું આયોજન કરેલ હોવાથી સવારે ૧૦:૩૦ કલાકે ટ્રેડ વર્કશોપ ખાતે અચૂક હાજર રહેવા વિનંતી છે.
  </p>

  <div style="display: flex; justify-content: space-between; margin-top: 36px; padding-top: 12px;">
    <div style="text-align: center;">
      <div><strong>({{Instructor_Name}})</strong></div>
      <div>સુપરવાઇઝર ઇન્સ્ટ્રક્ટર ({{Trade}})</div>
    </div>
    <div style="text-align: center;">
      <div><strong>આચાર્યશ્રી</strong></div>
      <div>{{ITI_Name}}</div>
    </div>
  </div>
</div>`,
    show_letterhead: true,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'demo-tmpl-5',
    instructor_id: 'guest-demo-instructor',
    template_name: '૫. આચાર્યશ્રીને માસિક ઓછી હાજરીનો અહેવાલ (Principal Monthly Report)',
    name: '૫. આચાર્યશ્રીને માસિક ઓછી હાજરીનો અહેવાલ (Principal Monthly Report)',
    language: 'Gujarati',
    category: 'general_report',
    notice_type: 'Report',
    subject: '૮૦% થી ઓછી હાજરી ધરાવતા તાલીમાર્થીઓનો માસિક અહેવાલ રજૂ કરવા બાબત.',
    content_html: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
    <div style="font-size: 13px;">
      <div><strong>પ્રેષક:</strong> {{Instructor_Name}}</div>
      <div>સુપરવાઇઝર ઇન્સ્ટ્રક્ટર (ટ્રેડ: {{Trade}})</div>
      <div>બેચ: {{Batch}} ({{Unit}})</div>
    </div>
    <div style="text-align: right; font-size: 13px;">
      <div><strong>આંતરિક નોંધ નં:</strong> {{Ref_No}}</div>
      <div><strong>તારીખ:</strong> {{Current_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 14px;">
    <div><strong>પ્રતિ,</strong></div>
    <div><strong>માનનીય આચાર્યશ્રી,</strong></div>
    <div>{{ITI_Name}}</div>
  </div>

  <div style="text-align: center; margin: 14px 0; font-weight: bold; font-size: 15px; text-decoration: underline;">
    વિષય :- માહે {{Month_Year}} દરમિયાન ૮૦% થી ઓછી સંચિત હાજરી ધરાવતા તાલીમાર્થીઓનો અહેવાલ.
  </div>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    આદરણીય સાહેબશ્રી, ઉપરોક્ત વિષય અન્વયે સવિનય જણાવવાનું કે ટ્રેડ <strong>{{Trade}}</strong> (બેચ: <strong>{{Batch}}</strong>, {{Unit}}) માં માહે <strong>{{Month_Year}}</strong> ના અંતે નીચે મુજબના તાલીમાર્થીઓની સંચિત (Progressive) હાજરી ધોરણસરની ૮૦% કરતા ઓછી નોંધાયેલ છે, જેમના વાલીશ્રીઓને નિયમાનુસાર ચેતવણી નોટિસ પાઠવવાની કાર્યવાહી હાથ ધરેલ છે:
  </p>

  <div style="margin: 14px 0;">
    {{Low_Attendance_Table}}
  </div>

  <p style="margin-top: 12px; text-align: justify;">
    ઉપરોક્ત પત્રક આપશ્રીની જાણ અને આગળની ઘટતી કાર્યવાહી સારુ સવિનય રજૂ છે.
  </p>

  <div style="display: flex; justify-content: flex-end; margin-top: 32px;">
    <div style="text-align: center;">
      <div><strong>આપનો વિશ્વાસુ,</strong></div>
      <div style="margin-top: 24px;"><strong>({{Instructor_Name}})</strong></div>
      <div>સુપરવાઇઝર ઇન્સ્ટ્રક્ટર ({{Trade}})</div>
    </div>
  </div>
</div>`,
    show_letterhead: true,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
];
