import { jsPDF } from 'jspdf';
import type { AppCalibration, VoucherFormState } from '../types';
import {
  amountToIndianCurrencyWords,
  formatAmountDisplay,
  formatDateDDMMYYYY,
} from './formatters';

const INDIA_POST_MONO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="270" viewBox="0 0 220 135">
  <rect width="220" height="135" fill="#ffffff"/>
  <text x="26" y="24" font-family="serif" font-size="20" font-weight="bold" fill="#000000">भारतीय डाक</text>
  <rect x="26" y="31" width="138" height="72" fill="#000000"/>
  <path d="M2 56 Q 48 44, 74 74 T 142 64 Q 178 38, 218 18 Q 176 46, 140 74 T 68 84 Q 42 58, 2 56 Z" fill="#ffffff"/>
  <path d="M22 50 Q 56 44, 78 68 T 142 58 Q 174 34, 204 18 Q 170 42, 138 66 T 72 76 Q 50 54, 22 50 Z" fill="#ffffff"/>
  <path d="M42 46 Q 66 44, 84 63 T 140 52 Q 168 32, 188 20 Q 162 38, 136 58 T 78 68 Q 60 50, 42 46 Z" fill="#ffffff"/>
  <text x="108" y="123" font-family="Times New Roman, serif" font-size="18" font-weight="bold" fill="#000000">India Post</text>
