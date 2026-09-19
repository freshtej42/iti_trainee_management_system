import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export type Language = 'gu' | 'hi' | 'en';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
  shortLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', shortLabel: 'Guj' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', shortLabel: 'Hin' },
  { code: 'en', label: 'English', nativeName: 'English', shortLabel: 'Eng' },
];

export interface TranslationDictionary {
  // Navigation & Portal Branding
  portalTitle: string;
  portalSubtitle: string;
  superAdminTitle: string;
  superAdminSubtitle: string;
  tabHierarchy: string;
  tabTrainees: string;
  tabWordDesigner: string;
  tabReportGenerator: string;
  tabMonthlyAttendance: string;
  tabPrincipalReport: string;
  tabDispatchRegister: string;
  tabSuperAdmin: string;
  batchPrint: string;
  unitLabel: string;
  profile: string;
  logout: string;
  cloudLive: string;
  cloudSyncing: string;

  // Actions & Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  print: string;
  exportCsv: string;
  search: string;
  all: string;
  filter: string;
  status: string;
  date: string;
  actions: string;
  records: string;
  total: string;
  loading: string;
  confirm: string;
  close: string;
  back: string;
  call: string;
  view: string;

  // Hierarchy / Academic
  trade: string;
  batch: string;
  unit: string;
  academicHierarchy: string;
  addTrade: string;
  addBatch: string;
  addUnit: string;
  allTrades: string;
  allBatches: string;
  allUnits: string;

  // Trainee Fields
  rollNo: string;
  enrollmentNo: string;
  studentName: string;
  surname: string;
  fatherName: string;
  grandfatherName: string;
  studentMobile: string;
  parentMobile: string;
  guardian: string;
  address: string;
  villageCity: string;
  taluka: string;
  district: string;
  pincode: string;
  addTrainee: string;
  importExcel: string;
  manageUnits: string;

  // Attendance
  attendanceTracker: string;
  monthlyAttendance: string;
  presentDays: string;
  absentDays: string;
  totalWorkingDays: string;
  percentage: string;
  lowAttendance: string;
  regular: string;
  eligibleForExam: string;
  averageAttendance: string;
  draftNotice: string;
  bulkDraft: string;

  // Dispatch Register
  dispatchRegister: string;
  inward: string;
  outward: string;
  inwardLetters: string;
  outwardLetters: string;
  refNumber: string;
  outwardNumber: string;
  traineeRecipient: string;
  subject: string;
  issueDate: string;
  dispatchMode: string;
  trackingNumber: string;
  inTransit: string;
  delivered: string;
  acknowledged: string;
  printed: string;
  drafted: string;
  addEntry: string;
  scope: string;
  myTrade: string;
  allInstitute: string;

  // Notice & Reports
  noticeStage: string;
  firstWarning: string;
  secondWarning: string;
  finalNotice: string;
  generalNotice: string;
  principalForwarding: string;
  templateStudio: string;
  reportPreview: string;

  // Instructor Profile
  instructorProfile: string;
  designation: string;
  email: string;
  mobile: string;
  itiName: string;
  institutionAddress: string;
}

