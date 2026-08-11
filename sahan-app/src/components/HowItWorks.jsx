import React from 'react';

function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'List',
      description: 'Teachers create a course or live lesson in under 2 minutes. Set your price. Choose your schedule.'
    },
    {
      number: '2',
      title: 'Join',
      description: 'Students browse, book, and enter the live classroom instantly. No downloads. No delays.'
    },
    {
      number: '3',
      title: 'Pay',
      description: 'Transparent pricing. Pay per lesson or subscribe to a full course. Cancel anytime.'
    }
  ];

  return (
    <section className="section" id="how-it-works" style={{ backgroundColor: '#F5F5F7' }}>
      <div className="container">
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '64px' }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {steps.map((step) => (
            <div key={step.number} className="card" style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '700', 
                color: '#D4A373', 
                marginBottom: '16px' 
              }}>
                {step.number}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                {step.title}
              </h3>
              <p style={{ color: '#666', lineHeight: '1.8' }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
