import React from 'react';
import './App.css';

import { AppProvider, useAppContext } from './context/AppContext';
import { AppShell } from './components/ui';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RightContextRail from './components/RightContextRail';
import Footer from './components/Footer';

// Academic DWDM Primary Module Pages
import Dashboard from './pages/Dashboard';
import TrafficExplorer from './pages/TrafficExplorer';
import DataWarehouse from './pages/DataWarehouse';
import OLAPAnalysis from './pages/OLAPAnalysis';
import DataMining from './pages/DataMining';
import ReportAnalysis from './pages/ReportAnalysis';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    rightRailOpen,
    setRightRailOpen,
  } = useAppContext();

  return (
    <AppShell
      sidebar={
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      }
      header={
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onToggleRightRail={() => setRightRailOpen((prev) => !prev)}
          isRightRailOpen={rightRailOpen}
          activeTab={activeTab}
        />
      }
      contextPanel={
        <RightContextRail
          isOpen={rightRailOpen}
          onClose={() => setRightRailOpen(false)}
        />
      }
      isContextPanelOpen={rightRailOpen}
      footer={<Footer />}
    >
      {activeTab === 'Traffic Explorer' ? (
        <TrafficExplorer />
      ) : activeTab === 'Data Warehouse' ? (
        <DataWarehouse />
      ) : activeTab === 'OLAP Analysis' ? (
        <OLAPAnalysis />
      ) : activeTab === 'Data Mining' ? (
        <DataMining />
      ) : activeTab === 'Analytical Report' || activeTab === 'Report Analysis' ? (
        <ReportAnalysis />
      ) : (
        <Dashboard />
      )}
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
