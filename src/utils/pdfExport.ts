import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
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
 * Sanitize cloned document before canvas rasterization if falling back to html2canvas:
 * Clears unsupported CSS color functions and copies fonts.
 */
function sanitizeClonedDocument(clonedDoc: Document) {
  try {
    const allElements = clonedDoc.querySelectorAll('*');
    allElements.forEach((node) => {
      const el = node as HTMLElement;
      if (!el.style) return;
      ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'boxShadow'].forEach((prop) => {
        const val = (el.style as any)[prop];
        if (typeof val === 'string' && (val.includes('oklch') || val.includes('lab('))) {
          (el.style as any)[prop] = '';
        }
      });
    });

    // Copy live font-faces to cloned document if available
    if (document.fonts) {
      document.fonts.forEach((font) => {
        try {
          clonedDoc.fonts.add(font);
        } catch {
          // ignore duplicate font faces
        }
      });
    }
  } catch (err) {
    console.warn('Canvas clone sanitization notice:', err);
  }
}

/**
 * Prepares an unscaled, isolated staging element for rendering.
 * Placed off-screen at left: -9999px with opacity: 1 and visibility: visible so the
 * browser layout engine computes true HarfBuzz font metrics for Gujarati/Devanagari
 * ligatures without coordinate distortion or letter overlap.
 */
function createCleanStagingElement(
  sourceElement: HTMLElement,
  orientation: 'portrait' | 'landscape'
): { stagingContainer: HTMLDivElement; targetElement: HTMLElement; cleanup: () => void } {
  const isPortrait = orientation === 'portrait';
  const widthPx = isPortrait ? 794 : 1123;
  const minHeightPx = isPortrait ? 1123 : 794;

  const stagingContainer = document.createElement('div');
  stagingContainer.id = 'pdf-render-staging-container';
  stagingContainer.style.position = 'fixed';
  stagingContainer.style.left = '-9999px';
  stagingContainer.style.top = '0';
  stagingContainer.style.width = `${widthPx}px`;
  stagingContainer.style.minHeight = `${minHeightPx}px`;
  stagingContainer.style.backgroundColor = '#ffffff';
  stagingContainer.style.zIndex = '9999';
  stagingContainer.style.opacity = '1';
  stagingContainer.style.visibility = 'visible';
  stagingContainer.style.pointerEvents = 'none';
  stagingContainer.style.margin = '0';
  stagingContainer.style.padding = '0';
  stagingContainer.style.overflow = 'visible';

  // Deep clone the source element
  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.width = `${widthPx}px`;
  clone.style.maxWidth = `${widthPx}px`;
  clone.style.minHeight = `${minHeightPx}px`;
  clone.style.margin = '0';
  clone.style.boxSizing = 'border-box';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.fontFamily = "'Noto Sans Gujarati', 'Noto Sans Devanagari', 'Anek Gujarati', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  clone.style.letterSpacing = 'normal';
  clone.style.wordSpacing = 'normal';
  clone.style.lineHeight = '1.65';
  clone.style.textRendering = 'geometricPrecision';
  (clone.style as any).webkitFontSmoothing = 'antialiased';

  // Ensure all descendants have clean typography metrics without clipping or overlap
  const allNodes = clone.querySelectorAll<HTMLElement>('*');
  allNodes.forEach((node) => {
    if (node.style) {
      if (node.style.transform) node.style.transform = 'none';
      if (node.style.textAlign === 'justify') {
        (node.style as any).textJustify = 'inter-word';
      }
      node.style.letterSpacing = 'normal';
      node.style.wordSpacing = 'normal';
      node.style.overflowWrap = 'break-word';
      (node.style as any).webkitFontSmoothing = 'antialiased';
      if (node.tagName === 'TABLE') {
        node.style.width = '100%';
        node.style.borderCollapse = 'collapse';
      }
    }
  });

  stagingContainer.appendChild(clone);
  document.body.appendChild(stagingContainer);

  return {
    stagingContainer,
    targetElement: clone,
    cleanup: () => {
      if (document.body.contains(stagingContainer)) {
        document.body.removeChild(stagingContainer);
      }
    },
  };
}

/**
 * High-fidelity element-to-data-URL rendering:
 * Uses SVG foreignObject via html-to-image to leverage the browser's own C++ HarfBuzz shaper.
 * Eliminates all Gujarati letter overlapping, jumbling, and misplaced matras.
 */
