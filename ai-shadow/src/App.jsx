import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = ""; // 🔑 Replace this with your key

// ─── THEME & GLOBALS ─────────────────────────────────────────────────────────
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #050810;
    --bg2: #0b0f1c;
    --bg3: #111827;
    --border: #1f2d4a;
    --accent: #00f5d4;
    --accent2: #f72585;
    --accent3: #ffd60a;
    --text: #e2e8f0;
    --muted: #64748b;
    --card: rgba(11,15,28,0.8);
    --font-head: 'Syne', sans-serif;
    --font-mono: 'Space Mono', monospace;
    --red: #ff4d6d;
    --green: #06d6a0;
    --blue: #4cc9f0;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-mono);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Animated grid background */
  .grid-bg {
    position: fixed; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(0,245,212,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,212,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .scanline {
    position: fixed; inset: 0; z-index: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
    pointer-events: none;
  }

  /* Blob lights */
  .blob {
    position: fixed; border-radius: 50%; filter: blur(120px); opacity: 0.12; z-index: 0; pointer-events: none;
  }
  .blob-1 { width: 600px; height: 600px; background: var(--accent); top: -200px; left: -100px; animation: float1 12s ease-in-out infinite; }
  .blob-2 { width: 400px; height: 400px; background: var(--accent2); bottom: -100px; right: -50px; animation: float2 10s ease-in-out infinite; }
  .blob-3 { width: 300px; height: 300px; background: var(--accent3); top: 40%; left: 50%; animation: float3 15s ease-in-out infinite; }

  @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(60px,40px); } }
  @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-40px,-60px); } }
  @keyframes float3 { 0%,100% { transform: translate(-50%,0); } 50% { transform: translate(-50%,40px); } }

  /* Layout */
  .wrapper { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }

  /* Header */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 0 20px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 48px;
  }
  .logo { font-family: var(--font-head); font-weight: 900; font-size: 1.4rem; letter-spacing: -0.02em; }
  .logo span { color: var(--accent); }
  .logo-tag { font-size: 0.65rem; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 2px; }
  .badge { background: rgba(0,245,212,0.1); border: 1px solid rgba(0,245,212,0.3); color: var(--accent); font-size: 0.65rem; letter-spacing: 0.15em; padding: 4px 12px; border-radius: 2px; }

  /* Hero */
  .hero { text-align: center; margin-bottom: 56px; }
  .hero-kicker { font-size: 0.7rem; letter-spacing: 0.3em; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .hero-kicker::before, .hero-kicker::after { content: ''; flex: 1; max-width: 80px; height: 1px; background: var(--accent); opacity: 0.4; }
  .hero h1 { font-family: var(--font-head); font-weight: 900; font-size: clamp(2.5rem, 6vw, 5rem); line-height: 1.0; letter-spacing: -0.04em; margin-bottom: 20px; }
  .hero h1 em { font-style: normal; color: var(--accent); }
  .hero h1 .strike { position: relative; color: var(--muted); }
  .hero h1 .strike::after { content:''; position:absolute; left:0; right:0; top:50%; height:3px; background:var(--accent2); transform: rotate(-2deg); }
  .hero p { color: var(--muted); font-size: 0.85rem; line-height: 1.8; max-width: 560px; margin: 0 auto; }

  /* Input card */
  .input-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 4px; padding: 36px; margin-bottom: 32px;
    backdrop-filter: blur(20px);
    position: relative; overflow: hidden;
  }
  .input-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(0,245,212,0.04) 0%, transparent 60%);
    pointer-events: none;
  }
  .field-label { font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; display: block; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  @media(max-width:640px) { .field-row { grid-template-columns: 1fr; } }
  input[type=text], textarea, select {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border);
    color: var(--text); font-family: var(--font-mono); font-size: 0.85rem;
    padding: 12px 16px; border-radius: 3px; outline: none;
    transition: border-color 0.2s;
  }
  input[type=text]:focus, textarea:focus, select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,245,212,0.06); }
  textarea { min-height: 120px; resize: vertical; }
  select option { background: var(--bg3); }

  .btn-primary {
    background: var(--accent); color: var(--bg); font-family: var(--font-head); font-weight: 800;
    font-size: 0.9rem; letter-spacing: 0.05em; padding: 14px 32px; border: none;
    border-radius: 3px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 10px;
  }
  .btn-primary:hover { background: #00e5c4; transform: translateY(-1px); box-shadow: 0 8px 30px rgba(0,245,212,0.3); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--muted); font-family: var(--font-mono); font-size: 0.75rem; padding: 10px 20px; border-radius: 3px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.1em; }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

  /* Loading */
  .loading-screen { text-align: center; padding: 80px 20px; }
  .loader-ring { width: 80px; height: 80px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 24px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loader-text { font-size: 0.75rem; color: var(--muted); letter-spacing: 0.2em; text-transform: uppercase; }
  .loader-step { font-family: var(--font-head); font-size: 1.1rem; color: var(--accent); margin-bottom: 12px; min-height: 1.5em; }

  /* Dashboard sections */
  .section-label { font-size: 0.65rem; letter-spacing: 0.25em; color: var(--muted); text-transform: uppercase; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
  .section-label::after { content:''; flex:1; height:1px; background:var(--border); }

  .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  @media(max-width:768px) { .dash-grid { grid-template-columns: 1fr; } }
  .dash-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  @media(max-width:900px) { .dash-grid-3 { grid-template-columns: 1fr; } }

  .card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 4px; padding: 28px; backdrop-filter: blur(20px);
    position: relative; overflow: hidden;
  }
  .card-title { font-family: var(--font-head); font-weight: 700; font-size: 0.95rem; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
  .card-title .icon { font-size: 1.1rem; }

  /* Risk meter */
  .risk-number { font-family: var(--font-head); font-size: 4.5rem; font-weight: 900; line-height: 1; }
  .risk-number.high { color: var(--accent2); }
  .risk-number.med { color: var(--accent3); }
  .risk-number.low { color: var(--green); }
  .risk-bar-track { height: 10px; background: var(--border); border-radius: 999px; margin: 16px 0 8px; overflow: hidden; }
  .risk-bar-fill { height: 100%; border-radius: 999px; transition: width 1.5s cubic-bezier(0.22,1,0.36,1); }
  .risk-label { font-size: 0.7rem; color: var(--muted); letter-spacing: 0.1em; }

  /* Stats row */
  .stat-chip { text-align: center; }
  .stat-chip .num { font-family: var(--font-head); font-size: 2.2rem; font-weight: 900; line-height: 1; }
  .stat-chip .lbl { font-size: 0.6rem; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px; }

  /* Task table */
  .task-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
  .task-table th { text-align: left; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); padding: 0 12px 12px; border-bottom: 1px solid var(--border); }
  .task-table td { padding: 12px; border-bottom: 1px solid rgba(31,45,74,0.5); vertical-align: top; line-height: 1.5; }
  .task-table tr:last-child td { border-bottom: none; }
  .task-table tr.at-risk td { background: rgba(247,37,133,0.04); }
  .task-table tr:hover td { background: rgba(255,255,255,0.02); }

  .tag { display: inline-block; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 2px; font-weight: 700; }
  .tag-creative { background: rgba(76,201,240,0.15); color: var(--blue); border: 1px solid rgba(76,201,240,0.3); }
  .tag-strategic { background: rgba(0,245,212,0.12); color: var(--accent); border: 1px solid rgba(0,245,212,0.25); }
  .tag-routine { background: rgba(247,37,133,0.12); color: var(--accent2); border: 1px solid rgba(247,37,133,0.25); }

  .risk-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 0.65rem; padding: 3px 10px; border-radius: 999px; font-weight: 700; }
  .risk-pill.high { background: rgba(247,37,133,0.15); color: var(--accent2); }
  .risk-pill.medium { background: rgba(255,214,10,0.12); color: var(--accent3); }
  .risk-pill.low { background: rgba(6,214,160,0.12); color: var(--green); }
  .risk-pill::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

  /* Skill gap */
  .skill-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(31,45,74,0.4); gap: 12px; }
  .skill-row:last-child { border-bottom: none; }
  .skill-name { font-size: 0.8rem; flex: 1; }
  .skill-bars { display: flex; gap: 6px; align-items: center; }
  .skill-bar-mini { width: 60px; height: 6px; border-radius: 999px; overflow: hidden; background: var(--border); }
  .skill-bar-mini-fill { height: 100%; border-radius: 999px; }
  .skill-trend { font-size: 0.65rem; color: var(--accent3); }
  .skill-missing { font-size: 0.6rem; color: var(--accent2); }

  /* Future card */
  .future-card { background: linear-gradient(135deg, rgba(0,245,212,0.08) 0%, rgba(247,37,133,0.06) 100%); border: 1px solid rgba(0,245,212,0.2); }
  .advice-text { font-size: 0.83rem; line-height: 1.9; color: #94a3b8; }
  .advice-text strong { color: var(--text); }

  /* Timeline visualization (WOW feature) */
  .timeline { position: relative; padding: 20px 0; }
  .timeline-track { position: absolute; left: 20px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, var(--accent), var(--accent2)); }
  .timeline-node { display: flex; gap: 20px; margin-bottom: 28px; position: relative; padding-left: 52px; }
  .timeline-dot { position: absolute; left: 12px; top: 4px; width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--bg); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; }
  .timeline-dot.now { background: var(--accent); box-shadow: 0 0 12px var(--accent); }
  .timeline-dot.near { background: var(--accent3); box-shadow: 0 0 12px var(--accent3); }
  .timeline-dot.future { background: var(--accent2); box-shadow: 0 0 12px var(--accent2); }
  .timeline-content { flex: 1; }
  .timeline-time { font-size: 0.6rem; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px; }
  .timeline-title { font-family: var(--font-head); font-size: 0.9rem; font-weight: 700; margin-bottom: 8px; }
  .timeline-body { font-size: 0.75rem; color: #64748b; line-height: 1.7; }
  .timeline-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .ts { background: rgba(255,255,255,0.05); border: 1px solid var(--border); font-size: 0.6rem; padding: 3px 8px; border-radius: 2px; color: var(--muted); }

  /* Donut chart */
  .donut-wrap { position: relative; width: 140px; height: 140px; margin: 0 auto; }
  .donut-wrap svg { transform: rotate(-90deg); }
  .donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: var(--font-head); }
  .donut-pct { font-size: 1.8rem; font-weight: 900; line-height: 1; }
  .donut-sub { font-size: 0.55rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }

  .legend { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-top: 16px; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.65rem; color: var(--muted); }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

  /* Highlight lost tasks */
  .lost-task { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; background: rgba(247,37,133,0.06); border-left: 3px solid var(--accent2); border-radius: 0 3px 3px 0; margin-bottom: 8px; }
  .lost-task-icon { color: var(--accent2); font-size: 0.9rem; flex-shrink: 0; margin-top: 1px; }
  .lost-task-text { font-size: 0.78rem; line-height: 1.5; }

  /* Animations */
  .fade-in { animation: fadeIn 0.5s ease both; }
  @keyframes fadeIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
  .fade-in-delay-1 { animation-delay: 0.1s; }
  .fade-in-delay-2 { animation-delay: 0.2s; }
  .fade-in-delay-3 { animation-delay: 0.3s; }
  .fade-in-delay-4 { animation-delay: 0.4s; }
  .fade-in-delay-5 { animation-delay: 0.5s; }

  /* Glitch text effect */
  @keyframes glitch {
    0% { text-shadow: 2px 0 var(--accent2), -2px 0 var(--blue); }
    20% { text-shadow: -2px 0 var(--accent2), 2px 0 var(--blue); }
    40% { text-shadow: 2px 2px var(--accent2), -2px -2px var(--blue); }
    60% { text-shadow: 0 0 transparent; }
    80% { text-shadow: -2px 0 var(--accent2), 2px 0 var(--blue); }
    100% { text-shadow: 2px 0 var(--accent2), -2px 0 var(--blue); }
  }

  .error-msg { background: rgba(247,37,133,0.1); border: 1px solid rgba(247,37,133,0.3); color: var(--accent2); padding: 14px 18px; border-radius: 4px; font-size: 0.8rem; margin-bottom: 20px; }
