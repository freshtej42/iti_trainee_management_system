# Gujarat ITI Trainee Portal - Public Landing Page & Feature Showcase

A high-performance, bilingual marketing and orientation landing page showcasing all capabilities of the Gujarat ITI Trainee Attendance, Warning Notice & Letterhead Portal, organized into thematic card-view sections with admin contact details, website documentation, and direct entry points to login and demo mode.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during interactive clarification and govern the implementation:
> - **Navigation & Access**: The Landing Page will serve as the initial public front page for visitors and logged-out users, while remaining accessible at any time from the top navigation bar when logged in.
> - **Bilingual Presentation**: Full bilingual presentation with a smooth toggle switch (ગુજરાતી / English) allowing instructors to read all feature details in their preferred language.
> - **Admin Contact & Footer**: Standard, trustworthy technical support and admin contact section detailing Admin Tejas Suthar (`tejassuthar21696@gmail.com`), technical support hours, ITI onboarding guidance, and official website information.

---

## 1. Overview & Core Concept

- **What It Does**: Provides an official, welcoming presentation of the entire portal ecosystem. Visitors and prospective ITI instructors can explore all software capabilities—from student records and smart attendance calculation to custom letterhead design, drag-and-drop merge tags, custom multi-student table creation, and outward dispatch registers.
- **Target Audience / Persona**:
  - Gujarat ITI Instructors & Supervisors seeking to automate attendance notice compliance and dispatch letters.
  - ITI Principals & Administrative Staff reviewing system capabilities for institutional adoption.
  - New Instructors registering and seeking approval assistance.
- **Key Value**: Replaces confusion and manual paperwork with a clear, visual showcase. Users can read concise feature summaries in cards, try the interactive live demo with one click, or log in to manage their classroom.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Visitor Arrival (First Touch)**:
   - Visitor arrives at the website and immediately sees the hero section: Gujarat ITI Portal brand, clear mission statement, key capability highlights, and two prominent actions: **"ઇન્સ્ટ્રક્ટર પ્રવેશ (Instructor Login)"** and **"ડેમો મોડ અજમાવો (Try Live Demo)"**.
2. **Exploring Categorized Feature Cards**:
   - Visitors scroll through 7 structured feature sections. Each section presents cards with concise, benefit-focused bullet points, domain icons, and visual highlights:
     - *Section 1*: Academic Hierarchy & Student Directory (Trade, Batch, Unit A/B/C, Excel import).
     - *Section 2*: Smart Attendance Tracker & Progressive Rules (DGT 80% rule, progressive safe vs notice required, continuous absence alerts).
     - *Section 3*: Official Letterhead & Word-Style Template Studio (TinyMCE canvas, letterhead builder, logo upload, pre-printed stationery mode).
     - *Section 4*: Unified Notice & Multi-Student Report Generator (Single-page forwarding letters, custom table tags, A4 PDF export).
     - *Section 5*: Drag-and-Drop Dynamic Merge Tag Engine (Student tags, address tags, custom tables, Gujarati numerals).
     - *Section 6*: Outward & Inward Dispatch Registry (Legal compliance, dispatch modes, tracking numbers, status tracking).
     - *Section 7*: Multi-Language Support, Gujarati Phonetic Typing & Security (Gujarati IME, Super Admin audit, 1-year license validity).
3. **Bilingual Toggle**:
   - Visitors can flip the language toggle in the landing page header at any time between Gujarati and English without losing their position on the page.
4. **Direct Action / Onboarding**:
   - Clicking **"Instructor Login / Register"** smoothly transitions to the authentication screen with a **"← મુખ્ય પૃષ્ઠ (Back to Home)"** navigation button.
   - Clicking **"Try Live Demo"** instantly activates the isolated demo session populated with realistic sample trade data.
5. **Logged-In Instructor Navigation**:
   - Logged-in instructors and admins have a dedicated **"મુખ્ય પૃષ્ઠ (Home)"** link in the header to revisit feature guides and documentation anytime, returning to their active workflow with one click.

### Visual Identity & Theme

