import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CYAN = "#00d2c8";
const BG = "#030b12";

const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{
    background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)",
    backdropFilter: "blur(14px)", borderRadius: 3, position: "relative",
    boxShadow: "0 0 40px rgba(0,210,200,0.04), 0 8px 32px rgba(0,0,0,0.4)", ...style,
  }}>
    <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.4),transparent)" }} />
    {children}
  </div>
);

const Label = ({ children }) => (
  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>{children}</p>
);

const BigNum = ({ value, sub }) => (
  <div style={{ marginBottom: 4 }}>
    <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 42, color: CYAN, lineHeight: 1 }}>{value}</span>
    {sub && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 8, letterSpacing: 2 }}>{sub}</span>}
  </div>
);

const HBar = ({ label, pct, color = CYAN, delay = 0 }) => {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay + 200); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color: CYAN, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: "rgba(0,210,200,0.1)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: `linear-gradient(90deg,${color},#0077aa)`, borderRadius: 2, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
};

const Ring = ({ pct, size = 100, stroke = 6, label, color = CYAN }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => { const t = setTimeout(() => setOffset(circ * (1 - pct / 100)), 300); return () => clearTimeout(t); }, [pct, circ]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,210,200,0.1)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: size * 0.22, color: CYAN }}>{pct}%</span>
        </div>
      </div>
      {label && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center", letterSpacing: 1 }}>{label}</p>}
    </div>
  );
};

