import React, { useState, useMemo, useRef } from 'react';
import {
  Instructor,
  LetterTemplate,
  HeaderConfig,
  Trainee,
  AttendanceRecord,
  DispatchLog,
} from '../types';
import WordRibbon from './WordEditor/WordRibbon';
import A4Canvas from './WordEditor/A4Canvas';
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
  Sparkles,
  Layers,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  User,
  ArrowRight,
  Upload,
  X,
  FileCheck,
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
const STARTER_PRESETS = [
  {
    id: 'preset-1st-warning',
    name: 'પ્રથમ ગેરહાજરી ચેતવણી નોટિસ (1st Attendance Warning Notice)',
    category: 'attendance_warning',
    notice_type: '1st Warning',
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
    જેથી તાલીમાર્થીની માસિક હાજરી માત્ર <strong>{{Attendance_Percentage}}%</strong> થાય છે. ડી.જી.ટી. (DGT) અને ખાતાના નિયમાનુસાર વાર્ષિક પરીક્ષામાં બેસવા માટે ઓછામાં ઓછી <strong>૮૦%</strong> હાજરી અનિવાર્ય છે. આથી આપને જાણ કરવામાં આવે છે કે તાલીમાર્થી નિયમિત હાજર રહે તે સુનિશ્ચિત કરશો.
  </p>

  <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; margin: 18px 0;">
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
    notice_type: '2nd Warning',
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
    ઉપરોક્ત વિષય સંદર્ભે જણાવવાનું કે આપના પાલ્ય <strong>{{Trainee_Name}}</strong> (રોલ નં. <strong>{{Roll_No}}</strong>, ટ્રેડ: <strong>{{Trade}}</strong>) ને અગાઉ પત્ર દ્વારા અનિયમિતતા અંગે જાણ કરવામાં આવી હતી. તેમ છતાં તેઓ તારીખ <strong>{{Absent_From_Date}}</strong> થી કોઈપણ સત્તાવાર રજા મંજૂર કરાવ્યા વગર સતત ગેરહાજર રહેલ છે.
  </p>

  <p style="text-indent: 32px; margin-bottom: 14px; text-align: justify;">
    હાલમાં તાલીમાર્થીની હાજરી માત્ર <strong>{{Attendance_Percentage}}%</strong> છે. આથી આપને આ નોટિસ મળ્યેથી <strong>દિન-૩</strong> માં આ કચેરી ખાતે રૂબરૂ ઉપસ્થિત રહી લેખિત ખુલાસો આપવા તાકીદ કરવામાં આવે છે.
  </p>

  <p style="margin-bottom: 24px; text-align: justify; font-weight: bold; color: #991b1b;">
    જો નિર્ધારિત સમયમર્યાદામાં વાલીશ્રી રૂબરૂ હાજર નહીં રહે તો તાલીમાર્થીનું નામ સંસ્થાના હાજરી પત્રકમાંથી આપોઆપ કમી (Struck-off) કરવામાં આવશે અને તેનું સ્ટાઈપેન્ડ રોકી દેવામાં આવશે.
  </p>
</div>`,
  },
  {
    id: 'preset-parent-meeting',
    name: 'વાલી મિટિંગ આમંત્રણ પત્ર (Parent-Teacher Meeting Notice)',
    category: 'general_notice',
    notice_type: 'Parent Notice',
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

  <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; margin: 18px 0; font-size: 13px;">
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
    id: 'preset-principal-report',
    name: 'આચાર્યશ્રી અહેવાલ રિપોર્ટ ટેબલ (Principal Forwarding Report Table)',
    category: 'custom',
    notice_type: 'Report',
    subject: 'અનિયમિત તાલીમાર્થીઓની યાદી અને શિક્ષાત્મક કાર્યવાહી દરખાસ્ત.',
    content: `<div style="line-height: 1.7; font-family: 'Noto Sans Gujarati', sans-serif; font-size: 14px; color: #111;">
  <div style="margin-bottom: 16px;">
    <div><strong>પ્રતિ,</strong></div>
    <div><strong>આચાર્યશ્રી,</strong></div>
    <div>{{ITI_Name}}</div>
  </div>

  <div style="text-align: center; margin: 16px 0; font-weight: bold; font-size: 15px; text-decoration: underline;">
    વિષય :- ટ્રેડ {{Trade}} (બેચ: {{Batch}}) ના ૮૦% થી ઓછી હાજરી ધરાવતા તાલીમાર્થીઓ અંગેનો અહેવાલ.
  </div>

  <p style="margin-bottom: 14px; text-align: justify;">
    માનનીય સાહેબશ્રી, ઉપરોક્ત વિષય અન્વયે સવિનય જણાવવાનું કે માહે <strong>{{Month_Year}}</strong> દરમિયાન નીચે દર્શાવેલ તાલીમાર્થીઓ નિયમિત હાજરી આપવામાં નિષ્ફળ રહેલ છે અને વારંવાર સૂચના આપવા છતાં હાજરીમાં સુધારો થયેલ નથી:
  </p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; text-align: center;">
    <thead>
      <tr style="background-color: #f1f5f9; font-weight: bold;">
        <th style="border: 1px solid #475569; padding: 8px;">ક્રમ</th>
        <th style="border: 1px solid #475569; padding: 8px;">રોલ નં</th>
        <th style="border: 1px solid #475569; padding: 8px; text-align: left;">તાલીમાર્થીનું નામ</th>
        <th style="border: 1px solid #475569; padding: 8px;">કુલ દિવસ</th>
        <th style="border: 1px solid #475569; padding: 8px;">હાજર</th>
        <th style="border: 1px solid #475569; padding: 8px;">ગેરહાજર</th>
        <th style="border: 1px solid #475569; padding: 8px;">હાજરી %</th>
        <th style="border: 1px solid #475569; padding: 8px;">સૂચિત કાર્યવાહી</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #94a3b8; padding: 6px;">૧</td>
        <td style="border: 1px solid #94a3b8; padding: 6px;">{{Roll_No}}</td>
        <td style="border: 1px solid #94a3b8; padding: 6px; text-align: left; font-weight: bold;">{{Trainee_Name}}</td>
        <td style="border: 1px solid #94a3b8; padding: 6px;">{{Total_Working_Days}}</td>
        <td style="border: 1px solid #94a3b8; padding: 6px;">{{Present_Days}}</td>
        <td style="border: 1px solid #94a3b8; padding: 6px; color: #b91c1c;">{{Absent_Days}}</td>
        <td style="border: 1px solid #94a3b8; padding: 6px; font-weight: bold; color: #b91c1c;">{{Attendance_Percentage}}%</td>
        <td style="border: 1px solid #94a3b8; padding: 6px;">વાલી નોટિસ રવાના</td>
      </tr>
    </tbody>
  </table>

  <p style="margin-top: 16px; margin-bottom: 24px;">
    ઉપરોક્ત તાલીમાર્થીઓ સામે ખાતાકીય નિયમાનુસાર આગળની જરૂરી કાર્યવાહી કરવા ભલામણ સહિત સવિનય રવાના.
  </p>
</div>`,
  },
  {
    id: 'preset-certificate',
    name: 'તાલીમાર્થી હાજરી પ્રમાણપત્ર (Trainee Attendance Certificate)',
    category: 'general_notice',
    notice_type: 'General Notice',
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
    name: 'કોરો દસ્તાવેજ (Blank A4 Word Document)',
    category: 'custom',
    notice_type: 'General Notice',
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
    અહીં આપની વિગતવાર વિગતો ગુજરાતી અથવા અંગ્રેજી ભાષામાં લખો. આપ ઉપરના 'Insert Merge Field' મેનુમાંથી વિદ્યાર્થીના નામ, રોલ નં, સરનામું, હાજરી ટકાવારી જેવા ડાયનામિક ફીલ્ડ્સ ઉમેરી શકો છો.
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
  // Current active template ID
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    templates[0]?.id || 'tpl-shankheshwar-parent'
  );

  // Active template lookup
  const currentTemplate = useMemo(() => {
    return templates.find((t) => t.id === activeTemplateId) || templates[0] || {
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
    };
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

  // Word Ribbon formatting state
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'layout' | 'review' | 'view'>('home');
  const [fontFamily, setFontFamily] = useState<string>("'Noto Sans Gujarati', sans-serif");
  const [fontSize, setFontSize] = useState<string>('12');
  const [showLetterhead, setShowLetterhead] = useState<boolean>(true);
  const [showSignature, setShowSignature] = useState<boolean>(true);
  const [pageMargin, setPageMargin] = useState<'normal' | 'narrow' | 'wide'>('normal');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState<boolean>(false);

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
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

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

  // Update editor whenever user switches templates
  const handleSelectTemplate = (id: string) => {
    setActiveTemplateId(id);
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) {
      setContentHtml(tmpl.content_html || '');
      setTemplateName(tmpl.template_name || tmpl.name || 'નોટિસ પત્ર');
      setNoticeType(tmpl.notice_type || '1st Warning');
      setCategory(tmpl.category || 'attendance_warning');
      setSubject(tmpl.subject || '');
      if (tmpl.header_config) {
        setHeaderConfig(tmpl.header_config);
      }
    }
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
    const absentDays = currentAttendance?.absent_days || (workingDays - presentDays);
    const percentage = currentAttendance?.attendance_percentage || Number(((presentDays / workingDays) * 100).toFixed(2));
    const monthYear = currentAttendance?.month_year || 'August 2025';
    const refNumber = generateOutwardReference(instructor.trade, currentTrainee.roll_no, monthYear);

    return mergeTemplateTags(contentHtml, {
      trainee: currentTrainee,
      instructor,
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
  }, [contentHtml, currentTrainee, currentAttendance, instructor, lastNoticeDate]);

  // Word formatting command handler
  const handleExecuteCommand = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
  };

  // Insert Dynamic Variable Tag at cursor
  const handleInsertTag = (tag: string) => {
    document.execCommand('insertHTML', false, `<strong>${tag}</strong> `);
    showToast(`Inserted field: ${tag}`);
  };

  // Insert Table at cursor
  const handleInsertTable = (rows: number, cols: number) => {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 14px 0; border: 1px solid #475569;"><thead><tr style="background-color: #f1f5f9;">';
    for (let c = 0; c < cols; c++) {
      tableHtml += `<th style="border: 1px solid #94a3b8; padding: 6px 10px; font-weight: bold;">શીર્ષક ${c + 1}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 13px;">વિગત ${r + 1},${c + 1}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p></p>';
    document.execCommand('insertHTML', false, tableHtml);
    showToast(`Inserted ${rows}×${cols} Table`);
  };

  // Save current template
  const handleSaveCurrentTemplate = () => {
    const updated: LetterTemplate = {
      ...currentTemplate,
      id: currentTemplate.id,
      instructor_id: instructor.id,
      template_name: templateName,
      name: templateName,
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
    showToast('ફોર્મેટ અને હેડર સફળતાપૂર્વક સેવ થયા! (Template & Header Saved)');
  };

  // Save as new template
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
    showToast('નવું ફોર્મેટ સફળતાપૂર્વક તૈયાર થયું! (New Format Created)');
  };

  // Load starter preset
  const handleLoadStarter = (preset: typeof STARTER_PRESETS[0]) => {
    setContentHtml(preset.content);
    setTemplateName(preset.name);
    setNoticeType(preset.notice_type);
    setCategory(preset.category);
    setSubject(preset.subject);
    setIsStartersModalOpen(false);
    showToast(`Loaded starter: ${preset.name}`);
  };

  // Delete current template
  const handleDeleteCurrent = () => {
    if (templates.length <= 1) {
      alert('ઓછામાં ઓછું એક ટેમ્પ્લેટ રહેવું જરૂરી છે.');
      return;
    }
    if (confirm(`શું આપ ખરેખર '${templateName}' ટેમ્પ્લેટ ડિલીટ કરવા માંગો છો?`)) {
      onDeleteTemplate(currentTemplate.id);
      const remaining = templates.filter((t) => t.id !== currentTemplate.id);
      if (remaining.length > 0) {
        handleSelectTemplate(remaining[0].id);
      }
      showToast('ટેમ્પ્લેટ ડિલીટ કરવામાં આવ્યું.');
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
        orientation,
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

  // Gemini AI Vernacular Polish
  const handleAiPolish = async () => {
    setIsAiLoading(true);
    try {
      const resp = await fetch('/api/gemini/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: contentHtml,
          language: 'Gujarati',
          context: 'Government ITI Official Attendance Notice Format',
        }),
      });
      const data = await resp.json();
      if (data.polishedText) {
        setContentHtml(data.polishedText);
        showToast('✨ ગુજરાતી વહીવટી ભાષા શુદ્ધિકરણ પૂર્ણ થયું!');
      } else {
        showToast('AI સેવા ઉપલબ્ધ નથી.');
      }
    } catch (e) {
      console.error(e);
      showToast('AI કનેક્શન ક્ષતિ.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Gemini AI Smart Parent Advisory
  const handleAiCommentary = async () => {
    setIsAiLoading(true);
    try {
      const resp = await fetch('/api/gemini/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeName: currentTrainee?.student_name || 'તાલીમાર્થી',
          presentDays: currentAttendance?.present_days || 13,
          absentDays: currentAttendance?.absent_days || 11,
          totalWorkingDays: currentAttendance?.total_working_days || 24,
          attendancePercentage: currentAttendance?.attendance_percentage || 54.17,
          language: 'Gujarati',
          tone: 'Firm & Administrative',
        }),
      });
      const data = await resp.json();
      if (data.commentary) {
        const note = `<div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 10px 14px; margin: 14px 0; font-size: 13px; color: #991b1b; border-radius: 0 6px 6px 0;"><strong>વાલીશ્રી માટે વિશેષ સલાહ:</strong> ${data.commentary}</div><p></p>`;
        document.execCommand('insertHTML', false, note);
        showToast('✨ AI વાલી સલાહ બ્લોક ઉમેરાયો!');
      }
    } catch (e) {
      console.error(e);
      showToast('AI સલાહ ઉપલબ્ધ થઈ શકી નહીં.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Word count & Char count calculation
  const wordMetrics = useMemo(() => {
    const text = contentHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text.length > 0 ? text.split(' ').length : 0;
    const chars = text.length;
    return { words, chars };
  }, [contentHtml]);

  return (
    <div className="flex flex-col bg-[#eef2f5] border border-slate-300 rounded-2xl shadow-lg overflow-hidden min-h-[850px] select-text">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP MS WORD APP TITLE BAR */}
      <div className="bg-[#185abd] text-white px-3 sm:px-5 py-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shadow-md">
        {/* Left: Brand + Template Selector */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="bg-white text-[#185abd] p-1 rounded font-black text-sm tracking-tighter">
              W
            </div>
            <div className="font-bold text-sm hidden lg:inline">
              વર્ડ રિપોર્ટ ડિઝાઇનર
            </div>
          </div>

          {/* Template Dropdown */}
          <div className="relative grow sm:grow-0 min-w-0">
            <select
              value={activeTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="w-full sm:w-auto bg-[#104899] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-white max-w-[210px] sm:max-w-[270px] truncate"
            >
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id} className="text-slate-900 bg-white">
                  {tmpl.template_name || tmpl.name || 'પત્ર ફોર્મેટ'} ({tmpl.notice_type || 'General'})
                </option>
              ))}
            </select>
          </div>

          {/* New Format Button */}
          <button
            onClick={() => setIsStartersModalOpen(true)}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors shadow-xs shrink-0"
            title="Choose from official ITI presets or blank document"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">નવું ફોર્મેટ</span>
            <span className="xs:hidden">નવું</span>
          </button>
        </div>

        {/* Right: Actions (Save, Report Generator, Secondary Action Capsule) */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
          <button
            onClick={handleSaveCurrentTemplate}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs shrink-0"
            title="Save changes to this template"
          >
            <Save className="w-3.5 h-3.5" />
            <span>સેવ કરો</span>
          </button>

          <button
            onClick={() => onUseTemplateForReport(currentTemplate)}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-2.5 py-1.5 rounded-lg transition-colors shadow-xs shrink-0"
            title="Open batch report generator with this format"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">રિપોર્ટ જનરેટર</span>
            <span className="sm:hidden">જનરેટ</span>
          </button>

          {/* Secondary Actions Group Capsule: Bound together so Trash2 NEVER wraps alone */}
          <div className="flex items-center gap-0.5 bg-[#104899] p-1 rounded-lg border border-blue-400/40 shrink-0">
            <button
              onClick={() => setIsHeaderModalOpen(true)}
              className="p-1 rounded hover:bg-blue-700 text-white"
              title="Customize Institute Letterhead (સંસ્થા હેડર)"
            >
              <Building2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setSaveAsName(`${templateName} (નવી નકલ)`);
                setIsSaveAsModalOpen(true);
              }}
              className="p-1 rounded hover:bg-blue-700 text-white"
              title="Duplicate template (નવા નામે સેવ)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handlePrint}
              className="p-1 rounded hover:bg-blue-700 text-white"
              title="Print A4 document"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="p-1 rounded hover:bg-blue-700 text-white disabled:opacity-50"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <div className="h-3.5 w-px bg-blue-400/40 mx-0.5" />

            <button
              onClick={handleDeleteCurrent}
              className="p-1 rounded hover:bg-red-600 text-red-200 hover:text-white transition-colors"
              title="Delete this template"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Ribbon Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsRibbonCollapsed((prev) => !prev)}
            className="sm:hidden p-1.5 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-white border border-blue-400/30"
            title={isRibbonCollapsed ? "રિબન બતાવો (Show Ribbon)" : "રિબન છુપાવો (Hide Ribbon for Full Screen)"}
          >
            {isRibbonCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. SUB-BAR: TEMPLATE DETAILS & LIVE TRAINEE PREVIEW SELECTOR */}
      <div className="bg-[#f3f6f9] border-b border-slate-300 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        {/* Template Title & Notice Type */}
        <div className="flex items-center gap-1.5 flex-grow min-w-0">
          <span className="font-bold text-slate-600 whitespace-nowrap shrink-0">ફોર્મેટ:</span>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 min-w-0 flex-1"
            placeholder="દા.ત. ૧લી અનિયમિતતા નોટિસ"
          />

          <select
            value={noticeType}
            onChange={(e) => setNoticeType(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none shrink-0"
          >
            <option value="1st Warning">૧લી નોટિસ</option>
            <option value="2nd Warning">૨જી નોટિસ</option>
            <option value="Final Notice">આખરી નોટિસ</option>
            <option value="Parent Notice">વાલી આમંત્રણ</option>
            <option value="General Notice">સામાન્ય નોટિસ</option>
            <option value="Report">અહેવાલ રિપોર્ટ</option>
          </select>
        </div>

        {/* Live Trainee Data Mode Switcher */}
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs shrink-0">
          <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer select-none text-xs">
            <input
              type="checkbox"
              checked={previewMerged}
              onChange={(e) => setPreviewMerged(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="whitespace-nowrap">લાઈવ ડેટા પ્રિવ્યુ</span>
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

      {/* 3. MICROSOFT WORD RIBBON */}
      <WordRibbon
        activeTab={activeRibbonTab}
        setActiveTab={setActiveRibbonTab}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onExecuteCommand={handleExecuteCommand}
        onInsertTag={handleInsertTag}
        onInsertTable={handleInsertTable}
        showLetterhead={showLetterhead}
        setShowLetterhead={setShowLetterhead}
        showSignature={showSignature}
        setShowSignature={setShowSignature}
        pageMargin={pageMargin}
        setPageMargin={setPageMargin}
        showRuler={showRuler}
        setShowRuler={setShowRuler}
        showMarginGuides={showMarginGuides}
        setShowMarginGuides={setShowMarginGuides}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        previewMerged={previewMerged}
        setPreviewMerged={setPreviewMerged}
        isCollapsed={isRibbonCollapsed}
        onToggleCollapse={() => setIsRibbonCollapsed((prev) => !prev)}
        onTriggerAiCommentary={handleAiCommentary}
        onTriggerGrammarCheck={handleAiPolish}
        isAiLoading={isAiLoading}
        onUploadHeaderLogo={(slot, dataUrl) => {
          setHeaderConfig((prev) =>
            slot === 'left'
              ? { ...prev, logo_url: dataUrl, show_logo: true }
              : { ...prev, right_logo_url: dataUrl, show_right_logo: true }
          );
          showToast(
            slot === 'left'
              ? 'ડાબો હેડર લોગો અપડેટ થયો!'
              : 'જમણો હેડર લોગો અપડેટ થયો!'
          );
        }}
        onSaveTemplate={handleSaveCurrentTemplate}
        onPrintDocument={handlePrint}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
      />

      {/* 4. A4 DESKTOP WORKSPACE & CANVAS */}
      <div className="flex-1 bg-[#d8dfe6] p-2 sm:p-6 pb-28 sm:pb-12 overflow-y-auto flex flex-col items-center justify-start min-h-[600px]">
        <A4Canvas
          contentHtml={contentHtml}
          onContentChange={setContentHtml}
          fontFamily={fontFamily}
          fontSize={fontSize}
          showLetterhead={showLetterhead}
          showSignature={showSignature}
          pageMargin={pageMargin}
          orientation={orientation}
          showRuler={showRuler}
          showMarginGuides={showMarginGuides}
          zoomLevel={zoomLevel}
          previewMerged={previewMerged}
          mergedHtml={mergedHtml}
          instructor={instructor}
          headerConfig={headerConfig}
          onHeaderChange={setHeaderConfig}
          onZoomChange={setZoomLevel}
        />
      </div>

      {/* 5. BOTTOM MS WORD STATUS BAR */}
      <div className="bg-[#f0f4f8] border-t border-slate-300 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-medium text-slate-600 select-none">
        {/* Left: Document Metrics */}
        <div className="flex items-center gap-4">
          <div>પેજ ૧ / ૧ (Page 1 of 1)</div>
          <div>{wordMetrics.words} શબ્દો (Words)</div>
          <div>{wordMetrics.chars} અક્ષરો (Chars)</div>
          <div className="hidden sm:inline font-semibold text-blue-800">
            ભાષા: ગુજરાતી / English
          </div>
          {previewMerged && (
            <div className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              <span>લાઈવ પ્રિવ્યુ સક્રિય (રોલ: {currentTrainee?.roll_no})</span>
            </div>
          )}
        </div>

        {/* Right: Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
            className="px-1 font-mono font-bold hover:bg-slate-200 rounded"
          >
            -
          </button>
          <input
            type="range"
            min="60"
            max="150"
            value={Math.round(zoomLevel * 100)}
            onChange={(e) => setZoomLevel(Number(e.target.value) / 100)}
            className="w-20 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
            className="px-1 font-mono font-bold hover:bg-slate-200 rounded"
          >
            +
          </button>
          <span className="w-10 text-right font-mono font-semibold">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      {/* STARTER PRESETS MODAL */}
      {isStartersModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-blue-900">
                <FileCheck className="w-5 h-5" />
                <h3 className="font-black text-base">
                  સત્તાવાર ITI રિપોર્ટ ફોર્મેટ પસંદ કરો (Report Format Starters)
                </h3>
              </div>
              <button
                onClick={() => setIsStartersModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              આપની જરૂરિયાત મુજબનું ફોર્મેટ પસંદ કરો. ત્યારબાદ વર્ડ રિબન દ્વારા કોઈપણ ફેરફાર કરી શકશો:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {STARTER_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleLoadStarter(preset)}
                  className="border border-slate-200 rounded-xl p-3.5 hover:border-blue-600 hover:bg-blue-50/50 cursor-pointer transition-all flex flex-col justify-between text-left group"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-900 mb-1">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2">
                      {preset.subject}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-blue-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {preset.notice_type}
                    </span>
                    <span>આ ફોર્મેટ વાપરો →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SAVE AS MODAL */}
      {isSaveAsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-black text-base text-slate-900">
              નવા નામે ફોર્મેટ સેવ કરો (Save Format As)
            </h3>
            <p className="text-xs text-slate-600">
              આ ફોર્મેટની નવી નકલ સેવ કરવા માટે શીર્ષક લખો:
            </p>

            <input
              type="text"
              value={saveAsName}
              onChange={(e) => setSaveAsName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="દા.ત. ફિટર યુનિટ બી - વિશેષ નોટિસ"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSaveAsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                રદ કરો (Cancel)
              </button>
              <button
                onClick={handleSaveAsNew}
                disabled={!saveAsName.trim()}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
              >
                સેવ કરો (Confirm Save)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSTITUTE HEADER CUSTOMIZER MODAL */}
      {isHeaderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Building2 className="w-5 h-5 text-blue-700" />
                <h3 className="font-black text-base">સંસ્થા લેટરહેડ કસ્ટમાઇઝર (Institute Header)</h3>
              </div>
              <button
                onClick={() => setIsHeaderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Logo Settings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {/* Left Logo Uploader */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">ડાબો લોગો (Left Logo):</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {headerConfig.logo_width || 64}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded border border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {headerConfig.logo_url ? (
                        <img
                          src={headerConfig.logo_url}
                          alt="Left Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400">ITI</span>
                      )}
                    </div>
                    <div className="grow space-y-1">
                      <label className="cursor-pointer inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[11px] font-bold">
                        <Upload className="w-3 h-3" />
                        <span>છબી પસંદ કરો</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setHeaderConfig((prev) => ({
                                  ...prev,
                                  logo_url: ev.target?.result as string,
                                  show_logo: true,
                                }));
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {headerConfig.logo_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setHeaderConfig((prev) => ({
                              ...prev,
                              logo_url: undefined,
                            }))
                          }
                          className="text-red-600 hover:text-red-800 text-[10px] block font-semibold"
                        >
                          ડિફોલ્ટ રીસેટ કરો
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">
                      સાઇઝ (પહોળાઈ): {headerConfig.logo_width || 64}px
                    </label>
                    <input
                      type="range"
                      min="36"
                      max="160"
                      value={headerConfig.logo_width || 64}
                      onChange={(e) =>
                        setHeaderConfig((prev) => ({
                          ...prev,
                          logo_width: Number(e.target.value),
                        }))
                      }
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Right Logo Uploader */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">જમણો લોગો (Right Logo):</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {headerConfig.right_logo_width || 64}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded border border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {headerConfig.right_logo_url ? (
                        <img
                          src={headerConfig.right_logo_url}
                          alt="Right Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[9px] font-bold text-orange-500">SKILL</span>
                      )}
                    </div>
                    <div className="grow space-y-1">
                      <label className="cursor-pointer inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-[11px] font-bold">
                        <Upload className="w-3 h-3" />
                        <span>છબી પસંદ કરો</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setHeaderConfig((prev) => ({
                                  ...prev,
                                  right_logo_url: ev.target?.result as string,
                                  show_right_logo: true,
                                }));
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {headerConfig.right_logo_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setHeaderConfig((prev) => ({
                              ...prev,
                              right_logo_url: undefined,
                            }))
                          }
                          className="text-red-600 hover:text-red-800 text-[10px] block font-semibold"
                        >
                          ડિફોલ્ટ રીસેટ કરો
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">
                      સાઇઝ (પહોળાઈ): {headerConfig.right_logo_width || 64}px
                    </label>
                    <input
                      type="range"
                      min="36"
                      max="160"
                      value={headerConfig.right_logo_width || 64}
                      onChange={(e) =>
                        setHeaderConfig((prev) => ({
                          ...prev,
                          right_logo_width: Number(e.target.value),
                        }))
                      }
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                  </div>
                </div>
              </div>

              {/* Text Information */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  સંસ્થાનું નામ (ગુજરાતી):
                </label>
                <input
                  type="text"
                  value={headerConfig.institute_name_gu || ''}
                  onChange={(e) =>
                    setHeaderConfig((prev) => ({ ...prev, institute_name_gu: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  placeholder="ઔદ્યોગિક તાલીમ સંસ્થા, રાજકોટ"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Institute Name (English):
                </label>
                <input
                  type="text"
                  value={headerConfig.institute_name_en || ''}
                  onChange={(e) =>
                    setHeaderConfig((prev) => ({ ...prev, institute_name_en: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold uppercase"
                  placeholder="GOVERNMENT INDUSTRIAL TRAINING INSTITUTE, RAJKOT"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ખાતાકીય પેટા-શીર્ષક (Department Subtitle):
                </label>
                <input
                  type="text"
                  value={headerConfig.department_subtitle || ''}
                  onChange={(e) =>
                    setHeaderConfig((prev) => ({ ...prev, department_subtitle: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  placeholder="શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  વ્યવસાય / બેચ સબ-લાઇન (Trade/Batch Subline):
                </label>
                <input
                  type="text"
                  value={headerConfig.contact_info || ''}
                  onChange={(e) =>
                    setHeaderConfig((prev) => ({ ...prev, contact_info: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  placeholder="વાયરમેન • ૨૦૨૫-૨૦૨૬ (Unit A)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">સંસ્થાનું સરનામું (Address):</label>
                  <input
                    type="text"
                    value={headerConfig.address || ''}
                    onChange={(e) =>
                      setHeaderConfig((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                    placeholder="આજી ડેમ પાસે, રાજકોટ-૩૬૦૦૦૩"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    હેડર બોર્ડર સ્ટાઇલ (Border Style):
                  </label>
                  <select
                    value={headerConfig.banner_border_style || 'double'}
                    onChange={(e) =>
                      setHeaderConfig((prev) => ({
                        ...prev,
                        banner_border_style: e.target.value as any,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold bg-white"
                  >
                    <option value="double">ડબલ લાઇન (Double Rule)</option>
                    <option value="solid">સિંગલ સોલિડ (Solid Line)</option>
                    <option value="dashed">ડેસ્ડ લાઇન (Dashed Line)</option>
                    <option value="none">બોર્ડર વગર (None)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  જાવક ક્રમાંક પ્રિફિક્સ (Outward Prefix):
                </label>
                <input
                  type="text"
                  value={headerConfig.ref_prefix || ''}
                  onChange={(e) =>
                    setHeaderConfig((prev) => ({ ...prev, ref_prefix: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  placeholder="ઔતાસં/રાજકોટ/તલમ/૨૦૨૫"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsHeaderModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                બંધ કરો
              </button>
              <button
                onClick={() => {
                  onUpdateInstructorHeader(headerConfig);
                  setIsHeaderModalOpen(false);
                  showToast('લેટરહેડ સેટિંગ્સ સફળતાપૂર્વક અપડેટ થયા!');
                }}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                સેવ કરો (Save Header)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
