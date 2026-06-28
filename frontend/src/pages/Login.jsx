import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormMessage from "../components/FormMessage";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <form className="panel w-full max-w-md space-y-5 p-6" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-bold text-ink">Sign in</h2>
        <p className="mt-1 text-sm text-slate-500">Continue to your workspace.</p>
      </div>
      <FormMessage>{error}</FormMessage>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input
          className="input mt-1 border-blue-300 "
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
          className="input mt-1  border-blue-300 "
          id="password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
      </div>
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-sm text-slate-500">
        New here? <Link className="font-semibold text-brand" to="/register">Create an account</Link>
      </p>
    </form>
  );
};

export default Login;