const Spark = ({ data, color = CYAN, height = 60 }) => {
  const W = 200, H = height;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * (H - 8) - 4;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${H} ${pts} ${W},${H}`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const SolarSystem = () => {
  const ref = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const JOBS = [
    { name: "Senior React Dev", company: "Instabug",  match: 94, color: "#00d2c8", orbit: 110, speed: 0.0008, size: 14, angle: 0.3 },
    { name: "Frontend Eng",     company: "Breadfast", match: 81, color: "#00a8ff", orbit: 170, speed: 0.0005, size: 11, angle: 1.8 },
    { name: "Full-Stack Eng",   company: "Swvl",      match: 76, color: "#7b61ff", orbit: 230, speed: 0.0003, size: 10, angle: 3.5 },
    { name: "React Native Dev", company: "Noon",      match: 68, color: "#ff6b6b", orbit: 290, speed: 0.0002, size: 9,  angle: 5.0 },
    { name: "FullStack Eng",    company: "Fawry",     match: 61, color: "#ffd166", orbit: 340, speed: 0.00015,size: 8,  angle: 0.9 },
  ];

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let id;
    const dpr = window.devicePixelRatio || 1;
    let angles = JOBS.map(j => j.angle);
    let W, H, cx, cy;

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
      cx = W / 2; cy = H / 2;
    };
    resize();
    window.addEventListener("resize", resize);

    
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.3, a: Math.random(),
    }));

    const draw = (ts) => {
      ctx.clearRect(0, 0, W, H);

      
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + s.a * 0.4 * (0.5 + 0.5 * Math.sin(ts * 0.001 + s.a * 10))})`;
        ctx.fill();
      });

      
      [120, 80, 50, 30].forEach((r, i) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(0,210,200,${[0.06, 0.1, 0.18, 0.9][i]})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });

      
      const pulseR = 36 + Math.sin(ts * 0.002) * 4;
      ctx.beginPath(); ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,210,200,${0.3 + Math.sin(ts * 0.002) * 0.15})`;
      ctx.lineWidth = 1.5; ctx.stroke();

      
      const sunG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
      sunG.addColorStop(0, "#fff");
      sunG.addColorStop(0.3, "#00ffd0");
      sunG.addColorStop(1, "#006655");
      ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fillStyle = sunG; ctx.fill();

      
      ctx.fillStyle = "#000";
      ctx.font = `bold 9px 'Rajdhani',sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("YOU", cx, cy - 3);
      ctx.fillText("∞", cx, cy + 6);

      
      JOBS.forEach((j, i) => {
        angles[i] += j.speed;

        
        ctx.beginPath();
        ctx.ellipse(cx, cy, j.orbit, j.orbit * 0.35, 0.15, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,210,200,0.07)`;
        ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);

        
        const px = cx + Math.cos(angles[i]) * j.orbit;
        const py = cy + Math.sin(angles[i]) * j.orbit * 0.35;

        
        const pg = ctx.createRadialGradient(px, py, 0, px, py, j.size * 2.5);
        pg.addColorStop(0, j.color + "44");
        pg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(px, py, j.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();

        
        const planetG = ctx.createRadialGradient(px - j.size * 0.3, py - j.size * 0.3, 0, px, py, j.size);
        planetG.addColorStop(0, "#fff");
        planetG.addColorStop(0.3, j.color);
        planetG.addColorStop(1, j.color + "88");
        ctx.beginPath(); ctx.arc(px, py, j.size, 0, Math.PI * 2);
        ctx.fillStyle = planetG; ctx.fill();

        
        ctx.fillStyle = CYAN;
        ctx.font = `bold 10px 'Rajdhani',sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(`${j.match}%`, px, py - j.size - 4);

        
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.font = `9px 'Barlow',sans-serif`;
        ctx.textBaseline = "top";
        ctx.fillText(j.company, px, py + j.size + 3);

        
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + (px - cx) * 0.3, cy + (py - cy) * 0.3);
        ctx.strokeStyle = `rgba(0,210,200,0.06)`;
        ctx.lineWidth = 0.5; ctx.stroke();
      });

      id = requestAnimationFrame(draw);
    };
    id = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: 340 }}>
      <canvas ref={ref} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        {[
          { label: "You (Sun)", color: CYAN },
          { label: "Job Match (Planet)", color: "#7b61ff" },
          { label: "Orbit = Distance to match", color: "rgba(255,255,255,0.3)" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Analytics() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const TABS = ["overview", "skills", "reach", "applications"];

  const profileViews   = [12, 19, 15, 28, 22, 35, 47, 38, 52, 61, 48, 70, 65, 83];
  const searchHits     = [5, 8, 6, 14, 11, 20, 28, 22, 31, 38, 29, 45, 40, 55];
  const applications   = [0, 1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7];

  const SKILLS = [
    { name: "React / Next.js",    pct: 94, demand: 98 },
    { name: "TypeScript",         pct: 87, demand: 91 },
    { name: "Node.js",            pct: 82, demand: 85 },
    { name: "PostgreSQL / SQL",   pct: 74, demand: 78 },
    { name: "Docker / DevOps",    pct: 65, demand: 82 },
    { name: "AWS / Cloud",        pct: 60, demand: 88 },
    { name: "Python",             pct: 55, demand: 75 },
    { name: "GraphQL",            pct: 50, demand: 62 },
  ];

  const JOB_MATCHES = [
    { company: "Instabug",  role: "Senior React Dev", score: 94, color: "#00d2c8" },
    { company: "Breadfast", role: "Frontend Eng",      score: 81, color: "#00a8ff" },
    { company: "Swvl",      role: "Full-Stack Eng",    score: 76, color: "#7b61ff" },
    { company: "Noon",      role: "React Native Dev",  score: 68, color: "#ff6b6b" },
    { company: "Fawry",     role: "FullStack Eng",     score: 61, color: "#ffd166" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Barlow',sans-serif" }}>
      <style>{`
        @import url('https:
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,210,200,0.3); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        .fu { animation: fadeUp 0.45s ease forwards; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 150 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
            borderRadius: "50%", background: "#fff",
            opacity: Math.random() * 0.5 + 0.1,
            animation: `pulse ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }} />
        ))}
      </div>

      {}
      <nav style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(3,11,18,0.96)", borderBottom: "1px solid rgba(0,210,200,0.1)", backdropFilter: "blur(16px)" }}>
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.45),transparent)" }} />
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>
              <span style={{ color: "#fff" }}>TALENT</span><span style={{ color: CYAN }}>FLOW</span>
            </button>
            <div style={{ height: 20, width: 1, background: "rgba(0,210,200,0.2)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: CYAN }}>Analytics Command Center</span>
          </div>
          <button onClick={() => navigate("/dashboard")} style={{ border: "1px solid rgba(0,210,200,0.25)", color: CYAN, background: "transparent", padding: "6px 18px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
            ← Dashboard
          </button>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "0 auto", padding: "28px 20px" }}>

        {}
        <div className="fu" style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: CYAN, marginBottom: 8 }}>· CAREER INTELLIGENCE ·</p>
          <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 42, color: "#fff", letterSpacing: 1, lineHeight: 1, margin: 0 }}>
            YOUR ANALYTICS<br /><span style={{ color: CYAN }}>UNIVERSE.</span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 10, maxWidth: 500 }}>
            Your profile orbits the job market like a star. See exactly how bright you shine.
          </p>
        </div>

        {}
        <div className="fu" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Profile Score",      value: "87",   unit: "/100", delta: "+5",  note: "Resume strength" },
            { label: "Top Job Match",       value: "94",   unit: "%",    delta: "+2",  note: "Instabug · React Dev" },
            { label: "Profile Views",       value: "83",   unit: "/ wk", delta: "+26%",note: "Past 7 days" },
            { label: "Avg Match Score",     value: "76",   unit: "%",    delta: "+8",  note: "Across 5 roles" },
          ].map(s => (
            <Card key={s.label} style={{ padding: 20 }}>
              <Label>{s.label}</Label>
              <BigNum value={s.value} sub={s.unit} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 7px", borderRadius: 2 }}>▲ {s.delta}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{s.note}</span>
              </div>
            </Card>
          ))}
        </div>

        {}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid rgba(0,210,200,0.1)" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "10px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", color: activeTab === tab ? CYAN : "rgba(255,255,255,0.3)", borderBottom: activeTab === tab ? `2px solid ${CYAN}` : "2px solid transparent", transition: "color 0.2s", marginBottom: -1 }}>
              {tab}
            </button>
          ))}
        </div>

        {}
        {activeTab === "overview" && (
          <div className="fu">
            {}
            <Card style={{ marginBottom: 20, padding: "24px 24px 12px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                  <Label>Job Match Solar System</Label>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: -10, marginBottom: 12 }}>
                    You are the sun. Jobs orbit by match distance — closer = better match.
                  </p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", color: CYAN, border: "1px solid rgba(0,210,200,0.2)", padding: "4px 10px" }}>LIVE</span>
              </div>
              <SolarSystem />
            </Card>

            {}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

              {}
              <Card style={{ padding: 24 }}>
                <Label>Resume Strength</Label>
                <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 12 }}>
                  {[
                    { label: "Overall", pct: 87, color: CYAN },
                    { label: "Keywords", pct: 91, color: "#00a8ff" },
                    { label: "Format", pct: 78, color: "#7b61ff" },
                  ].map(r => <Ring key={r.label} pct={r.pct} size={90} label={r.label} color={r.color} />)}
                </div>
              </Card>

              {}
              <Card style={{ padding: 24 }}>
                <Label>Profile Views — 14 days</Label>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 36, color: CYAN }}>83</span>
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>▲ 26% vs last week</span>
                </div>
                <Spark data={profileViews} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>14d ago</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Today</span>
                </div>
              </Card>

              {}
              <Card style={{ padding: 24 }}>
                <Label>Search Appearances — 14 days</Label>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 36, color: "#00a8ff" }}>55</span>
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>▲ 37% vs last week</span>
                </div>
                <Spark data={searchHits} color="#00a8ff" />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>14d ago</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Today</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {}
        {activeTab === "skills" && (
          <div className="fu" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {}
            <Card style={{ padding: 24 }}>
              <Label>Your Skill Level vs Market Demand</Label>
              {SKILLS.map((s, i) => (
                <div key={s.name} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{s.name}</span>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 11, color: CYAN }}>You {s.pct}%</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Market {s.demand}%</span>
                    </div>
                  </div>
                  {}
                  <div style={{ height: 4, background: "rgba(0,210,200,0.1)", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
                    <BarAnim pct={s.pct} color={CYAN} delay={i * 80} />
                  </div>
                  {}
                  <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                    <BarAnim pct={s.demand} color="rgba(255,255,255,0.2)" delay={i * 80 + 40} />
                  </div>
                </div>
              ))}
            </Card>

            {}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card style={{ padding: 24 }}>
                <Label>Skill Gap to Dream Jobs</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { skill: "Docker / K8s", gap: 17, priority: "HIGH" },
                    { skill: "AWS Certification", gap: 28, priority: "HIGH" },
                    { skill: "Testing (Jest/Cypress)", gap: 22, priority: "MED" },
                    { skill: "System Design", gap: 15, priority: "MED" },
                    { skill: "GraphQL Advanced", gap: 12, priority: "LOW" },
                  ].map(g => (
                    <div key={g.skill} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(0,210,200,0.04)", border: "1px solid rgba(0,210,200,0.08)" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{g.skill}</p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", padding: "3px 8px", border: `1px solid ${g.priority === "HIGH" ? "#ff6b6b" : g.priority === "MED" ? "#ffd166" : "rgba(0,210,200,0.4)"}`, color: g.priority === "HIGH" ? "#ff6b6b" : g.priority === "MED" ? "#ffd166" : CYAN }}>{g.priority}</span>
                      <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 18, color: "#ff6b6b", minWidth: 36, textAlign: "right" }}>-{g.gap}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{ padding: 24 }}>
                <Label>Skill Rarity Score</Label>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: -10, marginBottom: 16 }}>How rare your skill combo is in the market</p>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <Ring pct={73} size={100} label="Rarity" color="#7b61ff" />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>Your React + TypeScript + Node.js stack puts you in the <span style={{ color: CYAN, fontWeight: 700 }}>top 27%</span> of candidates in Cairo.</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>Add Docker to reach top 12%</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {}
        {activeTab === "reach" && (
          <div className="fu" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {}
              <Card style={{ padding: 24 }}>
                <Label>Weekly Profile Views (Past 8 weeks)</Label>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginTop: 8 }}>
                  {[28, 35, 22, 41, 38, 52, 61, 83].map((v, i) => {
                    const maxV = 83;
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10, color: CYAN, fontWeight: 700 }}>{v}</span>
                        <div style={{ width: "100%", background: `linear-gradient(180deg,${CYAN},#004455)`, height: `${(v / maxV) * 90}px`, borderRadius: "2px 2px 0 0", opacity: 0.7 + (i / 7) * 0.3, transition: "height 0.8s ease" }} />
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>W{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {}
              <Card style={{ padding: 24 }}>
                <Label>Who Viewed Your Profile</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { role: "Engineering Manager",    company: "Instabug",  time: "2h ago",  color: CYAN },
                    { role: "Technical Recruiter",    company: "Breadfast", time: "5h ago",  color: "#00a8ff" },
                    { role: "CTO",                    company: "Startup",   time: "1d ago",  color: "#7b61ff" },
                    { role: "Senior Developer",       company: "Swvl",      time: "2d ago",  color: "#ffd166" },
                    { role: "HR Specialist",          company: "Noon",      time: "3d ago",  color: "#ff6b6b" },
                  ].map((v, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "rgba(0,210,200,0.03)", border: "1px solid rgba(0,210,200,0.07)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${v.color}44,${v.color}22)`, border: `1px solid ${v.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{v.role}</p>
                        <p style={{ fontSize: 11, color: v.color }}>{v.company}</p>
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{v.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {}
              <Card style={{ padding: 24 }}>
                <Label>Viewer Breakdown</Label>
                {[
                  { type: "Recruiters",  pct: 42, color: CYAN },
                  { type: "Managers",    pct: 28, color: "#00a8ff" },
                  { type: "Developers",  pct: 18, color: "#7b61ff" },
                  { type: "CTOs/VPs",    pct: 12, color: "#ffd166" },
                ].map((v, i) => <HBar key={v.type} label={v.type} pct={v.pct} color={v.color} delay={i * 100} />)}
              </Card>

              {}
              <Card style={{ padding: 24 }}>
                <Label>Traffic Sources</Label>
                {[
                  { src: "Direct search",  pct: 55, color: CYAN },
                  { src: "Post reactions", pct: 25, color: "#00a8ff" },
                  { src: "Connection net", pct: 14, color: "#7b61ff" },
                  { src: "External links", pct: 6,  color: "#ffd166" },
                ].map((s, i) => <HBar key={s.src} label={s.src} pct={s.pct} color={s.color} delay={i * 100} />)}
              </Card>

              {}
              <Card style={{ padding: 24 }}>
                <Label>Viewer Locations</Label>
                {[
                  { city: "Cairo, Egypt",     pct: 68 },
                  { city: "Dubai, UAE",        pct: 18 },
                  { city: "Riyadh, KSA",       pct: 9  },
                  { city: "London, UK",        pct: 5  },
                ].map((g, i) => <HBar key={g.city} label={g.city} pct={g.pct} delay={i * 80} />)}
              </Card>
            </div>
          </div>
        )}

        {}
        {activeTab === "applications" && (
          <div className="fu" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {}
            <Card style={{ padding: 24 }}>
              <Label>Application Funnel</Label>
              {[
                { stage: "Jobs Applied",       count: 12, pct: 100, color: CYAN },
                { stage: "Profile Viewed",     count: 9,  pct: 75,  color: "#00a8ff" },
                { stage: "Resume Reviewed",    count: 6,  pct: 50,  color: "#7b61ff" },
                { stage: "Interview Invited",  count: 3,  pct: 25,  color: "#ffd166" },
                { stage: "Offer Received",     count: 1,  pct: 8,   color: "#22c55e" },
              ].map((f, i) => (
                <div key={f.stage} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{f.stage}</span>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 18, color: f.color }}>{f.count}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>{f.pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                    <BarAnim pct={f.pct} color={f.color} delay={i * 120} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(0,210,200,0.06)", border: "1px solid rgba(0,210,200,0.15)" }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Conversion rate: <span style={{ color: CYAN, fontWeight: 700 }}>8.3%</span> — Above average for your level</p>
              </div>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {}
              <Card style={{ padding: 24 }}>
                <Label>Job Match Scores</Label>
                {JOB_MATCHES.map((j, i) => (
                  <div key={j.company} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: i < JOB_MATCHES.length - 1 ? 14 : 0 }}>
                    <div style={{ width: 4, height: 40, background: j.color, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>{j.role}</p>
                      <p style={{ fontSize: 11, color: j.color, fontWeight: 600 }}>{j.company}</p>
                    </div>
                    <Ring pct={j.score} size={52} color={j.color} />
                  </div>
                ))}
              </Card>

              {}
              <Card style={{ padding: 24 }}>
                <Label>Application Activity (14 days)</Label>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 32, color: CYAN }}>7</span>
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>▲ 40% vs last 2 weeks</span>
                </div>
                <Spark data={applications} color="#22c55e" height={50} />
              </Card>

              {}
              <Card style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>🤖</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: CYAN, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>AI Recommendation</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
                      Adding Docker & AWS to your profile could boost your match score with <span style={{ color: CYAN }}>Swvl</span> and <span style={{ color: CYAN }}>Noon</span> by <strong style={{ color: "#22c55e" }}>+18%</strong>.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BarAnim({ pct, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay + 200); return () => clearTimeout(t); }, [pct, delay]);
  return <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: "inherit", transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />;
}