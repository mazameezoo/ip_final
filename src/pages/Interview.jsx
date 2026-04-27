import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const CYAN = "#00d2c8";
const BG = "#030b12";
const FONTS_URL = "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;600;700&family=Rajdhani:wght@700;900&family=Fira+Code&display=swap";

const QUESTIONS = [
  { id: 1, q: "Explain the difference between `useEffect` and `useLayoutEffect` in React. When would you use each?", topic: "React Hooks", difficulty: "Medium" },
  { id: 2, q: "How does the JavaScript event loop work? Explain microtasks vs macrotasks.", topic: "JS Internals", difficulty: "Hard" },
  { id: 3, q: "Design a rate limiter for an API that allows 100 requests per user per minute.", topic: "System Design", difficulty: "Hard" },
  { id: 4, q: "What is the difference between `null`, `undefined`, and `NaN` in JavaScript?", topic: "JavaScript", difficulty: "Easy" },
  { id: 5, q: "Implement a debounce function from scratch in TypeScript.", topic: "Coding", difficulty: "Medium" },
];

const STARTER_CODE = {
  1: "",
  5: "",
};

const AI_RESPONSES = [
  "Good thinking! Can you elaborate on the time complexity?",
  "Interesting approach. How would you handle edge cases?",
  "That's correct. What would you improve if you had more time?",
  "Good explanation. Let's move to the next part.",
  "Nice! Can you write the code for that?",
];

const SCORE_CARDS = (score) => [
  { label: "Overall Score",   val: score.overall,        color: CYAN },
  { label: "Technical Depth", val: score.technical,      color: "#00a8ff" },
  { label: "Communication",   val: score.communication,  color: "#22c55e" },
  { label: "Problem Solving", val: score.problemSolving, color: "#7b61ff" },
];

const TABS = [
  { id: "code",       label: "💻 Code Editor" },
  { id: "whiteboard", label: "🖊 Whiteboard" },
  { id: "notes",      label: "📝 Notes" },
];

const WB_COLORS = [CYAN, "#fff", "#ff6b6b", "#ffd166", "#22c55e", "#7b61ff"];
const WB_SIZES = [2, 4, 8];

const diffColor = (d) => d === "Easy" ? "#22c55e" : d === "Medium" ? "#ffd166" : "#ff6b6b";

const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const useTimer = (running) => {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
};

