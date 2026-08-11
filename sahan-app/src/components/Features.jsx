import React from 'react';

function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '64px' }}>
          Built for Everyone
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px' }}>
          <div className="card" id="teachers">
            <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '16px' }}>
              For Teachers
            </h3>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
              List your expertise. Host live sessions. Get paid instantly.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: '32px' }}>
              <li style={{ padding: '12px 0', borderBottom: '1px solid #E5E5E7' }}>✓ Create courses in under 2 minutes</li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid #E5E5E7' }}>✓ Keep 90% of your earnings</li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid #E5E5E7' }}>✓ Set your own prices and schedule</li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid #E5E5E7' }}>✓ No setup fees or hidden costs</li>
            </ul>
            <a href="#teaching" className="btn btn-primary">Start Teaching</a>
          </div>
          
          <div className="card" id="students">
            <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '16px' }}>
              For Students
            </h3>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
              Browse by topic. Join interactive classes. Learn from real professionals.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: '32px' }}>
              <li style={{ padding: '12px 0', borderBottom: '1px solid #E5E5E7' }}>✓ Browse live classes by topic</li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid #E5E5E7' }}>✓ Pay only for what you need</li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid #E5E5E7' }}>✓ No subscriptions you don't use</li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid #E5E5E7' }}>✓ Learn from real professionals</li>
            </ul>
            <a href="#learning" className="btn btn-secondary">Start Learning</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
