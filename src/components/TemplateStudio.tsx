import React, { useState, useMemo, useRef } from 'react';
import {
  Instructor,
  LetterTemplate,
  HeaderConfig,
  Trainee,
  AttendanceRecord,
  DispatchLog,
} from '../types';
import TinyMceEditor, { MERGE_TAG_ITEMS } from './WordEditor/TinyMceEditor';
import { mergeTemplateTags, generateOutwardReference } from '../utils/mergeTags';
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
  const [showLetterhead, setShowLetterhead] = useState<boolean>(true);
  const [showSignature, setShowSignature] = useState<boolean>(true);

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

  // Header Config state
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(
    instructor.header_config || {
      show_logo: true,
      institute_name_gu: instructor.iti_name,
      institute_name_en: 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE',
      department_subtitle: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગુજરાત સરકાર',
      address: instructor.institution_address || 'ગુજરાત',
      ref_prefix: instructor.outward_code_prefix || 'ઔતાસં/તલમ/૨૦૨૫',
    }
  );

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
    if (tmpl.header_config) {
      setHeaderConfig(tmpl.header_config);
    }
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
    const monthYear = currentAttendance?.month_year || 'August 2025';
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
  ]);

  // Save current template to Cloud Firestore and local state
  const handleSaveCurrentTemplate = () => {
    const updated: LetterTemplate = {
      ...currentTemplate,
      id: currentTemplate.id,
      instructor_id: instructor.id,
      template_name: templateName.trim() || 'અનામી ટેમ્પલેટ',
      name: templateName.trim() || 'અનામી ટેમ્પલેટ',
      notice_type: noticeType as any,
      category: category as any,
      subject,
      content_html: contentHtml,
      header_config: headerConfig,
      language: 'Gujarati',
      updated_at: new Date().toISOString(),
    };

    onSaveTemplate(updated);
    onUpdateInstructorHeader(headerConfig);
    showToast(`'${updated.template_name}' ટેમ્પલેટ ક્લાઉડમાં સુરક્ષિત સેવ થયું!`);
  };

  // Save as new / Duplicate template
  const handleSaveAsNew = () => {
    if (!saveAsName.trim()) return;
    const newId = `tmpl-custom-${Date.now()}`;
    const newTemplate: LetterTemplate = {
      id: newId,
      instructor_id: instructor.id,
      template_name: saveAsName.trim(),
      name: saveAsName.trim(),
      notice_type: noticeType as any,
      category: category as any,
      subject,
      content_html: contentHtml,
      header_config: headerConfig,
      language: 'Gujarati',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveTemplate(newTemplate);
    setActiveTemplateId(newId);
    setTemplateName(saveAsName.trim());
    setIsSaveAsModalOpen(false);
    setSaveAsName('');
    showToast(`નવું ટેમ્પલેટ '${newTemplate.template_name}' તૈયાર થયું!`);
  };

  // Duplicate a template directly from gallery card
  const handleDuplicateFromGallery = (tmpl: LetterTemplate) => {
    const cloneName = `${tmpl.template_name || tmpl.name} (નકલ)`;
    const newId = `tmpl-custom-${Date.now()}`;
    const duplicated: LetterTemplate = {
      ...tmpl,
      id: newId,
      instructor_id: instructor.id,
      template_name: cloneName,
      name: cloneName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onSaveTemplate(duplicated);
    showToast(`'${cloneName}' સફળતાપૂર્વક તૈયાર થયું!`);
  };

  // Create new template from starter preset
  const handleLoadStarter = (preset: typeof STARTER_PRESETS[0]) => {
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onSaveTemplate(newTmpl);
    handleOpenInEditor(newTmpl);
    setIsStartersModalOpen(false);
    showToast(`'${preset.name}' નવું ટેમ્પલેટ શરૂ થયું!`);
  };

  // Delete template
  const handleDeleteTemplatePrompt = (tmpl: LetterTemplate) => {
    if (templates.length <= 1) {
      alert('ઓછામાં ઓછું એક ટેમ્પ્લેટ રહેવું જરૂરી છે.');
      return;
    }
    const name = tmpl.template_name || tmpl.name || 'આ ટેમ્પલેટ';
    if (confirm(`શું આપ ખરેખર '${name}' ટેમ્પ્લેટ ડિલીટ કરવા માંગો છો?`)) {
      onDeleteTemplate(tmpl.id);
      if (activeTemplateId === tmpl.id) {
        const remaining = templates.filter((t) => t.id !== tmpl.id);
        if (remaining.length > 0) {
          handleOpenInEditor(remaining[0]);
        }
      }
      showToast('ટેમ્પલેટ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું.');
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
      showToast('PDF સફળતાપૂર્વક ડાઉનલોડ થયું!');
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
          {/* Top Banner: Title, Subtitle, Actions */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    ટેમ્પલેટ્સ મેનેજર (Letter & Report Templates)
                  </h1>
                  <p className="text-xs text-blue-200 mt-0.5">
                    સત્તાવાર અનિયમિતતા ચેતવણી પત્રો, વાલી નોટિસ અને આચાર્યશ્રી અહેવાલ ફોર્મેટ્સ
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setIsHeaderModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors shadow-2xs"
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>લેટરહેડ હેડર સેટિંગ્સ</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStartersModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ નવો ટેમ્પલેટ બનાવો</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Category Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'બધા ટેમ્પલેટ્સ', count: templates.length },
                {
                  id: 'warning',
                  label: 'નોટિસ પત્રો (Warnings)',
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
                  label: 'આચાર્યશ્રી અહેવાલ (Principal Reports)',
                  count: templates.filter(
                    (t) =>
                      t.category === 'principal_report' ||
                      t.notice_type === 'Report' ||
                      (t.template_name && t.template_name.includes('આચાર્ય'))
                  ).length,
                },
                {
                  id: 'general',
                  label: 'સામાન્ય / વાલી પત્રો',
                  count: templates.filter(
                    (t) =>
                      t.category === 'general_notice' ||
                      t.notice_type === 'General Notice' ||
                      t.notice_type === 'Parent Notice'
                  ).length,
                },
                {
                  id: 'custom',
                  label: 'મારા કસ્ટમ પત્રો',
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
                placeholder="ટેમ્પલેટ શોધો (Search)..."
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
                        {isSystem ? (
                          <span className="flex items-center gap-1 text-slate-500 text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>સિસ્ટમ ફોર્મેટ</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-700 text-[10px] font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>કસ્ટમ પત્ર</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {tmpl.template_name || tmpl.name || 'નોટિસ પત્ર'}
                    </h3>

                    {tmpl.subject && (
                      <p className="text-xs text-slate-500 line-clamp-1 italic">
                        વિષય: {tmpl.subject}
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
                        title="TinyMCE એડિટરમાં ખોલો"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>TinyMCE એડિટ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateFromGallery(tmpl)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="આ ફોર્મેટની નકલ બનાવો (Duplicate)"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewModalTemplate(tmpl)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="ઝડપી પૂર્વાવલોકન (Preview)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {!isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplatePrompt(tmpl)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="ટેમ્પલેટ કાઢી નાખો (Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onUseTemplateForReport(tmpl)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors shadow-2xs shrink-0 cursor-pointer"
                      title="આ ટેમ્પલેટ પસંદ કરીને રિપોર્ટ જનરેટરમાં જાવ"
                    >
                      <span>વાપરો</span>
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
                કોઈ ટેમ્પલેટ મળ્યો નથી (No templates matched your query)
              </div>
              <button
                type="button"
                onClick={() => {
                  setGalleryCategory('all');
                  setGallerySearch('');
                }}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                બધા ફિલ્ટર રીસેટ કરો
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
          {/* Top Bar: Back to gallery, Template Name, Category, Save, Duplicate */}
          <div className="bg-[#185abd] text-white px-3 sm:px-5 py-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shadow-md">
            {/* Left: Back button + Name & Type Input */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
              <button
                type="button"
                onClick={() => setViewMode('gallery')}
                className="flex items-center gap-1 bg-[#104899] hover:bg-blue-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-blue-400/30 transition-colors shrink-0 cursor-pointer"
                title="પાછા ટેમ્પલેટ્સ લિસ્ટ પર જાવ"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ટેમ્પલેટ્સ</span>
              </button>

              <div className="flex items-center gap-1.5 grow sm:grow-0 min-w-0">
                <span className="text-xs font-bold text-blue-200 whitespace-nowrap">નામ:</span>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="ટેમ્પલેટનું નામ લખો..."
                  className="bg-[#104899] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-blue-400/40 focus:outline-hidden focus:ring-2 focus:ring-white min-w-[160px] sm:min-w-[240px] truncate"
                />
              </div>

              <select
                value={noticeType}
                onChange={(e) => setNoticeType(e.target.value)}
                className="bg-[#104899] text-white text-xs font-semibold px-2 py-1.5 rounded-lg border border-blue-400/40 focus:outline-hidden shrink-0 cursor-pointer"
              >
                <option value="1st Warning" className="text-slate-900 bg-white">૧લી નોટિસ (1st Warning)</option>
                <option value="2nd Warning" className="text-slate-900 bg-white">૨જી નોટિસ (2nd Warning)</option>
                <option value="Final Notice" className="text-slate-900 bg-white">આખરી નોટિસ (Final Notice)</option>
                <option value="Parent Notice" className="text-slate-900 bg-white">વાલી પત્ર (Parent Notice)</option>
                <option value="General Notice" className="text-slate-900 bg-white">સામાન્ય નોટિસ (General)</option>
                <option value="Report" className="text-slate-900 bg-white">આચાર્યશ્રી અહેવાલ (Report)</option>
              </select>
            </div>

            {/* Right: Actions (Save, Save As, Generator, Print, PDF) */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleSaveCurrentTemplate}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
                title="Save changes to this template"
              >
                <Save className="w-3.5 h-3.5" />
                <span>સાચવો (Save)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSaveAsName(`${templateName} (નવી નકલ)`);
                  setIsSaveAsModalOpen(true);
                }}
                className="flex items-center gap-1 bg-[#104899] hover:bg-blue-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-400/30 transition-colors shadow-xs shrink-0 cursor-pointer"
                title="નવા નામે સેવ કરો"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">નવા નામે</span>
              </button>

              <button
                type="button"
                onClick={() => onUseTemplateForReport(currentTemplate)}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-2.5 py-1.5 rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
                title="રિપોર્ટ જનરેટરમાં ઉપયોગ કરો"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">રિપોર્ટ જનરેટર</span>
              </button>

              <div className="flex items-center gap-0.5 bg-[#104899] p-1 rounded-lg border border-blue-400/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsHeaderModalOpen(true)}
                  className="p-1 rounded hover:bg-blue-700 text-white"
                  title="સંસ્થા લેટરહેડ સેટિંગ્સ"
                >
                  <Building2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-1 rounded hover:bg-blue-700 text-white"
                  title="A4 પ્રિન્ટ કરો"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="p-1 rounded hover:bg-blue-700 text-white disabled:opacity-50"
                  title="PDF ડાઉનલોડ કરો"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-bar: Subject Input & Live Trainee Preview Switcher */}
          <div className="bg-[#f3f6f9] border-b border-slate-300 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-grow min-w-0">
              <span className="font-bold text-slate-600 whitespace-nowrap shrink-0">વિષય:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="પત્રનો સત્તાવાર વિષય દાખલ કરો..."
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
                <span className="whitespace-nowrap">લાઈવ ડેટા પ્રિવ્યુ (Live Trainee Data)</span>
              </label>

              {previewMerged && trainees.length > 0 && (
                <select
                  value={selectedTraineeId}
                  onChange={(e) => setSelectedTraineeId(e.target.value)}
                  className="bg-blue-50 text-blue-900 font-bold border border-blue-300 rounded px-2 py-0.5 text-xs max-w-[170px] sm:max-w-[220px] truncate"
                >
                  {trainees.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      રોલ {tr.roll_no} - {tr.student_name}
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
              className="bg-white text-slate-900 shadow-2xl border border-slate-300 relative flex flex-col justify-between a4-printable-document p-8 sm:p-12 transition-all"
              style={{
                width: '100%',
                maxWidth: '820px',
                minHeight: '1050px',
              }}
            >
              {/* Top Official Letterhead Banner */}
              {showLetterhead && (
                <div className="mb-6 border-b-4 border-double border-slate-900 pb-3">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left Institute Emblem */}
                    {headerConfig.show_logo && (
                      <div className="shrink-0">
                        {headerConfig.logo_url ? (
                          <img
                            src={headerConfig.logo_url}
                            alt="Logo"
                            className="h-16 w-auto object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-blue-900 text-white flex flex-col items-center justify-center font-bold text-xs shadow-xs text-center p-1">
                            <span>ITI</span>
                            <span className="text-[9px] text-blue-200">શંખેશ્વર</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Middle Title Details */}
                    <div className="text-center flex-1">
                      <div className="text-sm font-semibold text-slate-700">
                        {headerConfig.department_subtitle || 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગુજરાત સરકાર'}
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-950 mt-0.5 tracking-tight font-sans">
                        {headerConfig.institute_name_gu || instructor.iti_name || 'ઔદ્યોગિક તાલીમ સંસ્થા'}
                      </h2>
                      <div className="text-[11px] font-bold text-slate-800 tracking-wider">
                        {headerConfig.institute_name_en || 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE'}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {headerConfig.address || instructor.institution_address || 'ગુજરાત રાજ્ય'}
                      </div>
                    </div>

                    {/* Right Emblem or Spacer */}
                    <div className="shrink-0 w-16 flex justify-end">
                      {headerConfig.show_right_logo && headerConfig.right_logo_url ? (
                        <img
                          src={headerConfig.right_logo_url}
                          alt="Right Logo"
                          className="h-16 w-auto object-contain"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-emerald-900 text-white flex flex-col items-center justify-center font-bold text-xs shadow-xs text-center p-1">
                          <span>GOG</span>
                          <span className="text-[9px] text-emerald-200">ગુજરાત</span>
                        </div>
                      )}
                    </div>
                  </div>
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
                    minHeight={560}
                  />
                )}
              </div>

              {/* Bottom Official Signature Block */}
              {showSignature && (
                <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between text-xs text-slate-700">
                  <div>
                    <div><strong>સંદર્ભ ક્રમાંક:</strong> {headerConfig.ref_prefix || 'ઔતાસં/૨૦૨૫'}</div>
                    <div><strong>તારીખ:</strong> {new Date().toLocaleDateString('en-GB')}</div>
                  </div>

                  <div className="text-center min-w-[180px]">
                    <div className="h-10"></div>
                    <div className="font-bold text-sm text-slate-900">{instructor.name}</div>
                    <div className="text-slate-600">
                      {instructor.designation}, {instructor.trade}
                    </div>
                    <div className="text-slate-500 text-[11px]">{instructor.iti_name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="bg-[#f0f4f8] border-t border-slate-300 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-medium text-slate-600 select-none">
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>TinyMCE એડિટર સક્રિય</span>
              </span>
              <span>•</span>
              <span>ભાષા: ગુજરાતી / English</span>
              <span>•</span>
              <span>કુલ અક્ષરો: {contentHtml.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLetterhead(!showLetterhead)}
                className="hover:text-blue-700 underline cursor-pointer"
              >
                {showLetterhead ? 'લેટરહેડ છુપાવો' : 'લેટરહેડ બતાવો'}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setShowSignature(!showSignature)}
                className="hover:text-blue-700 underline cursor-pointer"
              >
                {showSignature ? 'સહી છુપાવો' : 'સહી બતાવો'}
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
                    નવું ટેમ્પલેટ શરૂ કરો (Choose Template Starter)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ગુજરાત ITI માટે પ્રમાણિત ફોર્મેટ પસંદ કરો અથવા કોરો દસ્તાવેજ ખોલો
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
                    પસંદ કરો
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
                નવા નામે સેવ કરો (Save Template As)
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
              <label className="text-xs font-bold text-slate-700">ટેમ્પલેટનું નામ:</label>
              <input
                type="text"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="દા.ત. આચાર્યશ્રી અહેવાલ - ફેબ્રુઆરી ૨૦૨૬"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                autoFocus
              />
              <p className="text-[11px] text-slate-500">
                આ ટેમ્પલેટ આપના એકાઉન્ટમાં સેવ થશે અને રિપોર્ટ જનરેટરમાં ઉપયોગ માટે ઉપલબ્ધ રહેશે.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSaveAsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                રદ કરો
              </button>
              <button
                type="button"
                onClick={handleSaveAsNew}
                disabled={!saveAsName.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
              >
                સેવ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LETTERHEAD BANNER SETUP                                          */}
      {/* ========================================================================= */}
      {isHeaderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  સંસ્થા લેટરહેડ હેડર સેટિંગ્સ (Institute Header)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHeaderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  વિભાગીય પેટા શીર્ષક (Department Title):
                </label>
                <input
                  type="text"
                  value={headerConfig.department_subtitle}
                  onChange={(e) =>
                    setHeaderConfig({ ...headerConfig, department_subtitle: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  સંસ્થાનું નામ ગુજરાતીમાં (ITI Name Gujarati):
                </label>
                <input
                  type="text"
                  value={headerConfig.institute_name_gu}
                  onChange={(e) =>
                    setHeaderConfig({ ...headerConfig, institute_name_gu: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  સંસ્થાનું નામ અંગ્રેજીમાં (ITI Name English):
                </label>
                <input
                  type="text"
                  value={headerConfig.institute_name_en}
                  onChange={(e) =>
                    setHeaderConfig({ ...headerConfig, institute_name_en: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">સરનામું (Address):</label>
                <input
                  type="text"
                  value={headerConfig.address}
                  onChange={(e) =>
                    setHeaderConfig({ ...headerConfig, address: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  જાવક કોડ પ્રીફિક્સ (Outward Reference Prefix):
                </label>
                <input
                  type="text"
                  value={headerConfig.ref_prefix}
                  onChange={(e) =>
                    setHeaderConfig({ ...headerConfig, ref_prefix: e.target.value })
                  }
                  placeholder="દા.ત. ઔતાસં/શંખેશ્વર/૨૦૨૫-૨૬"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHeaderModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                બંધ કરો
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateInstructorHeader(headerConfig);
                  setIsHeaderModalOpen(false);
                  showToast('સંસ્થા હેડર સફળતાપૂર્વક અપડેટ થયું!');
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                સાચવો
              </button>
            </div>
          </div>
        </div>
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
                બંધ કરો
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
                  TinyMCE માં એડિટ કરો
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
                  રિપોર્ટ જનરેટરમાં વાપરો
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
