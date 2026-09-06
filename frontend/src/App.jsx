import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import './App.css';

import { fetchDashboardData } from './api/dashboardApi';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RightContextRail from './components/RightContextRail';
import KpiCard from './components/KpiCard';
import NetworkTrafficDistribution from './components/NetworkTrafficDistribution';
import TrafficClassificationChart from './components/TrafficClassificationChart';
import SystemInformationCard from './components/SystemInformationCard';
import DWDMPipeline from './components/DWDMPipeline';
import DatasetOverviewCard from './components/DatasetOverviewCard';
import TopPortsChart from './components/TopPortsChart';
import ProjectImpactCard from './components/ProjectImpactCard';
import Footer from './components/Footer';

// Academic DWDM Primary Module Pages
import DataWarehouse from './pages/DataWarehouse';
import OLAPAnalysis from './pages/OLAPAnalysis';
import DataMining from './pages/DataMining';
import ReportAnalysis from './pages/ReportAnalysis';

const PATH_TO_TAB = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/data-warehouse': 'Data Warehouse',
  '/olap-analysis': 'OLAP Analysis',
  '/data-mining': 'Data Mining',
  '/report-analysis': 'Report Analysis',
};

const TAB_TO_PATH = {
  'Dashboard': '/dashboard',
  'Data Warehouse': '/data-warehouse',
  'OLAP Analysis': '/olap-analysis',
  'Data Mining': '/data-mining',
  'Report Analysis': '/report-analysis',
};

export default function App() {
  // Initialize tab based on URL path or default to Dashboard
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    return PATH_TO_TAB[path] || 'Dashboard';
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper to scroll view to the very top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const contentArea = document.querySelector('.content-area');
    if (contentArea) contentArea.scrollTop = 0;
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) mainWrapper.scrollTop = 0;
  };

  // Synchronize browser history and path
  const handleSelectTab = (tabName) => {
    setActiveTab(tabName);
    const targetPath = TAB_TO_PATH[tabName] || '/dashboard';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab: tabName }, '', targetPath);
    }
    scrollToTop();
  };

  // Reset scroll position to top whenever active module changes
  useEffect(() => {
    scrollToTop();
    const rafId = requestAnimationFrame(() => {
      scrollToTop();
    });
    return () => cancelAnimationFrame(rafId);
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      setActiveTab(PATH_TO_TAB[path] || 'Dashboard');
      scrollToTop();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch Dashboard API data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData();
      setData(result);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Unable to connect to FastAPI backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="app-container">
      {/* 1. Navigation Sidebar (~210px Left Rail) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* 2. Center Dominant Main Workspace */}
      <div className="main-wrapper">
        {/* Top Floating/Panel Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          activeTab={activeTab}
        />

        {/* Content Container */}
        <main className="content-area">
          {activeTab === 'Data Warehouse' ? (
            <DataWarehouse />
          ) : activeTab === 'OLAP Analysis' ? (
            <OLAPAnalysis />
          ) : activeTab === 'Data Mining' ? (
            <DataMining />
          ) : activeTab === 'Report Analysis' ? (
            <ReportAnalysis />
          ) : (
            /* Main Dashboard Overview — Phase 2 High-Fidelity Reconstruction */
            <>
              {/* Dashboard Header */}
              <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <div className="dashboard-subtitle">
                  An overview of network traffic analysis using Data Warehousing and Data Mining techniques.
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="error-panel">
                  <AlertTriangle size={36} color="var(--color-red)" style={{ marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
                    Unable to load dashboard data
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '440px', marginBottom: '16px' }}>
                    Make sure the FastAPI backend is running on <code style={{ color: 'var(--color-cyan)' }}>http://127.0.0.1:8000</code> and the MySQL database is accessible.
                  </p>
                  <button className="btn btn-primary" onClick={loadData}>
                    <RefreshCw size={15} />
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Clean Academic Dashboard Content */}
              {(!error || data) && (
                <div className="section-gap">
                  {/* 1. Exactly Four Primary KPI Cards with Bottom Sparklines */}
                  <KpiCard
                    summary={data?.summary}
                    loading={loading}
                  />

                  {/* 2. Main Analytical Visualization Area (~50% / ~25% / ~25%) */}
                  <div className="dashboard-analytical-grid">
                    <NetworkTrafficDistribution
                      portsData={data?.ports?.data}
                      loading={loading}
                    />
                    <TrafficClassificationChart
                      summary={data?.summary}
                      loading={loading}
                    />
                    <SystemInformationCard />
                  </div>

                  {/* 3. DWDM Analysis Pipeline (Full-Width Card, 7 Stages) */}
                  <DWDMPipeline />

                  {/* 4. Bottom Grid (Three Cards: 34% / 34% / 32%) */}
                  <div className="dashboard-bottom-grid">
                    <DatasetOverviewCard summary={data?.summary} />
                    <TopPortsChart
                      portsData={data?.ports?.data}
                      loading={loading}
                      onViewDetails={() => handleSelectTab('OLAP Analysis')}
                    />
                    <ProjectImpactCard />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Academic Footer */}
          <Footer />
        </main>
      </div>

      {/* 3. Right Information Rail (~280px Right Rail) */}
      <RightContextRail />
    </div>
  );
}
