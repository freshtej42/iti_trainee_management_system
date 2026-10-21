import React, { useState, useMemo, useRef } from 'react';
import {
  Instructor,
  LetterTemplate,
  HeaderConfig,
  Trainee,
  AttendanceRecord,
  DispatchLog,
  CustomTableTemplate,
} from '../types';
import TinyMceEditor, { MERGE_TAG_ITEMS } from './WordEditor/TinyMceEditor';
import TinyMceLetterheadEditor from './WordEditor/TinyMceLetterheadEditor';
import { LetterheadEditorModal } from './LetterheadEditorModal';
import CustomTableBuilderModal from './CustomTableBuilderModal';
import {
  getEffectiveLetterheadHtml,
  renderLetterheadHtml,
  generateDefaultLetterheadHtml,
} from '../utils/letterheadPresets';
import {
  mergeTemplateTags,
  generateOutwardReference,
  getEffectiveCustomTables,
} from '../utils/mergeTags';
import { exportElementToPdf, printCleanDocument } from '../utils/pdfExport';
import {
  FileText,
  Plus,
  Save,
  Trash2,
  Copy,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings,
  ChevronDown,
  ArrowRight,
  Upload,
  X,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  ClipboardList,
  Tag,
  ShieldCheck,
  Check,
  RefreshCw,
  Table2,
} from 'lucide-react';

