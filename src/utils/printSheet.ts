import type { AppCalibration } from '../types';

export const ACG17_STANDALONE_CSS = `
  * {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #000000;
    font-family: "Times New Roman", Times, Georgia, serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .paper {
    width: 210mm;
    min-height: 297mm;
    background: #ffffff;
    color: #000000;
    font-family: "Times New Roman", Times, Georgia, serif;
    position: relative;
    box-sizing: border-box;
    padding: 13mm 15mm 14mm 15mm;
    margin: 0 auto;
    transform: translate(var(--cal-x, 0mm), var(--cal-y, 0mm)) scale(var(--cal-scale, 1));
    transform-origin: top center;
  }
  .paper.size-a5 {
    width: 148mm;
    min-height: 210mm;
    padding: 9mm 10mm 10mm 10mm;
  }
  .acg17-inner {
    min-height: 268mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-family: "Times New Roman", Times, Georgia, serif;
    color: #000000;
  }
  .paper.size-a5 .acg17-inner {
    min-height: 190mm;
  }
  .acg17-header-grid {
    display: grid;
    grid-template-columns: 106px 1fr 106px;
    align-items: start;
    column-gap: 8px;
  }
  .paper.size-a5 .acg17-header-grid {
    grid-template-columns: 84px 1fr 84px;
    column-gap: 4px;
  }
  .acg17-left-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .acg17-form-code {
    font-size: 13.5px;
    font-weight: 700;
    line-height: 1.2;
  }
  .paper.size-a5 .acg17-form-code {
    font-size: 11.5px;
  }
  .acg17-logo-wrap {
    margin-top: 4px;
  }
  .india-post-logo-img {
    width: 96px;
    height: auto;
    max-height: 64px;
    object-fit: contain;
    display: block;
  }
  .paper.size-a5 .india-post-logo-img {
    width: 76px;
    max-height: 52px;
  }
  .acg17-center-col {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 84px;
  }
  .paper.size-a5 .acg17-center-col {
    min-height: 68px;
  }
  .acg17-please-pay {
    font-size: 17px;
    font-weight: 700;
    font-style: italic;
    line-height: 1.25;
  }
  .paper.size-a5 .acg17-please-pay {
    font-size: 14px;
  }
  .acg17-top-words {
    font-size: 17px;
    line-height: 1.25;
    min-height: 21px;
  }
  .paper.size-a5 .acg17-top-words {
    font-size: 13.5px;
    min-height: 17px;
  }
  .acg17-dept-title {
    font-size: 21px;
    font-weight: 700;
    letter-spacing: 0.3px;
    line-height: 1.2;
    margin-top: 8px;
  }
  .paper.size-a5 .acg17-dept-title {
    font-size: 16px;
    margin-top: 5px;
  }
  .acg17-subtitle-block {
    width: 100%;
    text-align: center;
    margin-top: 6px;
  }
  .acg17-subtitle-line {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.25;
  }
  .paper.size-a5 .acg17-subtitle-line {
    font-size: 12.5px;
  }
  .acg17-receipt-heading {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.25;
    margin-top: 2px;
  }
  .paper.size-a5 .acg17-receipt-heading {
    font-size: 14px;
  }
  .acg17-fields {
    margin-top: 16px;
    font-size: 16px;
    line-height: 1.45;
  }
  .paper.size-a5 .acg17-fields {
    margin-top: 10px;
    font-size: 13px;
  }
  .acg17-row-flex {
    display: flex;
    align-items: baseline;
  }
  .acg17-row-mt {
    margin-top: 10px;
  }
  .acg17-col-date {
    width: 48%;
  }
  .acg17-col-vch {
    width: 52%;
  }
  .acg17-label-bold {
    font-weight: 700;
  }
  .acg17-nowrap {
    white-space: nowrap;
  }
  .acg17-val-date {
    margin-left: 42px;
  }
  .paper.size-a5 .acg17-val-date {
    margin-left: 24px;
  }
  .acg17-val-vch {
    margin-left: 24px;
  }
  .paper.size-a5 .acg17-val-vch {
    margin-left: 16px;
  }
  .acg17-val-from {
    margin-left: 34px;
  }
  .paper.size-a5 .acg17-val-from {
    margin-left: 20px;
  }
  .acg17-val-words {
    margin-left: 12px;
  }
  .paper.size-a5 .acg17-val-words {
    margin-left: 8px;
  }
  .acg17-val-account {
    padding-left: 90px;
    min-height: 24px;
    white-space: pre-wrap;
  }
  .paper.size-a5 .acg17-val-account {
    padding-left: 54px;
    min-height: 18px;
  }
  .acg17-rs-row {
    margin-top: 32px;
    display: flex;
    align-items: baseline;
  }
  .paper.size-a5 .acg17-rs-row {
    margin-top: 20px;
  }
  .acg17-val-rs {
    margin-left: 44px;
  }
  .paper.size-a5 .acg17-val-rs {
    margin-left: 28px;
  }
  .acg17-witness-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 15.5px;
  }
  .paper.size-a5 .acg17-witness-top {
    font-size: 12.5px;
  }
  .acg17-rev-stamp-text {
    padding-right: 78px;
    padding-top: 8px;
    font-weight: 700;
    font-style: italic;
  }
  .paper.size-a5 .acg17-rev-stamp-text {
    padding-right: 48px;
    padding-top: 5px;
  }
  .witness-rule {
    border-bottom: 2px solid #000000;
    margin-top: 30px;
    padding-bottom: 2px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 15.5px;
    font-weight: 700;
  }
  .paper.size-a5 .witness-rule {
    margin-top: 22px;
    font-size: 12.5px;
  }
  .acg17-sig-witness {
    padding-left: 24px;
  }
  .paper.size-a5 .acg17-sig-witness {
    padding-left: 14px;
  }
  .acg17-sig-payee {
    padding-right: 46px;
  }
  .paper.size-a5 .acg17-sig-payee {
    padding-right: 24px;
  }
  .acg17-notes {
    font-size: 14.5px;
    font-weight: 700;
    line-height: 1.32;
    text-align: justify;
  }
  .paper.size-a5 .acg17-notes {
    font-size: 11.5px;
  }
  .note-rule {
    border-bottom: 1px solid #000000;
    padding: 4px 0;
  }
  .acg17-cert1 {
    padding-top: 5px;
  }
  .acg17-officers {
    padding-right: 2px;
    text-align: right;
    font-weight: 700;
    font-size: 16px;
    line-height: 1.3;
  }
  .paper.size-a5 .acg17-officers {
    font-size: 13px;
  }
  .acg17-officer-gap1 {
    margin-top: 34px;
  }
  .paper.size-a5 .acg17-officer-gap1 {
    margin-top: 22px;
  }
  .acg17-officer-gap2 {
    margin-top: 46px;
  }
  .paper.size-a5 .acg17-officer-gap2 {
    margin-top: 28px;
  }
  .acg17-cert2 {
    margin-top: 10px;
    font-size: 14.5px;
    font-weight: 700;
    line-height: 1.35;
    text-align: justify;
  }
  .paper.size-a5 .acg17-cert2 {
    font-size: 11.5px;
  }
  .acg17-bottom-row {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 16px;
  }
  .paper.size-a5 .acg17-bottom-row {
    margin-top: 16px;
    font-size: 13px;
  }
  .acg17-bottom-date-val {
    margin-left: 28px;
    font-weight: 700;
  }
  .paper.size-a5 .acg17-bottom-date-val {
    margin-left: 18px;
  }
  .acg17-bottom-officer {
    font-weight: 700;
    padding-right: 2px;
    padding-top: 8px;
  }
  .dyn-val {
    font-family: "Times New Roman", Times, Georgia, serif;
    font-weight: 700;
    font-style: italic;
    color: #000000;
  }
  .paper.overlay-mode .static-label,
  .paper.overlay-mode .static-box {
    visibility: hidden !important;
  }
  .paper.overlay-mode .witness-rule,
  .paper.overlay-mode .note-rule {
    border-bottom-color: transparent !important;
  }
  @media print {
    .india-post-logo-img {
      filter: grayscale(100%) contrast(155%);
    }
    .paper {
      margin: 0 !important;
      border: none !important;
      box-shadow: none !important;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
  }
`;

