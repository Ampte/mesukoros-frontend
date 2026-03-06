import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function AdminGatePage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api("/admin/access", {
        method: "POST",
        body: JSON.stringify({ password })
      });
      sessionStorage.setItem("admin_bootstrap_token", data.bootstrapToken);
      navigate("/create-admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card reveal">
      <h2>Admin Access</h2>
      <p>Enter admin password to continue.</p>
      <form className="form-grid" onSubmit={submit}>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button className="primary-btn" disabled={loading}>
          {loading ? "Checking..." : "Continue"}
        </button>
      </form>
    </section>
  );
}
