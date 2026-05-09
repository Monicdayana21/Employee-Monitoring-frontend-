import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiX, FiEye, FiEyeOff, FiCheckCircle, FiClock, FiRefreshCw } from 'react-icons/fi';

const IST = { timeZone: 'Asia/Kolkata' };
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', IST);

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', designation: '', phone: '' });

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try { const res = await adminAPI.getEmployees(); setEmployees(res.data.employees); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createEmployee(form);
      toast.success('Employee created successfully!');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', department: '', designation: '', phone: '' });
      setShowPwd(false);
      loadEmployees();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create employee'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete employee ${name}?`)) return;
    try { await adminAPI.deleteEmployee(id); toast.success('Employee deleted'); loadEmployees(); }
    catch (err) { toast.error('Failed to delete employee'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Employees</h1><p>Manage employee accounts and credentials</p></div>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}><FiPlus size={15} /> Add Employee</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Designation</th><th>Status</th><th>Tasks</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan="8"><div className="empty-state"><h3>No employees yet</h3><p>Create your first employee above</p></div></td></tr>
            ) : employees.map((emp) => (
              <tr key={emp.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.department || '—'}</td>
                <td>{emp.designation || '—'}</td>
                <td><span className={`badge ${emp.status}`}>{emp.status}</span></td>
                <td>
                  <span style={{ fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span title="Completed" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><FiCheckCircle size={12} color="#22c55e" /> {emp.completed_tasks || 0}</span>
                    <span title="Pending" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><FiClock size={12} color="#f59e0b" /> {emp.pending_tasks || 0}</span>
                    <span title="In Progress" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><FiRefreshCw size={12} color="#3b82f6" /> {emp.in_progress_tasks || 0}</span>
                  </span>
                </td>
                <td style={{ fontSize: 12 }}>{fmtDate(emp.created_at)}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id, emp.name)}><FiTrash2 size={13} /> Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Employee</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Full Name *</label><input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" /></div>
                  <div className="form-group"><label>Email *</label><input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" /></div>
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <div className="input-password-wrap">
                    <input className="form-input" type={showPwd ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a password" />
                    <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                      {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Department</label><input className="form-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Engineering" /></div>
                  <div className="form-group"><label>Designation</label><input className="form-input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Software Engineer" /></div>
                </div>
                <div className="form-group"><label>Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Create Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
