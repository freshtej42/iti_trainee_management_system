import re

with open('src/components/TemplateStudio.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

replacements = [
    # Top banners & titles
    ('ટેમ્પલેટ્સ મેનેજર (Letter & Report Templates)', 'Template Studio (Letters & Notices)'),
    ('સત્તાવાર અનિયમિતતા ચેતવણી પત્રો, વાલી નોટિસ અને આચાર્યશ્રી અહેવાલ ફોર્મેટ્સ', 'Design and manage official attendance warning letters, parent notices, and principal reports'),
    ('<span>લેટરહેડ હેડર સેટિંગ્સ</span>', '<span>Letterhead Settings</span>'),
    ('<span>+ નવો ટેમ્પલેટ બનાવો</span>', '<span>+ Create New Template</span>'),
    # Categories / tabs
    ("{ id: 'all', label: 'બધા ટેમ્પલેટ્સ'", "{ id: 'all', label: 'All Templates'"),
    ("label: 'નોટિસ પત્રો (Warnings)'", "label: 'Attendance Warnings'"),
    ("label: 'આચાર્યશ્રી અહેવાલ (Principal Reports)'", "label: 'Principal Reports'"),
    ("label: 'સામાન્ય / વાલી પત્રો'", "label: 'General & Parent Notices'"),
    ("label: 'મારા કસ્ટમ પત્રો'", "label: 'My Custom Templates'"),
    ('placeholder="ટેમ્પલેટ શોધો (Search)..."', 'placeholder="Search templates..."'),
    # Card labels
    ('<span>લેટરહેડ સહિત</span>', '<span>With Letterhead</span>'),
    ('<span>📄 પ્રી-પ્રિન્ટેડ કાગળ</span>', '<span>📄 Pre-printed Paper</span>'),
    ('<span>સિસ્ટમ ફોર્મેટ</span>', '<span>Official Format</span>'),
    ('<span>કસ્ટમ પત્ર</span>', '<span>Custom Template</span>'),
    ('title="આ ટેમ્પલેટમાં સંસ્થાનું લેટરહેડ સક્રિય છે"', 'title="Letterhead is active for this template"'),
    ('title="આ ટેમ્પલેટ પ્રી-પ્રિન્ટેડ અથવા સાદા કાગળ માટે છે (લેટરહેડ વગર)"', 'title="Pre-printed paper mode (letterhead disabled)"'),
    ('વિષય: {tmpl.subject}', 'Subject: {tmpl.subject}'),
    ('title="TinyMCE એડિટરમાં ખોલો"', 'title="Open in TinyMCE Editor"'),
    ('<span>TinyMCE એડિટ</span>', '<span>Edit Template</span>'),
    ('title="આ ફોર્મેટની નકલ બનાવો (Duplicate)"', 'title="Duplicate template"'),
    ('title="ઝડપી પૂર્વાવલોકન (Preview)"', 'title="Quick Preview"'),
    ('title="ટેમ્પલેટ કાઢી નાખો (Delete)"', 'title="Delete template"'),
    ('title="આ ટેમ્પલેટ પસંદ કરીને રિપોર્ટ જનરેટરમાં જાવ"', 'title="Use this template in Report Generator"'),
    ('<span>વાપરો</span>', '<span>Generate</span>'),
    ('કોઈ ટેમ્પલેટ મળ્યો નથી (No templates matched your query)', 'No templates found matching your search'),
    ('બધા ફિલ્ટર રીસેટ કરો', 'Reset All Filters'),
    # Editor Top bar
    ('title="પાછા ટેમ્પલેટ્સ લિસ્ટ પર જાવ"', 'title="Back to Templates Gallery"'),
    ('<span>ટેમ્પલેટ્સ</span>', '<span>Templates</span>'),
    ('<span className="text-xs font-bold text-blue-200 whitespace-nowrap">નામ:</span>', '<span className="text-xs font-bold text-blue-200 whitespace-nowrap">Name:</span>'),
    ('placeholder="ટેમ્પલેટનું નામ લખો..."', 'placeholder="Enter template name..."'),
    ('૧લી નોટિસ (1st Warning)', '1st Warning'),
    ('૨જી નોટિસ (2nd Warning)', '2nd Warning'),
    ('આખરી નોટિસ (Final Notice)', 'Final Notice'),
    ('વાલી પત્ર (Parent Notice)', 'Parent Notice'),
    ('સામાન્ય નોટિસ (General)', 'General Notice'),
    ('આચાર્યશ્રી અહેવાલ (Report)', 'Principal Report'),
    ('title="લેટરહેડ સુવિધા: સંસ્થાનું હેડર બેનર રાખવું કે પ્રી-પ્રિન્ટેડ કાગળ માટે છુપાવવું"', 'title="Toggle Letterhead: show official header or hide for pre-printed stationery"'),
    ("<span>લેટરહેડ: {showLetterhead ? 'હા (On)' : 'ના (Off)'}</span>", "<span>Letterhead: {showLetterhead ? 'On' : 'Off'}</span>"),
    ('<span>સાચવો (Save)</span>', '<span>Save</span>'),
    ('title="નવા નામે સેવ કરો"', 'title="Save as new template"'),
    ('<span className="hidden sm:inline">નવા નામે</span>', '<span className="hidden sm:inline">Save Copy</span>'),
    ('title="રિપોર્ટ જનરેટરમાં ઉપયોગ કરો"', 'title="Use in Report Generator"'),
    ('<span className="hidden sm:inline">રિપોર્ટ જનરેટર</span>', '<span className="hidden sm:inline">Report Generator</span>'),
    ('title="સંસ્થા લેટરહેડ / કસ્ટમ બેનર ઇમેજ એડિટ કરો"', 'title="Edit institute letterhead and logos"'),
    ('<span>લેટરહેડ એડિટ કરો</span>', '<span>Edit Letterhead</span>'),
    ('title="A4 પ્રિન્ટ કરો"', 'title="Print Clean A4"'),
    ('title="PDF ડાઉનલોડ કરો"', 'title="Export PDF"'),
    # Subbar
    ('<span className="font-bold text-slate-600 whitespace-nowrap shrink-0">વિષય:</span>', '<span className="font-bold text-slate-600 whitespace-nowrap shrink-0">Subject:</span>'),
    ('placeholder="પત્રનો સત્તાવાર વિષય દાખલ કરો..."', 'placeholder="Enter official notice subject..."'),
    ('<span>લાઈવ ડેટા પ્રિવ્યુ (Live Trainee Data)</span>', '<span>Live Trainee Preview</span>'),
    # Canvas Letterhead Prompter & Status Bar
    ('title="ક્લિક કરીને લેટરહેડ ચાલુ કરો"', 'title="Click to enable letterhead on canvas"'),
    ('<span>લેટરહેડ બંધ છે • A4 કેન્વાસ પર લેટરહેડ ઉમેરવા અહીં ક્લિક કરો (Enable Letterhead)</span>', '<span>Letterhead disabled • Click here to enable letterhead on A4 canvas</span>'),
    ('<span>TinyMCE એડિટર સક્રિય</span>', '<span>TinyMCE Canvas Active</span>'),
    ('<span>ભાષા: ગુજરાતી / English</span>', '<span>Language: English & Gujarati</span>'),
    ('<span>કુલ અક્ષરો: {contentHtml.length}</span>', '<span>Characters: {contentHtml.length}</span>'),
    ("{showLetterhead ? 'લેટરહેડ છુપાવો (Hide Header)' : 'લેટરહેડ ઉમેરો (Show Header)'}", "{showLetterhead ? 'Hide Letterhead' : 'Show Letterhead'}"),
    # Modals
    ('નવું ટેમ્પલેટ શરૂ કરો (Choose Template Starter)', 'Choose Template Starter'),
    ('ગુજરાત ITI માટે પ્રમાણિત ફોર્મેટ પસંદ કરો અથવા કોરો દસ્તાવેજ ખોલો', 'Select an official format or open a template'),
    ('પસંદ કરો', 'Use Template'),
    ('નવા નામે સેવ કરો (Save Template As)', 'Save Template Copy'),
    ('<label className="text-xs font-bold text-slate-700">ટેમ્પલેટનું નામ:</label>', '<label className="text-xs font-bold text-slate-700">Template Name:</label>'),
    ('placeholder="દા.ત. આચાર્યશ્રી અહેવાલ - ફેબ્રુઆરી ૨૦૨૬"', 'placeholder="e.g. 1st Warning Attendance Notice - Copy"'),
    ('આ ટેમ્પલેટ આપના એકાઉન્ટમાં સેવ થશે અને રિપોર્ટ જનરેટરમાં ઉપયોગ માટે ઉપલબ્ધ રહેશે.', 'This template will be saved to your account and available for report dispatch.'),
    ('રદ કરો', 'Cancel'),
    ('સેવ કરો', 'Save Copy'),
    ('બંધ કરો', 'Close'),
    ('TinyMCE માં એડિટ કરો', 'Edit in TinyMCE'),
    ('રિપોર્ટ જનરેટરમાં વાપરો', 'Use in Report Generator'),
    ("showToast('સંસ્થા લેટરહેડ TinyMCE દ્વારા સફળતાપૂર્વક સાચવવામાં આવ્યું!');", "showToast('Letterhead saved successfully!');"),
    ("showToast('સંસ્થા લેટરહેડ સફળતાપૂર્વક સાચવવામાં આવ્યું!');", "showToast('Letterhead saved successfully!');"),
    ("showToast('ટેમ્પલેટ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું.');", "showToast('Template deleted successfully.');"),
    ("showToast('PDF સફળતાપૂર્વક ડાઉનલોડ થયું!');", "showToast('PDF downloaded successfully!');"),
    ("alert('ઓછામાં ઓછું એક ટેમ્પ્લેટ રહેવું જરૂરી છે.');", "alert('At least one template must remain in the portal.');"),
    ("templateName.trim() || 'અનામી ટેમ્પલેટ'", "templateName.trim() || 'Untitled Template'"),
    ("showToast(`'${updated.template_name}' ટેમ્પલેટ ક્લાઉડમાં સુરક્ષિત સેવ થયું!`);", "showToast(`Template '${updated.template_name}' saved successfully!`);"),
    ("showToast(`નવું ટેમ્પલેટ '${newTemplate.template_name}' તૈયાર થયું!`);", "showToast(`Template '${newTemplate.template_name}' created successfully!`);"),
    ("${tmpl.template_name || tmpl.name} (નકલ)", "${tmpl.template_name || tmpl.name} (Copy)"),
    ("showToast(`'${cloneName}' સફળતાપૂર્વક તૈયાર થયું!`);", "showToast(`'${cloneName}' duplicated successfully!`);"),
    ("showToast(`'${preset.name}' નવું ટેમ્પલેટ શરૂ થયું!`);", "showToast(`Template '${preset.name}' started!`);"),
    ("${templateName} (નવી નકલ)", "${templateName} (Copy)"),
    ("tmpl.template_name || tmpl.name || 'આ ટેમ્પલેટ'", "tmpl.template_name || tmpl.name || 'this template'"),
    ("`શું આપ ખરેખર '${name}' ટેમ્પ્લેટ ડિલીટ કરવા માંગો છો?`", "`Are you sure you want to delete template '${name}'?`"),
]

applied = 0
for old, new in replacements:
    if old in text:
        text = text.replace(old, new)
        applied += 1
    else:
        print(f'MISS: {old[:40]}')

with open('src/components/TemplateStudio.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print(f'Applied {applied}/{len(replacements)} replacements.')
