<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sahan — Learner Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --night:#0E1F1B;
    --night-2:#152B24;
    --night-3:#1D372E;
    --paper:#F3F6F0;
    --paper-2:#FFFFFF;
    --ink:#142019;
    --muted:#66766C;
    --line:#DEE4D8;
    --marigold:#F2A93B;
    --marigold-dark:#C97F1E;
    --marigold-ink:#5B3C0E;
    --sage:#5E8140;
    --sage-ink:#28381A;
    --cobalt:#33518F;
    --cobalt-ink:#182238;
    --danger:#B33F2C;
    --radius-lg:20px;
    --radius-md:14px;
    --radius-sm:9px;
    --sidebar-w:264px;
    --sidebar-w-collapsed:76px;
    --font-display:'Fraunces', Georgia, serif;
    --font-body:'Inter', system-ui, -apple-system, sans-serif;
    --font-mono:'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
    --shadow-card:0 1px 2px rgba(20,32,25,0.06), 0 8px 24px -12px rgba(20,32,25,0.18);
    --shadow-modal:0 24px 64px -20px rgba(14,31,27,0.45);
  }

  *{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; }
  body{ font-family:var(--font-body); color:var(--ink); background:var(--paper); -webkit-font-smoothing:antialiased; }
  button{ font-family:inherit; cursor:pointer; }
  input, textarea{ font-family:inherit; }
  a{ color:inherit; }
  ::selection{ background:var(--marigold); color:var(--night); }
  svg{ display:block; }
  :focus-visible{ outline:2.5px solid var(--marigold-dark); outline-offset:2px; border-radius:4px; }
  @media (prefers-reduced-motion: reduce){ *{ animation-duration:0.001ms !important; transition-duration:0.001ms !important; } }

  .app{ display:grid; grid-template-columns:var(--sidebar-w) 1fr; min-height:100vh; transition:grid-template-columns .18s ease; }
  .app.collapsed{ grid-template-columns:var(--sidebar-w-collapsed) 1fr; }

  .sidebar{ background:var(--night); color:#EDF2EA; padding:20px 16px 18px; display:flex; flex-direction:column; position:sticky; top:0; height:100vh; overflow:hidden; transition:padding .18s ease; }
  .app.collapsed .sidebar{ padding:20px 12px 18px; align-items:center; }

  .brand-row{ display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:2px; }
  .brand{ display:flex; align-items:center; gap:10px; background:none; border:none; color:inherit; padding:0; text-align:left; min-width:0; }
  .brand-mark{ width:32px; height:32px; border-radius:9px; flex-shrink:0; background:linear-gradient(155deg, var(--marigold), var(--marigold-dark)); display:flex; align-items:center; justify-content:center; }
  .brand-mark svg{ width:17px; height:17px; }
  .brand-word{ font-family:var(--font-display); font-size:20px; font-weight:600; white-space:nowrap; }
  .app.collapsed .brand-word{ display:none; }

  .collapse-btn{ width:26px; height:26px; border-radius:7px; flex-shrink:0; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#C3D0C6; display:flex; align-items:center; justify-content:center; }
  .collapse-btn:hover{ background:rgba(255,255,255,0.12); color:#fff; }
  .collapse-btn svg{ width:13px; height:13px; transition:transform .18s ease; }
  .app.collapsed .collapse-btn svg{ transform:rotate(180deg); }
  .app.collapsed .brand-row{ flex-direction:column; gap:10px; }

  .sidebar-label{ font-family:var(--font-mono); font-size:10.5px; letter-spacing:0.16em; color:#7C9187; margin:22px 6px 8px; white-space:nowrap; }
  .app.collapsed .sidebar-label{ display:none; }

  .trail{ position:relative; display:flex; flex-direction:column; gap:1px; }
  .trail-nav{ position:relative; display:flex; align-items:center; gap:12px; background:none; border:none; color:#C3D0C6; font-size:14px; font-weight:500; padding:9px 8px; text-align:left; border-radius:var(--radius-sm); white-space:nowrap; width:100%; }
  .trail-nav .icon{ width:19px; height:19px; flex-shrink:0; color:inherit; }
  .trail-nav .label{ overflow:hidden; text-overflow:ellipsis; }
  .app.collapsed .trail-nav{ justify-content:center; padding:10px; }
  .app.collapsed .trail-nav .label{ display:none; }
  .trail-nav:hover{ color:#F3F6F0; background:rgba(255,255,255,0.05); }
  .trail-nav.active{ color:#FFFFFF; background:rgba(242,169,59,0.12); }
  .trail-nav.active .icon{ color:var(--marigold); }

  .badge{ margin-left:auto; background:var(--marigold); color:var(--marigold-ink); font-family:var(--font-mono); font-size:10px; font-weight:700; border-radius:999px; padding:1px 6px; flex-shrink:0; }
  .app.collapsed .badge{ position:absolute; top:4px; right:10px; margin-left:0; }

  .sidebar-spacer{ flex:1; }

  .teach-cta{ background:var(--night-3); border:1px solid #33473C; color:#EDF2EA; font-size:12.5px; font-weight:600; padding:10px 12px; border-radius:var(--radius-sm); margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; white-space:nowrap; }
  .teach-cta:hover{ border-color:var(--marigold); color:var(--marigold); }
  .app.collapsed .teach-cta{ display:none; }

  .sidebar-divider{ height:1px; background:#26382E; margin:6px 0 8px; width:100%; }

  .identity-row{ display:flex; align-items:center; gap:8px; margin-top:8px; }
  .app.collapsed .identity-row{ flex-direction:column; gap:10px; }
  .avatar-btn{ background:none; border:none; padding:0; border-radius:50%; flex-shrink:0; }
  .avatar{ width:34px; height:34px; border-radius:50%; background:var(--night-3); border:1.5px solid #3A5044; color:#F3F6F0; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:12px; font-weight:600; }
  .avatar-btn:hover .avatar{ border-color:var(--marigold); }
  .signout-btn{ width:32px; height:32px; border-radius:8px; flex-shrink:0; background:none; border:1px solid transparent; color:#8DA091; display:flex; align-items:center; justify-content:center; margin-left:auto; }
  .signout-btn svg{ width:16px; height:16px; }
  .signout-btn:hover{ color:#EDF2EA; background:rgba(255,255,255,0.06); }
  .app.collapsed .signout-btn{ margin-left:0; }

  .main{ min-width:0; }
  .topbar{ display:flex; align-items:center; justify-content:space-between; padding:16px 40px; border-bottom:1px solid var(--line); background:var(--paper-2); position:sticky; top:0; z-index:5; }
  .search{ position:relative; width:340px; max-width:46vw; }
  .search svg{ position:absolute; left:12px; top:50%; transform:translateY(-50%); width:15px; height:15px; color:var(--muted); }
  .search input{ width:100%; border:1px solid var(--line); background:var(--paper); border-radius:999px; padding:9px 14px 9px 34px; font-size:13.5px; color:var(--ink); }
  .search input:focus{ outline:none; border-color:var(--marigold-dark); background:var(--paper-2); }
  .account-btn{ background:none; border:none; padding:0; border-radius:50%; }
  .account-btn .avatar{ width:36px; height:36px; background:var(--sage-ink); border-color:var(--sage-ink); color:#F3F6F0; }
  .account-btn:hover .avatar{ box-shadow:0 0 0 3px rgba(94,129,64,0.18); }

  .content{ padding:32px 40px 64px; max-width:1180px; }
  .kicker{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.14em; color:var(--marigold-dark); font-weight:600; margin-bottom:10px; }

  .hero{ display:grid; grid-template-columns:1fr 300px; gap:28px; background:var(--night); color:#EDF2EA; border-radius:var(--radius-lg); padding:36px 38px; margin-bottom:42px; position:relative; overflow:hidden; }
  .hero::after{ content:""; position:absolute; inset:0; background:radial-gradient(420px 220px at 88% -10%, rgba(242,169,59,0.16), transparent 70%), radial-gradient(320px 200px at 100% 110%, rgba(51,81,143,0.24), transparent 70%); pointer-events:none; }
  .hero h1{ font-family:var(--font-display); font-weight:600; font-size:32px; line-height:1.15; margin:0 0 12px; max-width:480px; position:relative; }
  .hero p{ font-size:14.5px; color:#B9C8BE; max-width:440px; margin:0 0 22px; position:relative; }
  .hero-actions{ display:flex; gap:10px; position:relative; }
  .btn{ border:none; border-radius:999px; font-weight:600; font-size:13.5px; padding:11px 20px; display:inline-flex; align-items:center; gap:6px; }
  .btn-primary{ background:var(--marigold); color:var(--marigold-ink); }
  .btn-primary:hover{ background:#FFC169; }
  .btn-ghost{ background:rgba(255,255,255,0.08); color:#EDF2EA; border:1px solid rgba(255,255,255,0.16); }
  .btn-ghost:hover{ background:rgba(255,255,255,0.14); }
  .hero-card{ background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); border-radius:var(--radius-md); padding:20px; display:flex; flex-direction:column; align-items:flex-start; gap:10px; position:relative; }
  .hero-card .avatar{ width:44px; height:44px; font-size:15px; background:var(--marigold); color:var(--marigold-ink); border-color:transparent; }
  .hero-card b{ font-size:13.5px; font-weight:600; }
  .hero-card small{ font-size:12px; color:#B9C8BE; line-height:1.5; }

  .section-head{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:18px; }
  .section-head h2{ font-family:var(--font-display); font-size:21px; font-weight:600; margin:0 0 4px; }
  .section-head p{ font-size:13px; color:var(--muted); margin:0; }
  .page-title h1{ font-family:var(--font-display); font-size:29px; font-weight:600; margin:0 0 8px; }
  .page-title p{ font-size:14px; color:var(--muted); margin:0 0 28px; max-width:520px; }

  .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(268px,1fr)); gap:18px; margin-bottom:46px; }
  .course{ background:var(--paper-2); border:1px solid var(--line); border-radius:var(--radius-md); overflow:hidden; display:flex; flex-direction:column; box-shadow:var(--shadow-card); transition:transform .15s ease, box-shadow .15s ease; }
  .course:hover{ transform:translateY(-2px); box-shadow:0 1px 2px rgba(20,32,25,0.08), 0 16px 30px -14px rgba(20,32,25,0.28); }
  .course-main{ background:none; border:none; text-align:left; padding:0; color:inherit; display:block; }
  .cover{ height:104px; position:relative; display:flex; align-items:flex-end; justify-content:space-between; padding:12px 14px; background:linear-gradient(155deg, var(--cobalt), var(--night)); }
  .cover.c-sage{ background:linear-gradient(155deg, var(--sage), var(--sage-ink)); }
  .cover.c-marigold{ background:linear-gradient(155deg, #E8A93F, var(--marigold-dark)); }
  .cover.c-cobalt{ background:linear-gradient(155deg, var(--cobalt), #172035); }
  .cover-tag{ font-family:var(--font-mono); font-size:10px; letter-spacing:0.1em; color:rgba(255,255,255,0.88); background:rgba(0,0,0,0.18); padding:4px 8px; border-radius:999px; }
  .stamp{ font-family:var(--font-mono); font-size:9.5px; font-weight:700; letter-spacing:0.08em; color:#fff; border:1.5px dashed rgba(255,255,255,0.75); border-radius:999px; padding:4px 9px; transform:rotate(-6deg); background:rgba(0,0,0,0.14); }
  .course-body{ padding:15px 16px 17px; display:flex; flex-direction:column; gap:8px; flex:1; }
  .course-meta-top{ font-family:var(--font-mono); font-size:10.5px; color:var(--muted); }
  .course h3{ font-family:var(--font-display); font-size:17px; font-weight:600; margin:0; line-height:1.3; }
  .course p{ font-size:12.5px; color:var(--muted); margin:0; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .course-foot{ display:flex; align-items:center; justify-content:space-between; margin-top:4px; }
  .rating{ font-size:12px; color:var(--marigold-dark); font-weight:600; }
  .price{ font-family:var(--font-mono); font-size:12.5px; font-weight:600; }
  .trailbar-wrap{ padding:0 16px 15px; }
  .trailbar-label{ display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:10.5px; color:var(--muted); margin-bottom:6px; }
  .trailbar-label b{ color:var(--ink); font-weight:600; }
  .trailbar{ position:relative; height:6px; border-radius:999px; background:repeating-linear-gradient(90deg, var(--line) 0 4px, transparent 4px 8px); }
  .trailbar-fill{ position:absolute; left:0; top:0; height:100%; border-radius:999px; background:linear-gradient(90deg, var(--marigold-dark), var(--marigold)); }
  .trailbar-marker{ position:absolute; top:50%; width:13px; height:13px; border-radius:50%; background:var(--marigold); border:2.5px solid var(--paper-2); transform:translate(-50%,-50%); box-shadow:0 1px 4px rgba(20,32,25,0.35); }
  .enroll-row{ padding:0 16px 16px; }
  .btn-enroll{ width:100%; background:var(--night); color:#F3F6F0; border-radius:var(--radius-sm); padding:10px; font-size:12.5px; font-weight:600; border:none; }
  .btn-enroll:hover{ background:var(--night-3); }
  .enrolled-note{ padding:0 16px 16px; font-size:11.5px; font-family:var(--font-mono); color:var(--sage-ink); display:flex; align-items:center; gap:6px; }

  .empty{ border:1px dashed var(--line); border-radius:var(--radius-md); padding:40px 30px; text-align:center; background:var(--paper-2); margin-bottom:40px; }
  .empty h3{ font-family:var(--font-display); font-size:17px; font-weight:600; margin:0 0 14px; color:var(--ink); }

  .settings-card{ background:var(--paper-2); border:1px solid var(--line); border-radius:var(--radius-md); padding:26px; max-width:420px; display:flex; flex-direction:column; gap:16px; }
  .field label{ display:block; font-size:12px; font-weight:600; color:var(--muted); margin-bottom:6px; font-family:var(--font-mono); letter-spacing:0.03em; }
  .field input{ width:100%; border:1px solid var(--line); border-radius:var(--radius-sm); padding:10px 12px; font-size:14px; background:var(--paper); }
  .field input:focus{ outline:none; border-color:var(--marigold-dark); }
  .field input:disabled{ color:var(--muted); background:#EEF1EA; }
  .toast{ font-size:12.5px; color:var(--sage-ink); background:#EAF1E1; border:1px solid #CFE0BE; padding:9px 12px; border-radius:var(--radius-sm); display:none; }
  .toast.show{ display:block; }

  .profile-header{ display:flex; align-items:center; gap:20px; background:var(--night); color:#EDF2EA; border-radius:var(--radius-lg); padding:30px 34px; margin-bottom:36px; position:relative; overflow:hidden; }
  .profile-header::after{ content:""; position:absolute; inset:0; background:radial-gradient(360px 200px at 92% 0%, rgba(242,169,59,0.16), transparent 70%); pointer-events:none; }
  .profile-avatar-lg{ width:72px; height:72px; border-radius:50%; background:var(--marigold); color:var(--marigold-ink); font-family:var(--font-mono); font-weight:700; font-size:22px; display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; border:3px solid rgba(255,255,255,0.14); }
  .profile-header h1{ font-family:var(--font-display); font-size:25px; font-weight:600; margin:0 0 4px; position:relative; }
  .profile-header p{ font-size:13px; color:#B9C8BE; margin:0; position:relative; font-family:var(--font-mono); }
  .cert-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; margin-bottom:44px; }
  .cert-card{ background:var(--paper-2); border:1px solid var(--line); border-radius:var(--radius-md); padding:18px 18px 16px; position:relative; overflow:hidden; }
  .cert-card::before{ content:""; position:absolute; top:-30px; right:-30px; width:90px; height:90px; border-radius:50%; background:rgba(242,169,59,0.14); }
  .cert-stamp{ width:38px; height:38px; border-radius:50%; border:2px dashed var(--marigold-dark); color:var(--marigold-dark); display:flex; align-items:center; justify-content:center; margin-bottom:12px; transform:rotate(-4deg); position:relative; }
  .cert-stamp svg{ width:18px; height:18px; }
  .cert-card b{ display:block; font-family:var(--font-display); font-size:14.5px; font-weight:600; margin-bottom:4px; position:relative; }
  .cert-card small{ display:block; font-family:var(--font-mono); font-size:10.5px; color:var(--muted); position:relative; }

  .two-pane{ display:grid; grid-template-columns:240px 1fr; gap:0; border:1px solid var(--line); border-radius:var(--radius-md); overflow:hidden; background:var(--paper-2); height:520px; margin-bottom:40px; }
  .side-list{ background:var(--paper); border-right:1px solid var(--line); padding:14px 10px; overflow-y:auto; }
  .side-label{ font-family:var(--font-mono); font-size:10px; letter-spacing:0.12em; color:var(--muted); padding:6px 8px 8px; }
  .channel{ display:flex; align-items:center; gap:9px; width:100%; background:none; border:none; text-align:left; padding:8px 8px; border-radius:var(--radius-sm); font-size:13px; color:var(--ink); }
  .channel:hover{ background:var(--paper-2); }
  .channel.active{ background:var(--night); color:#EDF2EA; }
  .channel .hash{ font-family:var(--font-mono); color:var(--muted); flex-shrink:0; }
  .channel.active .hash{ color:#9AAB9E; }
  .channel .cbadge{ margin-left:auto; background:var(--marigold); color:var(--marigold-ink); font-family:var(--font-mono); font-size:9.5px; font-weight:700; border-radius:999px; padding:1px 6px; }

  .conv{ display:flex; align-items:center; gap:10px; width:100%; background:none; border:none; text-align:left; padding:9px 8px; border-radius:var(--radius-sm); }
  .conv:hover{ background:var(--paper-2); }
  .conv.active{ background:var(--night); }
  .conv .avatar{ width:30px; height:30px; font-size:11px; flex-shrink:0; }
  .conv-text{ min-width:0; }
  .conv-text b{ display:block; font-size:12.5px; font-weight:600; color:var(--ink); }
  .conv.active .conv-text b{ color:#EDF2EA; }
  .conv-text small{ display:block; font-size:11px; color:var(--muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .conv.active .conv-text small{ color:#9AAB9E; }
  .conv .cbadge{ margin-left:auto; }

  .chat{ display:flex; flex-direction:column; min-width:0; }
  .chat-head{ padding:14px 20px; border-bottom:1px solid var(--line); font-family:var(--font-display); font-weight:600; font-size:15px; }
  .chat-messages{ flex:1; overflow-y:auto; padding:18px 20px; display:flex; flex-direction:column; gap:16px; }
  .msg{ display:flex; gap:11px; max-width:80%; }
  .msg .avatar{ width:30px; height:30px; font-size:11px; flex-shrink:0; }
  .msg-body b{ font-size:12.5px; font-weight:600; }
  .msg-body time{ font-family:var(--font-mono); font-size:10px; color:var(--muted); margin-left:8px; }
  .msg-bubble{ background:var(--paper); border:1px solid var(--line); border-radius:12px 12px 12px 3px; padding:9px 13px; font-size:13.5px; margin-top:4px; line-height:1.5; }
  .chat-input{ display:flex; gap:10px; padding:14px 18px; border-top:1px solid var(--line); }
  .chat-input input{ flex:1; border:1px solid var(--line); border-radius:999px; padding:10px 16px; font-size:13.5px; background:var(--paper); }
  .chat-input input:focus{ outline:none; border-color:var(--marigold-dark); }
  .chat-input button{ background:var(--night); color:#F3F6F0; border:none; border-radius:999px; padding:0 18px; font-size:13px; font-weight:600; }
  .chat-input button:hover{ background:var(--night-3); }

  .modal-backdrop{ position:fixed; inset:0; background:rgba(14,31,27,0.55); display:none; align-items:flex-start; justify-content:center; padding:5vh 20px; overflow-y:auto; z-index:50; }
  .modal-backdrop.show{ display:flex; }
  .modal{ background:var(--paper-2); border-radius:var(--radius-lg); max-width:620px; width:100%; box-shadow:var(--shadow-modal); overflow:hidden; }
  .modal-cover{ padding:26px 30px 22px; color:#EDF2EA; position:relative; background:linear-gradient(155deg, var(--cobalt), var(--night)); }
  .modal-close{ position:absolute; top:16px; right:16px; width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.12); border:none; color:#fff; font-size:16px; line-height:1; }
  .modal-close:hover{ background:rgba(255,255,255,0.22); }
  .modal-cover h2{ font-family:var(--font-display); font-size:23px; font-weight:600; margin:0 0 8px; max-width:440px; }
  .modal-cover p{ font-size:13px; color:#C7D3CB; margin:0 0 16px; max-width:440px; }
  .modal-stats{ display:flex; gap:16px; flex-wrap:wrap; font-family:var(--font-mono); font-size:10.5px; color:#D6E0D9; }
  .modal-body{ padding:24px 30px 30px; }
  .modal-trail-label{ display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:11.5px; color:var(--muted); margin-bottom:8px; }
  .modal-trail-label b{ color:var(--ink); font-size:13px; }
  .modal-trailbar{ position:relative; height:8px; border-radius:999px; background:repeating-linear-gradient(90deg, var(--line) 0 4px, transparent 4px 8px); margin-bottom:26px; }
  .modal-trailbar-fill{ position:absolute; left:0; top:0; height:100%; border-radius:999px; background:linear-gradient(90deg, var(--marigold-dark), var(--marigold)); }
  .stops{ position:relative; padding-left:6px; }
  .stop-section{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.06em; color:var(--muted); margin:18px 0 10px; text-transform:uppercase; }
  .stop-section:first-child{ margin-top:0; }
  .stop{ position:relative; display:flex; gap:12px; align-items:flex-start; padding:9px 0; }
  .stop:not(:last-child)::before{ content:""; position:absolute; left:10.5px; top:30px; bottom:-9px; width:1.5px; background:var(--line); }
  .stop-check{ appearance:none; -webkit-appearance:none; width:22px; height:22px; border-radius:50%; border:2px solid var(--line); background:var(--paper-2); flex-shrink:0; margin-top:1px; position:relative; }
  .stop-check:checked{ background:var(--sage); border-color:var(--sage); }
  .stop-check:checked::after{ content:"✓"; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:700; }
  .stop-text b{ display:block; font-size:13.5px; font-weight:600; }
  .stop-text small{ display:block; font-size:11.5px; color:var(--muted); font-family:var(--font-mono); margin-top:2px; }
  .modal-price-panel{ text-align:center; padding:28px 10px; }
  .modal-price-panel strong{ font-family:var(--font-mono); font-size:20px; display:block; margin-bottom:8px; }
  .modal-price-panel p{ font-size:13px; color:var(--muted); max-width:360px; margin:0 auto 18px; }

  @media (max-width:900px){
    .app, .app.collapsed{ grid-template-columns:1fr; }
    .sidebar{ position:static; height:auto; flex-direction:row; align-items:center; padding:14px 18px; gap:14px; overflow-x:auto; }
    .sidebar-label, .sidebar-divider, .sidebar-spacer{ display:none; }
    .trail{ flex-direction:row; gap:2px; }
    .trail-nav .label{ display:inline; white-space:nowrap; }
    .trail-nav{ padding:8px 10px; }
    .teach-cta, .identity-row{ display:none; }
    .content{ padding:26px 18px 50px; }
    .topbar{ padding:14px 18px; }
    .hero{ grid-template-columns:1fr; padding:26px; }
    .hero-card{ display:none; }
    .two-pane{ grid-template-columns:1fr; height:auto; }
    .side-list{ border-right:none; border-bottom:1px solid var(--line); display:flex; gap:6px; overflow-x:auto; }
    .chat-messages{ max-height:340px; }
  }
</style>
</head>
<body>

<div class="app" id="app">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="brand-row">
      <button class="brand" onclick="go('home')" title="Sahan">
        <span class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7l9 5 9-5-9-5z" stroke="#3B2409" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 12l9 5 9-5" stroke="#3B2409" stroke-width="1.6" stroke-linejoin="round"/></svg>
        </span>
        <span class="brand-word">Sahan</span>
      </button>
      <button class="collapse-btn" onclick="toggleSidebar()" title="Collapse sidebar" aria-label="Toggle sidebar">
        <svg viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <div class="sidebar-label">LEARNER</div>
    <nav class="trail">
      <button class="trail-nav active" data-page="home" title="Home">
        <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-7 9 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="label">Home</span>
      </button>
      <button class="trail-nav" data-page="discover" title="Explore">
        <svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M15 9l-2 6-6 2 2-6 6-2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
        <span class="label">Explore</span>
      </button>
      <button class="trail-nav" data-page="learning" title="My Land">
        <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 20.5A2.5 2.5 0 006.5 18H20" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
        <span class="label">My Land</span>
      </button>
      <button class="trail-nav" data-page="settings" title="Settings">
        <svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="label">Settings</span>
      </button>
      <button class="trail-nav" data-page="community" title="Community">
        <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-3-3.87" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 21v-2a4 4 0 013-3.87" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M17 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <span class="label">Community</span>
      </button>
      <button class="trail-nav" data-page="messaging" title="Messaging">
        <svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 20l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="label">Messaging</span>
        <span class="badge">3</span>
      </button>
    </nav>

    <div class="sidebar-spacer"></div>
    <button class="teach-cta">Teach on Sahan <span>→</span></button>
    <div class="sidebar-divider"></div>

    <div class="identity-row">
      <button class="avatar-btn" onclick="go('profile')" title="View profile">
        <span class="avatar">AM</span>
      </button>
      <button class="signout-btn" title="Sign out" aria-label="Sign out">
        <svg viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main">
    <header class="topbar">
      <div class="search">
        <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <input id="searchInput" placeholder="Search courses…" oninput="filterCourses()">
      </div>
      <button class="account-btn" onclick="go('profile')" title="View profile">
        <span class="avatar">AM</span>
      </button>
    </header>

    <!-- HOME -->
    <section class="content page" id="page-home">
      <div class="hero">
        <div>
          <div class="kicker" style="color:#F2A93B;">YOUR LEARNING ROUTE</div>
          <h1>Welcome back, Abdikadir.</h1>
          <p>Real courses, payments, enrollments and lesson progress — all synced live from your Sahan account.</p>
          <div class="hero-actions">
            <button class="btn btn-primary" onclick="go('discover')">Explore courses →</button>
            <button class="btn btn-ghost" onclick="go('learning')">My Land</button>
          </div>
        </div>
        <div class="hero-card">
          <span class="avatar">AM</span>
          <b>Verified learner account</b>
          <small>Marketplace data is live from Supabase.</small>
        </div>
      </div>
      <div class="section-head"><div><h2>Continue learning</h2><p>Courses attached to your account.</p></div></div>
      <div class="grid" id="continueGrid"></div>
    </section>

    <!-- EXPLORE (discover) -->
    <section class="content page" id="page-discover" style="display:none;">
      <div class="page-title">
        <div class="kicker">EXPLORE</div>
        <h1>Find something worth learning.</h1>
        <p>Published, admin-approved courses from instructors across the Sahan marketplace.</p>
      </div>
      <div class="grid" id="discoverGrid"></div>
    </section>

    <!-- MY LAND (learning) -->
    <section class="content page" id="page-learning" style="display:none;">
      <div class="page-title">
        <div class="kicker">MY LAND</div>
        <h1>Your courses.</h1>
        <p>Progress is tracked lesson by lesson — not just watch time.</p>
      </div>
      <div class="grid" id="learningGrid"></div>
    </section>

    <!-- SETTINGS -->
    <section class="content page" id="page-settings" style="display:none;">
      <div class="page-title">
        <div class="kicker">SETTINGS</div>
        <h1>Your account.</h1>
        <p>Update your learner profile. Authentication is managed by Sahan Auth.</p>
      </div>
      <div class="settings-card">
        <div class="field"><label>Full name</label><input id="settingsName" value="Abdikadir Mohamed Artan"></div>
        <div class="field"><label>Email</label><input value="abdikadir@example.com" disabled></div>
        <button class="btn btn-enroll" style="width:auto; padding:10px 18px;" onclick="saveSettings()">Save profile</button>
        <div class="toast" id="settingsToast">Profile updated.</div>
      </div>
    </section>

    <!-- COMMUNITY -->
    <section class="content page" id="page-community" style="display:none;">
      <div class="page-title">
        <div class="kicker">COMMUNITY</div>
        <h1>Public course channels.</h1>
        <p>Join the conversation around a course, ask questions, and see what other learners are working through.</p>
      </div>
      <div class="two-pane">
        <div class="side-list">
          <div class="side-label">CHANNELS</div>
          <button class="channel active" data-ch="general"><span class="hash">#</span>General</button>
          <button class="channel" data-ch="bookkeeping"><span class="hash">#</span>Bookkeeping<span class="cbadge">3</span></button>
          <button class="channel" data-ch="english"><span class="hash">#</span>Business English</button>
          <button class="channel" data-ch="jobs"><span class="hash">#</span>Job leads<span class="cbadge">2</span></button>
        </div>
        <div class="chat">
          <div class="chat-head" id="communityHead"># General</div>
          <div class="chat-messages" id="communityMessages"></div>
          <div class="chat-input">
            <input id="communityInput" placeholder="Message #general…" onkeydown="if(event.key==='Enter')sendCommunity()">
            <button onclick="sendCommunity()">Send</button>
          </div>
        </div>
      </div>
    </section>

    <!-- MESSAGING -->
    <section class="content page" id="page-messaging" style="display:none;">
      <div class="page-title">
        <div class="kicker">MESSAGING</div>
        <h1>Direct messages.</h1>
        <p>Private conversations with instructors and other learners.</p>
      </div>
      <div class="two-pane">
        <div class="side-list">
          <div class="side-label">CONVERSATIONS</div>
          <button class="conv active" data-dm="hodan"><span class="avatar">HA</span><span class="conv-text"><b>Hodan A.</b><small>Can you send me your notes...</small></span><span class="cbadge">2</span></button>
          <button class="conv" data-dm="support"><span class="avatar">IN</span><span class="conv-text"><b>Course Support</b><small>Your certificate is ready 🎉</small></span></button>
          <button class="conv" data-dm="yusuf"><span class="avatar">YK</span><span class="conv-text"><b>Yusuf K.</b><small>Thanks, that helped a lot</small></span></button>
        </div>
        <div class="chat">
          <div class="chat-head" id="dmHead">Hodan A.</div>
          <div class="chat-messages" id="dmMessages"></div>
          <div class="chat-input">
            <input id="dmInput" placeholder="Message…" onkeydown="if(event.key==='Enter')sendDM()">
            <button onclick="sendDM()">Send</button>
          </div>
        </div>
      </div>
    </section>

    <!-- PROFILE -->
    <section class="content page" id="page-profile" style="display:none;">
      <div class="profile-header">
        <div class="profile-avatar-lg">AM</div>
        <div>
          <h1>Abdikadir Mohamed Artan</h1>
          <p>abdikadir@example.com · Learner since 2025</p>
        </div>
      </div>
      <div class="section-head"><div><h2>Certificates</h2><p>Issued when you complete a course's full trail.</p></div></div>
      <div class="cert-grid" id="certGrid">
        <div class="cert-card">
          <div class="cert-stamp"><svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <b>Digital Bookkeeping for Small Business</b>
          <small>ISSUED · JUL 2026</small>
        </div>
      </div>
      <div class="section-head"><div><h2>Account</h2><p>Same details as Settings — edit them there.</p></div></div>
      <div class="settings-card">
        <div class="field"><label>Full name</label><input value="Abdikadir Mohamed Artan" disabled></div>
        <div class="field"><label>Email</label><input value="abdikadir@example.com" disabled></div>
        <button class="btn btn-ghost" style="width:auto; padding:10px 18px; background:var(--night); color:#F3F6F0;" onclick="go('settings')">Edit in Settings →</button>
      </div>
    </section>
  </main>
</div>

<!-- MODAL -->
<div class="modal-backdrop" id="modalBackdrop" onclick="closeModalBg(event)">
  <div class="modal" onclick="event.stopPropagation()">
    <div class="modal-cover" id="modalCover">
      <button class="modal-close" onclick="closeModal()">×</button>
      <div class="kicker" style="color:#F2A93B; margin-bottom:8px;">COURSE</div>
      <h2 id="modalTitle"></h2>
      <p id="modalDesc"></p>
      <div class="modal-stats" id="modalStats"></div>
    </div>
    <div class="modal-body" id="modalBody"></div>
  </div>
</div>

<script>
const courses = [
  { id:1, title:"Digital Bookkeeping for Small Business", category:"Business", level:"Beginner", cover:"c-sage",
    desc:"Track cash flow, invoices and mobile-money transactions without a spreadsheet mess.",
    lessons:14, students:612, rating:4.8, free:true, price:0, progress:62,
    sections:[
      { name:"Foundations", stops:[["Why bookkeeping matters",true],["Setting up your ledger",true],["Recording your first sale",false]] },
      { name:"Cash & mobile money", stops:[["Reconciling mobile money",false],["Handling cash drawers",false]] },
    ]},
  { id:2, title:"Conversational English for Business", category:"Language", level:"Beginner", cover:"c-cobalt",
    desc:"Speak with confidence in meetings, calls and client emails.",
    lessons:20, students:940, rating:4.6, free:true, price:0, progress:30,
    sections:[ { name:"Getting started", stops:[["Introducing yourself",true],["Small talk basics",false],["Email tone & phrasing",false]] } ]},
  { id:3, title:"Mobile Money & Fintech Basics", category:"Finance", level:"Intermediate", cover:"c-marigold",
    desc:"How mobile money rails work, and how to build products on top of them.",
    lessons:16, students:388, rating:4.9, free:false, price:19, progress:0,
    sections:[ { name:"Overview", stops:[["What is mobile money?",false],["Agents & liquidity",false]] } ]},
  { id:4, title:"Intro to Web Development", category:"Technology", level:"Beginner", cover:"c-cobalt",
    desc:"HTML, CSS and JavaScript fundamentals — build and ship your first page.",
    lessons:28, students:1204, rating:4.7, free:true, price:0, progress:0,
    sections:[ { name:"Foundations", stops:[["How the web works",false],["Your first page",false]] } ]},
  { id:5, title:"Public Speaking & Pitching", category:"Career", level:"Intermediate", cover:"c-sage",
    desc:"Structure a pitch, hold a room, and handle questions under pressure.",
    lessons:10, students:275, rating:4.5, free:false, price:12, progress:0,
    sections:[ { name:"Foundations", stops:[["Structuring a pitch",false],["Owning the room",false]] } ]},
  { id:6, title:"Import–Export Fundamentals", category:"Trade", level:"Advanced", cover:"c-marigold",
    desc:"Customs, documentation and freight basics for cross-border trade.",
    lessons:18, students:151, rating:4.4, free:false, price:25, progress:0,
    sections:[ { name:"Foundations", stops:[["Documentation 101",false],["Working with freight",false]] } ]},
];
const enrolledIds = new Set([1,2]);

function levelColor(level){
  if(level==="Beginner") return "var(--sage)";
  if(level==="Intermediate") return "var(--marigold-dark)";
  return "var(--cobalt)";
}
function courseCard(c, enrolled){
  const priceLabel = c.free ? "Free" : `USD ${c.price.toFixed(2)}`;
  const trail = enrolled ? `
    <div class="trailbar-wrap">
      <div class="trailbar-label"><span>Along the trail</span><b>${c.progress}%</b></div>
      <div class="trailbar"><div class="trailbar-fill" style="width:${c.progress}%"></div><div class="trailbar-marker" style="left:${c.progress}%"></div></div>
    </div>` : "";
  const footer = enrolled
    ? `<div class="enrolled-note">✓ Enrolled · ${c.progress}% complete</div>`
    : `<div class="enroll-row"><button class="btn-enroll" onclick="event.stopPropagation(); enroll(${c.id})">${c.free ? "Enroll free →" : "View course →"}</button></div>`;
  return `
  <article class="course" data-id="${c.id}" data-title="${c.title.toLowerCase()}">
    <button class="course-main" onclick="openModal(${c.id})">
      <div class="cover ${c.cover}">
        <span class="cover-tag">${c.category}</span>
        <span class="stamp" style="border-color:${levelColor(c.level)}; color:#fff;">${c.level.toUpperCase()}</span>
      </div>
      <div class="course-body">
        <div class="course-meta-top">${c.lessons} LESSONS · ${c.students} LEARNERS</div>
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <div class="course-foot"><span class="rating">★ ${c.rating}</span><span class="price">${priceLabel}</span></div>
      </div>
    </button>
    ${trail}
    ${footer}
  </article>`;
}
function render(){
  const enrolled = courses.filter(c=>c.progress>0 || enrolledIds.has(c.id));
  document.getElementById('continueGrid').innerHTML = enrolled.length
    ? enrolled.slice(0,3).map(c=>courseCard(c,true)).join('')
    : `<div class="empty" style="grid-column:1/-1;"><h3>No routes charted yet. Pick a course to start your trail.</h3><button class="btn btn-primary" onclick="go('discover')">Explore courses →</button></div>`;
  document.getElementById('discoverGrid').innerHTML = courses.map(c=>courseCard(c, enrolledIds.has(c.id) || c.progress>0)).join('');
  const learning = courses.filter(c=>c.progress>0 || enrolledIds.has(c.id));
  document.getElementById('learningGrid').innerHTML = learning.length
    ? learning.map(c=>courseCard(c,true)).join('')
    : `<div class="empty" style="grid-column:1/-1;"><h3>You haven't enrolled in a course yet.</h3><button class="btn btn-primary" onclick="go('discover')">Explore courses →</button></div>`;
}

function go(page){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  document.getElementById('page-'+page).style.display='block';
  document.querySelectorAll('.trail-nav[data-page]').forEach(n=>n.classList.toggle('active', n.dataset.page===page));
  window.scrollTo({top:0});
}
document.querySelectorAll('.trail-nav[data-page]').forEach(n=>n.addEventListener('click',()=>go(n.dataset.page)));

function toggleSidebar(){ document.getElementById('app').classList.toggle('collapsed'); }

function filterCourses(){
  const q = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('#discoverGrid .course').forEach(el=>{
    el.style.display = el.dataset.title.includes(q) ? '' : 'none';
  });
}

function enroll(id){
  enrolledIds.add(id);
  const c = courses.find(c=>c.id===id);
  c.progress = c.progress || 5;
  render();
  go('learning');
}

function openModal(id){
  const c = courses.find(c=>c.id===id);
  const enrolled = enrolledIds.has(id) || c.progress>0;
  document.getElementById('modalCover').style.background = getComputedStyle(document.querySelector('.'+c.cover)).backgroundImage;
  document.getElementById('modalTitle').textContent = c.title;
  document.getElementById('modalDesc').textContent = c.desc;
  document.getElementById('modalStats').innerHTML = `<span>${c.category.toUpperCase()}</span><span>${c.level.toUpperCase()}</span><span>★ ${c.rating}</span><span>${c.students} LEARNERS</span>`;
  let body = '';
  if(enrolled){
    body += `<div class="modal-trail-label"><span>Along the trail</span><b>${c.progress}% complete</b></div>
      <div class="modal-trailbar"><div class="modal-trailbar-fill" style="width:${c.progress}%"></div></div>
      <div class="stops">`;
    c.sections.forEach(sec=>{
      body += `<div class="stop-section">${sec.name}</div>`;
      sec.stops.forEach(([label,done])=>{
        body += `<label class="stop"><input type="checkbox" class="stop-check" ${done?'checked':''} onchange="toggleLesson(${c.id})"><span class="stop-text"><b>${label}</b><small>LESSON · 8 MIN</small></span></label>`;
      });
    });
    body += `</div>`;
  } else {
    body = `<div class="modal-price-panel">
      <strong>${c.free ? 'Free course' : 'USD '+c.price.toFixed(2)}</strong>
      <p>${c.free ? 'Enroll now and start learning immediately.' : 'This course requires checkout before you can start.'}</p>
      <button class="btn-enroll" style="width:auto; padding:11px 22px;" onclick="enroll(${c.id}); openModal(${c.id});">${c.free ? 'Enroll free →' : 'View course'}</button>
    </div>`;
  }
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modalBackdrop').classList.add('show');
}
function toggleLesson(id){
  const c = courses.find(c=>c.id===id);
  const all = c.sections.flatMap(s=>s.stops);
  const checks = document.querySelectorAll('#modalBody .stop-check');
  let idx=0;
  c.sections.forEach(s=>s.stops.forEach(st=>{ st[1] = checks[idx].checked; idx++; }));
  const done = all.filter(s=>s[1]).length;
  c.progress = Math.round(done/all.length*100);
  enrolledIds.add(id);
  openModal(id);
  render();
}
function closeModal(){ document.getElementById('modalBackdrop').classList.remove('show'); }
function closeModalBg(e){ if(e.target.id==='modalBackdrop') closeModal(); }

function saveSettings(){
  const t = document.getElementById('settingsToast');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- community (public channels) ---------- */
const channelData = {
  general: { label:"# General", messages:[
    { name:"Hodan A.", init:"HA", time:"9:12", text:"Anyone started the bookkeeping course yet? Section 2 is great." },
    { name:"You", init:"AM", time:"9:20", text:"Yeah, on lesson 3. Reconciling mobile money is the useful part for me." },
    { name:"Yusuf K.", init:"YK", time:"9:25", text:"Welcome to everyone new this week 👋" },
  ]},
  bookkeeping:{ label:"# Bookkeeping", messages:[
    { name:"Fadumo S.", init:"FS", time:"8:02", text:"Does anyone have a template for tracking daily cash sales?" },
    { name:"Instructor", init:"IN", time:"8:10", text:"Posting one in the resources tab shortly." },
  ]},
  english:{ label:"# Business English", messages:[
    { name:"Deka M.", init:"DM", time:"7:40", text:"Practising email phrasing from lesson 3 today." },
  ]},
  jobs:{ label:"# Job leads", messages:[
    { name:"Admin", init:"AD", time:"6:15", text:"New bookkeeping assistant role posted — check pinned message." },
    { name:"Nasra H.", init:"NH", time:"6:40", text:"Applied, thanks for sharing!" },
  ]},
};
let activeChannel = 'general';
function renderCommunity(){
  const ch = channelData[activeChannel];
  document.getElementById('communityHead').textContent = ch.label;
  document.getElementById('communityMessages').innerHTML = ch.messages.map(m=>`
    <div class="msg"><span class="avatar">${m.init}</span>
      <div class="msg-body"><b>${m.name}</b><time>${m.time}</time><div class="msg-bubble">${m.text}</div></div>
    </div>`).join('');
  document.getElementById('communityMessages').scrollTop = 999999;
  document.getElementById('communityInput').placeholder = `Message ${ch.label.replace('# ','#')}…`;
}
document.querySelectorAll('#page-community .channel').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('#page-community .channel').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  activeChannel = btn.dataset.ch;
  renderCommunity();
}));
function sendCommunity(){
  const input = document.getElementById('communityInput');
  if(!input.value.trim()) return;
  channelData[activeChannel].messages.push({ name:"You", init:"AM", time:"now", text: input.value.trim() });
  input.value = '';
  renderCommunity();
}

/* ---------- messaging (direct) ---------- */
const dmData = {
  hodan:{ name:"Hodan A.", messages:[
    { name:"Hodan A.", init:"HA", time:"9:30", text:"Can you send me your notes from lesson 4?" },
    { name:"Hodan A.", init:"HA", time:"9:31", text:"No rush, whenever you get a chance." },
  ]},
  support:{ name:"Course Support", messages:[
    { name:"Course Support", init:"IN", time:"Mon", text:"Your certificate for Digital Bookkeeping is ready 🎉" },
  ]},
  yusuf:{ name:"Yusuf K.", messages:[
    { name:"Yusuf K.", init:"YK", time:"Fri", text:"Thanks, that helped a lot with the mobile money section." },
    { name:"You", init:"AM", time:"Fri", text:"Glad it worked out!" },
  ]},
};
let activeDM = 'hodan';
function renderDM(){
  const dm = dmData[activeDM];
  document.getElementById('dmHead').textContent = dm.name;
  document.getElementById('dmMessages').innerHTML = dm.messages.map(m=>`
    <div class="msg"><span class="avatar">${m.init}</span>
      <div class="msg-body"><b>${m.name}</b><time>${m.time}</time><div class="msg-bubble">${m.text}</div></div>
    </div>`).join('');
  document.getElementById('dmMessages').scrollTop = 999999;
  document.getElementById('dmInput').placeholder = `Message ${dm.name}…`;
}
document.querySelectorAll('#page-messaging .conv').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('#page-messaging .conv').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  activeDM = btn.dataset.dm;
  renderDM();
}));
function sendDM(){
  const input = document.getElementById('dmInput');
  if(!input.value.trim()) return;
  dmData[activeDM].messages.push({ name:"You", init:"AM", time:"now", text: input.value.trim() });
  input.value = '';
  renderDM();
}

render();
renderCommunity();
renderDM();
</script>
</body>
</html>
