'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PAGE_SIZES = [10, 25, 50, 100];

export default function DataTable({
  columns,
  data,
  meta,
  loading,
  search,
  onSearch,
  filters,
  onFilterChange,
  onPageChange,
  onPerPageChange,
  onSort,
  sortKey,
  sortDir,
  title,
  description,
  actions,
  rowKey = 'id',
  onRowClick,
  emptyMessage = 'Tidak ada data',
  glassmorphism = true,
}) {
  const [gotoPage, setGotoPage] = useState('');

  const currentPage = meta?.current_page || meta?.currentPage || 1;
  const lastPage = meta?.last_page || meta?.lastPage || 1;
  const total = meta?.total || 0;

  const hasActiveFilters = search || (filters || []).some((f) => f.value);

  const handleSort = (key) => {
    if (!onSort) return;
    onSort(key);
  };

  const renderSortIcon = (column) => {
    if (!onSort || !column.sortable) return null;
    const isActive = sortKey === column.key;
    return (
      <span className={`ml-1 inline-flex transition-all ${isActive ? 'text-white' : 'text-white/40'}`}>
        {isActive && sortDir === 'asc' ? '↑' : isActive && sortDir === 'desc' ? '↓' : '↕'}
      </span>
    );
  };

  const glassClasses = glassmorphism
    ? 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5'
    : 'bg-white border border-border shadow-sm';

  const generatePageNumbers = () => {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      for (let i = 1; i <= 7; i++) pages.push(i);
    } else if (currentPage >= lastPage - 3) {
      for (let i = lastPage - 6; i <= lastPage; i++) pages.push(i);
    } else {
      for (let i = currentPage - 3; i <= currentPage + 3; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className={`rounded-2xl overflow-hidden ${glassClasses}`}>
      {(title || search !== undefined || filters || actions) && (
        <div className="p-4 border-b border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              {title && <h3 className="font-bold text-foreground">{title}</h3>}
              {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {search !== undefined && (
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => onSearch?.(e.target.value)}
                    placeholder="Cari..."
                    className="pl-9 pr-3 py-2 rounded-xl border border-border/50 text-sm bg-white/60 focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all w-48"
                  />
                </div>
              )}
              {filters?.map((f) => (
                <select key={f.key} value={f.value} onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border/50 text-sm bg-white/60 focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all cursor-pointer">
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ))}
              {actions}
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-gray-500 font-medium"><FunnelIcon className="w-3 h-3 inline mr-1" />Filter:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  Cari: {search}
                  <button onClick={() => onSearch?.('')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
                </span>
              )}
              {filters?.filter((f) => f.value).map((f) => (
                <span key={f.key} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {f.label}: {f.options.find((o) => o.value === f.value)?.label || f.value}
                  <button onClick={() => onFilterChange?.(f.key, '')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
                </span>
              ))}
              <button onClick={() => { onSearch?.(''); filters?.forEach((f) => onFilterChange?.(f.key, '')); }}
                className="text-xs text-gray-500 hover:text-foreground underline cursor-pointer ml-1">Clear all</button>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-400">Memuat data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MagnifyingGlassIcon className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700">
                {columns.map((col) => (
                  <th key={col.key}
                    className={`text-left py-3 px-3 font-semibold text-white/80 ${col.sortable ? 'cursor-pointer select-none hover:text-white transition-colors' : ''} ${col.className || ''}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={col.width ? { width: col.width } : undefined}>
                    <div className="flex items-center">
                      {col.label}
                      {renderSortIcon(col)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row[rowKey] || i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-border/30 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${
                    i % 2 === 0 ? 'bg-white/40' : 'bg-white/20'
                  } hover:bg-primary/5`}>
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3 px-3 text-foreground ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta && lastPage > 1 && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border/50">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{total} data - Hal {currentPage} dari {lastPage}</span>
            {onPerPageChange && (
              <div className="flex items-center gap-1">
                <span className="text-xs">per hal:</span>
                <select value={meta.per_page || 10} onChange={(e) => onPerPageChange(Number(e.target.value))}
                  className="border border-border/50 rounded-lg px-2 py-1 text-xs bg-white/60 focus:ring-ring/30 focus:border-primary outline-none cursor-pointer">
                  {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-border/50 text-xs disabled:opacity-40 hover:bg-muted transition-all cursor-pointer flex items-center gap-1">
              <ChevronLeftIcon className="w-3 h-3" /> Prev
            </button>
            {generatePageNumbers().map((p) => (
              <button key={p} onClick={() => onPageChange?.(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentPage === p
                    ? 'bg-primary text-white shadow-sm'
                    : 'border border-border/50 hover:bg-muted text-gray-500'
                }`}>
                {p}
              </button>
            ))}
            <button disabled={currentPage >= lastPage} onClick={() => onPageChange?.(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-border/50 text-xs disabled:opacity-40 hover:bg-muted transition-all cursor-pointer flex items-center gap-1">
              Next <ChevronRightIcon className="w-3 h-3" />
            </button>
            {lastPage > 7 && (
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-gray-400">Go:</span>
                <input type="number" min={1} max={lastPage} value={gotoPage}
                  onChange={(e) => setGotoPage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { const v = parseInt(gotoPage); if (v >= 1 && v <= lastPage) onPageChange?.(v); setGotoPage(''); } }}
                  className="w-14 px-2 py-1 rounded-lg border border-border/50 text-xs bg-white/60 focus:ring-ring/30 focus:border-primary outline-none" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}