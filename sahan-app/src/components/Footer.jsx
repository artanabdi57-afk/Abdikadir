import React from 'react';

function Footer() {
  return (
    <footer className="section" style={{ padding: '48px 0', borderTop: '1px solid #E5E5E7' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
              Sahan<span style={{ color: '#D4A373' }}>.</span>
            </h4>
            <p style={{ color: '#666', lineHeight: '1.8' }}>
              Learn. Teach. Grow.
            </p>
          </div>
          
          <div>
            <h5 style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '16px', color: '#666' }}>
              Platform
            </h5>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}><a href="#how-it-works" style={{ color: '#1C1C1E', textDecoration: 'none' }}>How It Works</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#teachers" style={{ color: '#1C1C1E', textDecoration: 'none' }}>For Teachers</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#students" style={{ color: '#1C1C1E', textDecoration: 'none' }}>For Students</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#faq" style={{ color: '#1C1C1E', textDecoration: 'none' }}>FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h5 style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '16px', color: '#666' }}>
              Company
            </h5>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#1C1C1E', textDecoration: 'none' }}>About</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#1C1C1E', textDecoration: 'none' }}>Blog</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#1C1C1E', textDecoration: 'none' }}>Careers</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#1C1C1E', textDecoration: 'none' }}>Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h5 style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '16px', color: '#666' }}>
              Legal
            </h5>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#1C1C1E', textDecoration: 'none' }}>Privacy</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#1C1C1E', textDecoration: 'none' }}>Terms</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#1C1C1E', textDecoration: 'none' }}>Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '32px', borderTop: '1px solid #E5E5E7' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            © 2024 Sahan. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Twitter</a>
            <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>LinkedIn</a>
            <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