`;

// ─── LOADING STEPS ────────────────────────────────────────────────────────────
const STEPS = [
  "Initializing AI Shadow Engine...",
  "Decomposing task matrix...",
  "Running automation classifiers...",
  "Scanning market drift signals...",
  "Projecting skill decay curves...",
  "Generating future career model...",
];

// ─── DONUT CHART ─────────────────────────────────────────────────────────────
function Donut({ segments }) {
  const r = 54; const cx = 70; const cy = 70;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="16" />
      {segments.map((seg, i) => {
        const len = (seg.pct / 100) * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="16"
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)' }}
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function AnimNum({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0; const dur = 1200; const step = 16;
    const inc = target / (dur / step);
    const t = setInterval(() => {
      start += inc;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, step);
    return () => clearInterval(t);
  }, [target]);
  return <>{val}{suffix}</>;
}

// ─── RISK BAR ─────────────────────────────────────────────────────────────────
function RiskBar({ pct }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(pct), 100); }, [pct]);
  const color = pct >= 70 ? 'var(--accent2)' : pct >= 40 ? 'var(--accent3)' : 'var(--green)';
  return (
    <div className="risk-bar-track">
      <div className="risk-bar-fill" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home"); // home | loading | dashboard
  const [jobRole, setJobRole] = useState("");
  const [tasks, setTasks] = useState("");
  const [exp, setExp] = useState("mid");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [stepIdx, setStepIdx] = useState(0);
  const stepRef = useRef(null);

  const analyze = async () => {
if (!jobRole.trim() || !tasks.trim()) { setError("Please fill in your job role and tasks."); return; }
    setError(""); setPage("loading"); setStepIdx(0);

    // Cycle loading steps
    let i = 0;
    stepRef.current = setInterval(() => {
      i++;
      if (i < STEPS.length) setStepIdx(i);
      else clearInterval(stepRef.current);
    }, 1000);

    try {
      const prompt = `You are a JSON API. You must respond with ONLY a raw JSON object. No markdown. No backticks. No explanation. No extra text before or after. Just the JSON object starting with { and ending with }.

