'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, CheckCircle, Clock, RefreshCw, Info, ArrowUpDown,
  Download, Upload, Loader2, Check, AlertCircle, X, Shield, ExternalLink,
  Calendar, ChevronDown
} from 'lucide-react';

// ── Small helpers ─────────────────────────────────────────────────────────────

const HubSpotLogo = ({ size = 32 }: { size?: number }) => (
  <div
    className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
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
      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300"
      style={{ left: on ? 'calc(100% - 22px)' : '2px' }}
    />
  </button>
);

// ── Re-auth modal ─────────────────────────────────────────────────────────────

function ReauthModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [step, setStep] = useState<'prompt' | 'connecting' | 'done'>('prompt');

  const handleConnect = () => {
    setStep('connecting');
    setTimeout(() => {
      setStep('done');
      setTimeout(onConfirm, 900);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Shield size={18} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Additional permissions required</h2>
              <p className="text-xs text-gray-400 mt-0.5">One-time re-authorization with HubSpot</p>
            </div>
          </div>
          {step === 'prompt' && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {step === 'prompt' && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                To import accounts, Reo needs <strong>read access</strong> to your HubSpot company records.
                Your current connection was set up for export only.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Permissions being added</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { scope: 'crm.objects.companies.read', desc: 'Read company domains and CRM fields' },
                    { scope: 'crm.objects.contacts.read', desc: 'Required by HubSpot for CRM access' },
                  ].map(({ scope, desc }) => (
                    <div key={scope} className="flex items-start gap-2">
                      <Check size={13} className="text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <code className="text-xs text-[#5B5BD6] bg-[rgba(91,91,214,0.07)] px-1.5 py-0.5 rounded">{scope}</code>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-5">
                No new HubSpot account needed — you'll simply approve the additional scopes in the HubSpot consent screen.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleConnect}
                  className="flex items-center gap-2 flex-1 justify-center px-4 py-2.5 bg-[#FF7A59] text-white text-sm font-semibold rounded-xl hover:bg-[#e8694a] transition-all shadow-sm"
                >
                  <ExternalLink size={14} />
                  Re-authorize with HubSpot
                </button>
                <button onClick={onCancel} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </>
          )}

          {step === 'connecting' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
                <Loader2 size={24} className="text-orange-500 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-800">Connecting to HubSpot…</p>
                <p className="text-xs text-gray-400 mt-1">Approving additional permissions</p>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle size={24} className="text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-800">Re-authorized successfully</p>
                <p className="text-xs text-gray-400 mt-1">CRM import is now available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Domain validation mock data ───────────────────────────────────────────────

interface DomainResult { domain: string; found: boolean }
const domainValidationResults: DomainResult[] = [
  { domain: 'stripe.com', found: true },
  { domain: 'twilio.com', found: true },
  { domain: 'datadog.com', found: true },
  { domain: 'snowflake.com', found: true },
  { domain: 'figma.com', found: true },
  { domain: 'unknowncompany.io', found: false },
];

const CRM_STAGES = [
  { id: 'subscriber', label: 'Subscriber' },
  { id: 'lead', label: 'Lead' },
  { id: 'marketingqualifiedlead', label: 'Marketing Qualified Lead (MQL)' },
  { id: 'salesqualifiedlead', label: 'Sales Qualified Lead (SQL)' },
  { id: 'opportunity', label: 'Opportunity' },
  { id: 'customer', label: 'Customer' },
  { id: 'evangelist', label: 'Evangelist' },
  { id: 'other', label: 'Other' },
];

const SCHEDULE_OPTIONS = [
  { id: 'daily-3am', label: 'Daily at 3:00 AM UTC' },
  { id: 'daily-6am', label: 'Daily at 6:00 AM UTC' },
  { id: 'daily-12pm', label: 'Daily at 12:00 PM UTC' },
  { id: 'daily-9pm', label: 'Daily at 9:00 PM UTC' },
  { id: 'weekly-mon', label: 'Weekly on Monday' },
  { id: 'weekly-fri', label: 'Weekly on Friday' },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HubSpotPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');

  // Auth state
  const [isReauthed, setIsReauthed] = useState(false);
  const [showReauth, setShowReauth] = useState(false);

  // Import state
  const [importEnabled, setImportEnabled] = useState(false);
  const [importSource, setImportSource] = useState<'all' | 'stage' | 'domains'>('stage');
  const [selectedStages, setSelectedStages] = useState<string[]>(['lead', 'salesqualifiedlead']);
  const [domains, setDomains] = useState('stripe.com\ntwilio.com\ndatadog.com\nsnowflake.com\nfigma.com\nunknowncompany.io');
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'validated'>('idle');
  const [importState, setImportState] = useState<'idle' | 'importing' | 'imported'>('idle');
  const [stageImportState, setStageImportState] = useState<'idle' | 'importing' | 'imported'>('idle');

  // Sync state
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [autoSync, setAutoSync] = useState(true);
  const [schedule, setSchedule] = useState('daily-3am');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [syncSaved, setSyncSaved] = useState(false);

  // Export state
  const [exportEnabled, setExportEnabled] = useState(true);

  const validCount = domainValidationResults.filter(r => r.found).length;
  const skipCount = domainValidationResults.filter(r => !r.found).length;

  const handleToggleImport = () => {
    if (!importEnabled && !isReauthed) {
      setShowReauth(true);
    } else {
      setImportEnabled(v => !v);
    }
  };

  const handleReauthConfirm = () => {
    setShowReauth(false);
    setIsReauthed(true);
    setImportEnabled(true);
  };

  const handleValidate = () => {
    setValidationState('validating');
    setTimeout(() => setValidationState('validated'), 1200);
  };

  const handleImport = () => {
    setImportState('importing');
    setTimeout(() => setImportState('imported'), 1800);
  };

  const handleStageImport = () => {
    setStageImportState('importing');
    setTimeout(() => setStageImportState('imported'), 1800);
  };

  const handleSyncNow = () => {
    setSyncState('syncing');
    setTimeout(() => setSyncState('synced'), 2000);
  };

  const handleSaveSchedule = () => {
    setSyncSaved(true);
    setTimeout(() => setSyncSaved(false), 2500);
  };

  const toggleStage = (id: string) => {
    setSelectedStages(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    setStageImportState('idle');
  };

  const scheduleLabel = SCHEDULE_OPTIONS.find(s => s.id === schedule)?.label || schedule;

  // Estimate count for selected stages
  const stageCountMap: Record<string, number> = {
    subscriber: 12, lead: 87, marketingqualifiedlead: 45, salesqualifiedlead: 32,
    opportunity: 18, customer: 94, evangelist: 7, other: 23,
  };
  const estimatedStageCount = selectedStages.reduce((sum, s) => sum + (stageCountMap[s] || 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {showReauth && (
        <ReauthModal
          onConfirm={handleReauthConfirm}
          onCancel={() => setShowReauth(false)}
        />
      )}

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
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: 'HubSpot → Reo.Dev', connected: importEnabled },
            { label: 'Reo.Dev → HubSpot', connected: true },
          ].map(({ label, connected }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">{label}:</span>
              <span className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-gray-400'}`}>
                {connected ? 'Connected' : 'Not configured'}
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
          Import <span className="text-gray-400 font-normal text-xs">(HubSpot → Reo)</span>
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'export' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Download size={14} />
          Export <span className="text-gray-400 font-normal text-xs">(Reo → HubSpot)</span>
        </button>
      </div>

      {/* ── IMPORT TAB ── */}
      {activeTab === 'import' && (
        <div className="flex flex-col gap-4">
          {/* Enable toggle */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Enable CRM Account Import</h2>
                <p className="text-sm text-gray-500 mt-0.5">Import companies from HubSpot and enrich them with Reo's 3rd-party intelligence</p>
              </div>
              <Toggle on={importEnabled} onToggle={handleToggleImport} />
            </div>
            {!isReauthed && !importEnabled && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <Shield size={12} className="text-orange-400 shrink-0" />
                <p className="text-xs text-gray-400">
                  Enabling import requires re-authorization with HubSpot to grant read permissions.
                </p>
              </div>
            )}
            {isReauthed && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <CheckCircle size={12} className="text-green-500 shrink-0" />
                <p className="text-xs text-green-600 font-medium">Re-authorized — read permissions granted</p>
              </div>
            )}
          </div>

          {importEnabled ? (
            <>
              {/* Import Source */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">What to import</h3>
                <p className="text-xs text-gray-400 mb-4">Choose how to select which HubSpot companies to bring into Reo</p>
                <div className="flex flex-col gap-3">
                  {/* Option: All */}
                  <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-gray-100 hover:border-[rgba(91,91,214,0.4)] hover:bg-[rgba(91,91,214,0.02)] transition-all">
                    <input type="radio" name="importSource" value="all" checked={importSource === 'all'} onChange={() => setImportSource('all')} className="mt-0.5 accent-[#5B5BD6]" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Import all companies</p>
                      <p className="text-xs text-gray-400">All companies in your HubSpot account (~1,248 estimated)</p>
                    </div>
                  </label>

                  {/* Option: By stage */}
                  <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-gray-100 hover:border-[rgba(91,91,214,0.4)] hover:bg-[rgba(91,91,214,0.02)] transition-all" style={importSource === 'stage' ? { borderColor: 'rgba(91,91,214,0.5)', background: 'rgba(91,91,214,0.02)' } : {}}>
                    <input type="radio" name="importSource" value="stage" checked={importSource === 'stage'} onChange={() => setImportSource('stage')} className="mt-0.5 accent-[#5B5BD6]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Filter by CRM lifecycle stage</p>
                      <p className="text-xs text-gray-400 mb-3">Import companies matching one or more HubSpot lifecycle stages</p>

                      {importSource === 'stage' && (
                        <>
                          <div className="grid grid-cols-2 gap-1.5">
                            {CRM_STAGES.map(s => (
                              <label
                                key={s.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs ${selectedStages.includes(s.id) ? 'border-[#5B5BD6] bg-[rgba(91,91,214,0.07)] text-[#5B5BD6] font-medium' : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'}`}
                              >
                                <input type="checkbox" checked={selectedStages.includes(s.id)} onChange={() => toggleStage(s.id)} className="hidden" />
                                {selectedStages.includes(s.id) ? <Check size={11} className="shrink-0" /> : <span className="w-2.5 h-2.5 rounded border border-gray-300 shrink-0" />}
                                <span>{s.label}</span>
                                <span className="ml-auto text-gray-400 font-normal">{stageCountMap[s.id]}</span>
                              </label>
                            ))}
                          </div>
                          {selectedStages.length > 0 && (
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                              <p className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">{estimatedStageCount} companies</span> estimated across {selectedStages.length} stage{selectedStages.length !== 1 ? 's' : ''}
                              </p>
                              {stageImportState === 'idle' && (
                                <button onClick={handleStageImport} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5B5BD6] text-white text-xs font-semibold rounded-lg hover:bg-[#4a4ac0] transition-all">
                                  Import {estimatedStageCount} companies <ChevronRight size={12} />
                                </button>
                              )}
                              {stageImportState === 'importing' && (
                                <span className="flex items-center gap-1.5 text-xs text-[#5B5BD6]">
                                  <Loader2 size={12} className="animate-spin" /> Queuing…
                                </span>
                              )}
                              {stageImportState === 'imported' && (
                                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                  <CheckCircle size={12} /> Import started
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </label>

                  {/* Option: Domain list */}
                  <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-gray-100 hover:border-[rgba(91,91,214,0.4)] hover:bg-[rgba(91,91,214,0.02)] transition-all">
                    <input type="radio" name="importSource" value="domains" checked={importSource === 'domains'} onChange={() => setImportSource('domains')} className="mt-0.5 accent-[#5B5BD6]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Paste specific domains</p>
                      <p className="text-xs text-gray-400">Manually enter company domains — useful for a curated target list</p>

                      {importSource === 'domains' && (
                        <div className="mt-3">
                          <textarea
                            value={domains}
                            onChange={e => { setDomains(e.target.value); setValidationState('idle'); setImportState('idle'); }}
                            rows={5}
                            placeholder={`stripe.com\ntwilio.com\nacme.com`}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#5B5BD6] focus:ring-1 focus:ring-[rgba(91,91,214,0.3)] resize-none bg-gray-50 transition-all"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400">One domain per line</p>
                            <button
                              onClick={handleValidate}
                              disabled={validationState === 'validating' || !domains.trim()}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5B5BD6] text-white text-xs font-semibold rounded-lg hover:bg-[#4a4ac0] disabled:opacity-60 transition-all"
                            >
                              {validationState === 'validating' ? <><Loader2 size={12} className="animate-spin" /> Validating…</> : <>Validate <ChevronRight size={12} /></>}
                            </button>
                          </div>

                          {validationState === 'validated' && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="flex flex-col gap-1.5 mb-3">
                                {domainValidationResults.map((r) => (
                                  <div key={r.domain} className="flex items-center gap-2">
                                    {r.found ? <Check size={12} className="text-green-500 shrink-0" /> : <AlertCircle size={12} className="text-yellow-500 shrink-0" />}
                                    <span className={`text-xs font-mono ${r.found ? 'text-gray-700' : 'text-gray-400'}`}>{r.domain}</span>
                                    <span className={`text-xs ml-auto ${r.found ? 'text-green-600' : 'text-yellow-500'}`}>
                                      {r.found ? 'matched ✓' : 'not found — skipped'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mb-3">
                                <span className="text-green-600 font-semibold">{validCount} valid</span>
                                {' · '}
                                <span className="text-yellow-600 font-semibold">{skipCount} skipped</span>
                              </p>
                              {importState === 'idle' && (
                                <button onClick={handleImport} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5B5BD6] text-white text-xs font-semibold rounded-lg hover:bg-[#4a4ac0] transition-all">
                                  Import {validCount} companies <ChevronRight size={12} />
                                </button>
                              )}
                              {importState === 'importing' && <span className="flex items-center gap-1.5 text-xs text-[#5B5BD6]"><Loader2 size={12} className="animate-spin" /> Queuing…</span>}
                              {importState === 'imported' && (
                                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                  <CheckCircle size={12} /> Import started — {validCount} companies queued for enrichment
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Sync settings */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Sync Settings</h3>

                {/* Manual sync */}
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Manual sync</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        Last synced: 19 Mar 2026 at 3:42 AM
                        {syncState === 'synced' && <span className="text-green-600 font-medium ml-1.5">· Just now ✓</span>}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSyncNow}
                    disabled={syncState === 'syncing'}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#5B5BD6] text-[#5B5BD6] rounded-lg text-xs font-medium hover:bg-[rgba(91,91,214,0.08)] transition-all disabled:opacity-60"
                  >
                    {syncState === 'syncing' ? <><Loader2 size={12} className="animate-spin" /> Syncing…</> : <><RefreshCw size={12} /> Sync Now</>}
                  </button>
                </div>

                {/* Scheduled sync */}
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Automatic sync</p>
                      <p className="text-xs text-gray-400">Automatically import new HubSpot companies on a schedule</p>
                    </div>
                    <Toggle on={autoSync} onToggle={() => setAutoSync(v => !v)} />
                  </div>

                  {autoSync && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Calendar size={13} className="text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500">Schedule:</span>
                        <div className="relative">
                          <button
                            onClick={() => setScheduleOpen(o => !o)}
                            className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white hover:border-[#5B5BD6] transition-colors min-w-[200px]"
                          >
                            <span className="flex-1 text-left">{scheduleLabel}</span>
                            <ChevronDown size={11} className="text-gray-400" />
                          </button>
                          {scheduleOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[220px] z-20">
                              {SCHEDULE_OPTIONS.map(opt => (
                                <button
                                  key={opt.id}
                                  onClick={() => { setSchedule(opt.id); setScheduleOpen(false); setSyncSaved(false); }}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${schedule === opt.id ? 'text-[#5B5BD6] bg-[rgba(91,91,214,0.06)]' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                  {opt.label}
                                  {schedule === opt.id && <Check size={11} className="text-[#5B5BD6]" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleSaveSchedule}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${syncSaved ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-[#5B5BD6] text-white hover:bg-[#4a4ac0]'}`}
                      >
                        {syncSaved ? <><Check size={11} /> Saved</> : 'Save schedule'}
                      </button>
                    </div>
                  )}
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
                    <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center ${color} mb-3`}>{icon}</div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Scope note */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700">
                  Reo reads company domain and CRM fields from HubSpot. All enrichment data (firmographics, hiring signals, ICP fit) comes from Reo's 3P database — not from HubSpot.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4">
                <Upload size={22} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 font-medium">CRM Import is disabled</p>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">
                Toggle the switch above to enable importing HubSpot companies into Reo for 3rd-party enrichment
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── EXPORT TAB ── */}
      {activeTab === 'export' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Export Settings</h2>
                <p className="text-sm text-gray-500 mt-0.5">Push Reo signals and scores to HubSpot company records</p>
              </div>
              <Toggle on={exportEnabled} onToggle={() => setExportEnabled(!exportEnabled)} />
            </div>
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
                        <input type="checkbox" defaultChecked={overwrite} className="rounded w-3.5 h-3.5 accent-[#5B5BD6]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
