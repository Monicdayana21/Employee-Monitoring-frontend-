import { useState, useEffect } from 'react';
import { employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiClipboard, FiClock, FiRefreshCw, FiCheckCircle, FiPlay, FiCheck, FiLogIn, FiLogOut, FiTag, FiCalendar, FiUser } from 'react-icons/fi';

const IST = { timeZone: 'Asia/Kolkata' };
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', IST);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', IST);

export default function EmployeePortal() {
  const [stats, setStats] = useState({});
  const [tasks, setTasks] = useState([]);
  const [checkInStatus, setCheckInStatus] = useState({ checkedIn: false, checkIn: null });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: '', due_date: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadTasks(); }, [filter]);

  const loadData = async () => {
    try {
      const [statsRes, checkRes] = await Promise.all([employeeAPI.getTaskStats(), employeeAPI.getCheckInStatus()]);
      setStats(statsRes.data.stats); setCheckInStatus(checkRes.data);
      await loadTasks();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadTasks = async () => {
    try { const res = await employeeAPI.getTasks(filter === 'all' ? undefined : filter); setTasks(res.data.tasks); }
    catch (err) { console.error(err); }
  };

  const handleCheckIn = async () => {
    try { await employeeAPI.checkIn(); toast.success('Checked in successfully!'); loadData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Check-in failed'); }
  };

  const handleCheckOut = async () => {
    try { await employeeAPI.checkOut(); toast.success('Checked out!'); loadData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Check-out failed'); }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try { await employeeAPI.updateTaskStatus(taskId, newStatus); toast.success(`Task marked as ${newStatus.replace('_', ' ')}`); loadData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
  };

  const handleSelfAssign = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.createTask(form); toast.success('Task created!');
      setShowModal(false); setForm({ title: '', description: '', priority: 'medium', category: '', due_date: '' }); loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create task'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const s = stats || {};
  const checkIn = checkInStatus.checkIn;
  const isCheckedIn = checkInStatus.checkedIn && checkIn?.status === 'checked_in';
  const isCheckedOut = checkInStatus.checkedIn && checkIn?.status === 'checked_out';

  return (
    <div>
      <div className="page-header">
        <div><h1>Welcome, {user.name}</h1><p>Your tasks and productivity overview</p></div>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}><FiPlus size={15} /> New Task</button>
      </div>

      <div className="checkin-banner">
        <div className="checkin-info">
          <h3>{!checkInStatus.checkedIn ? 'Start Your Day' : isCheckedIn ? "You're Checked In" : 'Day Complete'}</h3>
          <p>
            {!checkInStatus.checkedIn ? 'Check in to begin tracking your work today'
              : isCheckedIn ? `Checked in at ${fmtTime(checkIn.check_in_time)} IST`
              : `Worked from ${fmtTime(checkIn.check_in_time)} to ${fmtTime(checkIn.check_out_time)} IST`}
          </p>
        </div>
        {!checkInStatus.checkedIn ? (
          <button className="checkin-btn check-in" onClick={handleCheckIn}><FiLogIn size={16} style={{ marginRight: 6 }} />Check In</button>
        ) : isCheckedIn ? (
          <button className="checkin-btn check-out" onClick={handleCheckOut}><FiLogOut size={16} style={{ marginRight: 6 }} />Check Out</button>
        ) : (
          <button className="checkin-btn checked-out" disabled><FiCheck size={16} style={{ marginRight: 6 }} />Day Complete</button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card blue"><div className="stat-icon blue"><FiClipboard size={20} /></div><div className="stat-value">{s.total_tasks || 0}</div><div className="stat-label">Total Tasks</div></div>
        <div className="stat-card orange"><div className="stat-icon orange"><FiClock size={20} /></div><div className="stat-value">{s.pending_tasks || 0}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card purple"><div className="stat-icon purple"><FiRefreshCw size={20} /></div><div className="stat-value">{s.in_progress_tasks || 0}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card green"><div className="stat-icon green"><FiCheckCircle size={20} /></div><div className="stat-value">{s.completed_tasks || 0}</div><div className="stat-label">Completed</div></div>
      </div>

      <div className="filter-tabs">
        {['all', 'pending', 'in_progress', 'completed'].map((f) => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="tasks-board">
        {tasks.length === 0 ? (
          <div className="table-container"><div className="empty-state"><div className="icon"><FiClipboard size={40} /></div><h3>No tasks found</h3><p>Create a new task or wait for assignments</p></div></div>
        ) : tasks.map((task) => (
          <div className="task-card" key={task.id}>
            <div className="task-card-header">
              <h4>{task.title}</h4>
              <span className={`badge ${task.priority}`}>{task.priority}</span>
            </div>
            {task.description && <p>{task.description}</p>}
            <div className="task-card-meta">
              <span className="task-meta-item"><FiUser size={12} /> {task.is_self_assigned ? 'Self-assigned' : 'Assigned by Admin'}</span>
              <span className={`badge ${task.status}`}>{task.status.replace('_', ' ')}</span>
              {task.due_date && <span className="task-meta-item"><FiCalendar size={12} /> Due: {fmtDate(task.due_date)}</span>}
              {task.category && <span className="task-meta-item"><FiTag size={12} /> {task.category}</span>}
            </div>
            <div className="task-actions">
              {task.status === 'pending' && <button className="btn btn-accent btn-sm" onClick={() => handleStatusUpdate(task.id, 'in_progress')}><FiPlay size={12} /> Start</button>}
              {task.status === 'in_progress' && <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(task.id, 'completed')}><FiCheck size={12} /> Complete</button>}
              {task.status === 'completed' && <span style={{ fontSize: 12, color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><FiCheckCircle size={13} /> Completed {task.completed_at ? `on ${fmtDate(task.completed_at)}` : ''}</span>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Create Task</h2><button className="modal-close" onClick={() => setShowModal(false)}><FiX size={20} /></button></div>
            <form onSubmit={handleSelfAssign}>
              <div className="modal-body">
                <div className="form-group"><label>Task Title *</label><input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What do you want to work on?" /></div>
                <div className="form-group"><label>Description</label><textarea className="form-input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details..." style={{ resize: 'vertical' }} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Priority</label>
                    <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Category</label><input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Dev, Design..." /></div>
                </div>
                <div className="form-group"><label>Due Date</label><input className="form-input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
