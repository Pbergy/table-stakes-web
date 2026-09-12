import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login or register
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const data = mode === 'login'
        ? { username, password }
        : { username, email, password };

      const response = await axios.post(`${API_URL}${endpoint}`, data);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="brand">
          <div className="mark">♠</div>
          <h1>Table Stakes</h1>
        </div>
        <p className="tagline">Play poker with friends. No money, just bragging rights.</p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            maxLength="50"
          />

          {mode === 'register' && (
            <>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </>
          )}

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            maxLength="40"
          />

          <button type="submit" className="btn-gold btn-block" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        <div className="toggle-mode">
          {mode === 'login' ? (
            <>
              Don't have an account?
              <button type="button" className="link-btn" onClick={() => setMode('register')}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?
              <button type="button" className="link-btn" onClick={() => setMode('login')}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
