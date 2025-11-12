import React, { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const API_URL = 'http://localhost:5000/api';

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting login with:', form);

      // First check if backend is accessible
      try {
        await fetch('http://localhost:5000');
      } catch (err) {
        throw new Error('Cannot connect to server. Please make sure the backend server is running.');
      }

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      console.log('Login response:', data);
      
      if (res.ok) {
        // Store the token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        const user = data.user;
        switch (user.userType) {
          case 'Student':
            navigate('/student-dashboard');
            break;
          case 'Fresher':
            if (user.isProfileComplete) {
              navigate('/fresher-dashboard');
            } else {
              navigate('/fresher-profile');
            }
            break;
          case 'Experienced':
            if (user.isProfileComplete) {
              navigate('/experienced-dashboard');
            } else {
              navigate('/experienced-profile');
            }
            break;
          default:
            navigate('/');
            break;
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Server error. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h2 className="auth-title">Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          {error && <div className="auth-error">{error}</div>}
          <button className="btn-primary-large" type="submit">Login</button>
        </form>
        <div className="auth-switch">Don't have an account? <span onClick={() => navigate('/register')}>Register</span></div>
      </div>
    </>
  );
}
