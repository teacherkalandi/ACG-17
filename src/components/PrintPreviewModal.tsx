import { useEffect, useState } from 'react';
import {
  FileDown,
  FileText,
  MessageCircle,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type {
  AppCalibration,
  PaperSize,
  PrintMode,
  VoucherFormState,
} from '../types';
import { Acg17Sheet } from './Acg17Sheet';

interface PrintPreviewModalProps {
  open: boolean;
  form: VoucherFormState;
  calibration: AppCalibration;
  isExporting: boolean;
  onClose: () => void;
  onPrintNow: () => void;
  onDownloadPdf: () => void;
  onDownloadDoc: () => void;
  onOpenWhatsApp: () => void;
  onChangePrintMode: (mode: PrintMode) => void;
  onChangePaperSize: (size: PaperSize) => void;
}

export function PrintPreviewModal({
  open,
  form,
  calibration,
  isExporting,
  onClose,
  onPrintNow,
  onDownloadPdf,
  onDownloadDoc,
  onOpenWhatsApp,
  onChangePrintMode,
  onChangePaperSize,
}: PrintPreviewModalProps) {
  const [zoom, setZoom] = useState<number>(0.85);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Print Preview — Form A.C.G.- 17"
      className="no-print fixed inset-0 z-50 bg-slate-900/90 flex flex-col"
    >
      {/* Top Preview Toolbar */}
      <div className="bg-slate-950 text-white border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-sm sm:text-base font-bold whitespace-nowrap">
            Print Preview — Form A.C.G.- 17
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {calibration.paperSize.toUpperCase()} ·{' '}
            {calibration.printMode === 'overlay'
              ? 'Data-Only Overlay'
              : 'Full Form Print'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Paper size switch */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onChangePaperSize('a4')}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                calibration.paperSize === 'a4'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              A4
            </button>
            <button
              type="button"
              onClick={() => onChangePaperSize('a5')}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                calibration.paperSize === 'a5'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              A5
            </button>
          </div>

          {/* Print mode switch */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onChangePrintMode('full')}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                calibration.printMode === 'full'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Full Form
            </button>
            <button
              type="button"
              onClick={() => onChangePrintMode('overlay')}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                calibration.printMode === 'overlay'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Overlay
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-lg px-1.5 py-1 gap-1 text-xs">
            <button
              type="button"
              onClick={() =>
                setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))
              }
              aria-label="Zoom out"
              className="p-1 text-slate-300 hover:text-white cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono-tabular px-1.5 min-w-[44px] text-center text-slate-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                setZoom((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))
              }
              aria-label="Zoom in"
              className="p-1 text-slate-300 hover:text-white cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download PDF */}
          <button
            type="button"
            disabled={isExporting}
            onClick={onDownloadPdf}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {/* Download DOC */}
          <button
            type="button"
            disabled={isExporting}
            onClick={onDownloadDoc}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download DOC</span>
          </button>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={onOpenWhatsApp}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#25D366] hover:bg-[#1fb858] text-slate-950 transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {/* Print Now */}
          <button
            type="button"
            onClick={onPrintNow}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#D71920] hover:bg-[#A61116] text-white border-b-2 border-[#FFCC00] transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Now</span>
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Print Preview"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Page Stage */}
      <div className="flex-1 overflow-auto p-6 sm:p-8 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
        >
          <Acg17Sheet
            id="acg17-modal-sheet"
            form={form}
            calibration={calibration}
          />
        </div>
      </div>
    </div>
  );
}
