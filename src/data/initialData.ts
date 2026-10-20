import { Instructor, Trainee, AttendanceRecord, LetterTemplate, DispatchLog } from '../types';
import { SAMPLE_UPI_RECEIPT_DATA_URL } from '../utils/imageCompressor';
import {
  DEMO_GUEST_INSTRUCTOR,
  DEMO_SAMPLE_TRAINEES,
  DEMO_SAMPLE_ATTENDANCE,
  DEMO_SAMPLE_TEMPLATES,
  DEMO_SAMPLE_DISPATCH_LOGS,
} from './demoData';

export {
  DEMO_GUEST_INSTRUCTOR,
  DEMO_SAMPLE_TRAINEES,
  DEMO_SAMPLE_ATTENDANCE,
  DEMO_SAMPLE_TEMPLATES,
  DEMO_SAMPLE_DISPATCH_LOGS,
};

export const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: 'super-admin-tejas',
    user_id: 'superadmin.tejas',
    username: 'superadmin',
    name: 'તેજસભાઈ સુથાર (Super Admin)',
    email: 'tejassuthar21696@gmail.com',
    email_verified: true,
    mobile_verified: true,
    password: 'Admin@ITI2026!',
    role: 'super_admin',
    status: 'approved',
    iti_name: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગાંધીનગર (Directorate of Employment & Training)',
    trade: 'રાજ્ય વહીવટ (State Administration)',
    trades: ['રાજ્ય વહીવટ (State Administration)'],
    batch: 'રાજ્ય સ્તર (State Level)',
    batches: ['રાજ્ય સ્તર (State Level)'],
    unit: 'DET Gujarat',
    units: ['DET Gujarat'],
    academic_hierarchy: [],
    designation: 'સુપર એડમિનિસ્ટ્રેટર (Directorate Super Admin)',
    phone: '9825012345',
    institution_address: 'બ્લોક નં. ૧/૨, ડો. જીવરાજ મહેતા ભવન, ગાંધીનગર-૩૮૨૦૧૦',
    outward_code_prefix: 'ડીઈટી/આઈટીઆઈ/વહીવટ',
    header_config: {
      show_logo: true,
      institute_name_gu: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગાંધીનગર',
      institute_name_en: 'DIRECTORATE OF EMPLOYMENT & TRAINING, GUJARAT',
      department_subtitle: 'શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર',
      address: 'બ્લોક નં. ૧/૨, ડો. જીવરાજ મહેતા ભવન, ગાંધીનગર-૩૮૨૦૧૦',
      ref_prefix: 'ડીઈટી/વહીવટ/૨૦૨૫',
    },
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'inst-shankheshwar',
    user_id: 'iti.shankheshwar',
    username: 'copa_shankheshwar',
    name: 'પ્રવિણભાઈ સી. સુથાર',
    email: 'iti.shankheshwar.mahila@gujarat.gov.in',
    email_verified: true,
    mobile_verified: true,
    password: 'Pravin@ITI2026!',
    role: 'instructor',
    status: 'approved',
    iti_name: 'ઔદ્યોગિક તાલીમ સંસ્થા, શંખેશ્વર(મહિલા)',
    trade: 'કોપા (COPA)',
    trades: ['કોપા (COPA)'],
    batch: '૨૦૨૫–૨૦૨૬',
    batches: ['૨૦૨૫–૨૦૨૬', '૨૦૨૪–૨૦૨૬', '૨૦૨૫–૨૦૨૭'],
    unit: 'Unit A',
    units: ['Unit A', 'Unit B', 'Unit C'],
    academic_hierarchy: [
      {
        id: 'trade-copa-shk',
        name: 'કોપા (COPA)',
        batches: [
          {
            id: 'batch-shk-25',
            name: '૨૦૨૫–૨૦૨૬',
            units: [
              { id: 'u-shk-1', name: 'Unit A' },
              { id: 'u-shk-2', name: 'Unit B' },
            ],
          },
        ],
      },
    ],
    designation: 'સુપરવાઇઝર ઇન્સ્ટ્રક્ટર (સુ.ઇ.)',
    phone: '9428054321',
    institution_address: 'બક્ષીપંચ હોસ્ટેલની બાજુમાં, સમી-શંખેશ્વર હાઈવે, તા. શંખેશ્વર, જી. પાટણ-૩૮૪૨૪૨',
    outward_code_prefix: 'ઔતાસં/શંખેશ્વર/તલમ',
    header_config: {
      show_logo: true,
      institute_name_gu: 'ઔદ્યોગિક તાલીમ સંસ્થા, શંખેશ્વર(મહિલા)',
      institute_name_en: 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE, SHANKHESHWAR',
      department_subtitle: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગુજરાત રાજ્ય',
      address: 'બક્ષીપંચ હોસ્ટેલની બાજુમાં, સમી-શંખેશ્વર હાઈવે, તા. શંખેશ્વર, જી. પાટણ-૩૮૪૨૪૨',
      ref_prefix: 'ઔતાસં/શંખેશ્વર/તલમ/૨૦૨૫',
    },
    approved_at: '2026-08-01T10:00:00Z',
    valid_until: '2027-08-01T10:00:00Z',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'inst-1',
    user_id: 'suresh.patel',
    username: 'fitter_rajkot',
    name: 'Suresh K. Patel (સુરેશ કે. પટેલ)',
    email: 'suresh.patel@gujarat.iti.gov.in',
    email_verified: true,
    mobile_verified: true,
    password: 'Suresh@ITI2026!',
    role: 'instructor',
    status: 'approved',
    iti_name: 'Government ITI Rajkot (સરકારી આઈ.ટી.આઈ. રાજકોટ)',
    trade: 'Fitter',
    trades: ['Fitter'],
    batch: '2025–2026',
    batches: ['2025–2026', '2024–2026'],
    unit: 'Unit A',
    units: ['Unit A', 'Unit B'],
    academic_hierarchy: [
      {
        id: 'trade-fitter-rjt',
        name: 'Fitter',
        batches: [
          {
            id: 'batch-fitter-25',
            name: '2025–2026',
            units: [{ id: 'u-fit-1', name: 'Unit A' }, { id: 'u-fit-2', name: 'Unit B' }],
          },
        ],
      },
    ],
    designation: 'Supervisor Instructor (સુપરવાઈઝર ઇન્સ્ટ્રક્ટર)',
    phone: '9825011111',
    institution_address: 'આજી ડેમ પાસે, રાજકોટ-૩૬૦૦૦૩',
    outward_code_prefix: 'ઔતાસં/રાજકોટ/ફિટર',
    approved_at: '2026-08-01T10:00:00Z',
    valid_until: '2027-08-01T10:00:00Z',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'inst-2',
    user_id: 'manoj.sharma',
    username: 'elec_ahmedabad',
    name: 'Manoj R. Sharma (મનોજ આર. શર્મા)',
    email: 'manoj.sharma@gujarat.iti.gov.in',
    email_verified: true,
    mobile_verified: true,
    password: 'Manoj@ITI2026!',
    role: 'instructor',
    status: 'approved',
    iti_name: 'Government ITI Ahmedabad (સરકારી આઈ.ટી.આઈ. અમદાવાદ)',
    trade: 'Electrician',
    trades: ['Electrician'],
    batch: '2025–2026',
    batches: ['2025–2026', '2024–2026'],
    unit: 'Unit B',
    units: ['Unit A', 'Unit B', 'Unit C'],
    academic_hierarchy: [
      {
        id: 'trade-elec-ahm',
        name: 'Electrician',
        batches: [
          {
            id: 'batch-elec-25',
            name: '2025–2026',
            units: [{ id: 'u-elec-1', name: 'Unit A' }, { id: 'u-elec-2', name: 'Unit B' }],
          },
        ],
      },
    ],
    designation: 'Supervisor Instructor (સુપરવાઈઝર ઇન્સ્ટ્રક્ટર)',
    phone: '9825167890',
    institution_address: 'કુબેરનગર, અમદાવાદ-૩૮૨૩૪૦',
    outward_code_prefix: 'ઔતાસં/અમદાવાદ/ઇલેક્ટ્રિક',
    approved_at: '2026-08-01T10:00:00Z',
    valid_until: '2027-08-01T10:00:00Z',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'inst-pending-kalpesh',
    user_id: 'iti.kalpesh',
    username: 'welder_kalpesh',
    name: 'કલ્પેશભાઈ એમ. પરમાર (Kalpesh Parmar)',
    email: 'kalpesh.welder@gujarat.iti.gov.in',
    email_verified: true,
    mobile_verified: true,
    password: 'Kalpesh@ITI2026!',
    role: 'instructor',
    status: 'pending',
    iti_name: 'ઔદ્યોગિક તાલીમ સંસ્થા, વડોદરા (ITI Vadodara)',
    trade: 'વેલ્ડર (Welder)',
    trades: ['વેલ્ડર (Welder)'],
    batch: '૨૦૨૫–૨૦૨૬',
    batches: ['૨૦૨૫–૨૦૨૬'],
    unit: 'Unit A',
    units: ['Unit A', 'Unit B'],
    academic_hierarchy: [
      {
        id: 'trade-welder-vdr',
        name: 'વેલ્ડર (Welder)',
        batches: [
          {
            id: 'batch-vdr-25',
            name: '૨૦૨૫–૨૦૨૬',
            units: [{ id: 'u-vdr-1', name: 'Unit A' }, { id: 'u-vdr-2', name: 'Unit B' }],
          },
        ],
      },
    ],
    designation: 'સુપરવાઇઝર ઇન્સ્ટ્રક્ટર (Supervisor Instructor)',
    phone: '9898123456',
    institution_address: 'તરસાલી રોડ, વડોદરા-૩૯૦૦૦૯',
    outward_code_prefix: 'ઔતાસં/વડોદરા/વેલ્ડર',
    payment_screenshot_url: SAMPLE_UPI_RECEIPT_DATA_URL,
    payment_utr: '428910482910',
    payment_mobile: '9898123456',
    payment_amount: 9,
    payment_submitted_at: '2026-10-10T09:30:00Z',
    created_at: '2026-10-10T09:25:00Z',
  },
  DEMO_GUEST_INSTRUCTOR,
];

