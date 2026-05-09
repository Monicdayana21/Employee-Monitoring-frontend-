import { useState } from 'react';
import { authAPI } from '../services/api';
import { FiEye, FiEyeOff, FiShield, FiUser, FiBarChart2 } from 'react-icons/fi';

export default function LoginPage({ onLogin }) {
  const [tab, setTab] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = tab === 'admin'
        ? await authAPI.adminLogin(email, password)
        : await authAPI.employeeLogin(email, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo"><FiBarChart2 size={28} /></div>
            <h1>Employee Dashboard</h1>
            <p>Monitor productivity & manage tasks</p>
          </div>

          <div className="login-tabs">
            <button className={`login-tab ${tab === 'admin' ? 'active' : ''}`}
              onClick={() => { setTab('admin'); setError(''); }}>
              <FiShield size={14} style={{ marginRight: 4, verticalAlign: -2 }} /> Admin
            </button>
            <button className={`login-tab ${tab === 'employee' ? 'active' : ''}`}
              onClick={() => { setTab('employee'); setError(''); }}>
              <FiUser size={14} style={{ marginRight: 4, verticalAlign: -2 }} /> Employee
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input"
                placeholder={tab === 'admin' ? 'admin@dashboard.com' : 'employee@company.com'}
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-password-wrap">
                <input type={showPwd ? 'text' : 'password'} className="form-input"
                  placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1} aria-label="Toggle password visibility">
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : `Sign in as ${tab === 'admin' ? 'Admin' : 'Employee'}`}
            </button>
          </form>

          {tab === 'admin' && (
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              Default: admin@dashboard.com / admin123
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
