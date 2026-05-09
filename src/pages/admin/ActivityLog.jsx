import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiKey, FiCheckCircle, FiLogOut, FiClipboard, FiTarget, FiRefreshCw, FiUser, FiUserPlus, FiCornerUpLeft, FiInbox } from 'react-icons/fi';

const IST = { timeZone: 'Asia/Kolkata' };
const fmtDateTime = (d) => new Date(d).toLocaleString('en-IN', IST);

const actionIcons = {
  login: <FiKey size={14} />,
  check_in: <FiCheckCircle size={14} />,
  check_out: <FiLogOut size={14} />,
  task_assigned: <FiClipboard size={14} />,
  task_completed: <FiTarget size={14} />,
  task_started: <FiRefreshCw size={14} />,
  task_self_assigned: <FiUser size={14} />,
  account_created: <FiUserPlus size={14} />,
  task_reset: <FiCornerUpLeft size={14} />,
};

const actionLabels = {
  login: 'Logged in', check_in: 'Checked in', check_out: 'Checked out',
  task_assigned: 'Task assigned', task_completed: 'Task completed',
  task_started: 'Task started', task_self_assigned: 'Self-assigned task',
  account_created: 'Account created', task_reset: 'Task reset',
};

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  useEffect(() => { loadActivities(); }, [filter]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = filter === 'today' ? await adminAPI.getTodayActivity() : await adminAPI.getAllActivity();
      setActivities(res.data.activities);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Activity Log</h1><p>Track all employee activities</p></div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')}>Today</button>
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Time</button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><FiInbox size={48} /></div>
            <h3>No activities {filter === 'today' ? 'today' : ''}</h3>
            <p>Activities will appear here as employees interact</p>
          </div>
        ) : (
          <div className="activity-feed">
            {activities.map((act) => (
              <div className="activity-item" key={act.id}>
                <div className={`activity-dot ${act.action}`}></div>
                <div className="activity-content">
                  <div className="text">
                    <strong>{act.employee_name}</strong> — {actionIcons[act.action]} {actionLabels[act.action] || act.action}
                  </div>
                  <div className="time">{act.details} &middot; {fmtDateTime(act.created_at)} IST</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
