import { useMemo, useState } from 'react';
import { Download, Printer, RotateCcw, Search, Trash2, Upload } from 'lucide-react';
import type { VoucherEntry } from '../types';
import { formatINR, getTodayISO } from '../utils/formatters';

interface RegisterViewProps {
  entries: VoucherEntry[];
  onLoadEntry: (id: string, autoPrint: boolean) => void;
  onDeleteEntry: (id: string) => void;
  onClearRegister: () => void;
  onExportCSV: () => void;
  onCreateNew: () => void;
}

export function RegisterView({
  entries,
  onLoadEntry,
  onDeleteEntry,
  onClearRegister,
  onExportCSV,
  onCreateNew,
}: RegisterViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return entries.filter((item) => {
      const matchesDate = !filterDate || item.dateISO === filterDate;
      const matchesText =
        !q ||
        item.receiptNo.toLowerCase().includes(q) ||
        item.receivedFrom.toLowerCase().includes(q) ||
        item.onAccountOf.toLowerCase().includes(q);
      return matchesDate && matchesText;
    });
  }, [entries, searchQuery, filterDate]);

  const grandTotal = useMemo(
    () => entries.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
    [entries]
  );

  const filteredTotal = useMemo(
    () => filtered.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
    [filtered]
  );

  return (
    <section className="no-print space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-[#D71920] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              A.C.G.- 17 Voucher Register — Dhenkanal RS SO (759013)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All saved vouchers are stored locally in your browser. Search, filter by date, reload to reprint, or export to Excel/CSV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportCSV}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV (Excel)</span>
            </button>
            <button
              type="button"
              onClick={onClearRegister}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-[#D71920] border border-red-200 transition cursor-pointer whitespace-nowrap"
            >
              Clear Register
            </button>
          </div>
        </div>

        {/* Summary KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">
              Total Vouchers Recorded
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono-tabular">
              {entries.length}
            </div>
          </div>
          <div className="bg-[#FFFDF5] rounded-lg p-4 border border-[#FFCC00]">
            <div className="text-xs font-semibold text-[#9E1117]">
              Filtered / Selected Total
            </div>
            <div className="text-2xl font-extrabold text-[#D71920] mt-1 font-mono-tabular">
              ₹ {formatINR(filteredTotal)}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">
              Grand Total Disbursed
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono-tabular">
              ₹ {formatINR(grandTotal)}
            </div>
          </div>
        </div>

        {/* Search & Date Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Voucher No., Received From, or On Account Of..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
            />
          </div>
          <div className="sm:col-span-3">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              aria-label="Filter by Date"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
            />
          </div>
          <div className="sm:col-span-3 flex gap-2">
            <button
              type="button"
              onClick={() => setFilterDate(getTodayISO())}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer whitespace-nowrap"
            >
              Today Only
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterDate('');
              }}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All</span>
            </button>
          </div>
        </div>

        {/* Register Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-slate-700 text-xs font-bold">
              <tr>
                <th className="px-3.5 py-3 text-left">Voucher No.</th>
                <th className="px-3.5 py-3 text-left">Date</th>
                <th className="px-3.5 py-3 text-left">Received From</th>
                <th className="px-3.5 py-3 text-left">On Account Of</th>
                <th className="px-3.5 py-3 text-right">Amount (₹)</th>
                <th className="px-3.5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm text-slate-600 font-medium">
                      {entries.length === 0
                        ? 'No A.C.G.- 17 vouchers have been recorded yet.'
                        : 'No A.C.G.- 17 vouchers found matching the current filter.'}
                    </p>
                    {entries.length === 0 && (
                      <button
                        type="button"
                        onClick={onCreateNew}
                        className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-[#D71920] hover:bg-[#A61116] text-white transition cursor-pointer"
                      >
                        Create First Voucher
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-amber-50/40 transition-colors"
                  >
                    <td className="px-3.5 py-2.5 font-bold text-[#D71920] whitespace-nowrap font-mono-tabular">
                      {entry.receiptNo}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-700 font-mono-tabular">
                      {entry.dateFormatted}
                    </td>
                    <td
                      className="px-3.5 py-2.5 font-medium text-slate-900 max-w-[220px] truncate"
                      title={entry.receivedFrom}
                    >
                      {entry.receivedFrom}
                    </td>
                    <td
                      className="px-3.5 py-2.5 text-slate-600 max-w-[280px] truncate"
                      title={entry.onAccountOf}
                    >
                      {entry.onAccountOf}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap font-mono-tabular">
                      {formatINR(entry.amount)}
                    </td>
                    <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onLoadEntry(entry.id, false)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Load</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onLoadEntry(entry.id, true)}
                          className="px-2.5 py-1 rounded bg-[#D71920] hover:bg-[#A61116] text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Reprint</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer"
                          title="Delete Entry"
                          aria-label={`Delete Voucher ${entry.receiptNo}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
