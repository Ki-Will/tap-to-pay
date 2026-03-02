import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import './App.css'

const BACKEND_URL = 'http://localhost:8228'
const socket = window.io(BACKEND_URL)

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token')
    const _role = localStorage.getItem('role')
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true)
    }
  }, [])

  // eslint-disable-next-line no-unused-vars
  const handleLogin = (_role) => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.clear()
    setIsAuthenticated(false)
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <Auth onLogin={handleLogin} backendUrl={BACKEND_URL} />
      ) : (
        <Dashboard onLogout={handleLogout} backendUrl={BACKEND_URL} socket={socket} />
      )}
    </div>
  )
}

export default App
