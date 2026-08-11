import React from 'react';

function Hero() {
  return (
    <section className="section" style={{ textAlign: 'center', padding: '120px 0' }}>
      <div className="container">
        <h1 className="section-title" style={{ fontSize: '64px', marginBottom: '16px' }}>
          Sahan<span style={{ color: '#D4A373' }}>.</span>
        </h1>
        <h2 style={{ fontSize: '28px', fontWeight: '500', marginBottom: '24px', color: '#1C1C1E' }}>
          The minimalist platform for live learning and teaching.
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto 48px', fontSize: '18px', lineHeight: '1.8' }}>
          Teachers sell courses, lessons, and training.<br />
          Students buy, join, and learn in real time.<br />
          Everything else is unnecessary.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#teaching" className="btn btn-primary">Start Teaching</a>
          <a href="#learning" className="btn btn-secondary">Start Learning</a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
