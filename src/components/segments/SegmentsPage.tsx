'use client';
import { useState } from 'react';
import { Star, ArrowUpRight, ChevronRight, Layers, Plus } from 'lucide-react';
import { segments } from '@/data/mockData';

const TabButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${active ? 'border-[#5B5BD6] text-[#5B5BD6]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}
  >
    {label}
  </button>
);

const mySegments = [
  { name: 'Enterprise Developers - US', count: 124, lastUpdated: '2 days ago' },
  { name: 'GitHub Stargazers - OSS Repo', count: 89, lastUpdated: '1 week ago' },
  { name: 'Docs Heavy Users', count: 67, lastUpdated: '3 days ago' },
  { name: 'Telemetry Active - Last 7d', count: 205, lastUpdated: '1 day ago' },
  { name: 'Series B+ Companies', count: 412, lastUpdated: '5 days ago' },
];

export default function SegmentsPage() {
  const [activeTab, setActiveTab] = useState<'magic' | 'my' | 'shared-me' | 'shared-others'>('magic');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-0 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Segments</h1>
            <p className="text-sm text-gray-500 mt-0.5">Organize and target accounts with smart filters</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#5B5BD6] text-white text-sm font-medium rounded-lg hover:bg-[#4a4ac0] transition-all">
            <Plus size={14} /> Create Segment
          </button>
        </div>
        <div className="flex gap-0 -mb-px">
          <TabButton label={`Magic Segments (${segments.length})`} active={activeTab === 'magic'} onClick={() => setActiveTab('magic')} />
          <TabButton label="My Segments (47)" active={activeTab === 'my'} onClick={() => setActiveTab('my')} />
          <TabButton label="Shared with me (5)" active={activeTab === 'shared-me'} onClick={() => setActiveTab('shared-me')} />
          <TabButton label="Shared with others (2)" active={activeTab === 'shared-others'} onClick={() => setActiveTab('shared-others')} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-5">
        {activeTab === 'magic' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5B5BD6] to-purple-500 flex items-center justify-center">
                <Star size={12} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Magic Segments</h2>
                <p className="text-xs text-gray-400">Auto-generated segments powered by Reo's intelligence</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {segments.map((seg) => (
                <div
                  key={seg.name}
                  className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                    seg.isNew
                      ? 'border-orange-200 bg-orange-50/40 hover:border-orange-300'
                      : 'border-gray-100 bg-white hover:border-[rgba(91,91,214,0.3)]'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      seg.isNew
                        ? 'bg-orange-100'
                        : 'bg-[rgba(91,91,214,0.08)]'
                    }`}>
                      <Layers size={15} className={seg.isNew ? 'text-orange-500' : 'text-[#5B5BD6]'} />
                    </div>

                    {/* Name + description */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{seg.name}</span>
                        {seg.isDefault && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[rgba(91,91,214,0.08)] text-[#5B5BD6] rounded text-[10px] font-bold">
                            <Star size={8} className="fill-[#5B5BD6]" /> DEFAULT
                          </span>
                        )}
                        {seg.isNew && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase border border-orange-200">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{seg.description}</p>
                    </div>
                  </div>

                  {/* Count */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${seg.isNew ? 'text-orange-600' : 'text-gray-800'}`}>{seg.count}</p>
                      {seg.change && (
                        <p className="text-xs text-green-600 font-medium flex items-center gap-0.5 justify-end">
                          <ArrowUpRight size={10} />{seg.change}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400">accounts</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my' && (
          <div>
            <div className="flex flex-col gap-2">
              {mySegments.map((seg) => (
                <div
                  key={seg.name}
                  className="flex items-center p-4 rounded-xl border border-gray-100 bg-white hover:border-[rgba(91,91,214,0.3)] hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                    <Layers size={14} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{seg.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Updated {seg.lastUpdated}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-800">{seg.count}</p>
                      <p className="text-[10px] text-gray-400">accounts</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              ))}
              {/* Show placeholder for the rest */}
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">47 total segments · Showing 5</p>
                <button className="mt-2 text-[#5B5BD6] text-sm hover:underline">Load more</button>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'shared-me' || activeTab === 'shared-others') && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Layers size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {activeTab === 'shared-me' ? '5 segments shared with you' : '2 segments shared by you'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Contact your team admin to manage sharing permissions</p>
          </div>
        )}
      </div>
    </div>
  );
}
