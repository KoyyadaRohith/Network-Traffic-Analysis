import React from 'react';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  BrainCircuit,
  FileText,
  X,
  Network,
  Disc,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activeTab = 'Dashboard', onSelectTab }) {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Data Warehouse', icon: Database },
    { name: 'OLAP Analysis', icon: BarChart3 },
    { name: 'Data Mining', icon: BrainCircuit },
    { name: 'Report Analysis', icon: FileText },
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
                <h1 className="sidebar-brand-title">
                  CYBERFLOW<br />
                  <span>INTELLIGENCE</span>
                </h1>
                <div className="sidebar-brand-subtitle">
                  Network Traffic Analytics
                </div>
                <div className="sidebar-brand-tag">
                  DWDM • CICIDS2017
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

          {/* Navigation Items (No Numbers) */}
          <nav className="sidebar-nav">
            {navItems.map((item) => {
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
