import React, { useMemo, useState } from 'react';

// Learner-side certificate library.
// Certificate design, eligibility and issuance are controlled by the course creator
// in Teach Sahan. Learners can only view/download certificates that have been issued.
const issuedCertificates = [
  {
    id: 'cert-001',
    course: 'Excel & Power BI for Real Work',
    issuer: 'Sahan Academy',
    instructor: 'Mariam Hassan',
    awarded: 'August 12, 2026',
    certificateNo: 'SAH-2026-001284',
    status: 'Verified',
  },
];

export default function CertificateBuilder({ notify }) {
  const [selectedId, setSelectedId] = useState(issuedCertificates[0]?.id || null);
  const selected = useMemo(() => issuedCertificates.find((item) => item.id === selectedId), [selectedId]);

  const printCertificate = () => {
    if (!selected) return;
    notify?.(`Preparing your ${selected.course} certificate.`);
    window.print();
  };

  return (
    <div className="certificates-page">
      <div className="page-title">
        <div className="eyebrow">YOUR ACHIEVEMENTS</div>
        <h1>Certificates</h1>
        <p>Certificates issued to you by the creators of courses you have completed.</p>
      </div>

      {issuedCertificates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h2>Your certificates will appear here</h2>
          <p>Complete a certificate-eligible course. The course creator will issue your certificate when you meet their requirements.</p>
        </div>
      ) : (
        <div className="certificate-library">
          <div className="certificate-list">
            <div className="library-label">ISSUED TO YOU · {issuedCertificates.length}</div>
            {issuedCertificates.map((certificate) => (
              <button
                type="button"
                key={certificate.id}
                className={`certificate-list-item ${selectedId === certificate.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(certificate.id)}
              >
                <div className="certificate-thumb"><span>S</span></div>
                <div className="certificate-list-copy">
                  <strong>{certificate.course}</strong>
                  <span>{certificate.issuer} · {certificate.awarded}</span>
                </div>
                <span className="certificate-status">{certificate.status}</span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="certificate-detail">
              <div className="certificate-paper">
                <div className="certificate-paper-top">SAHAN</div>
                <div className="certificate-paper-kicker">CERTIFICATE OF COMPLETION</div>
                <h2>{selected.course}</h2>
                <p>This certificate is proudly presented to</p>
                <h3>Abdikadir</h3>
                <p>for successfully completing the course and meeting the completion requirements established by</p>
                <strong>{selected.instructor}</strong>
                <div className="certificate-paper-footer">
                  <span>{selected.awarded}</span>
                  <span>{selected.certificateNo}</span>
                  <span>Issued by {selected.issuer}</span>
                </div>
              </div>
              <div className="certificate-actions">
                <button className="primary" onClick={printCertificate}>View / print certificate</button>
                <span>Issued by the course creator · {selected.status}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
