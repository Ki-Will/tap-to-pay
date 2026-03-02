import { useState, useEffect } from 'react'

function TopupSection({ backendUrl, socket }) {
  const [_lastScannedUid, setLastScannedUid] = useState(null)
  const [currentCardData, setCurrentCardData] = useState(null)
  const [uid, setUid] = useState('')
  const [holderName, setHolderName] = useState('')
  const [amount, setAmount] = useState('')
  const [cardPresent, setCardPresent] = useState(false)
  const [_cardScanTime, setCardScanTime] = useState(null)
  const [_isNewCard, setIsNewCard] = useState(false)

  useEffect(() => {
    const handleCardScanned = (data) => {
      setCurrentCardData(data)
      setUid(data.uid)
      setCardPresent(true)
      setCardScanTime(Date.now())
      setIsNewCard(data.isNew || false)
      setLastScannedUid(data.uid)
    }

    const handleCardBalanceUpdated = (data) => {
      if (currentCardData && currentCardData.uid === data.uid) {
        setCurrentCardData({ ...currentCardData, balance: data.balance })
      }
    }

    socket.on('card_scanned', handleCardScanned)
    socket.on('card_balance_updated', handleCardBalanceUpdated)

    return () => {
      socket.off('card_scanned', handleCardScanned)
      socket.off('card_balance_updated', handleCardBalanceUpdated)
    }
  }, [socket, currentCardData])

  const handleTopup = async () => {
    if (!uid || !amount) return
    try {
      const res = await fetch(`${backendUrl}/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ uid, holderName: holderName || undefined, amount: parseFloat(amount) })
      })
      if (res.ok) {
        // success
        setAmount('')
      } else {
        // error
        alert('Topup failed')
      }
    } catch {
      alert('Network error')
    }
  }

  return (
    <div className="content-grid">
      {/* Card Status */}
      <div className="glass-card card-status-section">
        <h3>Active Card</h3>
        <div className="card-visual-container">
          <div className="card-visual">
            <div className="card-chip"></div>
            <div className="card-number">**** **** **** ****</div>
            <div className="card-details">
              <div className="card-holder-group">
                <span className="card-label">CARD HOLDER</span>
                <span className="card-value">{currentCardData ? (currentCardData.holderName || 'NO NAME') : 'NO CARD'}</span>
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

      {/* Top Up Form */}
      <div className="glass-card topup-section">
        <h3>Add Funds</h3>
        <div className="input-group">
          <label htmlFor="uid">Card UID</label>
          <input type="text" id="uid" value={uid} onChange={(e) => setUid(e.target.value)} placeholder="UID auto-populated on scan" readOnly />
        </div>
        <div className="input-group">
          <label htmlFor="holderName">Card Holder Name</label>
          <input type="text" id="holderName" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Enter name for new cards" />
        </div>
        
        <div className="quick-amounts">
          <button className="quick-amount-btn" onClick={() => setAmount('5')}>$5</button>
          <button className="quick-amount-btn" onClick={() => setAmount('10')}>$10</button>
          <button className="quick-amount-btn" onClick={() => setAmount('20')}>$20</button>
          <button className="quick-amount-btn" onClick={() => setAmount('50')}>$50</button>
        </div>
        <div className="input-group">
          <label htmlFor="amount">Custom Amount ($)</label>
          <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" />
        </div>
        <button className="topup-btn" onClick={handleTopup} disabled={!cardPresent || !amount}>
          <span className="btn-icon">💳</span> Confirm Top Up
        </button>
      </div>
    </div>
  )
}

export default TopupSection
