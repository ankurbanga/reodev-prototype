'use client';
import { useState } from 'react';
import {
  Search, ChevronDown, X, Plus, LayoutGrid, List,
  AlertTriangle, Download, Send, Tag, MoreHorizontal
} from 'lucide-react';
import { accounts, Account } from '@/data/mockData';
import AccountDrawer from './AccountDrawer';

const ICPBadge = ({ fit }: { fit: string }) => {
  if (fit === 'Strong') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Strong</span>;
  if (fit === 'Moderate') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Moderate</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Weak</span>;
};

const ScoreBadge = ({ level, score }: { level: string; score: number | null }) => {
  if (level === 'N/A') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">N/A</span>;
  if (level === 'High') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{score}</span>;
  if (level === 'Medium') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">{score}</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{score}</span>;
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

const filterOptions = [
  { id: 'devFunnel', label: 'Dev Funnel' },
  { id: 'changeDev', label: 'Change in Dev Funnel' },
  { id: 'changeCrm', label: 'Change in CRM Stage' },
  { id: 'employees', label: 'Employee Range' },
  { id: 'location', label: 'Location →' },
  { id: 'crmStage', label: 'CRM Lifecycle Stage' },
  { id: 'score', label: 'Activity Score' },
  { id: 'newAccount', label: 'New Account' },
  { id: 'newLead', label: 'New Lead' },
  { id: 'surge', label: 'Surge' },
  { id: 'tags', label: 'Account Tags' },
  { id: 'owner', label: 'CRM Account Owner' },
  { id: 'notes', label: 'Has Notes' },
  { id: 'signals', label: 'Has Developer Signals', isNew: true },
  { id: 'source', label: 'Account Source', isNew: true },
];

const segmentOptions = [
  { id: 'all', label: 'All Accounts' },
  { id: 'deanon', label: 'Accounts with Deanonymised Developers' },
  { id: 'highActivity', label: 'High Developer Activity' },
  { id: 'buildingPoc', label: 'Account in Building POC stage' },
  { id: 'crmImport', label: 'CRM Imported Accounts', isNew: true },
];

export default function AccountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showSegmentDropdown, setShowSegmentDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(['icpStrong']);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openAccount, setOpenAccount] = useState<Account | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const getFilteredAccounts = () => {
    let filtered = accounts;
    if (selectedSegment === 'crmImport') {
      filtered = filtered.filter(a => a.source === 'crm-import');
    }
    if (activeFilters.includes('icpStrong')) {
      // default filter - show all if segment is already filtered
      if (selectedSegment === 'crmImport') {
        filtered = filtered;
      }
      // keep Strong ICP filter active for main view
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
    if (selectedRows.length === displayedAccounts.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(displayedAccounts.map(a => a.id));
    }
  };

  const removeFilter = (id: string) => setActiveFilters(prev => prev.filter(f => f !== id));
  const addFilter = (id: string) => {
    setActiveFilters(prev => [...prev, id]);
    setShowFilterDropdown(false);
  };

  const selectedSegmentLabel = segmentOptions.find(s => s.id === selectedSegment)?.label || 'All Accounts';
  const signalCount = accounts.filter(a => a.source === 'signal').length;
  const crmCount = accounts.filter(a => a.source === 'crm-import').length;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white shrink-0">
        {/* Search */}
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

        {/* Segment selector */}
        <div className="relative">
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
                  {seg.label}
                  {seg.isNew && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      <span className="text-[10px] font-medium text-orange-500">NEW</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Active in */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 transition-colors">
          Active in: Last 30 Days <ChevronDown size={12} />
        </button>

        {/* View toggle */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 ${viewMode === 'table' ? 'bg-[#5B5BD6] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'} transition-colors`}
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#5B5BD6] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'} transition-colors`}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-5 py-2 bg-white border-b border-gray-100 shrink-0">
        {/* Active filter chips */}
        {activeFilters.includes('icpStrong') && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-[rgba(91,91,214,0.08)] border border-[rgba(91,91,214,0.3)] rounded-full text-xs text-[#5B5BD6] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B5BD6]" />
            ICP Fit is STRONG
            <button onClick={() => removeFilter('icpStrong')} className="ml-0.5 hover:text-red-500 transition-colors"><X size={10} /></button>
          </span>
        )}
        {activeFilters.filter(f => f !== 'icpStrong').map(f => {
          const opt = filterOptions.find(o => o.id === f);
          return (
            <span key={f} className="flex items-center gap-1 px-2.5 py-1 bg-[rgba(91,91,214,0.08)] border border-[rgba(91,91,214,0.3)] rounded-full text-xs text-[#5B5BD6] font-medium">
              {opt?.label}
              <button onClick={() => removeFilter(f)} className="ml-0.5 hover:text-red-500 transition-colors"><X size={10} /></button>
            </span>
          );
        })}

        {/* Add filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-1 px-2.5 py-1 border border-dashed border-gray-300 rounded-full text-xs text-gray-500 hover:border-[#5B5BD6] hover:text-[#5B5BD6] transition-colors"
          >
            <Plus size={12} /> Add Filter
          </button>
          {showFilterDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-60 z-20">
              {filterOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => addFilter(opt.id)}
                  disabled={activeFilters.includes(opt.id)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${activeFilters.includes(opt.id) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 hover:text-[#5B5BD6]'}`}
                >
                  {opt.label}
                  {opt.isNew && (
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[9px] font-bold uppercase">New</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-2 bg-[rgba(91,91,214,0.05)] border-b border-[rgba(91,91,214,0.2)] shrink-0">
          <span className="text-xs text-[#5B5BD6] font-medium">{selectedRows.length} selected</span>
          <div className="flex items-center gap-2">
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
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs min-w-[1200px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedRows.length === displayedAccounts.length && displayedAccounts.length > 0}
                  onChange={toggleAll}
                  className="rounded w-3.5 h-3.5 accent-[#5B5BD6]"
                />
              </th>
              {[
                'Name', 'Tags', 'ICP Fit', 'Dev Funnel', 'Activity Score',
                'Country', 'State', 'Employees', '# Devs', 'Monthly Active', 'Last Activity', 'Stage', 'CRM Owner'
              ].map(col => (
                <th key={col} className="p-3 text-left text-gray-500 font-medium whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedAccounts.map((account) => (
              <tr
                key={account.id}
                className="border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors account-row"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName === 'INPUT') return;
                  setOpenAccount(account);
                }}
              >
                <td className="p-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(account.id)}
                    onChange={() => toggleRow(account.id)}
                    className="rounded w-3.5 h-3.5 accent-[#5B5BD6]"
                  />
                </td>
                {/* Name */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ background: account.logoColor }}
                    >
                      {account.logo}
                    </div>
                    <span className="font-medium text-gray-800 hover:text-[#5B5BD6] transition-colors">{account.name}</span>
                  </div>
                </td>
                {/* Tags */}
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {account.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
                  </div>
                </td>
                {/* ICP */}
                <td className="p-3"><ICPBadge fit={account.icpFit} /></td>
                {/* Dev funnel */}
                <td className="p-3"><DevFunnelCell stage={account.devFunnel} /></td>
                {/* Score */}
                <td className="p-3"><ScoreBadge level={account.scoreLevel} score={account.score} /></td>
                {/* Country */}
                <td className="p-3 text-gray-600">{account.country}</td>
                {/* State */}
                <td className="p-3 text-gray-600">{account.state}</td>
                {/* Employees */}
                <td className="p-3 text-gray-600">{account.employeeRange}</td>
                {/* # Devs */}
                <td className="p-3 text-gray-600">
                  {account.numDevs !== null ? account.numDevs : <span className="text-gray-300">--</span>}
                </td>
                {/* Monthly active */}
                <td className="p-3 text-gray-600">
                  {account.numMonthlyActiveDevs !== null ? account.numMonthlyActiveDevs : <span className="text-gray-300">--</span>}
                </td>
                {/* Last activity */}
                <td className="p-3 text-gray-500">
                  {account.lastActivity ? new Date(account.lastActivity).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : <span className="text-gray-300">--</span>}
                </td>
                {/* Stage */}
                <td className="p-3 text-gray-600">{account.stage}</td>
                {/* CRM Owner */}
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#5B5BD6] flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                      {account.crmOwner.charAt(0)}
                    </div>
                    <span className="text-gray-600 text-xs">{account.crmOwner}</span>
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
            <button key={i}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs font-medium transition-colors ${p === 1 ? 'bg-[#5B5BD6] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Red banner */}
      <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border-t border-red-200 shrink-0">
        <AlertTriangle size={14} className="text-red-500 shrink-0" />
        <p className="text-xs text-red-700">
          <strong>Accounts limit exhausted.</strong> New accounts, contacts, and their activities are no longer being tracked.{' '}
          <span className="underline cursor-pointer hover:text-red-900">Learn more</span>
        </p>
      </div>

      {/* Drawer */}
      {openAccount && (
        <AccountDrawer account={openAccount} onClose={() => setOpenAccount(null)} />
      )}
    </div>
  );
}
