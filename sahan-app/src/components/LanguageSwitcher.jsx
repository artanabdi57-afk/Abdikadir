import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageSwitcher({ variant = 'default', className = '' }) {
  const { lang, setLang, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'segmented') {
    return (
      <div className={`lang-segmented ${className}`} style={{
        display: 'inline-flex',
        background: '#f1f5f9',
        padding: '3px',
        borderRadius: '999px',
        border: '1px solid rgba(0,0,0,0.06)',
        gap: '2px'
      }}>
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            style={{
              border: 0,
              background: lang === item.code ? '#ffffff' : 'transparent',
              color: lang === item.code ? '#0f172a' : '#64748b',
              fontWeight: lang === item.code ? '700' : '500',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: lang === item.code ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span>{item.flag}</span>
            <span>{item.nativeLabel}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`lang-switcher-wrap ${className}`} ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="lang-switcher-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Switch Language"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0,0,0,0.1)',
          padding: '6px 10px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#1e293b',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
      >
        <span style={{ fontSize: '14px' }}>{currentLang.flag}</span>
        <span style={{ fontSize: '12px' }}>{currentLang.nativeLabel}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div
          className="lang-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 1000,
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '14px',
            padding: '6px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            minWidth: '150px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'fadeInMenu 0.15s ease-out',
          }}
        >
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLang(item.code);
                setOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 10px',
                border: 0,
                borderRadius: '10px',
                background: lang === item.code ? '#f8fafc' : 'transparent',
                color: lang === item.code ? '#ff6b00' : '#334155',
                fontWeight: lang === item.code ? '700' : '500',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.12s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px' }}>{item.flag}</span>
                <span>{item.nativeLabel}</span>
              </div>
              {lang === item.code && (
                <span style={{ color: '#ff6b00', fontSize: '12px' }}>âœ“</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

