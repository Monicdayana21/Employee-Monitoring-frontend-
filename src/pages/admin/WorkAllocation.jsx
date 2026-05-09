import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiX, FiUser, FiClipboard } from 'react-icons/fi';

const IST = { timeZone: 'Asia/Kolkata' };
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', IST);

export default function WorkAllocation() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', category: '', due_date: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [taskRes, empRes] = await Promise.all([adminAPI.getTasks(), adminAPI.getEmployees()]);
      setTasks(taskRes.data.tasks); setEmployees(empRes.data.employees);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createTask({ ...form, assigned_to: parseInt(form.assigned_to) });
      toast.success('Task assigned successfully!');
      setShowModal(false);
      setForm({ title: '', description: '', assigned_to: '', priority: 'medium', category: '', due_date: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to assign task'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await adminAPI.deleteTask(id); toast.success('Task deleted'); loadData(); }
    catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Work Allocation</h1><p>Assign tasks and track progress</p></div>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}><FiPlus size={15} /> Assign Task</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Task</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Type</th><th>Due Date</th><th>Actions</th></tr></thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr><td colSpan="7"><div className="empty-state"><h3>No tasks yet</h3><p>Assign your first task</p></div></td></tr>
            ) : tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>{task.title}</div>
                  {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{task.description.substring(0, 60)}{task.description.length > 60 ? '...' : ''}</div>}
                </td>
                <td>{task.employee_name || '—'}</td>
                <td><span className={`badge ${task.priority}`}>{task.priority}</span></td>
                <td><span className={`badge ${task.status}`}>{task.status.replace('_', ' ')}</span></td>
                <td style={{ fontSize: 12 }}>
                  {task.is_self_assigned
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><FiUser size={12} /> Self</span>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><FiClipboard size={12} /> Admin</span>}
                </td>
                <td>{task.due_date ? fmtDate(task.due_date) : '—'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}><FiTrash2 size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Task</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group"><label>Task Title *</label><input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Design homepage mockup" /></div>
                <div className="form-group"><label>Description</label><textarea className="form-input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Task details..." style={{ resize: 'vertical' }} /></div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Assign To *</label>
                    <select className="form-input" required value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                      <option value="">Select employee</option>
                      {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name} — {emp.department || 'No dept'}</option>))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Category</label><input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Design, Dev, QA..." /></div>
                  <div className="form-group"><label>Due Date</label><input className="form-input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
