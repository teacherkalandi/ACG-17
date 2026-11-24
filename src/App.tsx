import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Eye,
  FilePlus2,
  Printer,
  RotateCcw,
  Save,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Acg17Sheet } from './components/Acg17Sheet';
import { IndiaPostLogo } from './components/IndiaPostLogo';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { RegisterView } from './components/RegisterView';
import { SettingsView } from './components/SettingsView';
import { downloadPrintableHtml, printAcg17Sheet } from './utils/printSheet';
import type {
  AppCalibration,
  AppSettings,
  PaperSize,
  PrintMode,
  TabName,
  VoucherEntry,
  VoucherFormState,
} from './types';
import {
  ACCOUNT_PRESETS,
  amountToIndianCurrencyWords,
  DEFAULT_CALIBRATION,
  DEFAULT_SETTINGS,
  exportVouchersToCSV,
  formatDateDDMMYYYY,
  getTodayISO,
  STORAGE_KEYS,
} from './utils/formatters';

interface ConfirmDialogState {
  open: boolean;
  title: string;
  body: string;
  onConfirm: (() => void) | null;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // Ignore storage read errors
  }
  return { ...DEFAULT_SETTINGS };
}

function loadCalibration(): AppCalibration {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CALIBRATION);
    if (raw) return { ...DEFAULT_CALIBRATION, ...JSON.parse(raw) };
  } catch {
    // Ignore storage read errors
  }
  return { ...DEFAULT_CALIBRATION };
}

