import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">CareerCatalyst</div>
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
      </div>
    </nav>
  );
}
