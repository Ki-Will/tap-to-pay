function Sidebar({ currentSection, onSectionChange, onLogout, userRole }) {

  const isAdmin = userRole === 'admin'
  const isUser = userRole === 'user'

  console.log('userRole:', userRole, 'isAdmin:', isAdmin, 'isUser:', isUser)

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
        {/* Admin only */}
        {isAdmin && (
          <a
            href="#"
            className={`nav-item ${currentSection === 'topup' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onSectionChange('topup'); }}
          >
            <span className="nav-icon">💳</span>
            <span className="nav-text">Top-Up</span>
          </a>
        )}

        {/* User only */}
        {isUser && (
          <a
            href="#"
            className={`nav-item ${currentSection === 'marketplace' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onSectionChange('marketplace'); }}
          >
            <span className="nav-icon">🛒</span>
            <span className="nav-text">Marketplace</span>
          </a>
        )}

        {/* Both */}
        {isUser && <a
          href="#"
          className={`nav-item ${currentSection === 'history' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onSectionChange('history'); }}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">History</span>
        </a>}

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
          <a href="mailto:irakozep03@gmail.com" className="support-link">
            <span>✉️</span> irakozep03@gmail.com
          </a>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
