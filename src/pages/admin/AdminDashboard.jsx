import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiUsers, FiCheckCircle, FiClipboard, FiClock, FiRefreshCw, FiTarget, FiCalendar, FiAward, FiActivity } from 'react-icons/fi';

const IST = { timeZone: 'Asia/Kolkata' };
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', IST);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', IST);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [analyticsRes, activityRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getTodayActivity()
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setActivities(activityRes.data.activities);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  const a = analytics || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of employee productivity & activity</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon purple"><FiUsers size={20} /></div>
          <div className="stat-value">{a.totalEmployees || 0}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiCheckCircle size={20} /></div>
          <div className="stat-value">{a.activeEmployees || 0}</div>
          <div className="stat-label">Active Employees</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue"><FiClipboard size={20} /></div>
          <div className="stat-value">{a.total_tasks || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><FiClock size={20} /></div>
          <div className="stat-value">{a.pending_tasks || 0}</div>
          <div className="stat-label">Pending Tasks</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue"><FiRefreshCw size={20} /></div>
          <div className="stat-value">{a.in_progress_tasks || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiTarget size={20} /></div>
          <div className="stat-value">{a.completed_tasks || 0}</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple"><FiCalendar size={20} /></div>
          <div className="stat-value">{a.todayNewTasks || 0}</div>
          <div className="stat-label">Today's New Tasks</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiAward size={20} /></div>
          <div className="stat-value">{a.todayCompleted || 0}</div>
          <div className="stat-label">Completed Today</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="table-container">
          <div className="table-header">
            <h3><FiAward size={16} style={{ marginRight: 8, verticalAlign: -2 }} />Top Performers</h3>
          </div>
          {a.topPerformers?.length > 0 ? (
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Department</th><th>Completed</th></tr></thead>
              <tbody>
                {a.topPerformers.map((p, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</td>
                    <td>{p.department || '—'}</td>
                    <td><span className="badge completed">{p.completed_count}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="empty-state"><p>No data yet</p></div>}
        </div>

        <div className="table-container">
          <div className="table-header">
            <h3><FiActivity size={16} style={{ marginRight: 8, verticalAlign: -2 }} />Today's Activity</h3>
          </div>
          {activities.length > 0 ? (
            <div className="activity-feed">
              {activities.slice(0, 10).map((act) => (
                <div className="activity-item" key={act.id}>
                  <div className={`activity-dot ${act.action}`}></div>
                  <div className="activity-content">
                    <div className="text"><strong>{act.employee_name}</strong> — {act.details}</div>
                    <div className="time">{fmtTime(act.created_at)} IST</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>No activity today yet</p></div>}
        </div>
      </div>
    </div>
  );
}
