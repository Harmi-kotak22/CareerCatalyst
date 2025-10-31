import React, { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const userTypes = ['Student', 'Fresher', 'Experienced'];

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: userTypes[0],
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api';

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h2 className="auth-title">Register</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
          <select name="userType" value={form.userType} onChange={handleChange}>
            {userTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn-primary-large" type="submit">Register</button>
        </form>
        <div className="auth-switch">Already have an account? <span onClick={() => navigate('/login')}>Login</span></div>
      </div>
    </>
  );
}
