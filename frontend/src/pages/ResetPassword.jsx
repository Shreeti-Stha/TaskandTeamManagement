import { Save } from "lucide-react";
import { useState } from "react";
import FormMessage from "../components/FormMessage";
import { useAuth } from "../context/AuthContext";

const ResetPassword = () => {
  const { user, updatePassword } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await updatePassword(payload);
      setForm((current) => ({ ...current, password: "" }));
      setMessage("Password changed successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not change the password");
    }
  };

  return (
    <section className="panel max-w-2xl p-5">
      <h2 className="mb-5 text-lg font-bold text-ink">Profile</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormMessage type={message.includes("updated") ? "success" : "error"}>{message}</FormMessage>
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input className="input mt-1" id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input mt-1" id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </div>
        <div>
          <label className="label" htmlFor="password">New Password</label>
          <input className="input mt-1" id="password" type="password" minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </div>

        <button className="btn-primary" type="submit">
          <Save size={16} />
          Reset Password
        </button>
      </form>
    </section>
  );
};

export default ResetPassword;
