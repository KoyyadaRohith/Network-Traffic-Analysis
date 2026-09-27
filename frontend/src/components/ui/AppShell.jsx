import React from 'react';
import Footer from '../Footer';

/**
 * AppShell — Global Layout Shell Component
 *
 * Implements the 3-column responsive layout:
 * Sidebar (~230px) | Main Content (dominant & flexible) | Optional Context Panel (~280px)
 */
export default function AppShell({
  sidebar,
  header,
  children,
  contextPanel,
  isContextPanelOpen = false,
  footer = <Footer />,
  className = '',
}) {
  return (
    <div className={`app-container ${className}`}>
      {/* 1. Sidebar (~220-240px Navigation Rail) */}
      {sidebar}

      {/* 2. Main Dominant Content Area */}
      <div className={`main-wrapper ${isContextPanelOpen ? 'with-right-rail' : ''}`}>
        {/* Global Application Header */}
        {header}

        {/* Primary Analytical Content */}
        <main className="content-area">
          {children}
          {footer}
        </main>
      </div>

      {/* 3. Optional Right Context Panel */}
      {contextPanel}
    </div>
  );
}
