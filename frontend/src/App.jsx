import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import './App.css';

import { fetchDashboardData } from './api/dashboardApi';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import TrafficClassificationChart from './components/TrafficClassificationChart';
import TrafficComparisonChart from './components/TrafficComparisonChart';
import TopPortsTable from './components/TopPortsTable';
import TrafficStatistics from './components/TrafficStatistics';
import TrafficComparison from './components/TrafficComparison';
import DateSummary from './components/DateSummary';
import DatasetCard from './components/DatasetCard';
import AnalysisSummary from './components/AnalysisSummary';
import PredictionPreview from './components/PredictionPreview';
import ReportPreview from './components/ReportPreview';
import Footer from './components/Footer';
import TrafficAnalytics from './pages/TrafficAnalytics';
import DatasetExplorer from './pages/DatasetExplorer';
import ModelPerformance from './pages/ModelPerformance';
import DWDMAnalysis from './pages/DWDMAnalysis';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);

  // Clock ticker for clean operational display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
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
      {/* Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />


      <div className="main-wrapper">
        {/* Top Navbar */}
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Content Container */}
        <main className="content-area">
          {activeTab === 'Traffic Analytics' ? (
            <TrafficAnalytics />
          ) : activeTab === 'Dataset' ? (
            <DatasetExplorer />
          ) : activeTab === 'Model Performance' ? (
            <ModelPerformance />
          ) : activeTab === 'DWDM Analysis' ? (
            <DWDMAnalysis />
          ) : activeTab === 'Prediction' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Real ML Traffic Prediction
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Upload traffic flows to run real-time classification using the trained 62-feature Random Forest model.
                </p>
              </div>
              <div className="grid-2col">
                <PredictionPreview onPredictionComplete={setPredictionResult} />
                <ReportPreview report={predictionResult?.report} />
              </div>
            </div>
          ) : activeTab === 'Report' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Traffic Analysis Report
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Comprehensive forensic traffic analysis report generated from model inference.
                </p>
              </div>
              <div className="grid-2col">
                <ReportPreview report={predictionResult?.report} />
                <PredictionPreview onPredictionComplete={setPredictionResult} />
              </div>
            </div>
          ) : (
            <>
              {/* Welcome Header */}
              <div className="welcome-section">
                <div>
                  <h2 className="welcome-title">
                    Welcome Back! 👋
                  </h2>
                  <p className="welcome-subtitle">
                    Monitor, analyze and classify network traffic using data warehousing and data mining.
                  </p>
                </div>

                {/* Date / Time Status Card */}
                <div className="date-time-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} color="var(--color-blue)" />
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                        Dataset Date
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {data?.date_summary?.data?.[0]?.date || '2017-07-07'}
                      </div>
                    </div>
                  </div>

                  <div style={{ width: '1px', height: '28px', background: 'var(--border-subtle)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="var(--color-purple)" />
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                        Current Time
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {currentTime || '00:00:00 AM'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="error-panel">
                  <AlertTriangle size={40} color="var(--color-red)" style={{ marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
                    Unable to load dashboard data
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '440px', marginBottom: '20px' }}>
                    Make sure the FastAPI backend is running on <code style={{ color: 'var(--color-blue)' }}>http://127.0.0.1:8000</code> and the MySQL database is accessible.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={loadData}
                  >
                    <RefreshCw size={16} />
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Main Dashboard Analytics Grid */}
              {(!error || data) && (
                <div className="section-gap">
                  {/* Row 1: KPI Cards */}
                  <KpiCard
                    summary={data?.summary}
                    loading={loading}
                  />

                  {/* Row 2: Charts (Donut + Bar Comparison) */}
                  <div className="grid-2col">
                    <TrafficClassificationChart
                      data={data?.classification?.data}
                      summary={data?.summary}
                      loading={loading}
                    />
                    <TrafficComparisonChart
                      comparisonData={data?.comparison?.data}
                      loading={loading}
                    />
                  </div>

                  {/* Row 3: Top Ports Table + Feature Comparison Table */}
                  <div className="grid-2col">
                    <TopPortsTable
                      portsData={data?.ports?.data}
                      totalRecords={data?.summary?.total_records}
                      loading={loading}
                    />
                    <TrafficComparison
                      comparisonData={data?.comparison?.data}
                      loading={loading}
                    />
                  </div>

                  {/* Row 4: Key Traffic Statistics Grid */}
                  <TrafficStatistics
                    stats={data?.statistics?.data}
                    loading={loading}
                  />

                  {/* Row 5: Traffic by Date & Dataset Cards */}
                  <div className="grid-2col">
                    <DateSummary
                      dateData={data?.date_summary?.data}
                      loading={loading}
                    />
                    <DatasetCard
                      summary={data?.summary}
                    />
                  </div>

                  {/* Row 6: Analysis Summary + Prediction + Live Forensic Report (3 Column Grid) */}
                  <div className="grid-3col">
                    <AnalysisSummary
                      summary={data?.summary}
                    />
                    <PredictionPreview
                      onPredictionComplete={setPredictionResult}
                    />
                    <ReportPreview
                      report={predictionResult?.report}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Project Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
