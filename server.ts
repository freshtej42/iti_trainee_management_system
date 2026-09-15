import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1.1 Verification Email dispatch endpoint
app.post('/api/auth/send-verification-email', async (req: Request, res: Response) => {
  try {
    const { email, name = 'ઇન્સ્ટ્રક્ટર' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = `iti_auth_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const verificationUrl = `https://iti.gujarat.gov.in/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    console.log(`[EMAIL DISPATCH] Verification request for ${email} (${name}): OTP = ${otp}, Token = ${token}`);

    return res.json({
      success: true,
      email,
      otp,
      token,
      verificationUrl,
      timestamp: new Date().toISOString(),
      message: `Verification code generated for ${email}. Instant verify available.`,
    });
  } catch (err: any) {
    console.error('Error generating email verification:', err);
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// 2. Gemini AI - Smart Parent Commentary Generation
app.post('/api/gemini/commentary', async (req: Request, res: Response) => {
  try {
    const {
      traineeName = 'વિદ્યાર્થી',
      presentDays = 14,
      absentDays = 10,
      totalWorkingDays = 24,
      attendancePercentage = 58.33,
      previousNoticeHistory = 'First Notice',
      language = 'Gujarati',
      tone = 'Strict & Polite',
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // Fallback high-quality formal responses if API key is not configured in local environment
      let fallbackText = '';
      if (language === 'Gujarati') {
        fallbackText = `તાલીમાર્થી ${traineeName} ની ચાલુ માસ દરમિયાન માત્ર ${attendancePercentage}% હાજરી રહેલ છે, જે NCVT/GCVT નિયમ મુજબ પરીક્ષા માટે અમાન્ય છે. વાલીશ્રીને તાકીદ કરવામાં આવે છે કે તાત્કાલિક સંસ્થા ખાતે રૂબરૂ આવી સુપરવાઈઝર ઇન્સ્ટ્રક્ટરને મળી જરૂરી ખુલાસો રજૂ કરવો.`;
      } else if (language === 'Hindi') {
        fallbackText = `प्रशिक्षु ${traineeName} की उपस्थिति मात्र ${attendancePercentage}% दर्ज की गई है, जो बोर्ड नियमानुसार अत्यंत न्यून है। अभिभावक महोदय से अनुरोध है कि वे तीन दिवस के भीतर संस्थान में उपस्थित होकर छात्र की निरंतर अनुपस्थिति का कारण स्पष्ट करें।`;
      } else {
        fallbackText = `Trainee ${traineeName}'s attendance is critically low at ${attendancePercentage}%, which is below the mandatory 80% threshold. Parents are strictly advised to visit the ITI office within 3 days to discuss this matter with the Supervisor Instructor.`;
      }
      return res.json({ commentary: fallbackText, source: 'system-template' });
    }

    const systemPrompt = `You are an expert administrative assistant for an Industrial Training Institute (ITI) Supervisor Instructor in India.
Write a formal, official notification paragraph addressed to a trainee's parent in ${language}.
The commentary must be polite but firm, highlighting the consequences of low attendance (< 80%) under NCVT/GCVT training norms, and strictly advising the parent to visit the ITI office immediately.
Keep it strictly to 2-3 concise, grammatically flawless sentences in authentic administrative vernacular (${language}). Do NOT include greeting or sign-off, only the advisory paragraph.`;

    const userPrompt = `Trainee Name: ${traineeName}
Month Working Days: ${totalWorkingDays}
Present Days: ${presentDays}
Absent Days: ${absentDays}
Attendance Percentage: ${attendancePercentage}%
Prior Notice History: ${previousNoticeHistory}
Desired Tone: ${tone}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
      ],
    });

    const generatedText = response.text?.trim() || '';
    return res.json({
      commentary: generatedText,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error generating AI commentary:', error);
    // Return gracefully with fallback
    const { traineeName = 'વિદ્યાર્થી', attendancePercentage = 60, language = 'Gujarati' } = req.body;
    let fallbackText = '';
    if (language === 'Gujarati') {
      fallbackText = `તાલીમાર્થી ${traineeName} ની ચાલુ માસ દરમિયાન માત્ર ${attendancePercentage}% હાજરી રહેલ છે. વાલીશ્રીએ તાત્કાલિક સંસ્થા ખાતે રૂબરૂ આવી સુપરવાઈઝર ઇન્સ્ટ્રક્ટરને મળવું.`;
    } else if (language === 'Hindi') {
      fallbackText = `प्रशिक्षु ${traineeName} की उपस्थिति ${attendancePercentage}% अत्यंत न्यून है। अभिभावक कृपया संस्थान में आकर संपर्क करें।`;
    } else {
      fallbackText = `Trainee ${traineeName}'s attendance is ${attendancePercentage}%. Please visit the ITI institute promptly to consult the instructor.`;
    }
    return res.json({ commentary: fallbackText, source: 'fallback-error', error: error?.message });
  }
});

// 3. Gemini AI - Grammar & Regional Vernacular Auto-Correct
app.post('/api/gemini/polish', async (req: Request, res: Response) => {
  try {
    const { text = '', language = 'Gujarati', mode = 'formal-polish' } = req.body;

    if (!text.trim()) {
      return res.json({ polishedText: text });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({ polishedText: text, source: 'unchanged-no-key' });
    }

    const prompt = `You are an Indic language editor specializing in formal official administrative Gujarati and Hindi letters for Government ITI institutes.
Carefully review and refine the following ${language} text. Correct any spelling mistakes, grammar errors, or informal tone, ensuring standard official vocabulary (e.g. પરિપત્ર, હાજરી, ગેરહાજરી, સુપરવાઈઝર ઇન્સ્ટ્રક્ટર, તાલીમાર્થી).
Preserve all merge tags like {{Full_Name}}, {{Attendance_Percentage}}, etc. exactly as they are.
Return ONLY the polished ${language} text with no commentary or markdown backticks.

Text to polish:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const polished = response.text?.trim() || text;
    return res.json({ polishedText: polished, source: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.error('Error in polish endpoint:', err);
    return res.json({ polishedText: req.body.text || '', error: err?.message });
  }
});

// Vite Middleware for dev mode vs static serving in production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();
