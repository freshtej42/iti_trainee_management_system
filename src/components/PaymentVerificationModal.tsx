import React, { useState } from 'react';
import { Instructor, SuperAdminSettings } from '../types';
import { UpiQrCode } from './UpiQrCode';
import { compressImageFile } from '../utils/imageCompressor';
import {
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Phone,
  User,
  ArrowRight,
  FileText,
  Clock,
  Check,
} from 'lucide-react';

interface PaymentVerificationModalProps {
  instructor: Instructor;
  adminSettings: SuperAdminSettings;
  isOpen: boolean;
  onClose: () => void;
  onSubmitPayment: (details: {
    payment_screenshot_url: string;
    payment_utr: string;
    payment_mobile: string;
    payment_amount: number;
  }) => Promise<void>;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  instructor,
  adminSettings,
  isOpen,
  onClose,
  onSubmitPayment,
}) => {
  const [step, setStep] = useState<'qr' | 'upload'>('qr');
  const [screenshotData, setScreenshotData] = useState<string>(
    instructor.payment_screenshot_url || ''
  );
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>(instructor.payment_utr || '');
  const [paymentMobile, setPaymentMobile] = useState<string>(
    instructor.payment_mobile || instructor.phone || ''
  );
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successSubmitted, setSuccessSubmitted] = useState(
    Boolean(instructor.payment_submitted_at)
  );

  if (!isOpen) return null;

  const feeAmount = adminSettings.fee_amount || 9;
  const upiId = adminSettings.upi_id || 'tejassuthar21696@okhdfcbank';
  const payeeName = adminSettings.payee_name || 'Tejas Suthar (Super Admin)';
  // Mobile number embedded in the payment note/name as requested by user
  const noteWithNameAndMobile = `${instructor.name} (${instructor.phone}) - ITI Fee`;

  // Deep link for mobile users
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${feeAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(noteWithNameAndMobile)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('કૃપા કરીને ફક્ત ફોટો (PNG / JPG / JPEG / WebP) સિલેક્ટ કરો.');
      return;
    }

    setScreenshotFileName(file.name);
    setErrorMessage('');

    try {
      const compressed = await compressImageFile(file, 1200, 0.82);
      setScreenshotData(compressed);
    } catch {
      setErrorMessage('ફોટો પ્રોસેસ કરવામાં ભૂલ આવી. કૃપા કરીને અન્ય ફોટો સિલેક્ટ કરો.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!screenshotData) {
      setErrorMessage('કૃપા કરીને ચૂકવણી કરેલ સ્ક્રીનશોટ (Payment Screenshot) અપલોડ કરો.');
      return;
    }

    if (!utrNumber.trim()) {
      setErrorMessage('કૃપા કરીને UPI રેફરન્સ નંબર અથવા UTR નંબર (૧૨ આંકડા) દાખલ કરો.');
      return;
    }

    if (!paymentMobile.trim() || paymentMobile.trim().length < 10) {
      setErrorMessage('કૃપા કરીને માન્ય ૧૦ આંકડાનો મોબાઈલ નંબર દાખલ કરો.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitPayment({
        payment_screenshot_url: screenshotData,
        payment_utr: utrNumber.trim(),
        payment_mobile: paymentMobile.trim(),
        payment_amount: feeAmount,
      });
      setSuccessSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'સબમિટ કરવામાં ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#214325] via-[#346739] to-[#214325] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <QrCode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                ખાતું વેરિફિકેશન અને ચૂકવણી (UPI Payment Verification)
              </h2>
              <p className="text-xs text-emerald-100">
                નોંધણી પૂર્ણ કરવા માટે ₹{feeAmount} ની ચૂકવણી અને સ્ક્રીનશોટ જરૂરી છે
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep('qr')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                step === 'qr'
                  ? 'bg-[#346739] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>૧. QR સ્કેન અને ચૂકવણી (₹{feeAmount})</span>
            </button>
            <span className="text-slate-300">→</span>
            <button
              onClick={() => setStep('upload')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                step === 'upload'
                  ? 'bg-[#346739] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>૨. સ્ક્રીનશોટ અને UTR અપલોડ</span>
            </button>
          </div>

          {successSubmitted && (
            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              સબમિટ થયેલ
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          {successSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                પેમેન્ટ વિગતો સફળતાપૂર્વક સબમિટ થઈ ગઈ છે!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                આપનો ₹{feeAmount} નો ચૂકવણી સ્ક્રીનશોટ અને UTR ક્રમાંક (<strong>{utrNumber}</strong>) સુપર એડમિન સમક્ષ ચકાસણી માટે પહોંચી ગયો છે.
                સુપર એડમિન દ્વારા મંજૂરી મળતાં જ આપનું ખાતું ૧ વર્ષ માટે સક્રિય થશે (માન્યતા મુદત મંજૂરી મળ્યા તારીખથી ૧ વર્ષ ગણાશે, ચૂકવણી તારીખથી નહીં).
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs max-w-sm mx-auto space-y-1 text-slate-700">
                <div>• ઇન્સ્ટ્રક્ટર: <strong>{instructor.name}</strong></div>
                <div>• રજીસ્ટર્ડ મોબાઈલ: <strong>{instructor.phone}</strong></div>
                <div>• ચુકવણી મોબાઈલ: <strong>{paymentMobile}</strong></div>
                <div>• રકમ: <strong>₹{feeAmount}</strong></div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  બંધ કરો (Close)
                </button>
              </div>
            </div>
          ) : step === 'qr' ? (
            /* STEP 1: QR CODE & PAYMENT DETAILS */
            <div className="space-y-5">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>ચૂકવણી સૂચના:</strong> નીચે દર્શાવેલ QR કોડ સ્કેન કરી બરાબર <strong>₹{feeAmount}</strong> ની ચૂકવણી કરો.
                  નામ અને નોંધમાં આપનો રજીસ્ટર્ડ મોબાઈલ નંબર (<strong>{instructor.phone}</strong>) દર્શાવેલ છે.
                </div>
              </div>

              {/* QR Code and Payment Details Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <UpiQrCode
                    upiId={upiId}
                    payeeName={payeeName}
                    amount={feeAmount}
                    note={noteWithNameAndMobile}
                    size={185}
                    qrImageUrl={adminSettings.qr_image_url}
                    isAdminUploaded={Boolean(adminSettings.qr_image_url)}
                  />
                  {adminSettings.qr_image_url && (
                    <a
                      href={adminSettings.qr_image_url}
                      download={`Admin_UPI_QR_Code_₹${feeAmount}.jpg`}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                      title="QR કોડ સેવ કરો"
                    >
                      <span>📥 QR કોડ ડાઉનલોડ કરો</span>
                    </a>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                      સુપર એડમિન UPI આઈડી
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-slate-900 text-xs truncate mr-1">
                        {upiId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors shrink-0"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-slate-700 pt-1">
                      <span>ચૂકવવાની રકમ (Amount):</span>
                      <strong className="text-base text-emerald-700 font-black">₹{feeAmount}.00</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>ખાતાધારક:</span>
                      <span className="font-medium text-slate-900">{payeeName}</span>
                    </div>
                  </div>

                  {/* Direct Mobile UPI Link Button */}
                  <a
                    href={upiDeepLink}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors text-xs shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>UPI એપ્લિકેશન દ્વારા સીધું ચૂકવો (Pay directly)</span>
                  </a>

                  <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                    ℹ️ ચૂકવણી સફળ થયા પછી મળતી રસીદનો <strong>સ્ક્રીનશોટ</strong> અને <strong>૧૨ આંકડાનો UTR</strong> નંબર મેળવી આગળના પગલામાં અપલોડ કરો.
                  </div>
                </div>
              </div>

              {/* Navigation to Step 2 */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#346739] hover:bg-[#2b552f] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  <span>ચૂકવણી કરી દીધી છે? સ્ક્રીનશોટ અપલોડ કરો</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: SCREENSHOT UPLOAD & UTR FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Upload Area */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    ચૂકવણી સ્ક્રીનશોટ (Payment Screenshot) <span className="text-rose-600">*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-[#346739] rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/60 cursor-pointer transition-colors h-40 relative overflow-hidden">
                    {screenshotData ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <img
                          src={screenshotData}
                          alt="Uploaded payment proof"
                          className="max-h-28 object-contain rounded-lg border border-slate-200 shadow-2xs"
                        />
                        <span className="text-[10px] text-emerald-700 font-bold mt-1 truncate max-w-full">
                          {screenshotFileName || 'સ્ક્રીનશોટ સિલેક્ટ થયેલ છે'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                        <span className="text-xs font-bold text-slate-700 block">
                          સ્ક્રીનશોટ પસંદ કરો (Choose File)
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          PNG, JPG, JPEG (મહત્તમ ૫ MB)
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Form fields */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      UPI ટ્રાન્ઝેક્શન / UTR નંબર (૧૨ આંકડા) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="દા.ત. 412345678901 અથવા UPI Ref ID"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#346739] focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400">
                      Google Pay, PhonePe અથવા Paytm રસીદમાં દર્શાવેલ ૧૨ આંકડાનો UTR નંબર
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ચૂકવણી કરનાર મોબાઈલ નંબર (Payer Mobile) <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={paymentMobile}
                        onChange={(e) => setPaymentMobile(e.target.value)}
                        placeholder="૧૦ આંકડાનો મોબાઈલ નંબર"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#346739] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                    <div>• ચૂકવેલ રકમ: <strong className="text-slate-900">₹{feeAmount}</strong></div>
                    <div>• ઇન્સ્ટ્રક્ટર: <strong className="text-slate-900">{instructor.name}</strong></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('qr')}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  ← પાછા QR કોડ પર જાઓ
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    રદ કરો (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-[#346739] hover:bg-[#2b552f] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>ચકાસણી ચાલુ છે...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>ચકાસણી માટે મોકલો (Submit for Verification)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