export interface TemplateStudioProps {
  instructor: Instructor;
  templates: LetterTemplate[];
  trainees?: Trainee[];
  attendanceRecords?: AttendanceRecord[];
  dispatchLogs?: DispatchLog[];
  onSaveTemplate: (template: LetterTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onUpdateInstructorHeader: (headerConfig: HeaderConfig) => void;
  onUseTemplateForReport: (template: LetterTemplate) => void;
}

// Pre-built Official Gujarat ITI Report Format Starters
export const STARTER_PRESETS = [
  {
    id: 'preset-1st-warning',
    name: 'પ્રથમ ગેરહાજરી ચેતવણી નોટિસ (1st Attendance Warning Notice)',
    category: 'attendance_warning',
    notice_type: '1st Warning' as const,
    show_letterhead: true,
    subject: 'સંસ્થામાં વગર પરવાનગીએ ગેરહાજર રહેવા બાબત પ્રથમ ચેતવણી પત્ર.',
    content: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
    <div style="text-align: left; font-size: 13px; line-height: 1.5;">
      <div><strong>જાવક ક્રમાંક:</strong> {{Ref_No}}</div>
      <div>આચાર્યશ્રીની કચેરી,</div>
      <div>{{ITI_Name}}</div>
      <div><strong>તારીખ:</strong> {{Current_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 18px;">
    <div><strong>પ્રતિશ્રી,</strong></div>
    <div style="padding-left: 20px; margin-top: 4px;">
      <div><strong>{{Father_Name}} {{Surname}}</strong></div>
      <div>(વાલીશ્રી: <strong>{{Trainee_Name}}</strong> - રોલ નં: <strong>{{Roll_No}}</strong>)</div>
      <div>{{Address}}</div>
      <div>મોબાઈલ નં: {{Parent_Mobile}}</div>
    </div>
  </div>

  <div style="text-align: center; margin: 18px 0; font-weight: bold; font-size: 15px; text-decoration: underline;">
    વિષય :- સંસ્થામાં નિયમિત હાજર ન રહેવા અને અનિયમિતતા બાબત.
  </div>

  <div style="margin-bottom: 12px;">
    <strong>મહાશય / વાલીશ્રી,</strong>
  </div>

  <p style="text-indent: 32px; margin-bottom: 14px; text-align: justify;">
    સવિનય જણાવવાનું કે આપનો પુત્ર/પુત્રી <strong>{{Trainee_Name}}</strong> આ સંસ્થામાં વ્યવસાય <strong>{{Trade}}</strong>, બેચ <strong>{{Batch}}</strong> ({{Unit}}) માં અભ્યાસ કરે છે. માહે <strong>{{Month_Year}}</strong> દરમિયાન કુલ કામકાજના <strong>{{Total_Working_Days}}</strong> દિવસોમાંથી તેઓ માત્ર <strong>{{Present_Days}}</strong> દિવસ હાજર રહેલ છે અને <strong>{{Absent_Days}}</strong> દિવસ વગર પરવાનગીએ ગેરહાજર રહેલ છે.
  </p>

  <p style="text-indent: 32px; margin-bottom: 14px; text-align: justify;">
    જેથી તાલીમાર્થીની માસિક હાજરી માત્ર <strong>{{Attendance_Percentage}}%</strong> થાય છે. ડી.જી.ટી. (DGT) અને ખાતાના નિયમાનુસાર વાર્ષિક પરીક્ષામાં બેસવા માટે ઓછામાં ઓછી <strong>૮૦%</strong> હાજરી અનિવાર્ય છે. અગાઉ આપેલ નોટિસ તારીખો: <strong>{{Previous_Notice_Dates}}</strong> છે. આથી આપને જાણ કરવામાં આવે છે કે તાલીમાર્થી નિયમિત હાજર રહે તે સુનિશ્ચિત કરશો.
  </p>

  <div class="doc-shape" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; margin: 18px 0;">
    <div style="font-weight: bold; margin-bottom: 6px; color: #1e293b;">• હાજરી સારાંશ વિગત:</div>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <tr style="background-color: #e2e8f0; font-weight: bold; text-align: center;">
        <td style="border: 1px solid #94a3b8; padding: 6px;">કુલ દિવસો</td>
        <td style="border: 1px solid #94a3b8; padding: 6px;">હાજર દિવસો</td>
        <td style="border: 1px solid #94a3b8; padding: 6px;">ગેરહાજર દિવસો</td>
        <td style="border: 1px solid #94a3b8; padding: 6px;">હાજરી %</td>
      </tr>
      <tr style="text-align: center;">
        <td style="border: 1px solid #94a3b8; padding: 6px;">{{Total_Working_Days}}</td>
        <td style="border: 1px solid #94a3b8; padding: 6px;">{{Present_Days}}</td>
        <td style="border: 1px solid #94a3b8; padding: 6px; color: #b91c1c; font-weight: bold;">{{Absent_Days}}</td>
        <td style="border: 1px solid #94a3b8; padding: 6px; font-weight: bold;">{{Attendance_Percentage}}%</td>
      </tr>
    </table>
  </div>

  <p style="margin-bottom: 24px; text-align: justify;">
    જો તાલીમાર્થી પોતાની હાજરીમાં સુધારો નહીં કરે તો ભવિષ્યમાં તેનું નામ કમી કરવાની કે પરીક્ષા ફોર્મ રોકવાની કાર્યવાહી કરવામાં આવશે જેની સંપૂર્ણ જવાબદારી વાલીશ્રીની રહેશે.
  </p>
</div>`,
  },
  {
    id: 'preset-2nd-warning',
    name: 'દ્વિતીય કડક ચેતવણી નોટિસ - વાલી રૂબરૂ મુલાકાત (2nd Warning & Parent Summons)',
    category: 'attendance_warning',
    notice_type: '2nd Warning' as const,
    show_letterhead: true,
    subject: 'સતત અનિયમિતતા બાબતે સંસ્થા ખાતે રૂબરૂ હાજર રહેવા આખરી નોટિસ.',
    content: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
    <div style="text-align: left; font-size: 13px; line-height: 1.5;">
      <div><strong>જાવક ક્રમાંક:</strong> {{Ref_No}}</div>
      <div>આચાર્યશ્રીની કચેરી, {{ITI_Name}}</div>
      <div><strong>તારીખ:</strong> {{Current_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 18px;">
    <div><strong>પ્રતિશ્રી,</strong></div>
    <div style="padding-left: 20px; margin-top: 4px;">
      <div><strong>{{Father_Name}} {{Surname}}</strong></div>
      <div>(વાલીશ્રી: <strong>{{Trainee_Name}}</strong> - રોલ નં: <strong>{{Roll_No}}</strong>)</div>
      <div>{{Address}}</div>
      <div>મોબાઈલ: {{Parent_Mobile}}</div>
    </div>
  </div>

  <div style="text-align: center; margin: 18px 0; font-weight: bold; font-size: 15px; color: #991b1b; text-decoration: underline;">
    વિષય :- પૂર્વ ચેતવણી આપવા છતાં ગેરહાજર રહેવા બાબતે આખરી નોટિસ.
  </div>

  <div style="margin-bottom: 12px;">
    <strong>મહાશય,</strong>
  </div>

  <p style="text-indent: 32px; margin-bottom: 14px; text-align: justify;">
    ઉપરોક્ત વિષય સંદર્ભે જણાવવાનું કે આપના પાલ્ય <strong>{{Trainee_Name}}</strong> (રોલ નં. <strong>{{Roll_No}}</strong>, ટ્રેડ: <strong>{{Trade}}</strong>) ને અગાઉ તારીખ: <strong>{{Previous_Notice_Dates}}</strong> ના રોજ પત્ર દ્વારા અનિયમિતતા અંગે જાણ કરવામાં આવી હતી. તેમ છતાં તેઓ તારીખ <strong>{{Absent_From_Date}}</strong> થી કોઈપણ સત્તાવાર રજા મંજૂર કરાવ્યા વગર સતત ગેરહાજર રહેલ છે.
  </p>

  <p style="text-indent: 32px; margin-bottom: 14px; text-align: justify;">
    હાલમાં તાલીમાર્થીની હાજરી માત્ર <strong>{{Attendance_Percentage}}%</strong> છે (અગાઉ મોકલેલ નોટિસ સંખ્યા: <strong>{{Prior_Notice_Count}}</strong>). આથી આપને આ નોટિસ મળ્યેથી <strong>દિન-૩</strong> માં આ કચેરી ખાતે રૂબરૂ ઉપસ્થિત રહી લેખિત ખુલાસો આપવા તાકીદ કરવામાં આવે છે.
  </p>

  <p style="margin-bottom: 24px; text-align: justify; font-weight: bold; color: #991b1b;">
    જો નિર્ધારિત સમયમર્યાદામાં વાલીશ્રી રૂબરૂ હાજર નહીં રહે તો તાલીમાર્થીનું નામ સંસ્થાના હાજરી પત્રકમાંથી આપોઆપ કમી (Struck-off) કરવામાં આવશે અને તેનું સ્ટાઈપેન્ડ રોકી દેવામાં આવશે.
  </p>
</div>`,
  },
  {
    id: 'preset-principal-report',
    name: 'આચાર્યશ્રી અહેવાલ રિપોર્ટ ટેબલ (Principal Forwarding Report Table)',
    category: 'principal_report',
    notice_type: 'Report' as const,
    show_letterhead: false,
    subject: 'અનિયમિત તાલીમાર્થીઓની યાદી અને શિક્ષાત્મક કાર્યવાહી દરખાસ્ત.',
    content: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
    <div style="text-align: left; font-size: 13px; line-height: 1.5;">
      <div><strong>સુ.ઇ. નું નામ :</strong> {{Instructor_Name}}</div>
      <div><strong>ટ્રેડ:</strong> {{Trade}} ({{Unit}})</div>
      <div>{{ITI_Name}}</div>
      <div><strong>તારીખ :</strong> {{Notice_Issue_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <div><strong>પ્રતિ,</strong></div>
    <div><strong>આચાર્યશ્રી,</strong></div>
    <div>{{ITI_Name}}</div>
  </div>

  <div style="text-align: center; margin: 16px 0; font-weight: bold; font-size: 15px; text-decoration: underline;">
    વિષય :- ટ્રેડ {{Trade}} ના ૮૦% થી ઓછી હાજરી ધરાવતા તાલીમાર્થીઓની વાલીને જાણ કરવા બાબતનો અહેવાલ.
  </div>

  <p style="margin-bottom: 14px; text-align: justify; text-indent: 28px;">
    માનનીય સાહેબશ્રી, ઉપરોક્ત વિષય અન્વયે સવિનય જણાવવાનું કે માહે <strong>{{Month_Year}}</strong> દરમિયાન અત્રેના ટ્રેડમાં તાલીમ લઈ રહેલા નીચેના તાલીમાર્થીઓ નિયમિત હાજરી આપવામાં નિષ્ફળ રહેલ છે અને વારંવાર સૂચના આપવા છતાં હાજરીમાં સુધારો થયેલ નથી:
  </p>

  {{Trainee_Attendance_Table}}

  <p style="margin-top: 16px; margin-bottom: 24px; text-align: justify;">
    ઉપરોક્ત તમામ તાલીમાર્થીઓના વાલીશ્રીઓને કચેરી મારફત નોટિસ પાઠવી રૂબરૂ બોલાવવા અને ખાતાકીય નિયમાનુસાર આગળની જરૂરી શિક્ષાત્મક કાર્યવાહી કરવા ભલામણ સહ સવિનય રવાના.
  </p>

  <div style="margin-top: 36px; display: flex; justify-content: flex-end; text-align: center;">
    <div>
      <div style="height: 36px;"></div>
      <div style="font-weight: bold;">આપનો વિશ્વાસુ</div>
      <div style="margin-top: 4px;">{{Instructor_Name}}</div>
      <div>{{Designation}}, {{Trade}}</div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'preset-parent-meeting',
    name: 'વાલી મિટિંગ આમંત્રણ પત્ર (Parent-Teacher Meeting Notice)',
    category: 'general_notice',
    notice_type: 'General Notice' as const,
    subject: 'તાલીમાર્થી પ્રગતિ અને વાલી સંમેલન બાબત.',
    content: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
    <div style="text-align: left; font-size: 13px; line-height: 1.5;">
      <div><strong>પત્ર ક્રમાંક:</strong> {{Ref_No}}</div>
      <div>{{ITI_Name}}</div>
      <div><strong>તારીખ:</strong> {{Current_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 18px;">
    <div><strong>પ્રતિશ્રી,</strong></div>
    <div style="padding-left: 20px; margin-top: 4px;">
      <div><strong>{{Father_Name}} {{Surname}}</strong></div>
      <div>વાલીશ્રી: <strong>{{Trainee_Name}}</strong> (ટ્રેડ: <strong>{{Trade}}</strong>, રોલ નં: <strong>{{Roll_No}}</strong>)</div>
      <div>{{Address}}</div>
    </div>
  </div>

  <div style="text-align: center; margin: 18px 0; font-weight: bold; font-size: 15px; text-decoration: underline;">
    વિષય :- વાલી-શિક્ષક મિટિંગ (PTM) માં હાજર રહેવા અંગે.
  </div>

  <div style="margin-bottom: 12px;">
    <strong>આદરણીય વાલીશ્રી,</strong>
  </div>

  <p style="text-indent: 32px; margin-bottom: 14px; text-align: justify;">
    જય ભારત સાથે જણાવવાનું કે આ સંસ્થામાં ટ્રેડ <strong>{{Trade}}</strong> માં તાલીમ લઈ રહેલ આપના પાલ્ય <strong>{{Trainee_Name}}</strong> ની શૈક્ષણિક પ્રગતિ, પ્રેક્ટિકલ કૌશલ્ય, વર્તણૂક અને હાજરી (હાલની હાજરી: <strong>{{Attendance_Percentage}}%</strong>) ની સમીક્ષા કરવા માટે સંસ્થા ખાતે વાલી મીટિંગનું આયોજન કરવામાં આવેલ છે.
  </p>

  <div class="doc-shape" style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; margin: 18px 0; font-size: 13px;">
    <div><strong>• મિટિંગ સ્થળ:</strong> {{ITI_Name}}, વર્કશોપ હોલ</div>
    <div><strong>• સમય:</strong> સવારે ૧૧:૦૦ થી બપોરે ૧:૦૦ વાગ્યા સુધી</div>
    <div><strong>• ચર્ચાના મુખ્ય મુદ્દા:</strong> આગામી AITT સીબીટી પરીક્ષા, પ્રેક્ટિકલ મૂલ્યાંકન, અપ્રેન્ટિસશીપ તકો</div>
  </div>

  <p style="margin-bottom: 24px; text-align: justify;">
    આપની ઉપસ્થિતિ તાલીમાર્થીના ઉજ્જવળ ભવિષ્ય માટે અત્યંત આવશ્યક હોવાથી સમયસર ઉપસ્થિત રહેવા વિનંતી છે.
  </p>
</div>`,
  },
  {
    id: 'preset-certificate',
    name: 'તાલીમાર્થી હાજરી પ્રમાણપત્ર (Trainee Attendance Certificate)',
    category: 'general_notice',
    notice_type: 'General Notice' as const,
    subject: 'તાલીમાર્થી સંતોષકારક હાજરી પ્રમાણપત્ર.',
    content: `<div style="line-height: 1.8; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111; text-align: justify;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="font-size: 18px; font-weight: bold; text-decoration: underline; margin-bottom: 6px;">
      તાલીમાર્થી હાજરી પ્રમાણપત્ર (ATTENDANCE CERTIFICATE)
    </h2>
    <div style="font-size: 12px; color: #475569;">જાવક ક્રમાંક: {{Ref_No}} | તારીખ: {{Current_Date}}</div>
  </div>

  <p style="text-indent: 32px; margin-bottom: 16px;">
    આથી પ્રમાણપત્ર આપવામાં આવે છે કે કુ./શ્રી <strong>{{Trainee_Name}}</strong> (રોલ નં: <strong>{{Roll_No}}</strong>, નોંધણી નં: <strong>{{Enrollment_No}}</strong>), પિતાશ્રી: <strong>{{Father_Name}} {{Surname}}</strong>, આ સંસ્થામાં ટ્રેડ <strong>{{Trade}}</strong> (બેચ: <strong>{{Batch}}</strong>) માં નિયમિત તાલીમાર્થી તરીકે અભ્યાસ કરે છે.
  </p>

  <p style="text-indent: 32px; margin-bottom: 16px;">
    સદર તાલીમાર્થીની માહે <strong>{{Month_Year}}</strong> સુધીની સરેરાશ હાજરી <strong>{{Attendance_Percentage}}%</strong> (કુલ કામકાજના <strong>{{Total_Working_Days}}</strong> દિવસોમાંથી <strong>{{Present_Days}}</strong> દિવસ હાજર) નોંધાયેલ છે.
  </p>

  <p style="text-indent: 32px; margin-bottom: 24px;">
    સંસ્થામાં તેમનું વર્તન અને શિસ્ત સંતોષકારક રહેલ છે. આ પ્રમાણપત્ર તેમના સ્કોલરશીપ / બસ પાસ / સત્તાવાર ઉપયોગ અર્થે આપવામાં આવેલ છે.
  </p>
</div>`,
  },
  {
    id: 'preset-blank',
    name: 'કોરો દસ્તાવેજ (Blank A4 TinyMCE Document)',
    category: 'custom',
    notice_type: 'General Notice' as const,
    subject: 'નવો દસ્તાવેજ / પત્ર વ્યવહાર',
    content: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
    <div style="text-align: left; font-size: 13px; line-height: 1.5;">
      <div><strong>જાવક નં:</strong> {{Ref_No}}</div>
      <div><strong>તારીખ:</strong> {{Current_Date}}</div>
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <div><strong>પ્રતિશ્રી,</strong></div>
    <div style="padding-left: 20px; margin-top: 4px;">
      <div>{{Trainee_Name}} (રોલ નં: {{Roll_No}})</div>
      <div>{{Address}}</div>
    </div>
  </div>

  <div style="text-align: center; margin: 18px 0; font-weight: bold; font-size: 15px; text-decoration: underline;">
    વિષય :- અહીં પત્રનો મુખ્ય વિષય લખો...
  </div>

  <p style="text-indent: 32px; margin-bottom: 16px;">
    અહીં આપની વિગતવાર વિગતો ગુજરાતી અથવા અંગ્રેજી ભાષામાં લખો. આપ ઉપરના TinyMCE ટૂલબારમાંથી 'મર્જ ટૅગ્સ' બટન દ્વારા વિદ્યાર્થીના નામ, રોલ નં, સરનામું, હાજરી ટકાવારી જેવા ડાયનામિક ફીલ્ડ્સ અને આકારો ઉમેરી શકો છો.
  </p>
</div>`,
  },
];

export default function TemplateStudio({
  instructor,
  templates,
  trainees = [],
  attendanceRecords = [],
  dispatchLogs = [],
  onSaveTemplate,
  onDeleteTemplate,
  onUpdateInstructorHeader,
  onUseTemplateForReport,
}: TemplateStudioProps) {
  const isGuest = Boolean(
    instructor.role === 'guest' ||
    instructor.is_guest ||
    instructor.id === 'guest-demo-instructor'
  );

  // Main view mode: 'gallery' (Template Manager Cards) or 'editor' (TinyMCE A4 Canvas)
  const [viewMode, setViewMode] = useState<'gallery' | 'editor'>('gallery');

  // Gallery filters
  const [galleryCategory, setGalleryCategory] = useState<string>('all');
  const [gallerySearch, setGallerySearch] = useState<string>('');

  // Active template being edited
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    templates[0]?.id || STARTER_PRESETS[0].id
  );

  // Active template lookup
  const currentTemplate = useMemo(() => {
    return (
      templates.find((t) => t.id === activeTemplateId) ||
      templates[0] || {
        id: 'tpl-default',
        instructor_id: instructor.id,
        name: 'પ્રથમ અનિયમિતતા ચેતવણી નોટિસ',
        template_name: 'પ્રથમ અનિયમિતતા ચેતવણી નોટિસ',
        category: 'attendance_warning',
        notice_type: '1st Warning',
        subject: 'સંસ્થામાં અનિયમિતતા બાબતે ચેતવણી પત્ર',
        content_html: STARTER_PRESETS[0].content,
        language: 'Gujarati',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
  }, [templates, activeTemplateId, instructor]);

  // Editor document state
  const [contentHtml, setContentHtml] = useState<string>(
    currentTemplate.content_html || STARTER_PRESETS[0].content
  );
  const [templateName, setTemplateName] = useState<string>(
    currentTemplate.template_name || currentTemplate.name || 'નોટિસ પત્ર'
  );
  const [noticeType, setNoticeType] = useState<string>(
    currentTemplate.notice_type || '1st Warning'
  );
  const [category, setCategory] = useState<string>(
    currentTemplate.category || 'attendance_warning'
  );
  const [subject, setSubject] = useState<string>(currentTemplate.subject || '');

  // Letterhead visual controls
  const [showLetterhead, setShowLetterhead] = useState<boolean>(
    () => currentTemplate.show_letterhead !== false
  );

  // Live Trainee Data Mode (test rendering real student records)
  const [previewMerged, setPreviewMerged] = useState<boolean>(false);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(
    trainees[0]?.id || ''
  );

  // Modals state
  const [isStartersModalOpen, setIsStartersModalOpen] = useState<boolean>(false);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState<boolean>(false);
  const [saveAsName, setSaveAsName] = useState<string>('');
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [previewModalTemplate, setPreviewModalTemplate] = useState<LetterTemplate | null>(null);

  // Custom Table Merge Tag Builder state
  const [customTables, setCustomTables] = useState<CustomTableTemplate[]>(() =>
    getEffectiveCustomTables(instructor)
  );
  const [isCustomTableBuilderOpen, setIsCustomTableBuilderOpen] = useState<boolean>(false);

  const handleSaveCustomTables = (updatedTables: CustomTableTemplate[]) => {
    setCustomTables(updatedTables);
    try {
      localStorage.setItem('iti_custom_table_templates', JSON.stringify(updatedTables));
    } catch {
      // Ignore storage error
    }
    showToast('✓ કસ્ટમ ટેબલ મર્જ ટેગ સાચવવામાં આવ્યું!');
  };

  const handleInsertCustomTableTag = (tag: string) => {
    if (viewMode === 'editor') {
      const activeEditor = (window as any).tinymce?.activeEditor;
      if (activeEditor) {
        activeEditor.insertContent(`<p>${tag}</p>`);
      } else {
        setContentHtml((prev) => `${prev}\n<p>${tag}</p>`);
      }
      showToast(`✓ કસ્ટમ ટેબલ ટેગ ${tag} પત્રમાં ઉમેરાયું!`);
    } else {
      navigator.clipboard?.writeText(tag);
      showToast(`✓ ટેગ ${tag} કોપી થયું! કોઈપણ ટેમ્પલેટમાં પેસ્ટ કરો.`);
    }
  };

  // Header Config state
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(
    instructor.header_config || {
      show_logo: true,
      institute_name_gu: instructor.iti_name,
      institute_name_en: 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE',
      department_subtitle: 'કૌશલ્ય વિકાસ અને વ્યાવસાયિક તાલીમ વિભાગ',
      address: instructor.institution_address || 'ગુજરાત',
      ref_prefix: instructor.outward_code_prefix || 'ઔતાસં/તલમ/૨૦૨૫',
    }
  );

  // Direct TinyMCE Rich-Text Letterhead State
  const [letterheadHtml, setLetterheadHtml] = useState<string>(() =>
    getEffectiveLetterheadHtml(instructor, currentTemplate)
  );
  const [isTemplateSpecificHeader, setIsTemplateSpecificHeader] = useState<boolean>(() =>
    Boolean(currentTemplate.use_custom_letterhead || currentTemplate.letterhead_html)
  );

  const templateImageInputRef = useRef<HTMLInputElement>(null);

  // Upload image from device directly into template body
  const handleInsertImageIntoTemplate = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP, SVG, GIF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const imgHtml = `<p><img src="${dataUrl}" alt="${file.name}" style="max-width: 100%; height: auto; object-fit: contain; margin: 8px 0;" /></p>`;
      const activeEditor = (window as any).tinymce?.activeEditor;
      if (activeEditor) {
        activeEditor.insertContent(imgHtml);
      } else {
        setContentHtml((prev) => `${prev}\n${imgHtml}`);
      }
      showToast('✓ Image successfully inserted from device!');
    };
    reader.readAsDataURL(file);
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open template in TinyMCE editor
  const handleOpenInEditor = (tmpl: LetterTemplate) => {
    setActiveTemplateId(tmpl.id);
    setContentHtml(tmpl.content_html || '');
    setTemplateName(tmpl.template_name || tmpl.name || 'નોટિસ પત્ર');
    setNoticeType(tmpl.notice_type || '1st Warning');
    setCategory(tmpl.category || 'attendance_warning');
    setSubject(tmpl.subject || '');
    setShowLetterhead(tmpl.show_letterhead !== false);
    if (tmpl.header_config) {
      setHeaderConfig(tmpl.header_config);
    }
    setLetterheadHtml(getEffectiveLetterheadHtml(instructor, tmpl));
    setIsTemplateSpecificHeader(Boolean(tmpl.use_custom_letterhead || tmpl.letterhead_html));
    setPreviewMerged(false);
    setViewMode('editor');
  };

  // Trainee data lookup for live preview
  const currentTrainee = useMemo(() => {
    if (selectedTraineeId) {
      const found = trainees.find((t) => t.id === selectedTraineeId);
      if (found) return found;
    }
    return trainees[0] || null;
  }, [trainees, selectedTraineeId]);

  const currentAttendance = useMemo(() => {
    if (!currentTrainee) return null;
    const recs = attendanceRecords.filter((r) => r.trainee_id === currentTrainee.id);
    return recs[recs.length - 1] || null;
  }, [attendanceRecords, currentTrainee]);

  const lastNoticeDate = useMemo(() => {
    if (!currentTrainee) return undefined;
    const logs = dispatchLogs.filter((l) => l.trainee_id === currentTrainee.id);
    if (logs.length === 0) return undefined;
    return logs[logs.length - 1].issue_date;
  }, [dispatchLogs, currentTrainee]);

  // Live Merged HTML for True A4 Preview
  const mergedHtml = useMemo(() => {
    if (!currentTrainee) return contentHtml;
    const workingDays = currentAttendance?.total_working_days || 24;
    const presentDays = currentAttendance?.present_days || 14;
    const absentDays = currentAttendance?.absent_days || workingDays - presentDays;
    const percentage =
      currentAttendance?.attendance_percentage ||
      Number(((presentDays / workingDays) * 100).toFixed(2));
    const monthYear = currentAttendance?.month_year || 'August 2026';
    const refNumber = generateOutwardReference(
      instructor.trade,
      currentTrainee.roll_no,
      monthYear
    );

    const lowAttendanceList = trainees
      .map((tr) => ({
        trainee: tr,
        attendance: attendanceRecords.find((a) => a.trainee_id === tr.id),
      }))
      .filter((item) => (item.attendance?.attendance_percentage ?? 100) < 80);

    return mergeTemplateTags(contentHtml, {
      trainee: currentTrainee,
      instructor,
      dispatchLogs,
      allLowAttendanceTrainees: lowAttendanceList,
      selectedTrainees: trainees.slice(0, 6).map((tr) => ({
        trainee: tr,
        attendance: attendanceRecords.find((a) => a.trainee_id === tr.id),
      })),
      customTableTemplates: customTables,
      monthYear,
      workingDays,
      presentDays,
      absentDays,
      attendancePercentage: percentage,
      referenceNumber: refNumber,
      noticeIssueDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      lastNoticeDate,
      aiCommentary:
        currentAttendance && currentAttendance.attendance_percentage < 80
          ? `તાલીમાર્થીની હાજરી ${percentage}% નોંધાયેલ છે, જે નિયમાનુસાર ૮૦% કરતા ઓછી હોવાથી પરીક્ષા માટે ગેરલાયક ઠરી શકે છે.`
          : undefined,
    });
  }, [
    contentHtml,
    currentTrainee,
    currentAttendance,
    instructor,
    lastNoticeDate,
    dispatchLogs,
    trainees,
    attendanceRecords,
    customTables,
  ]);

  // Save letterhead HTML as Global Default across all templates
  const handleSaveAsGlobalDefault = (html: string) => {
    if (isGuest) {
      showToast('Letterhead modifications are disabled in Demo Mode.');
      return;
    }
    setLetterheadHtml(html);
    setIsTemplateSpecificHeader(false);
    const updatedHeader: HeaderConfig = {
      ...headerConfig,
      letterhead_html: html,
      letterhead_mode: 'tinymce_canvas',
    };
    setHeaderConfig(updatedHeader);
    onUpdateInstructorHeader(updatedHeader);
    showToast('લેટરહેડ સફળતાપૂર્વક તમામ નોટિસો માટે ગ્લોબલ ડિફોલ્ટ તરીકે સાચવાયો!');
  };

  // Reset letterhead to official ITI preset
  const handleResetLetterhead = () => {
    if (isGuest) return;
    const defaultHtml = generateDefaultLetterheadHtml(instructor);
    setLetterheadHtml(defaultHtml);
    showToast('લેટરહેડ મૂળભૂત સરકારી ITI ફોર્મેટમાં રીસેટ થયું.');
  };

  // Save current template to Cloud Firestore and local state
  const handleSaveCurrentTemplate = () => {
    if (isGuest) {
      showToast('Saving templates is disabled in Demo Mode.');
      return;
    }
    const updatedHeaderConfig: HeaderConfig = {
      ...headerConfig,
      letterhead_html: letterheadHtml,
      letterhead_mode: 'tinymce_canvas',
    };

    const updated: LetterTemplate = {
      ...currentTemplate,
      id: currentTemplate.id,
      instructor_id: instructor.id,
      template_name: templateName.trim() || 'Untitled Template',
      name: templateName.trim() || 'Untitled Template',
      notice_type: noticeType as any,
      category: category as any,
      subject,
      content_html: contentHtml,
      header_config: updatedHeaderConfig,
      letterhead_html: letterheadHtml,
      use_custom_letterhead: isTemplateSpecificHeader,
      show_letterhead: showLetterhead,
      language: 'Gujarati',
      updated_at: new Date().toISOString(),
    };

    onSaveTemplate(updated);
    if (!isTemplateSpecificHeader) {
      onUpdateInstructorHeader(updatedHeaderConfig);
    }
    showToast(`Template '${updated.template_name}' saved successfully!`);
  };

  // Save as new / Duplicate template
  const handleSaveAsNew = () => {
    if (isGuest) {
      showToast('Saving templates is disabled in Demo Mode.');
      return;
    }
    if (!saveAsName.trim()) return;
    const newId = `tmpl-custom-${Date.now()}`;
    const updatedHeaderConfig: HeaderConfig = {
      ...headerConfig,
      letterhead_html: letterheadHtml,
      letterhead_mode: 'tinymce_canvas',
    };

    const newTemplate: LetterTemplate = {
      id: newId,
      instructor_id: instructor.id,
      template_name: saveAsName.trim(),
      name: saveAsName.trim(),
      notice_type: noticeType as any,
      category: category as any,
      subject,
      content_html: contentHtml,
      header_config: updatedHeaderConfig,
      letterhead_html: letterheadHtml,
      use_custom_letterhead: isTemplateSpecificHeader,
      show_letterhead: showLetterhead,
      language: 'Gujarati',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveTemplate(newTemplate);
    setActiveTemplateId(newId);
    setTemplateName(saveAsName.trim());
    setIsSaveAsModalOpen(false);
    setSaveAsName('');
    showToast(`Template '${newTemplate.template_name}' created successfully!`);
  };

  // Duplicate a template directly from gallery card
  const handleDuplicateFromGallery = (tmpl: LetterTemplate) => {
    if (isGuest) {
      showToast('Duplicating templates is disabled in Demo Mode.');
      return;
    }
    const cloneName = `${tmpl.template_name || tmpl.name} (Copy)`;
    const newId = `tmpl-custom-${Date.now()}`;
    const duplicated: LetterTemplate = {
      ...tmpl,
      id: newId,
      instructor_id: instructor.id,
      template_name: cloneName,
      name: cloneName,
      show_letterhead: tmpl.show_letterhead !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onSaveTemplate(duplicated);
    showToast(`'${cloneName}' duplicated successfully!`);
  };

  // Create new template from starter preset
  const handleLoadStarter = (preset: typeof STARTER_PRESETS[0]) => {
    if (isGuest) {
      showToast('Creating templates is disabled in Demo Mode.');
      return;
    }
    const newId = `tmpl-custom-${Date.now()}`;
    const newTmpl: LetterTemplate = {
      id: newId,
      instructor_id: instructor.id,
      template_name: preset.name,
      name: preset.name,
      notice_type: preset.notice_type,
      category: preset.category as any,
      subject: preset.subject,
      content_html: preset.content,
      language: 'Gujarati',
      header_config: headerConfig,
      show_letterhead: (preset as any).show_letterhead !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onSaveTemplate(newTmpl);
    handleOpenInEditor(newTmpl);
    setIsStartersModalOpen(false);
    showToast(`Template '${preset.name}' started!`);
  };

  // Delete template
  const handleDeleteTemplatePrompt = (tmpl: LetterTemplate) => {
    if (isGuest) {
      showToast('Deleting templates is disabled in Demo Mode.');
      return;
    }
    if (templates.length <= 1) {
      alert('At least one template must remain in the portal.');
      return;
    }
    const name = tmpl.template_name || tmpl.name || 'this template';
    if (confirm(`Are you sure you want to delete template '${name}'?`)) {
      onDeleteTemplate(tmpl.id);
      if (activeTemplateId === tmpl.id) {
        const remaining = templates.filter((t) => t.id !== tmpl.id);
        if (remaining.length > 0) {
          handleOpenInEditor(remaining[0]);
        }
      }
      showToast('Template deleted successfully.');
    }
  };

  // Print Clean A4
  const handlePrint = () => {
    const sheet = document.getElementById('notice-a4-sheet');
    if (!sheet) {
      window.print();
      return;
    }
    printCleanDocument(sheet);
  };

  // Export PDF
  const handleExportPdf = async () => {
    const sheet = document.getElementById('notice-a4-sheet');
    if (!sheet) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPdf(sheet, {
        filename: `${templateName.replace(/\s+/g, '_')}.pdf`,
        scale: 2.2,
      });
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('PDF export error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Filter templates for gallery
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      // Category filter
      if (galleryCategory === 'warning') {
        const isWarn =
          t.category === 'attendance_warning' ||
          t.notice_type === '1st Warning' ||
          t.notice_type === '2nd Warning' ||
          t.notice_type === 'Final Notice';
        if (!isWarn) return false;
      } else if (galleryCategory === 'principal') {
        const isPrin =
          t.category === 'principal_report' ||
          t.notice_type === 'Report' ||
          (t.template_name && t.template_name.includes('આચાર્ય')) ||
          (t.subject && t.subject.includes('આચાર્ય'));
        if (!isPrin) return false;
      } else if (galleryCategory === 'general') {
        const isGen =
          t.category === 'general_notice' ||
          t.notice_type === 'General Notice' ||
          t.notice_type === 'Parent Notice';
        if (!isGen) return false;
      } else if (galleryCategory === 'custom') {
        if (t.instructor_id === 'global') return false;
      }

      // Search filter
      if (gallerySearch.trim()) {
        const q = gallerySearch.toLowerCase();
        const nameMatch = (t.template_name || t.name || '').toLowerCase().includes(q);
        const subjMatch = (t.subject || '').toLowerCase().includes(q);
        const contentMatch = (t.content_html || '').toLowerCase().includes(q);
        if (!nameMatch && !subjMatch && !contentMatch) return false;
      }

      return true;
    });
  }, [templates, galleryCategory, gallerySearch]);

  // Strip html tags for snippet preview
  const getSnippet = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 140) + (text.length > 140 ? '...' : '');
  };

  return (
    <div className="flex flex-col bg-[#eef2f5] border border-slate-300 rounded-2xl shadow-lg overflow-hidden min-h-[850px] select-text">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: TEMPLATES MANAGER GALLERY                                         */}
      {/* ========================================================================= */}
      {viewMode === 'gallery' && (
        <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-5">
          {/* Guest Mode View-Only Banner */}
          {isGuest && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2 bg-amber-200 text-amber-900 rounded-md font-bold text-[11px] shrink-0">
                  👁️ View-Only
                </span>
                <span className="font-medium">
                  Guest Demo Mode: Template Studio is protected. Creating, duplicating, saving, or deleting templates is disabled.
                </span>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                Templates Locked
              </span>
            </div>
          )}

          {/* Top Banner: Title, Subtitle, Actions */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Template Studio (Letters & Notices)
                  </h1>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Design and manage official attendance warning letters, parent notices, and principal reports
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setIsCustomTableBuilderOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 text-xs font-bold border border-emerald-400/40 transition-colors shadow-2xs cursor-pointer"
                title="Create custom multi-student tables with merge tags and blank remarks columns"
              >
                <Table2 className="w-4 h-4 text-emerald-300" />
                <span>Custom Table Tags ({customTables.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsHeaderModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors shadow-2xs"
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>Letterhead Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isGuest) return;
                  setIsStartersModalOpen(true);
                }}
                disabled={isGuest}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md ${
                  isGuest
                    ? 'bg-slate-500 opacity-60 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer hover:shadow-lg'
                }`}
                title={isGuest ? 'Disabled in Demo Mode' : undefined}
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Template</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Category Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'All Templates', count: templates.length },
                {
                  id: 'warning',
                  label: 'Attendance Warnings',
                  count: templates.filter(
                    (t) =>
                      t.category === 'attendance_warning' ||
                      t.notice_type === '1st Warning' ||
                      t.notice_type === '2nd Warning' ||
                      t.notice_type === 'Final Notice'
                  ).length,
                },
                {
                  id: 'principal',
                  label: 'Principal Reports',
                  count: templates.filter(
                    (t) =>
                      t.category === 'principal_report' ||
                      t.notice_type === 'Report' ||
                      (t.template_name && t.template_name.includes('આચાર્ય'))
                  ).length,
                },
                {
                  id: 'general',
                  label: 'General & Parent Notices',
                  count: templates.filter(
                    (t) =>
                      t.category === 'general_notice' ||
                      t.notice_type === 'General Notice' ||
                      t.notice_type === 'Parent Notice'
                  ).length,
                },
                {
                  id: 'custom',
                  label: 'My Custom Templates',
                  count: templates.filter((t) => t.instructor_id !== 'global').length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGalleryCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    galleryCategory === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      galleryCategory === tab.id
                        ? 'bg-blue-800 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
              {gallerySearch && (
                <button
                  onClick={() => setGallerySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((tmpl) => {
              const isPrincipal =
                tmpl.category === 'principal_report' ||
                tmpl.notice_type === 'Report' ||
                (tmpl.template_name && tmpl.template_name.includes('આચાર્ય'));
              const isSystem = tmpl.instructor_id === 'global' || tmpl.id.startsWith('tpl-shankheshwar');

              return (
                <div
                  key={tmpl.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-4 pb-3 border-b border-slate-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isPrincipal
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : tmpl.notice_type === '1st Warning'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : tmpl.notice_type === '2nd Warning'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : tmpl.notice_type === 'Final Notice'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {tmpl.notice_type || 'General'}
                      </span>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        {tmpl.show_letterhead !== false ? (
                          <span className="flex items-center gap-1 text-blue-800 text-[10px] font-semibold bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200" title="Letterhead is active for this template">
                            <Building2 className="w-3 h-3 text-blue-600" />
                            <span>With Letterhead</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-600 text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title="Pre-printed paper mode (letterhead disabled)">
                            <span>📄 Pre-printed Paper</span>
                          </span>
                        )}
                        {isSystem ? (
                          <span className="flex items-center gap-1 text-slate-500 text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>Official Format</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-700 text-[10px] font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Custom Template</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {tmpl.template_name || tmpl.name || 'નોટિસ પત્ર'}
                    </h3>

                    {tmpl.subject && (
                      <p className="text-xs text-slate-500 line-clamp-1 italic">
                        Subject: {tmpl.subject}
                      </p>
                    )}
                  </div>

                  {/* Card Snippet / Preview Area */}
                  <div className="p-4 py-3 bg-slate-50/60 flex-1 text-xs text-slate-600 leading-relaxed font-sans line-clamp-3 select-none border-b border-slate-100">
                    {getSnippet(tmpl.content_html || '')}
                  </div>

                  {/* Card Actions */}
                  <div className="p-3 bg-white flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenInEditor(tmpl)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
                        title="Open in TinyMCE Editor"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit Template</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateFromGallery(tmpl)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="Duplicate template"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewModalTemplate(tmpl)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="Quick Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {!isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplatePrompt(tmpl)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onUseTemplateForReport(tmpl)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors shadow-2xs shrink-0 cursor-pointer"
                      title="Use this template in Report Generator"
                    >
                      <span>Generate</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-semibold text-slate-700 text-sm">
                No templates found matching your search
              </div>
              <button
                type="button"
                onClick={() => {
                  setGalleryCategory('all');
                  setGallerySearch('');
                }}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TINYMCE A4 STUDIO CANVAS                                          */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && (
        <div className="flex-1 flex flex-col">
          {/* Hidden file input for uploading images from device into template body */}
          <input
            ref={templateImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleInsertImageIntoTemplate(file);
              e.target.value = '';
            }}
          />

          {/* Top Bar: Back to gallery, Template Name, Category, Save, Duplicate */}
          <div className="bg-[#185abd] text-white px-3 sm:px-5 py-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shadow-md">
            {/* Left: Back button + Name & Type Input */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
              <button
                type="button"
                onClick={() => setViewMode('gallery')}
                className="flex items-center gap-1 bg-[#104899] hover:bg-blue-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-blue-400/30 transition-colors shrink-0 cursor-pointer"
                title="Back to Templates Gallery"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Templates</span>
              </button>

              <div className="flex items-center gap-1.5 grow sm:grow-0 min-w-0">
                <span className="text-xs font-bold text-blue-200 whitespace-nowrap">Name:</span>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                  className="bg-[#104899] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-blue-400/40 focus:outline-hidden focus:ring-2 focus:ring-white min-w-[160px] sm:min-w-[240px] truncate"
                />
              </div>

              <select
                value={noticeType}
                onChange={(e) => setNoticeType(e.target.value)}
                className="bg-[#104899] text-white text-xs font-semibold px-2 py-1.5 rounded-lg border border-blue-400/40 focus:outline-hidden shrink-0 cursor-pointer"
              >
                <option value="1st Warning" className="text-slate-900 bg-white">1st Warning</option>
                <option value="2nd Warning" className="text-slate-900 bg-white">2nd Warning</option>
                <option value="Final Notice" className="text-slate-900 bg-white">Final Notice</option>
                <option value="Parent Notice" className="text-slate-900 bg-white">Parent Notice</option>
                <option value="General Notice" className="text-slate-900 bg-white">General Notice</option>
                <option value="Report" className="text-slate-900 bg-white">Principal Report</option>
              </select>

              {/* Per-Template Letterhead Toggle Button */}
              <button
                type="button"
                onClick={() => setShowLetterhead(!showLetterhead)}
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  showLetterhead
                    ? 'bg-blue-950/70 border-blue-300 text-white shadow-2xs'
                    : 'bg-[#104899] border-blue-400/40 text-blue-200 hover:text-white'
                }`}
                title="Toggle Letterhead: show official header or hide for pre-printed stationery"
              >
                <Building2 className={`w-3.5 h-3.5 ${showLetterhead ? 'text-amber-300' : 'text-blue-300'}`} />
                <span>Letterhead: {showLetterhead ? 'On' : 'Off'}</span>
              </button>
            </div>

            {/* Right: Actions (Save, Save As, Generator, Print, PDF, Upload Image) */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleSaveCurrentTemplate}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
                title="Save changes to this template"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSaveAsName(`${templateName} (Copy)`);
                  setIsSaveAsModalOpen(true);
                }}
                className="flex items-center gap-1 bg-[#104899] hover:bg-blue-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-400/30 transition-colors shadow-xs shrink-0 cursor-pointer"
                title="Save as new template"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Copy</span>
              </button>

              {/* Upload Image from Device into Template */}
              <button
                type="button"
                onClick={() => templateImageInputRef.current?.click()}
                className="flex items-center gap-1 bg-[#104899] hover:bg-blue-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-400/30 transition-colors shadow-xs shrink-0 cursor-pointer"
                title="Upload image or stamp from your device into the template"
              >
                <Upload className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden sm:inline">Upload Image</span>
              </button>

              {/* Custom Table Tag Maker Button */}
              <button
                type="button"
                onClick={() => setIsCustomTableBuilderOpen(true)}
                className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-emerald-400/40 transition-colors shadow-xs shrink-0 cursor-pointer"
                title="Create & insert custom multi-student table merge tag (with student data & blank remarks columns)"
              >
                <Table2 className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">+ Custom Table Tag</span>
              </button>

              <button
                type="button"
                onClick={() => onUseTemplateForReport(currentTemplate)}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-2.5 py-1.5 rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
                title="Use in Report Generator"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Report Generator</span>
              </button>

              {/* Prominent Edit Letterhead Facility Button */}
              <button
                type="button"
                onClick={() => setIsHeaderModalOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 shrink-0 cursor-pointer border border-amber-300"
                title="Edit institute letterhead and logos"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Edit Letterhead</span>
              </button>

              <div className="flex items-center gap-0.5 bg-[#104899] p-1 rounded-lg border border-blue-400/40 shrink-0">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-1 rounded hover:bg-blue-700 text-white"
                  title="Print Clean A4"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="p-1 rounded hover:bg-blue-700 text-white disabled:opacity-50"
                  title="Export PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-bar: Subject Input & Live Trainee Preview Switcher */}
          <div className="bg-[#f3f6f9] border-b border-slate-300 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-grow min-w-0">
              <span className="font-bold text-slate-600 whitespace-nowrap shrink-0">Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter official notice subject..."
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600 min-w-0 flex-1"
              />
            </div>

            {/* Live Trainee Data Mode Switcher */}
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs shrink-0">
              <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={previewMerged}
                  onChange={(e) => setPreviewMerged(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="whitespace-nowrap">Live Trainee Preview</span>
              </label>

              {previewMerged && trainees.length > 0 && (
                <select
                  value={selectedTraineeId}
                  onChange={(e) => setSelectedTraineeId(e.target.value)}
                  className="bg-blue-50 text-blue-900 font-bold border border-blue-300 rounded px-2 py-0.5 text-xs max-w-[170px] sm:max-w-[220px] truncate"
                >
                  {trainees.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      Roll {tr.roll_no} - {tr.student_name_en || tr.student_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Main A4 Document Workspace */}
          <div className="flex-1 bg-[#d8dfe6] p-2 sm:p-6 pb-20 sm:pb-12 overflow-y-auto flex flex-col items-center justify-start min-h-[600px]">
            {/* The A4 Document Container */}
            <div
              id="notice-a4-sheet"
              className="bg-white text-slate-900 shadow-2xl border border-slate-300 relative flex flex-col justify-start a4-printable-document p-8 sm:p-12 transition-all"
              style={{
                width: '100%',
                maxWidth: '820px',
                minHeight: '1050px',
              }}
            >
              {/* Top Official Letterhead Workspace on A4 Canvas */}
              {showLetterhead ? (
                previewMerged ? (
                  /* Live Rendered Letterhead with Merged Outward No & Date */
                  <div
                    className="mb-6 iti-rendered-letterhead select-none"
                    dangerouslySetInnerHTML={{
                      __html: renderLetterheadHtml(letterheadHtml, {
                        refNumber: `${headerConfig.ref_prefix || 'ઔતાસં/૨૦૨૫-૨૬'}/${
                          selectedTraineeId
                            ? trainees.find((t) => t.id === selectedTraineeId)?.roll_no || '૧૦૧'
                            : '૧૦૧'
                        }`,
                        issueDate: new Date().toLocaleDateString('gu-IN'),
                      }),
                    }}
                  />
                ) : (
                  /* Dedicated Inline TinyMCE Letterhead Editor directly on the A4 Canvas */
                  <TinyMceLetterheadEditor
                    value={letterheadHtml}
                    onChange={(html) => setLetterheadHtml(html)}
                    instructor={instructor}
                    template={currentTemplate}
                    disabled={isGuest}
                    isTemplateSpecific={isTemplateSpecificHeader}
                    onToggleScope={(isSpecific) => setIsTemplateSpecificHeader(isSpecific)}
                    onSaveAsGlobalDefault={handleSaveAsGlobalDefault}
                    onResetToDefault={handleResetLetterhead}
                  />
                )
              ) : (
                /* Sleek prompter when letterhead is toggled off */
                <div
                  onClick={() => setShowLetterhead(true)}
                  className="border border-dashed border-slate-300 hover:border-amber-400 bg-slate-50/70 hover:bg-amber-50/50 text-slate-500 hover:text-amber-800 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all mb-4 select-none group"
                  title="Click to enable letterhead on canvas"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  <span>Letterhead disabled • Click here to enable letterhead on A4 canvas</span>
                </div>
              )}

              {/* Document Body Area */}
              <div className="flex-1 min-h-[500px]">
                {previewMerged ? (
                  // Live Rendered Merged HTML Preview
                  <div
                    className="prose max-w-none text-slate-900 leading-relaxed outline-hidden"
                    dangerouslySetInnerHTML={{ __html: mergedHtml }}
                  />
                ) : (
                  // TinyMCE Editor Canvas
                  <TinyMceEditor
                    value={contentHtml}
                    onChange={setContentHtml}
                    disabled={isGuest}
                    minHeight={560}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="bg-[#f0f4f8] border-t border-slate-300 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-medium text-slate-600 select-none">
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>TinyMCE Canvas Active</span>
              </span>
              <span>•</span>
              <span>Language: English & Gujarati</span>
              <span>•</span>
              <span>Characters: {contentHtml.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLetterhead(!showLetterhead)}
                className="hover:text-blue-700 underline cursor-pointer font-semibold"
              >
                {showLetterhead ? 'Hide Letterhead' : 'Show Letterhead'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: STARTER TEMPLATES PICKER                                         */}
      {/* ========================================================================= */}
      {isStartersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Choose Template Starter
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select an official format or open a template
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStartersModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2.5 flex-1 pr-1">
              {STARTER_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleLoadStarter(preset)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-800">
                        {preset.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-semibold">
                        {preset.notice_type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 italic line-clamp-1">
                      {preset.subject}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SAVE AS NEW TEMPLATE                                             */}
      {/* ========================================================================= */}
      {isSaveAsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Save Template Copy
              </h3>
              <button
                type="button"
                onClick={() => setIsSaveAsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Template Name:</label>
              <input
                type="text"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="e.g. 1st Warning Attendance Notice - Copy"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                autoFocus
              />
              <p className="text-[11px] text-slate-500">
                This template will be saved to your account and available for report dispatch.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSaveAsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAsNew}
                disabled={!saveAsName.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
              >
                Save Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LETTERHEAD BANNER SETUP                                          */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL 3: LETTERHEAD BANNER SETUP (ENHANCED FACILITY)                      */}
      {/* ========================================================================= */}
      {isHeaderModalOpen && (
        <LetterheadEditorModal
          isOpen={isHeaderModalOpen}
          onClose={() => setIsHeaderModalOpen(false)}
          instructor={{
            ...instructor,
            header_config: headerConfig,
          }}
          currentTemplate={currentTemplate}
          initialHtml={letterheadHtml}
          isTemplateSpecific={isTemplateSpecificHeader}
          onSaveLetterhead={(html, isSpecific) => {
            setLetterheadHtml(html);
            setIsTemplateSpecificHeader(isSpecific);
            if (isSpecific && currentTemplate) {
              const updatedTmpl: LetterTemplate = {
                ...currentTemplate,
                letterhead_html: html,
                use_custom_letterhead: true,
                header_config: {
                  ...(currentTemplate.header_config || headerConfig),
                  letterhead_mode: 'tinymce_canvas',
                  letterhead_html: html,
                },
              };
              onSaveTemplate(updatedTmpl);
            } else {
              handleSaveAsGlobalDefault(html);
            }
            setIsHeaderModalOpen(false);
            showToast('Letterhead saved successfully!');
          }}
          onSaveHeaderConfig={(newConfig) => {
            setHeaderConfig(newConfig);
            onUpdateInstructorHeader(newConfig);
            setIsHeaderModalOpen(false);
            showToast('Letterhead saved successfully!');
          }}
          onSaveAsGlobalDefault={handleSaveAsGlobalDefault}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FULL PREVIEW MODAL                                               */}
      {/* ========================================================================= */}
      {previewModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {previewModalTemplate.template_name || previewModalTemplate.name}
                </h3>
                <span className="text-[11px] text-slate-500">
                  {previewModalTemplate.notice_type} • વિષય: {previewModalTemplate.subject || '-'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalTemplate(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 flex-1 prose max-w-none text-xs border-b border-slate-100 px-2">
              <div
                dangerouslySetInnerHTML={{
                  __html: previewModalTemplate.content_html || '',
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setPreviewModalTemplate(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const t = previewModalTemplate;
                    setPreviewModalTemplate(null);
                    handleOpenInEditor(t);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Edit in TinyMCE
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const t = previewModalTemplate;
                    setPreviewModalTemplate(null);
                    onUseTemplateForReport(t);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black cursor-pointer"
                >
                  Use in Report Generator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CUSTOM TABLE MERGE TAG BUILDER                                   */}
      {/* ========================================================================= */}
      <CustomTableBuilderModal
        isOpen={isCustomTableBuilderOpen}
        onClose={() => setIsCustomTableBuilderOpen(false)}
        customTables={customTables}
        onSaveCustomTables={handleSaveCustomTables}
        onInsertTag={handleInsertCustomTableTag}
        sampleTrainees={trainees.slice(0, 4)}
        attendanceRecords={attendanceRecords}
        instructor={instructor}
      />
    </div>
  );
}
