import { jsPDF } from 'jspdf';
import type { AppCalibration, VoucherFormState } from '../types';
import {
  amountToIndianCurrencyWords,
  formatAmountDisplay,
  formatDateDDMMYYYY,
} from './formatters';

const INDIA_POST_LOGO_URL =
  'https://static.cdnlogo.com/logos/i/46/india-post_thumb.png';

function buildFallbackLogoSvg(monochrome: boolean): string {
  const red = monochrome ? '#111111' : '#D71920';
  const yellow = monochrome ? '#FFFFFF' : '#FFCC00';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="350" viewBox="0 0 220 175">
    <rect width="220" height="175" fill="#FFFFFF"/>
    <text x="32" y="28" font-family="Times New Roman, serif" font-size="21" font-weight="bold" fill="${red}">भारतीय डाक</text>
    <text x="33" y="45" font-family="Times New Roman, serif" font-size="12.5" font-weight="bold" fill="${red}">डाक सेवा-जन सेवा</text>
    <rect x="32" y="54" width="136" height="74" fill="${red}"/>
    <path d="M2 78 Q 48 66, 74 96 T 142 86 Q 178 60, 218 38 Q 176 68, 140 96 T 68 106 Q 42 80, 2 78 Z" fill="${yellow}"/>
    <path d="M24 72 Q 56 66, 78 90 T 142 80 Q 174 56, 204 38 Q 170 64, 138 88 T 72 98 Q 50 76, 24 72 Z" fill="${yellow}"/>
    <path d="M44 68 Q 66 66, 84 85 T 140 74 Q 168 54, 188 40 Q 162 60, 136 80 T 78 90 Q 60 72, 44 68 Z" fill="${yellow}"/>
    <text x="86" y="148" font-family="Times New Roman, serif" font-size="21" font-weight="bold" fill="${red}">India Post</text>
    <text x="86" y="164" font-family="Times New Roman, serif" font-size="11.5" font-weight="bold" fill="${red}">Dak Sewa-Jan Sewa</text>
  </svg>`;
}

function renderSvgToPngDataUrl(svgMarkup: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const svgBlob = new Blob([svgMarkup], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 440;
          canvas.height = 350;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(null);
            return;
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        } catch {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

async function getIndiaPostLogoPngDataUrl(
  monochrome = true
): Promise<string | null> {
  // Attempt to load the official thumbnail with CORS; fall back cleanly to crisp SVG rendering
  const externalAttempt = await new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => resolve(null), 1500);

    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 300;
        canvas.height = img.naturalHeight || 220;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (monochrome) {
          ctx.filter = 'grayscale(100%) contrast(155%)';
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = INDIA_POST_LOGO_URL;
  });

  if (externalAttempt) return externalAttempt;
  return renderSvgToPngDataUrl(buildFallbackLogoSvg(monochrome));
}

function getSafeFilenameStem(receiptNo: string): string {
  const cleaned = (receiptNo || 'voucher').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  return `ACG17_Voucher_${cleaned || 'voucher'}`;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function generateAcg17Pdf(
  form: VoucherFormState,
  calibration: AppCalibration
): Promise<{ blob: Blob; file: File; filename: string }> {
  const isA5 = calibration.paperSize === 'a5';
  const isOverlay = calibration.printMode === 'overlay';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isA5 ? 'a5' : 'a4',
    compress: true,
  });

  const pageW = isA5 ? 148 : 210;
  const pageH = isA5 ? 210 : 297;
  const scaleFactor = isA5 ? 0.72 : 1;

  const ox = calibration.x || 0;
  const oy = calibration.y || 0;
  const mX = (isA5 ? 10 : 15) + ox;
  const mTop = (isA5 ? 9 : 13) + oy;
  const contentW = pageW - (isA5 ? 20 : 30);
  const centerX = mX + contentW / 2;
  const rightX = mX + contentW;

  const parsedAmt = parseFloat(form.amount);
  const hasAmount =
    form.amount !== '' && !Number.isNaN(parsedAmt) && parsedAmt > 0;
  const formattedAmt = hasAmount ? formatAmountDisplay(parsedAmt) : '';
  const amountWords = hasAmount ? amountToIndianCurrencyWords(parsedAmt) : '';
  const dateFormatted = formatDateDDMMYYYY(form.dateISO);
  const receiptNo = form.receiptNo.trim();
  const receivedFrom = form.receivedFrom.trim();
  const onAccountOf = form.onAccountOf.trim();

  const pt = (a4Pt: number) => Math.max(7.5, Number((a4Pt * scaleFactor).toFixed(1)));
  const mm = (a4Mm: number) => a4Mm * scaleFactor;

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  // 1. TOP-LEFT: A.C.G.- 17 & Elevated India Post Logo
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.setFontSize(pt(10.5));
    doc.text('A.C.G.- 17', mX, mTop + mm(4));

    const logoDataUrl = await getIndiaPostLogoPngDataUrl(true);
    if (logoDataUrl) {
      try {
        doc.addImage(
          logoDataUrl,
          'PNG',
          mX,
          mTop + mm(5.5),
          mm(24),
          mm(16.5),
          undefined,
          'FAST'
        );
      } catch {
        // Skip logo if image encoding fails
      }
    }
  }

  // 2. TOP-CENTER: Please Pay Rs. & Amount in Words
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(pt(13));
  const pleasePayPrefix = isOverlay ? '' : 'Please Pay Rs.  ';
  const pleasePayLine = `${pleasePayPrefix}${formattedAmt}`.trim();
  if (pleasePayLine) {
    doc.text(pleasePayLine, centerX, mTop + mm(4.5), { align: 'center' });
  }

  if (amountWords) {
    const wordsLines = doc.splitTextToSize(amountWords, contentW - mm(54));
    doc.text(wordsLines, centerX, mTop + mm(10.5), { align: 'center' });
  }

  // 3. DEPARTMENT HEADER & STATUTORY SUBTITLE (Cleanly below elevated logo)
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.setFontSize(pt(16));
    doc.text('DEPARTMENT OF POSTS - INDIA', centerX, mTop + mm(21.5), {
      align: 'center',
    });

    doc.setFontSize(pt(11.8));
    doc.text(
      '(See Note below Rules 6 (b) of Appendix II to Posts and Telegraphs Financial Handbook Volume I)',
      centerX,
      mTop + mm(27.5),
      { align: 'center', maxWidth: contentW }
    );
    doc.text('2nd Edition 2nd Reprinting)', centerX, mTop + mm(33), {
      align: 'center',
    });

    doc.setFontSize(pt(13.5));
    doc.text('/Receipt', centerX, mTop + mm(39), { align: 'center' });
  }

  // 4. VOUCHER DATA FIELDS
  let y = mTop + mm(49);
  doc.setFontSize(pt(12));

  // Row 1: The <Date> & Voucher No <No>
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.text('The', mX, y);
    doc.text('Voucher No', mX + contentW * 0.48, y);
  }
  doc.setFont('times', 'bolditalic');
  if (dateFormatted) doc.text(dateFormatted, mX + mm(18), y);
  if (receiptNo) doc.text(receiptNo, mX + contentW * 0.48 + mm(28), y);

  // Row 2: Received from
  y += mm(9);
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.text('Received from', mX, y);
  }
  doc.setFont('times', 'bolditalic');
  if (receivedFrom) {
    const fromLines = doc.splitTextToSize(receivedFrom, contentW - mm(36));
    doc.text(fromLines, mX + mm(35), y);
    if (fromLines.length > 1) {
      y += (fromLines.length - 1) * mm(5);
    }
  }

  // Row 3: The Sum of Rupees
  y += mm(9);
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.text('The Sum of Rupees', mX, y);
  }
  doc.setFont('times', 'bolditalic');
  if (amountWords) {
    const sumLines = doc.splitTextToSize(amountWords, contentW - mm(39));
    doc.text(sumLines, mX + mm(38), y);
    if (sumLines.length > 1) {
      y += (sumLines.length - 1) * mm(5);
    }
  }

  // Row 4: On Account of
  y += mm(9);
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.text('On Account of', mX, y);
  }
  y += mm(6.5);
  doc.setFont('times', 'bolditalic');
  if (onAccountOf) {
    const acctLines = doc.splitTextToSize(onAccountOf, contentW - mm(24));
    doc.text(acctLines, mX + mm(24), y);
    y += Math.max(1, acctLines.length) * mm(5.5);
  } else {
    y += mm(6);
  }

  // Row 5: /Rs. <Amount>
  y = Math.max(y + mm(10), mTop + mm(102));
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.text('/Rs.', mX, y);
  }
  doc.setFont('times', 'bolditalic');
  if (formattedAmt) doc.text(formattedAmt, mX + mm(18), y);

  // 5. MIDDLE SECTION: Witnessed Payment, Rev Stamp (text only, no box), Signatures & Notes
  let midY = Math.max(y + mm(17), mTop + mm(121));
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.setFontSize(pt(11.8));
    doc.text('Witnessed Payment', mX, midY);

    // Bold italic "Rev Stamp" text directly above Signature of Payee (matching reference)
    doc.setFont('times', 'bolditalic');
    doc.text('Rev Stamp', rightX - mm(22), midY + mm(2.5), { align: 'right' });

    const sigY = midY + mm(15);
    doc.setFont('times', 'bold');
    doc.text('Signature of Witness', mX + mm(6), sigY);
    doc.text('Signature of Payee', rightX - mm(12), sigY, { align: 'right' });

    // Thick black underline beneath Signature row
    doc.setLineWidth(0.55);
    doc.line(mX, sigY + mm(1.5), rightX, sigY + mm(1.5));

    // Statutory notes & rules
    let noteY = sigY + mm(6);
    doc.setFont('times', 'bold');
    doc.setFontSize(pt(10.8));
    doc.setLineWidth(0.25);

    const note1 =
      'Note :- If the receipt be not written or not signed in English/Hindi the whole of the portion not in English/Hindi must be translated by the Paying Officer. A person signing such receipt in Hindi should be required to indicate his full name in block letters within brackets below his signature.';
    const note1Lines = doc.splitTextToSize(note1, contentW);
    doc.text(note1Lines, mX, noteY);
    noteY += note1Lines.length * mm(4.7) + mm(1.2);
    doc.line(mX, noteY - mm(2), rightX, noteY - mm(2));

    const note2 =
      'If the person paid cannot sign, the payment must be certified by the paying officer and atleast one witness.';
    const note2Lines = doc.splitTextToSize(note2, contentW);
    doc.text(note2Lines, mX, noteY + mm(2));
    noteY += note2Lines.length * mm(4.7) + mm(3);
    doc.line(mX, noteY - mm(1.8), rightX, noteY - mm(1.8));

    const note3 =
      'If the amount be paid more than Rs. 5000/- a Receipt Stamp of 1/- must be affixed and this stamp must be paid for by the person to whom the amount of receipt is paid.';
    const note3Lines = doc.splitTextToSize(note3, contentW);
    doc.text(note3Lines, mX, noteY + mm(2));
    noteY += note3Lines.length * mm(4.7) + mm(3);
    doc.line(mX, noteY - mm(1.8), rightX, noteY - mm(1.8));

    const cert1 =
      '1. Certified that the amount included in the voucher has been disbursed to the proper person.';
    const cert1Lines = doc.splitTextToSize(cert1, contentW);
    doc.text(cert1Lines, mX, noteY + mm(2.5));
    midY = noteY + cert1Lines.length * mm(4.7) + mm(4);
  }

  // 6. LOWER SECTION: Officer Signatures, Certificate 2 & Bottom Date
  const bottomY = pageH - (isA5 ? 11 : 16) + oy;
  const cert2Text =
    '2. Received contents and certified that I have satisfied myself that all advances included in receipt form A.C.G. 17 drawn 1 month / 2 months / 3 months previous to this date with the exception of those detailed below (of which the total has been refunded from this receipt) has been disbursed to the proper persons and that their acceptances have been taken & filed in my office with receipt stamps duly cancelled for every payment in excess of Rs. 5000/-';

  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.setFontSize(pt(10.8));
    const cert2Lines = doc.splitTextToSize(cert2Text, contentW);
    const cert2Height = cert2Lines.length * mm(4.7);
    const cert2StartY = bottomY - mm(14) - cert2Height;

    // Right-aligned Officer Signatures cleanly spaced above Certificate 2
    doc.setFontSize(pt(12));
    const officer3Y = cert2StartY - mm(5);
    const officer2Y = officer3Y - mm(16);
    const officer1Y = Math.max(midY + mm(6), officer2Y - mm(14));

    doc.text('Paying Officer', rightX, officer1Y, { align: 'right' });
    doc.text('Counter Signed', rightX, officer2Y, { align: 'right' });
    doc.text('Disbursing Officer', rightX, officer3Y, { align: 'right' });

    // Certificate 2
    doc.setFontSize(pt(10.8));
    doc.text(cert2Lines, mX, cert2StartY);

    // Bottom Date & Disbursing Officer
    doc.setFontSize(pt(12));
    doc.text('Date:', mX, bottomY - mm(2));
    doc.text('Disbursing Officer', rightX, bottomY, { align: 'right' });
  }

  // Dynamic Bottom Date value (prints in both Full and Overlay modes)
  doc.setFont('times', 'bold');
  doc.setFontSize(pt(12));
  if (dateFormatted) {
    doc.text(dateFormatted, mX + mm(16), bottomY - mm(2));
  }

  const filename = `${getSafeFilenameStem(receiptNo)}.pdf`;
  const blob = doc.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });
  return { blob, file, filename };
}

export async function downloadAcg17Pdf(
  form: VoucherFormState,
  calibration: AppCalibration
): Promise<string> {
  const { blob, filename } = await generateAcg17Pdf(form, calibration);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

export async function downloadAcg17Doc(
  form: VoucherFormState,
  calibration: AppCalibration
): Promise<string> {
  const isA5 = calibration.paperSize === 'a5';
  const isOverlay = calibration.printMode === 'overlay';

  const parsedAmt = parseFloat(form.amount);
  const hasAmount =
    form.amount !== '' && !Number.isNaN(parsedAmt) && parsedAmt > 0;
  const formattedAmt = hasAmount ? formatAmountDisplay(parsedAmt) : '';
  const amountWords = hasAmount ? amountToIndianCurrencyWords(parsedAmt) : '';
  const dateFormatted = formatDateDDMMYYYY(form.dateISO);
  const receiptNo = form.receiptNo.trim();
  const receivedFrom = form.receivedFrom.trim();
  const onAccountOf = form.onAccountOf.trim();

  const logoDataUrl = isOverlay ? null : await getIndiaPostLogoPngDataUrl(false);

  const pageSizeCss = isA5 ? '148mm 210mm' : '210mm 297mm';
  const pageMarginCss = isA5 ? '9mm 10mm 10mm 10mm' : '13mm 15mm 14mm 15mm';
  const baseFont = isA5 ? '10pt' : '12pt';
  const noteFont = isA5 ? '8.5pt' : '10.5pt';
  const titleFont = isA5 ? '13pt' : '16pt';
  const payFont = isA5 ? '10.5pt' : '13pt';
  const logoWidth = isA5 ? '70' : '92';

  const hiddenStyle = isOverlay ? 'color:#FFFFFF;' : 'color:#000000;';
  const border2 = isOverlay ? 'none' : '2pt solid #000000';
  const border1 = isOverlay ? 'none' : '1pt solid #000000';

  const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>Form A.C.G.- 17 Voucher ${escapeHtml(receiptNo)}</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page Section1 {
    size: ${pageSizeCss};
    margin: ${pageMarginCss};
    mso-header-margin: 0mm;
    mso-footer-margin: 0mm;
  }
  div.Section1 {
    page: Section1;
    font-family: "Times New Roman", Times, serif;
    color: #000000;
  }
  p, td, div {
    font-family: "Times New Roman", Times, serif;
    margin: 0;
  }
  .dyn {
    font-weight: bold;
    font-style: italic;
    color: #000000;
  }
</style>
</head>
<body>
<div class="Section1">

  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
    <tr>
      <td width="19%" valign="top" style="text-align:left;">
        <div style="font-size:${isA5 ? '9pt' : '10.5pt'}; font-weight:bold; ${hiddenStyle}">A.C.G.- 17</div>
        ${
          logoDataUrl
            ? `<div style="margin-top:4pt;"><img src="${logoDataUrl}" width="${logoWidth}" alt="India Post" style="display:block;" /></div>`
            : ''
        }
      </td>
      <td width="62%" valign="top" style="text-align:center;">
        <div style="font-size:${payFont}; font-weight:bold; font-style:italic; line-height:1.25;">
          <span style="${hiddenStyle}">Please Pay Rs. &nbsp;</span><span class="dyn">${escapeHtml(formattedAmt)}</span>
        </div>
        <div class="dyn" style="font-size:${payFont}; line-height:1.25; min-height:16pt;">${escapeHtml(amountWords)}</div>
        <div style="font-size:${titleFont}; font-weight:bold; margin-top:8pt; ${hiddenStyle}">DEPARTMENT OF POSTS - INDIA</div>
      </td>
      <td width="19%">&nbsp;</td>
    </tr>
  </table>

  <div style="text-align:center; margin-top:4pt; ${hiddenStyle}">
    <div style="font-size:${baseFont}; font-weight:bold;">(See Note below Rules 6 (b) of Appendix II to Posts and Telegraphs Financial Handbook Volume I)</div>
    <div style="font-size:${baseFont}; font-weight:bold;">2nd Edition 2nd Reprinting)</div>
    <div style="font-size:${isA5 ? '11pt' : '13.5pt'}; font-weight:bold; margin-top:2pt;">/Receipt</div>
  </div>

  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:14pt; font-size:${baseFont}; border-collapse:collapse;">
    <tr>
      <td width="48%" style="padding:4pt 0;">
        <span style="font-weight:bold; ${hiddenStyle}">The</span>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span class="dyn">${escapeHtml(dateFormatted)}</span>
      </td>
      <td width="52%" style="padding:4pt 0;">
        <span style="font-weight:bold; ${hiddenStyle}">Voucher No</span>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span class="dyn">${escapeHtml(receiptNo)}</span>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding:6pt 0;">
        <span style="font-weight:bold; ${hiddenStyle}">Received from</span>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span class="dyn">${escapeHtml(receivedFrom)}</span>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding:6pt 0;">
        <span style="font-weight:bold; ${hiddenStyle}">The Sum of Rupees</span>
        &nbsp;&nbsp;
        <span class="dyn">${escapeHtml(amountWords)}</span>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding:6pt 0 2pt 0; font-weight:bold; ${hiddenStyle}">On Account of</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:2pt 0 6pt 56pt;" class="dyn">${escapeHtml(onAccountOf).replace(/\n/g, '<br/>')}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:22pt 0 16pt 0;">
        <span style="font-weight:bold; ${hiddenStyle}">/Rs.</span>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span class="dyn">${escapeHtml(formattedAmt)}</span>
      </td>
    </tr>
  </table>

  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:10pt; font-size:${baseFont}; border-collapse:collapse;">
    <tr>
      <td width="50%" valign="top" style="font-weight:bold; ${hiddenStyle}">Witnessed Payment</td>
      <td width="50%" valign="bottom" style="text-align:right; padding-right:54pt; padding-top:6pt; font-weight:bold; font-style:italic; ${hiddenStyle}">Rev Stamp</td>
    </tr>
    <tr>
      <td style="padding-top:24pt; padding-left:18pt; padding-bottom:2pt; font-weight:bold; border-bottom:${border2}; ${hiddenStyle}">Signature of Witness</td>
      <td style="padding-top:24pt; padding-right:34pt; padding-bottom:2pt; text-align:right; font-weight:bold; border-bottom:${border2}; ${hiddenStyle}">Signature of Payee</td>
    </tr>
  </table>

  <div style="font-size:${noteFont}; font-weight:bold; line-height:1.3; text-align:justify; ${hiddenStyle}">
    <div style="padding:4pt 0; border-bottom:${border1};">
      Note :- If the receipt be not written or not signed in English/Hindi the whole of the portion not in English/Hindi must be translated by the Paying Officer. A person signing such receipt in Hindi should be required to indicate his full name in block letters within brackets below his signature.
    </div>
    <div style="padding:4pt 0; border-bottom:${border1};">
      If the person paid cannot sign, the payment must be certified by the paying officer and atleast one witness.
    </div>
    <div style="padding:4pt 0; border-bottom:${border1};">
      If the amount be paid more than Rs. 5000/- a Receipt Stamp of 1/- must be affixed and this stamp must be paid for by the person to whom the amount of receipt is paid.
    </div>
    <div style="padding-top:5pt;">
      1. Certified that the amount included in the voucher has been disbursed to the proper person.
    </div>
  </div>

  <div style="text-align:right; font-weight:bold; font-size:${baseFont}; margin-top:18pt; ${hiddenStyle}">
    <div>Paying Officer</div>
    <div style="margin-top:26pt;">Counter Signed</div>
    <div style="margin-top:34pt;">Disbursing Officer</div>
  </div>

  <div style="margin-top:10pt; font-size:${noteFont}; font-weight:bold; line-height:1.32; text-align:justify; ${hiddenStyle}">
    2. Received contents and certified that I have satisfied myself that all advances included in receipt form A.C.G. 17 drawn 1 month / 2 months / 3 months previous to this date with the exception of those detailed below (of which the total has been refunded from this receipt) has been disbursed to the proper persons and that their acceptances have been taken &amp; filed in my office with receipt stamps duly cancelled for every payment in excess of Rs. 5000/-
  </div>

  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:20pt; font-size:${baseFont}; border-collapse:collapse;">
    <tr>
      <td width="50%" valign="baseline">
        <span style="font-weight:bold; ${hiddenStyle}">Date:</span>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span style="font-weight:bold; color:#000000;">${escapeHtml(dateFormatted)}</span>
      </td>
      <td width="50%" valign="baseline" style="text-align:right; font-weight:bold; padding-top:6pt; ${hiddenStyle}">
        Disbursing Officer
      </td>
    </tr>
  </table>

</div>
</body>
</html>`;

  const filename = `${getSafeFilenameStem(receiptNo)}.doc`;
  const blob = new Blob(['\uFEFF' + wordHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

export function buildWhatsAppMessage(form: VoucherFormState): string {
  const parsedAmt = parseFloat(form.amount);
  const hasAmount =
    form.amount !== '' && !Number.isNaN(parsedAmt) && parsedAmt > 0;
  const formattedAmt = hasAmount ? formatAmountDisplay(parsedAmt) : '0';
  const amountWords = hasAmount ? amountToIndianCurrencyWords(parsedAmt) : '';
  const dateFormatted = formatDateDDMMYYYY(form.dateISO);

  const lines = [
    '*India Post — Form A.C.G.- 17 Voucher*',
    `Voucher No.: ${form.receiptNo.trim() || '-'}`,
    `Date: ${dateFormatted || '-'}`,
    `Received From: ${form.receivedFrom.trim() || '-'}`,
    `Amount: Rs. ${formattedAmt}${amountWords ? ` (${amountWords})` : ''}`,
    `On Account Of: ${form.onAccountOf.trim() || '-'}`,
    '',
    'Please find the attached Form A.C.G.- 17 PDF voucher.',
  ];

  return lines.join('\n');
}

export function buildWhatsAppUrl(phoneRaw: string, message: string): string {
  const digits = phoneRaw.replace(/\D/g, '');
  let normalizedPhone = digits;
  if (digits.length === 10) {
    normalizedPhone = `91${digits}`;
  }
  const encodedText = encodeURIComponent(message);
  if (normalizedPhone) {
    return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
