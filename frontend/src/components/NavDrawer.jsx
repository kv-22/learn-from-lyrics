import { Link, useLocation } from 'react-router-dom';
import './NavDrawer.css';

const NavDrawer = ({ isOpen, onClose }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <>
      <div className="nav-drawer-overlay" onClick={onClose}></div>
      <div className="nav-drawer">
        <div className="nav-drawer-header">
          <div className="nav-drawer-title-section">
            <h2 className="nav-drawer-title">Arabic Songs</h2>
            <p className="nav-drawer-subtitle">Learn from music</p>
          </div>
          <button className="nav-drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <nav className="nav-drawer-menu">
          <Link
            to="/"
            className={`nav-drawer-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={onClose}
          >
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Home</span>
          </Link>
          <Link
            to="/vocabulary"
            className={`nav-drawer-item ${location.pathname === '/vocabulary' ? 'active' : ''}`}
            onClick={onClose}
          >
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>Vocabulary</span>
          </Link>
          <Link
            to="/profile"
            className={`nav-drawer-item ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={onClose}
          >
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default NavDrawer;

