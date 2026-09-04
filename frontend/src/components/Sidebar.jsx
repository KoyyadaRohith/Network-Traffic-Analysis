import {
  LayoutDashboard,
  BarChart3,
  BrainCircuit,
  FileText,
  Database,
  Settings,
  Shield,
  Activity,
  GitFork,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activeTab = 'Dashboard', onSelectTab }) {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Traffic Analytics', icon: BarChart3 },
    { name: 'Dataset', icon: Database },
    { name: 'Model Performance', icon: BrainCircuit },
    { name: 'DWDM Analysis', icon: GitFork },
    { name: 'Prediction', icon: Activity },
    { name: 'Report', icon: FileText },
  ];


  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #0a0f1d 0%, #070b14 100%)',
          borderRight: '1px solid var(--border-subtle)',
          padding: '24px 16px',
          transform: isOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.3s ease',
        }}
        className={`sidebar ${isOpen ? 'open' : ''}`}
      >
        <div>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
                }}
              >
                <Shield size={22} color="#ffffff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  NetGuard
                </h1>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-blue)', fontWeight: '600', letterSpacing: '0.04em' }}>
                  SOC ANALYTICS
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="mobile-close-btn"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'none',
              }}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: '8px 8px 16px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
            DWDM Project • 3rd Year CSE
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              const isDisabled = item.disabled;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (!isDisabled && onSelectTab) {
                      onSelectTab(item.name);
                      if (onClose) onClose();
                    }
                  }}
                  disabled={isDisabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#ffffff' : isDisabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.25) 0%, rgba(139, 92, 246, 0.1) 100%)'
                      : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-blue)' : '3px solid transparent',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.6 : 1,
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !isDisabled) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !isDisabled) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon
                      size={18}
                      color={isActive ? 'var(--color-blue)' : isDisabled ? 'var(--text-muted)' : 'var(--text-muted)'}
                    />
                    <span>{item.name}</span>
                  </div>

                  {isDisabled && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Status Pill at Bottom */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--color-green)',
              boxShadow: '0 0 10px var(--color-green)',
              animation: 'pulse 2s infinite',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              System Status
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Online • All DWDM services operational
            </div>
          </div>
          <Activity size={16} color="var(--color-green)" />
        </div>
      </aside>
    </>
  );
}
