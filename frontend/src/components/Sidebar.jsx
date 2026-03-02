function Sidebar({ currentSection, onSectionChange, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <div>
            <h1>TAP & PAY</h1>
            <p className="sidebar-subtitle">Dashboard</p>
          </div>
          <div className="connection-indicator">
            <span className="indicator-dot"></span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <a
          href="#"
          className={`nav-item ${currentSection === 'topup' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onSectionChange('topup'); }}
        >
          <span className="nav-icon">💳</span>
          <span className="nav-text">Top Up Card</span>
        </a>
        <a
          href="#"
          className={`nav-item ${currentSection === 'marketplace' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onSectionChange('marketplace'); }}
        >
          <span className="nav-icon">🛒</span>
          <span className="nav-text">Marketplace</span>
        </a>
        <a
          href="#"
          className={`nav-item ${currentSection === 'history' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onSectionChange('history'); }}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Transactions</span>
        </a>
        <a
          href="#"
          className={`nav-item ${currentSection === 'settings' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onSectionChange('settings'); }}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Settings</span>
        </a>
        <button className="logout-btn" onClick={onLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </nav>

      <div className="sidebar-support">
        <div className="support-card">
          <div className="support-icon">💬</div>
          <h4>Need Help?</h4>
          <p>Get in touch with our support team for assistance.</p>
          <a href="mailto:byiringiroaloys8@gmail.com" className="support-link">
            <span>✉️</span> support@aloys.work
          </a>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
