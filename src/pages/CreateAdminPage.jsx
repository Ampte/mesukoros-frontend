import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuth } from "../api";

export default function CreateAdminPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_bootstrap_token");
    if (!token) {
      navigate("/admin-access", { replace: true });
    }
  }, [navigate]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const bootstrapToken = sessionStorage.getItem("admin_bootstrap_token") || "";
      const data = await api("/admin/bootstrap/create", {
        method: "POST",
        body: JSON.stringify({
          bootstrapToken,
          name: form.name,
          email: form.email,
          password: form.password
        })
      });

      sessionStorage.removeItem("admin_bootstrap_token");
      setAuth(data);
      navigate("/dashboard/admin-summary", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card reveal">
      <h2>Create Admin</h2>
      <p>Create your admin account to manage MesuKoros.</p>
      <form className="form-grid" onSubmit={submit}>
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
        {error && <p className="error-text">{error}</p>}
        <button className="primary-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Admin Account"}
        </button>
      </form>
    </section>
  );
}
