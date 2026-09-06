import React from 'react';
import {
  Menu,
  Home,
  ChevronRight,
  Search,
  Bell,
  Calendar,
  Layers,
} from 'lucide-react';

export default function Header({ onToggleSidebar, activeTab = 'Dashboard' }) {
  return (
    <header className="top-header">
      {/* Left: Mobile Toggle & Page Location Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          aria-label="Open sidebar navigation"
        >
          <Menu size={18} />
        </button>

        <div className="header-breadcrumb">
          <Home size={14} className="breadcrumb-icon" />
          <ChevronRight size={12} className="breadcrumb-chevron" />
          <span className="breadcrumb-current">{activeTab}</span>
        </div>
      </div>

      {/* Center/Right: Search, Notifications, Student View & Dataset Context */}
      <div className="header-right-tools">
        {/* Compact Search Field */}
        <div className="header-search-wrap">
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search anything..."
            className="header-search-input"
            readOnly
          />
          <kbd className="header-search-kbd">Ctrl K</kbd>
        </div>

        {/* Notification Bell */}
        <button className="header-icon-btn" aria-label="System notifications">
          <Bell size={15} color="var(--text-secondary)" />
          <span className="notification-dot" />
        </button>

        {/* Dataset / Date Context */}
        <div className="header-context-pill">
          <Calendar size={13} color="var(--color-cyan)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Jul 07, 2017
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              CICIDS2017 Dataset
            </span>
          </div>
        </div>

        {/* Student View Avatar Badge */}
        <div className="student-view-badge">
          <div className="student-avatar">
            SV
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Student View
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--color-cyan)', fontWeight: '600' }}>
              B.Tech Project
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