function loadRegister(): VoucherEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return [];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('generator');
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [calibration, setCalibration] = useState<AppCalibration>(() =>
    loadCalibration()
  );
  const [register, setRegister] = useState<VoucherEntry[]>(() => loadRegister());

  const [form, setForm] = useState<VoucherFormState>(() => {
    const initialSettings = loadSettings();
    return {
      receiptNo: String(initialSettings.nextReceiptNo),
      dateISO: getTodayISO(),
      amount: '',
      receivedFrom: initialSettings.defaultReceivedFrom,
      onAccountOf: '',
    };
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    body: '',
    onConfirm: null,
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Sync print calibration CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--cal-x', `${calibration.x}mm`);
    document.documentElement.style.setProperty('--cal-y', `${calibration.y}mm`);
    document.documentElement.style.setProperty(
      '--cal-scale',
      String(calibration.scale)
    );
    try {
      localStorage.setItem(STORAGE_KEYS.CALIBRATION, JSON.stringify(calibration));
    } catch {
      // Ignore storage write errors
    }
  }, [calibration]);

  // Persist register
  const updateRegister = useCallback((next: VoucherEntry[]) => {
    setRegister(next);
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTER, JSON.stringify(next));
    } catch {
      // Ignore storage write errors
    }
  }, []);

  // Persist settings
  const persistSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next));
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const liveAmountWords = amountToIndianCurrencyWords(form.amount);

  const handleIncrementReceiptNo = () => {
    const current = parseInt(form.receiptNo, 10);
    const next = Number.isNaN(current) ? settings.nextReceiptNo : current + 1;
    setForm((prev) => ({ ...prev, receiptNo: String(next) }));
  };

  const handleSetToday = () => {
    setForm((prev) => ({ ...prev, dateISO: getTodayISO() }));
  };

  const handleClearCurrentFields = () => {
    setForm((prev) => ({ ...prev, amount: '', onAccountOf: '' }));
    showToast('Amount and purpose cleared.');
  };

  const handleResetForNewReceipt = () => {
    setForm({
      receiptNo: String(settings.nextReceiptNo),
      dateISO: getTodayISO(),
      amount: '',
      receivedFrom: settings.defaultReceivedFrom,
      onAccountOf: '',
    });
    showToast(`Ready for Voucher No. ${settings.nextReceiptNo}`);
  };

  const collectCurrentVoucher = (): VoucherEntry | null => {
    const receiptNo = form.receiptNo.trim();
    const dateISO = form.dateISO;
    const amount = parseFloat(form.amount);
    const receivedFrom = form.receivedFrom.trim();
    const onAccountOf = form.onAccountOf.trim();

    if (
      !receiptNo ||
      !dateISO ||
      Number.isNaN(amount) ||
      amount <= 0 ||
      !receivedFrom ||
      !onAccountOf
    ) {
      showToast(
        'Please complete Voucher No., Date, Amount (> 0), Received From, and On Account Of.'
      );
      return null;
    }

    return {
      id: `vch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      receiptNo,
      dateISO,
      dateFormatted: formatDateDDMMYYYY(dateISO),
      amount: Number(amount.toFixed(2)),
      amountWords: amountToIndianCurrencyWords(amount),
      receivedFrom,
      onAccountOf,
      signatory: `${settings.signatoryName} (${settings.signatoryDesig})`,
      createdAt: new Date().toISOString(),
    };
  };

  const syncEntryToGoogleSheets = async (entry: VoucherEntry, url: string) => {
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      showToast(`Voucher No. ${entry.receiptNo} saved & synced to Google Sheets.`);
    } catch {
      showToast('Saved locally, but Google Sheets sync failed.');
    }
  };

  const persistVoucherEntry = (entry: VoucherEntry) => {
    const existingIdx = register.findIndex(
      (r) => r.receiptNo === entry.receiptNo && r.dateISO === entry.dateISO
    );

    let updated: VoucherEntry[];
    if (existingIdx > -1) {
      updated = [...register];
      updated[existingIdx] = entry;
    } else {
      updated = [entry, ...register];
      const numericRcpt = parseInt(entry.receiptNo, 10);
      if (!Number.isNaN(numericRcpt) && numericRcpt >= settings.nextReceiptNo) {
        persistSettings({ ...settings, nextReceiptNo: numericRcpt + 1 });
      }
    }

    updateRegister(updated);

    if (settings.gsheetUrl) {
      void syncEntryToGoogleSheets(entry, settings.gsheetUrl);
    }
  };

  const handleSaveReceiptOnly = () => {
    const entry = collectCurrentVoucher();
    if (!entry) return;
    persistVoucherEntry(entry);
    showToast(`Voucher No. ${entry.receiptNo} saved to register.`);
  };

  const triggerPrintSheet = useCallback(
    (receiptNoOverride?: string) => {
      const sheetEl =
        document.getElementById('acg17-modal-sheet') ||
        document.getElementById('acg17-sheet');
      printAcg17Sheet(
        sheetEl,
        calibration,
        receiptNoOverride ?? form.receiptNo
      );
    },
    [calibration, form.receiptNo]
  );

  const handleDownloadPrintableHtml = useCallback(() => {
    const sheetEl =
      document.getElementById('acg17-modal-sheet') ||
      document.getElementById('acg17-sheet');
    if (downloadPrintableHtml(sheetEl, calibration, form.receiptNo)) {
      showToast('Printable A.C.G.- 17 HTML file downloaded.');
    }
  }, [calibration, form.receiptNo, showToast]);

  const handleSaveAndPrint = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = collectCurrentVoucher();
    if (!entry) return;
    persistVoucherEntry(entry);
    window.setTimeout(() => {
      triggerPrintSheet(entry.receiptNo);
    }, 150);
  };

  const handleLoadFromRegister = (id: string, autoPrint: boolean) => {
    const entry = register.find((r) => r.id === id);
    if (!entry) return;

    setForm({
      receiptNo: entry.receiptNo,
      dateISO: entry.dateISO,
      amount: String(entry.amount),
      receivedFrom: entry.receivedFrom,
      onAccountOf: entry.onAccountOf,
    });
    setActiveTab('generator');
    showToast(`Loaded Voucher No. ${entry.receiptNo} into generator.`);

    if (autoPrint) {
      window.setTimeout(() => triggerPrintSheet(entry.receiptNo), 220);
    }
  };

  const handleDeleteEntry = (id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete A.C.G.- 17 Entry',
      body: 'Remove this voucher entry from your local A.C.G.- 17 register?',
      onConfirm: () => {
        updateRegister(register.filter((r) => r.id !== id));
        showToast('Voucher entry removed from register.');
      },
    });
  };

  const handleClearRegister = () => {
    if (register.length === 0) {
      showToast('Register is already empty.');
      return;
    }
    setConfirmDialog({
      open: true,
      title: 'Clear Entire A.C.G.- 17 Register',
      body: 'This will permanently delete all saved vouchers from local browser storage. Export CSV first if needed.',
      onConfirm: () => {
        updateRegister([]);
        showToast('Local A.C.G.- 17 register cleared.');
      },
    });
  };

  const handleExportCSV = () => {
    if (register.length === 0) {
      showToast('No vouchers available to export.');
      return;
    }
    exportVouchersToCSV(register);
    showToast('A.C.G.- 17 Register exported as CSV.');
  };

  const handleSaveSettings = (nextSettings: AppSettings) => {
    persistSettings(nextSettings);
    setForm((prev) => ({
      ...prev,
      receivedFrom: nextSettings.defaultReceivedFrom,
      receiptNo: String(nextSettings.nextReceiptNo),
    }));
    showToast('Office configuration & sync settings saved.');
  };

  const handlePrintModeChange = (printMode: PrintMode) => {
    setCalibration((prev) => ({ ...prev, printMode }));
  };

  const handlePaperSizeChange = (paperSize: PaperSize) => {
    setCalibration((prev) => ({ ...prev, paperSize }));
  };

  const handleResetCalibration = () => {
    setCalibration((prev) => ({ ...prev, x: 0, y: 0, scale: 1 }));
    showToast('Print alignment reset to default (0mm, 0mm, 100%).');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Official India Post Header Bar */}
      <header className="no-print bg-[#D71920] text-white shadow-md border-b-4 border-[#FFCC00] sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-11 rounded-lg bg-white p-1 flex items-center justify-center shadow-inner shrink-0 overflow-hidden">
              <IndiaPostLogo variant="header" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight leading-tight whitespace-nowrap truncate">
                India Post — A.C.G.- 17 Voucher Generator
              </h1>
              <p className="text-xs text-amber-100 mt-0.5 font-medium truncate">
                Form A.C.G.- 17 · Sub Postmaster, Dhenkanal RS SO - 759013 · Odisha Circle
              </p>
            </div>
          </div>

          <nav
            aria-label="Primary sections"
            className="flex items-center gap-2 flex-wrap"
          >
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'generator'
                  ? 'bg-white text-[#D71920] shadow'
                  : 'bg-[#A61116] text-white hover:bg-[#8e0e12]'
              }`}
            >
              Voucher Generator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-white text-[#D71920] shadow'
                  : 'bg-[#A61116] text-white hover:bg-[#8e0e12]'
              }`}
            >
              <span>Daily Voucher Register</span>
              <span
                className={`text-xs font-mono-tabular font-bold ${
                  activeTab === 'register' ? 'text-[#9E1117]' : 'text-[#FFCC00]'
                }`}
              >
                ({register.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-[#D71920] shadow'
                  : 'bg-[#A61116] text-white hover:bg-[#8e0e12]'
              }`}
            >
              Office &amp; Sheets Sync
            </button>
          </nav>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 text-sm"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white cursor-pointer p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="no-print fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border-t-4 border-[#D71920]">
            <h3
              id="confirm-modal-title"
              className="text-base font-bold text-slate-900"
            >
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-slate-600 mt-2">{confirmDialog.body}</p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    open: false,
                    title: '',
                    body: '',
                    onConfirm: null,
                  })
                }
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm?.();
                  setConfirmDialog({
                    open: false,
                    title: '',
                    body: '',
                    onConfirm: null,
                  });
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#D71920] text-white hover:bg-[#A61116] cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-5 py-5">
        {activeTab === 'generator' && (
          <section
            id="generator-grid"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left Column: Input Form & Print Calibration */}
            <div className="no-print lg:col-span-5 space-y-5">
              {/* Voucher Particulars Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-[#D71920] p-5">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Voucher Particulars (Form A.C.G.- 17)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter disbursement/receipt details; live voucher updates automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetForNewReceipt}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFF8D6] text-[#9E1117] border border-[#FFCC00] hover:bg-[#FFCC00] transition cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <FilePlus2 className="w-3.5 h-3.5" />
                    <span>New Voucher</span>
                  </button>
                </div>

                <form onSubmit={handleSaveAndPrint} className="space-y-4">
                  {/* Row 1: Voucher No & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="f-receipt-no"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        Voucher No.
                      </label>
                      <div className="flex">
                        <input
                          id="f-receipt-no"
                          type="text"
                          required
                          value={form.receiptNo}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              receiptNo: e.target.value,
                            }))
                          }
                          placeholder="e.g. 2"
                          className="w-full rounded-l-lg border border-slate-300 px-3 py-2 text-sm font-semibold font-mono-tabular focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
                        />
                        <button
                          type="button"
                          onClick={handleIncrementReceiptNo}
                          title="Increment Voucher Number"
                          className="px-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                        >
                          +1
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="f-date"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        Date (DD-MM-YYYY)
                      </label>
                      <div className="flex">
                        <input
                          id="f-date"
                          type="date"
                          required
                          value={form.dateISO}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              dateISO: e.target.value,
                            }))
                          }
                          className="w-full rounded-l-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
                        />
                        <button
                          type="button"
                          onClick={handleSetToday}
                          title="Set Today's Date"
                          className="px-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer whitespace-nowrap"
                        >
                          Today
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Amount (Rs.) */}
                  <div>
                    <label
                      htmlFor="f-amount"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Amount (Rs.)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                        ₹
                      </span>
                      <input
                        id="f-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={form.amount}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="e.g. 5000"
                        className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm font-bold text-slate-900 font-mono-tabular focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
                      />
                    </div>
                  </div>

                  {/* Live Amount in Words Box */}
                  <div className="bg-[#FFFDF5] border border-[#FFCC00] rounded-lg px-3.5 py-2.5">
                    <div className="text-xs font-bold text-[#9E1117]">
                      The Sum of Rupees (In Words)
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5 italic">
                      {liveAmountWords}
                    </div>
                  </div>

                  {/* Row 3: Received From */}
                  <div>
                    <label
                      htmlFor="f-received-from"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Received From
                    </label>
                    <input
                      id="f-received-from"
                      type="text"
                      required
                      value={form.receivedFrom}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          receivedFrom: e.target.value,
                        }))
                      }
                      placeholder="Sub Postmaster, Dhenkanal RS SO - 759013"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
                    />
                  </div>

                  {/* Row 4: Quick-Select SO Voucher Purpose Presets */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-1.5">
                      Quick-Select Common SO Voucher Purpose
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ACCOUNT_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              onAccountOf: preset.text,
                            }))
                          }
                          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 hover:bg-[#FFF8D6] hover:text-[#9E1117] border border-slate-200 transition cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 5: On Account Of */}
                  <div>
                    <label
                      htmlFor="f-on-account"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      On Account Of
                    </label>
                    <textarea
                      id="f-on-account"
                      rows={2}
                      required
                      value={form.onAccountOf}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          onAccountOf: e.target.value,
                        }))
                      }
                      placeholder="e.g. Towards Contingent Allowance / Office Expenses at Dhenkanal RS SO"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex flex-wrap gap-2.5 border-t border-slate-100">
                    <button
                      type="submit"
                      className="flex-1 min-w-[175px] bg-[#D71920] hover:bg-[#A61116] text-white font-bold py-2.5 px-4 rounded-lg shadow border-b-4 border-[#FFCC00] transition inline-flex items-center justify-center gap-2 cursor-pointer text-sm whitespace-nowrap"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Save &amp; Print A.C.G.- 17</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveReceiptOnly}
                      className="bg-[#FFCC00] hover:bg-amber-400 text-slate-900 font-bold py-2.5 px-4 rounded-lg shadow-sm transition cursor-pointer text-sm inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save to Register</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearCurrentFields}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-3.5 rounded-lg transition cursor-pointer text-sm whitespace-nowrap"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>

              {/* Print Mode & Calibration Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#D71920]" />
                    <span>Print Mode &amp; Stationery Alignment</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleResetCalibration}
                    className="text-xs font-semibold text-[#D71920] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Calibration</span>
                  </button>
                </div>

                {/* Print Mode Segmented Controls */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handlePrintModeChange('full')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border-2 transition cursor-pointer ${
                      calibration.printMode === 'full'
                        ? 'border-[#D71920] bg-[#D71920] text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Full Form Print (Blank A4)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintModeChange('overlay')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border-2 transition cursor-pointer ${
                      calibration.printMode === 'overlay'
                        ? 'border-[#D71920] bg-[#D71920] text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Data-Only Overlay (Pre-Printed)
                  </button>
                </div>

                {/* Paper Size Segmented Controls */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => handlePaperSizeChange('a4')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      calibration.paperSize === 'a4'
                        ? 'border-[#D71920] bg-red-50 text-[#D71920]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    A4 Portrait (210×297mm)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaperSizeChange('a5')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      calibration.paperSize === 'a5'
                        ? 'border-[#D71920] bg-red-50 text-[#D71920]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    A5 Compact (148×210mm)
                  </button>
                </div>

                {/* Calibration Sliders */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Horizontal X-Offset (Left / Right)</span>
                      <span className="font-mono-tabular text-[#D71920]">
                        {calibration.x} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-25}
                      max={25}
                      step={0.5}
                      value={calibration.x}
                      onChange={(e) =>
                        setCalibration((prev) => ({
                          ...prev,
                          x: parseFloat(e.target.value) || 0,
                        }))
                      }
                      aria-label="Horizontal X-Offset"
                      className="w-full accent-[#D71920] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Vertical Y-Offset (Up / Down)</span>
                      <span className="font-mono-tabular text-[#D71920]">
                        {calibration.y} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-25}
                      max={25}
                      step={0.5}
                      value={calibration.y}
                      onChange={(e) =>
                        setCalibration((prev) => ({
                          ...prev,
                          y: parseFloat(e.target.value) || 0,
                        }))
                      }
                      aria-label="Vertical Y-Offset"
                      className="w-full accent-[#D71920] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Print Scale</span>
                      <span className="font-mono-tabular text-[#D71920]">
                        {Math.round(calibration.scale * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.8}
                      max={1.15}
                      step={0.01}
                      value={calibration.scale}
                      onChange={(e) =>
                        setCalibration((prev) => ({
                          ...prev,
                          scale: parseFloat(e.target.value) || 1,
                        }))
                      }
                      aria-label="Print Scale"
                      className="w-full accent-[#D71920] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Print-Ready A.C.G.- 17 Preview */}
            <div id="preview-column" className="lg:col-span-7">
              <div className="no-print flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <h2 className="font-bold text-slate-900">
                    Live Print-Ready Preview — Form A.C.G.- 17
                  </h2>
                  <span aria-hidden="true" className="text-slate-400">
                    ·
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {calibration.printMode === 'overlay'
                      ? 'Data-Only Overlay'
                      : 'Full Form Print'}{' '}
                    ({calibration.paperSize.toUpperCase()})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintPreviewOpen(true)}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Print Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerPrintSheet()}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Now</span>
                  </button>
                </div>
              </div>

              <div
                id="print-stage-wrapper"
                className="bg-slate-300/80 p-4 sm:p-6 rounded-xl border border-slate-300 overflow-x-auto"
              >
                <Acg17Sheet form={form} calibration={calibration} />
              </div>
            </div>
          </section>
        )}

        <PrintPreviewModal
          open={printPreviewOpen}
          form={form}
          calibration={calibration}
          onClose={() => setPrintPreviewOpen(false)}
          onPrintNow={() => triggerPrintSheet()}
          onDownloadHtml={handleDownloadPrintableHtml}
          onChangePrintMode={handlePrintModeChange}
          onChangePaperSize={handlePaperSizeChange}
        />

        {activeTab === 'register' && (
          <RegisterView
            entries={register}
            onLoadEntry={handleLoadFromRegister}
            onDeleteEntry={handleDeleteEntry}
            onClearRegister={handleClearRegister}
            onExportCSV={handleExportCSV}
            onCreateNew={() => {
              handleResetForNewReceipt();
              setActiveTab('generator');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView settings={settings} onSaveSettings={handleSaveSettings} />
        )}
      </main>

      <footer className="no-print bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-500 mt-auto">
        Department of Posts, India · Form A.C.G.- 17 Receipt Utility · Dhenkanal RS Sub Post Office (759013)
      </footer>
    </div>
  );
}
