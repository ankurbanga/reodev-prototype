'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2, GitBranch, Users, Target, Layers, Wrench, Settings,
  Bell, Gift, ChevronRight, List, Megaphone, Zap, Bot,
  Link, SlidersHorizontal, UserCog, CreditCard, X
} from 'lucide-react';

const ReoLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hexGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FF6B35" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <polygon
      points="16,2 28,9 28,23 16,30 4,23 4,9"
      fill="url(#hexGrad)"
    />
    <text x="16" y="21" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="system-ui">R</text>
  </svg>
);

const CircularProgress = ({ value, max }: { value: number; max: number }) => {
  const pct = value / max;
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <div className="flex flex-col items-center gap-1 pb-4">
      <div className="relative w-10 h-10">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} fill="none" stroke="#2a2a2a" strokeWidth="3" />
          <circle
            cx="20" cy="20" r={r} fill="none" stroke="#5B5BD6" strokeWidth="3"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-white">87%</span>
      </div>
    </div>
  );
};

interface FlyoutItem { label: string; icon: React.ReactNode; href?: string; }

const toolsItems: FlyoutItem[] = [
  { label: 'Lists', icon: <List size={14} /> },
  { label: 'Campaigns', icon: <Megaphone size={14} /> },
  { label: 'Enrichment', icon: <Zap size={14} /> },
  { label: 'Automations', icon: <Bot size={14} /> },
];

const settingsItems: FlyoutItem[] = [
  { label: 'Integrations', icon: <Link size={14} />, href: '/dashboard/integration' },
  { label: 'Configurations', icon: <SlidersHorizontal size={14} /> },
  { label: 'Users', icon: <UserCog size={14} /> },
  { label: 'Billing & Credits', icon: <CreditCard size={14} /> },
];

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  flyout?: FlyoutItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openFlyout, setOpenFlyout] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { icon: <Building2 size={18} />, label: 'Accounts', href: '/dashboard/accounts' },
    { icon: <GitBranch size={18} />, label: 'Developers', href: '/dashboard/developers' },
    { icon: <Users size={18} />, label: 'Buyers', href: '/dashboard/buyers' },
    { icon: <Target size={18} />, label: 'Audiences', href: '/dashboard/audiences' },
    { icon: <Layers size={18} />, label: 'Segments', href: '/dashboard/segments' },
  ];

  const toolItem: NavItem = { icon: <Wrench size={18} />, label: 'Tools', flyout: toolsItems };
  const settingsItem: NavItem = { icon: <Settings size={18} />, label: 'Settings', flyout: settingsItems };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleNav = (item: NavItem) => {
    if (item.flyout) {
      setOpenFlyout(openFlyout === item.label ? null : item.label);
    } else if (item.href) {
      router.push(item.href);
      setOpenFlyout(null);
    }
  };

  const NavBtn = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const flyoutOpen = openFlyout === item.label;
    return (
      <div className="relative group">
        <button
          onClick={() => handleNav(item)}
          className={`
            w-10 h-10 flex items-center justify-center rounded-lg mx-auto transition-all duration-150
            ${active ? 'bg-[rgba(91,91,214,0.2)] text-[#5B5BD6]' : flyoutOpen ? 'bg-[rgba(91,91,214,0.15)] text-[#5B5BD6]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'}
          `}
          style={active ? { borderLeft: '2px solid #5B5BD6', marginLeft: '-2px', paddingLeft: '2px' } : {}}
        >
          {item.icon}
        </button>
        {/* Tooltip */}
        <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {item.label}
        </div>
        {/* Flyout */}
        {item.flyout && flyoutOpen && (
          <div className="absolute left-14 top-0 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 w-44 z-50">
            <div className="flex items-center justify-between px-3 pb-2 border-b border-gray-100 mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</span>
              <button onClick={() => setOpenFlyout(null)} className="text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            </div>
            {item.flyout.map((fi) => (
              <button
                key={fi.label}
                onClick={() => { if (fi.href) { router.push(fi.href); setOpenFlyout(null); } }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#5B5BD6] transition-colors"
              >
                <span className="text-gray-400">{fi.icon}</span>
                {fi.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed left-0 top-0 h-full w-14 flex flex-col items-center py-3 gap-1 z-40" style={{ background: '#111111' }}>
      {/* Logo */}
      <div className="mb-2 cursor-pointer" onClick={() => router.push('/dashboard/accounts')}>
        <ReoLogo />
      </div>
      {/* Expand toggle */}
      <button className="w-8 h-5 flex items-center justify-center text-gray-500 hover:text-gray-300 mb-3 transition-colors">
        <ChevronRight size={14} />
        <ChevronRight size={14} className="-ml-2" />
      </button>

      {/* Main nav */}
      <div className="flex flex-col gap-1 w-full px-2">
        {navItems.map((item) => <NavBtn key={item.label} item={item} />)}
      </div>

      {/* Separator */}
      <div className="w-8 h-px bg-gray-700 my-2" />

      {/* Tools */}
      <div className="flex flex-col gap-1 w-full px-2">
        <NavBtn item={toolItem} />
      </div>

      {/* Separator */}
      <div className="w-8 h-px bg-gray-700 my-2" />

      {/* Settings */}
      <div className="flex flex-col gap-1 w-full px-2">
        <NavBtn item={settingsItem} />
      </div>

      {/* Separator */}
      <div className="w-8 h-px bg-gray-700 my-2" />

      {/* Bell + Gift */}
      <div className="flex flex-col gap-1 w-full px-2">
        <NavBtn item={{ icon: <Bell size={18} />, label: 'Notifications' }} />
        <NavBtn item={{ icon: <Gift size={18} />, label: 'Refer a Friend' }} />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Progress ring */}
      <CircularProgress value={87} max={100} />
    </div>
  );
}
