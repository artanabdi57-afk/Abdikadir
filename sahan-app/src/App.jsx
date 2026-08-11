import React from 'react';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <nav className="container" style={{ padding: '24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em' }}>
          Sahan<span style={{ color: '#D4A373' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="#teachers" className="btn btn-secondary" style={{ padding: '10px 20px' }}>For Teachers</a>
          <a href="#students" className="btn btn-primary" style={{ padding: '10px 20px' }}>For Students</a>
        </div>
      </nav>
      
      <Hero />
      <HowItWorks />
      <Features />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
