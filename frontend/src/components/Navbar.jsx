import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    
    if (token && userInfo) {
      setIsLoggedIn(true);
      const user = JSON.parse(userInfo);
      setUserType(user.userType);
    }
  }, []);

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
              <li>
                <button onClick={() => {
                  switch (userType) {
                    case 'Student':
                      navigate('/student-profile');
                      break;
                    case 'Fresher':
                      navigate('/fresher-profile');
                      break;
                    case 'Experienced':
                      navigate('/experienced-profile');
                      break;
                    default:
                      break;
                  }
                }}>Profile</button>
              </li>
              <li><a href="#about">About</a></li>
            </ul>
            <div className="nav-buttons">
              <span className="user-type">{userType}</span>
              <button className="btn-secondary" onClick={handleLogout}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <ul className="nav-menu">
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
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
