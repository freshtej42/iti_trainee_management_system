import { Instructor, LetterTemplate } from '../types';

export interface LetterheadPreset {
  id: string;
  name: string;
  description: string;
  iconName?: string;
  getHtml: (data: {
    itiNameGu: string;
    itiNameEn: string;
    deptGu: string;
    address: string;
    phone: string;
    email: string;
    refPrefix: string;
    logoUrl?: string;
    rightLogoUrl?: string;
  }) => string;
}

export const LETTERHEAD_PRESETS: LetterheadPreset[] = [
  {
    id: 'standard_gujarat_iti',
    name: 'ગુજરાત સરકાર સત્તાવાર ITI લેટરહેડ (Standard Official)',
    description: 'ડાબે-જમણે લોગો, મધ્યમાં ગુજરાત સરકાર અને ITI નામ, નીચે જાવક નંબર તથા તારીખ',
    getHtml: (data) => `
<div class="iti-letterhead-container" style="font-family: 'Noto Sans Gujarati', Arial, sans-serif; color: #0f172a; border-bottom: 3px double #1e293b; padding-bottom: 8px; margin-bottom: 16px;">
  <table style="width: 100%; border-collapse: collapse; border: none; margin: 0 0 6px 0;">
    <tbody>
      <tr>
        <td style="width: 80px; vertical-align: middle; text-align: left; border: none; padding: 2px;">
          ${
            data.logoUrl
              ? `<img src="${data.logoUrl}" alt="ITI Logo" style="width: 65px; height: 65px; object-fit: contain;" />`
              : `<div style="width: 62px; height: 62px; border-radius: 50%; border: 2px solid #1e3a8a; background-color: #eff6ff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; font-size: 8px; font-weight: bold; color: #1e3a8a; margin: 0 auto;">
                  <span style="font-size: 7px; color: #1e293b;">GOVT OF</span>
                  <span style="font-size: 13px; font-weight: 900; line-height: 1;">ITI</span>
                  <span style="font-size: 7px; color: #1e293b;">GUJARAT</span>
                </div>`
          }
        </td>
        <td style="vertical-align: middle; text-align: center; border: none; padding: 2px 8px;">
          <div style="font-size: 11px; font-weight: 600; color: #475569; letter-spacing: 0.5px;">
            ${data.deptGu || 'શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર'}
          </div>
          <h2 style="font-size: 18px; font-weight: 900; color: #090d16; margin: 3px 0 2px 0; font-family: 'Noto Sans Gujarati', sans-serif;">
            ${data.itiNameGu || 'ઔદ્યોગિક તાલીમ સંસ્થા'}
          </h2>
          <div style="font-size: 12px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.8px;">
            ${data.itiNameEn || 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE'}
          </div>
          <div style="font-size: 10px; color: #475569; margin-top: 3px;">
            સરનામું: ${data.address || 'ગુજરાત'} ${data.phone ? `• મો.: ${data.phone}` : ''} ${data.email ? `• ઈમેલ: ${data.email}` : ''}
          </div>
        </td>
        <td style="width: 80px; vertical-align: middle; text-align: right; border: none; padding: 2px;">
          ${
            data.rightLogoUrl
              ? `<img src="${data.rightLogoUrl}" alt="Emblem" style="width: 65px; height: 65px; object-fit: contain; margin-left: auto;" />`
              : `<div style="width: 62px; height: 62px; border-radius: 50%; border: 1.5px solid #cbd5e1; background-color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin-left: auto;">
                  <span style="font-size: 9px; font-weight: 800; color: #334155;">ISO</span>
                  <span style="font-size: 7.5px; font-weight: bold; color: #64748b;">9001:2015</span>
                  <span style="font-size: 6.5px; color: #0284c7;">CERTIFIED</span>
                </div>`
          }
        </td>
      </tr>
    </tbody>
  </table>
  <table style="width: 100%; border-collapse: collapse; border: none; border-top: 1px solid #cbd5e1; margin-top: 4px; padding-top: 4px;">
    <tbody>
      <tr>
        <td style="text-align: left; font-size: 11px; font-weight: 700; color: #1e293b; border: none; padding: 4px 0 0 0;">
          જાવક ક્રમાંક: <span style="font-family: monospace;">{{Ref_No}}</span>
        </td>
        <td style="text-align: right; font-size: 11px; font-weight: 700; color: #1e293b; border: none; padding: 4px 0 0 0;">
          તારીખ: <span>{{Current_Date}}</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
    `.trim(),
  },
  {
    id: 'centered_minimal',
    name: 'સેન્ટર્ડ મિનિમલ લેટરહેડ (Centered Minimalist)',
    description: 'કેન્દ્રિત ટાઈટલ, સ્વચ્છ અને આધુનિક લુક, સિંગલ સોલિડ બોર્ડર',
    getHtml: (data) => `
<div class="iti-letterhead-container" style="font-family: 'Noto Sans Gujarati', Arial, sans-serif; color: #0f172a; text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 16px;">
  <div style="font-size: 10.5px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
    ${data.deptGu || 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગુજરાત સરકાર'}
  </div>
  <h1 style="font-size: 20px; font-weight: 900; color: #020617; margin: 4px 0 2px 0;">
    ${data.itiNameGu || 'ઔદ્યોગિક તાલીમ સંસ્થા'}
  </h1>
  <div style="font-size: 11.5px; font-weight: 700; color: #334155; text-transform: uppercase;">
    ${data.itiNameEn || 'INDUSTRIAL TRAINING INSTITUTE'}
  </div>
  <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">
    ${data.address || 'ગુજરાત રાજ્ય'} ${data.phone ? `• સંપર્ક: ${data.phone}` : ''}
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #94a3b8; margin-top: 6px; padding-top: 4px; font-size: 11px; font-weight: 700;">
    <div style="text-align: left;">જા.નં.: {{Ref_No}}</div>
    <div style="text-align: right;">તારીખ: {{Current_Date}}</div>
  </div>
</div>
    `.trim(),
  },
  {
    id: 'compact_header',
    name: 'કમ્પેક્ટ હાઇ-ડેન્સિટી લેટરહેડ (Compact)',
    description: 'ઓછી ઊંચાઈ ધરાવતો લેટરહેડ, જેથી વધુ વિગતો સિંગલ A4 પેજમાં સમાઈ શકે',
    getHtml: (data) => `
<div class="iti-letterhead-container" style="font-family: 'Noto Sans Gujarati', Arial, sans-serif; color: #0f172a; border-bottom: 2px solid #334155; padding-bottom: 6px; margin-bottom: 14px;">
  <table style="width: 100%; border-collapse: collapse; border: none; margin: 0;">
    <tbody>
      <tr>
        <td style="width: 50px; vertical-align: middle; border: none; padding: 0;">
          ${
            data.logoUrl
              ? `<img src="${data.logoUrl}" alt="Logo" style="width: 44px; height: 44px; object-fit: contain;" />`
              : `<div style="width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid #1e3a8a; background: #dbeafe; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #1e3a8a;">ITI</div>`
          }
        </td>
        <td style="vertical-align: middle; text-align: left; border: none; padding-left: 10px;">
          <div style="font-size: 9.5px; font-weight: 600; color: #64748b; line-height: 1.2;">${data.deptGu || 'ગુજરાત સરકાર'}</div>
          <div style="font-size: 15px; font-weight: 900; color: #0f172a; line-height: 1.3;">${data.itiNameGu || 'ઔદ્યોગિક તાલીમ સંસ્થા'}</div>
          <div style="font-size: 9.5px; color: #475569;">${data.address || 'ગુજરાત'}</div>
        </td>
        <td style="vertical-align: middle; text-align: right; border: none; font-size: 10.5px; font-weight: 700; color: #1e293b;">
          <div>જા.નં.: {{Ref_No}}</div>
          <div style="margin-top: 2px;">તારીખ: {{Current_Date}}</div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
    `.trim(),
  },
  {
    id: 'bilingual_formal',
    name: 'દ્વિભાષીય ફોર્મલ ITI લેટરહેડ (Bilingual Formal)',
    description: 'વિસ્તૃત સરનામું, પિનકોડ, ફોન, ઈમેલ અને સરકારી હેડિંગ સાથે સંપૂર્ણ સત્તાવાર ફોર્મેટ',
    getHtml: (data) => `
<div class="iti-letterhead-container" style="font-family: 'Noto Sans Gujarati', Arial, sans-serif; color: #0f172a; border-bottom: 3.5px double #0284c7; padding-bottom: 8px; margin-bottom: 16px;">
  <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
    <div style="flex-shrink: 0;">
      ${
        data.logoUrl
          ? `<img src="${data.logoUrl}" alt="Logo" style="width: 58px; height: 58px; object-fit: contain;" />`
          : `<div style="width: 54px; height: 54px; border-radius: 8px; border: 2px solid #0284c7; background: #e0f2fe; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; color: #0369a1;">
              <span>GOVT</span>
              <span style="font-size: 11px; font-weight: 900;">ITI</span>
            </div>`
      }
    </div>
    <div style="flex-grow: 1; text-align: center;">
      <div style="font-size: 11px; font-weight: 600; color: #0369a1;">શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર</div>
      <h2 style="font-size: 17.5px; font-weight: 900; color: #0c4a6e; margin: 2px 0;">${data.itiNameGu || 'ઔદ્યોગિક તાલીમ સંસ્થા'}</h2>
      <div style="font-size: 11px; font-weight: 800; color: #075985;">${data.itiNameEn || 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE'}</div>
      <div style="font-size: 9.5px; color: #475569; margin-top: 2px;">
        ${data.address || 'ગુજરાત'} | ફોન: ${data.phone || '—'} | ઈમેલ: ${data.email || '—'}
      </div>
    </div>
    <div style="flex-shrink: 0; text-align: right;">
      ${
        data.rightLogoUrl
          ? `<img src="${data.rightLogoUrl}" alt="Logo" style="width: 58px; height: 58px; object-fit: contain;" />`
          : `<div style="font-size: 9.5px; font-weight: 700; color: #0369a1; border: 1px solid #7dd3fc; background: #f0f9ff; padding: 4px 8px; border-radius: 6px; text-align: center;">
              <div>ISO 9001</div>
              <div style="font-size: 8px; color: #0284c7;">પ્રમાણિત</div>
            </div>`
      }
    </div>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #bae6fd; margin-top: 6px; padding-top: 4px; font-size: 11px; font-weight: 700; color: #0c4a6e;">
    <div>જાવક નંબર: {{Ref_No}}</div>
    <div>તારીખ: {{Current_Date}}</div>
  </div>
</div>
    `.trim(),
  },
];

