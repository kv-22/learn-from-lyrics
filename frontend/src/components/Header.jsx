import './Header.css';

const Header = ({ title, onMenuClick }) => {
  return (
    <header className="app-header">
      <button className="menu-button" onClick={onMenuClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <h1 className="header-title">{title}</h1>
    </header>
  );
};

export default Header;