Analyze this career profile:

Job Role: ${jobRole}
Experience Level: ${exp}
Daily Tasks: ${tasks}

Return this exact JSON structure:
{
  "automationRisk": <number 0-100>,
  "riskLevel": "<low|medium|high>",
  "taskBreakdown": [
    {
      "task": "<task name, max 8 words>",
      "category": "<Creative|Strategic|Routine>",
      "automatable": "<low|medium|high>",
      "automationPct": <number 0-100>,
      "atRisk": <true|false>
    }
  ],
  "taskDistribution": { "creative": <number>, "strategic": <number>, "routine": <number> },
  "lostTasks": ["<task 1>", "<task 2>", "<task 3>"],
  "skillsNeeded": [
    { "skill": "<skill name>", "currentDemand": <0-100>, "futureDemand": <0-100>, "gap": "<low|medium|high>", "timeline": "<months>" }
  ],
  "careerAdvice": "<2-3 sentences of specific, actionable career advice>",
  "futureTitle": "<what this role evolves into>",
  "timeline": [
    { "period": "Now", "title": "<current state title>", "body": "<what work looks like now>", "skills": ["skill1","skill2"] },
    { "period": "6 months", "title": "<near future title>", "body": "<what changes in 6 months>", "skills": ["skill1","skill2"] },
    { "period": "12 months", "title": "<future state title>", "body": "<what the role becomes>", "skills": ["skill1","skill2"] }
  ]
}

