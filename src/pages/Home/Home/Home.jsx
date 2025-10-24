import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Bem-vindo ao RupturaProject</h1>
          <p className="hero-subtitle">
            Uma aplicação React moderna construída com Vite
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Começar</button>
            <button className="btn btn-secondary">Saiba Mais</button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Recursos</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Rápido</h3>
              <p>Construído com Vite para desenvolvimento ultra-rápido</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Moderno</h3>
              <p>Usando as mais recentes tecnologias React</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsivo</h3>
              <p>Design adaptável para todos os dispositivos</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
