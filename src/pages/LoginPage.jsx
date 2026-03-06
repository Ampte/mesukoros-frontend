import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuth } from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setAuth(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card reveal">
      <h2>Welcome Back</h2>
      <p>Login as seller or customer to continue.</p>

      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button className="primary-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="muted">
        Need an account? <Link to="/register">Create one</Link>
      </p>
    </section>
  );
}