/**
 * Generates an initial or fallback rich-text letterhead HTML for an instructor
 */
export function generateDefaultLetterheadHtml(
  instructor: Instructor,
  presetId: string = 'standard_gujarat_iti'
): string {
  const preset = LETTERHEAD_PRESETS.find((p) => p.id === presetId) || LETTERHEAD_PRESETS[0];

  const headerConfig = instructor.header_config;
  const itiNameGu = headerConfig?.institute_name_gu || instructor.iti_name || 'ઔદ્યોગિક તાલીમ સંસ્થા';
  const itiNameEn = headerConfig?.institute_name_en || 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE';
  const deptGu = headerConfig?.department_subtitle || 'શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર';
  const address = headerConfig?.address || instructor.institution_address || 'ગુજરાત રાજ્ય';
  const phone = headerConfig?.contact_info || instructor.phone || '';
  const email = instructor.email || '';
  const refPrefix = headerConfig?.ref_prefix || instructor.outward_code_prefix || 'ઔતાસં/૨૦૨૫-૨૬';
  const logoUrl = headerConfig?.show_logo !== false ? (headerConfig?.logo_url || instructor.letterhead_header_url) : undefined;
  const rightLogoUrl = headerConfig?.show_right_logo ? headerConfig?.right_logo_url : undefined;

  return preset.getHtml({
    itiNameGu,
    itiNameEn,
    deptGu,
    address,
    phone,
    email,
    refPrefix,
    logoUrl,
    rightLogoUrl,
  });
}

