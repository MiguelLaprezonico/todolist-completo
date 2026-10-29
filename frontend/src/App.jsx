import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { useDebounce } from './hooks/useDebounce.js';
import TaskItem from './components/TaskItem.jsx';
import TaskModal from './components/TaskModal.jsx';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [totals, setTotals] = useState({ total: 0, completed: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | { task?: Task }

  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async (signal) => {
    try {
      const data = await api.list(debouncedSearch, status, signal);
      setTasks(data.tasks);
      setTotals({ total: data.total, completed: data.completed });
      setError('');
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status]);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const run = async (fn) => {
    try { await fn(); await load(); } catch (err) { setError(err.message); }
  };

  const handleToggle = (t) => run(() => api.update(t.id, { completed: !t.completed }));
  const handleDelete = (t) => {
    if (window.confirm(`Excluir a tarefa "${t.title}"?`)) run(() => api.remove(t.id));
  };

  async function handleSubmit(values) {
    if (modal.task) await api.update(modal.task.id, values);
    else await api.create(values);
    setModal(null);
    await load();
  }

  const pending = totals.total - totals.completed;

  return (
    <div className="page">
      <header className="topbar">
        <div className="logo">
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 0c1 6 6 11 12 12-6 1-11 6-12 12-1-6-6-11-12-12 6-1 11-6 12-12Z" fill="#191A23" /></svg>
          <span>Tasks</span>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h1>Organizing your <br />tasks for <span className="hl">success</span></h1>
          <p>Keep track of what matters, set deadlines and never miss a thing.</p>
        </section>

        <section className="stats">
          <div className="stat stat-light">
            <span className="stat-num">{totals.total}</span>
            <span className="stat-label">Total tasks</span>
          </div>
          <div className="stat stat-lime">
            <span className="stat-num">{totals.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat stat-dark">
            <span className="stat-num">{pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </section>

        <section className="toolbar">
          <div className="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              type="search"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="tabs">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`tab ${status === f.value ? 'active' : ''}`}
                onClick={() => setStatus(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {error && <div className="alert">{error}</div>}

        <section className="list-card">
          {loading ? (
            <p className="muted center">Loading...</p>
          ) : tasks.length === 0 ? (
            <div className="empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#191A23" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 12h8M8 16h4" />
              </svg>
              <p>You have no pending tasks.</p>
            </div>
          ) : (
            <ul className="tasks">
              {tasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onToggle={handleToggle}
                  onEdit={(task) => setModal({ task })}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      <button className="fab" onClick={() => setModal({})} aria-label="Create task" title="Create task">+</button>

      {modal && (
        <TaskModal task={modal.task} onClose={() => setModal(null)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
