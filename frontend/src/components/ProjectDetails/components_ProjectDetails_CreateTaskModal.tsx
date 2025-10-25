import React, { useState } from "react";
import { taskService } from "../../services/services_taskService";
import { Task } from "../../types/types_task.types";

interface Props {
  projectId: string;
  existingTasks: Task[];
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

const CreateTaskModal: React.FC<Props> = ({
  projectId,
  existingTasks,
  onClose,
  onTaskCreated,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    dueDate: "",
    isCompleted: false,
    estimatedHours: "8",
    dependencies: [] as string[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    try {
      // Filter out empty dependencies before sending
      const validDependencies = formData.dependencies.filter(
        (dep) => dep && dep.trim() !== ""
      );

      const task = await taskService.createTask(projectId, {
        title: formData.title.trim(),
        dueDate: formData.dueDate || undefined,
        isCompleted: formData.isCompleted,
        estimatedHours: formData.estimatedHours
          ? parseInt(formData.estimatedHours)
          : 8,
        dependencies:
          validDependencies.length > 0 ? validDependencies : undefined,
      });
      onTaskCreated(task);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const incompleteTasks = existingTasks.filter((t) => !t.isCompleted);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Task</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              Task Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              maxLength={200}
              placeholder="Enter task title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
            <small>Required for smart scheduling</small>
          </div>

          <div className="form-group">
            <label htmlFor="estimatedHours">Estimated Hours</label>
            <input
              type="number"
              id="estimatedHours"
              value={formData.estimatedHours}
              onChange={(e) =>
                setFormData({ ...formData, estimatedHours: e.target.value })
              }
              min="1"
              max="1000"
              placeholder="e.g., 8"
            />
            <small>Used for smart scheduling (default: 8 hours)</small>
          </div>

          {incompleteTasks.length > 0 ? (
            <div className="form-group">
              <label htmlFor="dependencies">Task Dependencies</label>
              <select
                id="dependencies"
                multiple
                value={formData.dependencies}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setFormData({ ...formData, dependencies: selected });
                }}
                style={{ minHeight: "120px" }}
              >
                {incompleteTasks.map((task) => (
                  <option key={task.id} value={task.title}>
                    {task.title}
                  </option>
                ))}
              </select>
              <small>
                Hold Ctrl (Cmd on Mac) to select multiple tasks that must be
                completed first
              </small>
              {formData.dependencies.length > 0 && (
                <div
                  style={{
                    marginTop: "0.625rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.375rem",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--gray-text)",
                      width: "100%",
                    }}
                  >
                    Selected: {formData.dependencies.length}
                  </strong>
                  {formData.dependencies.map((dep, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "rgba(52, 211, 153, 0.1)",
                        color: "#34D399",
                        padding: "0.25rem 0.625rem",
                        borderRadius: "6px",
                        fontSize: "0.7rem",
                        border: "1px solid rgba(52, 211, 153, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      {dep}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            dependencies: formData.dependencies.filter(
                              (d) => d !== dep
                            ),
                          });
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#34D399",
                          cursor: "pointer",
                          padding: "0",
                          fontSize: "0.875rem",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <div
                style={{
                  padding: "0.875rem",
                  background: "rgba(156, 163, 175, 0.1)",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  color: "var(--gray-text)",
                  border: "1px solid var(--border-color)",
                }}
              >
                💡 No other incomplete tasks available for dependencies. Create
                more tasks to set up dependencies.
              </div>
            </div>
          )}

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isCompleted"
              checked={formData.isCompleted}
              onChange={(e) =>
                setFormData({ ...formData, isCompleted: e.target.checked })
              }
            />
            <label htmlFor="isCompleted">Mark as completed</label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Adding..." : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
