import { Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import FormMessage from "../components/FormMessage";
import api from "../services/api";
import Multiselect from "multiselect-react-dropdown";

const initialForm = {
  title: "",
  description: "",
  project: "",
  assignedTo: [],
  priority: "Medium",
  status: "Pending",
  dueDate: ""
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: ""
  });
  const [message, setMessage] = useState("");

  const loadTasks = async () => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value)
    );

    const { data } = await api.get("/tasks", {
      params
    });

    setTasks(data);
  };

  useEffect(() => {
    api.get("/projects").then(({ data }) => {
      setProjects(data);
    });
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const currentProject = useMemo(() => {
    return projects.find(
      (project) => project._id === form.project
    );
  }, [projects, form.project]);

  const selectedMembers = useMemo(() => {
    if (!currentProject) return [];

    return currentProject.members.filter((member) =>
      form.assignedTo.includes(member._id)
    );
  }, [currentProject, form.assignedTo]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const editTask = (task) => {
    setEditingId(task._id);

    setForm({
      title: task.title,
      description: task.description || "",
      project: task.project?._id || task.project,

      assignedTo: Array.isArray(task.assignedTo)
        ? task.assignedTo.map((user) =>
          user._id ? user._id : user
        )
        : [],

      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate
        ? task.dueDate.slice(0, 10)
        : ""
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo
      };

      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload);
        setMessage("Task updated.");
      } else {
        await api.post("/tasks", payload);
        setMessage("Task created.");
      }

      resetForm();
      loadTasks();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Could not save task"
      );
    }
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    loadTasks();
  };

  return (
    <div className="flex gap-2">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormMessage
          type={
            message.includes("created") || message.includes("updated")
              ? "success"
              : "error"
          }
        >
          {message}
        </FormMessage>

        <div>
          <label className="label" htmlFor="title">
            Title
          </label>

          <input
            id="title"
            className="input mt-1 border-gray-400"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            className="input mt-1 min-h-24 border-gray-400"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {/* Project */}

          <div>
            <label className="label">
              Project
            </label>

            <select
              className="input mt-1 border-gray-400"
              value={form.project}
              disabled={Boolean(editingId)}
              onChange={(e) =>
                setForm({
                  ...form,
                  project: e.target.value,
                  assignedTo: [],
                })
              }
              required
            >
              <option value="">
                Select project
              </option>

              {projects.map((project) => (
                <option
                  key={project._id}
                  value={project._id}
                >
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* Multiple Assignee */}

          <div>
            <label className="label">
              Assignees
            </label>

            <Multiselect
              options={currentProject?.members || []}
              displayValue="name"

              selectedValues={selectedMembers}

              onSelect={(selectedList) =>
                setForm({
                  ...form,
                  assignedTo: selectedList.map(
                    (user) => user._id
                  ),
                })
              }

              onRemove={(selectedList) =>
                setForm({
                  ...form,
                  assignedTo: selectedList.map(
                    (user) => user._id
                  ),
                })
              }

              showCheckbox

              placeholder="Select Assignees"

              style={{
                chips: {
                  background: "#2563eb",
                },
                searchBox: {
                  border: "1px solid #9ca3af",
                  borderRadius: "0.5rem",
                  minHeight: "44px",
                },
              }}
            />
          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-3">

          <div>
            <label className="label">
              Priority
            </label>

            <select
              className="input mt-1 border-gray-400"
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority: e.target.value,
                })
              }
            >
              <option>
                Low
              </option>

              <option>
                Medium
              </option>

              <option>
                High
              </option>

            </select>
          </div>

          <div>
            <label className="label">
              Status
            </label>

            <select
              className="input mt-1 border-gray-400"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
            >
              <option>
                Pending
              </option>

              <option>
                In Progress
              </option>

              <option>
                Completed
              </option>

            </select>
          </div>

          <div>
            <label className="label">
              Due Date
            </label>

            <input
              type="date"
              className="input mt-1 border-gray-400"
              value={form.dueDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  dueDate: e.target.value,
                })
              }
              required
            />
          </div>

        </div>
        <div className="flex gap-2">
          <button className="btn-primary" type="submit">
            <Save size={16} />
            Save
          </button>

          {editingId && (
            <button
              className="btn-muted"
              type="button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>

      </form >


      {/* ===========================
          TASK LIST
      ============================ */}

      < section className="space-y-4" >

        <div className="panel flex flex-col gap-3 p-4 md:flex-row">

          <select
            className="input"
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value
              })
            }
          >
            <option value="">All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>

          <select
            className="input"
            value={filters.priority}
            onChange={(e) =>
              setFilters({
                ...filters,
                priority: e.target.value
              })
            }
          >
            <option value="">All Priority</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

        </div>

        {
          tasks.length === 0 ? (

            <EmptyState
              title="No tasks found"
              message="Create a task or clear the filters."
            />

          ) : (

            tasks.map((task) => (

              <article
                key={task._id}
                className="panel p-5"
              >

                <div className="flex flex-col justify-between gap-4 md:flex-row">

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="text-lg font-bold text-ink">
                        {task.title}
                      </h3>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {task.status}
                      </span>

                      <span className="rounded-md bg-coral/10 px-2 py-1 text-xs font-semibold text-coral">
                        {task.priority}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {task.description || "No description"}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">

                      <strong>Project:</strong>{" "}
                      {task.project?.title}

                      <br />

                      <strong>Assigned To:</strong>{" "}

                      {Array.isArray(task.assignedTo)
                        ? task.assignedTo
                          .map((user) => user.name)
                          .join(", ")
                        : "No Assignee"}

                    </p>

                  </div>

                  <div className="flex gap-2">

                    <button
                      className="btn-muted"
                      onClick={() => editTask(task)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-muted text-red-600"
                      onClick={() => deleteTask(task._id)}
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

              </article>

            ))

          )
        }

      </section >

    </div >
  );
};

export default Tasks;
