'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Search, ChevronDown, X, Plus, LayoutGrid, List,
  AlertTriangle, Download, Send, Tag, MoreHorizontal, Check
} from 'lucide-react';
import { accounts, Account } from '@/data/mockData';
import AccountDrawer from './AccountDrawer';

// ── Badge components ──────────────────────────────────────────────────────────

const ICPBadge = ({ fit }: { fit: string }) => {
  if (fit === 'Strong') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Strong</span>;
  if (fit === 'Moderate') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Moderate</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Weak</span>;
};

const ScoreBadge = ({ level, score }: { level: string; score: number | null }) => {
  if (level === 'N/A') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">N/A</span>;
  if (level === 'High') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">High ({score})</span>;
  if (level === 'Medium') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Med ({score})</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Low ({score})</span>;
};

const TagBadge = ({ tag }: { tag: string }) => {
  const styles: Record<string, string> = {
    'New Lead': 'border-green-400 text-green-700 bg-green-50',
    'Dev Funnel': 'border-purple-400 text-purple-700 bg-purple-50',
    'New Account': 'border-blue-400 text-blue-700 bg-blue-50',
    'CRM Import': 'border-orange-400 text-orange-600 bg-orange-50',
  };
  return (
    <span className={`px-1.5 py-0.5 border rounded text-[10px] font-medium ${styles[tag] || 'border-gray-300 text-gray-600 bg-gray-50'}`}>
      {tag}
    </span>
  );
};

const DevFunnelCell = ({ stage }: { stage: string | null }) => {
  if (!stage) return <span className="text-gray-300 text-sm">--</span>;
  const colors: Record<string, string> = {
    Exploring: 'text-gray-600',
    Evaluating: 'text-[#5B5BD6]',
    Building: 'text-orange-600',
    Deployed: 'text-green-600',
  };
  return <span className={`text-xs font-medium ${colors[stage] || 'text-gray-600'}`}>{stage}</span>;
};

// ── Filter definitions ────────────────────────────────────────────────────────

type FilterValue = { id: string; label: string };
type FilterDef = {
  id: string;
  label: string;
  isNew?: boolean;
  values: FilterValue[];
};

const FILTER_DEFS: FilterDef[] = [
  {
    id: 'devFunnel', label: 'Dev Funnel',
    values: [
      { id: 'Exploring', label: 'Exploring' },
      { id: 'Evaluating', label: 'Evaluating' },
      { id: 'Building', label: 'Building' },
      { id: 'Deployed', label: 'Deployed' },
    ],
  },
  {
    id: 'icpFit', label: 'ICP Fit',
    values: [
      { id: 'Strong', label: 'Strong' },
      { id: 'Moderate', label: 'Moderate' },
      { id: 'Weak', label: 'Weak' },
    ],
  },
  {
    id: 'employees', label: 'Employee Range',
    values: [
      { id: '1-50', label: '1–50' },
      { id: '51-250', label: '51–250' },
      { id: '251-1K', label: '251–1K' },
      { id: '1K-5K', label: '1K–5K' },
      { id: '5K-10K', label: '5K–10K' },
      { id: '10K-50K', label: '10K–50K' },
      { id: '50K-100K', label: '50K–100K' },
      { id: '100K+', label: '100K+' },
    ],
  },
  {
    id: 'crmStage', label: 'CRM Lifecycle Stage',
    values: [
      { id: 'Lead', label: 'Lead' },
      { id: 'MQL', label: 'MQL' },
      { id: 'SQL', label: 'SQL' },
      { id: 'Opportunity', label: 'Opportunity' },
      { id: 'Customer', label: 'Customer' },
    ],
  },
  {
    id: 'activityScore', label: 'Activity Score',
    values: [
      { id: 'High', label: 'High' },
      { id: 'Medium', label: 'Medium' },
      { id: 'Low', label: 'Low' },
      { id: 'N/A', label: 'N/A (no signals)' },
    ],
  },
  {
    id: 'newAccount', label: 'New Account',
    values: [{ id: 'Yes', label: 'Yes' }, { id: 'No', label: 'No' }],
  },
  {
    id: 'newLead', label: 'New Lead',
    values: [{ id: 'Yes', label: 'Yes' }, { id: 'No', label: 'No' }],
  },
  {
    id: 'surge', label: 'Surge',
    values: [{ id: 'Yes', label: 'Yes' }, { id: 'No', label: 'No' }],
  },
  {
    id: 'hasNotes', label: 'Has Notes',
    values: [{ id: 'Yes', label: 'Yes' }, { id: 'No', label: 'No' }],
  },
  {
    id: 'hasSignals', label: 'Has Developer Signals',
    isNew: true,
    values: [
      { id: 'Yes', label: 'Yes — has 1st-party signals' },
      { id: 'No', label: 'No — 3P enriched only' },
    ],
  },
  {
    id: 'accountSource', label: 'Account Source',
    isNew: true,
    values: [
      { id: 'reo-detected', label: 'Reo Detected' },
      { id: 'crm-import', label: 'CRM Import' },
      { id: 'both', label: 'Both (CRM + Signals)' },
    ],
  },
];