- **Aesthetic Direction**: Trustworthy institutional portal meets modern productivity SaaS. Clean, authoritative, crisp, and uncluttered.
- **Color Palette (60-30-10 Rule)**:
  - *60% Neutral Canvas*: Crisp off-white (`#F8FAFC` and `#FFFFFF`) with subtle slate dividing lines (`#E2E8F0`).
  - *30% Structural Surfaces*: Deep Gujarat ITI Forest Green (`#1E3A24` and `#346739`) for focal containers, coupled with subdued slate-900 typography.
  - *10% Accent Tokens*: Soft gold/champagne accent (`#F2EDC2`) and emerald action accents (`#059669`) for primary CTAs and active states.
- **Typography & Hierarchy**:
  - Headings: Display bold sans (`Plus Jakarta Sans` / `Noto Sans Gujarati`) with tight tracking and balanced line wrapping (`text-wrap: balance`).
  - Body: High-legibility prose (`15px`, `1.6` line-height) with clear Gujarati and English font rendering.
- **Card View Architecture**:
  - Clean, single-elevation cards with subtle hairline borders (`border border-slate-200`) and soft hover transitions (`hover:border-emerald-600 hover:shadow-md`).
  - Zero-pill metadata discipline: category indicators and metadata use clean, quiet typography rather than bulky pill capsules.
  - No fake comment headers (`//`), no decorative pulsing dots, and no meaningless buzzwords.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Public Default with Seamless Navigation**
  - *Chosen Approach*: Unauthenticated visitors see the Landing Page by default. A top-bar button provides instant access to the Login/Registration portal, and the Auth screen includes a "Back to Home" button.
  - *Why*: Allows new visitors to understand portal capabilities before creating an account, while preventing friction for returning instructors who can log in in one click.
- **Decision 2: Bilingual Gujarati / English Switcher**
  - *Chosen Approach*: Embed complete Gujarati and English text matrices into the landing page component with an interactive toggle switch.
  - *Why*: Gujarat ITI instructors work officially in Gujarati for letters and notices, but frequently search technical terms and portal settings in English.
- **Decision 3: Transparent Admin & Platform Details in Footer**
  - *Chosen Approach*: Include a dedicated technical contact and admin card in the footer featuring Super Admin Tejas Suthar's verified email (`tejassuthar21696@gmail.com`), support availability hours, and portal purpose.
  - *Why*: Establishes institutional credibility and offers clear channels for instructors needing payment verification or account activation.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           App Entry & Router (App.tsx)                      │
│                                                                             │
│  State: [currentView: 'landing' | 'auth' | 'app']                           │
│         [isAuthenticated: boolean]                                          │
│         [activeTab: 'home' | 'attendance' | 'report' | 'templates' | ...]   │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │                               │
        Visitor / Home │                Auth Action    │
                       ▼                               ▼
┌─────────────────────────────────────────┐  ┌────────────────────────────────┐
│       LandingPageView Component         │  │     InstructorAuth Component   │
│                                         │  │                                │
│ • Hero Banner & Value Proposition       │  │ • Mobile & Email Login         │
│ • Bilingual Language Toggle (Guj/Eng)   │  │ • 1-Year Registration Flow     │
│ • Quick Actions: Login / Demo / Explore │  │ • Guest Demo Sandbox Launch    │
│ • Section 1: Academic Hierarchy         │  │ • "← Back to Home" button      │
│ • Section 2: Smart Attendance Tracking  │  └────────────────────────────────┘
│ • Section 3: Word-Style Template Studio │
│ • Section 4: Unified Notice Generator   │
│ • Section 5: Dynamic Merge Tag Engine   │
│ • Section 6: Inward & Outward Register  │
│ • Section 7: Multi-Language & Security  │
│ • Website Specifications & Standards    │
│ • Official Admin & Tech Support Footer  │
└─────────────────────────────────────────┘
                       ▲
                       │ Navigates to/from