Analyze specifically for the "${jobRole}" role. Be realistic and specific. Return ONLY the JSON object.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
              responseMimeType: "application/json"
            }
          })
        }
      );

      const data = await res.json();
      console.log("RAW GEMINI RESPONSE:", JSON.stringify(data, null, 2));
      if (data.error) throw new Error(data.error.message);
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("RAW TEXT:", raw);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      console.log("JSON MATCH:", jsonMatch?.[0]?.slice(0, 200));
      if (!jsonMatch) throw new Error("RAW RESPONSE: " + raw.slice(0, 300));
      const parsed = JSON.parse(jsonMatch[0]);
      clearInterval(stepRef.current);
      setResult(parsed);
      setPage("dashboard");
    } catch (e) {
      clearInterval(stepRef.current);
      setError("Analysis failed: " + (e.message || "Check your API key and try again."));
      setPage("home");
    }
  };

  const reset = () => { setResult(null); setPage("home"); setJobRole(""); setTasks(""); setExp("mid"); };

  const riskColor = result ? (result.automationRisk >= 70 ? 'high' : result.automationRisk >= 40 ? 'med' : 'low') : 'low';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <div className="grid-bg" />
      <div className="scanline" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="wrapper">
        {/* Header */}
        <header className="header">
          <div>
            <div className="logo">AI<span>SHADOW</span></div>
            <div className="logo-tag">Career Automation Intelligence</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {page === 'dashboard' && <button className="btn-ghost" onClick={reset}>↩ New Analysis</button>}
            <span className="badge">MVP v1.0</span>
          </div>
        </header>

        {/* ── HOME PAGE ── */}
        {page === 'home' && (
          <>
            <section className="hero">
              <div className="hero-kicker">AI Shadow Simulator</div>
              <h1>Will a bot<br/><em>replace</em> <span className="strike">your</span> job?</h1>
              <p>Enter your role and daily tasks. Our AI shadow engine analyzes automation risk, predicts skill decay, and maps your path to future relevance.</p>
            </section>

            {error && <div className="error-msg">⚠ {error}</div>}

            <div className="input-card">
              <div className="field-row">
                <div>
                  <label className="field-label">Job Role / Title</label>
                  <input type="text" placeholder="e.g. Frontend Developer, Data Analyst…" value={jobRole} onChange={e => setJobRole(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Experience Level</label>
                  <select value={exp} onChange={e => setExp(e.target.value)}>
                    <option value="junior">Junior (0-2 yrs)</option>
                    <option value="mid">Mid-level (2-5 yrs)</option>
                    <option value="senior">Senior (5+ yrs)</option>
                    <option value="lead">Lead / Manager</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="field-label">Your Daily Tasks (one per line or comma-separated)</label>
                <textarea placeholder={"e.g.\nWrite reports and summaries\nReview pull requests\nAttend stand-up meetings\nDebug production issues\nCreate presentations for stakeholders"} value={tasks} onChange={e => setTasks(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" onClick={analyze} disabled={!jobRole.trim() || !tasks.trim()}>
                  <span>⚡</span> Run AI Shadow Analysis
                </button>
              </div>
            </div>

            {/* Stats teaser */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[['85M', 'Jobs displaced by 2030'], ['40%', 'Tasks automatable today'], ['12mo', 'Avg skill shelf-life']].map(([n, l]) => (
                <div key={n} className="card" style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 900, color: 'var(--accent)' }}>{n}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>{l}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── LOADING PAGE ── */}
        {page === 'loading' && (
          <div className="loading-screen">
            <div className="loader-ring" />
            <div className="loader-step">{STEPS[stepIdx]}</div>
            <div className="loader-text">Analyzing your career shadow...</div>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ fontSize: '0.65rem', color: i <= stepIdx ? 'var(--accent)' : 'var(--muted)', transition: 'color 0.3s', letterSpacing: '0.1em' }}>
                  {i < stepIdx ? '✓' : i === stepIdx ? '▶' : '○'} {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DASHBOARD PAGE ── */}
        {page === 'dashboard' && result && (
          <div>
            {/* Row 1: Risk + Stats */}
            <div className="section-label">Automation Risk Analysis</div>
            <div className="dash-grid fade-in">
              {/* Risk Meter */}
              <div className="card">
                <div className="card-title"><span className="icon">⚠</span> Automation Risk Score</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  <div className={`risk-number ${riskColor}`}>
                    <AnimNum target={result.automationRisk} suffix="%" />
                  </div>
                  <div style={{ paddingBottom: 8, fontSize: '0.75rem', color: 'var(--muted)' }}>of your job<br/>automatable</div>
                </div>
                <RiskBar pct={result.automationRisk} />
                <div className="risk-label">
                  {result.automationRisk >= 70 ? '🔴 HIGH RISK — Immediate upskilling needed' :
                   result.automationRisk >= 40 ? '🟡 MEDIUM RISK — Proactive adaptation advised' :
                   '🟢 LOW RISK — Stay current, monitor trends'}
                </div>

                {/* Category donut */}
                <div style={{ marginTop: 24 }}>
                  <div className="donut-wrap">
                    <Donut segments={[
                      { pct: result.taskDistribution?.routine || 0, color: 'var(--accent2)' },
                      { pct: result.taskDistribution?.strategic || 0, color: 'var(--accent)' },
                      { pct: result.taskDistribution?.creative || 0, color: 'var(--blue)' },
                    ]} />
                    <div className="donut-center">
                      <div className="donut-pct" style={{ fontSize: '1rem', color: 'var(--muted)' }}>Tasks</div>
                    </div>
                  </div>
                  <div className="legend">
                    {[['var(--accent2)', 'Routine'], ['var(--accent)', 'Strategic'], ['var(--blue)', 'Creative']].map(([c, l]) => (
                      <div key={l} className="legend-item"><div className="legend-dot" style={{ background: c }} />{l}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lost Tasks */}
              <div className="card">
                <div className="card-title"><span className="icon">💀</span> Tasks You Will Lose</div>
                <div style={{ marginBottom: 16, fontSize: '0.7rem', color: 'var(--muted)' }}>These tasks face the highest automation risk within 12 months</div>
                {(result.lostTasks || []).map((t, i) => (
                  <div key={i} className="lost-task">
                    <span className="lost-task-icon">×</span>
                    <span className="lost-task-text">{t}</span>
                  </div>
                ))}
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Your Role Evolves Into</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--accent)', fontWeight: 700 }}>→ {result.futureTitle}</div>
                </div>
              </div>
            </div>

            {/* Row 2: Task Table */}
            <div className="section-label fade-in fade-in-delay-1">Task Breakdown Matrix</div>
            <div className="card fade-in fade-in-delay-1" style={{ marginBottom: 20, overflowX: 'auto' }}>
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Category</th>
                    <th>Automation %</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.taskBreakdown || []).map((t, i) => (
                    <tr key={i} className={t.atRisk ? 'at-risk' : ''}>
                      <td>{t.atRisk && <span style={{ color: 'var(--accent2)', marginRight: 6 }}>⚠</span>}{t.task}</td>
                      <td><span className={`tag tag-${(t.category || '').toLowerCase()}`}>{t.category}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="risk-bar-track" style={{ flex: 1, height: 6 }}>
                            <div className="risk-bar-fill" style={{ width: `${t.automationPct}%`, height: '100%', background: t.automationPct >= 70 ? 'var(--accent2)' : t.automationPct >= 40 ? 'var(--accent3)' : 'var(--green)', borderRadius: 999 }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', minWidth: 30 }}>{t.automationPct}%</span>
                        </div>
                      </td>
                      <td><span className={`risk-pill ${t.automatable}`}>{t.automatable}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Row 3: Skill Gap */}
            <div className="section-label fade-in fade-in-delay-2">Predictive Skill Gap — Market Drift (12mo)</div>
            <div className="dash-grid fade-in fade-in-delay-2">
              <div className="card">
                <div className="card-title"><span className="icon">📈</span> Skills You Must Learn</div>
                {(result.skillsNeeded || []).slice(0, 6).map((s, i) => (
                  <div key={i} className="skill-row">
                    <div className="skill-name">{s.skill}</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--muted)', marginBottom: 3 }}>Now</div>
                        <div className="skill-bar-mini"><div className="skill-bar-mini-fill" style={{ width: `${s.currentDemand}%`, background: 'var(--muted)' }} /></div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--accent)', marginBottom: 3 }}>12mo</div>
                        <div className="skill-bar-mini"><div className="skill-bar-mini-fill" style={{ width: `${s.futureDemand}%`, background: 'var(--accent)' }} /></div>
                      </div>
                      <span className={`risk-pill ${s.gap}`}>{s.gap} gap</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Future You card */}
              <div className="card future-card">
                <div className="card-title"><span className="icon">✨</span> Future You — Career Advice</div>
                <p className="advice-text">{result.careerAdvice}</p>
                <div style={{ marginTop: 20, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 3, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Top Priority Actions</div>
                  {(result.skillsNeeded || []).filter(s => s.gap === 'high').slice(0, 3).map((s, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', padding: '6px 0', borderBottom: '1px solid rgba(31,45,74,0.4)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>→ Learn {s.skill}</span>
                      <span style={{ color: 'var(--accent3)', fontSize: '0.65rem' }}>{s.timeline}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4: WOW Feature — Career Timeline */}
            <div className="section-label fade-in fade-in-delay-3">Career Evolution Timeline</div>
            <div className="card fade-in fade-in-delay-3" style={{ marginBottom: 20 }}>
              <div className="card-title"><span className="icon">🚀</span> Your AI Shadow — Evolution Path</div>
              <div className="timeline">
                <div className="timeline-track" />
                {(result.timeline || []).map((t, i) => (
                  <div key={i} className="timeline-node">
                    <div className={`timeline-dot ${i === 0 ? 'now' : i === 1 ? 'near' : 'future'}`} />
                    <div className="timeline-content">
                      <div className="timeline-time">{t.period}</div>
                      <div className="timeline-title">{t.title}</div>
                      <div className="timeline-body">{t.body}</div>
                      <div className="timeline-skills">
                        {(t.skills || []).map((sk, j) => <span key={j} className="ts">{sk}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
            <div style={{ textAlign: 'center', padding: 40, borderTop: '1px solid var(--border)', marginTop: 20 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>Don't become the shadow.</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 20 }}>Start building the skills that keep you relevant.</div>
              <button className="btn-primary" onClick={reset}>⚡ Analyze Another Role</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}