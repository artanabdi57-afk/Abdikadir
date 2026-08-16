import React, { useRef, useState } from "react";
import CertificateTemplate from "./CertificateTemplate.jsx";

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" {...props} />
    </label>
  );
}

function generateCertificateNumber(prefix = "CERT") {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${rand}`;
}

export default function CertificateBuilder() {
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [form, setForm] = useState({
    institutionName: "Sahan",
    logoUrl: "",
    accentColor: "#1E3A8A",
    recipientName: "",
    qualificationType: "CERTIFICATE",
    programName: "",
    classification: "",
    ceremonyLocation: "",
    dateAwarded: new Date().toISOString().slice(0, 10),
    signatory1Name: "",
    signatory1Title: "Instructor",
    signatory2Name: "",
    signatory2Title: "Director",
    certificateNumber: generateCertificateNumber(),
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("logoUrl", reader.result);
    reader.readAsDataURL(file);
  }

  async function downloadPDF() {
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `${(form.recipientName || "certificate").replace(/\s+/g, "-")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 3, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
        })
        .from(printRef.current)
        .save();
    } catch (error) {
      console.error("Certificate PDF generation failed", error);
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <h1 className="text-2xl font-black text-slate-950">Certificate Builder</h1>
      <p className="mt-1 text-sm text-slate-500">Create a reusable certificate template for learners who complete your Sahan course.</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div>
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Institution logo</span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs" />
            {form.logoUrl && <button type="button" onClick={() => set("logoUrl", "")} className="mt-1 text-xs font-bold text-red-600">Remove logo</button>}
          </div>
          <Field label="Institution name" value={form.institutionName} onChange={(e) => set("institutionName", e.target.value)} />
          <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Accent color</span><input type="color" value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="h-11 w-full rounded-lg border border-slate-200" /></label>
          <Field label="Recipient full name" value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} placeholder="e.g. Abdikadir Mohamed Artan" />
          <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Qualification type</span><select className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" value={form.qualificationType} onChange={(e) => set("qualificationType", e.target.value)}><option>CERTIFICATE</option><option>DIPLOMA</option><option>DEGREE</option></select></label>
          <Field label="Programme / course name" value={form.programName} onChange={(e) => set("programName", e.target.value)} placeholder="e.g. Information Technology" />
          <Field label="Classification" value={form.classification} onChange={(e) => set("classification", e.target.value)} placeholder="e.g. Distinction" />
          <Field label="Ceremony location" value={form.ceremonyLocation} onChange={(e) => set("ceremonyLocation", e.target.value)} placeholder="e.g. Nairobi" />
          <Field label="Date awarded" type="date" value={form.dateAwarded} onChange={(e) => set("dateAwarded", e.target.value)} />
          <div className="grid grid-cols-2 gap-2"><Field label="Signatory 1" value={form.signatory1Name} onChange={(e) => set("signatory1Name", e.target.value)} /><Field label="Title" value={form.signatory1Title} onChange={(e) => set("signatory1Title", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2"><Field label="Signatory 2" value={form.signatory2Name} onChange={(e) => set("signatory2Name", e.target.value)} /><Field label="Title" value={form.signatory2Title} onChange={(e) => set("signatory2Title", e.target.value)} /></div>
          <Field label="Certificate number" value={form.certificateNumber} onChange={(e) => set("certificateNumber", e.target.value)} />
          <button onClick={downloadPDF} disabled={downloading} className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white disabled:opacity-60">{downloading ? "Generating…" : "Download as PDF"}</button>
        </div>

        <div className="flex items-start justify-center rounded-2xl bg-slate-100 p-4 sm:p-8"><div ref={printRef}><CertificateTemplate institutionName={form.institutionName} logoUrl={form.logoUrl} accentColor={form.accentColor} recipientName={form.recipientName || "Recipient Full Name"} qualificationType={form.qualificationType} programName={form.programName || "Programme Name"} classification={form.classification} ceremonyLocation={form.ceremonyLocation} dateAwarded={form.dateAwarded} signatories={[{ name: form.signatory1Name, title: form.signatory1Title }, { name: form.signatory2Name, title: form.signatory2Title }]} certificateNumber={form.certificateNumber} /></div></div>
      </div>
    </div>
  );
}
