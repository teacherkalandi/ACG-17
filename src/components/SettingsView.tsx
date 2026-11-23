import { useEffect, useState } from 'react';
import { Check, Copy, Save } from 'lucide-react';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/formatters';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (next: AppSettings) => void;
}

const APPS_SCRIPT_CODE = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Voucher No", "Date", "Received From", "Amount", "Amount in Words", "On Account Of", "Prepared By"]);
  }
  sheet.appendRow([new Date(), data.receiptNo, data.dateFormatted, data.receivedFrom, data.amount, data.amountWords, data.onAccountOf, data.signatory]);
  return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
}`;

export function SettingsView({ settings, onSaveSettings }: SettingsViewProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedNextNo = Math.max(1, parseInt(String(draft.nextReceiptNo), 10) || 1);
    onSaveSettings({
      defaultReceivedFrom:
        draft.defaultReceivedFrom.trim() || DEFAULT_SETTINGS.defaultReceivedFrom,
      signatoryName: draft.signatoryName.trim() || DEFAULT_SETTINGS.signatoryName,
      signatoryDesig: draft.signatoryDesig.trim() || DEFAULT_SETTINGS.signatoryDesig,
      nextReceiptNo: cleanedNextNo,
      gsheetUrl: draft.gsheetUrl.trim(),
    });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable in restricted context
    }
  };

  return (
    <section className="no-print max-w-3xl mx-auto space-y-5">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-[#D71920] p-6"
      >
        <h2 className="text-lg font-bold text-slate-900">
          Office Profile &amp; Voucher Defaults
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Pre-configured for Kalandi Charan Sahoo, Postal Assistant at Dhenkanal RS Sub Post Office (759013).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="set-default-received-from"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Default &ldquo;Received From&rdquo; Office / Authority
            </label>
            <input
              id="set-default-received-from"
              type="text"
              value={draft.defaultReceivedFrom}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  defaultReceivedFrom: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
            />
          </div>

          <div>
            <label
              htmlFor="set-signatory-name"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Prepared By Official (Register Log)
            </label>
            <input
              id="set-signatory-name"
              type="text"
              value={draft.signatoryName}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, signatoryName: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
            />
          </div>

          <div>
            <label
              htmlFor="set-signatory-desig"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Designation &amp; Office
            </label>
            <input
              id="set-signatory-desig"
              type="text"
              value={draft.signatoryDesig}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, signatoryDesig: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
            />
          </div>

          <div>
            <label
              htmlFor="set-next-rcpt"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Next Auto-Increment Voucher No.
            </label>
            <input
              id="set-next-rcpt"
              type="number"
              min={1}
              value={draft.nextReceiptNo}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  nextReceiptNo: parseInt(e.target.value, 10) || 1,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold font-mono-tabular focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
            />
          </div>
        </div>

        <hr className="my-6 border-slate-200" />

        <h3 className="text-base font-bold text-slate-900">
          Google Sheets Auto-Sync (Optional)
        </h3>
        <p className="text-xs text-slate-600 mt-1 mb-3">
          Paste a Google Apps Script Web App URL below to automatically log every saved A.C.G.- 17 voucher into a cloud Google Sheet register.
        </p>

        <div>
          <label
            htmlFor="set-gsheet-url"
            className="block text-xs font-bold text-slate-700 mb-1"
          >
            Google Apps Script Web App URL
          </label>
          <input
            id="set-gsheet-url"
            type="url"
            value={draft.gsheetUrl}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, gsheetUrl: e.target.value }))
            }
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono-tabular focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
          />
        </div>

        <details className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
          <summary className="font-bold cursor-pointer text-[#D71920] select-none">
            View Google Apps Script Setup Code (Click to expand)
          </summary>
          <div className="mt-2.5 relative">
            <button
              type="button"
              onClick={handleCopyCode}
              className="absolute right-2 top-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <pre className="p-3 pr-20 bg-slate-900 text-emerald-300 rounded-lg overflow-x-auto text-[11px] leading-relaxed font-mono-tabular">
              {APPS_SCRIPT_CODE}
            </pre>
          </div>
        </details>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-[#D71920] hover:bg-[#A61116] text-white font-bold py-2.5 px-6 rounded-lg shadow border-b-4 border-[#FFCC00] transition cursor-pointer text-sm inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </section>
  );
}
