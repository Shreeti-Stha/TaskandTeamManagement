import { FolderKanban, ShieldCheck, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import axios from "axios";


const AdminPanel = () => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const openResetModal = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setShowModal(true);
  };

  const loadAdminData = async () => {
    const [dashboardRes, usersRes, projectsRes] = await Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/users"),
      api.get("/admin/projects"),



    ]);
    setDashboard(dashboardRes.data);
    setUsers(usersRes.data);
    setProjects(projectsRes.data);


  };

  useEffect(() => {
    loadAdminData();
  }, []);


  const toggleStatus = async (user) => {
    await api.put(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
    loadAdminData();
    console.log(user);
  };

  const deleteUser = async (id) => {
    await api.delete(`/admin/users/${id}`);
    loadAdminData();
  };

  //change password


  const handleResetPassword = async (user) => {
    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match.");
    }
    try {
      const { data } = await api.put(
        `/admin/users/${selectedUser._id}/password`,
        {
          newPassword,
        }
      );

      alert(data.message);
      setShowModal(false);

      setNewPassword("");

      setConfirmPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    }
  };




  const deleteProject = async (id) => {
    await api.delete(`/admin/projects/${id}`);
    loadAdminData();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={dashboard?.totalUsers ?? 0} />
        <StatCard icon={ShieldCheck} label="Active Users" value={dashboard?.activeUsers ?? 0} accent="text-emerald-600" />
        <StatCard icon={FolderKanban} label="Projects" value={dashboard?.totalProjects ?? 0} accent="text-coral" />
        <StatCard label="Completion Rate" value={`${dashboard?.completionRate ?? 0}%`} />
      </div>

      <section className="panel p-5">
        <h2 className="mb-4 text-lg font-bold text-ink">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-3">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="py-3 font-semibold text-ink">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.isActive ? "Active" : "Inactive"}</td>
                  <td className="space-x-2 text-right">
                    <button className="btn-muted" onClick={() => toggleStatus(user)}>
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button className="btn-primary"
                      onClick={() => openResetModal(user)}
                    >
                      Reset Password
                    </button>
                    <button className="btn-muted text-red-600" onClick={() => deleteUser(user._id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


          {/* Reset Password Modal */}

          {showModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: "25px",
                  borderRadius: "10px",
                  width: "350px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                <h2 className="text-lg font-bold text-ink">
                  {/* style={{ marginBottom: "20px" }}> */}
                  Reset Password
                </h2>
                <input className="input mt-1 border-gray-400"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                // style={{
                //   width: "100%",
                //   padding: "10px",
                //   marginBottom: "10px",
                //   border: "1px solid #ccc",
                //   borderRadius: "5px",
                // }}
                />
                <input className="input mt-1 border-gray-400"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                // style={{
                //   width: "100%",
                //   padding: "10px",
                //   marginBottom: "20px",
                //   border: "1px solid #ccc",
                //   borderRadius: "5px",
                // }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",

                  }}
                >
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: "8px 15px",
                        cursor: "pointer",
                        margin: "15px",
                      }}
                    >
                      Cancel
                    </button>
                    <button className="btn-primary "
                      onClick={handleResetPassword}
                      style={{
                        padding: "8px 15px",
                        cursor: "pointer",
                        margin: "15px",
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* 



          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Reset Password</h3>

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button onClick={() => setShowModal(false)}>
                  Cancel
                </button>

                <button onClick={handleResetPassword}>
                  Save
                </button>
              </div>
            </div>
          )} */}

        </div>
      </section >

      <section className="panel p-5">
        <h2 className="mb-4 text-lg font-bold text-ink">Project Management</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <article className="rounded-lg border border-slate-200 p-4" key={project._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-ink">{project.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{project.description || "No description"}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    Owner: {project.createdBy?.name || "Deleted user"} · {project.members.length} members
                  </p>
                </div>
                <button className="btn-muted text-red-600" onClick={() => deleteProject(project._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div >
  );
};

export default AdminPanel;
