'use client';
import { useState } from 'react';
import {
  X, Globe, Linkedin, Bell, Flag, ClipboardList, ArrowDownToLine,
  BarChart2, Clock, Briefcase, UserCheck, UsersRound, Github, ExternalLink,
  MapPin, Star, FileText, Radio, ChevronDown, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Account, activityScoreData, hiringTrendsData, stripeHiringData, developers, stripeDevs, jobPostings, stripeJobPostings } from '@/data/mockData';

const HubSpotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#FF7A59" />
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="system-ui">HS</text>
  </svg>
);

const DevFunnelBar = ({ stage }: { stage: string | null }) => {
  const stages = ['Exploring', 'Evaluating', 'Building', 'Deployed'];
  const activeIdx = stage ? stages.indexOf(stage) : -1;
  if (stage === null) {
    return (
      <div>
        <div className="flex gap-1 mb-3">
          {stages.map((s) => (
            <div key={s} className="flex-1 h-2 rounded-full bg-gray-100" />
          ))}
        </div>
        <div className="flex gap-1 mb-2">
          {stages.map((s) => (
            <div key={s} className="flex-1 text-center text-xs text-gray-300">{s}</div>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Not tracked yet
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Connect your product integrations to track developer evaluation activity
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="flex gap-1 mb-1">
        {stages.map((s, i) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${i <= activeIdx ? 'bg-[#5B5BD6]' : 'bg-gray-100'}`} />
        ))}
      </div>
      <div className="flex gap-1 mb-2">
        {stages.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-xs ${i === activeIdx ? 'text-[#5B5BD6] font-semibold' : 'text-gray-400'}`}>{s}</div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {stage === 'Exploring' && 'Developers are discovering your product'}
        {stage === 'Evaluating' && 'Developers are assessing your product'}
        {stage === 'Building' && 'Developers are building a POC with your product'}
        {stage === 'Deployed' && 'Developers have deployed your product in production'}
      </p>
    </div>
  );
};

const ICPBadge = ({ fit }: { fit: string }) => {
  if (fit === 'Strong') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Strong</span>;
  if (fit === 'Moderate') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Moderate</span>;
  return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Weak</span>;
};

const ScoreBadge = ({ level, score }: { level: string; score: number | null }) => {
  if (level === 'N/A') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-400">N/A</span>;
  if (level === 'High') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">HIGH {score}</span>;
  if (level === 'Medium') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">MEDIUM {score}</span>;
  return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">LOW {score}</span>;
};

// ---- Tab content components ----

const OverviewTab = ({ account }: { account: Account }) => {
  const [expanded, setExpanded] = useState(false);
  const posts = account.source === 'crm-import' ? stripeJobPostings : jobPostings;
  return (
    <div className="flex gap-5">
      {/* Left */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <p className={`text-sm text-gray-600 leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
            {account.description}
          </p>
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-[#5B5BD6] mt-1 hover:underline">
            {expanded ? 'Show less' : 'Read More'}
          </button>
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Industry Keywords</p>
          <div className="flex flex-wrap gap-1">
            {account.industryKeywords.map((kw) => (
              <span key={kw} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{kw}</span>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Firmographics</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {[
              ['Country', account.country === 'US' ? 'United States' : account.country],
              ['Industry', account.industry],
              ['State', account.state],
              ['Founded In', account.founded],
              ['Funding Stage', '-'],
              ['No of Employees', account.employeeRange],
              ['Funding Amount', '-'],
              ['Annual Revenue', account.revenue],
              ['CRM Account Stage', account.stage],
              ['CRM Deal Stage', '-'],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-2">
                <span className="text-gray-400 text-xs w-28 shrink-0">{label}:</span>
                <span className="text-gray-700 text-xs font-medium">{val}</span>
              </div>
            ))}
            <div className="flex gap-2 col-span-2">
              <span className="text-gray-400 text-xs w-28 shrink-0">ICP Fit Score:</span>
              <ICPBadge fit={account.icpFit} />
            </div>
            {account.source === 'crm-import' && (
              <div className="flex gap-2 col-span-2 mt-1">
                <span className="text-gray-400 text-xs w-28 shrink-0">Account Source:</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#FF7A59] flex items-center justify-center">
                    <span className="text-white text-[7px] font-bold">HS</span>
                  </div>
                  <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    HubSpot CRM Import
                  </span>
                  <span className="text-xs text-gray-400">· Imported {account.importedDate ? new Date(account.importedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Right */}
      <div className="w-64 shrink-0">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dev Funnel Stage</p>
          <DevFunnelBar stage={account.devFunnel} />
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Technology Stack</p>
          <p className="text-xs text-gray-500 mb-1">ICP Technologies:</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {account.icpTechnologies.length > 0 ? account.icpTechnologies.map((t) => (
              <span key={t} className="px-2 py-0.5 bg-[rgba(91,91,214,0.1)] text-[#5B5BD6] rounded text-xs border border-[rgba(91,91,214,0.2)]">{t}</span>
            )) : <span className="text-xs text-gray-400">No ICP tech matched</span>}
          </div>
          <p className="text-xs text-gray-500 mb-2">Latest jobs matching ICP technologies ({posts.length}):</p>
          <div className="flex flex-col gap-2">
            {posts.map((j, i) => (
              <div key={i} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs font-medium text-gray-700">{j.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.5 bg-[rgba(91,91,214,0.1)] text-[#5B5BD6] rounded text-[10px]">{j.tech}</span>
                  <span className="text-[10px] text-gray-400">{j.location}</span>
                  <span className="text-[10px] text-gray-400">{j.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityInsightsTab = ({ account }: { account: Account }) => {
  if (account.source === 'crm-import') {
    return (
      <div>
        {/* Empty state banner */}
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50/30 p-8 mb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4">
            <BarChart2 size={24} className="text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-2">No developer activity detected yet</h3>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            This account was imported from your CRM and enriched with third-party data. When developers at this company start interacting with your product, activity insights will appear here.
          </p>
          <button className="mt-4 px-4 py-2 bg-[#5B5BD6] text-white text-sm rounded-lg font-medium hover:bg-[#4a4ac0] transition-colors">
            Connect Product Integrations
          </button>
        </div>
        {/* ICP + firmographic summary still shown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">ICP Fit</p>
            <ICPBadge fit={account.icpFit} />
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Developers in Reo DB</p>
            <span className="text-2xl font-bold text-gray-700">18</span>
            <span className="text-sm text-gray-400 ml-1">developers found</span>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Industry</p>
            <span className="text-sm font-medium text-gray-700">{account.industry}</span>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Employees</p>
            <span className="text-sm font-medium text-gray-700">{account.employeeRange}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-5">
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Developer Activity Score</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={activityScoreData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5B5BD6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5B5BD6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Area type="monotone" dataKey="score" stroke="#5B5BD6" fill="url(#scoreGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="w-56 shrink-0">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Insights</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Developer Activity Score</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">LOW</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Active Developers</span>
              <span className="text-xs font-semibold text-gray-700">4 Developers</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 mb-1 font-medium">Developers by location:</p>
          {[['Washington', 9], ['California', 4], ['Massachusetts', 4]].map(([loc, cnt]) => (
            <div key={loc as string} className="flex items-center justify-between text-xs py-0.5">
              <span className="text-gray-600">{loc}</span>
              <span className="font-medium text-gray-700">{cnt}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Activities</p>
          {[
            ['Owned github actions', 'Star', '1'],
            ['Website activity', 'Page review', '52'],
            ['Documentation activity', 'Docs review', '9'],
            ['Telemetry activity', 'mirrord Version Check', '203'],
            ['LinkedIn activity', 'Reactions', '1'],
          ].map(([cat, act, cnt]) => (
            <div key={cat as string} className="flex flex-col mb-2">
              <span className="text-[10px] text-gray-400">{cat}</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{act}</span>
                <span className="text-xs font-semibold text-gray-700">{cnt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActivityTimelineTab = ({ account }: { account: Account }) => {
  if (account.source === 'crm-import') {
    return (
      <div>
        {/* Banner */}
        <div className="flex items-start gap-3 p-4 mb-5 rounded-lg bg-blue-50 border border-blue-100">
          <AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700">
            Developer activity events will appear here when Reo detects signals like GitHub interactions, documentation visits, or product usage from this company.
          </p>
        </div>
        {/* Single system import event */}
        <div className="flex gap-3 opacity-60">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
              <ArrowDownToLine size={14} className="text-gray-500" />
            </div>
            <div className="w-px flex-1 bg-gray-200 mt-1" />
          </div>
          <div className="pb-4 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">10 Mar 2026</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-medium">CRM</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Imported from HubSpot</p>
            <p className="text-xs text-gray-400 mt-0.5">Account added via CRM Import · 3rd-party enrichment queued</p>
          </div>
        </div>
      </div>
    );
  }

  const events = [
    {
      date: '21 Feb 2026',
      icon: <Star size={14} className="text-yellow-500" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      title: 'shedrach okonofua',
      action: 'Starred on #metalbear-co/mirrord repository on',
      platform: 'Github',
      platformColor: 'bg-gray-100 text-gray-600',
      sub: 'Senior Frontend Engineer · Ontario, Canada',
      detail: null,
    },
    {
      date: '19 Feb 2026',
      icon: <FileText size={14} className="text-blue-500" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      title: 'REO ID 07c233',
      action: 'Viewed Pages on',
      platform: 'Website',
      platformColor: 'bg-blue-100 text-blue-700',
      sub: 'Haifa District, Israel',
      detail: 'mirrod | The fastest way to deliver code | MetalBear',
    },
    {
      date: '19 Feb 2026',
      icon: <Radio size={14} className="text-indigo-500" />,
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      title: 'mirrord Version Check : 3',
      action: '',
      platform: 'Telemetry',
      platformColor: 'bg-indigo-100 text-indigo-700',
      sub: null,
      detail: null,
    },
    {
      date: '18 Feb 2026',
      icon: <Radio size={14} className="text-indigo-500" />,
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      title: 'mirrord Version Check : 6',
      action: '',
      platform: 'Telemetry',
      platformColor: 'bg-indigo-100 text-indigo-700',
      sub: null,
      detail: null,
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors">
          Filter <ChevronDown size={12} />
        </button>
      </div>
      <div className="flex flex-col gap-0">
        {events.map((ev, i) => (
          <div key={i} className="flex gap-3 mb-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full ${ev.bgColor} border ${ev.borderColor} flex items-center justify-center shrink-0`}>
                {ev.icon}
              </div>
              {i < events.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1 mb-1" />}
            </div>
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-gray-400">{ev.date}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${ev.platformColor}`}>{ev.platform}</span>
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-[#5B5BD6] cursor-pointer hover:underline">{ev.title}</span>
                {ev.action && <span className="text-gray-500"> {ev.action} </span>}
              </p>
              {ev.sub && <p className="text-xs text-gray-400 mt-0.5">{ev.sub}</p>}
              {ev.detail && <p className="text-xs text-gray-500 mt-1 px-2 py-1 bg-gray-50 rounded">{ev.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HiringSignalsTab = ({ account }: { account: Account }) => {
  const [hiringSubTab, setHiringSubTab] = useState<'trends' | 'postings'>('trends');
  const data = account.source === 'crm-import' ? stripeHiringData : hiringTrendsData;
  return (
    <div>
      <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
        {(['trends', 'postings'] as const).map((t) => (
          <button key={t} onClick={() => setHiringSubTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${hiringSubTab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'trends' ? 'Hiring Trends' : 'Job Postings'}
          </button>
        ))}
      </div>
      {hiringSubTab === 'trends' ? (
        <div>
          <p className="text-xs text-gray-500 mb-3">ICP vs Non-ICP technology hiring trends</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="tech" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="icp" name="ICP Tech" fill="#5B5BD6" radius={[0, 3, 3, 0]} />
              <Bar dataKey="nonIcp" name="Non-ICP Tech" fill="#E5E7EB" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {(account.source === 'crm-import' ? stripeJobPostings : jobPostings).map((j, i) => (
            <div key={i} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{j.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 bg-[rgba(91,91,214,0.1)] text-[#5B5BD6] rounded text-[10px]">{j.tech}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><MapPin size={9} />{j.location}</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{j.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ActiveDevelopersTab = ({ account }: { account: Account }) => {
  const [devSubTab, setDevSubTab] = useState<'deanon' | 'active'>('deanon');
  const devList = account.source === 'crm-import' ? stripeDevs : developers;

  return (
    <div>
      {account.source === 'crm-import' ? (
        <div className="mb-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <AlertCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">Activity data becomes available when developers interact with your product</p>
        </div>
      ) : (
        <div className="flex gap-4 mb-4 text-sm border-b border-gray-100 pb-1">
          {(['deanon', 'active'] as const).map((t) => (
            <button key={t} onClick={() => setDevSubTab(t)}
              className={`pb-2 text-xs font-medium border-b-2 transition-all ${devSubTab === t ? 'border-[#5B5BD6] text-[#5B5BD6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'deanon' ? `Deanonymised (${developers.filter(d => d.deanonymised).length})` : `Active this Month (${developers.length})`}
            </button>
          ))}
        </div>
      )}

      {account.source === 'crm-import' && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-700 mb-1">Developers at {account.name} <span className="text-xs font-normal text-gray-400 ml-1 px-1.5 py-0.5 bg-gray-100 rounded">Reo DB</span></p>
        </div>
      )}

      {!account.source || account.source === 'signal' ? (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Top locations:</p>
          <div className="flex gap-2">
            {[['Washington', 9], ['California', 4]].map(([loc, cnt]) => (
              <span key={loc as string} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{loc} ({cnt})</span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-400 font-medium">Developer</th>
              <th className="text-left py-2 text-gray-400 font-medium">Designation</th>
              <th className="text-left py-2 text-gray-400 font-medium">Activity Score</th>
              <th className="text-left py-2 text-gray-400 font-medium">Location</th>
            </tr>
          </thead>
          <tbody>
            {devList.map((dev) => (
              <tr key={dev.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#5B5BD6] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                      {dev.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-700 text-xs">{dev.name}</span>
                  </div>
                </td>
                <td className="py-2 text-gray-500">{dev.designation}</td>
                <td className="py-2">
                  {dev.score === null ? (
                    <span className="text-gray-400">--</span>
                  ) : dev.score >= 15 ? (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">HIGH {dev.score}</span>
                  ) : dev.score >= 8 ? (
                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-medium">MED {dev.score}</span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">LOW {dev.score}</span>
                  )}
                </td>
                <td className="py-2 text-gray-500">{dev.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MoreProspectsTab = ({ account }: { account: Account }) => {
  const [prospectsSubTab, setProspectsSubTab] = useState<'reodb' | 'crm' | 'revealed'>('reodb');
  const prospects = [
    { name: 'David Park', title: 'Principal Engineer', location: 'San Francisco, US', tenure: '3 years' },
    { name: 'Ananya Krishnan', title: 'Engineering Manager', location: 'Seattle, US', tenure: '2 years' },
    { name: 'Tom Bergmann', title: 'Senior DevOps Engineer', location: 'Austin, US', tenure: '1 year' },
    { name: 'Yuki Tanaka', title: 'Cloud Architect', location: 'New York, US', tenure: '4 years' },
    { name: 'Layla Hassan', title: 'Staff Software Engineer', location: 'Remote', tenure: '2.5 years' },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-gray-100">
        {[['reodb', `Reo DB (526)`], ['crm', 'CRM Prospects'], ['revealed', 'Revealed']].map(([t, label]) => (
          <button key={t} onClick={() => setProspectsSubTab(t as 'reodb' | 'crm' | 'revealed')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-all ${prospectsSubTab === t ? 'border-[#5B5BD6] text-[#5B5BD6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Select Persona:</span>
          <button className="flex items-center gap-1 px-2 py-1 bg-[rgba(91,91,214,0.1)] text-[#5B5BD6] rounded text-xs font-medium border border-[rgba(91,91,214,0.2)] hover:bg-[rgba(91,91,214,0.2)] transition-colors">
            Reo Recommended <ChevronDown size={10} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100 mb-3">
        <AlertCircle size={13} className="text-blue-500 shrink-0" />
        <p className="text-xs text-blue-700">526 prospects match your criteria</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 text-gray-400 font-medium">Name</th>
            <th className="text-left py-2 text-gray-400 font-medium">Job Title</th>
            <th className="text-left py-2 text-gray-400 font-medium">Location</th>
            <th className="text-left py-2 text-gray-400 font-medium">Tenure</th>
          </tr>
        </thead>
        <tbody>
          {prospects.map((p, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-700">{p.name}</span>
                </div>
              </td>
              <td className="py-2 text-gray-500">{p.title}</td>
              <td className="py-2 text-gray-500">{p.location}</td>
              <td className="py-2 text-gray-500">{p.tenure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ---- Main Drawer ----

interface AccountDrawerProps {
  account: Account | null;
  onClose: () => void;
}

export default function AccountDrawer({ account, onClose }: AccountDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!account) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Briefcase size={12} /> },
    { id: 'insights', label: 'Activity Insights', icon: <BarChart2 size={12} /> },
    { id: 'timeline', label: 'Activity Timeline', icon: <Clock size={12} /> },
    { id: 'hiring', label: 'Hiring Signals', icon: <Briefcase size={12} /> },
    { id: 'developers', label: 'Active Developers', icon: <UserCheck size={12} /> },
    { id: 'prospects', label: 'More Prospects', icon: <UsersRound size={12} /> },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 'min(760px, 90vw)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-start gap-3">
            {/* Logo circle */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ background: account.logoColor }}
            >
              {account.logo}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{account.name}</h2>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors"><Globe size={14} /></a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Linkedin size={14} /></a>
                <a href="#" className="text-gray-400 hover:text-[#FF7A59] transition-colors"><HubSpotIcon /></a>
              </div>
              <div className="flex items-center gap-2">
                {account.source === 'crm-import' ? (
                  <span className="px-2 py-0.5 border border-orange-400 text-orange-600 rounded-full text-xs font-medium bg-orange-50">CRM Import</span>
                ) : (
                  account.stage && (
                    <span className="px-2 py-0.5 border border-green-400 text-green-600 rounded-full text-xs font-medium bg-green-50">{account.stage}</span>
                  )
                )}
                {account.devFunnel && (
                  <span className="px-2 py-0.5 border border-[#5B5BD6] text-[#5B5BD6] rounded-full text-xs font-medium bg-[rgba(91,91,214,0.05)]">
                    {account.devFunnel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <Bell size={12} /> Enable alerts
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <Flag size={12} /> Flag
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <ClipboardList size={12} /> Notes
            </button>
            <button onClick={onClose} className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${activeTab === tab.id
                ? 'border-[#5B5BD6] text-[#5B5BD6]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'overview' && <OverviewTab account={account} />}
          {activeTab === 'insights' && <ActivityInsightsTab account={account} />}
          {activeTab === 'timeline' && <ActivityTimelineTab account={account} />}
          {activeTab === 'hiring' && <HiringSignalsTab account={account} />}
          {activeTab === 'developers' && <ActiveDevelopersTab account={account} />}
          {activeTab === 'prospects' && <MoreProspectsTab account={account} />}
        </div>
      </div>
    </>
  );
}