export const INITIAL_TRAINEES: Trainee[] = [
  // --- Guest Demo Account Trainees (Gandhinagar COPA 2025-2026) ---
  {
    id: 'demo-tr-1',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૧',
    enrollment_no: 'ITI/GNR/COPA/2025/01',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
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
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'demo-tr-2',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૨',
    enrollment_no: 'ITI/GNR/COPA/2025/02',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
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
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'demo-tr-3',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૩',
    enrollment_no: 'ITI/GNR/COPA/2025/03',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
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
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'demo-tr-4',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૪',
    enrollment_no: 'ITI/GNR/COPA/2025/04',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
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
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'demo-tr-5',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૫',
    enrollment_no: 'ITI/GNR/COPA/2025/05',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
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
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'demo-tr-6',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૬',
    enrollment_no: 'ITI/GNR/COPA/2025/06',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
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
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'demo-tr-7',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૭',
    enrollment_no: 'ITI/GNR/COPA/2025/07',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
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
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'demo-tr-8',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૮',
    enrollment_no: 'ITI/GNR/COPA/2025/08',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
    unit: 'Unit A',
    surname: 'સોલંકી',
    student_name: 'રાહુલ',
    father_name: 'ભરતભાઈ',
    grandfather_name: 'નારણભાઈ',
    surname_en: 'Solanki',
    student_name_en: 'Rahul',
    father_name_en: 'Bharatbhai',
    grandfather_name_en: 'Naranbhai',
    mobile: '9879012355',
    parent_mobile: '9879012356',
    address: 'મુ. ચંદ્રાલા, તા. ગાંધીનગર',
    village: 'ચંદ્રાલા',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૩૨૧',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'demo-tr-9',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૯',
    enrollment_no: 'ITI/GNR/COPA/2025/09',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
    unit: 'Unit B',
    surname: 'રાવલ',
    student_name: 'મિહિર',
    father_name: 'સંજયભાઈ',
    grandfather_name: 'પ્રતાપભાઈ',
    surname_en: 'Raval',
    student_name_en: 'Mihir',
    father_name_en: 'Sanjaybhai',
    grandfather_name_en: 'Pratapbhai',
    mobile: '9879012357',
    parent_mobile: '9879012358',
    address: 'સેક્ટર-૨૮, જીઆઈડીસી પાછળ',
    village: 'ગાંધીનગર',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૦૨૮',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'demo-tr-10',
    instructor_id: 'guest-demo-instructor',
    roll_no: '૧૦',
    enrollment_no: 'ITI/GNR/COPA/2025/10',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
    unit: 'Unit B',
    surname: 'વાઘેલા',
    student_name: 'ક્રિષ્નાબેન',
    father_name: 'પ્રવિણસિંહ',
    grandfather_name: 'માનસંગ',
    surname_en: 'Vaghela',
    student_name_en: 'Krishnaben',
    father_name_en: 'Pravinsinh',
    grandfather_name_en: 'Mansang',
    mobile: '9879012359',
    parent_mobile: '9879012360',
    address: 'મુ. રાંધેજા, દરબાર ગઢ પાસે',
    village: 'રાંધેજા',
    taluka: 'ગાંધીનગર',
    district: 'ગાંધીનગર',
    pincode: '૩૮૨૬૨૦',
    created_at: '2025-08-01T10:00:00Z',
  },
  // --- Standard Production ITIs ---
  {
    id: 'tr-skh-1',
    instructor_id: 'inst-shankheshwar',
    roll_no: '૧',
    enrollment_no: 'ITI/SKH/COPA/2025/01',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
    unit: 'યુનિટ ૧',
    surname: 'પટેલ',
    student_name: 'કિરણબેન',
    father_name: 'રમેશભાઈ',
    grandfather_name: 'નાનજીભાઈ',
    surname_en: 'Patel',
    student_name_en: 'Kiranben',
    father_name_en: 'Rameshbhai',
    grandfather_name_en: 'Nanjibhai',
    address: 'મુ. શંખેશ્વર, બક્ષીપંચ વાસ',
    village: 'શંખેશ્વર',
    taluka: 'શંખેશ્વર',
    district: 'પાટણ',
    pincode: '૩૮૪૨૪૨',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-skh-2',
    instructor_id: 'inst-shankheshwar',
    roll_no: '૨',
    enrollment_no: 'ITI/SKH/COPA/2025/02',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
    unit: 'યુનિટ ૧',
    surname: 'ઠાકોર',
    student_name: 'પૂજાબેન',
    father_name: 'રમેશજી',
    grandfather_name: 'ભવાનજી',
    surname_en: 'Thakor',
    student_name_en: 'Pujaben',
    father_name_en: 'Rameshji',
    grandfather_name_en: 'Bhavanji',
    address: 'મુ. રણછોડપુરા, સ્ટેશન રોડ',
    village: 'રણછોડપુરા',
    taluka: 'શંખેશ્વર',
    district: 'પાટણ',
    pincode: '૩૮૪૨૪૨',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-skh-3',
    instructor_id: 'inst-shankheshwar',
    roll_no: '૩',
    enrollment_no: 'ITI/SKH/COPA/2025/03',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
    unit: 'યુનિટ ૧',
    surname: 'પ્રજાપતિ',
    student_name: 'નેહાબેન',
    father_name: 'કમલેશભાઈ',
    grandfather_name: 'મગનભાઈ',
    surname_en: 'Prajapati',
    student_name_en: 'Nehaben',
    father_name_en: 'Kamleshbhai',
    grandfather_name_en: 'Maganbhai',
    address: 'મુ. મુજપુર, કુંભાર વાસ',
    village: 'મુજપુર',
    taluka: 'શંખેશ્વર',
    district: 'પાટણ',
    pincode: '૩૮૪૨૪૨',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-skh-4',
    instructor_id: 'inst-shankheshwar',
    roll_no: '૪',
    enrollment_no: 'ITI/SKH/COPA/2025/04',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
    unit: 'યુનિટ ૧',
    surname: 'ચૌધરી',
    student_name: 'અસ્મિતાબેન',
    father_name: 'ગોવિંદભાઈ',
    grandfather_name: 'કાળુભાઈ',
    surname_en: 'Chaudhary',
    student_name_en: 'Asmitaben',
    father_name_en: 'Govindbhai',
    grandfather_name_en: 'Kalubhai',
    address: 'મુ. સમી, ગાયત્રી મંદિર પાસે',
    village: 'સમી',
    taluka: 'સમી',
    district: 'પાટણ',
    pincode: '૩૮૪૨૪૦',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-skh-5',
    instructor_id: 'inst-shankheshwar',
    roll_no: '૫',
    enrollment_no: 'ITI/SKH/COPA/2025/05',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
    unit: 'યુનિટ ૧',
    surname: 'રાવળ',
    student_name: 'જાનકીબેન',
    father_name: 'હરેશભાઈ',
    grandfather_name: 'અમૃતભાઈ',
    surname_en: 'Raval',
    student_name_en: 'Jankiben',
    father_name_en: 'Hareshbhai',
    grandfather_name_en: 'Amrutbhai',
    address: 'મુ. પીપળી, પ્રાથમિક શાળા પાસે',
    village: 'પીપળી',
    taluka: 'શંખેશ્વર',
    district: 'પાટણ',
    pincode: '૩૮૪૨૪૨',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-skh-6',
    instructor_id: 'inst-shankheshwar',
    roll_no: '૬',
    enrollment_no: 'ITI/SKH/COPA/2025/06',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
    unit: 'યુનિટ ૧',
    surname: 'સોલંકી',
    student_name: 'મનીષાબેન',
    father_name: 'શાંતિલાલ',
    grandfather_name: 'ધનજીભાઈ',
    surname_en: 'Solanki',
    student_name_en: 'Manishaben',
    father_name_en: 'Shantilal',
    grandfather_name_en: 'Dhanjibhai',
    address: 'મુ. ઝીલવાણા, પંચાયત ચોક',
    village: 'ઝીલવાણા',
    taluka: 'શંખેશ્વર',
    district: 'પાટણ',
    pincode: '૩૮૪૨૪૨',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-skh-7',
    instructor_id: 'inst-shankheshwar',
    roll_no: '૭',
    enrollment_no: 'ITI/SKH/COPA/2025/07',
    trade: 'કોપા (COPA)',
    batch: '૨૦૨૫–૨૦૨૬',
    unit: 'યુનિટ ૧',
    surname: 'વાઘેલા',
    student_name: 'શીતલબેન',
    father_name: 'ભરતસિંહ',
    grandfather_name: 'પ્રતાપસિંહ',
    surname_en: 'Vaghela',
    student_name_en: 'Shitalben',
    father_name_en: 'Bharatsinh',
    grandfather_name_en: 'Pratapsinh',
    address: 'મુ. ફતેહપુર, દરબાર ગઢ',
    village: 'ફતેહપુર',
    taluka: 'સમી',
    district: 'પાટણ',
    pincode: '૩૮૪૨૪૦',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-101',
    instructor_id: 'inst-1',
    roll_no: '101',
    enrollment_no: 'ITI/RJK/FIT/2025/01',
    trade: 'Fitter',
    batch: '2025–2026',
    unit: 'Unit 1',
    surname: 'પટેલ',
    student_name: 'રમેશ',
    father_name: 'ભારતભાઈ',
    grandfather_name: 'કેશવલાલ',
    surname_en: 'Patel',
    student_name_en: 'Ramesh',
    father_name_en: 'Bharatbhai',
    grandfather_name_en: 'Keshavlal',
    address: 'પ્લોટ નં. ૪૫, શિવ શક્તિ સોસાયટી, કાલાવડ રોડ',
    village: 'વાવડી',
    taluka: 'રાજકોટ',
    district: 'રાજકોટ',
    pincode: '360005',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-102',
    instructor_id: 'inst-1',
    roll_no: '102',
    enrollment_no: 'ITI/RJK/FIT/2025/02',
    trade: 'Fitter',
    batch: '2025–2026',
    unit: 'Unit 1',
    surname: 'વાઘેલા',
    student_name: 'સુરેશ',
    father_name: 'જયેશભાઈ',
    grandfather_name: 'મગનલાલ',
    surname_en: 'Vaghela',
    student_name_en: 'Suresh',
    father_name_en: 'Jayeshbhai',
    grandfather_name_en: 'Maganlal',
    address: 'રામજી મંદિર પાસે, મુખ્ય બજાર',
    village: 'પાળ',
    taluka: 'લોધિકા',
    district: 'રાજકોટ',
    pincode: '360035',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-103',
    instructor_id: 'inst-1',
    roll_no: '103',
    enrollment_no: 'ITI/RJK/FIT/2025/03',
    trade: 'Fitter',
    batch: '2025–2026',
    unit: 'Unit 1',
    surname: 'પરમાર',
    student_name: 'અજય',
    father_name: 'મહેશભાઈ',
    grandfather_name: 'ધીરુભાઈ',
    surname_en: 'Parmar',
    student_name_en: 'Ajay',
    father_name_en: 'Maheshbhai',
    grandfather_name_en: 'Dhirubhai',
    address: 'મકાન નં. ૧૨, જલારામ નગર, ગોંડલ રોડ',
    village: 'શાપર',
    taluka: 'કોટડા સાંગાણી',
    district: 'રાજકોટ',
    pincode: '360024',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-104',
    instructor_id: 'inst-1',
    roll_no: '104',
    enrollment_no: 'ITI/RJK/FIT/2025/04',
    trade: 'Fitter',
    batch: '2025–2026',
    unit: 'Unit 1',
    surname: 'જાડેજા',
    student_name: 'યુવરાજસિંહ',
    father_name: 'દિલીપસિંહ',
    grandfather_name: 'રણજીતસિંહ',
    surname_en: 'Jadeja',
    student_name_en: 'Yuvrajsinh',
    father_name_en: 'Dilipsinh',
    grandfather_name_en: 'Ranjitsinh',
    address: 'દરબારગઢ શેરી, મુ.પો. કુવાડવા',
    village: 'કુવાડવા',
    taluka: 'રાજકોટ',
    district: 'રાજકોટ',
    pincode: '360023',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-105',
    instructor_id: 'inst-1',
    roll_no: '105',
    enrollment_no: 'ITI/RJK/FIT/2025/05',
    trade: 'Fitter',
    batch: '2025–2026',
    unit: 'Unit 1',
    surname: 'સોલંકી',
    student_name: 'ભાવેશ',
    father_name: 'કાંતિલાલ',
    grandfather_name: 'હરજીવનભાઈ',
    surname_en: 'Solanki',
    student_name_en: 'Bhavesh',
    father_name_en: 'Kantilal',
    grandfather_name_en: 'Harjivanbhai',
    address: 'ગાંધી સોસાયટી, શેરી નં. ૫',
    village: 'પડધરી',
    taluka: 'પડધરી',
    district: 'રાજકોટ',
    pincode: '360110',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tr-106',
    instructor_id: 'inst-1',
    roll_no: '106',
    enrollment_no: 'ITI/RJK/FIT/2025/06',
    trade: 'Fitter',
    batch: '2025–2026',
    unit: 'Unit 1',
    surname: 'ચાવડા',
    student_name: 'હિતેશ',
    father_name: 'પ્રવિણભાઈ',
    grandfather_name: 'બાબુભાઈ',
    surname_en: 'Chavda',
    student_name_en: 'Hitesh',
    father_name_en: 'Pravinbhai',
    grandfather_name_en: 'Babubhai',
    address: 'સરદાર પટેલ ચોક પાસે',
    village: 'બેડી',
    taluka: 'રાજકોટ',
    district: 'રાજકોટ',
    pincode: '360003',
    created_at: '2025-08-01T10:00:00Z',
  },
  // Trainees for Instructor 2 (Ahmedabad)
  {
    id: 'tr-201',
    instructor_id: 'inst-2',
    roll_no: '201',
    enrollment_no: 'ITI/ADI/ELE/2025/01',
    trade: 'Electrician',
    batch: '2025–2026',
    unit: 'Unit 2',
    surname: 'શાહ',
    student_name: 'પ્રતીક',
    father_name: 'નરેશભાઈ',
    grandfather_name: 'શાંતિલાલ',
    surname_en: 'Shah',
    student_name_en: 'Pratik',
    father_name_en: 'Nareshbhai',
    grandfather_name_en: 'Shantilal',
    address: 'બી-૧૦૨, તીર્થ નગર, મણિનગર',
    village: 'મણિનગર',
    taluka: 'અમદાવાદ શહેર',
    district: 'અમદાવાદ',
    pincode: '380008',
    created_at: '2025-08-01T10:00:00Z',
  },
].filter((t) => !t.id.startsWith('demo-') && t.instructor_id !== 'guest-demo-instructor');

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // --- Guest Demo Account Attendance Records (Gandhinagar August 2026, 24 Working Days) ---
  {
    id: 'demo-att-1',
    trainee_id: 'demo-tr-1',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 22,
    absent_days: 2,
    attendance_percentage: 91.67,
    flagged_low: false,
    remarks: 'નિયમિત હાજરી',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'demo-att-2',
    trainee_id: 'demo-tr-2',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 14,
    absent_days: 10,
    attendance_percentage: 58.33,
    flagged_low: true,
    continuous_absent_since: '૧૧/૦૮/૨૦૨૬',
    absent_from_date: '૧૧/૦૮/૨૦૨૬',
    absent_to_date: '૩૧/૦૮/૨૦૨૬',
    remarks: 'સતત ૧૦ દિવસથી ગેરહાજર (નોટિસ રવાના)',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'demo-att-3',
    trainee_id: 'demo-tr-3',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 17,
    absent_days: 7,
    attendance_percentage: 70.83,
    flagged_low: true,
    continuous_absent_since: '૧૮/૦૮/૨૦૨૬',
    absent_from_date: '૧૮/૦૮/૨૦૨૬',
    absent_to_date: '૨૫/૦૮/૨૦૨૬',
    remarks: '૮૦% થી ઓછી હાજરી - વાલી સંપર્ક જરૂરી',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'demo-att-4',
    trainee_id: 'demo-tr-4',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 21,
    absent_days: 3,
    attendance_percentage: 87.50,
    flagged_low: false,
    remarks: 'સંતોષકારક હાજરી',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'demo-att-5',
    trainee_id: 'demo-tr-5',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 13,
    absent_days: 11,
    attendance_percentage: 54.17,
    flagged_low: true,
    continuous_absent_since: '૧૨/૦૮/૨૦૨૬',
    absent_from_date: '૧૨/૦૮/૨૦૨૬',
    absent_to_date: '૩૧/૦૮/૨૦૨૬',
    remarks: 'સતત ૧૧ દિવસ ગેરહાજર (રજિસ્ટર્ડ એ.ડી. નોટિસ)',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'demo-att-6',
    trainee_id: 'demo-tr-6',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 23,
    absent_days: 1,
    attendance_percentage: 95.83,
    flagged_low: false,
    remarks: 'ઉત્તમ હાજરી',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'demo-att-7',
    trainee_id: 'demo-tr-7',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 18,
    absent_days: 6,
    attendance_percentage: 75.00,
    flagged_low: true,
    continuous_absent_since: '૨૨/૦૮/૨૦૨૬',
    absent_from_date: '૨૨/૦૮/૨૦૨૬',
    absent_to_date: '૨૯/૦૮/૨૦૨૬',
    remarks: '૮૦% થી ઓછી હાજરી',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'demo-att-8',
    trainee_id: 'demo-tr-8',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 20,
    absent_days: 4,
    attendance_percentage: 83.33,
    flagged_low: false,
    remarks: 'યોગ્ય હાજરી',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'demo-att-9',
    trainee_id: 'demo-tr-9',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 22,
    absent_days: 2,
    attendance_percentage: 91.67,
    flagged_low: false,
    remarks: 'નિયમિત તાલીમાર્થી',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'demo-att-10',
    trainee_id: 'demo-tr-10',
    instructor_id: 'guest-demo-instructor',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 19,
    absent_days: 5,
    attendance_percentage: 79.17,
    flagged_low: true,
    continuous_absent_since: '૨૩/૦૮/૨૦૨૬',
    absent_from_date: '૨૩/૦૮/૨૦૨૬',
    absent_to_date: '૨૯/૦૮/૨૦૨૬',
    remarks: 'બોર્ડર કેસ (<૮૦%)',
    updated_at: '2026-08-31T17:00:00Z',
  },
  // ITI Shankheshwar (Mahila) August 2026 (Total Working Days: 24)
  {
    id: 'att-skh-1-aug',
    trainee_id: 'tr-skh-1',
    instructor_id: 'inst-shankheshwar',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 13,
    absent_days: 11,
    attendance_percentage: 54.17,
    flagged_low: true,
    continuous_absent_since: '૧૧/૦૮/૨૦૨૬',
    absent_from_date: '૧૧/૦૮/૨૦૨૬',
    absent_to_date: '૩૧/૦૮/૨૦૨૬',
    remarks: 'સતત ૧૧ દિવસથી ગેરહાજર',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-skh-2-aug',
    trainee_id: 'tr-skh-2',
    instructor_id: 'inst-shankheshwar',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 15,
    absent_days: 9,
    attendance_percentage: 62.50,
    flagged_low: true,
    continuous_absent_since: '૧૪/૦૮/૨૦૨૬',
    absent_from_date: '૧૪/૦૮/૨૦૨૬',
    absent_to_date: '૩૧/૦૮/૨૦૨૬',
    remarks: '૮૦% થી ઓછી હાજરી',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-skh-3-aug',
    trainee_id: 'tr-skh-3',
    instructor_id: 'inst-shankheshwar',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 12,
    absent_days: 12,
    attendance_percentage: 50.00,
    flagged_low: true,
    continuous_absent_since: '૦૮/૦૮/૨૦૨૬',
    absent_from_date: '૦૮/૦૮/૨૦૨૬',
    absent_to_date: '૩૧/૦૮/૨૦૨૬',
    remarks: 'સતત ૧૨ દિવસ ગેરહાજર',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-skh-4-aug',
    trainee_id: 'tr-skh-4',
    instructor_id: 'inst-shankheshwar',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 16,
    absent_days: 8,
    attendance_percentage: 66.67,
    flagged_low: true,
    continuous_absent_since: '૧૮/૦૮/૨૦૨૬',
    absent_from_date: '૧૮/૦૮/૨૦૨૬',
    absent_to_date: '૩૧/૦૮/૨૦૨૬',
    remarks: 'લેખિત ખુલાસો માંગવો',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-skh-5-aug',
    trainee_id: 'tr-skh-5',
    instructor_id: 'inst-shankheshwar',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 14,
    absent_days: 10,
    attendance_percentage: 58.33,
    flagged_low: true,
    continuous_absent_since: '૧૫/૦૮/૨૦૨૬',
    absent_from_date: '૧૫/૦૮/૨૦૨૬',
    absent_to_date: '૩૧/૦૮/૨૦૨૬',
    remarks: 'વાલીને રૂબરૂ બોલાવવા ભલામણ',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-skh-6-aug',
    trainee_id: 'tr-skh-6',
    instructor_id: 'inst-shankheshwar',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 11,
    absent_days: 13,
    attendance_percentage: 45.83,
    flagged_low: true,
    continuous_absent_since: '૦૫/૦૮/૨૦૨૬',
    absent_from_date: '૦૫/૦૮/૨૦૨૬',
    absent_to_date: '૩૧/૦૮/૨૦૨૬',
    remarks: 'સતત ૧૦ દિવસથી વધુ ગેરહાજર',
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-skh-7-aug',
    trainee_id: 'tr-skh-7',
    instructor_id: 'inst-shankheshwar',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 17,
    absent_days: 7,
    attendance_percentage: 70.83,
    flagged_low: true,
    continuous_absent_since: '૨૦/૦૮/૨૦૨૬',
    absent_from_date: '૨૦/૦૮/૨૦૨૬',
    absent_to_date: '૩૧/૦૮/૨૦૨૬',
    remarks: 'ઓછી હાજરીની વાલીને જાણ કરવી',
    updated_at: '2026-08-31T17:00:00Z',
  },
  // ITI Shankheshwar (Mahila) September 2026 (Total Working Days: 25)
  {
    id: 'att-skh-1-sep',
    trainee_id: 'tr-skh-1',
    instructor_id: 'inst-shankheshwar',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 14,
    absent_days: 11,
    attendance_percentage: 56.00,
    flagged_low: true,
    continuous_absent_since: '૧૫/૦૯/૨૦૨૬',
    absent_from_date: '૧૫/૦૯/૨૦૨૬',
    absent_to_date: '૩૦/૦૯/૨૦૨૬',
    remarks: 'સતત ગેરહાજર (સંચિત ૫૫.૧% - લાલ ફ્લેગ)',
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-skh-2-sep',
    trainee_id: 'tr-skh-2',
    instructor_id: 'inst-shankheshwar',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 15,
    absent_days: 10,
    attendance_percentage: 60.00,
    flagged_low: true,
    remarks: 'સંચિત ૬૧.૨% - લાલ ફ્લેગ',
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-skh-3-sep',
    trainee_id: 'tr-skh-3',
    instructor_id: 'inst-shankheshwar',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 13,
    absent_days: 12,
    attendance_percentage: 52.00,
    flagged_low: true,
    remarks: 'સંચિત ૫૧.૦% - લાલ ફ્લેગ',
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-skh-4-sep',
    trainee_id: 'tr-skh-4',
    instructor_id: 'inst-shankheshwar',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 24,
    absent_days: 1,
    attendance_percentage: 96.00,
    flagged_low: false,
    remarks: 'સપ્ટેમ્બરમાં સુધારો (સંચિત ૮૧.૬% - સંચિત સુરક્ષિત)',
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-skh-5-sep',
    trainee_id: 'tr-skh-5',
    instructor_id: 'inst-shankheshwar',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 16,
    absent_days: 9,
    attendance_percentage: 64.00,
    flagged_low: true,
    remarks: 'સંચિત ૬૧.૨% - લાલ ફ્લેગ',
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-skh-6-sep',
    trainee_id: 'tr-skh-6',
    instructor_id: 'inst-shankheshwar',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 12,
    absent_days: 13,
    attendance_percentage: 48.00,
    flagged_low: true,
    remarks: 'સંચિત ૪૬.૯% - લાલ ફ્લેગ',
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-skh-7-sep',
    trainee_id: 'tr-skh-7',
    instructor_id: 'inst-shankheshwar',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 23,
    absent_days: 2,
    attendance_percentage: 92.00,
    flagged_low: false,
    remarks: 'સપ્ટેમ્બરમાં નિયમિત (સંચિત ૮૧.૬% - સંચિત સુરક્ષિત)',
    updated_at: '2026-09-30T17:00:00Z',
  },
  // August 2026 (Total Working Days: 24)
  {
    id: 'att-101-aug',
    trainee_id: 'tr-101',
    instructor_id: 'inst-1',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 14,
    absent_days: 10,
    attendance_percentage: 58.33,
    flagged_low: true, // < 80%
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-102-aug',
    trainee_id: 'tr-102',
    instructor_id: 'inst-1',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 16,
    absent_days: 8,
    attendance_percentage: 66.67,
    flagged_low: true, // < 80%
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-103-aug',
    trainee_id: 'tr-103',
    instructor_id: 'inst-1',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 18,
    absent_days: 6,
    attendance_percentage: 75.0,
    flagged_low: true, // < 80%
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-104-aug',
    trainee_id: 'tr-104',
    instructor_id: 'inst-1',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 22,
    absent_days: 2,
    attendance_percentage: 91.67,
    flagged_low: false, // >= 80%
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-105-aug',
    trainee_id: 'tr-105',
    instructor_id: 'inst-1',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 12,
    absent_days: 12,
    attendance_percentage: 50.0,
    flagged_low: true, // < 80%
    updated_at: '2026-08-31T17:00:00Z',
  },
  {
    id: 'att-106-aug',
    trainee_id: 'tr-106',
    instructor_id: 'inst-1',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 23,
    absent_days: 1,
    attendance_percentage: 95.83,
    flagged_low: false, // >= 80%
    updated_at: '2026-08-31T17:00:00Z',
  },
  // September 2026 (Total Working Days: 25)
  {
    id: 'att-101-sep',
    trainee_id: 'tr-101',
    instructor_id: 'inst-1',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 13,
    absent_days: 12,
    attendance_percentage: 52.0,
    flagged_low: true,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-102-sep',
    trainee_id: 'tr-102',
    instructor_id: 'inst-1',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 15,
    absent_days: 10,
    attendance_percentage: 60.0,
    flagged_low: true,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-103-sep',
    trainee_id: 'tr-103',
    instructor_id: 'inst-1',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 22,
    absent_days: 3,
    attendance_percentage: 88.0,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-104-sep',
    trainee_id: 'tr-104',
    instructor_id: 'inst-1',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 24,
    absent_days: 1,
    attendance_percentage: 96.0,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-105-sep',
    trainee_id: 'tr-105',
    instructor_id: 'inst-1',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 14,
    absent_days: 11,
    attendance_percentage: 56.0,
    flagged_low: true,
    updated_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'att-106-sep',
    trainee_id: 'tr-106',
    instructor_id: 'inst-1',
    month_year: 'September 2026',
    total_working_days: 25,
    present_days: 25,
    absent_days: 0,
    attendance_percentage: 100.0,
    flagged_low: false,
    updated_at: '2026-09-30T17:00:00Z',
  },
  // For Instructor 2
  {
    id: 'att-201-aug',
    trainee_id: 'tr-201',
    instructor_id: 'inst-2',
    month_year: 'August 2026',
    total_working_days: 24,
    present_days: 15,
    absent_days: 9,
    attendance_percentage: 62.5,
    flagged_low: true,
    updated_at: '2026-08-31T17:00:00Z',
  },
].filter((a) => !a.id.startsWith('demo-') && !a.id.startsWith('att-demo-') && a.instructor_id !== 'guest-demo-instructor');

