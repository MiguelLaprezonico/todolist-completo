import { useEffect, useState } from 'react';

export default function TaskModal({ task, onClose, onSubmit }) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.slice(0, 10) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('O nome da tarefa é obrigatório.');
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), dueDate: dueDate || null });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit} role="dialog" aria-modal="true">
        <h2>
          <span className="hl">{isEdit ? 'Edit Task' : 'Create Task'}</span>
        </h2>

        <label className="field">
          <span>Task name</span>
          <input
            autoFocus
            value={title}
            maxLength={255}
            placeholder="What needs to be done?"
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
          />
        </label>

        <label className="field">
          <span>Due date <em>(optional)</em></span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-dark" disabled={saving}>
            {isEdit ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </div>
  );
}
