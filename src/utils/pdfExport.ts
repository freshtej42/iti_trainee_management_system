import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface ExportPdfOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  unit?: 'mm';
  format?: 'a4';
  scale?: number;
  onProgress?: (message: string) => void;
}

/**
 * Sanitize cloned document before canvas rasterization:
 * Ensures any oklch() or modern color functions are safely normalized
 * to rgb/rgba/hex, preventing any parser exceptions.
 */
function sanitizeClonedDocument(clonedDoc: Document) {
  try {
    const allElements = clonedDoc.querySelectorAll('*');
    allElements.forEach((node) => {
      const el = node as HTMLElement;
      if (!el.style) return;
      // If any inline style contains oklch, clear or normalize it
      ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'boxShadow'].forEach((prop) => {
        const val = (el.style as any)[prop];
        if (typeof val === 'string' && val.includes('oklch')) {
          (el.style as any)[prop] = '';
        }
      });
    });
  } catch (err) {
    // Non-fatal sanitization warning
    console.warn('Canvas clone sanitization notice:', err);
  }
}

/**
 * Capture an HTMLElement and export it directly as an A4 PDF document
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions = {}
): Promise<void> {
  const {
    filename = 'document.pdf',
    orientation = 'portrait',
    scale = 2.2, // High resolution for crisp Gujarati/Devanagari text
    onProgress,
  } = options;

  try {
    onProgress?.('Preparing document for PDF export...');

    // A4 dimensions in mm
    const a4WidthMm = orientation === 'portrait' ? 210 : 297;
    const a4HeightMm = orientation === 'portrait' ? 297 : 210;

    // High resolution canvas capture with html2canvas-pro (oklch supported)
    onProgress?.('Rendering high-resolution A4 canvas...');
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth || 794,
      onclone: (clonedDoc) => {
        sanitizeClonedDocument(clonedDoc);
      },
    });

    onProgress?.('Generating A4 PDF pages...');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    // Calculate image dimensions on the A4 page
    const imgWidth = a4WidthMm;
    const imgHeight = (canvas.height * a4WidthMm) / canvas.width;

    // If document fits within 1 page (or with minor padding allowance)
    if (imgHeight <= a4HeightMm + 2) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, a4HeightMm), undefined, 'FAST');
    } else {
      // Multi-page slicing
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= a4HeightMm;

      // Subsequent pages
      while (heightLeft > 0) {
        position = position - a4HeightMm;
        pdf.addPage('a4', orientation);
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= a4HeightMm;
      }
    }

    onProgress?.('Downloading PDF...');
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(finalFilename);
    onProgress?.('Done!');
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}

/**
 * Capture an array of individual HTML elements (such as multiple trainee notices)
 * and bundle them into a single multi-page A4 PDF (1 element = 1 A4 page).
 */
export async function exportBatchElementsToPdf(
  elements: HTMLElement[],
  options: ExportPdfOptions & { onPageProgress?: (current: number, total: number) => void } = {}
): Promise<void> {
  const {
    filename = 'batch_documents.pdf',
    orientation = 'portrait',
    scale = 2.0,
    onProgress,
    onPageProgress,
  } = options;

  if (elements.length === 0) {
    throw new Error('No elements provided for PDF export');
  }

  try {
    const a4WidthMm = orientation === 'portrait' ? 210 : 297;
    const a4HeightMm = orientation === 'portrait' ? 297 : 210;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      onProgress?.(`Processing page ${i + 1} of ${elements.length}...`);
      onPageProgress?.(i + 1, elements.length);

      const canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          sanitizeClonedDocument(clonedDoc);
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.94);
      const imgWidth = a4WidthMm;
      const imgHeight = Math.min((canvas.height * a4WidthMm) / canvas.width, a4HeightMm);

      if (i > 0) {
        pdf.addPage('a4', orientation);
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    }

    onProgress?.('Saving multi-page PDF...');
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(finalFilename);
    onProgress?.('Done!');
  } catch (error) {
    console.error('Batch PDF generation error:', error);
    throw error;
  }
}

/**
 * Reliable Print Function that works inside iframes:
 * Extracts clean HTML with all Google fonts and CSS stylesheets into an isolated printing container
 */
export function printCleanDocument(
  element: HTMLElement,
  options: { title?: string; orientation?: 'portrait' | 'landscape' } = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    const { title = 'ITI Official Document', orientation = 'portrait' } = options;

    try {
      // Create hidden iframe for isolated clean printing
      const iframe = document.createElement('iframe');
      iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;');
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        // Fallback to window.print if iframe document is not accessible
        window.print();
        resolve(true);
        return;
      }

      // Collect all stylesheets and font links from parent document
      const stylesAndLinks = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((node) => node.outerHTML)
        .join('\n');

      const isLandscape = orientation === 'landscape';

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="gu">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Anek+Gujarati:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&family=Noto+Serif+Gujarati:wght@400;600;700&display=swap" rel="stylesheet">
          ${stylesAndLinks}
          <style>
            @page {
              size: A4 ${isLandscape ? 'landscape' : 'portrait'};
              margin: 10mm 10mm 10mm 10mm;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff !important;
              color: #000000 !important;
              font-family: 'Noto Sans Gujarati', 'Noto Sans Devanagari', -apple-system, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            * {
              box-sizing: border-box;
            }
            .print-container {
              width: 100%;
              max-width: ${isLandscape ? '297mm' : '210mm'};
              margin: 0 auto;
              background: #fff;
            }
            .no-print {
              display: none !important;
            }
            table {
              border-collapse: collapse !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${element.outerHTML}
          </div>
        </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for fonts and styles to resolve before triggering print
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          // Clean up after print dialog closes
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            resolve(true);
          }, 1000);
        } catch (printErr) {
          console.warn('Iframe print failed, falling back to standard print:', printErr);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          window.print();
          resolve(true);
        }
      }, 500);
    } catch (err) {
      console.error('Error creating print frame:', err);
      window.print();
      resolve(false);
    }
  });
}