export const INITIAL_DISPATCH_LOGS: DispatchLog[] = ([
  // --- Guest Demo Account Outward / Dispatch Records ---
  {
    id: 'disp-demo-001',
    trainee_id: 'demo-tr-2',
    instructor_id: 'guest-demo-instructor',
    ref_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૫/૧૦૧',
    outward_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૫/૧૦૧',
    notice_type: '1st Warning',
    issued_date: '2026-08-16',
    issue_date: '2026-08-16',
    attendance_percentage: 58.33,
    month_year: 'August 2026',
    status: 'Dispatched',
    notes: 'સ્પીડ પોસ્ટ ક્રમાંક SP-GJ-9812401IN દ્વારા વાલીને રવાના કરેલ.',
    created_at: '2026-08-16T11:00:00Z',
  },
  {
    id: 'disp-demo-002',
    trainee_id: 'demo-tr-5',
    instructor_id: 'guest-demo-instructor',
    ref_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૫/૧૦૨',
    outward_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૫/૧૦૨',
    notice_type: '2nd Warning',
    issued_date: '2026-08-20',
    issue_date: '2026-08-20',
    attendance_percentage: 54.17,
    month_year: 'August 2026',
    status: 'Delivered',
    notes: 'રજિસ્ટર્ડ એ.ડી. RD-GJ-4421990IN વાલીને પહોંચ પ્રાપ્ત થયેલ.',
    created_at: '2026-08-20T14:30:00Z',
  },
  {
    id: 'disp-demo-003',
    trainee_id: 'demo-tr-3',
    instructor_id: 'guest-demo-instructor',
    ref_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૫/૧૦૩',
    outward_number: 'ઔતાસં/ગાંધીનગર/ડેમો/૨૦૨૫/૧૦૩',
    notice_type: '1st Warning',
    issued_date: '2026-08-22',
    issue_date: '2026-08-22',
    attendance_percentage: 70.83,
    month_year: 'August 2026',
    status: 'Delivered',
    notes: 'રૂબરૂ હાથોહાથ વાલી સમક્ષ રજૂ કરી સહી મેળવેલ.',
    created_at: '2026-08-22T10:15:00Z',
  },
  {
    id: 'disp-001',
    trainee_id: 'tr-101',
    instructor_id: 'inst-1',
    ref_number: 'ITI/RJK/2026/IRR/08-01',
    outward_number: 'ITI/FITTER/2026/IRR/AUG-101',
    notice_type: '1st Warning',
    issued_date: '2026-08-14',
    issue_date: '2026-08-14',
    attendance_percentage: 58.33,
    month_year: 'August 2026',
    status: 'Dispatched',
    notes: 'વાલીને ટપાલ રવાનગી ક્રમાંક ૧૦૪ દ્વારા મોકલેલ.',
    created_at: '2026-08-14T11:30:00Z',
  },
  {
    id: 'disp-002',
    trainee_id: 'tr-102',
    instructor_id: 'inst-1',
    ref_number: 'ITI/RJK/2026/IRR/08-02',
    outward_number: 'ITI/FITTER/2026/IRR/AUG-102',
    notice_type: '1st Warning',
    issued_date: '2026-08-14',
    issue_date: '2026-08-14',
    attendance_percentage: 66.67,
    month_year: 'August 2026',
    status: 'Dispatched',
    notes: 'પિતાશ્રીએ ટેલિફોન પર સંપર્ક કર્યો હતો.',
    created_at: '2026-08-14T11:35:00Z',
  },
] as DispatchLog[]).filter((d) => !d.id.startsWith('disp-demo-') && d.instructor_id !== 'guest-demo-instructor');

