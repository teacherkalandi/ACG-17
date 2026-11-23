import type { AppCalibration, AppSettings, VoucherEntry } from '../types';

export const STORAGE_KEYS = {
  SETTINGS: 'ip_acg17_settings_v2',
  REGISTER: 'ip_acg17_register_v2',
  CALIBRATION: 'ip_acg17_calibration_v2',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  defaultReceivedFrom: 'Sub Postmaster, Dhenkanal RS SO - 759013',
  signatoryName: 'Kalandi Charan Sahoo',
  signatoryDesig: 'Postal Assistant, Dhenkanal RS SO',
  nextReceiptNo: 1,
  gsheetUrl: '',
};

export const DEFAULT_CALIBRATION: AppCalibration = {
  x: 0,
  y: 0,
  scale: 1,
  printMode: 'full',
  paperSize: 'a4',
};

export const ACCOUNT_PRESETS: Array<{ label: string; text: string }> = [
  {
    label: 'Contingent Allowance',
    text: 'Towards Contingent Allowance / Office Expenses at Dhenkanal RS SO',
  },
  {
    label: 'Gardener / Sweeper',
    text: 'Towards Contingent Gardener / Sweeper Allowance for the Month at Dhenkanal RS SO',
  },
  {
    label: 'Mail Conveyance',
    text: 'Towards Mail Conveyance / Coolie Charges at Dhenkanal RS SO',
  },
  {
    label: 'Electricity / Water',
    text: 'Towards Electricity / Water Charges Bill Payment of Dhenkanal RS SO',
  },
  {
    label: 'Misc. Contingent',
    text: 'Towards Misc. Office Contingent & Stationery Purchase at Dhenkanal RS SO',
  },
  {
    label: 'Advance Disbursement',
    text: 'Towards TA / Medical / Festival Advance Disbursement at Dhenkanal RS SO',
  },
];

export function convertIntegerToIndianWords(inputNum: number): string {
  let num = Math.floor(Math.abs(Number(inputNum) || 0));
  if (num === 0) return 'Zero';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function twoDigits(n: number): string {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  }

  function threeDigits(n: number): string {
    if (n < 100) return twoDigits(n);
    return (
      ones[Math.floor(n / 100)] +
      ' Hundred' +
      (n % 100 ? ' ' + twoDigits(n % 100) : '')
    );
  }

  const parts: string[] = [];
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore > 0) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh > 0) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${threeDigits(thousand)} Thousand`);
  if (num > 0) parts.push(threeDigits(num));

  return parts.join(' ');
}

export function amountToIndianCurrencyWords(amountVal: string | number): string {
  const parsed = typeof amountVal === 'number' ? amountVal : parseFloat(amountVal);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 'Rupees Zero Only';
  }
  const fixed = parsed.toFixed(2);
  const [rupeeStr, paiseStr] = fixed.split('.');
  const rupees = parseInt(rupeeStr, 10);
  const paise = parseInt(paiseStr, 10);

  let result = `Rupees ${convertIntegerToIndianWords(rupees)}`;
  if (paise > 0) {
    result += ` and Paise ${convertIntegerToIndianWords(paise)}`;
  }
  result += ' Only';
  return result;
}

export function formatAmountDisplay(amountVal: string | number): string {
  const parsed = typeof amountVal === 'number' ? amountVal : parseFloat(amountVal);
  if (Number.isNaN(parsed) || parsed <= 0) return '';
  return parsed % 1 === 0 ? String(parsed) : parsed.toFixed(2);
}

export function formatINR(amount: number): string {
  return Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDateDDMMYYYY(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function exportVouchersToCSV(entries: VoucherEntry[]): void {
  const headers = [
    'Voucher No',
    'Date',
    'Received From',
    'On Account Of',
    'Amount (Rs)',
    'Amount in Words',
    'Prepared By',
  ];
  const rows = entries.map((r) => [
    r.receiptNo,
    r.dateFormatted,
    r.receivedFrom,
    r.onAccountOf,
    Number(r.amount).toFixed(2),
    r.amountWords,
    r.signatory || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ACG17_Register_DhenkanalRS_${getTodayISO()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
