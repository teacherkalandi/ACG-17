import { useEffect, useState } from 'react';
import { Download, FileText, MessageCircle, Send, Share2, X } from 'lucide-react';
import type { AppCalibration, VoucherFormState } from '../types';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  generateAcg17Pdf,
} from '../utils/exportDocuments';

interface WhatsAppShareModalProps {
  open: boolean;
  form: VoucherFormState;
  calibration: AppCalibration;
  onClose: () => void;
  onNotify: (message: string) => void;
}

export function WhatsAppShareModal({
  open,
  form,
  calibration,
  onClose,
  onNotify,
}: WhatsAppShareModalProps) {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [canDirectShareFile, setCanDirectShareFile] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMessage(buildWhatsAppMessage(form));

    try {
      const testFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      const supported =
        typeof navigator !== 'undefined' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [testFile] });
      setCanDirectShareFile(supported);
    } catch {
      setCanDirectShareFile(false);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, form, onClose]);

  if (!open) return null;

  const waUrl = buildWhatsAppUrl(phone, message);

  const handleDirectNativeShare = async () => {
    setBusy(true);
    try {
      const { file, filename } = await generateAcg17Pdf(form, calibration);
      if (
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `Form A.C.G.- 17 (${filename})`,
          text: message,
        });
        onNotify('PDF shared via device share sheet.');
        onClose();
      } else {
        onNotify(
          'Direct file share is not supported on this browser. Use "Download PDF & Open WhatsApp" below.'
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User canceled share sheet
      } else {
        onNotify(
          'Could not open direct share sheet. Use "Download PDF & Open WhatsApp" below.'
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadPdfForWhatsApp = async () => {
    setBusy(true);
    try {
      const { blob, filename } = await generateAcg17Pdf(form, calibration);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      onNotify(
        `Downloaded ${filename}. Attach it in the opened WhatsApp chat to send.`
      );
    } catch {
      onNotify('Could not generate PDF file. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
      className="no-print fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#128C7E] text-white px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 shrink-0" />
            <div>
              <h3
                id="whatsapp-modal-title"
                className="text-base font-bold leading-tight"
              >
                Send A.C.G.- 17 PDF via WhatsApp
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Voucher No. {form.receiptNo.trim() || 'Draft'} ·{' '}
                {calibration.paperSize.toUpperCase()} PDF
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close WhatsApp modal"
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              {canDirectShareFile ? (
                <span>
                  Your device supports direct PDF attachment sharing. Tap{' '}
                  <strong>Share PDF Directly</strong> and choose{' '}
                  <strong>WhatsApp</strong>, or download the PDF and open a
                  specific WhatsApp number below.
                </span>
              ) : (
                <span>
                  Clicking <strong>Download PDF &amp; Open WhatsApp</strong>{' '}
                  saves the voucher PDF to your device and opens WhatsApp with
                  the voucher details pre-filled—then simply attach the
                  downloaded PDF in the chat.
                </span>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="wa-phone"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Recipient WhatsApp Number (Optional)
            </label>
            <input
              id="wa-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9861012345 (10-digit Indian number) or leave blank"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono-tabular focus:outline-none focus:border-[#128C7E] focus:ring-1 focus:ring-[#128C7E]"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              10-digit numbers automatically use +91. Leave blank to pick any
              contact or group inside WhatsApp.
            </p>
          </div>

          <div>
            <label
              htmlFor="wa-message"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              WhatsApp Message
            </label>
            <textarea
              id="wa-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs leading-relaxed focus:outline-none focus:border-[#128C7E] focus:ring-1 focus:ring-[#128C7E]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            {canDirectShareFile && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDirectNativeShare()}
                className="flex-1 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#25D366] hover:bg-[#1fb858] text-white shadow-sm transition cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <Share2 className="w-4 h-4" />
                <span>{busy ? 'Preparing PDF...' : 'Share PDF Directly'}</span>
              </button>
            )}

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                void handleDownloadPdfForWhatsApp();
              }}
              className="flex-1 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#128C7E] hover:bg-[#0e7267] text-white shadow-sm transition cursor-pointer inline-flex items-center justify-center gap-1.5 text-center"
            >
              <Send className="w-4 h-4" />
              <span>Download PDF &amp; Open WhatsApp</span>
            </a>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-100">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleDownloadPdfForWhatsApp()}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF only</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
