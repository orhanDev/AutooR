import React from 'react';
import '../styles/style.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Willkommen bei Auto<span style={{color: '#ee7600'}}>oR</span></h1>
          <p className="hero-subtitle">Premium Fahrzeugvermietung</p>
        </div>
      </div>
      
      <div className="container mt-5">
        <h2>Beliebte Fahrzeuge</h2>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Porsche 911</h5>
                <p className="card-text">Premium Sportwagen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

