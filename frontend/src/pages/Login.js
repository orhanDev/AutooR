import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/style.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    
    const loginSuccess = searchParams.get('login');
    const token = searchParams.get('token');
    const user = searchParams.get('user');

    if (loginSuccess === 'success' && token && user) {
      const userData = JSON.parse(decodeURIComponent(user));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userData', JSON.stringify(userData));
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('currentUser', JSON.stringify({
        firstName: userData.firstName,
        lastName: userData.lastName
      }));
      navigate('/');
    }

    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError('Ein Fehler ist aufgetreten.');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.token) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userData', JSON.stringify(response.data.user));
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify({
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName
        }));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login fehlgeschlagen');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google?state=login';
  };

  return (
    <div className="login-page" style={{ paddingTop: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="login-card">
              <h1>Anmelden</h1>
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">E-Mail</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Passwort</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button type="submit" className="btn btn-primary w-100 mb-3">
                  Anmelden
                </button>
              </form>
              
              <div className="text-center">
                <p>oder</p>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary w-100"
                  onClick={handleGoogleLogin}
                >
                  Mit Google anmelden
                </button>
              </div>
              
              <div className="text-center mt-3">
                <a href="/register">Noch kein Konto? Registrieren</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