export function buildStandalonePrintDocument(
  sheetHtml: string,
  calibration: AppCalibration,
  title: string
): string {
  const pageSize = calibration.paperSize === 'a5' ? 'A5 portrait' : 'A4 portrait';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title.replace(/</g, '&lt;')}</title>
  <style>
    :root {
      --cal-x: ${calibration.x}mm;
      --cal-y: ${calibration.y}mm;
      --cal-scale: ${calibration.scale};
    }
    @page {
      size: ${pageSize};
      margin: 0;
    }
    ${ACG17_STANDALONE_CSS}
  </style>
</head>
<body>
  ${sheetHtml}
</body>
</html>`;
}

export function printAcg17Sheet(
  sheetElement: HTMLElement | null,
  calibration: AppCalibration,
  receiptNo: string
): boolean {
  if (!sheetElement) {
    window.print();
    return true;
  }

  try {
    const title = `Form A.C.G.- 17 Voucher ${receiptNo || ''}`.trim();
    const docHtml = buildStandalonePrintDocument(
      sheetElement.outerHTML,
      calibration,
      title
    );

    const existing = document.getElementById('acg17-print-iframe');
    if (existing) existing.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'acg17-print-iframe';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    document.body.appendChild(iframe);

    const iframeWin = iframe.contentWindow;
    const iframeDoc = iframe.contentDocument || iframeWin?.document;

    if (!iframeWin || !iframeDoc) {
      iframe.remove();
      window.print();
      return true;
    }

    iframeDoc.open();
    iframeDoc.write(docHtml);
    iframeDoc.close();

    let printed = false;
    const triggerPrint = () => {
      if (printed) return;
      printed = true;
      try {
        iframeWin.focus();
        iframeWin.print();
      } catch {
        window.print();
      }
      window.setTimeout(() => {
        iframe.remove();
      }, 2000);
    };

    const images = Array.from(iframeDoc.querySelectorAll('img'));
    if (images.length === 0) {
      window.setTimeout(triggerPrint, 120);
    } else {
      let pending = images.length;
      const done = () => {
        pending -= 1;
        if (pending <= 0) {
          window.setTimeout(triggerPrint, 80);
        }
      };
      images.forEach((img) => {
        if (img.complete) {
          done();
        } else {
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }
      });
      // Safety fallback in case external logo image takes too long
      window.setTimeout(triggerPrint, 700);
    }

    return true;
  } catch {
    window.print();
    return true;
  }
}

export function downloadPrintableHtml(
  sheetElement: HTMLElement | null,
  calibration: AppCalibration,
  receiptNo: string
): boolean {
  if (!sheetElement) return false;
  const safeNo = (receiptNo || 'voucher').replace(/[^a-zA-Z0-9_-]/g, '_');
  const title = `Form A.C.G.- 17 Voucher ${receiptNo || ''}`.trim();
  const docHtml = buildStandalonePrintDocument(
    sheetElement.outerHTML,
    calibration,
    title
  );

  const blob = new Blob([docHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ACG17_Voucher_${safeNo}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
