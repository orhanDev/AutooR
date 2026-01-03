import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status from sessionStorage or localStorage
    const checkLoginStatus = () => {
      const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true' || 
                      localStorage.getItem('isLoggedIn') === 'true';
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 
                                     localStorage.getItem('currentUser') || '{}');
      const userData = JSON.parse(sessionStorage.getItem('userData') || 
                                 localStorage.getItem('userData') || '{}');
      
      setIsLoggedIn(loggedIn);
      
      const fullName = currentUser.firstName || userData.name || '';
      setUserName(fullName.split(' ')[0] || '');
    };

    checkLoginStatus();
    
    // Listen for storage changes
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('');
    setAccountMenuOpen(false);
    navigate('/');
  };

  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
  };

  const toggleNavbar = () => {
    setNavbarOpen(!navbarOpen);
  };

  return (
    <nav className="navbar fixed-top">
      <div className="container d-flex align-items-center">
        <button 
          className="navbar-toggler me-2 d-flex align-items-center" 
          type="button" 
          onClick={toggleNavbar}
          aria-label="Menü"
        >
          <span className="navbar-toggler-icon"></span>
          <span className="menu-label ms-2">Menü</span>
        </button>
        
        <Link className="brand-center" to="/">AutooR</Link>
        
        <div className={`collapse navbar-collapse flex-grow-1 ${navbarOpen ? 'show' : ''}`} id="navbarNav">
          <div className="side-left">
            <div className="menu-header d-flex justify-content-between align-items-center mb-4 d-md-none">
              <h2 className="menu-title mb-0">Menü</h2>
              <button 
                className="btn-close-menu" 
                type="button" 
                onClick={toggleNavbar}
                aria-label="Menüyü Kapat"
              >
                <span>&times;</span>
              </button>
            </div>
            <ul className="navbar-nav" id="navbar-menu-container">
              <li className="nav-item side-item">
                <Link className="nav-link" to="/fahrzeuge" onClick={() => setNavbarOpen(false)}>Fahrzeuge</Link>
              </li>
              <li className="nav-item side-item">
                <Link className="nav-link" to="/angebote" onClick={() => setNavbarOpen(false)}>Angebote</Link>
              </li>
              <li className="nav-item side-item">
                <Link className="nav-link" to="/self-services" onClick={() => setNavbarOpen(false)}>Self‑Services</Link>
              </li>
              <li className="nav-item side-item">
                <Link className="nav-link" to="/extras-versicherung" onClick={() => setNavbarOpen(false)}>Extras</Link>
              </li>
              <li className="nav-item side-item">
                <Link className="nav-link" to="/geschaeftskunden" onClick={() => setNavbarOpen(false)}>Geschäftskunden</Link>
              </li>
              <li className="nav-item side-item">
                <Link className="nav-link" to="/standorte" onClick={() => setNavbarOpen(false)}>Standorte</Link>
              </li>
              <li className="nav-item side-item">
                <Link className="nav-link" to="/hilfe" onClick={() => setNavbarOpen(false)}>Hilfe & Kontakt</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="account ms-auto position-relative">
          <div className="d-flex align-items-center" id="user-info-container">
            {isLoggedIn && userName && (
              <span className="user-name me-3" style={{ color: '#000000', fontWeight: 500 }}>
                {userName}
              </span>
            )}
            <button 
              className="btn account-btn d-flex align-items-center" 
              id="account-btn" 
              onClick={toggleAccountMenu}
              aria-expanded={accountMenuOpen}
              aria-controls="account-menu"
              aria-label="Account"
            >
              <i className="bi bi-person" style={{ fontSize: '1.5rem' }}></i>
            </button>
          </div>
          <div 
            className={`account-menu ${accountMenuOpen ? 'open' : ''}`} 
            id="account-menu" 
            aria-hidden={!accountMenuOpen}
          >
            {isLoggedIn ? (
              <>
                <div className="menu-item" onClick={() => { navigate('/buchungen'); setAccountMenuOpen(false); }}>
                  <i className="bi bi-car-front me-2"></i>
                  <span>Buchungen</span>
                </div>
                <div className="menu-item" onClick={() => { navigate('/abos'); setAccountMenuOpen(false); }}>
                  <i className="bi bi-clock-history me-2"></i>
                  <span>Abos</span>
                </div>
                <div className="menu-item" onClick={() => { navigate('/persoenliche-daten'); setAccountMenuOpen(false); }}>
                  <i className="bi bi-person me-2"></i>
                  <span>Persönliche Daten</span>
                </div>
                <div className="menu-item" onClick={() => { navigate('/profile'); setAccountMenuOpen(false); }}>
                  <i className="bi bi-person-badge me-2"></i>
                  <span>Profile</span>
                </div>
                <div className="menu-separator"></div>
                <div className="menu-item" onClick={() => { navigate('/hilfe'); setAccountMenuOpen(false); }}>
                  <i className="bi bi-question-circle me-2"></i>
                  <span>Hilfe</span>
                </div>
                <div className="menu-item logout-item" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  <span>Abmelden</span>
                </div>
              </>
            ) : (
              <>
                <div className="menu-item" onClick={() => { navigate('/login'); setAccountMenuOpen(false); }}>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  <span>Anmelden</span>
                </div>
                <div className="menu-item" onClick={() => { navigate('/register'); setAccountMenuOpen(false); }}>
                  <i className="bi bi-person-plus me-2"></i>
                  <span>Registrieren</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

