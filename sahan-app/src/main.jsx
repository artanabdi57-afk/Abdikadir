import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import SahanExperience from './sahan/SahanExperience.jsx'
import LegacyApp from './App.jsx'
import TeachApp from './teach/TeachApp.jsx'
import './styles/index.css'

function Root() {
  const [route, setRoute] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/teach') || path.startsWith('/instructor') || path.startsWith('/admin')) {
      return 'teach';
    }
    if (path.startsWith('/app')) {
      return 'app';
    }
    return 'experience';
  });

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (path.startsWith('/teach') || path.startsWith('/instructor') || path.startsWith('/admin')) {
        setRoute('teach');
      } else if (path.startsWith('/app')) {
        setRoute('app');
      } else {
        setRoute('experience');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to) => {
    setRoute(to);
    const targetPath = to === 'teach' ? '/teach' : to === 'app' ? '/app' : '/';
    window.history.pushState({}, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          gap: '6px',
          background: 'rgba(23, 23, 27, 0.92)',
          padding: '6px',
          borderRadius: '999px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <button
          onClick={() => navigate('experience')}
          style={{
            background: route === 'experience' ? '#ffffff' : 'transparent',
            color: route === 'experience' ? '#111111' : '#d1d5db',
            border: 0,
            borderRadius: '999px',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Landing & Discovery
        </button>
        <button
          onClick={() => navigate('app')}
          style={{
            background: route === 'app' ? '#ffffff' : 'transparent',
            color: route === 'app' ? '#111111' : '#d1d5db',
            border: 0,
            borderRadius: '999px',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Learner Dashboard
        </button>
        <button
          onClick={() => navigate('teach')}
          style={{
            background: route === 'teach' ? '#7c5cff' : 'transparent',
            color: '#ffffff',
            border: 0,
            borderRadius: '999px',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Teach & Admin Portal
        </button>
      </div>

      {route === 'teach' && <TeachApp onNavigateHome={() => navigate('experience')} />}
      {route === 'app' && <LegacyApp onNavigateTeach={() => navigate('teach')} />}
      {route === 'experience' && <SahanExperience onNavigateTeach={() => navigate('teach')} onNavigateApp={() => navigate('app')} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