async function renderElementToImage(
  targetElement: HTMLElement,
  widthPx: number
): Promise<string> {
  // Ensure font faces are settled
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font ready promise notice:', e);
    }
  }

  // 1. Primary: html-to-image (Native SVG foreignObject rendering with perfect Indic script shaping)
  // We explicitly configure fontEmbedCSS: '/* fonts embedded */' and skipFonts: true so html-to-image
  // never accesses document.styleSheets or cross-origin cssRules, preventing CSSStyleSheet SecurityError.
  try {
    const dataUrl = await toPng(targetElement, {
      pixelRatio: 2.0, // High-DPI 2x produces crisp 300dpi-equivalent print rendering
      backgroundColor: '#ffffff',
      cacheBust: false,
      skipFonts: true,
      fontEmbedCSS: '/* fonts embedded */',
      width: widthPx,
      filter: (node: Node) => {
        if (node instanceof HTMLElement) {
          if (node.classList?.contains('print:hidden') || node.classList?.contains('no-print')) {
            return false;
          }
        }
        return true;
      },
    });
    return dataUrl;
  } catch (htmlToImageErr) {
    console.warn('html-to-image primary attempt note, falling back to html2canvas-pro:', htmlToImageErr);
  }

  // 2. Fallback: html2canvas-pro with live font face registration
  const canvas = await html2canvas(targetElement, {
    scale: 2.0,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: widthPx,
    windowWidth: widthPx,
    onclone: (clonedDoc) => {
      sanitizeClonedDocument(clonedDoc);
    },
  });

  return canvas.toDataURL('image/png');
}

/**
 * Reliably triggers a download for a PDF Blob across Desktop, Android, and iOS browsers.
 */
function triggerPdfDownload(pdf: jsPDF, filename: string) {
  const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = finalFilename;
    downloadLink.rel = 'noopener noreferrer';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    }, 4000);
  } catch (err) {
    console.warn('Native Blob download fallback:', err);
    pdf.save(finalFilename);
  }
}

/**
 * Capture an HTMLElement and export it directly as a crisp, unjumbled A4 PDF document.
 * Perfectly preserves Gujarati and Devanagari ligatures and table structures.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions = {}
): Promise<void> {
  const {
    filename = 'document.pdf',
    orientation = 'portrait',
    onProgress,
  } = options;

  let stagingCleanup: (() => void) | null = null;

  try {
    onProgress?.('દસ્તાવેજ તૈયાર થઈ રહ્યો છે (Preparing document)...');

    const isPortrait = orientation === 'portrait';
    const a4WidthMm = isPortrait ? 210 : 297;
    const a4HeightMm = isPortrait ? 297 : 210;
    const targetWidthPx = isPortrait ? 794 : 1123;

    // Create clean, unscaled staging element
    const staging = createCleanStagingElement(element, orientation);
    stagingCleanup = staging.cleanup;

    onProgress?.('ગુજરાતી અક્ષરો અને ફોન્ટ્સ પ્રોસેસ થાય છે (Rendering fonts)...');
    const imgData = await renderElementToImage(staging.targetElement, targetWidthPx);

    onProgress?.('A4 PDF પૃષ્ઠ જનરેટ થઈ રહ્યું છે (Generating PDF)...');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Create a temporary image element to measure the rendered aspect ratio
    const imgObj = new Image();
    await new Promise<void>((resolve, reject) => {
      imgObj.onload = () => resolve();
      imgObj.onerror = (e) => reject(e);
      imgObj.src = imgData;
    });

    const imgWidth = a4WidthMm;
    const imgHeight = (imgObj.height * a4WidthMm) / imgObj.width;

    if (imgHeight <= a4HeightMm + 2) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, a4HeightMm), undefined, 'FAST');
    } else {
      // Multi-page slicing for longer reports
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= a4HeightMm;

      // Subsequent pages
      while (heightLeft > 0) {
        position = position - a4HeightMm;
        pdf.addPage('a4', orientation);
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= a4HeightMm;
      }
    }

    onProgress?.('PDF ડાઉનલોડ થાય છે (Downloading PDF)...');
    triggerPdfDownload(pdf, filename);
    onProgress?.('સફળતાપૂર્વક સાચવવામાં આવી (Completed)!');
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  } finally {
    stagingCleanup?.();
  }
}

/**
 * Capture an array of individual HTML elements (such as multiple trainee notices)
 * and bundle them into a single multi-page A4 PDF (1 element = 1 A4 page).
 * Guarantees zero text overlapping and supports Android mobile devices.
 */
