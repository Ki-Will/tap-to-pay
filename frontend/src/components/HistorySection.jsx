import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

function HistorySection({ backendUrl }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${backendUrl}/user/transactions`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setTransactions(data)
        } else {
          toast.error('Failed to fetch transactions')
        }
      } catch (err) {
        toast.error('Network error')
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [backendUrl])

  if (loading) return <p>Loading transactions...</p>

  return (
    <div className="glass-card history-section">
      <div className="section-header">
        <h2 className="section-title">📊 Transaction History</h2>
        <p className="section-subtitle">View all top-ups and purchase records</p>
      </div>
      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Balance Before</th>
            <th>Balance After</th>
            <th>Card Holder</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t._id}>
              <td>{new Date(t.timestamp).toLocaleString()}</td>
              <td>{t.type}</td>
              <td>{t.description}</td>
              <td>${t.amount.toFixed(2)}</td>
              <td>${t.balanceBefore.toFixed(2)}</td>
              <td>${t.balanceAfter.toFixed(2)}</td>
              <td>{t.holderName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default HistorySection
