'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, CheckCircle, Clock, RefreshCw, Info, ArrowUpDown,
  Download, Upload, Loader2, Check, AlertCircle
} from 'lucide-react';

const HubSpotLogo = ({ size = 32 }: { size?: number }) => (
  <div
    className="rounded-full flex items-center justify-center text-white font-bold"
    style={{ width: size, height: size, background: '#FF7A59', fontSize: size * 0.3 }}
  >
    HS
  </div>
);

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ${on ? 'bg-[#5B5BD6]' : 'bg-gray-200'}`}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${on ? 'left-5.5 translate-x-5' : 'left-0.5'}`}
      style={{ left: on ? 'calc(100% - 22px)' : '2px' }}
    />
  </button>
);

interface DomainResult {
  domain: string;
  found: boolean;
}

const domainValidationResults: DomainResult[] = [
  { domain: 'stripe.com', found: true },
  { domain: 'twilio.com', found: true },
  { domain: 'datadog.com', found: true },
  { domain: 'snowflake.com', found: true },
  { domain: 'figma.com', found: true },
  { domain: 'unknowncompany.io', found: false },
];

export default function HubSpotPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importEnabled, setImportEnabled] = useState(false);
  const [importSource, setImportSource] = useState<'all' | 'domains'>('domains');
  const [domains, setDomains] = useState('stripe.com\ntwilio.com\ndatadog.com\nsnowflake.com\nfigma.com\nunknowncompany.io');
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'validated'>('idle');
  const [importState, setImportState] = useState<'idle' | 'importing' | 'imported'>('idle');
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [exportEnabled, setExportEnabled] = useState(true);

  const validCount = domainValidationResults.filter(r => r.found).length;
  const skipCount = domainValidationResults.filter(r => !r.found).length;

  const handleValidate = () => {
    setValidationState('validating');
    setTimeout(() => setValidationState('validated'), 1200);
  };

  const handleImport = () => {
    setImportState('importing');
    setTimeout(() => setImportState('imported'), 1800);
  };

  const handleSyncNow = () => {
    setSyncState('syncing');
    setTimeout(() => setSyncState('synced'), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <button onClick={() => router.push('/dashboard/integration')} className="hover:text-[#5B5BD6] transition-colors">
          Integrations
        </button>
        <ChevronRight size={14} />
        <span className="font-medium text-gray-800">HubSpot</span>
      </div>

      {/* Overview card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <HubSpotLogo size={48} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">HubSpot</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Connected on 05 Feb 2025</p>
            </div>
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">
            Disconnect
          </button>
        </div>
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: 'HubSpot → Reo.Dev', connected: true },
            { label: 'Reo.Dev → HubSpot', connected: true },
          ].map(({ label, connected }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">{label}:</span>
              <span className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-gray-400'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'import' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Upload size={14} />
          Import <span className="text-gray-400 font-normal">(HubSpot → Reo)</span>
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'export' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Download size={14} />
          Export <span className="text-gray-400 font-normal">(Reo → HubSpot)</span>
        </button>
      </div>

      {/* ---- IMPORT TAB ---- */}
      {activeTab === 'import' && (
        <div className="flex flex-col gap-4">
          {/* Enable toggle card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Enable CRM Account Import</h2>
                <p className="text-sm text-gray-500 mt-0.5">Import companies from HubSpot and enrich them with Reo's 3rd-party intelligence</p>
              </div>
              <Toggle on={importEnabled} onToggle={() => setImportEnabled(!importEnabled)} />
            </div>
          </div>

          {/* Settings (shown only when toggle is ON) */}
          {importEnabled && (
            <>
              {/* Import source */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Import Source</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="importSource"
                      value="all"
                      checked={importSource === 'all'}
                      onChange={() => setImportSource('all')}
                      className="mt-0.5 accent-[#5B5BD6]"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-[#5B5BD6] transition-colors">Import all companies</p>
                      <p className="text-xs text-gray-400">Import all companies from my HubSpot account</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="importSource"
                      value="domains"
                      checked={importSource === 'domains'}
                      onChange={() => setImportSource('domains')}
                      className="mt-0.5 accent-[#5B5BD6]"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-[#5B5BD6] transition-colors">Select by domain list</p>
                      <p className="text-xs text-gray-400">Paste company domains to import specific accounts</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Domain entry */}
              {importSource === 'domains' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Company Domains</h3>
                  <p className="text-xs text-gray-400 mb-3">One domain per line, or comma-separated</p>
                  <textarea
                    value={domains}
                    onChange={e => { setDomains(e.target.value); setValidationState('idle'); setImportState('idle'); }}
                    rows={6}
                    placeholder={`Enter one domain per line\nacme.com\nstripe.com\ntwilio.com`}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#5B5BD6] focus:ring-1 focus:ring-[rgba(91,91,214,0.3)] resize-none bg-gray-50 transition-all"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleValidate}
                      disabled={validationState === 'validating' || !domains.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-[#5B5BD6] text-white text-sm font-medium rounded-lg hover:bg-[#4a4ac0] disabled:opacity-60 transition-all"
                    >
                      {validationState === 'validating' ? (
                        <><Loader2 size={14} className="animate-spin" /> Validating…</>
                      ) : (
                        <>Validate Domains <ChevronRight size={14} /></>
                      )}
                    </button>
                  </div>

                  {/* Validation results */}
                  {validationState === 'validated' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Domain validation results:</p>
                      <div className="flex flex-col gap-1.5 mb-4">
                        {domainValidationResults.map((r) => (
                          <div key={r.domain} className="flex items-center gap-2">
                            {r.found ? (
                              <Check size={13} className="text-green-500 shrink-0" />
                            ) : (
                              <AlertCircle size={13} className="text-yellow-500 shrink-0" />
                            )}
                            <span className={`text-sm font-mono ${r.found ? 'text-gray-700' : 'text-gray-400'}`}>{r.domain}</span>
                            <span className={`text-xs ${r.found ? 'text-green-600' : 'text-yellow-600'}`}>
                              {r.found ? '— matched in HubSpot' : '— not found in HubSpot (will be skipped)'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mb-4">
                        <span className="text-green-600 font-semibold">{validCount} domains valid</span>
                        {' · '}
                        <span className="text-yellow-600 font-semibold">{skipCount} skipped</span>
                      </p>

                      {importState === 'idle' && (
                        <button
                          onClick={handleImport}
                          className="flex items-center gap-2 px-4 py-2 bg-[#5B5BD6] text-white text-sm font-semibold rounded-lg hover:bg-[#4a4ac0] transition-all shadow-sm"
                        >
                          Import {validCount} Companies <ChevronRight size={14} />
                        </button>
                      )}
                      {importState === 'importing' && (
                        <div className="flex items-center gap-2 text-sm text-[#5B5BD6]">
                          <Loader2 size={14} className="animate-spin" /> Queuing accounts for enrichment…
                        </div>
                      )}
                      {importState === 'imported' && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                          <CheckCircle size={14} className="text-green-500" />
                          Import started — {validCount} companies queued for enrichment
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Sync settings */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Sync Settings</h3>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Accounts are synced from HubSpot daily</p>
                  <button
                    onClick={handleSyncNow}
                    disabled={syncState === 'syncing'}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#5B5BD6] text-[#5B5BD6] rounded-lg text-xs font-medium hover:bg-[rgba(91,91,214,0.08)] transition-all disabled:opacity-60"
                  >
                    {syncState === 'syncing' ? (
                      <><Loader2 size={12} className="animate-spin" /> Syncing…</>
                    ) : (
                      <><RefreshCw size={12} /> Sync Now</>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">
                    Last synced: 2026-03-19 at 3:42 AM
                    {syncState === 'synced' && <span className="text-green-600 font-medium ml-2">· Just now ✓</span>}
                  </span>
                </div>
              </div>

              {/* Import stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Download size={16} />, value: '420', label: 'accounts imported', color: 'text-[#5B5BD6]', bg: 'bg-[rgba(91,91,214,0.08)]' },
                  { icon: <CheckCircle size={16} />, value: '387', label: 'enriched', color: 'text-green-600', bg: 'bg-green-50' },
                  { icon: <Clock size={16} />, value: '33', label: 'pending enrichment', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                ].map(({ icon, value, label, color, bg }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center ${color} mb-3`}>
                      {icon}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Scope note */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700">
                  To import accounts, Reo needs read access to your HubSpot company records. Your existing connection already includes this.{' '}
                  <a href="#" className="underline font-medium hover:text-blue-900">Re-authorize if needed ↗</a>
                </p>
              </div>
            </>
          )}

          {/* Disabled state hint */}
          {!importEnabled && (
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3">
                <Upload size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">CRM Import is disabled</p>
              <p className="text-xs text-gray-400 mt-1">Toggle the switch above to enable importing HubSpot accounts into Reo</p>
            </div>
          )}
        </div>
      )}

      {/* ---- EXPORT TAB ---- */}
      {activeTab === 'export' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Export Settings</h2>
                <p className="text-sm text-gray-500 mt-0.5">Push Reo signals and scores to HubSpot company records</p>
              </div>
              <Toggle on={exportEnabled} onToggle={() => setExportEnabled(!exportEnabled)} />
            </div>
            <div className="mb-1">
              <p className="text-sm font-semibold text-gray-700 mb-3">Enable Reo to HubSpot Export</p>
              <div className="overflow-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Reo Field</th>
                      <th className="px-4 py-2.5 text-left text-gray-500 font-medium">HubSpot Property</th>
                      <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Auto Overwrite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { reo: 'ICP Fit Score', hs: 'hs_icp_fit', overwrite: true },
                      { reo: 'Developer Activity Score', hs: 'hs_dev_score', overwrite: true },
                      { reo: 'Dev Funnel Stage', hs: 'hs_dev_funnel', overwrite: true },
                      { reo: 'Hiring Signal Count', hs: 'hs_hiring_signals', overwrite: false },
                      { reo: 'Developer Count', hs: 'hs_developer_count', overwrite: false },
                    ].map(({ reo, hs, overwrite }) => (
                      <tr key={reo} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-gray-700">{reo}</td>
                        <td className="px-4 py-2.5 font-mono text-[#5B5BD6] bg-[rgba(91,91,214,0.03)]">{hs}</td>
                        <td className="px-4 py-2.5">
                          <input
                            type="checkbox"
                            defaultChecked={overwrite}
                            className="rounded w-3.5 h-3.5 accent-[#5B5BD6]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#5B5BD6] text-white text-sm font-medium rounded-lg hover:bg-[#4a4ac0] transition-all">
                <ArrowUpDown size={14} />
                Save Field Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
