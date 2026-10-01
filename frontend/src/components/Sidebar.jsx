import React from 'react';
import {
  LayoutDashboard,
  Search,
  Database,
  BarChart3,
  BrainCircuit,
  X,
  Network,
  Disc,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activeTab = 'Dashboard', onSelectTab }) {
  const navSections = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
        { name: 'Traffic Explorer', route: '/explorer', icon: Search },
      ],
    },
    {
      group: 'DWDM',
      items: [
        { name: 'Data Warehouse', route: '/warehouse', icon: Database },
        { name: 'OLAP Analysis', route: '/olap', icon: BarChart3 },
      ],
    },
    {
      group: 'DATA MINING',
      items: [
        { name: 'Data Mining', route: '/mining', icon: BrainCircuit },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="sidebar-backdrop"
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div>
          {/* Top Brand */}
          <div className="sidebar-brand-wrap">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
              <div className="sidebar-brand-icon">
                <Network size={17} color="var(--color-cyan)" />
              </div>
              <div>
                <h1 className="sidebar-brand-title" style={{ fontSize: '0.88rem', lineHeight: '1.2' }}>
                  NETWORK TRAFFIC<br />
                  <span>ANALYSIS</span>
                </h1>
                <div className="sidebar-brand-subtitle">
                  Data Warehousing & Data Mining
                </div>
                <div className="sidebar-brand-tag">
                  CICIDS2017 • MySQL
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="mobile-close-btn"
              aria-label="Close sidebar"
            >
              <X size={17} />
            </button>
          </div>

          {/* Grouped Navigation Sections */}
          <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {navSections.map((section) => (
              <div key={section.group}>
                <div
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    padding: '2px 10px 6px',
                  }}
                >
                  {section.group}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;

                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          if (onSelectTab) {
                            onSelectTab(item.name);
                            if (onClose) onClose();
                          }
                        }}
                        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Icon
                            size={16}
                            className="sidebar-nav-icon"
                            color={isActive ? 'var(--color-cyan)' : 'var(--text-muted)'}
                          />
                          <span className="sidebar-nav-label">{item.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="sidebar-footer-dot">
              <Disc size={13} color="var(--color-cyan)" />
            </div>
            <div>
              <div className="sidebar-footer-title">
                CICIDS2017
              </div>
              <div className="sidebar-footer-sub">
                DWDM PROJECT
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
