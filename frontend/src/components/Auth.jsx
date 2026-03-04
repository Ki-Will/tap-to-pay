import { useState } from 'react'

function Auth({ onLogin, backendUrl }) {
  const [activeTab, setActiveTab] = useState('login')
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [signupData, setSignupData] = useState({ username: '', password: '', role: 'user' })
  const [loginError, setLoginError] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState('')

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        onLogin(data.role)
      } else {
        setLoginError(data.error || 'Login failed')
      }
    } catch (err){
      setLoginError('Network error')
      console.log({'error': err })
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setSignupError('')
    setSignupSuccess('')
    try {
      const res = await fetch(`${backendUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      })
      const data = await res.json()
      if (res.ok) {
        setSignupSuccess('User created. Please login.')
        setActiveTab('login')
        setSignupData({ username: '', password: '', role: 'user' })
      } else {
        setSignupError(data.error || 'Signup failed')
      }
    } catch (err){
      setSignupError('Network error')
      console.log({'error': err })
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-popup">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {activeTab === 'login' && (
          <div className="auth-form active">
            <h2>Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <label htmlFor="login-username">Username</label>
                <input
                  type="text"
                  id="login-username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="auth-btn">Login</button>
            </form>
            {loginError && <div className="auth-error">{loginError}</div>}
          </div>
        )}

        {activeTab === 'signup' && (
          <div className="auth-form active">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignupSubmit}>
              <div className="input-group">
                <label htmlFor="signup-username">Username</label>
                <input
                  type="text"
                  id="signup-username"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  type="password"
                  id="signup-password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label className="checkbox-label">
                  <select
                    id="signup-role"
                    value={signupData.role}
                    onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select> Role
                </label>
                <span className="admin-message">Admin signup is available</span>
              </div>
              <button type="submit" className="auth-btn">Sign Up</button>
            </form>
            {signupError && <div className="auth-error">{signupError}</div>}
            {signupSuccess && <div className="auth-success">{signupSuccess}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

export default Auth
