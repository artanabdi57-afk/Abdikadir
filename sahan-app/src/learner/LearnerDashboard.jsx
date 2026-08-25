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
    --font-display:'Fraunces', Georgia, serif;
    --font-body:'Inter', system-ui, -apple-system, sans-serif;
    --font-mono:'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
    --shadow-card:0 1px 2px rgba(20,32,25,0.06), 0 8px 24px -12px rgba(20,32,25,0.18);
    --shadow-modal:0 24px 64px -20px rgba(14,31,27,0.45);
  }

  *{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; }
  body{
    font-family:var(--font-body);
    color:var(--ink);
    background:var(--paper);
    -webkit-font-smoothing:antialiased;
  }
  button{ font-family:inherit; cursor:pointer; }
  input{ font-family:inherit; }
  a{ color:inherit; }
  ::selection{ background:var(--marigold); color:var(--night); }

  :focus-visible{
    outline:2.5px solid var(--marigold-dark);
    outline-offset:2px;
    border-radius:4px;
  }

  @media (prefers-reduced-motion: reduce){
    *{ animation-duration:0.001ms !important; transition-duration:0.001ms !important; }
  }

  /* ---------- shell ---------- */
  .app{
    display:grid;
    grid-template-columns:264px 1fr;
    min-height:100vh;
  }

  /* ---------- sidebar ---------- */
  .sidebar{
    background:var(--night);
    color:#EDF2EA;
    padding:28px 22px 24px;
    display:flex;
    flex-direction:column;
    position:sticky;
    top:0;
    height:100vh;
  }
  .brand{
    display:flex;
    align-items:center;
    gap:10px;
    background:none;
    border:none;
    color:inherit;
    padding:0 0 4px;
    text-align:left;
  }
  .brand-mark{
    width:34px; height:34px;
    border-radius:10px;
    background:linear-gradient(155deg, var(--marigold), var(--marigold-dark));
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  }
  .brand-mark svg{ width:18px; height:18px; }
  .brand-word{
    font-family:var(--font-display);
    font-size:21px;
    font-weight:600;
    letter-spacing:0.2px;
  }
  .sidebar-label{
    font-family:var(--font-mono);
    font-size:10.5px;
    letter-spacing:0.16em;
    color:#7C9187;
    margin:26px 4px 10px;
  }

  .trail{
    position:relative;
    display:flex;
    flex-direction:column;
  }
  .trail-nav{
    position:relative;
    display:flex;
    align-items:center;
    gap:13px;
    background:none;
    border:none;
    color:#C3D0C6;
    font-size:14.5px;
    font-weight:500;
    padding:10px 8px;
    text-align:left;
    border-radius:var(--radius-sm);
  }
  .trail-nav .dot{
    width:9px; height:9px;
    border-radius:50%;
    border:2px solid #4B5F53;
    background:var(--night);
    flex-shrink:0;
    transition:background .15s ease, border-color .15s ease, box-shadow .15s ease;
  }
  .trail-nav:not(:last-child)::before{
    content:"";
    position:absolute;
    left:12.5px;
    top:29px;
    width:1px;
    height:20px;
    background:#324339;
  }
  .trail-nav:hover{ color:#F3F6F0; background:rgba(255,255,255,0.04); }
  .trail-nav.active{ color:#FFFFFF; background:rgba(242,169,59,0.1); }
  .trail-nav.active .dot{
    background:var(--marigold);
    border-color:var(--marigold);
    box-shadow:0 0 0 3px rgba(242,169,59,0.22);
  }

  .sidebar-spacer{ flex:1; }

  .teach-cta{
    background:var(--night-3);
    border:1px solid #33473C;
    color:#EDF2EA;
    font-size:13px;
    font-weight:600;
    padding:11px 13px;
    border-radius:var(--radius-sm);
    margin-bottom:16px;
    display:flex;
    justify-content:space-between;
    align-items:center;
  }
  .teach-cta:hover{ border-color:var(--marigold); color:var(--marigold); }

  .sidebar-divider{ height:1px; background:#26382E; margin:2px 0 16px; }

  .profile-chip{
    display:flex; align-items:center; gap:10px;
    background:none; border:none; color:inherit;
    padding:6px 4px; margin-bottom:6px; border-radius:var(--radius-sm);
    text-align:left; width:100%;
  }
  .profile-chip:hover{ background:rgba(255,255,255,0.05); }
  .avatar{
    width:34px; height:34px; border-radius:50%;
    background:var(--night-3); border:1px solid #3A5044;
    color:#F3F6F0;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-mono); font-size:12px; font-weight:600;
    flex-shrink:0;
  }
  .profile-chip b{ display:block; font-size:13.5px; font-weight:600; }
  .profile-chip small{ display:block; font-size:11.5px; color:#8DA091; }

  .signout{
    background:none; border:none; color:#8DA091;
    font-size:12.5px; padding:4px; text-align:left;
  }
  .signout:hover{ color:#EDF2EA; text-decoration:underline; }

  /* ---------- main ---------- */
  .main{ min-width:0; }
  .topbar{
    display:flex; align-items:center; justify-content:space-between;
    padding:20px 40px;
    border-bottom:1px solid var(--line);
    background:var(--paper-2);
    position:sticky; top:0; z-index:5;
  }
  .search{ position:relative; width:340px; max-width:46vw; }
  .search svg{ position:absolute; left:12px; top:50%; transform:translateY(-50%); width:15px; height:15px; color:var(--muted); }
  .search input{
    width:100%;
    border:1px solid var(--line);
    background:var(--paper);
    border-radius:999px;
    padding:9px 14px 9px 34px;
    font-size:13.5px;
    color:var(--ink);
  }
  .search input:focus{ outline:none; border-color:var(--marigold-dark); background:var(--paper-2); }
  .account{ display:flex; align-items:center; gap:9px; font-size:13.5px; font-weight:600; color:var(--ink); }
  .account .avatar{ background:var(--sage-ink); color:#F3F6F0; border-color:var(--sage-ink); }

  .content{ padding:36px 40px 64px; max-width:1180px; }
  .kicker{
    font-family:var(--font-mono); font-size:11px; letter-spacing:0.14em;
    color:var(--marigold-dark); font-weight:600; margin-bottom:10px;
  }

  /* ---------- home hero ---------- */
  .hero{
    display:grid; grid-template-columns:1fr 300px; gap:28px;
    background:var(--night);
    color:#EDF2EA;
    border-radius:var(--radius-lg);
    padding:38px 40px;
    margin-bottom:44px;
    position:relative;
    overflow:hidden;
  }
  .hero::after{
    content:"";
    position:absolute; inset:0;
    background:
      radial-gradient(420px 220px at 88% -10%, rgba(242,169,59,0.16), transparent 70%),
      radial-gradient(320px 200px at 100% 110%, rgba(51,81,143,0.24), transparent 70%);
    pointer-events:none;
  }
  .hero h1{
    font-family:var(--font-display); font-weight:600;
    font-size:34px; line-height:1.15; margin:0 0 12px; letter-spacing:-0.2px;
    max-width:480px; position:relative;
  }
  .hero p{ font-size:14.5px; color:#B9C8BE; max-width:440px; margin:0 0 22px; position:relative; }
  .hero-actions{ display:flex; gap:10px; position:relative; }
  .btn{
    border:none; border-radius:999px; font-weight:600; font-size:13.5px;
    padding:11px 20px; display:inline-flex; align-items:center; gap:6px;
  }
  .btn-primary{ background:var(--marigold); color:var(--marigold-ink); }
  .btn-primary:hover{ background:#FFC169; }
  .btn-ghost{ background:rgba(255,255,255,0.08); color:#EDF2EA; border:1px solid rgba(255,255,255,0.16); }
  .btn-ghost:hover{ background:rgba(255,255,255,0.14); }

  .hero-card{
    background:rgba(255,255,255,0.06);
    border:1px solid rgba(255,255,255,0.14);
    border-radius:var(--radius-md);
    padding:20px;
    display:flex; flex-direction:column; align-items:flex-start; gap:10px;
    position:relative;
  }
  .hero-card .avatar{ width:44px; height:44px; font-size:15px; background:var(--marigold); color:var(--marigold-ink); border-color:transparent; }
  .hero-card b{ font-size:13.5px; font-weight:600; }
  .hero-card small{ font-size:12px; color:#B9C8BE; line-height:1.5; }

  /* ---------- section headers ---------- */
  .section-head{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:18px; }
  .section-head h2{ font-family:var(--font-display); font-size:21px; font-weight:600; margin:0 0 4px; }
  .section-head p{ font-size:13px; color:var(--muted); margin:0; }
  .page-title h1{ font-family:var(--font-display); font-size:30px; font-weight:600; margin:0 0 8px; }
  .page-title p{ font-size:14px; color:var(--muted); margin:0 0 30px; max-width:520px; }

  /* ---------- course grid / card ---------- */
  .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(268px,1fr)); gap:18px; margin-bottom:46px; }

  .course{
    background:var(--paper-2);
    border:1px solid var(--line);
    border-radius:var(--radius-md);
    overflow:hidden;
    display:flex; flex-direction:column;
    box-shadow:var(--shadow-card);
    transition:transform .15s ease, box-shadow .15s ease;
  }
  .course:hover{ transform:translateY(-2px); box-shadow:0 1px 2px rgba(20,32,25,0.08), 0 16px 30px -14px rgba(20,32,25,0.28); }

  .course-main{ background:none; border:none; text-align:left; padding:0; color:inherit; display:block; }

  .cover{
    height:104px;
    position:relative;
    display:flex; align-items:flex-end; justify-content:space-between;
    padding:12px 14px;
    background:
      linear-gradient(155deg, var(--cobalt), var(--night));
  }
  .cover.c-sage{ background:linear-gradient(155deg, var(--sage), var(--sage-ink)); }
  .cover.c-marigold{ background:linear-gradient(155deg, #E8A93F, var(--marigold-dark)); }
  .cover.c-cobalt{ background:linear-gradient(155deg, var(--cobalt), #172035); }
  .cover-tag{
    font-family:var(--font-mono); font-size:10px; letter-spacing:0.1em;
    color:rgba(255,255,255,0.88); background:rgba(0,0,0,0.18);
    padding:4px 8px; border-radius:999px;
  }
  .stamp{
    font-family:var(--font-mono); font-size:9.5px; font-weight:700; letter-spacing:0.08em;
    color:#fff; border:1.5px dashed rgba(255,255,255,0.75);
    border-radius:999px; padding:4px 9px;
    transform:rotate(-6deg);
    background:rgba(0,0,0,0.14);
  }

  .course-body{ padding:15px 16px 17px; display:flex; flex-direction:column; gap:8px; flex:1; }
  .course-meta-top{ font-family:var(--font-mono); font-size:10.5px; color:var(--muted); letter-spacing:0.02em; }
  .course h3{ font-family:var(--font-display); font-size:17px; font-weight:600; margin:0; line-height:1.3; }
  .course p{ font-size:12.5px; color:var(--muted); margin:0; line-height:1.5;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

  .course-foot{ display:flex; align-items:center; justify-content:space-between; margin-top:4px; }
  .rating{ font-size:12px; color:var(--marigold-dark); font-weight:600; }
  .price{ font-family:var(--font-mono); font-size:12.5px; font-weight:600; }

  /* trail progress (signature element) */
  .trailbar-wrap{ padding:0 16px 15px; }
  .trailbar-label{
    display:flex; justify-content:space-between; font-family:var(--font-mono);
    font-size:10.5px; color:var(--muted); margin-bottom:6px;
  }
  .trailbar-label b{ color:var(--ink); font-weight:600; }
  .trailbar{
    position:relative; height:6px; border-radius:999px;
    background:repeating-linear-gradient(90deg, var(--line) 0 4px, transparent 4px 8px);
  }
  .trailbar-fill{
    position:absolute; left:0; top:0; height:100%; border-radius:999px;
    background:linear-gradient(90deg, var(--marigold-dark), var(--marigold));
  }
  .trailbar-marker{
    position:absolute; top:50%; width:13px; height:13px; border-radius:50%;
    background:var(--marigold); border:2.5px solid var(--paper-2);
    transform:translate(-50%,-50%); box-shadow:0 1px 4px rgba(20,32,25,0.35);
  }

  .enroll-row{ padding:0 16px 16px; }
  .btn-enroll{
    width:100%; background:var(--night); color:#F3F6F0; border-radius:var(--radius-sm);
    padding:10px; font-size:12.5px; font-weight:600;
  }
  .btn-enroll:hover{ background:var(--night-3); }
  .btn-enroll:disabled{ opacity:0.55; cursor:default; }
  .enrolled-note{
    padding:0 16px 16px; font-size:11.5px; font-family:var(--font-mono);
    color:var(--sage-ink); display:flex; align-items:center; gap:6px;
  }

  /* ---------- empty state ---------- */
  .empty{
    border:1px dashed var(--line); border-radius:var(--radius-md);
    padding:40px 30px; text-align:center; background:var(--paper-2);
    margin-bottom:40px;
  }
  .empty h3{ font-family:var(--font-display); font-size:17px; font-weight:600; margin:0 0 14px; color:var(--ink); }

  /* ---------- settings ---------- */
  .settings-card{
    background:var(--paper-2); border:1px solid var(--line); border-radius:var(--radius-md);
    padding:26px; max-width:420px; display:flex; flex-direction:column; gap:16px;
  }
  .field label{ display:block; font-size:12px; font-weight:600; color:var(--muted); margin-bottom:6px; font-family:var(--font-mono); letter-spacing:0.03em; }
  .field input{
    width:100%; border:1px solid var(--line); border-radius:var(--radius-sm);
    padding:10px 12px; font-size:14px; background:var(--paper);
  }
  .field input:focus{ outline:none; border-color:var(--marigold-dark); }
  .field input:disabled{ color:var(--muted); background:#EEF1EA; }
  .toast{
    font-size:12.5px; color:var(--sage-ink); background:#EAF1E1; border:1px solid #CFE0BE;
    padding:9px 12px; border-radius:var(--radius-sm); display:none;
  }
  .toast.show{ display:block; }

  /* ---------- modal ---------- */
  .modal-backdrop{
    position:fixed; inset:0; background:rgba(14,31,27,0.55);
    display:none; align-items:flex-start; justify-content:center;
    padding:5vh 20px; overflow-y:auto; z-index:50;
  }
  .modal-backdrop.show{ display:flex; }
  .modal{
    background:var(--paper-2); border-radius:var(--radius-lg); max-width:620px; width:100%;
    box-shadow:var(--shadow-modal); overflow:hidden;
  }
  .modal-cover{
    padding:26px 30px 22px; color:#EDF2EA; position:relative;
    background:linear-gradient(155deg, var(--cobalt), var(--night));
  }
  .modal-close{
    position:absolute; top:16px; right:16px; width:30px; height:30px; border-radius:50%;
    background:rgba(255,255,255,0.12); border:none; color:#fff; font-size:16px; line-height:1;
  }
  .modal-close:hover{ background:rgba(255,255,255,0.22); }
  .modal-cover h2{ font-family:var(--font-display); font-size:23px; font-weight:600; margin:0 0 8px; max-width:440px; }
  .modal-cover p{ font-size:13px; color:#C7D3CB; margin:0 0 16px; max-width:440px; }
  .modal-stats{ display:flex; gap:16px; flex-wrap:wrap; font-family:var(--font-mono); font-size:10.5px; color:#D6E0D9; letter-spacing:0.03em; }

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

  /* ---------- responsive ---------- */
  @media (max-width:900px){
    .app{ grid-template-columns:1fr; }
    .sidebar{ position:static; height:auto; flex-direction:row; align-items:center; padding:14px 18px; gap:14px; overflow-x:auto; }
    .sidebar-label, .sidebar-divider, .sidebar-spacer{ display:none; }
    .trail{ flex-direction:row; gap:4px; }
    .trail-nav::before{ display:none; }
    .trail-nav{ padding:8px 10px; white-space:nowrap; }
    .teach-cta, .profile-chip, .signout{ display:none; }
    .content{ padding:26px 18px 50px; }
    .topbar{ padding:14px 18px; }
    .hero{ grid-template-columns:1fr; padding:26px; }
    .hero-card{ display:none; }
  }
</style>
</head>
<body>

<div class="app">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <button class="brand" onclick="go('home')">
      <span class="brand-mark">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7l9 5 9-5-9-5z" stroke="#3B2409" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 12l9 5 9-5" stroke="#3B2409" stroke-width="1.6" stroke-linejoin="round"/></svg>
      </span>
      <span class="brand-word">Sahan</span>
    </button>
    <div class="sidebar-label">LEARNER</div>
    <nav class="trail" id="trail">
      <button class="trail-nav active" data-page="home"><span class="dot"></span>Home</button>
      <button class="trail-nav" data-page="discover"><span class="dot"></span>Discover</button>
      <button class="trail-nav" data-page="learning"><span class="dot"></span>My learning</button>
      <button class="trail-nav" data-page="settings"><span class="dot"></span>Settings</button>
    </nav>
    <div class="sidebar-spacer"></div>
    <button class="teach-cta">Teach on Sahan <span>→</span></button>
    <div class="sidebar-divider"></div>
    <button class="profile-chip" onclick="go('settings')">
      <span class="avatar">AH</span>
      <span><b>Asha Hassan</b><small>asha@example.com</small></span>
    </button>
    <button class="signout">Sign out</button>
  </aside>

  <!-- MAIN -->
  <main class="main">
    <header class="topbar">
      <div class="search">
        <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <input id="searchInput" placeholder="Search courses…" oninput="filterCourses()">
      </div>
      <div class="account"><span class="avatar">AH</span>Asha Hassan</div>
    </header>

    <!-- HOME -->
    <section class="content page" id="page-home">
      <div class="hero">
        <div>
          <div class="kicker" style="color:#F2A93B;">YOUR LEARNING ROUTE</div>
          <h1>Welcome back, Asha.</h1>
          <p>Three courses in progress, one certificate away from your next milestone. Pick up where you left off, or chart a new one.</p>
          <div class="hero-actions">
            <button class="btn btn-primary" onclick="go('discover')">Explore courses →</button>
            <button class="btn btn-ghost" onclick="go('learning')">My learning</button>
          </div>
        </div>
        <div class="hero-card">
          <span class="avatar">AH</span>
          <b>Verified learner account</b>
          <small>Progress, enrollments and certificates sync in real time from your Sahan profile.</small>
        </div>
      </div>

      <div class="section-head">
        <div><h2>Continue learning</h2><p>Pick up your route where you left off.</p></div>
      </div>
      <div class="grid" id="continueGrid"></div>
    </section>

    <!-- DISCOVER -->
    <section class="content page" id="page-discover" style="display:none;">
      <div class="page-title">
        <div class="kicker">DISCOVER</div>
        <h1>Find something worth learning.</h1>
        <p>Published, admin-approved courses from instructors across the Sahan marketplace.</p>
      </div>
      <div class="grid" id="discoverGrid"></div>
    </section>

    <!-- LEARNING -->
    <section class="content page" id="page-learning" style="display:none;">
      <div class="page-title">
        <div class="kicker">MY LEARNING</div>
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
        <div class="field"><label>Full name</label><input id="settingsName" value="Asha Hassan"></div>
        <div class="field"><label>Email</label><input value="asha@example.com" disabled></div>
        <button class="btn btn-enroll" style="width:auto; padding:10px 18px;" onclick="saveSettings()">Save profile</button>
        <div class="toast" id="settingsToast">Profile updated.</div>
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
    sections:[
      { name:"Getting started", stops:[["Introducing yourself",true],["Small talk basics",false],["Email tone & phrasing",false]] },
    ]},
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
      <div class="trailbar">
        <div class="trailbar-fill" style="width:${c.progress}%"></div>
        <div class="trailbar-marker" style="left:${c.progress}%"></div>
      </div>
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
        <div class="course-foot">
          <span class="rating">★ ${c.rating}</span>
          <span class="price">${priceLabel}</span>
        </div>
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

const enrolledIds = new Set([1,2]);

function go(page){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  document.getElementById('page-'+page).style.display='block';
  document.querySelectorAll('.trail-nav').forEach(n=>n.classList.toggle('active', n.dataset.page===page));
  window.scrollTo({top:0});
}
document.querySelectorAll('.trail-nav').forEach(n=>n.addEventListener('click',()=>go(n.dataset.page)));

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
  document.getElementById('modalCover').className = 'modal-cover cover ' ; // reset then set gradient below
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
      sec.stops.forEach(([label,done],i)=>{
        body += `<label class="stop">
          <input type="checkbox" class="stop-check" ${done?'checked':''} onchange="toggleLesson(${c.id})">
          <span class="stop-text"><b>${label}</b><small>LESSON · 8 MIN</small></span>
        </label>`;
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
  document.getElementById('modalBackdrop').dataset.current = c.id;
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

render();
</script>
</body>
</html>