</svg>`;

function renderLogoPngDataUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const svgBlob = new Blob([INDIA_POST_MONO_SVG], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 440;
          canvas.height = 270;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(null);
            return;
          }
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const png = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(png);
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

export function getVoucherPdfFilename(receiptNo: string): string {
  const safe = (receiptNo || 'voucher').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  return `ACG17_Voucher_${safe || 'voucher'}.pdf`;
}

export async function generateAcg17PdfDoc(
  form: VoucherFormState,
  calibration: AppCalibration
): Promise<jsPDF> {
  const isA5 = calibration.paperSize === 'a5';
  const isOverlay = calibration.printMode === 'overlay';
  const k = isA5 ? 148 / 210 : 1;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isA5 ? 'a5' : 'a4',
    compress: true,
  });

  const ox = calibration.x || 0;
  const oy = calibration.y || 0;

  const pageW = isA5 ? 148 : 210;
  const marginX = 15 * k;
  const contentW = pageW - marginX * 2;
  const centerX = pageW / 2 + ox;
  const leftX = marginX + ox;
  const rightX = pageW - marginX + ox;

  const sy = (yMm: number) => yMm * k + oy;
  const fs = (pt: number) => pt * k;

  const parsedAmt = parseFloat(form.amount);
  const hasAmount =
    form.amount !== '' && !Number.isNaN(parsedAmt) && parsedAmt > 0;
  const formattedAmt = hasAmount ? formatAmountDisplay(parsedAmt) : '';
  const amountWords = hasAmount ? amountToIndianCurrencyWords(parsedAmt) : '';
  const dateFormatted = formatDateDDMMYYYY(form.dateISO);
  const receiptNo = form.receiptNo.trim();
  const receivedFrom = form.receivedFrom.trim();
  const onAccountOf = form.onAccountOf.trim();

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  // 1. TOP HEADER: A.C.G.- 17 (left) & Please Pay Rs. (center)
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.setFontSize(fs(10.5));
    doc.text('A.C.G.- 17', leftX, sy(17));
  }

  // Please Pay Rs. <amount>
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(fs(13));
  const pleasePayLabel = isOverlay ? '' : 'Please Pay Rs.  ';
  const pleasePayFull = `${pleasePayLabel}${formattedAmt}`;
  if (pleasePayFull.trim()) {
    doc.text(pleasePayFull, centerX, sy(17), { align: 'center' });
  }

  // Amount in words under Please Pay
  if (amountWords) {
    const topWordLines = doc.splitTextToSize(amountWords, 118 * k);
    doc.text(topWordLines, centerX, sy(23), { align: 'center' });
  }

  // 2. ELEVATED INDIA POST LOGO (cleanly below A.C.G.- 17, above subtitle line)
  if (!isOverlay) {
    const logoPng = await renderLogoPngDataUrl();
    if (logoPng) {
      doc.addImage(logoPng, 'PNG', leftX, sy(19.5), 27 * k, 16.5 * k);
    }

    // Center Department Title & Statutory Subtitles
    doc.setFont('times', 'bold');
    doc.setFontSize(fs(16.5));
    doc.text('DEPARTMENT OF POSTS - INDIA', centerX, sy(36), {
      align: 'center',
    });

    doc.setFontSize(fs(11.5));
    doc.text(
      '(See Note below Rules 6 (b) of Appendix II to Posts and Telegraphs Financial Handbook Volume I)',
      centerX,
      sy(43),
      { align: 'center' }
    );
    doc.text('2nd Edition 2nd Reprinting)', centerX, sy(48.5), {
      align: 'center',
    });

    doc.setFontSize(fs(13.5));
    doc.text('/Receipt', centerX, sy(54.5), { align: 'center' });
  }

  // 3. VOUCHER DATA FIELDS
  doc.setFontSize(fs(12));

  // Row 1: The <Date> & Voucher No <No>
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.text('The', leftX, sy(65));
    doc.text('Voucher No', leftX + 86 * k, sy(65));
  }
  doc.setFont('times', 'bolditalic');
  if (dateFormatted) {
    doc.text(dateFormatted, leftX + 19 * k, sy(65));
  }
  if (receiptNo) {
    doc.text(receiptNo, leftX + 115 * k, sy(65));
  }

  // Row 2: Received from
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.text('Received from', leftX, sy(74));
  }
  if (receivedFrom) {
    doc.setFont('times', 'bolditalic');
    const fromLines = doc.splitTextToSize(receivedFrom, contentW - 36 * k);
    doc.text(fromLines, leftX + 36 * k, sy(74));
  }

  // Row 3: The Sum of Rupees
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.text('The Sum of Rupees', leftX, sy(83));
  }
  if (amountWords) {
    doc.setFont('times', 'bolditalic');
    const sumLines = doc.splitTextToSize(amountWords, contentW - 41 * k);
    doc.text(sumLines, leftX + 41 * k, sy(83));
  }

  // Row 4: On Account of
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.text('On Account of', leftX, sy(92));
  }
  if (onAccountOf) {
    doc.setFont('times', 'bolditalic');
    const acctLines = doc.splitTextToSize(onAccountOf, contentW - 24 * k);
    doc.text(acctLines, leftX + 24 * k, sy(98));
  }

  // Row 5: /Rs. <Amount>
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.text('/Rs.', leftX, sy(116));
  }
  if (formattedAmt) {
    doc.setFont('times', 'bolditalic');
    doc.text(formattedAmt, leftX + 19 * k, sy(116));
  }

  // 4. MIDDLE SECTION: Witnessed Payment, Rev Stamp (text only), Signature Line & Notes
  if (!isOverlay) {
    doc.setFont('times', 'bold');
    doc.setFontSize(fs(12));
    doc.text('Witnessed Payment', leftX, sy(133));

    // Exact Rev Stamp italic bold label positioned above Signature of Payee (no box)
    doc.setFont('times', 'bolditalic');
    doc.text('Rev Stamp', rightX - 24 * k, sy(136), { align: 'right' });

    // Signature labels + thick underline
    doc.setFont('times', 'bold');
    doc.text('Signature of Witness', leftX + 6 * k, sy(150));
    doc.text('Signature of Payee', rightX - 13 * k, sy(150), { align: 'right' });

    doc.setLineWidth(0.6 * k);
    doc.line(leftX, sy(152), rightX, sy(152));

    // Statutory notes with thin dividers
    doc.setFont('times', 'bold');
    doc.setFontSize(fs(10.8));
    doc.setLineWidth(0.28 * k);
    const lineStep = 4.6 * k;

    let noteY = sy(157);
    const note1 = doc.splitTextToSize(
      'Note :- If the receipt be not written or not signed in English/Hindi the whole of the portion not in English/Hindi must be translated by the Paying Officer. A person signing such receipt in Hindi should be required to indicate his full name in block letters within brackets below his signature.',
      contentW
    );
    doc.text(note1, leftX, noteY);
    noteY += note1.length * lineStep - 1.2 * k;
    doc.line(leftX, noteY, rightX, noteY);

    noteY += 4.6 * k;
    const note2 = doc.splitTextToSize(
      'If the person paid cannot sign, the payment must be certified by the paying officer and atleast one witness.',
      contentW
    );
    doc.text(note2, leftX, noteY);
    noteY += note2.length * lineStep - 1.2 * k;
    doc.line(leftX, noteY, rightX, noteY);

    noteY += 4.6 * k;
    const note3 = doc.splitTextToSize(
      'If the amount be paid more than Rs. 5000/- a Receipt Stamp of 1/- must be affixed and this stamp must be paid for by the person to whom the amount of receipt is paid.',
      contentW
    );
    doc.text(note3, leftX, noteY);
    noteY += note3.length * lineStep - 1.2 * k;
    doc.line(leftX, noteY, rightX, noteY);

    noteY += 4.8 * k;
    const cert1 = doc.splitTextToSize(
      '1. Certified that the amount included in the voucher has been disbursed to the proper person.',
      contentW
    );
    doc.text(cert1, leftX, noteY);

    // 5. LOWER SECTION: Officer Signatures & Certificate 2
    doc.setFont('times', 'bold');
    doc.setFontSize(fs(12));
    doc.text('Paying Officer', rightX, sy(206), { align: 'right' });
    doc.text('Counter Signed', rightX, sy(222), { align: 'right' });
    doc.text('Disbursing Officer', rightX, sy(240), { align: 'right' });

    doc.setFontSize(fs(10.8));
    const cert2 = doc.splitTextToSize(
      '2. Received contents and certified that I have satisfied myself that all advances included in receipt form A.C.G. 17 drawn 1 month / 2 months / 3 months previous to this date with the exception of those detailed below (of which the total has been refunded from this receipt) has been disbursed to the proper persons and that their acceptances have been taken & filed in my office with receipt stamps duly cancelled for every payment in excess of Rs. 5000/-',
      contentW
    );
    doc.text(cert2, leftX, sy(248));
  }

  // 6. BOTTOM DATE & DISBURSING OFFICER
  doc.setFont('times', 'bold');
  doc.setFontSize(fs(12));
  if (!isOverlay) {
    doc.text('Date:', leftX, sy(279));
    doc.text('Disbursing Officer', rightX, sy(281), { align: 'right' });
  }
  if (dateFormatted) {
    doc.text(dateFormatted, leftX + 18 * k, sy(279));
  }

  return doc;
}

export async function downloadAcg17Pdf(
  form: VoucherFormState,
  calibration: AppCalibration
): Promise<string> {
  const doc = await generateAcg17PdfDoc(form, calibration);
  const filename = getVoucherPdfFilename(form.receiptNo);
  doc.save(filename);
  return filename;
}

export async function createAcg17PdfFile(
  form: VoucherFormState,
  calibration: AppCalibration
): Promise<File> {
  const doc = await generateAcg17PdfDoc(form, calibration);
  const filename = getVoucherPdfFilename(form.receiptNo);
  const blob = doc.output('blob');
  return new File([blob], filename, { type: 'application/pdf' });
}

export function buildWhatsAppMessage(form: VoucherFormState): string {
  const parsedAmt = parseFloat(form.amount);
  const hasAmount =
    form.amount !== '' && !Number.isNaN(parsedAmt) && parsedAmt > 0;
  const formattedAmt = hasAmount ? `Rs. ${formatAmountDisplay(parsedAmt)}/-` : 'N/A';
  const amountWords = hasAmount ? amountToIndianCurrencyWords(parsedAmt) : '';
  const dateFormatted = formatDateDDMMYYYY(form.dateISO);

  const lines = [
    '*India Post — Form A.C.G.- 17 Voucher*',
    `Voucher No.: ${form.receiptNo.trim() || '-'}`,
    `Date: ${dateFormatted || '-'}`,
    `Received From: ${form.receivedFrom.trim() || '-'}`,
    `Amount: ${formattedAmt}`,
    amountWords ? `In Words: ${amountWords}` : '',
    `On Account Of: ${form.onAccountOf.trim() || '-'}`,
    '',
    'Please find the attached Form A.C.G.- 17 PDF voucher.',
  ].filter((line, idx, arr) => line !== '' || (idx > 0 && arr[idx - 1] !== ''));

  return lines.join('\n');
}
