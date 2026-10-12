import React, { useMemo } from 'react';

interface UpiQrCodeProps {
  upiId: string;
  payeeName: string;
  amount: number;
  note?: string;
  size?: number;
  qrImageUrl?: string; // QR code image uploaded/added by admin
  isAdminUploaded?: boolean;
}

/**
 * High-fidelity QR Code component for UPI payments.
 * Supports:
 * 1. Admin-added / uploaded official QR Code image (PhonePe/Google Pay/Paytm/Bank QR)
 * 2. Fallback to dynamically generated UPI QR code from VPA and amount
 */
export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  upiId,
  payeeName,
  amount,
  note = 'ITI Account Verification Fee',
  size = 200,
  qrImageUrl: customQrImageUrl,
  isAdminUploaded,
}) => {
  // Generate standard UPI URI fallback:
  // upi://pay?pa={upiId}&pn={payeeName}&am={amount}&cu=INR&tn={note}
  const upiUri = useMemo(() => {
    const encodedUpiId = encodeURIComponent(upiId.trim());
    const encodedPayeeName = encodeURIComponent(payeeName.trim());
    const encodedNote = encodeURIComponent(note.trim());
    return `upi://pay?pa=${encodedUpiId}&pn=${encodedPayeeName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}`;
  }, [upiId, payeeName, amount, note]);

  // QR Code render URL using reliable qrserver fallback if no custom image
  const fallbackQrUrl = useMemo(() => {
    const encodedUri = encodeURIComponent(upiUri);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUri}&margin=2&qzone=1`;
  }, [upiUri, size]);

  const activeQrSrc = customQrImageUrl || fallbackQrUrl;
  const isCustom = Boolean(customQrImageUrl) || Boolean(isAdminUploaded);

  return (
    <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-sm relative">
      {/* Official Admin QR Badge */}
      <div className="mb-2 text-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          {isCustom ? 'એડમિન અધિકૃત પેમેન્ટ QR કોડ (Admin Added QR)' : 'અધિકૃત UPI પેમેન્ટ QR કોડ'}
        </span>
      </div>

      <div
        className="relative flex items-center justify-center bg-white p-2 rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
        style={{ width: size + 20, height: size + 20 }}
      >
        <img
          src={activeQrSrc}
          alt={`UPI QR Code for ₹${amount} to ${payeeName}`}
          className="max-h-full max-w-full rounded-lg object-contain"
          loading="eager"
        />

        {/* Center amount badge if dynamic QR */}
        {!customQrImageUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 px-2 py-0.5 rounded shadow-xs border border-slate-200 text-[10px] font-black text-slate-800 tracking-tight uppercase">
              ₹{amount}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-center text-xs font-mono font-bold text-slate-800 select-all">
        {upiId}
      </div>
      <div className="text-[11px] text-slate-600 font-medium text-center mt-0.5">
        (GPay / PhonePe / Paytm / BHIM UPI થી સ્કેન કરી <strong>₹{amount}</strong> ચૂકવો)
      </div>
    </div>
  );
};
