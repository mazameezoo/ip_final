import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { applicationsApi } from "../utils/api";

const CYAN = "#00d2c8";
const BG = "#030b12";

const Particles = ({ count = 60 }) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let id;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.5,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,210,200,0.5)"; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(0,210,200,${0.08 * (1 - d / 110)})`; ctx.lineWidth = 0.6; ctx.stroke(); }
      }));
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
};

const ScoreRing = ({ pct, size = 160, color = CYAN, label }) => {
  const [cur, setCur] = useState(0);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  useEffect(() => {
    let frame, start = null, dur = 1800;
    const animate = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setCur(Math.round(ease * pct));
      if (prog < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [pct]);
  const offset = circ - (cur / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,210,200,0.08)" strokeWidth={10} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.05s linear", filter: `drop-shadow(0 0 8px ${color}88)` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: size * 0.22, color, lineHeight: 1 }}>{cur}%</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginTop: 2 }}>MATCH</span>
        </div>
      </div>
      {label && <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "2px", textTransform: "uppercase" }}>{label}</p>}
    </div>
  );
};

const AILoader = ({ job, onDone }) => {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");

  const steps = [
    "Scanning resume keywords…",
    "Matching skills to job requirements…",
    "Analysing experience alignment…",
    "Checking education fit…",
    "Computing culture compatibility…",
    "Generating interview readiness score…",
    "Finalising match report…",
  ];

  useEffect(() => {
    const dotInt = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(dotInt);
  }, []);

  useEffect(() => {
    if (step < steps.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 600 + Math.random() * 400);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
  }, [step]);

  const progress = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>
      <Particles count={40} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 520, padding: "0 24px" }}>
        {}
        <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 32px" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: `1px solid rgba(0,210,200,${0.4 / i})`,
              animation: `ping${i} ${1.2 + i * 0.4}s ease-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,210,200,0.08)", borderRadius: "50%", border: `2px solid rgba(0,210,200,0.4)` }}>
            <span style={{ fontSize: 44 }}>🤖</span>
          </div>
        </div>

        <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "4px", textTransform: "uppercase", color: CYAN, marginBottom: 10 }}>AI Analysis Engine</p>
        <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 28, color: "#fff", margin: "0 0 8px", letterSpacing: 1 }}>
          Analysing your fit for
        </h2>
        <p style={{ fontSize: 18, color: CYAN, fontWeight: 700, marginBottom: 32 }}>{job.role} @ {job.company}</p>

        {}
        <div style={{ textAlign: "left", marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, opacity: i <= step ? 1 : 0.2, transition: "opacity 0.4s" }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>
                {i < step ? "✅" : i === step ? "⚡" : "○"}
              </span>
              <span style={{ fontSize: 13, color: i < step ? "rgba(255,255,255,0.6)" : i === step ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: i === step ? 600 : 400 }}>
                {i === step ? s.replace("…", dots) : s}
              </span>
            </div>
          ))}
        </div>

        {}
        <div style={{ height: 3, background: "rgba(0,210,200,0.1)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg,${CYAN},#0077aa)`, transition: "width 0.5s ease", borderRadius: 2, boxShadow: `0 0 12px ${CYAN}88` }} />
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8, letterSpacing: 1 }}>{progress}% complete</p>
      </div>

      <style>{`
        @keyframes ping1 { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        @keyframes ping2 { 0%{transform:scale(1);opacity:0.4} 100%{transform:scale(2.2);opacity:0} }
        @keyframes ping3 { 0%{transform:scale(1);opacity:0.2} 100%{transform:scale(2.6);opacity:0} }
      `}</style>
    </div>
  );
};

const ABar = ({ pct, color = CYAN, delay = 0 }) => {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height: 5, background: "rgba(0,210,200,0.08)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: `linear-gradient(90deg,${color},${color}88)`, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)", borderRadius: 3 }} />
    </div>
  );
};

