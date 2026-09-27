import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Route and Tab bidirectional mapping
export const PATH_TO_TAB = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/explorer': 'Traffic Explorer',
  '/traffic-explorer': 'Traffic Explorer',
  '/warehouse': 'Data Warehouse',
  '/data-warehouse': 'Data Warehouse',
  '/olap': 'OLAP Analysis',
  '/olap-analysis': 'OLAP Analysis',
  '/mining': 'Data Mining',
  '/data-mining': 'Data Mining',
  '/report': 'Analytical Report',
  '/reports': 'Analytical Report',
  '/report-analysis': 'Analytical Report',
};

export const TAB_TO_PATH = {
  'Dashboard': '/dashboard',
  'Traffic Explorer': '/explorer',
  'Data Warehouse': '/warehouse',
  'OLAP Analysis': '/olap',
  'Data Mining': '/mining',
  'Analytical Report': '/report',
  'Report Analysis': '/report',
};

export const DEFAULT_FILTERS = {
  status: 'ALL',
  port: 'ALL',
  date: 'ALL',
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Navigation state
  const [activeTab, setActiveTabState] = useState(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    return PATH_TO_TAB[path] || 'Dashboard';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightRailOpen, setRightRailOpen] = useState(false);

  // 2. Multidimensional Filter Foundation
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);

  // 3. Record Selection (e.g., inspecting an individual flow or cluster)
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 4. OLAP Operation Selection (slice, dice, rollup, drilldown)
  const [selectedOlapOp, setSelectedOlapOp] = useState(null);

  // 5. Loading State Management (dictionary of keys)
  const [loadingStates, setLoadingStates] = useState({});

  // 6. API Error Management (dictionary of keys)
  const [apiErrors, setApiErrors] = useState({});

  // Helper to scroll view to the very top
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const contentArea = document.querySelector('.content-area');
    if (contentArea) contentArea.scrollTop = 0;
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) mainWrapper.scrollTop = 0;
  }, []);

  // Synchronize browser history and path on tab change
  const setActiveTab = useCallback((tabName) => {
    setActiveTabState(tabName);
    const targetPath = TAB_TO_PATH[tabName] || '/dashboard';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab: tabName }, '', targetPath);
    }
    scrollToTop();
  }, [scrollToTop]);

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      setActiveTabState(PATH_TO_TAB[path] || 'Dashboard');
      scrollToTop();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [scrollToTop]);

  // Filter setters
  const setFilter = useCallback((dimension, value) => {
    setFiltersState((prev) => ({
      ...prev,
      [dimension]: value,
    }));
  }, []);

  const setFilters = useCallback((newFilters) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Loading state helpers
  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: Boolean(isLoading),
    }));
  }, []);

  // Error state helpers
  const setApiError = useCallback((key, errorMsg) => {
    setApiErrors((prev) => ({
      ...prev,
      [key]: errorMsg,
    }));
  }, []);

  const clearApiError = useCallback((key) => {
    setApiErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const value = {
    // Navigation
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    rightRailOpen,
    setRightRailOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
    toggleRightRail: () => setRightRailOpen((prev) => !prev),
    scrollToTop,

    // Filters
    filters,
    setFilter,
    setFilters,
    resetFilters,

    // Selection
    selectedRecord,
    setSelectedRecord,
    selectedOlapOp,
    setSelectedOlapOp,

    // Loading & Errors
    loadingStates,
    setLoading,
    apiErrors,
    setApiError,
    clearApiError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