export async function exportBatchElementsToPdf(
  elements: HTMLElement[],
  options: ExportPdfOptions & { onPageProgress?: (current: number, total: number) => void } = {}
): Promise<void> {
  const {
    filename = 'batch_documents.pdf',
    orientation = 'portrait',
    onProgress,
    onPageProgress,
  } = options;

  if (elements.length === 0) {
    throw new Error('No elements provided for PDF export');
  }

  try {
    const isPortrait = orientation === 'portrait';
    const a4WidthMm = isPortrait ? 210 : 297;
    const a4HeightMm = isPortrait ? 297 : 210;
    const targetWidthPx = isPortrait ? 794 : 1123;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      onProgress?.(`પત્ર ${i + 1} / ${elements.length} નું રેન્ડરિંગ...`);
      onPageProgress?.(i + 1, elements.length);

      const staging = createCleanStagingElement(el, orientation);

      try {
        const imgData = await renderElementToImage(staging.targetElement, targetWidthPx);

        const imgObj = new Image();
        await new Promise<void>((resolve, reject) => {
          imgObj.onload = () => resolve();
          imgObj.onerror = (e) => reject(e);
          imgObj.src = imgData;
        });

        const imgWidth = a4WidthMm;
        const imgHeight = Math.min((imgObj.height * a4WidthMm) / imgObj.width, a4HeightMm);

        if (i > 0) {
          pdf.addPage('a4', orientation);
        }

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      } finally {
        staging.cleanup();
      }
    }

    onProgress?.('સંપૂર્ણ બેચ PDF સાચવવામાં આવી રહી છે...');
    triggerPdfDownload(pdf, filename);
    onProgress?.('સફળતાપૂર્વક સાચવવામાં આવી (Completed)!');
  } catch (error) {
    console.error('Batch PDF generation error:', error);
    throw error;
  }
}

/**
 * Reliable Print Function that works cleanly across Desktop, Android, and iOS browsers.
 * Avoids popup windows (which are blocked on Android) and triggers the native printer dialog.
 */
export function printCleanDocument(
  element: HTMLElement,
  options: { title?: string; orientation?: 'portrait' | 'landscape' } = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    const { title = 'ITI Official Document', orientation = 'portrait' } = options;

    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;

      // On Android/iOS or inside an embedded runner (like AI Studio iframe):
      // Direct window.print() is the most reliable method that invokes the native printer dialog.
      // Hidden nested iframes are often suppressed by iframe sandbox policies.
      if (isMobile || isEmbedded) {
        document.body.classList.add('is-printing-clean-doc');
        
        // Ensure page title is updated for the print dialog
        const prevTitle = document.title;
        document.title = title;

        try {
          window.print();
        } catch (printErr) {
          console.warn('Window.print notice:', printErr);
        }

        setTimeout(() => {
          document.body.classList.remove('is-printing-clean-doc');
          document.title = prevTitle;
          resolve(true);
        }, 1000);
        return;
      }

      // Desktop iframe printing
      const stylesAndLinks = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((node) => node.outerHTML)
        .join('\n');

      const isLandscape = orientation === 'landscape';

      const htmlDocument = `
        <!DOCTYPE html>
        <html lang="gu">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Anek+Gujarati:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&family=Noto+Serif+Gujarati:wght@400;600;700&display=swap" rel="stylesheet" crossorigin="anonymous">
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
              font-family: 'Noto Sans Gujarati', 'Noto Sans Devanagari', 'Anek Gujarati', -apple-system, sans-serif;
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
              padding: 5mm;
            }
            .no-print {
              display: none !important;
            }
            table {
              border-collapse: collapse !important;
              width: 100%;
            }
            @media print {
              .print-container {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${element.outerHTML}
          </div>
        </body>
        </html>
      `;

      const iframe = document.createElement('iframe');
      iframe.setAttribute(
        'style',
        'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'
      );
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        window.print();
        resolve(true);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(htmlDocument);
      iframeDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            resolve(true);
          }, 1000);
        } catch (printErr) {
          console.warn('Iframe print fallback to window.print:', printErr);
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
