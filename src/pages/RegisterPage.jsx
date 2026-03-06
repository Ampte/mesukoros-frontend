import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuth } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "seller"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api("/auth/register", {
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
      <h2>Create Account</h2>
      <p>Join MesuKoros as a vegetable seller or customer.</p>

      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
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

        <div className="role-row">
          <label>
            <input
              type="radio"
              checked={form.role === "seller"}
              onChange={() => setForm({ ...form, role: "seller" })}
            />
            Seller
          </label>
          <label>
            <input
              type="radio"
              checked={form.role === "customer"}
              onChange={() => setForm({ ...form, role: "customer" })}
            />
            Customer
          </label>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="primary-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="muted">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}