/**
 * Resolves the effective letterhead HTML for a given template and instructor.
 * Hierarchy:
 * 1. Template-specific letterhead (if use_custom_letterhead is true and template.letterhead_html is non-empty)
 * 2. Template.header_config.letterhead_html (if defined)
 * 3. Instructor.letterhead_html (global rich-text letterhead)
 * 4. Instructor.header_config.letterhead_html
 * 5. Auto-generated default preset HTML
 */
export function getEffectiveLetterheadHtml(
  instructor: Instructor,
  template?: LetterTemplate | null
): string {
  if (template?.use_custom_letterhead && template.letterhead_html?.trim()) {
    return template.letterhead_html;
  }
  if (template?.header_config?.letterhead_html?.trim()) {
    return template.header_config.letterhead_html;
  }
  if (instructor?.letterhead_html?.trim()) {
    return instructor.letterhead_html;
  }
  if (instructor?.header_config?.letterhead_html?.trim()) {
    return instructor.header_config.letterhead_html;
  }
  return generateDefaultLetterheadHtml(instructor);
}

/**
 * Replaces outward number and current date tags inside the letterhead HTML for preview and print.
 */
export function renderLetterheadHtml(
  rawHtml: string,
  options: {
    refNumber?: string;
    issueDate?: string;
  } = {}
): string {
  const ref = options.refNumber || 'ઔતાસં/૨૦૨૫-૨૬/૧૦૧';
  const date = options.issueDate || new Date().toLocaleDateString('gu-IN');

  return rawHtml
    .replace(/{{Ref_No}}|{{Ref_Number}}|{{Outward_No}}/gi, ref)
    .replace(/{{Current_Date}}|{{Issue_Date}}|{{Date}}/gi, date);
}