const PHASES = [
  { id: "applied",   label: "Applied",           icon: "📤", desc: "Application submitted successfully" },
  { id: "reviewing", label: "Under Review",       icon: "🔍", desc: "Recruiter is reviewing your profile" },
  { id: "shortlist", label: "Shortlisted",        icon: "⭐", desc: "You've been shortlisted for interview" },
  { id: "interview", label: "Technical Interview",icon: "💻", desc: "Schedule & complete your tech interview" },
  { id: "offer",     label: "Offer",              icon: "🎉", desc: "Offer letter sent — ready to join!" },
];

export default function Apply() {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job || { role: "Senior React Developer", company: "Instabug", location: "Cairo, Egypt", type: "Remote", match: 94 };

  const [phase, setPhase] = useState("loading"); 
  const [activePhase, setActivePhase] = useState("applied");
  const [apiError, setApiError] = useState(null);

  // Submit the real application to the backend the moment this page mounts.
  // The AILoader animation runs in parallel and masks the network round-trip.
  useEffect(() => {
    // If we don't have a real MongoDB job id (e.g. user landed here without going through Dashboard),
    // skip the API call and just play the demo animation.
    const jobId = job?._id || job?.id;
    if (!jobId || typeof jobId !== "string" || jobId.length !== 24) return;

    let cancelled = false;
    const submitApplication = async () => {
      try {
        await applicationsApi.apply({
          jobId,
          coverLetter: `I am very interested in the ${job.role || job.title} position at ${job.company}.`,
        });
      } catch (err) {
        if (!cancelled) {
          // Surface the error but don't break the UI — the AILoader will still complete
          // and we'll show the message on the results screen.
          setApiError(err.message);
        }
      }
    };
    submitApplication();
    return () => { cancelled = true; };
  }, []);

  const matchData = {
    overall: job.match || 87,
    skills:  Math.min(99, (job.match || 87) + 5),
    exp:     Math.max(50, (job.match || 87) - 8),
    culture: Math.max(60, (job.match || 87) - 3),
  };

  const SKILL_MATCH = [
    { skill: "React / Next.js",  yours: 94, required: 90, met: true },
    { skill: "TypeScript",       yours: 87, required: 80, met: true },
    { skill: "Node.js",          yours: 82, required: 75, met: true },
    { skill: "System Design",    yours: 65, required: 80, met: false },
    { skill: "Docker / K8s",     yours: 65, required: 70, met: false },
    { skill: "AWS / Cloud",      yours: 60, required: 65, met: false },
  ];

  const phaseIndex = PHASES.findIndex(p => p.id === activePhase);

  return (
    <>
      {phase === "loading" && <AILoader job={job} onDone={() => setPhase("results")} />}

      {phase === "results" && (
        <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Barlow',sans-serif" }}>
          <style>{`
            @import url('https:
            * { box-sizing: border-box; }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-thumb { background: rgba(0,210,200,0.3); }
            @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
            .fu { animation: fadeUp 0.45s ease forwards; }
            @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,210,200,0.2)} 50%{box-shadow:0 0 40px rgba(0,210,200,0.5)} }
          `}</style>
          <Particles />

          {}
          <nav style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(3,11,18,0.96)", borderBottom: "1px solid rgba(0,210,200,0.1)", backdropFilter: "blur(16px)" }}>
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.45),transparent)" }} />
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56 }}>
              <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>
                <span style={{ color: "#fff" }}>TALENT</span><span style={{ color: CYAN }}>FLOW</span>
              </button>
              <button onClick={() => navigate("/dashboard")} style={{ border: "1px solid rgba(0,210,200,0.25)", color: CYAN, background: "transparent", padding: "6px 18px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                ← Back
              </button>
            </div>
          </nav>

          <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 20px 60px" }}>

            {apiError && (
              <div style={{ background: "rgba(255,85,85,0.08)", border: "1px solid rgba(255,85,85,0.3)", padding: "12px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <p style={{ color: "#ff5555", fontSize: 13, fontWeight: 600, letterSpacing: "0.5px", margin: 0 }}>
                  {apiError === "You have already applied to this job"
                    ? "You've already applied to this job. Showing your match analysis below."
                    : `Could not submit application: ${apiError}`}
                </p>
              </div>
            )}

            {}
            <div className="fu" style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: CYAN, marginBottom: 8 }}>· APPLICATION SUBMITTED ·</p>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 38, color: "#fff", margin: 0, letterSpacing: 1 }}>{job.role}</h1>
                  <p style={{ fontSize: 16, color: CYAN, fontWeight: 700, marginTop: 4 }}>{job.company} · {job.location} · <span style={{ border: "1px solid rgba(0,210,200,0.3)", padding: "2px 8px", fontSize: 11 }}>{job.type}</span></p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#22c55e", padding: "8px 18px", fontSize: 12, fontWeight: 700, letterSpacing: "2px" }}>✓ Applied</span>
                  <button onClick={() => navigate("/interview", { state: { job } })}
                    style={{ background: CYAN, color: "#000", border: "none", padding: "8px 22px", fontSize: 11, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", animation: "glow 2s ease-in-out infinite" }}>
                    🎙 Start Interview →
                  </button>
                </div>
              </div>
            </div>

            {}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>

              {}
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {}
                <div className="fu" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                  {[
                    { label: "Overall Match", pct: matchData.overall, color: CYAN },
                    { label: "Skills Match",  pct: matchData.skills,  color: "#00a8ff" },
                    { label: "Experience",    pct: matchData.exp,     color: "#7b61ff" },
                    { label: "Culture Fit",   pct: matchData.culture, color: "#ffd166" },
                  ].map(m => (
                    <div key={m.label} style={{ background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)", borderRadius: 3, padding: "20px 16px", textAlign: "center", backdropFilter: "blur(14px)", position: "relative" }}>
                      <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: `linear-gradient(90deg,transparent,${m.color}66,transparent)` }} />
                      <ScoreRing pct={m.pct} size={100} color={m.color} />
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 8 }}>{m.label}</p>
                    </div>
                  ))}
                </div>

                {}
                <div className="fu" style={{ background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)", borderRadius: 3, padding: 24, backdropFilter: "blur(14px)", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.4),transparent)" }} />
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>Skill-by-Skill Analysis</p>
                  {SKILL_MATCH.map((s, i) => (
                    <div key={s.skill} style={{ marginBottom: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14 }}>{s.met ? "✅" : "⚠️"}</span>
                          <span style={{ fontSize: 13, color: s.met ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.5)", fontWeight: 600 }}>{s.skill}</span>
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                          <span style={{ color: CYAN }}>You: {s.yours}%</span>
                          <span style={{ color: "rgba(255,255,255,0.3)" }}>Required: {s.required}%</span>
                        </div>
                      </div>
                      {}
                      <ABar pct={s.yours} color={s.met ? CYAN : "#ffd166"} delay={i * 100 + 200} />
                      {}
                      <div style={{ position: "relative", height: 0 }}>
                        <div style={{ position: "absolute", left: `${s.required}%`, top: -5, width: 2, height: 5, background: "rgba(255,255,255,0.3)", transform: "translateX(-50%)" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(0,210,200,0.05)", border: "1px solid rgba(0,210,200,0.12)" }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                      ✅ <span style={{ color: "#22c55e", fontWeight: 700 }}>{SKILL_MATCH.filter(s => s.met).length} skills met</span> &nbsp;·&nbsp;
                      ⚠️ <span style={{ color: "#ffd166", fontWeight: 700 }}>{SKILL_MATCH.filter(s => !s.met).length} gaps to close</span>
                    </p>
                  </div>
                </div>

                {}
                <div className="fu" style={{ background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)", borderRadius: 3, padding: 24, backdropFilter: "blur(14px)", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.4),transparent)" }} />
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>🤖 AI Recommendations</p>
                  {[
                    { icon: "🚀", tip: `Strong match on core React + TypeScript skills — lead with these in your interview.` },
                    { icon: "📚", tip: `Brush up on Docker & K8s basics. Expect 1–2 questions on containerisation.` },
                    { icon: "🏗️", tip: `Prepare a System Design example — design a real-time notification service.` },
                    { icon: "💬", tip: `Research Instabug's SDK product. Mentioning it shows genuine interest.` },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, padding: "12px 14px", background: "rgba(0,210,200,0.04)", border: "1px solid rgba(0,210,200,0.08)" }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{r.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="fu" style={{ background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)", borderRadius: 3, padding: 24, backdropFilter: "blur(14px)", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.4),transparent)" }} />
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Application Timeline</p>

                  {PHASES.map((p, i) => {
                    const isActive  = p.id === activePhase;
                    const isDone    = i < phaseIndex;
                    const isLocked  = i > phaseIndex;
                    const isIntv    = p.id === "interview";
                    return (
                      <div key={p.id} style={{ display: "flex", gap: 14, marginBottom: i < PHASES.length - 1 ? 0 : 0 }}>
                        {}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                            background: isDone ? "rgba(34,197,94,0.15)" : isActive ? `rgba(0,210,200,0.15)` : "rgba(255,255,255,0.04)",
                            border: isDone ? "1.5px solid #22c55e" : isActive ? `1.5px solid ${CYAN}` : "1.5px solid rgba(255,255,255,0.08)",
                            boxShadow: isActive ? `0 0 16px rgba(0,210,200,0.3)` : "none",
                            animation: isActive ? "glow 2s ease-in-out infinite" : "none",
                          }}>
                            {isDone ? "✓" : p.icon}
                          </div>
                          {i < PHASES.length - 1 && (
                            <div style={{ flex: 1, width: 2, background: isDone ? "rgba(34,197,94,0.4)" : "rgba(0,210,200,0.1)", minHeight: 24, margin: "4px 0" }} />
                          )}
                        </div>
                        {}
                        <div style={{ paddingTop: 6, paddingBottom: i < PHASES.length - 1 ? 20 : 0 }}>
                          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: isActive ? 900 : 700, fontSize: 15, color: isDone ? "#22c55e" : isActive ? "#fff" : "rgba(255,255,255,0.35)", letterSpacing: 0.5, margin: 0 }}>{p.label}</p>
                          <p style={{ fontSize: 12, color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", marginTop: 3 }}>{p.desc}</p>
                          {isIntv && isActive && (
                            <button onClick={() => navigate("/interview", { state: { job } })}
                              style={{ marginTop: 10, background: CYAN, color: "#000", border: "none", padding: "7px 16px", fontSize: 10, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                              🎙 Enter Interview Room →
                            </button>
                          )}
                          {isActive && p.id !== "interview" && (
                            <button onClick={() => {
                              const idx = PHASES.findIndex(ph => ph.id === activePhase);
                              if (idx < PHASES.length - 1) setActivePhase(PHASES[idx + 1].id);
                            }} style={{ marginTop: 8, background: "transparent", border: `1px solid rgba(0,210,200,0.3)`, color: CYAN, padding: "5px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                              Advance Stage →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {}
                <div className="fu" style={{ background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)", borderRadius: 3, padding: 22, backdropFilter: "blur(14px)", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.4),transparent)" }} />
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>Job Details</p>
                  {[
                    ["Role",       job.role],
                    ["Company",    job.company],
                    ["Location",   job.location],
                    ["Work Type",  job.type],
                    ["Applied",    "Just now"],
                    ["Response",   "Within 5 business days"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(0,210,200,0.06)" }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{k}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, textAlign: "right", maxWidth: 180 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}