const CamTile = ({ label, initials, active, muted, cameraOn }) => (
  <div style={{ position: "relative", background: "rgba(5,15,26,0.9)", border: `1px solid ${active ? CYAN : "rgba(0,210,200,0.15)"}`, borderRadius: 4, overflow: "hidden", aspectRatio: "16/9", boxShadow: active ? `0 0 20px rgba(0,210,200,0.2)` : "none" }}>
    {cameraOn
      ? <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#001a2f,#003344)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${CYAN},#0077aa)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 20, color: "#fff" }}>{initials}</div>
        </div>
      : <div style={{ width: "100%", height: "100%", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 28, opacity: 0.3 }}>📷</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Camera off</span>
        </div>
    }
    <div style={{ position: "absolute", bottom: 8, left: 8, display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "#fff", background: "rgba(0,0,0,0.6)", padding: "3px 8px", backdropFilter: "blur(4px)" }}>{label}</span>
      {muted && <span style={{ fontSize: 10, background: "rgba(255,50,50,0.8)", padding: "2px 6px", color: "#fff" }}>🔇</span>}
      {active && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s ease-in-out infinite" }} />}
    </div>
  </div>
);

const Msg = ({ from, text, time, isMe }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", marginBottom: 12 }}>
    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 4, letterSpacing: 1 }}>{from} · {time}</span>
    <div style={{ maxWidth: "85%", padding: "9px 14px", background: isMe ? `rgba(0,210,200,0.15)` : "rgba(255,255,255,0.06)", border: `1px solid ${isMe ? "rgba(0,210,200,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px" }}>
      <p style={{ fontSize: 13, color: isMe ? CYAN : "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.6 }}>{text}</p>
    </div>
  </div>
);

function WhiteboardCanvas() {
  const ref = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState(CYAN);
  const [size, setSize] = useState(3);
  const [tool, setTool] = useState("pen");

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const resize = () => { const d = c.parentElement; c.width = d.offsetWidth; c.height = d.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getPos = (e) => {
    const r = ref.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const startDraw = (e) => { drawing.current = true; lastPos.current = getPos(e); };
  const stopDraw  = () => { drawing.current = false; };
  const draw = (e) => {
    if (!drawing.current) return;
    const ctx = ref.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? BG : color;
    ctx.lineWidth = tool === "eraser" ? 20 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const clearBoard = () => {
    const ctx = ref.current?.getContext("2d");
    ctx?.clearRect(0, 0, ref.current.width, ref.current.height);
  };

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#070d14" }}>
      <canvas ref={ref} onMouseDown={startDraw} onMouseUp={stopDraw} onMouseMove={draw} onMouseLeave={stopDraw}
        style={{ position: "absolute", inset: 0, cursor: tool === "eraser" ? "cell" : "crosshair" }} />
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8, background: "rgba(3,11,18,0.9)", border: "1px solid rgba(0,210,200,0.2)", padding: 8, borderRadius: 4, backdropFilter: "blur(8px)", flexWrap: "wrap", maxWidth: 280 }}>
        {WB_COLORS.map(c => (
          <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
            style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: color === c && tool === "pen" ? "2px solid #fff" : "2px solid transparent", cursor: "pointer" }} />
        ))}
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
        {WB_SIZES.map(s => (
          <button key={s} onClick={() => setSize(s)} style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", background: size === s ? "rgba(0,210,200,0.2)" : "transparent", border: `1px solid ${size === s ? CYAN : "transparent"}`, cursor: "pointer", borderRadius: 2 }}>
            <div style={{ width: s * 1.5, height: s * 1.5, borderRadius: "50%", background: "#fff" }} />
          </button>
        ))}
        <button onClick={() => setTool("eraser")} style={{ padding: "2px 8px", fontSize: 11, background: tool === "eraser" ? "rgba(0,210,200,0.2)" : "transparent", border: `1px solid ${tool === "eraser" ? CYAN : "rgba(255,255,255,0.15)"}`, color: "#fff", cursor: "pointer", borderRadius: 2 }}>⌫</button>
        <button onClick={clearBoard}
          style={{ padding: "2px 8px", fontSize: 11, background: "transparent", border: "1px solid rgba(255,50,50,0.3)", color: "#ff5555", cursor: "pointer", borderRadius: 2 }}>Clear</button>
      </div>
    </div>
  );
}

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job || { role: "Senior React Developer", company: "Instabug" };

  const [qIdx,      setQIdx]      = useState(0);
  const [code,      setCode]      = useState(STARTER_CODE[1] || "");
  const [chatMsg,   setChatMsg]   = useState("");
  const [messages,  setMessages]  = useState([
    { id: 1, from: "Interviewer (AI)", text: `Welcome! I'm your technical interviewer for the ${job.role} position at ${job.company}. We'll go through ${QUESTIONS.length} questions. Take your time and think out loud. Ready?`, time: "now", isMe: false },
  ]);
  const [micOn,     setMicOn]     = useState(true);
  const [camOn,     setCamOn]     = useState(true);
  const [screenOn,  setScreenOn]  = useState(false);
  const [handRaise, setHandRaise] = useState(false);
  const [tab,       setTab]       = useState("code");
  const [notes,     setNotes]     = useState("");
  const [running,   setRunning]   = useState(true);
  const [ended,     setEnded]     = useState(false);
  const [score,     setScore]     = useState(null);
  const [thinking,  setThinking]  = useState(false);
  const chatEndRef = useRef(null);

  const timer = useTimer(running && !ended);
  const q = QUESTIONS[qIdx];

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const now = nowTime();
    setMessages(m => [...m, { id: Date.now(), from: "You", text: chatMsg, time: now, isMe: true }]);
    setChatMsg("");

    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages(m => [...m, { id: Date.now() + 1, from: "Interviewer (AI)", text: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)], time: nowTime(), isMe: false }]);
    }, 1500 + Math.random() * 1000);
  };

  const nextQ = () => {
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(i => i + 1);
      setCode(STARTER_CODE[QUESTIONS[qIdx + 1]?.id] || "");
      setMessages(m => [...m, { id: Date.now(), from: "Interviewer (AI)", text: `Great! Moving to question ${qIdx + 2}: "${QUESTIONS[qIdx + 1].q}"`, time: nowTime(), isMe: false }]);
    } else {
      endInterview();
    }
  };

  const endInterview = () => {
    setRunning(false);
    setEnded(true);
    setScore({ overall: 82, technical: 78, communication: 88, problemSolving: 80 });
  };

  const jumpToQuestion = (i, id) => {
    setQIdx(i);
    setCode(STARTER_CODE[id] || "");
  };

  if (ended && score) return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Barlow',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('${FONTS_URL}');`}</style>
      <div style={{ maxWidth: 600, width: "100%", padding: "0 24px", textAlign: "center" }}>
        <span style={{ fontSize: 64, display: "block", marginBottom: 20 }}>🎉</span>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: CYAN, marginBottom: 10 }}>· INTERVIEW COMPLETE ·</p>
        <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 42, color: "#fff", margin: "0 0 8px" }}>Well Done!</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginBottom: 36 }}>Duration: {timer} · {QUESTIONS.length} questions answered</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
          {SCORE_CARDS(score).map(s => (
            <div key={s.label} style={{ background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)", borderRadius: 3, padding: "20px 16px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 36, color: s.color, margin: 0 }}>{s.val}%</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => navigate("/dashboard")} style={{ border: "1px solid rgba(0,210,200,0.25)", color: CYAN, background: "transparent", padding: "12px 28px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>← Dashboard</button>
          <button onClick={() => navigate("/analytics")} style={{ background: CYAN, color: "#000", border: "none", padding: "12px 28px", fontSize: 11, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>View Analytics →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100vh", background: BG, fontFamily: "'Barlow',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('${FONTS_URL}');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,210,200,0.3); }
        textarea { resize: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .thinking::after { content: "●●●"; animation: blink 1.2s ease-in-out infinite; letter-spacing: 3px; color: ${CYAN}; }
      `}</style>

      <div style={{ height: 50, background: "rgba(3,11,18,0.98)", borderBottom: "1px solid rgba(0,210,200,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, position: "relative", zIndex: 10 }}>
        <div style={{ position: "absolute", bottom: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.3),transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>
            <span style={{ color: "#fff" }}>TALENT</span><span style={{ color: CYAN }}>FLOW</span>
          </span>
          <div style={{ width: 1, height: 16, background: "rgba(0,210,200,0.2)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>INTERVIEW ROOM</span>
          <span style={{ fontSize: 10, background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.4)", color: "#ff5555", padding: "2px 8px", animation: "pulse 1.5s ease-in-out infinite" }}>● LIVE</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 20, color: CYAN, margin: 0, letterSpacing: 2 }}>{timer}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>{job.role}</p>
            <p style={{ fontSize: 11, color: CYAN, margin: 0 }}>{job.company}</p>
          </div>
          <button onClick={endInterview} style={{ background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.4)", color: "#ff5555", padding: "6px 16px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
            End Interview
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "260px 1fr 300px", overflow: "hidden" }}>

        <div style={{ borderRight: "1px solid rgba(0,210,200,0.1)", display: "flex", flexDirection: "column", gap: 0, overflow: "hidden" }}>

          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <CamTile label="You" initials="MM" active cameraOn={camOn} />
            <CamTile label="Interviewer (AI)" initials="AI" active={false} cameraOn muted={false} />
          </div>

          <div style={{ flex: 1, padding: "0 12px 12px", overflow: "auto" }}>
            <div style={{ background: "rgba(0,210,200,0.05)", border: "1px solid rgba(0,210,200,0.15)", borderRadius: 3, padding: 14 }}>
              <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: 10, gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", color: "rgba(255,255,255,0.3)" }}>Q{qIdx + 1}/{QUESTIONS.length}</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: diffColor(q.difficulty), border: `1px solid ${diffColor(q.difficulty)}44`, padding: "2px 7px" }}>{q.difficulty}</span>
                <span style={{ fontSize: 10, color: CYAN, fontWeight: 600 }}>{q.topic}</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, margin: 0 }}>{q.q}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={nextQ} style={{ flex: 1, background: CYAN, color: "#000", border: "none", padding: "7px", fontSize: 10, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                  {qIdx < QUESTIONS.length - 1 ? "Next Q →" : "Finish →"}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              {QUESTIONS.map((q2, i) => (
                <button key={q2.id} onClick={() => jumpToQuestion(i, q2.id)}
                  style={{ width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 4, background: i === qIdx ? "rgba(0,210,200,0.1)" : "transparent", border: `1px solid ${i === qIdx ? CYAN : "rgba(0,210,200,0.08)"}`, cursor: "pointer", borderRadius: 2 }}>
                  <span style={{ fontSize: 11, color: i < qIdx ? "#22c55e" : i === qIdx ? "#fff" : "rgba(255,255,255,0.35)", fontWeight: i === qIdx ? 700 : 400 }}>
                    {i < qIdx ? "✓ " : `${i + 1}. `}{q2.topic}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

          <div style={{ height: 42, borderBottom: "1px solid rgba(0,210,200,0.1)", display: "flex", alignItems: "center", paddingLeft: 16, gap: 4, flexShrink: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "6px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", background: "none", border: "none", cursor: "pointer", color: tab === t.id ? "#fff" : "rgba(255,255,255,0.3)", borderBottom: tab === t.id ? `2px solid ${CYAN}` : "2px solid transparent", marginBottom: -1, transition: "color 0.2s" }}>
                {t.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: 6, paddingRight: 16 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", padding: "4px 10px", border: "1px solid rgba(0,210,200,0.1)" }}>JS / TS</span>
              {screenOn && <span style={{ fontSize: 10, color: CYAN, padding: "4px 10px", border: `1px solid ${CYAN}44` }}>📺 Sharing</span>}
            </div>
          </div>

          {tab === "code" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "#0a0f18" }}>
                <div style={{ width: 40, background: "#070d14", borderRight: "1px solid rgba(0,210,200,0.08)", paddingTop: 12, overflowY: "hidden", flexShrink: 0 }}>
                  {code.split("\n").map((_, i) => (
                    <div key={i} style={{ height: 21, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, fontSize: 12, color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>{i + 1}</div>
                  ))}
                </div>
                <textarea value={code} onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#a8d8a8", fontFamily: "'Fira Code','Courier New',monospace", fontSize: 13, lineHeight: "21px", padding: "12px 16px", overflowY: "auto" }} />
              </div>
              <div style={{ height: 38, borderTop: "1px solid rgba(0,210,200,0.1)", display: "flex", alignItems: "center", paddingLeft: 16, gap: 12, flexShrink: 0, background: "#070d14" }}>
                <button style={{ background: CYAN, color: "#000", border: "none", padding: "4px 14px", fontSize: 10, fontWeight: 900, letterSpacing: "2px", cursor: "pointer" }}>▶ Run</button>
                <button style={{ background: "transparent", border: "1px solid rgba(0,210,200,0.2)", color: CYAN, padding: "4px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", cursor: "pointer" }}>Reset</button>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginLeft: 8 }}>{code.split("\n").length} lines · {code.length} chars</span>
              </div>
            </div>
          )}

          {tab === "whiteboard" && <WhiteboardCanvas />}

          {tab === "notes" && (
            <div style={{ flex: 1, padding: 16, overflow: "hidden" }}>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Write your notes, scratch pad, ideas…"
                style={{ width: "100%", height: "100%", background: "rgba(5,15,26,0.5)", border: "1px solid rgba(0,210,200,0.1)", color: "rgba(255,255,255,0.8)", fontFamily: "inherit", fontSize: 14, lineHeight: 1.8, padding: 16, outline: "none" }} />
            </div>
          )}
        </div>

        <div style={{ borderLeft: "1px solid rgba(0,210,200,0.1)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(0,210,200,0.1)", flexShrink: 0 }}>
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: 0 }}>Interview Chat</p>
          </div>

          <div style={{ flex: 1, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {messages.map(m => <Msg key={m.id} {...m} />)}
            {thinking && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>Interviewer (AI)</span>
                <div style={{ padding: "9px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px 12px 12px 2px" }}>
                  <span className="thinking" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Thinking </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: 12, borderTop: "1px solid rgba(0,210,200,0.1)", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Message interviewer…"
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,200,0.18)", padding: "8px 12px", fontSize: 12, color: "#fff", outline: "none", fontFamily: "inherit" }} />
              <button onClick={sendChat} style={{ background: CYAN, color: "#000", border: "none", padding: "8px 14px", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>→</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 64, background: "rgba(3,11,18,0.98)", borderTop: "1px solid rgba(0,210,200,0.1)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexShrink: 0, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.2),transparent)" }} />

        {[
          { icon: micOn    ? "🎙" : "🔇", label: micOn    ? "Mute"     : "Unmute",    action: () => setMicOn(v => !v),    active: micOn,    danger: !micOn },
          { icon: camOn    ? "📷" : "📷", label: camOn    ? "Stop Cam" : "Start Cam", action: () => setCamOn(v => !v),    active: camOn,    danger: !camOn },
          { icon: "🖥",                   label: screenOn ? "Stop Share":"Share Screen",action: () => setScreenOn(v => !v), active: screenOn, danger: false  },
          { icon: "✋",                   label: handRaise ? "Lower Hand":"Raise Hand", action: () => setHandRaise(v => !v),active: handRaise,danger: false  },
          { icon: "📝",                   label: "Notes",                               action: () => setTab("notes"),      active: tab === "notes", danger: false },
          { icon: "💻",                   label: "Code",                                action: () => setTab("code"),       active: tab === "code",  danger: false },
          { icon: "🖊",                   label: "Board",                               action: () => setTab("whiteboard"), active: tab === "whiteboard", danger: false },
        ].map(ctrl => (
          <button key={ctrl.label} onClick={ctrl.action}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 14px", background: ctrl.danger ? "rgba(255,50,50,0.1)" : ctrl.active ? "rgba(0,210,200,0.12)" : "transparent", border: `1px solid ${ctrl.danger ? "rgba(255,50,50,0.3)" : ctrl.active ? `rgba(0,210,200,0.35)` : "rgba(255,255,255,0.08)"}`, cursor: "pointer", borderRadius: 4, transition: "all 0.2s", minWidth: 64 }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,210,200,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = ctrl.danger ? "rgba(255,50,50,0.1)" : ctrl.active ? "rgba(0,210,200,0.12)" : "transparent"}>
            <span style={{ fontSize: 20 }}>{ctrl.icon}</span>
            <span style={{ fontSize: 9, color: ctrl.danger ? "#ff5555" : ctrl.active ? CYAN : "rgba(255,255,255,0.4)", letterSpacing: "1px", fontWeight: 700, whiteSpace: "nowrap" }}>{ctrl.label}</span>
          </button>
        ))}

        <div style={{ width: 1, height: 32, background: "rgba(0,210,200,0.15)", margin: "0 4px" }} />

        <button onClick={endInterview}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 18px", background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.4)", cursor: "pointer", borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,50,50,0.3)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,50,50,0.15)"}>
          <span style={{ fontSize: 20 }}>📵</span>
          <span style={{ fontSize: 9, color: "#ff5555", letterSpacing: "1px", fontWeight: 700 }}>End</span>
        </button>
      </div>
    </div>
  );
}
