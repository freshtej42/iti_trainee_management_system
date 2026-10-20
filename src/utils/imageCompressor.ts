/**
 * Utility to compress images (screenshots, receipts) via HTML Canvas
 * Ensures image is crisp, readable for UPI receipts/UTRs, but small (< 150KB)
 * to prevent Firestore 1MB limits and LocalStorage 5MB quota errors.
 */
export function compressImageFile(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('કૃપા કરીને ફક્ત ફોટો/છબી ફાઇલ સિલેક્ટ કરો.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ફાઇલ વાંચવામાં નિષ્ફળતા.'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error('છબી ડેટા મળ્યો નથી.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('છબી લોડ કરવામાં ભૂલ આવી.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        // Fill white background for transparent PNG receipts
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * High-fidelity default sample UPI receipt SVG (for demo/testing pending verification)
 */
export const SAMPLE_UPI_RECEIPT_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760"><rect width="600" height="760" rx="24" fill="%23f8fafc"/><rect x="20" y="20" width="560" height="720" rx="20" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/><circle cx="300" cy="95" r="38" fill="%2316a34a"/><path d="M284 95 l11 11 l22 -22" stroke="%23ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="300" y="165" font-family="sans-serif" font-size="22" font-weight="bold" fill="%230f172a" text-anchor="middle">ચૂકવણી સફળ (Payment Successful)</text><text x="300" y="192" font-family="sans-serif" font-size="13" fill="%2364748b" text-anchor="middle">ITI Instructor Verification Portal</text><text x="300" y="255" font-family="sans-serif" font-size="44" font-weight="900" fill="%2315803d" text-anchor="middle">₹ 9.00</text><rect x="60" y="295" width="480" height="1" fill="%23e2e8f0"/><g transform="translate(60, 320)" font-family="sans-serif" font-size="14"><text x="0" y="25" fill="%2364748b">ચૂકવનાર (Sender)</text><text x="480" y="25" font-weight="bold" fill="%230f172a" text-anchor="end">Kalpesh M. Parmar</text><text x="0" y="65" fill="%2364748b">મેળવનાર UPI ID</text><text x="480" y="65" font-weight="bold" fill="%230f172a" text-anchor="end">itigujarat@upi</text><text x="0" y="105" fill="%2364748b">UPI Ref / UTR નંબર</text><text x="480" y="105" font-family="monospace" font-weight="bold" fill="%231e40af" text-anchor="end">428910482910</text><text x="0" y="145" fill="%2364748b">મોબાઈલ નંબર</text><text x="480" y="145" font-weight="bold" fill="%230f172a" text-anchor="end">9898123456</text><text x="0" y="185" fill="%2364748b">તારીખ અને સમય</text><text x="480" y="185" font-weight="bold" fill="%230f172a" text-anchor="end">આજે, 10:42 AM</text><text x="0" y="225" fill="%2364748b">ચુકવણી સ્થિતિ</text><text x="480" y="225" font-weight="bold" fill="%2316a34a" text-anchor="end">Completed (પૂર્ણ)</text></g><rect x="60" y="585" width="480" height="75" rx="12" fill="%23f0fdf4" stroke="%23bbf7d0" stroke-width="1.5"/><text x="80" y="618" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23166534">✓ UPI વ્યવહાર પુરાવો</text><text x="80" y="642" font-family="sans-serif" font-size="11" fill="%2315803d">ITI Trainee Attendance &amp; Notice Portal</text><text x="300" y="700" font-family="sans-serif" font-size="11" fill="%2394a3b8" text-anchor="middle">NPCI / BHIM UPI ઓટોમેટેડ રસીદ સ્લિપ</text></svg>`;

/**
 * Default UPI QR Code Standee SVG added by Super Admin for ₹9 payment
 */
export const DEFAULT_ADMIN_QR_IMAGE_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="620" viewBox="0 0 500 620"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%231e3a24"/><stop offset="50%25" stop-color="%23346739"/><stop offset="100%25" stop-color="%231e3a24"/></linearGradient></defs><rect width="500" height="620" rx="28" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="3"/><rect x="0" y="0" width="500" height="110" rx="28" fill="url(%23g)"/><rect x="0" y="80" width="500" height="30" fill="url(%23g)"/><text x="250" y="42" font-family="sans-serif" font-size="16" font-weight="900" fill="%23fef08a" text-anchor="middle" letter-spacing="0.5">ITI ATTENDANCE &amp; NOTICE PORTAL</text><text x="250" y="66" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23ffffff" text-anchor="middle">ITI તાલીમાર્થી હાજરી અને નોટિસ પોર્ટલ</text><text x="250" y="94" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23bbf7d0" text-anchor="middle">સુપર એડમિન પેમેન્ટ QR કોડ (Verification Payment QR)</text><rect x="60" y="130" width="380" height="380" rx="20" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><g transform="translate(100, 170)"><rect x="0" y="0" width="80" height="80" fill="%230f172a" rx="10"/><rect x="15" y="15" width="50" height="50" fill="%23ffffff" rx="6"/><rect x="25" y="25" width="30" height="30" fill="%230f172a" rx="3"/><rect x="220" y="0" width="80" height="80" fill="%230f172a" rx="10"/><rect x="235" y="15" width="50" height="50" fill="%23ffffff" rx="6"/><rect x="245" y="25" width="30" height="30" fill="%230f172a" rx="3"/><rect x="0" y="220" width="80" height="80" fill="%230f172a" rx="10"/><rect x="15" y="235" width="50" height="50" fill="%23ffffff" rx="6"/><rect x="25" y="245" width="30" height="30" fill="%230f172a" rx="3"/><rect x="100" y="20" width="100" height="20" fill="%230f172a"/><rect x="120" y="60" width="80" height="20" fill="%230f172a"/><rect x="20" y="100" width="260" height="20" fill="%230f172a"/><rect x="40" y="140" width="100" height="20" fill="%230f172a"/><rect x="160" y="140" width="120" height="20" fill="%230f172a"/><rect x="100" y="180" width="100" height="20" fill="%230f172a"/><rect x="100" y="240" width="80" height="30" fill="%230f172a"/><rect x="200" y="220" width="80" height="30" fill="%230f172a"/><rect x="220" y="270" width="70" height="20" fill="%230f172a"/><circle cx="150" cy="150" r="28" fill="%23346739"/><text x="150" y="156" font-family="sans-serif" font-size="16" font-weight="900" fill="%23ffffff" text-anchor="middle">₹9</text></g><rect x="60" y="475" width="380" height="25" fill="%230f172a" rx="6"/><text x="250" y="492" font-family="monospace" font-size="12" font-weight="bold" fill="%23ffffff" text-anchor="middle">UPI ID: tejassuthar21696@okhdfcbank</text><g transform="translate(60, 530)"><rect x="0" y="0" width="380" height="70" rx="14" fill="%23f0fdf4" stroke="%2386efac" stroke-width="1.5"/><text x="190" y="26" font-family="sans-serif" font-size="13" font-weight="900" fill="%23166534" text-anchor="middle">ખાતાધારક: Tejas Suthar (Super Admin)</text><text x="190" y="45" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2315803d" text-anchor="middle">GPay • PhonePe • Paytm • BHIM UPI માન્ય</text><text x="190" y="61" font-family="sans-serif" font-size="10" fill="%2316a34a" text-anchor="middle">સ્કેન કરી ₹9 ચૂકવો અને સ્ક્રીનશોટ મોકલો</text></g></svg>`;

