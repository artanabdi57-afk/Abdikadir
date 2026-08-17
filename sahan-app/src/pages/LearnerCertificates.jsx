import React, { useMemo, useState } from 'react';

const certificates = [
  {
    id: 'cert-001',
    course: 'Excel & Power BI for Real Work',
    issuer: 'Sahan Academy',
    instructor: 'Mariam Hassan',
    awarded: 'August 12, 2026',
    certificateNo: 'SAH-2026-001284',
    status: 'Verified',
    accent: '#111827',
  },
];

export default function LearnerCertificates({ notify }) {
  const [selectedId, setSelectedId] = useState(certificates[0]?.id || null);
  const selected = useMemo(() => certificates.find((item) => item.id === selectedId), [selectedId]);

  const download = () => {
    if (!selected) return;
    notify?.(`Certificate for ${selected.course} is being prepared.`);
    window.print();
  };

  return (
    <div className="certificates-page">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">YOUR ACHIEVEMENTS</div>
          <h1>Certificates</h1>
          <p>Certificates issued to you by the instructors and course creators you learned from.</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h2>Your certificates will appear here</h2>
          <p>Complete an eligible course and its creator will issue your certificate.</p>
        </div>
      ) : (
        <div className="certificate-library">
          <div className="certificate-list">
            <div className="library-label">ISSUED TO YOU · {certificates.length}</div>
            {certificates.map((certificate) => (
              <button
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
              <div className="certificate-paper" style={{ '--cert-accent': selected.accent }}>
                <div className="certificate-paper-top">SAHAN</div>
                <div className="certificate-paper-kicker">CERTIFICATE OF COMPLETION</div>
                <h2>{selected.course}</h2>
                <p>This certificate is proudly presented to</p>
                <h3>Abdikadir</h3>
                <p>for successfully completing the course and meeting the completion requirements set by</p>
                <strong>{selected.instructor}</strong>
                <div className="certificate-paper-footer">
                  <span>{selected.awarded}</span>
                  <span>{selected.certificateNo}</span>
                  <span>Issued by {selected.issuer}</span>
                </div>
              </div>
              <div className="certificate-actions">
                <button className="primary" onClick={download}>View / print certificate</button>
                <span>Issued by the course creator · {selected.status}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