export const DEFAULT_TEMPLATES: LetterTemplate[] = [
  {
    id: 'tpl-shankheshwar-parent',
    instructor_id: 'global',
    template_name: 'આઈ.ટી.આઈ. શંખેશ્વર - વગર પરવાનગીએ ગેરહાજર વાલી નોટિસ',
    language: 'Gujarati',
    notice_type: '1st Warning',
    show_letterhead: true,
    subject: 'સંસ્થામાં વગર પરવાનગીએ ગેરહાજર રહેવા બાબત.',
    content_html: `<div style="line-height: 1.6; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 15px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
    <div style="text-align: left; font-size: 14px; line-height: 1.5;">
      <div><strong>પત્ર નં</strong> {{Reference_Number}}</div>
      <div>આચાર્યશ્રીની કચેરી,</div>
      <div>{{ITI_Name}},</div>
      <div>{{Institution_Address}}</div>
      <div style="margin-top: 4px;"><strong>તા:</strong> {{Notice_Issue_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 20px; font-size: 14.5px;">
    <div><strong>પ્રતિશ્રી,</strong></div>
    <div style="padding-left: 20px; margin-top: 4px;">
      <div><strong>{{Father_Name}} {{Grandfather_Name}} {{Surname}}</strong></div>
      <div>(વાલીશ્રી: <strong>{{Full_Name}}</strong>)</div>
      <div>{{Full_Address}}</div>
    </div>
  </div>

  <div style="text-align: center; margin: 20px 0; font-weight: bold; font-size: 16px;">
    વિષય :- સંસ્થામાં વગર પરવાનગીએ ગેરહાજર રહેવા બાબત.
  </div>

  <div style="margin-bottom: 12px;">
    <strong>મહાશય,</strong>
  </div>

  <p style="text-indent: 32px; margin-bottom: 16px; text-align: justify; line-height: 1.7;">
    ઉપરોક્ત વિષયના અનુસંધાનમાં જય ભારત સાથે આ સંસ્થામાં ટ્રેડ <strong>{{Trade}}</strong> માં અભ્યાસ કરતી આપની પુત્રી/પત્ની <strong>{{Full_Name}}</strong> ની બાબતમાં જણાવવાનું કે :-
  </p>

  <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; text-align: justify; line-height: 1.65;">
    <div style="display: flex; gap: 8px;">
      <span style="font-weight: bold; min-width: 28px;">(૧)</span>
      <div>તેઓ તારીખ <strong>{{Absent_From_Date}}</strong> થી <strong>{{Absent_To_Date}}</strong> સંસ્થામાં કોઈપણ જાતની રજા લીધા વગર ગેરહાજર રહે છે તો આ બાબતમાં તમારી લેખિત વિગતવાર સ્પષ્ટતા ઉલટ ટપાલે આ કચેરીને મોકલી આપશો.</div>
    </div>

    <div style="display: flex; gap: 8px;">
      <span style="font-weight: bold; min-width: 28px;">(૨)</span>
      <div>આ સંસ્થાના નિયમ મુજબ તાલીમાર્થી વગર રજાએ સંસ્થામાં સતત ૧૦ દિવસ કે વધુ સમય ગેરહાજર રહે તો તેનું નામ સંસ્થામાંથી કમી કરવામાં આવે છે.</div>
    </div>

    <div style="display: flex; gap: 8px;">
      <span style="font-weight: bold; min-width: 28px;">(૩)</span>
      <div>તેઓની સંસ્થામાં હાજરી ઘણી ઓછી અને અનિયમિત છે. તેઓ વારંવાર સંસ્થામાં ગેરહાજર રહે છે. જો તેઓની હાજરી પરીક્ષા સમયે ૮૦ ટકા કરતાં ઓછી થશે તો તેમને ટ્રેડ ટેસ્ટમાં બેસવા દેવામાં આવશે નહી તેની નોંધ લેવી. આજદિન સુધી માસિક હાજરી <strong>{{Attendance_Percentage}}%</strong> તેમજ સંચિત/પ્રગતિશીલ હાજરી <strong>{{Progressive_Attendance_Percentage}}%</strong> છે જે નિયમ કરતાં ઓછી છે.</div>
    </div>

    <div style="display: flex; gap: 8px;">
      <span style="font-weight: bold; min-width: 28px;">(૪)</span>
      <div>તેઓની વર્તણૂંક તથા કામ સંતોષકારક નથી. જો તેમાં સુધારો દાખવવામાં નહી આવે તો તેમનું સ્ટાઈપેન્ડ બંધ કરવામાં આવશે તેની નોંધ લેશો.</div>
    </div>

    <div style="display: flex; gap: 8px;">
      <span style="font-weight: bold; min-width: 28px;">(૫)</span>
      <div>તેઓને નિયમિત થવા અગાઉ તારીખ:- <strong>{{Previous_Notice_Dates}}</strong> ના રોજ આ બાબતે આપને જણાવેલ છે.</div>
    </div>
  </div>

  <div style="background-color: #f8fafc; border-left: 3px solid #0284c7; padding: 10px 14px; margin: 16px 0; font-size: 13.5px;">
    <strong>વાલી પરામર્શ / વિશેષ નોંધ:</strong> {{AI_Commentary}}
  </div>

  <div style="margin-top: 36px; display: flex; justify-content: flex-end; text-align: center;">
    <div style="min-width: 220px;">
      <div style="height: 44px;"></div>
      <div style="font-weight: bold; font-size: 15px;">આચાર્ય</div>
      <div style="font-size: 14px;">{{ITI_Name}}</div>
    </div>
  </div>

  <div style="margin-top: 32px; border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 13.5px;">
    <div><strong>નકલ:</strong></div>
    <div style="margin-top: 4px; padding-left: 12px;">
      (૧) પ્રતિશ્રી <strong>{{Instructor_Name}}</strong>, સુ.ઇ., {{Trade}}<br/>
      {{ITI_Name}} તરફ તેમના રીપોર્ટની જાણ તથા જરૂરી નોંધ લેવા સારૂ.
    </div>
  </div>
</div>`,
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tpl-shankheshwar-principal',
    instructor_id: 'global',
    template_name: 'આઈ.ટી.આઈ. શંખેશ્વર - આચાર્યશ્રીને ઓછી હાજરી રિપોર્ટ',
    language: 'Gujarati',
    notice_type: 'Report',
    show_letterhead: false,
    subject: 'તાલીમાર્થીની ગેરહાજરી તેમજ ઓછી ટકાવારીની વાલીને જાણ કરવા બાબત.',
    content_html: `<div style="line-height: 1.6; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14.5px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
    <div style="text-align: left; font-size: 13.5px; line-height: 1.5;">
      <div><strong>સુ.ઇ નું નામ :</strong> {{Instructor_Name}}</div>
      <div><strong>ટ્રેડ:</strong> {{Trade}}</div>
      <div>{{ITI_Name}}</div>
      <div><strong>તારીખ :</strong> {{Notice_Issue_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 16px; font-size: 14px;">
    <div><strong>પ્રતિ,</strong></div>
    <div><strong>આચાર્યશ્રી,</strong></div>
    <div>{{ITI_Name}}</div>
  </div>

  <div style="text-align: left; margin: 14px 0; font-weight: bold; font-size: 14.5px;">
    વિષય : તાલીમાર્થીની ગેરહાજરી તેમજ ઓછી ટકાવારીની વાલીને જાણ કરવા બાબત.
  </div>

  <div style="margin-bottom: 8px;">
    <strong>માનનીય સાહેબશ્રી,</strong>
  </div>

  <p style="text-indent: 28px; margin-bottom: 16px; text-align: justify; line-height: 1.65;">
    ઉપરોક્ત વિષય અન્વયે જણાવવાનું કે આ સાથે અત્રેના ટ્રેડમાં તાલીમ લઈ રહેલા નીચેના તાલીમાર્થીઓની હાજરીની વિગત <strong>{{Month_Year}}</strong> માસ અંતિત નીચે મુજબ છે આ તાલીમાર્થીઓની હાજરી પરિક્ષામાં બેસવાના સમયે ૮૦ ટકાથી ઓછી હાજરી હશે તો પરિક્ષામાં બેસવા નહિ દેવા અંગેની જાણ તથા સંસ્થા ખાતે નિયમિત હાજરી આપે તે અંગે જાણ કરવા વિનંતી.
  </p>

  {{Trainee_Attendance_Table}}

  <div style="margin-top: 20px; font-size: 14px;">
    ઉપરોક્ત તાલીમાર્થીઓ અંગે ઘટતી કાર્યવાહી કરવા નમ્ર વિનંતી.<br/>
    આભાર સહ....
  </div>

  <div style="margin-top: 36px; display: flex; justify-content: flex-end; text-align: center;">
    <div>
      <div style="height: 40px;"></div>
      <div style="font-weight: bold;">આપનો વિશ્વાસુ</div>
      <div style="margin-top: 4px;">{{Instructor_Name}}</div>
      <div>{{Designation}}, {{Trade}}</div>
    </div>
  </div>
</div>`,
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tpl-guj-1',
    instructor_id: 'global',
    template_name: 'પ્રથમ અનિયમિતતા ચેતવણી પત્ર (Gujarati 1st Warning)',
    language: 'Gujarati',
    notice_type: '1st Warning',
    show_letterhead: true,
    subject: 'તાલીમાર્થીની સતત અનિયમિતતા અને ઓછી હાજરી બાબત નોટિસ (પ્રથમ ચેતવણી)',
    content_html: `<div style="line-height: 1.6; font-family: 'Noto Sans Gujarati', sans-serif;">
  <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
    <div><strong>સંદર્ભ જા. નં:</strong> {{Reference_Number}}</div>
    <div><strong>તારીખ:</strong> {{Notice_Issue_Date}}</div>
  </div>

  <div style="margin-bottom: 16px;">
    <strong>પ્રતિ,</strong><br/>
    વાલીશ્રી, <strong>{{Father_Name}} {{Grandfather_Name}} {{Surname}}</strong><br/>
    (તાલીમાર્થી: <strong>{{Full_Name}}</strong> ના પિતાશ્રી / વાલી)<br/>
    સરનામું: {{Full_Address}}
  </div>

  <div style="text-align: center; margin: 18px 0; font-weight: bold; text-decoration: underline;">
    વિષય: તાલીમાર્થીની સતત અનિયમિતતા અને ઓછી હાજરી બાબત (પ્રથમ ચેતવણી પત્ર)
  </div>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    સવિનય જણાવવાનું કે આપનો પુત્ર/પુત્રી <strong>{{Full_Name}}</strong> અમારી સંસ્થા <strong>{{ITI_Name}}</strong> ખાતે ટ્રેડ: <strong>{{Trade}}</strong>, બેચ: <strong>{{Batch}}</strong>, યુનિટ: <strong>{{Unit}}</strong> (રોલ નં: <strong>{{Trainee_Roll_No}}</strong>, એનરોલમેન્ટ નં: <strong>{{Enrollment_No}}</strong>) માં તાલીમ મેળવે છે.
  </p>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    માહે <strong>{{Month_Year}}</strong> દરમિયાન સંસ્થાના કુલ કામકાજના <strong>{{Working_Days}}</strong> દિવસો પૈકી આપનો પાલ્ય માત્ર <strong>{{Present_Days}}</strong> દિવસ હાજર રહેલ છે અને <strong>{{Absent_Days}}</strong> દિવસ સંસ્થાની પૂર્વ મંજૂરી વગર ગેરહાજર રહેલ છે. જેથી તાલીમાર્થીની માસિક હાજરી <strong>{{Attendance_Percentage}}%</strong> અને સંચિત પ્રગતિશીલ હાજરી <strong>{{Progressive_Attendance_Percentage}}%</strong> નોંધાયેલ છે (સ્થિતિ: <strong>{{Progressive_Status}}</strong>). અગાઉ આપેલ નોટિસ તારીખ: <strong>{{Last_Notice_Date}}</strong> છે.
  </p>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin: 16px 0;">
    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">સંસ્થાકીય નિર્દેશ / વિશેષ ટીપ્પણી:</div>
    <div style="color: #334155; font-style: italic;">{{AI_Commentary}}</div>
  </div>

  <p style="text-indent: 32px; margin-bottom: 16px; text-align: justify;">
    સરકારશ્રી અને NCVT / GCVT ના કાયદા મુજબ પરીક્ષામાં બેસવા માટે ઓછામાં ઓછી ૮૦% હાજરી હોવી ફરજિયાત છે. જો તાલીમાર્થી ભવિષ્યમાં પણ ગેરહાજર રહેશે તો તેનું નામ સંસ્થામાંથી કમી કરવાની કડક કાર્યવાહી કરવામાં આવશે જેની નોંધ લેશો. આ પત્ર મળ્યેથી ૩ દિવસમાં સંસ્થા ખાતે રૂબરૂ આવી સુપરવાઈઝર ઇન્સ્ટ્રક્ટરને મળવા તાકીદ કરવામાં આવે છે.
  </p>

  <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <strong>સ્થળ:</strong> {{District}}<br/>
      <strong>સંસ્થા:</strong> {{ITI_Name}}
    </div>
    <div style="text-align: center;">
      <div style="height: 48px;"></div>
      <strong>સુપરવાઈઝર ઇન્સ્ટ્રક્ટર</strong><br/>
      <span>ટ્રેડ: {{Trade}}, {{Unit}}</span><br/>
      <span>{{ITI_Name}}</span>
    </div>
  </div>
</div>`,
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tpl-guj-2',
    instructor_id: 'global',
    template_name: 'દ્વિતીય ગંભીર નોટિસ (Gujarati 2nd Warning)',
    language: 'Gujarati',
    notice_type: '2nd Warning',
    show_letterhead: true,
    subject: 'તાલીમાર્થીની વારંવાર ગેરહાજરી બાબત દ્વિતીય કડક ચેતવણી પત્ર',
    content_html: `<div style="line-height: 1.6; font-family: 'Noto Sans Gujarati', sans-serif;">
  <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
    <div><strong>સંદર્ભ જા. નં:</strong> {{Reference_Number}}</div>
    <div><strong>તારીખ:</strong> {{Notice_Issue_Date}}</div>
  </div>

  <div style="margin-bottom: 16px;">
    <strong>પ્રતિ,</strong><br/>
    વાલીશ્રી, <strong>{{Father_Name}} {{Grandfather_Name}} {{Surname}}</strong><br/>
    (તાલીમાર્થી: <strong>{{Full_Name}}</strong> ના વાલી)<br/>
    મુ. {{Village}}, તા. {{Taluka}}, જિ. {{District}} - {{Pincode}}
  </div>

  <div style="text-align: center; margin: 18px 0; font-weight: bold; color: #b91c1c; text-decoration: underline;">
    વિષય: સતત અનિયમિતતા બાબત દ્વિતીય કડક ચેતવણી પત્ર (નામ કમી કાર્યવાહી બાબત)
  </div>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    ઉપરોક્ત વિષય પરત્વે જણાવવાનું કે આપના પાલ્ય <strong>{{Full_Name}}</strong> (રોલ નં: <strong>{{Trainee_Roll_No}}</strong>) ને અગાઉ તારીખ: <strong>{{Last_Notice_Date}}</strong> ના રોજ પ્રથમ નોટિસ પાઠવવામાં આવી હતી. તેમ છતાં માહે <strong>{{Month_Year}}</strong> દરમિયાન પણ હાજરીમાં કોઈ સુધારો થયેલ નથી.
  </p>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    કુલ કામકાજના <strong>{{Working_Days}}</strong> દિવસો પૈકી માત્ર <strong>{{Present_Days}}</strong> દિવસ હાજર રહેલ છે અને <strong>{{Absent_Days}}</strong> દિવસ ગેરહાજર રહેલ છે (માસિક હાજરી: <strong>{{Attendance_Percentage}}%</strong>, સંચિત પ્રગતિશીલ હાજરી: <strong>{{Progressive_Attendance_Percentage}}%</strong>).
  </p>

  <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px 16px; margin: 16px 0;">
    <div style="font-weight: 600; color: #991b1b; margin-bottom: 4px;">વાલીશ્રી માટે વિશેષ નિર્દેશ:</div>
    <div style="color: #7f1d1d;">{{AI_Commentary}}</div>
  </div>

  <p style="text-indent: 32px; margin-bottom: 16px; text-align: justify;">
    આથી આ દ્વિતીય નોટિસ દ્વારા આપને જણાવવામાં આવે છે કે આગામી ૨ દિવસમાં વાલીશ્રીએ રૂબરૂ હાજર થઈ સંતોષકારક ખુલાસો નહિ કર્યો તો તાલીમાર્થીનું નામ કાયમી ધોરણે રદ કરવાની પ્રક્રિયા આચાર્યશ્રી સમક્ષ રજૂ કરવામાં આવશે.
  </p>

  <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <strong>સ્થળ:</strong> {{District}}<br/>
      <strong>સંસ્થા:</strong> {{ITI_Name}}
    </div>
    <div style="text-align: center;">
      <div style="height: 48px;"></div>
      <strong>સુપરવાઈઝર ઇન્સ્ટ્રક્ટર / આચાર્યશ્રી</strong><br/>
      <span>{{ITI_Name}}</span>
    </div>
  </div>
</div>`,
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tpl-hin-1',
    instructor_id: 'global',
    template_name: 'अनियमित उपस्थिति चेतावनी पत्र (Hindi 1st Warning)',
    language: 'Hindi',
    notice_type: '1st Warning',
    show_letterhead: true,
    subject: 'प्रशिक्षु की कम उपस्थिति एवं निरंतर अनुपस्थिति बाबत चेतावनी पत्र',
    content_html: `<div style="line-height: 1.6; font-family: 'Noto Sans Devanagari', sans-serif;">
  <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
    <div><strong>संदर्भ क्रमांक:</strong> {{Reference_Number}}</div>
    <div><strong>दिनांक:</strong> {{Notice_Issue_Date}}</div>
  </div>

  <div style="margin-bottom: 16px;">
    <strong>सेवा में,</strong><br/>
    अभिभावक महोदय, <strong>{{Father_Name}} {{Grandfather_Name}} {{Surname}}</strong><br/>
    (प्रशिक्षु: <strong>{{Full_Name}}</strong> के पिता/अभिभावक)<br/>
    पता: {{Full_Address}}
  </div>

  <div style="text-align: center; margin: 18px 0; font-weight: bold; text-decoration: underline;">
    विषय: औद्योगिक प्रशिक्षण संस्थान में कम उपस्थिति बाबत आधिकारिक सूचना
  </div>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    सविनय निवेदन है कि आपका पुत्र/पुत्री <strong>{{Full_Name}}</strong> हमारे संस्थान <strong>{{ITI_Name}}</strong> में व्यवसाय (Trade): <strong>{{Trade}}</strong>, बैच: <strong>{{Batch}}</strong>, यूनिट: <strong>{{Unit}}</strong> (रोल नं: <strong>{{Trainee_Roll_No}}</strong>) में अध्ययनरत है।
  </p>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    माह <strong>{{Month_Year}}</strong> के दौरान कुल <strong>{{Working_Days}}</strong> कार्य दिवसों में से आपका पाल्य केवल <strong>{{Present_Days}}</strong> दिन उपस्थित रहा और <strong>{{Absent_Days}}</strong> दिन बिना पूर्व सूचना के अनुपस्थित रहा। जिससे उसकी उपस्थिति मात्र <strong>{{Attendance_Percentage}}%</strong> दर्ज की गई है। पूर्व सूचना दिनांक: <strong>{{Last_Notice_Date}}</strong> है।
  </p>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin: 16px 0;">
    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">संस्थान की ओर से आवश्यक निर्देश:</div>
    <div style="color: #334155; font-style: italic;">{{AI_Commentary}}</div>
  </div>

  <p style="text-indent: 32px; margin-bottom: 16px; text-align: justify;">
    NCVT / GCVT नियमानुसार अखिल भारतीय व्यवसाय परीक्षा (AITT) में सम्मिलित होने हेतु न्यूनतम 80% उपस्थिति अनिवार्य है। अतः यह पत्र प्राप्त होने के 3 दिनों के भीतर संस्थान में उपस्थित होकर सुपरवाइजर अनुदेशक से संपर्क करें, अन्यथा नियमानुसार छात्र का नाम निरस्त किया जा सकता है।
  </p>

  <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <strong>स्थान:</strong> {{District}}<br/>
      <strong>संस्थान:</strong> {{ITI_Name}}
    </div>
    <div style="text-align: center;">
      <div style="height: 48px;"></div>
      <strong>सुपरवाइजर अनुदेशक / प्राचार्य</strong><br/>
      <span>{{ITI_Name}}</span>
    </div>
  </div>
</div>`,
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'tpl-eng-1',
    instructor_id: 'global',
    template_name: 'Official Attendance Irregularity Notice (English)',
    language: 'English',
    notice_type: '1st Warning',
    show_letterhead: true,
    subject: 'Official Warning Notice regarding Shortage of Attendance (<80%)',
    content_html: `<div style="line-height: 1.6; font-family: 'Segoe UI', Arial, sans-serif;">
  <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
    <div><strong>Ref Outward No:</strong> {{Reference_Number}}</div>
    <div><strong>Date:</strong> {{Notice_Issue_Date}}</div>
  </div>

  <div style="margin-bottom: 16px;">
    <strong>To,</strong><br/>
    The Parent / Guardian of <strong>{{Full_Name}}</strong><br/>
    Father's Name: <strong>{{Father_Name}} {{Grandfather_Name}} {{Surname}}</strong><br/>
    Address: {{Full_Address}}
  </div>

  <div style="text-align: center; margin: 18px 0; font-weight: bold; text-decoration: underline;">
    Sub: Formal Warning Notice regarding Severe Attendance Shortage (<80%)
  </div>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    This is to officially inform you that your ward <strong>{{Full_Name}}</strong> (Roll No: <strong>{{Trainee_Roll_No}}</strong>, Enrollment: <strong>{{Enrollment_No}}</strong>) is enrolled in Trade: <strong>{{Trade}}</strong>, Batch: <strong>{{Batch}}</strong>, Unit: <strong>{{Unit}}</strong> at <strong>{{ITI_Name}}</strong>.
  </p>

  <p style="text-indent: 32px; margin-bottom: 12px; text-align: justify;">
    During the month of <strong>{{Month_Year}}</strong>, out of <strong>{{Working_Days}}</strong> total institutional working days, your ward attended only <strong>{{Present_Days}}</strong> days and remained unauthorizedly absent for <strong>{{Absent_Days}}</strong> days. Consequently, the attendance percentage stands at <strong>{{Attendance_Percentage}}%</strong>, falling significantly below the mandatory NCVT / GCVT minimum standard of 80.00%. Last notice date on record: <strong>{{Last_Notice_Date}}</strong>.
  </p>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin: 16px 0;">
    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Instructor Commentary & Advisory:</div>
    <div style="color: #334155; font-style: italic;">{{AI_Commentary}}</div>
  </div>

  <p style="text-indent: 32px; margin-bottom: 16px; text-align: justify;">
    Failure to maintain 80% attendance will disqualify the trainee from appearing in the All India Trade Test (AITT) and may lead to cancellation of admission. You are requested to meet the Supervisor Instructor in person within 3 working days of receipt of this notice.
  </p>

  <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <strong>Location:</strong> {{District}}<br/>
      <strong>Institute:</strong> {{ITI_Name}}
    </div>
    <div style="text-align: center;">
      <div style="height: 48px;"></div>
      <strong>Supervisor Instructor</strong><br/>
      <span>Trade: {{Trade}}, {{Unit}}</span><br/>
      <span>{{ITI_Name}}</span>
    </div>
  </div>
</div>`,
    created_at: '2025-08-01T10:00:00Z',
  },
];

export const INITIAL_TEMPLATES: LetterTemplate[] = DEFAULT_TEMPLATES;

