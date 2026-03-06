import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        <Link to="/admin-access" className="footer-brand-link">MesuKoros</Link>
        {" | Fresh vegetables from local sellers to your home."}
      </p>
    </footer>
  );
}
