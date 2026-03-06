import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getAuth } from "../api";

export default function Header() {
  const auth = getAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const roleLinks = auth?.user?.role === "seller"
    ? [
      { to: "/dashboard/my-vegetables", label: "My Vegetables" },
      { to: "/dashboard/manage-vegetables", label: "Manage" },
      { to: "/dashboard/orders", label: "Orders" }
    ]
    : auth?.user?.role === "admin"
      ? []
      : [
        { to: "/dashboard/vegetables-available", label: "Vegetables" },
        { to: "/dashboard/my-orders", label: "My Orders" }
      ];

  function logout() {
    clearAuth();
    setSidebarOpen(false);
    navigate("/login");
  }

  return (
    <>
      <header className="topbar">
        <div className="brand-wrap">
          <span className="brand-badge">Farm to Home</span>
          <h1>MesuKoros</h1>
        </div>

        {auth?.token && !isAuthPage && (
          <nav className="main-nav">
            {roleLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="topbar-actions">
          {auth?.token ? (
            <>
              <span className="user-pill">{auth.user.name} ({auth.user.role})</span>
              <button className="secondary-btn desktop-only" onClick={logout}>Logout</button>
              {!isAuthPage && (
                <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                  <span className="menu-line" />
                  <span className="menu-line" />
                  <span className="menu-line" />
                </button>
              )}
            </>
          ) : (
            !isAuthPage && (
              <>
                <Link to="/login" className="secondary-btn">Login</Link>
                <Link to="/register" className="primary-btn">Create Account</Link>
              </>
            )
          )}
        </div>
      </header>

      {sidebarOpen && (
        <>
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
          <aside className="mobile-sidebar">
            <h3>Pages</h3>
            <nav className="sidebar-links">
              {roleLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <button className="secondary-btn" onClick={logout}>Logout</button>
          </aside>
        </>
      )}
    </>
  );
}
