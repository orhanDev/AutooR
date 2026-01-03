import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';

const Register = () => {
  return (
    <div className="register-page" style={{ paddingTop: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="register-card">
              <h1>Registrieren</h1>
              <p>Diese Seite wird bald verfügbar sein.</p>
              <Link to="/login">Zurück zur Anmeldung</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