┌──────────────────────┴──────────────────────────────────────────────────────┐
│                    Authenticated Portal Header (Header.tsx)                 │
│                                                                             │
│  • Primary Navigation: [Home | Attendance | Report | Templates | ...]       │
│  • Language Switcher & Gujarati IME Floating Companion                     │
│  • Instructor Profile & Logout                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Feature Sections & Content Specification

1. **Section 1: શૈક્ષણિક માળખું અને તાલીમાર્થી ડિરેક્ટરી (Academic Hierarchy & Trainee Records)**
   - Trade, Batch (e.g. 2025–2026), and Unit (Unit A/B/C) hierarchical structure.
   - Bulk Excel/CSV student roster import with Gujarati Unicode name support.
   - Automatic parent directory, mobile numbers, and complete residential addresses.
2. **Section 2: સ્માર્ટ હાજરી ટ્રેકિંગ અને પ્રગતિશીલ વિશ્લેષણ (Smart Attendance & Progressive Attendance)**
   - Monthly and progressive cumulative attendance calculation.
   - Automatic DGT 80% rule compliance detection.
   - Progressive Safe status intelligence (trainees with safe cumulative attendance are exempt from notices).
   - Continuous absenteeism tracking with exact absence start dates.
3. **Section 3: અધિકૃત પત્ર ટેમ્પલેટ સ્ટુડિયો (Official Letterhead & Word-Style Template Studio)**
   - Full-featured TinyMCE rich text editor with Gujarati font support.
   - Pre-configured starter presets (1st Warning, 2nd Warning, Final Notice, Parent-Teacher Meeting).
   - Custom institute letterhead designer (upload official logos, pre-printed stationery mode).
   - Direct image and official stamp uploads from device.
4. **Section 4: યુનિફાઇડ રિપોર્ટ અને નોટિસ જનરેટર (Unified Report & Notice Generator)**
   - One-click batch notice generation for parents with custom reference numbers.
   - Consolidated single-page multi-student forwarding letters for office filing.
   - Multi-Student Column Customizer to choose visible table columns.
   - Custom Table Merge Tag Builder allowing instructors to create custom tables with merge tags and blank rows for handwritten remarks.
   - True A4 print preview and vector PDF export.
5. **Section 5: ડાયનેમિક ડ્રેગ-એન્ડ-ડ્રોપ મર્જ ટેગ એન્જિન (Drag & Drop Merge Tag Engine)**
   - 25+ dynamic tags covering Trainee details, Attendance, Address, Institute, and Outward code.
   - Drag-and-drop chips directly onto document canvases.
   - Automatic Gujarati numeral and date rendering.
6. **Section 6: જાવક અને આવક રજીસ્ટ્રાર (Outward & Inward Dispatch Registry)**
   - Automatic logging of printed and dispatched notices in official register.
   - Inward recording for Principal forwarding reports.
   - Real-time search, filters, status tracking, and batch export.
7. **Section 7: બહુભાષીય સપોર્ટ અને સુરક્ષિત વહીવટ (Multi-Language, Phonetic Typing & Security)**
   - Trilingual interface support (English, Gujarati, Hindi).
   - Built-in phonetic Gujarati IME typing companion for effortless typing on any keyboard.
   - Super Admin payment verification and 1-year license validity governance.
   - Isolated Guest Demo Mode to test all portal features risk-free.

---

## 5. Verification Plan

1. **Compilation & Linting**: Run `compile_applet` and `lint_applet` to ensure zero TypeScript errors.
2. **Navigation Testing**:
   - Verify unauthenticated visitors land on the Landing Page by default.
   - Verify clicking "Instructor Login" opens the login screen, with a working "Back to Home" button.
   - Verify clicking "Try Demo Mode" logs into the guest sandbox.
   - Verify logged-in users can navigate between "Home" (landing page) and tool tabs (`attendance`, `report`, `templates`, etc.) seamlessly.
3. **Language Toggle Testing**:
   - Verify toggling between Gujarati and English updates all section headers, feature cards, and footer labels smoothly without layout shift.
4. **Responsive Verification**:
   - Verify clean 1440px desktop card grids, tablet 2-column layouts, and mobile single-column view with touch targets $\ge 44\text{px}$.
