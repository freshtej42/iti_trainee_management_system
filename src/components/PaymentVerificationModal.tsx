import React, { useState } from 'react';
import { Instructor, SuperAdminSettings } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import UpiQrCode from './UpiQrCode';
import {
  ShieldCheck,
  Upload,
  Check,
  Copy,
  AlertCircle,
  ExternalLink,
  Phone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor;
  adminSettings: SuperAdminSettings;
  onSubmitPayment: (paymentData: {
    payment_screenshot_url: string;
    payment_utr: string;
    payment_mobile: string;
    payment_amount: number;
    payment_submitted_at: string;
  }) => Promise<void> | void;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  instructor,
  adminSettings,
  onSubmitPayment,
}) => {
  const [step, setStep] = useState<'qr' | 'upload'>('qr');
  const [screenshotData, setScreenshotData] = useState<string>('');
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [paymentMobile, setPaymentMobile] = useState<string>(instructor.phone || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [successSubmitted, setSuccessSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const feeAmount = adminSettings.fee_amount || 49;
  const upiId = adminSettings.upi_id || 'tejassuthar21696@okhdfcbank';
  const payeeName = adminSettings.payee_name || 'Tejas Suthar';

  const noteWithNameAndMobile = `ITI Portal Fee - ${instructor.name} (${instructor.phone})`;
  const encodedNote = encodeURIComponent(noteWithNameAndMobile);
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${feeAmount}&cu=INR&tn=${encodedNote}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG / JPG / JPEG / WebP).');
      return;
    }

    setScreenshotFileName(file.name);
    setErrorMessage('');

    try {
      const compressed = await compressImageFile(file, 1200, 0.82);
      setScreenshotData(compressed);
    } catch {
      setErrorMessage('Error processing image. Please select another image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!screenshotData) {
      setErrorMessage('Please upload the payment screenshot.');
      return;
    }

    if (!utrNumber.trim()) {
      setErrorMessage('Please enter the 12-digit UPI reference number or UTR number.');
      return;
    }

    if (!paymentMobile.trim() || paymentMobile.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitPayment({
        payment_screenshot_url: screenshotData,
        payment_utr: utrNumber.trim(),
        payment_mobile: paymentMobile.trim(),
        payment_amount: feeAmount,
        payment_submitted_at: new Date().toISOString(),
      });
      setSuccessSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                <span>Account Verification &amp; Annual Fee (₹{feeAmount})</span>
              </h2>
              <p className="text-[11px] text-slate-300">
                1 Year Account Validity • Unlimited A4 Notice Generation • Word Designer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep('qr')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                step === 'qr'
                  ? 'bg-[#346739] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>1. Scan QR &amp; Pay (₹{feeAmount})</span>
            </button>
            <span className="text-slate-300">→</span>
            <button
              onClick={() => setStep('upload')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                step === 'upload'
                  ? 'bg-[#346739] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>2. Upload Screenshot &amp; UTR</span>
            </button>
          </div>

          {successSubmitted && (
            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Submitted
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
                Payment Details Submitted Successfully!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your ₹{feeAmount} payment screenshot and UTR (<strong>{utrNumber}</strong>) have been submitted to the Super Admin for verification.
                Upon approval, your account will be activated for 1 year (validity period runs 1 full year from approval date).
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs max-w-sm mx-auto space-y-1 text-slate-700">
                <div>• Instructor: <strong>{instructor.name}</strong></div>
                <div>• Registered Mobile: <strong>{instructor.phone}</strong></div>
                <div>• Payment Mobile: <strong>{paymentMobile}</strong></div>
                <div>• Amount: <strong>₹{feeAmount}</strong></div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : step === 'qr' ? (
            /* STEP 1: QR CODE & PAYMENT DETAILS */
            <div className="space-y-5">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Payment Instructions:</strong> Scan the QR code below and pay exactly <strong>₹{feeAmount}</strong>.
                  Your registered mobile number (<strong>{instructor.phone}</strong>) is included in the payment note.
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
                      title="Save QR Code"
                    >
                      <span>📥 Download QR Code</span>
                    </a>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                      Super Admin UPI ID
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-slate-900 text-xs truncate mr-1">
                        {upiId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors shrink-0 cursor-pointer"
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
                      <span>Amount:</span>
                      <strong className="text-base text-emerald-700 font-black">₹{feeAmount}.00</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Payee:</span>
                      <span className="font-medium text-slate-900">{payeeName}</span>
                    </div>
                  </div>

                  {/* Direct Mobile UPI Link Button */}
                  <a
                    href={upiDeepLink}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors text-xs shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Pay Directly via UPI App</span>
                  </a>

                  <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                    ℹ️ After payment is complete, take a <strong>screenshot</strong> of the receipt and note the <strong>12-digit UTR</strong> number to upload in Step 2.
                  </div>
                </div>
              </div>

              {/* Navigation to Step 2 */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#346739] hover:bg-[#2b552f] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <span>Already paid? Upload Screenshot &amp; UTR</span>
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
                    Payment Screenshot <span className="text-rose-600">*</span>
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
                          {screenshotFileName || 'Screenshot selected'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                        <span className="text-xs font-bold text-slate-700 block">
                          Choose Screenshot File
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          PNG, JPG, JPEG (Max 5 MB)
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
                      UPI Reference / UTR Number (12 digits) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 412345678901 or UPI Ref ID"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#346739] focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400">
                      12-digit UTR number shown on Google Pay, PhonePe, or Paytm receipt
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Payer Mobile Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={paymentMobile}
                        onChange={(e) => setPaymentMobile(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#346739] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                    <div>• Amount Paid: <strong className="text-slate-900">₹{feeAmount}</strong></div>
                    <div>• Instructor: <strong className="text-slate-900">{instructor.name}</strong></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('qr')}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  ← Back to QR Code
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-[#346739] hover:bg-[#2b552f] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit for Verification</span>
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
