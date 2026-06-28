import { FolderPlus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import FormMessage from "../components/FormMessage";
import api from "../services/api";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", members: [] });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadProjects = async () => {
    const { data } = await api.get("/projects");
    setProjects(data);
  };

  useEffect(() => {
    loadProjects();
    api.get("/users").then(({ data }) => setUsers(data.filter((user) => user.isActive))).catch(() => setUsers([]));
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === editingId),
    [editingId, projects]
  );

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "", description: "", members: [] });
  };

  const editProject = (project) => {
    setEditingId(project._id);
    setForm({
      title: project.title,
      description: project.description || "",
      members: project.members.map((member) => member._id)
    });
  };

  const handleMemberToggle = (id) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(id)
        ? current.members.filter((memberId) => memberId !== id)
        : [...current.members, id]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, form);
        setMessage("Project updated.");
      } else {
        await api.post("/projects", form);
        setMessage("Project created.");
      }
      resetForm();
      loadProjects();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save project");
    }
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    if (editingId === id) resetForm();
    loadProjects();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="panel h-fit p-5">
        <div className="mb-5 flex items-center gap-2">
          <FolderPlus className="text-brand" size={20} />
          <h2 className="text-lg font-bold text-ink">{editingId ? "Edit Project" : "Create Project"}</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormMessage type={message.includes("created") || message.includes("updated") ? "success" : "error"}>
            {message}
          </FormMessage>
          <div>
            <label className="label" htmlFor="title">Title</label>
            <input
              className="input mt-1 border-gray-400"
              id="title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              className="input mt-1 min-h-28 border-gray-400"
              id="description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <div>
            <p className="label">Members</p>
            <div className="mt-2 max-h-48 space-y-2 overflow-auto rounded-md border border-slate-200 p-3">
              {users.length === 0 && <p className="text-sm text-slate-500">Admins can choose active users here.</p>}
              {users.map((user) => (
                <label className="flex items-center gap-2 text-sm" key={user._id}>
                  <input
                    type="checkbox"
                    checked={form.members.includes(user._id)}
                    onChange={() => handleMemberToggle(user._id)}
                  />
                  {user.name} <span className="text-slate-400">{user.email}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">
              <Save size={16} />
              Save
            </button>
            {editingId && (
              <button className="btn-muted" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
          {selectedProject && <p className="text-xs text-slate-500">Editing {selectedProject.title}</p>}
        </form>
      </section>

      <section className="space-y-4">
        {projects.length === 0 ? (
          <EmptyState title="No projects yet" message="Create a project to invite members and assign tasks." />
        ) : (
          projects.map((project) => (
            <article className="panel p-5" key={project._id}>
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h3 className="text-lg font-bold text-ink">{project.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{project.description || "No description"}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    Owner: {project.createdBy?.name} · {project.members.length} members
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-muted" onClick={() => editProject(project)}>Edit</button>
                  <button className="btn-muted text-red-600" onClick={() => deleteProject(project._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default Projects;
