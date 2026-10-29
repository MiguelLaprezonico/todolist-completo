const todayStr = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const formatDate = (s) => (s ? s.slice(0, 10).split('-').reverse().join('/') : '');

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const due = task.due_date ? task.due_date.slice(0, 10) : null;
  const completed = !!task.completed;
  const overdue = !!due && !completed && due < todayStr();

  return (
    <li className={`task ${completed ? 'is-done' : ''} ${overdue ? 'is-overdue' : ''}`}>
      <label className="check">
        <input type="checkbox" checked={completed} onChange={() => onToggle(task)} />
        <span className="box" aria-hidden="true" />
      </label>

      <div className="task-body">
        <span className="task-title">{task.title}</span>
        <div className="task-meta">
          {due && <span className="due">📅 {formatDate(due)}</span>}
          {overdue && <span className="badge-overdue">Em atraso</span>}
        </div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" onClick={() => onEdit(task)} aria-label="Editar tarefa" title="Editar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
        <button className="icon-btn danger" onClick={() => onDelete(task)} aria-label="Excluir tarefa" title="Excluir">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
    </li>
  );
}
