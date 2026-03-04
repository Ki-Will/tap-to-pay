import TopupSection from './TopupSection'
import MarketplaceSection from './MarketplaceSection'
import HistorySection from './HistorySection'
import { useState, useEffect } from 'react'

function MainContent({ currentSection, backendUrl, socket }) {
  const [currentCardData, setCurrentCardData] = useState(null)
  const [cardPresent, setCardPresent] = useState(false)

  useEffect(() => {
    const handleCardScanned = (data) => {
      setCurrentCardData(data)
      setCardPresent(true)
    }

    const handleCardBalanceUpdated = (data) => {
      if (currentCardData && currentCardData.uid === data.uid) {
        setCurrentCardData({ ...currentCardData, balance: data.balance })
      }
    }

    const handleCardRemoved = (data) => {
      if (currentCardData && currentCardData.uid === data.uid) {
        setCurrentCardData(null)
        setCardPresent(false)
      }
    }

    socket.on('card-status', handleCardScanned)
    socket.on('card-balance', handleCardBalanceUpdated)
    socket.on('card-removed', handleCardRemoved)

    return () => {
      socket.off('card-status', handleCardScanned)
      socket.off('card-balance', handleCardBalanceUpdated)
      socket.off('card-removed', handleCardRemoved)
    }
  }, [socket, currentCardData])

  return (
    <main className="main-content">
      {/* Compact Card Status */}
      <div className="compact-card-status">
        <span className="card-status-icon">💳</span>
        <span className="card-status-text">
          {cardPresent ? 
            `Active Card: UID ${currentCardData?.uid || ''} | ${currentCardData?.holderName || 'NO NAME'} | $${currentCardData?.balance?.toFixed(2) || '0.00'}` 
            : 'No card scanned'
          }
        </span>
      </div>

      {/* Card and Stats Layout */}
      <div className="card-stats-layout" style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
        {/* Large Card Display */}
        <div className="card-section">
          <div className="glass-card card-status-section">
            <h3>Active Card</h3>
            <div className="card-visual-container">
              <div className="card-visual">
                <div className="card-chip"></div>
                <div className="card-number">**** **** **** ****</div>
                <div className="card-details">
                  <div className="card-holder-group">
                    <span className="card-label">CARD HOLDER</span>
                    <span className="card-value">{currentCardData ? (currentCardData.holderName || 'USER') : 'NO CARD'}</span>
                  </div>
                  <div className="card-balance-group">
                    <span className="card-label">BALANCE</span>
                    <span className="card-value">${currentCardData ? currentCardData.balance.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="status-content">
              <div className="status-placeholder">{cardPresent ? 'Card scanned successfully' : 'Scan an RFID card to begin...'}</div>
            </div>
          </div>
        </div>

        {/* Stats in Column */}
        <div className="stats-section" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="stat-card-small" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="stat-icon">💳</div>
            <div className="stat-content" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="stat-label">Total Cards</div>
              <div className="stat-value" id="total-cards">0</div>
            </div>
          </div>
          <div className="stat-card-small" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="stat-icon">📈</div>
            <div className="stat-content" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="stat-label">Today's Transactions</div>
              <div className="stat-value" id="today-transactions">0</div>
            </div>
          </div>
          <div className="stat-card-small" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="stat-icon">💰</div>
            <div className="stat-content" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="stat-label">Top-Up Volume</div>
              <div className="stat-value" id="total-volume">$0.00</div>
            </div>
          </div>
          <div className="stat-card-small" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="stat-icon">🛍️</div>
            <div className="stat-content" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="stat-label">Total Purchases</div>
              <div className="stat-value" id="total-payments">$0.00</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      {currentSection === 'topup' && <TopupSection backendUrl={backendUrl} socket={socket} />}

      {currentSection === 'marketplace' && <MarketplaceSection backendUrl={backendUrl} socket={socket} />}

      {currentSection === 'history' && <HistorySection backendUrl={backendUrl} />}

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
