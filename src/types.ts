export type TabName = 'generator' | 'register' | 'settings';

export type PrintMode = 'full' | 'overlay';
export type PaperSize = 'a4' | 'a5';

export interface AppSettings {
  defaultReceivedFrom: string;
  signatoryName: string;
  signatoryDesig: string;
  nextReceiptNo: number;
  gsheetUrl: string;
}

export interface AppCalibration {
  x: number;
  y: number;
  scale: number;
  printMode: PrintMode;
  paperSize: PaperSize;
}

export interface VoucherEntry {
  id: string;
  receiptNo: string;
  dateISO: string;
  dateFormatted: string;
  amount: number;
  amountWords: string;
  receivedFrom: string;
  onAccountOf: string;
  signatory: string;
  createdAt: string;
}

export interface VoucherFormState {
  receiptNo: string;
  dateISO: string;
  amount: string;
  receivedFrom: string;
  onAccountOf: string;
}
