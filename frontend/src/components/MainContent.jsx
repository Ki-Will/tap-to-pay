function MainContent({ currentSection, backendUrl, socket }) {
  return (
    <main className="main-content">
      {/* Quick Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card-main">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <div className="stat-label">Total Cards</div>
            <div className="stat-value" id="total-cards">0</div>
          </div>
        </div>
        <div className="stat-card-main">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Today's Transactions</div>
            <div className="stat-value" id="today-transactions">0</div>
          </div>
        </div>
        <div className="stat-card-main">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Top-Up Volume</div>
            <div className="stat-value" id="total-volume">$0.00</div>
          </div>
        </div>
        <div className="stat-card-main">
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <div className="stat-label">Total Purchases</div>
            <div className="stat-value" id="total-payments">$0.00</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      {currentSection === 'topup' && <TopupSection backendUrl={backendUrl} socket={socket} />}

      {currentSection === 'marketplace' && <MarketplaceSection backendUrl={backendUrl} />}

      {currentSection === 'history' && (
        <div id="section-history" className="page-section active-section">
          <div className="section-header">
            <h2 className="section-title">📊 Transaction History</h2>
            <p className="section-subtitle">View all top-ups and purchase records</p>
          </div>
          <p>History section placeholder</p>
        </div>
      )}

      {currentSection === 'settings' && (
        <div id="section-settings" className="page-section active-section">
          <div className="section-header">
            <h2 className="section-title">⚙️ Settings & System Info</h2>
            <p className="section-subtitle">Monitor system health, view statistics, and configuration details</p>
          </div>
          <p>Settings section placeholder</p>
        </div>
      )}
    </main>
  )
}

export default MainContent
