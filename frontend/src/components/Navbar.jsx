import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('');
  const [userName, setUserName] = useState('');

  // Check login status whenever the route changes
  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    
    console.log('Token:', token);
    console.log('User Info:', userInfo);
    
    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        console.log('Parsed User:', user);
        setIsLoggedIn(true);
        setUserType(user.userType || user.type); // Handle both userType and type fields
        setUserName(user.name || '');
        console.log('Login Status:', true);
        console.log('User Type:', user.userType || user.type);
      } catch (error) {
        console.error('Error parsing user info:', error);
        handleLogout(); // Clear invalid data
      }
    } else {
      console.log('Not logged in');
      setIsLoggedIn(false);
      setUserType('');
      setUserName('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserType('');
    navigate('/');
  };

  const navigateToDashboard = () => {
    switch (userType) {
      case 'Student':
        navigate('/student-dashboard');
        break;
      case 'Fresher':
        navigate('/fresher-dashboard');
        break;
      case 'Experienced':
        navigate('/experienced-dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo" onClick={() => navigate('/')}>CareerCatalyst</div>
        {isLoggedIn ? (
          <>
            <ul className="nav-menu">
              <li><button onClick={navigateToDashboard}>Dashboard</button></li>
              {/* Profile removed from navbar per request */}
              <li><button onClick={() => navigate('/')}>About</button></li>
            </ul>
            <div className="nav-buttons logged-in">
              <div className="user-info">
                <span className="user-name">{userName || 'User'}</span>
                {userType && <span className="user-role">({userType})</span>}
              </div>
              <button 
                className="btn-logout" 
                onClick={handleLogout}
                title="Logout"
              >
                <span className="logout-icon">↪</span>
                <span className="logout-text">Logout</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <ul className="nav-menu">
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><button onClick={() => navigate('/')}>About</button></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
            <div className="nav-buttons">
              <button className="btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn-primary" onClick={() => navigate('/register')}>Get Started</button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
