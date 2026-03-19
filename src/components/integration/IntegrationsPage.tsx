'use client';
import { useRouter } from 'next/navigation';
import { ChevronRight, CheckCircle, Circle } from 'lucide-react';

interface Integration {
  name: string;
  description: string;
  connected?: boolean;
  isHubspot?: boolean;
  color?: string;
  initials?: string;
}

const IntegrationCard = ({ integration, onConfigure }: { integration: Integration; onConfigure?: () => void }) => {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-sm ${integration.connected ? 'border-green-100 bg-green-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
      <div className="flex items-center gap-3">
        {/* Icon placeholder */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: integration.color || '#6B7280' }}
        >
          {integration.initials || integration.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-gray-800">{integration.name}</p>
            {integration.connected && (
              <div className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] text-green-600 font-medium">Connected</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-400">{integration.description}</p>
        </div>
      </div>
      {integration.connected && onConfigure ? (
        <button
          onClick={onConfigure}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#5B5BD6] text-white text-xs font-medium rounded-lg hover:bg-[#4a4ac0] transition-all"
        >
          Configure <ChevronRight size={11} />
        </button>
      ) : (
        <button className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-medium rounded-lg hover:border-[#5B5BD6] hover:text-[#5B5BD6] transition-all">
          Connect
        </button>
      )}
    </div>
  );
};

const SectionHeader = ({ id, title, count }: { id: string; title: string; count?: number }) => (
  <div id={id} className="flex items-center gap-2 mb-3 pt-2">
    <h3 className="text-sm font-bold text-gray-700">{title}</h3>
    {count !== undefined && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{count}</span>}
  </div>
);

export default function IntegrationsPage() {
  const router = useRouter();

  const inputSourceDevInsights: Integration[] = [
    { name: 'GitHub', description: 'Track developer activity on GitHub repos', color: '#24292e', initials: 'GH', connected: false },
    { name: 'Tech Hiring', description: 'Job posting signals from hiring data', color: '#0073b1', initials: 'TH', connected: false },
    { name: 'Documentation', description: 'Track visits to your product docs', color: '#10B981', initials: 'DC', connected: false },
    { name: 'Cloud Product', description: 'AWS, GCP, Azure marketplace signals', color: '#FF9900', initials: 'CP', connected: false },
    { name: 'Website', description: 'Website visitor identification', color: '#6366F1', initials: 'WS', connected: false },
    { name: 'Forms', description: 'Capture form submissions as signals', color: '#8B5CF6', initials: 'FM', connected: false },
    { name: 'Code Interactions', description: 'SDK and library interactions', color: '#14B8A6', initials: 'CI', connected: false },
    { name: 'Local Product', description: 'On-premise product usage tracking', color: '#F59E0B', initials: 'LP', connected: false },
    { name: 'Docker', description: 'Docker image pull signals', color: '#2496ED', initials: 'DK', connected: false },
    { name: 'Helm', description: 'Helm chart installation signals', color: '#277A9F', initials: 'HM', connected: false },
  ];

  const apiBasedIntegrations: Integration[] = [
    { name: 'Telemetry', description: 'Custom telemetry event ingestion', color: '#7C3AED', initials: 'TL', connected: false },
    { name: 'Custom Product Events API', description: 'Push custom product events to Reo', color: '#5B5BD6', initials: 'API', connected: false },
    { name: 'Lists API', description: 'Import account lists via API', color: '#0891B2', initials: 'LS', connected: false },
  ];

  const websiteVisitorIntegrations: Integration[] = [
    { name: 'Website Visitor Identification', description: 'Identify anonymous website visitors', color: '#6366F1', initials: 'WV', connected: false },
    { name: 'RB2B', description: 'RB2B person-level identification', color: '#1D4ED8', initials: 'R2B', connected: false },
    { name: 'Vector', description: 'Vector intent data integration', color: '#9333EA', initials: 'VC', connected: false },
  ];

  const communityIntegrations: Integration[] = [
    { name: 'Slack', description: 'Owned community activity from Slack', color: '#611f69', initials: 'SL', connected: false },
  ];

  const openCommunityIntegrations: Integration[] = [
    { name: 'LinkedIn', description: 'LinkedIn engagement signals', color: '#0077B5', initials: 'LI', connected: false },
  ];

  const crmIntegrations: Integration[] = [
    { name: 'HubSpot', description: 'Bi-directional CRM sync', color: '#FF7A59', initials: 'HS', connected: true, isHubspot: true },
    { name: 'Salesforce', description: 'Salesforce CRM integration', color: '#00A1E0', initials: 'SF', connected: false },
    { name: 'Attio', description: 'Attio CRM integration', color: '#2563EB', initials: 'AT', connected: false },
  ];

  const notificationIntegrations: Integration[] = [
    { name: 'Email Digest', description: 'Daily signal summary emails', color: '#EF4444', initials: 'EM', connected: false },
    { name: 'Slack Alerts', description: 'Real-time Slack notifications', color: '#611f69', initials: 'SL', connected: false },
    { name: 'Webhooks', description: 'Custom webhook notifications', color: '#374151', initials: 'WH', connected: false },
  ];

  const messagingIntegrations: Integration[] = [
    { name: 'Outreach', description: 'Outreach sales engagement', color: '#5851F3', initials: 'OR', connected: false },
    { name: 'Apollo.io', description: 'Apollo.io sequence integration', color: '#3B82F6', initials: 'AP', connected: false },
    { name: 'Salesloft', description: 'Salesloft cadence integration', color: '#00C8AF', initials: 'SL', connected: false },
  ];

  const dataExportIntegrations: Integration[] = [
    { name: 'Snowflake', description: 'Export to Snowflake data warehouse', color: '#29B5E8', initials: 'SF', connected: false },
    { name: 'BigQuery', description: 'Export to BigQuery', color: '#4285F4', initials: 'BQ', connected: false },
    { name: 'S3 / Data Lake', description: 'Export to S3 or data lake', color: '#FF9900', initials: 'S3', connected: false },
  ];

  const sections = [
    { id: 'dev-insights', label: 'Developer Insights' },
    { id: 'api-based', label: 'API-based' },
    { id: 'website-visitor', label: 'Website Visitor' },
    { id: 'owned-communities', label: 'Owned Communities' },
    { id: 'open-communities', label: 'Open Communities' },
    { id: 'crm', label: 'CRM' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'messaging', label: 'Messaging' },
    { id: 'data-export', label: 'Data Export' },
  ];

  return (
    <div className="flex gap-0">
      {/* Main content */}
      <div className="flex-1 px-6 py-5 overflow-y-auto max-h-[calc(100vh-0px)]">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500 mt-1">Connect your data sources and destinations to power Reo's intelligence</p>
        </div>

        {/* Input Sources */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Input Sources</h2>

          <SectionHeader id="dev-insights" title="Developer Insights" count={inputSourceDevInsights.length} />
          <div className="grid grid-cols-2 gap-2 mb-5">
            {inputSourceDevInsights.map(i => <IntegrationCard key={i.name} integration={i} />)}
          </div>

          <SectionHeader id="api-based" title="API-based" count={apiBasedIntegrations.length} />
          <div className="grid grid-cols-2 gap-2 mb-5">
            {apiBasedIntegrations.map(i => <IntegrationCard key={i.name} integration={i} />)}
          </div>

          <SectionHeader id="website-visitor" title="Website Visitor Insights" count={websiteVisitorIntegrations.length} />
          <div className="grid grid-cols-2 gap-2 mb-5">
            {websiteVisitorIntegrations.map(i => <IntegrationCard key={i.name} integration={i} />)}
          </div>

          <SectionHeader id="owned-communities" title="Owned Communities" />
          <div className="grid grid-cols-2 gap-2 mb-5">
            {communityIntegrations.map(i => <IntegrationCard key={i.name} integration={i} />)}
          </div>

          <SectionHeader id="open-communities" title="Open Communities" />
          <div className="grid grid-cols-2 gap-2 mb-5">
            {openCommunityIntegrations.map(i => <IntegrationCard key={i.name} integration={i} />)}
          </div>
        </div>

        {/* Output Integrations */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Output Integrations</h2>

          <SectionHeader id="crm" title="CRM" count={crmIntegrations.length} />
          <div className="grid grid-cols-2 gap-2 mb-5">
            {crmIntegrations.map(i => (
              <IntegrationCard
                key={i.name}
                integration={i}
                onConfigure={i.isHubspot ? () => router.push('/dashboard/integration/hubspot') : undefined}
              />
            ))}
          </div>

          <SectionHeader id="notifications" title="Notifications" count={notificationIntegrations.length} />
          <div className="grid grid-cols-2 gap-2 mb-5">
            {notificationIntegrations.map(i => <IntegrationCard key={i.name} integration={i} />)}
          </div>

          <SectionHeader id="messaging" title="Messaging Tools" count={messagingIntegrations.length} />
          <div className="grid grid-cols-2 gap-2 mb-5">
            {messagingIntegrations.map(i => <IntegrationCard key={i.name} integration={i} />)}
          </div>

          <SectionHeader id="data-export" title="Data Export" count={dataExportIntegrations.length} />
          <div className="grid grid-cols-2 gap-2 mb-5">
            {dataExportIntegrations.map(i => <IntegrationCard key={i.name} integration={i} />)}
          </div>
        </div>
      </div>

      {/* Right anchor nav */}
      <div className="w-44 shrink-0 pt-5 pr-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">On this page</p>
        <div className="flex flex-col gap-1">
          {sections.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs text-gray-500 hover:text-[#5B5BD6] py-1 transition-colors hover:font-medium"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