const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  gu: {
    portalTitle: 'ITI તાલીમાર્થી હાજરી અને ગેરહાજરી નોટિસ પ્રણાલી',
    portalSubtitle: 'ગેરહાજર તાલીમાર્થી નોટિસ જનરેશન • વર્ડ ફોર્મેટ • બહુભાષી સહાય',
    superAdminTitle: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી - સુપર એડમિન પોર્ટલ',
    superAdminSubtitle: 'રાજ્ય સ્તરીય ITI સંચાલન • ઇન્સ્ટ્રક્ટર વેરિફિકેશન • સિસ્ટમ ઓડિટ',
    tabHierarchy: 'શૈક્ષણિક માળખું',
    tabTrainees: 'તાલીમાર્થીઓ',
    tabWordDesigner: 'વર્ડ ડિઝાઇનર',
    tabReportGenerator: 'રિપોર્ટ જનરેટર',
    tabMonthlyAttendance: 'માસિક હાજરી',
    tabPrincipalReport: 'આચાર્યશ્રી રિપોર્ટ',
    tabDispatchRegister: 'આવક-જાવક રજીસ્ટર',
    tabSuperAdmin: 'સુપર એડમિન કન્સોલ',
    batchPrint: 'બેચ પ્રિન્ટ',
    unitLabel: 'યુનિટ',
    profile: 'પ્રોફાઇલ',
    logout: 'લોગ આઉટ',
    cloudLive: 'ક્લાઉડ લાઈવ',
    cloudSyncing: 'સિંકિંગ...',

    save: 'સાચવો',
    cancel: 'રદ કરો',
    delete: 'ડિલીટ કરો',
    edit: 'સુધારો',
    add: 'ઉમેરો',
    print: 'પ્રિન્ટ',
    exportCsv: 'CSV એક્સપોર્ટ',
    search: 'શોધો...',
    all: 'બધા',
    filter: 'ફિલ્ટર',
    status: 'સ્થિતિ',
    date: 'તારીખ',
    actions: 'ક્રિયાઓ',
    records: 'રેકોર્ડ્સ',
    total: 'કુલ',
    loading: 'લોડ થઈ રહ્યું છે...',
    confirm: 'ખાતરી કરો',
    close: 'બંધ કરો',
    back: 'પાછા જાઓ',
    call: 'કોલ',
    view: 'જુઓ',

    trade: 'ટ્રેડ',
    batch: 'બેચ',
    unit: 'યુનિટ',
    academicHierarchy: 'શૈક્ષણિક માળખું',
    addTrade: '+ નવો ટ્રેડ',
    addBatch: '+ નવી બેચ',
    addUnit: '+ નવું યુનિટ',
    allTrades: 'બધા ટ્રેડ',
    allBatches: 'બધી બેચ',
    allUnits: 'બધા યુનિટ',

    rollNo: 'રોલ નંબર',
    enrollmentNo: 'નોંધણી નંબર',
    studentName: 'વિદ્યાર્થીનું નામ',
    surname: 'અટક',
    fatherName: 'પિતાનું નામ',
    grandfatherName: 'દાદાનું નામ',
    studentMobile: 'તાલીમાર્થી મોબાઈલ',
    parentMobile: 'વાલીનો મોબાઈલ',
    guardian: 'વાલી',
    address: 'સરનામું',
    villageCity: 'ગામ / શહેર',
    taluka: 'તાલુકો',
    district: 'જિલ્લો',
    pincode: 'પિનકોડ',
    addTrainee: '+ નવો તાલીમાર્થી',
    importExcel: 'એક્સેલ આયાત',
    manageUnits: 'યુનિટ સંચાલન',

    attendanceTracker: 'હાજરી ટ્રેકર',
    monthlyAttendance: 'માસિક હાજરી',
    presentDays: 'હાજર દિવસ',
    absentDays: 'ગેરહાજર દિવસ',
    totalWorkingDays: 'કુલ દિવસ',
    percentage: 'ટકાવારી',
    lowAttendance: 'ઓછી હાજરી (<૮૦%)',
    regular: 'નિયમિત',
    eligibleForExam: 'પરીક્ષા માટે પાત્ર',
    averageAttendance: 'સરેરાશ હાજરી',
    draftNotice: 'નોટિસ ડ્રાફ્ટ',
    bulkDraft: 'જથ્થાબંધ નોટિસ',

    dispatchRegister: 'આવક-જાવક રજીસ્ટર',
    inward: 'આવક',
    outward: 'જાવક',
    inwardLetters: 'આવક પત્રો',
    outwardLetters: 'જાવક પત્રો',
    refNumber: 'જાવક / આવક ક્રમાંક',
    outwardNumber: 'જાવક ક્રમાંક',
    traineeRecipient: 'તાલીમાર્થી / મેળવનાર',
    subject: 'વિષય / વિગત',
    issueDate: 'નોંધણી તારીખ',
    dispatchMode: 'રવાનગી પદ્ધતિ',
    trackingNumber: 'ટ્રેકિંગ નંબર',
    inTransit: 'રવાના કરેલ',
    delivered: 'પહોંચ મળેલ',
    acknowledged: 'સ્વીકૃતિ મળેલ',
    printed: 'પ્રિન્ટેડ',
    drafted: 'ડ્રાફ્ટ',
    addEntry: '+ નવી નોંધણી',
    scope: 'વ્યાપ',
    myTrade: 'મારો ટ્રેડ',
    allInstitute: 'સમગ્ર સંસ્થા',

    noticeStage: 'નોટિસ સ્ટેજ',
    firstWarning: 'પ્રથમ ચેતવણી નોટિસ',
    secondWarning: 'દ્વિતીય ચેતવણી નોટિસ',
    finalNotice: 'આખરી કારણદર્શક નોટિસ',
    generalNotice: 'સામાન્ય નોટિસ',
    principalForwarding: 'આચાર્યશ્રી રજૂઆત',
    templateStudio: 'નોટિસ ટેમ્પલેટ ડિઝાઇનર',
    reportPreview: 'રિપોર્ટ પૂર્વાવલોકન',

    instructorProfile: 'ઇન્સ્ટ્રક્ટર પ્રોફાઇલ',
    designation: 'હોદ્દો',
    email: 'ઈમેલ',
    mobile: 'મોબાઈલ નંબર',
    itiName: 'સંસ્થાનું નામ',
    institutionAddress: 'સંસ્થાનું સરનામું',
  },

  hi: {
    portalTitle: 'आईटीआई प्रशिक्षु उपस्थिति एवं अनुपस्थिति नोटिस प्रणाली',
    portalSubtitle: 'अनुपस्थित प्रशिक्षु नोटिस जनरेशन • वर्ड प्रारूप • बहुभाषी सहायता',
    superAdminTitle: 'रोजगार एवं प्रशिक्षण निदेशालय - सुपर एडमिन पोर्टल',
    superAdminSubtitle: 'राज्य स्तरीय आईटीआई प्रबंधन • प्रशिक्षक सत्यापन • सिस्टम ऑडिट',
    tabHierarchy: 'शैक्षणिक संरचना',
    tabTrainees: 'प्रशिक्षु',
    tabWordDesigner: 'वर्ड डिज़ाइनर',
    tabReportGenerator: 'रिपोर्ट जनरेटर',
    tabMonthlyAttendance: 'मासिक उपस्थिति',
    tabPrincipalReport: 'प्राचार्य रिपोर्ट',
    tabDispatchRegister: 'आवक-जावक रजिस्टर',
    tabSuperAdmin: 'सुपर एडमिन कंसोल',
    batchPrint: 'बैच प्रिंट',
    unitLabel: 'यूनिट',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉग आउट',
    cloudLive: 'क्लाउड लाइव',
    cloudSyncing: 'सिंकिंग...',

    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संशोधित करें',
    add: 'जोड़ें',
    print: 'प्रिंट',
    exportCsv: 'CSV निर्यात',
    search: 'खोजें...',
    all: 'सभी',
    filter: 'फ़िल्टर',
    status: 'स्थिति',
    date: 'दिनांक',
    actions: 'क्रियाएँ',
    records: 'प्रविष्टियां',
    total: 'कुल',
    loading: 'लोड हो रहा है...',
    confirm: 'पुष्टि करें',
    close: 'बंद करें',
    back: 'वापस जाएं',
    call: 'कॉल करें',
    view: 'देखें',

    trade: 'ट्रेड',
    batch: 'बैच',
    unit: 'यूनिट',
    academicHierarchy: 'शैक्षणिक संरचना',
    addTrade: '+ नया ट्रेड',
    addBatch: '+ नया बैच',
    addUnit: '+ नई यूनिट',
    allTrades: 'सभी ट्रेड',
    allBatches: 'सभी बैच',
    allUnits: 'सभी यूनिट',

    rollNo: 'रोल नंबर',
    enrollmentNo: 'नामांकन संख्या',
    studentName: 'छात्र का नाम',
    surname: 'उपनाम',
    fatherName: 'पिता का नाम',
    grandfatherName: 'दादा का नाम',
    studentMobile: 'प्रशिक्षु मोबाइल',
    parentMobile: 'अभिभावक मोबाइल',
    guardian: 'अभिभावक',
    address: 'पता',
    villageCity: 'गाँव / शहर',
    taluka: 'तहसील',
    district: 'जिला',
    pincode: 'पिनकोड',
    addTrainee: '+ नया प्रशिक्षु',
    importExcel: 'एक्सेल आयात',
    manageUnits: 'यूनिट प्रबंधन',

    attendanceTracker: 'उपस्थिति ट्रैकर',
    monthlyAttendance: 'मासिक उपस्थिति',
    presentDays: 'उपस्थित दिन',
    absentDays: 'अनुपस्थित दिन',
    totalWorkingDays: 'कुल दिन',
    percentage: 'प्रतिशत',
    lowAttendance: 'कम उपस्थिति (<80%)',
    regular: 'नियमित',
    eligibleForExam: 'परीक्षा हेतु पात्र',
    averageAttendance: 'औसत उपस्थिति',
    draftNotice: 'नोटिस प्रारूप',
    bulkDraft: 'सामूहिक नोटिस',

    dispatchRegister: 'आवक-जावक रजिस्टर',
    inward: 'आवक',
    outward: 'जावक',
    inwardLetters: 'आवक पत्र',
    outwardLetters: 'जावक पत्र',
    refNumber: 'जावक / आवक क्रमांक',
    outwardNumber: 'जावक क्रमांक',
    traineeRecipient: 'प्रशिक्षु / प्राप्तकर्ता',
    subject: 'विषय / विवरण',
    issueDate: 'प्रविष्टि दिनांक',
    dispatchMode: 'प्रेषण माध्यम',
    trackingNumber: 'ट्रैकिंग नंबर',
    inTransit: 'प्रेषित (मार्ग में)',
    delivered: 'वितरित',
    acknowledged: 'स्वीकृति प्राप्त',
    printed: 'मुद्रित',
    drafted: 'प्रारूप',
    addEntry: '+ नई प्रविष्टि',
    scope: 'दायरा',
    myTrade: 'मेरा ट्रेड',
    allInstitute: 'संपूर्ण संस्थान',

    noticeStage: 'नोटिस चरण',
    firstWarning: 'प्रथम चेतावनी नोटिस',
    secondWarning: 'द्वितीय चेतावनी नोटिस',
    finalNotice: 'अंतिम कारण बताओ नोटिस',
    generalNotice: 'सामान्य नोटिस',
    principalForwarding: 'प्राचार्य अग्रेषण',
    templateStudio: 'नोटिस टेम्पलेट डिज़ाइनर',
    reportPreview: 'रिपोर्ट पूर्वावलोकन',

    instructorProfile: 'प्रशिक्षक प्रोफ़ाइल',
    designation: 'पदनाम',
    email: 'ईमेल',
    mobile: 'मोबाइल नंबर',
    itiName: 'संस्थान का नाम',
    institutionAddress: 'संस्थान का पता',
  },

  en: {
    portalTitle: 'ITI Trainee Attendance & Irregularity Notice System',
    portalSubtitle: 'Absentee Notice Generation • Word Format • Multi-language Support',
    superAdminTitle: 'Directorate of Employment & Training - Super Admin Portal',
    superAdminSubtitle: 'State Level ITI Administration • Instructor Verification • System Audit',
    tabHierarchy: 'Academic Hierarchy',
    tabTrainees: 'Trainees',
    tabWordDesigner: 'Word Designer',
    tabReportGenerator: 'Report Generator',
    tabMonthlyAttendance: 'Monthly Attendance',
    tabPrincipalReport: 'Principal Report',
    tabDispatchRegister: 'Dispatch Register',
    tabSuperAdmin: 'Super Admin Console',
    batchPrint: 'Batch Print',
    unitLabel: 'Unit',
    profile: 'Profile',
    logout: 'Log Out',
    cloudLive: 'Cloud Live',
    cloudSyncing: 'Syncing...',

    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    print: 'Print',
    exportCsv: 'Export CSV',
    search: 'Search...',
    all: 'All',
    filter: 'Filter',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    records: 'Records',
    total: 'Total',
    loading: 'Loading...',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    call: 'Call',
    view: 'View',

    trade: 'Trade',
    batch: 'Batch',
    unit: 'Unit',
    academicHierarchy: 'Academic Hierarchy',
    addTrade: '+ Add Trade',
    addBatch: '+ Add Batch',
    addUnit: '+ Add Unit',
    allTrades: 'All Trades',
    allBatches: 'All Batches',
    allUnits: 'All Units',

    rollNo: 'Roll No',
    enrollmentNo: 'Enrollment No',
    studentName: 'Student Name',
    surname: 'Surname',
    fatherName: "Father's Name",
    grandfatherName: "Grandfather's Name",
    studentMobile: 'Student Mobile',
    parentMobile: 'Parent Mobile',
    guardian: 'Guardian',
    address: 'Address',
    villageCity: 'Village / City',
    taluka: 'Taluka',
    district: 'District',
    pincode: 'Pincode',
    addTrainee: '+ Add Trainee',
    importExcel: 'Import Excel',
    manageUnits: 'Manage Units',

    attendanceTracker: 'Attendance Tracker',
    monthlyAttendance: 'Monthly Attendance',
    presentDays: 'Present Days',
    absentDays: 'Absent Days',
    totalWorkingDays: 'Working Days',
    percentage: 'Percentage',
    lowAttendance: 'Low Attendance (<80%)',
    regular: 'Regular',
    eligibleForExam: 'Eligible for Exam',
    averageAttendance: 'Average Attendance',
    draftNotice: 'Draft Notice',
    bulkDraft: 'Batch Notices',

    dispatchRegister: 'Inward & Outward Register',
    inward: 'Inward',
    outward: 'Outward',
    inwardLetters: 'Inward Letters',
    outwardLetters: 'Outward Letters',
    refNumber: 'Reference / Dispatch No',
    outwardNumber: 'Outward Number',
    traineeRecipient: 'Trainee / Recipient',
    subject: 'Subject / Detail',
    issueDate: 'Entry / Issue Date',
    dispatchMode: 'Dispatch Mode',
    trackingNumber: 'Tracking Number',
    inTransit: 'In Transit',
    delivered: 'Delivered',
    acknowledged: 'Acknowledged',
    printed: 'Printed',
    drafted: 'Draft',
    addEntry: '+ Add Entry',
    scope: 'Scope',
    myTrade: 'My Trade',
    allInstitute: 'All Institute',

    noticeStage: 'Notice Stage',
    firstWarning: '1st Warning Notice',
    secondWarning: '2nd Warning Notice',
    finalNotice: 'Final Notice',
    generalNotice: 'General Notice',
    principalForwarding: 'Principal Forwarding',
    templateStudio: 'Word Template Studio',
    reportPreview: 'Report Preview',

    instructorProfile: 'Instructor Profile',
    designation: 'Designation',
    email: 'Email',
    mobile: 'Mobile Number',
    itiName: 'ITI Name',
    institutionAddress: 'Institution Address',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationDictionary, fallback?: string) => string;
  tText: (gu: string, hi: string, en: string) => string;
  activeLanguageOption: LanguageOption;
  imeLanguageName: 'Gujarati' | 'Hindi' | 'English';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('portal_language') as Language;
    if (saved && (saved === 'gu' || saved === 'hi' || saved === 'en')) {
      return saved;
    }
    return 'gu'; // Default to Gujarati
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('portal_language', newLang);
  };

  const activeLanguageOption = useMemo(() => {
    return LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];
  }, [language]);

  const imeLanguageName: 'Gujarati' | 'Hindi' | 'English' = useMemo(() => {
    if (language === 'hi') return 'Hindi';
    if (language === 'en') return 'English';
    return 'Gujarati';
  }, [language]);

  const t = (key: keyof TranslationDictionary, fallback?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || fallback || TRANSLATIONS.en[key] || String(key);
  };

  const tText = (gu: string, hi: string, en: string): string => {
    if (language === 'gu') return gu;
    if (language === 'hi') return hi;
    return en;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tText,
        activeLanguageOption,
        imeLanguageName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
