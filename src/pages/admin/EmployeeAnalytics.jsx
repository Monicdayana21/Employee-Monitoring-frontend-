import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiFilter, FiUser, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';

const IST = { timeZone: 'Asia/Kolkata' };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', IST) : '';

const STATUS_COLORS = { pending: '#f59e0b', in_progress: '#3b82f6', completed: '#22c55e', overdue: '#ef4444' };
const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };
const BAR_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'];

const chartTooltipStyle = {
  backgroundColor: '#1a2035',
  border: '1px solid #2a3555',
  borderRadius: '8px',
  color: '#e8ecf4',
  fontSize: '12px',
};

export default function EmployeeAnalytics() {
  const [charts, setCharts] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ employee_id: '', from_date: '', to_date: '' });

  useEffect(() => { loadEmployees(); }, []);
  useEffect(() => { loadCharts(); }, [filters]);

  const loadEmployees = async () => {
    try {
      const res = await adminAPI.getEmployees();
      setEmployees(res.data.employees);
    } catch (err) { console.error(err); }
  };

  const loadCharts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.employee_id) params.employee_id = filters.employee_id;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      const res = await adminAPI.getChartAnalytics(params);
      setCharts(res.data.charts);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetFilters = () => setFilters({ employee_id: '', from_date: '', to_date: '' });

  const c = charts || {};
  const hasData = c.statusDistribution?.length > 0 || c.employeeTaskCounts?.length > 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Employee Analytics</h1>
          <p>Detailed charts and performance insights</p>
        </div>
      </div>

      {/* Filters */}
      <div className="analytics-filters">
        <div className="filter-bar">
          <FiFilter size={16} style={{ color: 'var(--text-muted)' }} />
          <div className="filter-field">
            <FiUser size={14} />
            <select className="form-input filter-select" value={filters.employee_id}
              onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}>
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <FiCalendar size={14} />
            <input type="date" className="form-input filter-select" value={filters.from_date}
              onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} placeholder="From" />
          </div>
          <div className="filter-field">
            <FiCalendar size={14} />
            <input type="date" className="form-input filter-select" value={filters.to_date}
              onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} placeholder="To" />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
            <FiRefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : !hasData ? (
        <div className="table-container">
          <div className="empty-state">
            <div className="icon" style={{ fontSize: 48, opacity: 0.4 }}>
              <FiFilter />
            </div>
            <h3>No data available</h3>
            <p>Create tasks and employees to see analytics</p>
          </div>
        </div>
      ) : (
        <>
          {/* Row 1: Pie charts */}
          <div className="chart-grid-2">
            <div className="chart-card">
              <h3 className="chart-title">Task Status Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={c.statusDistribution} cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                    dataKey="count" nameKey="status" label={({ status, count }) => `${status}: ${count}`}
                    labelLine={{ stroke: '#5a6580' }} fontSize={11}>
                    {c.statusDistribution?.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b95b0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Priority Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={c.priorityDistribution} cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                    dataKey="count" nameKey="priority" label={({ priority, count }) => `${priority}: ${count}`}
                    labelLine={{ stroke: '#5a6580' }} fontSize={11}>
                    {c.priorityDistribution?.map((entry, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[entry.priority] || BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b95b0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Employee bar chart */}
          {c.employeeTaskCounts?.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">Employee Task Breakdown</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={c.employeeTaskCounts} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3555" />
                  <XAxis dataKey="name" tick={{ fill: '#8b95b0', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#8b95b0', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b95b0' }} />
                  <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="in_progress" name="In Progress" fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Row 3: Daily trend area chart */}
          {c.dailyTrend?.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">Daily Task Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={c.dailyTrend.map(d => ({ ...d, date: fmtDate(d.date) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3555" />
                  <XAxis dataKey="date" tick={{ fill: '#8b95b0', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b95b0', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b95b0' }} />
                  <Area type="monotone" dataKey="tasks_created" name="Created" stroke="#6366f1" fill="rgba(99,102,241,0.2)" />
                  <Area type="monotone" dataKey="tasks_completed" name="Completed" stroke="#22c55e" fill="rgba(34,197,94,0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Row 4: Category bar chart */}
          {c.categoryDistribution?.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">Tasks by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={c.categoryDistribution} layout="vertical" barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3555" />
                  <XAxis type="number" tick={{ fill: '#8b95b0', fontSize: 12 }} allowDecimals={false} />
                  <YAxis dataKey="category" type="category" tick={{ fill: '#8b95b0', fontSize: 12 }} width={120} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" name="Tasks" radius={[0,4,4,0]}>
                    {c.categoryDistribution?.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
