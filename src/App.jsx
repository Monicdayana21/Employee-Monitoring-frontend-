import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FiBarChart2, FiUsers, FiClipboard, FiActivity, FiHome, FiLogOut, FiTrendingUp } from 'react-icons/fi';
import './App.css';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeList from './pages/admin/EmployeeList';
import WorkAllocation from './pages/admin/WorkAllocation';
import ActivityLog from './pages/admin/ActivityLog';
import EmployeeAnalytics from './pages/admin/EmployeeAnalytics';
import EmployeePortal from './pages/employee/EmployeePortal';

function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiBarChart2 size={18} />, path: '/admin/dashboard' },
    { id: 'employees', label: 'Employees', icon: <FiUsers size={18} />, path: '/admin/employees' },
    { id: 'work', label: 'Work Allocation', icon: <FiClipboard size={18} />, path: '/admin/work-allocation' },
    { id: 'analytics', label: 'Analytics', icon: <FiTrendingUp size={18} />, path: '/admin/analytics' },
    { id: 'activity', label: 'Activity Log', icon: <FiActivity size={18} />, path: '/admin/activity' },
  ];

  const empNav = [
    { id: 'portal', label: 'My Dashboard', icon: <FiHome size={18} />, path: '/employee/portal' },
  ];

  const navItems = user.role === 'admin' ? adminNav : empNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo"><FiBarChart2 size={20} /></div>
        <div className="sidebar-title">
          <h2>EmpDash</h2>
          <p>{user.role} Panel</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Navigation</div>
          {navItems.map((item) => (
            <button key={item.id}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="user-info">
            <div className="name">{user.name}</div>
            <div className="role">{user.role}</div>
          </div>
          <button className="btn-logout" onClick={onLogout} title="Logout"><FiLogOut size={16} /></button>
        </div>
      </div>
    </aside>
  );
}

function AppLayout({ user, onLogout }) {
  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="main-content">
        <Routes>
          {user.role === 'admin' ? (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<EmployeeList />} />
              <Route path="/admin/work-allocation" element={<WorkAllocation />} />
              <Route path="/admin/analytics" element={<EmployeeAnalytics />} />
              <Route path="/admin/activity" element={<ActivityLog />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/employee/portal" element={<EmployeePortal />} />
              <Route path="*" element={<Navigate to="/employee/portal" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1a2035', color: '#e8ecf4', border: '1px solid #2a3555' } }} />
      {!user ? (
        <Routes><Route path="*" element={<LoginPage onLogin={handleLogin} />} /></Routes>
      ) : (
        <AppLayout user={user} onLogout={handleLogout} />
      )}
    </BrowserRouter>
  );
}
