import React from "react";

const ORDINALS = ["Zeroth","First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth","Ninth","Tenth","Eleventh","Twelfth","Thirteenth","Fourteenth","Fifteenth","Sixteenth","Seventeenth","Eighteenth","Nineteenth","Twentieth","Twenty-First","Twenty-Second","Twenty-Third","Twenty-Fourth","Twenty-Fifth","Twenty-Sixth","Twenty-Seventh","Twenty-Eighth","Twenty-Ninth","Thirtieth","Thirty-First"];

export function formatCeremonialDate(dateString) {
  if (!dateString) return "";
  const d = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateString;
  return `${ORDINALS[d.getDate()] || `${d.getDate()}th`} Day of ${d.toLocaleDateString("en-US", { month: "long" })} in the Year ${d.getFullYear()}`;
}

function PlaceholderEmblem({ ringColor }) {
  return <svg viewBox="0 0 120 120" className="h-24 w-24" role="img" aria-label="Institution emblem"><circle cx="60" cy="60" r="56" fill="#fff" stroke={ringColor} strokeWidth="4" /><circle cx="60" cy="60" r="44" fill="none" stroke={ringColor} strokeWidth="1.5" strokeDasharray="2 4" /><path d="M60 30 L67 50 L88 50 L71 62 L78 82 L60 70 L42 82 L49 62 L32 50 L53 50 Z" fill={ringColor} opacity=".9" /><text x="60" y="106" textAnchor="middle" fontSize="9" fontWeight="700" fill={ringColor} letterSpacing="1">EST.</text></svg>;
}

export default function CertificateTemplate({
  institutionName = "Sahan",
  logoUrl = "",
  accentColor = "#1E3A8A",
  recipientName = "Recipient Full Name",
  qualificationType = "CERTIFICATE",
  programName = "Programme Name",
  classification = "",
  ceremonyLocation = "",
  dateAwarded,
  signatories = [{ name: "", title: "Instructor" }, { name: "", title: "Director" }],
  certificateNumber = "",
  id = "certificate-print-area",
}) {
  return <div id={id} className="relative mx-auto aspect-[1.414/1] w-full max-w-3xl bg-white p-10 text-center shadow-xl" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
    <div className="pointer-events-none absolute inset-4 border-[3px]" style={{ borderColor: accentColor }} />
    <div className="pointer-events-none absolute inset-[22px] border" style={{ borderColor: accentColor, opacity: .5 }} />
    <div className="relative flex h-full flex-col items-center justify-between px-6 py-4">
      <div className="w-full"><h1 className="text-2xl font-bold uppercase tracking-[0.15em] sm:text-3xl" style={{ color: accentColor }}>{institutionName}</h1><div className="mx-auto mt-4 flex justify-center">{logoUrl ? <img src={logoUrl} alt={`${institutionName} logo`} className="h-24 w-24 object-contain" /> : <PlaceholderEmblem ringColor={accentColor} />}</div></div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4"><p className="text-base text-slate-700">This is to certify that</p><p className="px-4 text-3xl sm:text-4xl" style={{ fontFamily: "'Great Vibes', 'Brush Script MT', cursive" }}>{recipientName}</p><p className="max-w-md text-sm leading-6 text-slate-700">having satisfied the requirements for the award of the</p><p className="mt-1 text-xl font-bold sm:text-2xl" style={{ color: accentColor }}>{qualificationType}</p><p className="text-lg font-semibold text-slate-900">{programName}</p>{classification && <p className="text-base italic text-slate-700">{classification}</p>}<p className="mt-2 max-w-sm text-sm leading-6 text-slate-700">was admitted to the {qualificationType.toLowerCase()}{ceremonyLocation ? ` at a ceremony held at ${ceremonyLocation}` : ""} on the</p><p className="text-sm font-semibold text-slate-900">{formatCeremonialDate(dateAwarded)}</p></div>
      <div className="grid w-full grid-cols-2 gap-10 px-6">{signatories.slice(0, 2).map((s, i) => <div key={i} className="text-center"><p className="mb-1 h-8 text-2xl italic text-slate-800" style={{ fontFamily: "'Great Vibes', cursive" }}>{s.name}</p><div className="mx-auto w-full border-t border-slate-400" /><p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">{s.title}</p></div>)}</div>
      {certificateNumber && <p className="absolute bottom-2 right-2 text-[10px] font-medium text-slate-400">{certificateNumber}</p>}
    </div>
  </div>;
}
