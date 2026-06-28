import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormMessage from "../components/FormMessage";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form className="panel w-full max-w-md space-y-5 p-6" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-bold text-ink">Create account</h2>
        <p className="mt-1 text-sm text-slate-500">The first registered user becomes admin.</p>
      </div>
      <FormMessage>{error}</FormMessage>
      <div>
        <label className="label" htmlFor="name">Name</label>
        <input
          className="input mt-1  border-blue-300 "
          id="name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input
          className="input mt-1  border-blue-300 "
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input
          className="input mt-1 border-blue-300 "
          id="password"
          type="password"
          minLength={8}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
      </div>
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-500">
        Already registered? <Link className="font-semibold text-brand" to="/login">Sign in</Link>
      </p>
    </form>
  );
};

export default Register;
