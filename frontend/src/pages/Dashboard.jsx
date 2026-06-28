import { CheckCircle2, CircleDotDashed, Clock3, FolderKanban, ListTodo, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "../components/StatCard";
import api from "../services/api";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [summaryRes, projectsRes, tasksRes] = await Promise.all([
        api.get("/tasks/summary"),
        api.get("/projects"),
        api.get("/tasks")
      ]);
      setSummary(summaryRes.data);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data.slice(0, 5));
    };
    load();
  }, []);

  const chartData = summary
    ? [
      { name: "Completed", value: summary.completedTasks, color: "#176b87" },
      { name: "In Progress", value: summary.inProgressTasks, color: "#df6c4f" },
      { name: "Pending", value: summary.pendingTasks, color: "#f2b84b" }
    ]
    : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={ListTodo} label="Total Tasks" value={summary?.totalTasks ?? 0} />
        <StatCard icon={CheckCircle2} label="Completed" value={summary?.completedTasks ?? 0} accent="text-emerald-600" />
        <StatCard icon={CircleDotDashed} label="In Progress" value={summary?.inProgressTasks ?? 0} accent="text-amber-600" />
        <StatCard icon={Clock3} label="Pending" value={summary?.pendingTasks ?? 0} accent="text-amber-600" />
        <StatCard icon={TrendingUp} label="Progress" value={`${summary?.progress ?? 0}%`} accent="text-coral" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Recent Tasks</h2>
            <span className="text-sm text-slate-500">{projects.length} projects</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td className="py-3 font-semibold text-ink">{task.title}</td>
                    <td>{task.project?.title}</td>
                    {/* <td>{task.assignedTo?.name}</td> */}
                    <td>
                      {Array.isArray(task.assignedTo)
                        ? task.assignedTo
                          .map((user) => user.name)
                          .join(", ")
                        : "No Assignee"}</td>
                    <td>{task.status}</td>
                    <td>{task.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <FolderKanban size={18} className="text-brand" />
            <h2 className="text-lg font-bold text-ink">Task Mix</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