type ActiveFilter = { filterId: string; valueId: string };

const segmentOptions = [
  { id: 'all', label: 'All Accounts' },
  { id: 'deanon', label: 'Accounts with Deanonymised Developers' },
  { id: 'highActivity', label: 'High Developer Activity' },
  { id: 'buildingPoc', label: 'Account in Building POC stage' },
  { id: 'crmImport', label: 'CRM Imported Accounts', isNew: true },
];

// ── Filter chip popover ───────────────────────────────────────────────────────

function FilterChip({
  filter,
  onRemove,
  onChange,
}: {
  filter: ActiveFilter;
  onRemove: () => void;
  onChange: (valueId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const def = FILTER_DEFS.find(d => d.id === filter.filterId)!;
  const val = def.values.find(v => v.id === filter.valueId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <span
        className="flex items-center gap-1 px-2.5 py-1 bg-[rgba(91,91,214,0.08)] border border-[rgba(91,91,214,0.3)] rounded-full text-xs text-[#5B5BD6] font-medium cursor-pointer hover:bg-[rgba(91,91,214,0.14)] transition-colors select-none"
        onClick={() => setOpen(o => !o)}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#5B5BD6] shrink-0" />
        <span className="text-gray-500 font-normal">{def.label}</span>
        <span className="mx-0.5 text-gray-400">is</span>
        <span>{val?.label ?? filter.valueId}</span>
        <ChevronDown size={10} className={`ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 hover:text-red-500 transition-colors"
        >
          <X size={10} />
        </button>
      </span>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[200px] z-30">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
            {def.label}
          </div>
          {def.values.map(v => (
            <button
              key={v.id}
              onClick={() => { onChange(v.id); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-[rgba(91,91,214,0.05)] hover:text-[#5B5BD6] transition-colors"
            >
              <span>{v.label}</span>
              {v.id === filter.valueId && <Check size={13} className="text-[#5B5BD6]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add Filter two-step popover ───────────────────────────────────────────────

function AddFilterPopover({
  activeFilters,
  onAdd,
  onClose,
}: {
  activeFilters: ActiveFilter[];
  onAdd: (f: ActiveFilter) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'pick-filter' | 'pick-value'>('pick-filter');
  const [selectedDef, setSelectedDef] = useState<FilterDef | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const alreadyActive = (id: string) => activeFilters.some(f => f.filterId === id);

  return (
    <div ref={ref} className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-30" style={{ minWidth: 220 }}>
      {step === 'pick-filter' ? (
        <>
          <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
            Add Filter
          </div>
          <div className="py-1 max-h-72 overflow-y-auto">
            {FILTER_DEFS.map(def => (
              <button
                key={def.id}
                disabled={alreadyActive(def.id)}
                onClick={() => { setSelectedDef(def); setStep('pick-value'); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${alreadyActive(def.id) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-[rgba(91,91,214,0.05)] hover:text-[#5B5BD6]'}`}
              >
                <span>{def.label}</span>
                <span className="flex items-center gap-1.5">
                  {def.isNew && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[9px] font-bold uppercase">New</span>}
                  <ChevronDown size={10} className="-rotate-90 text-gray-400" />
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-50">
            <button onClick={() => setStep('pick-filter')} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronDown size={12} className="rotate-90" />
            </button>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{selectedDef?.label}</span>
          </div>
          <div className="py-1">
            {selectedDef?.values.map(v => (
              <button
                key={v.id}
                onClick={() => { onAdd({ filterId: selectedDef.id, valueId: v.id }); onClose(); }}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-[rgba(91,91,214,0.05)] hover:text-[#5B5BD6] transition-colors"
              >
                {v.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showSegmentDropdown, setShowSegmentDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { filterId: 'icpFit', valueId: 'Strong' },
  ]);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openAccount, setOpenAccount] = useState<Account | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const segRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (segRef.current && !segRef.current.contains(e.target as Node)) setShowSegmentDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getFilteredAccounts = () => {
    let filtered = accounts;

    if (selectedSegment === 'crmImport') {
      filtered = filtered.filter(a => a.source === 'crm-import');
    } else if (selectedSegment === 'deanon') {
      filtered = filtered.filter(a => a.source !== 'crm-import' && (a.numDevs ?? 0) > 0);
    } else if (selectedSegment === 'highActivity') {
      filtered = filtered.filter(a => a.scoreLevel === 'High');
    }

    for (const f of activeFilters) {
      if (f.filterId === 'icpFit') filtered = filtered.filter(a => a.icpFit === f.valueId);
      if (f.filterId === 'devFunnel') filtered = filtered.filter(a => a.devFunnel === f.valueId);
      if (f.filterId === 'activityScore') filtered = filtered.filter(a => a.scoreLevel === f.valueId);
      if (f.filterId === 'employees') filtered = filtered.filter(a => a.employeeRange === f.valueId);
      if (f.filterId === 'hasSignals') {
        if (f.valueId === 'Yes') filtered = filtered.filter(a => a.source !== 'crm-import');
        if (f.valueId === 'No') filtered = filtered.filter(a => a.source === 'crm-import');
      }
      if (f.filterId === 'accountSource') filtered = filtered.filter(a => a.source === f.valueId);
      if (f.filterId === 'newLead') {
        if (f.valueId === 'Yes') filtered = filtered.filter(a => a.tags.includes('New Lead'));
        if (f.valueId === 'No') filtered = filtered.filter(a => !a.tags.includes('New Lead'));
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return filtered;
  };

  const displayedAccounts = getFilteredAccounts();

  const toggleRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    setSelectedRows(selectedRows.length === displayedAccounts.length ? [] : displayedAccounts.map(a => a.id));
  };

  const removeFilter = (filterId: string) => setActiveFilters(prev => prev.filter(f => f.filterId !== filterId));
  const changeFilter = (filterId: string, valueId: string) => setActiveFilters(prev => prev.map(f => f.filterId === filterId ? { ...f, valueId } : f));
  const addFilter = (f: ActiveFilter) => setActiveFilters(prev => [...prev, f]);

  const selectedSegmentLabel = segmentOptions.find(s => s.id === selectedSegment)?.label || 'All Accounts';

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search accounts"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#5B5BD6] focus:ring-1 focus:ring-[rgba(91,91,214,0.3)] w-56 transition-all"
          />
        </div>

        <div className="relative" ref={segRef}>
          <button
            onClick={() => setShowSegmentDropdown(!showSegmentDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 transition-colors"
          >
            <span className="text-gray-400 text-xs">in</span>
            <span className="font-medium">{selectedSegmentLabel}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          {showSegmentDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-72 z-20">
              {segmentOptions.map(seg => (
                <button
                  key={seg.id}
                  onClick={() => { setSelectedSegment(seg.id); setShowSegmentDropdown(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedSegment === seg.id ? 'text-[#5B5BD6] font-medium' : 'text-gray-700'}`}
                >
                  <span>{seg.label}</span>
                  <span className="flex items-center gap-2">
                    {selectedSegment === seg.id && <Check size={13} className="text-[#5B5BD6]" />}
                    {seg.isNew && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        <span className="text-[10px] font-medium text-orange-500">NEW</span>
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 transition-colors">
          Active in: Last 30 Days <ChevronDown size={12} />
        </button>

        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('table')} className={`p-1.5 ${viewMode === 'table' ? 'bg-[#5B5BD6] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'} transition-colors`}>
            <List size={14} />
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#5B5BD6] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'} transition-colors`}>
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center flex-wrap gap-2 px-5 py-2 bg-white border-b border-gray-100 shrink-0">
        {activeFilters.map(f => (
          <FilterChip
            key={f.filterId}
            filter={f}
            onRemove={() => removeFilter(f.filterId)}
            onChange={(v) => changeFilter(f.filterId, v)}
          />
        ))}

        <div className="relative">
          <button
            onClick={() => setShowAddFilter(o => !o)}
            className="flex items-center gap-1 px-2.5 py-1 border border-dashed border-gray-300 rounded-full text-xs text-gray-500 hover:border-[#5B5BD6] hover:text-[#5B5BD6] transition-colors"
          >
            <Plus size={12} /> Add Filter
          </button>
          {showAddFilter && (
            <AddFilterPopover
              activeFilters={activeFilters}
              onAdd={addFilter}
              onClose={() => setShowAddFilter(false)}
            />
          )}
        </div>

        {activeFilters.length > 0 && (
          <button onClick={() => setActiveFilters([])} className="text-xs text-gray-400 hover:text-gray-600 ml-auto transition-colors">
            Clear Filters
          </button>
        )}
      </div>

      {/* Title + bulk actions */}
      <div className="flex items-center justify-between px-5 py-2.5 shrink-0">
        <h1 className="text-sm font-semibold text-gray-800">
          {selectedSegmentLabel}
          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">{displayedAccounts.length}</span>
        </h1>
        {selectedRows.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5B5BD6] font-medium">{selectedRows.length} selected</span>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <Tag size={12} /> Add to List
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <Send size={12} /> Send to HubSpot
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={12} /> Download
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <MoreHorizontal size={12} /> More
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 opacity-50 cursor-not-allowed">
              <Tag size={12} /> Add to List
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 opacity-50 cursor-not-allowed">
              <Send size={12} /> Send to HubSpot
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 opacity-50 cursor-not-allowed">
              <Download size={12} /> Download
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs min-w-[1200px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedRows.length === displayedAccounts.length && displayedAccounts.length > 0}
                  onChange={toggleAll}
                  className="rounded w-3.5 h-3.5 accent-[#5B5BD6]"
                />
              </th>
              {['Name', 'Tags', 'ICP Fit', 'Dev Funnel', 'Activity Score', 'Country', 'State', 'Employees', '# Devs', 'Monthly Active', 'Last Activity', 'Stage', 'CRM Owner'].map(col => (
                <th key={col} className="p-3 text-left text-gray-500 font-medium whitespace-nowrap text-[11px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedAccounts.map((account) => (
              <tr
                key={account.id}
                className="border-b border-gray-50 hover:bg-indigo-50/20 cursor-pointer transition-colors"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName === 'INPUT') return;
                  setOpenAccount(account);
                }}
              >
                <td className="p-3" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedRows.includes(account.id)} onChange={() => toggleRow(account.id)} className="rounded w-3.5 h-3.5 accent-[#5B5BD6]" />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: account.logoColor }}>
                      {account.logo}
                    </div>
                    <span className="font-medium text-gray-800 hover:text-[#5B5BD6] transition-colors">{account.name}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {account.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
                  </div>
                </td>
                <td className="p-3"><ICPBadge fit={account.icpFit} /></td>
                <td className="p-3"><DevFunnelCell stage={account.devFunnel} /></td>
                <td className="p-3"><ScoreBadge level={account.scoreLevel} score={account.score} /></td>
                <td className="p-3 text-gray-600">{account.country}</td>
                <td className="p-3 text-gray-500">{account.state}</td>
                <td className="p-3 text-gray-600">{account.employeeRange}</td>
                <td className="p-3 text-gray-600">{account.numDevs !== null ? account.numDevs : <span className="text-gray-300">--</span>}</td>
                <td className="p-3 text-gray-600">{account.numMonthlyActiveDevs !== null ? account.numMonthlyActiveDevs : <span className="text-gray-300">--</span>}</td>
                <td className="p-3 text-gray-500">
                  {account.lastActivity
                    ? new Date(account.lastActivity).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                    : <span className="text-gray-300">--</span>}
                </td>
                <td className="p-3 text-gray-600">{account.stage || <span className="text-gray-300">--</span>}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#5B5BD6] flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                      {account.crmOwner.charAt(0)}
                    </div>
                    <span className="text-gray-600">{account.crmOwner}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 bg-white shrink-0 text-xs text-gray-500">
        <span>Showing 1–{displayedAccounts.length} of {displayedAccounts.length} accounts</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, '...', 12].map((p, i) => (
            <button key={i} className={`w-6 h-6 flex items-center justify-center rounded text-xs font-medium transition-colors ${p === 1 ? 'bg-[#5B5BD6] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {p}
            </button>
          ))}
        </div>
        <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white">
          <option>20 / page</option>
          <option>50 / page</option>
          <option>100 / page</option>
        </select>
      </div>

      {/* Red banner */}
      <div className="flex items-center gap-2 px-5 py-2 bg-red-50 border-t border-red-100 shrink-0">
        <AlertTriangle size={13} className="text-red-400 shrink-0" />
        <p className="text-xs text-red-700">
          <strong>Accounts limit exhausted.</strong> New accounts, contacts, and their activities are no longer being tracked.{' '}
          <span className="underline cursor-pointer hover:text-red-900">Learn more</span>
        </p>
      </div>

      {openAccount && <AccountDrawer account={openAccount} onClose={() => setOpenAccount(null)} />}
    </div>
  );
}
