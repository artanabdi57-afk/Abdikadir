import React, { useState } from 'react';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Is Sahan free to join?',
      answer: 'Yes. Teachers and students join for free.'
    },
    {
      question: 'How much does Sahan charge?',
      answer: 'Teachers keep 90% of earnings. Students pay no platform fees.'
    },
    {
      question: 'What types of classes can I teach?',
      answer: 'Anything. Coding, design, music, business, fitness, languages—if you know it, you can teach it.'
    },
    {
      question: 'Can I host live classes?',
      answer: 'Yes. Every class on Sahan is live and interactive. Recordings are optional.'
    },
    {
      question: 'How do students pay?',
      answer: 'Per lesson or full course. Secure payments. Instant access.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section" id="faq" style={{ backgroundColor: '#F5F5F7' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '64px' }}>
          Frequently Asked Questions
        </h2>
        <div>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="card" 
              style={{ 
                marginBottom: '16px', 
                padding: '24px',
                cursor: 'pointer'
              }}
              onClick={() => toggleFAQ(index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                  {faq.question}
                </h3>
                <span style={{ 
                  fontSize: '24px', 
                  color: '#D4A373',
                  transition: 'transform 0.2s ease',
                  transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)'
                }}>
                  +
                </span>
              </div>
              {openIndex === index && (
                <p style={{ marginTop: '16px', color: '#666', lineHeight: '1.8' }}>
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
