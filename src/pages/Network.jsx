import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const CYAN = "#00d2c8";
const BG   = "#030b12";

const ME = { id: 0, name: "Mazen Mohamed", initials: "MM", title: "Full-Stack Developer" };

const USERS = [
  { id:1,  name:"Ahmed Kamal",       initials:"AK", title:"DevOps Engineer",           connected:true,  mutual:14, x:0.62, y:0.28, size:52, color:"#00d2c8", ring:"#00ffd0", orbitR:18, orbitSpeed:0.012, desc:"AWS Certified · 3y exp",      online:true  },
  { id:2,  name:"Sara Ahmed",        initials:"SA", title:"UX Designer at Vodafone",   connected:true,  mutual:9,  x:0.38, y:0.68, size:44, color:"#00a8ff", ring:"#60cfff", orbitR:14, orbitSpeed:0.018, desc:"Figma expert · Adobe CC",        online:true  },
  { id:3,  name:"Mansour Montaser",  initials:"MM", title:"Frontend Dev & Instructor", connected:true,  mutual:21, x:0.72, y:0.62, size:48, color:"#7b61ff", ring:"#b09fff", orbitR:16, orbitSpeed:0.015, desc:"React · Vue · Teaching",         online:false },
  { id:4,  name:"Nour Hassan",       initials:"NH", title:"Product Manager",           connected:true,  mutual:8,  x:0.25, y:0.42, size:40, color:"#22c55e", ring:"#4ade80", orbitR:12, orbitSpeed:0.022, desc:"Careem · Agile Certified",       online:true  },
  { id:5,  name:"Emam Awad",         initials:"EA", title:"HE Leader · 10yr Teaching", connected:true,  mutual:12, x:0.55, y:0.78, size:36, color:"#ffd166", ring:"#ffe799", orbitR:10, orbitSpeed:0.028, desc:"MAEd · Curriculum Design",       online:false },
  { id:6,  name:"Dina Ramadan",      initials:"DR", title:"ML Engineer at Instabug",   connected:false, mutual:3,  x:0.82, y:0.38, size:38, color:"#ff6b6b", ring:"#ff9999", orbitR:11, orbitSpeed:0.02,  desc:"TensorFlow · Python · CV",       online:false },
  { id:7,  name:"Omar Sharaf",       initials:"OS", title:"Backend Dev · Go & Node",   connected:false, mutual:11, x:0.18, y:0.72, size:34, color:"#f97316", ring:"#fdba74", orbitR:9,  orbitSpeed:0.025, desc:"Golang · PostgreSQL · Redis",     online:true  },
  { id:8,  name:"Tarek Hamdi",       initials:"TH", title:"Cloud Architect GCP/AWS",   connected:false, mutual:5,  x:0.45, y:0.18, size:42, color:"#ec4899", ring:"#f9a8d4", orbitR:13, orbitSpeed:0.014, desc:"3x AWS Certified · GCP Pro",     online:false },
  { id:9,  name:"Rania Fathy",       initials:"RF", title:"Data Scientist",            connected:false, mutual:2,  x:0.88, y:0.72, size:30, color:"#14b8a6", ring:"#5eead4", orbitR:8,  orbitSpeed:0.032, desc:"Pandas · Sklearn · Tableau",     online:false },
  { id:10, name:"Karim Adel",        initials:"KA", title:"DevOps Lead at Noon",       connected:false, mutual:7,  x:0.12, y:0.28, size:32, color:"#a855f7", ring:"#d8b4fe", orbitR:9,  orbitSpeed:0.027, desc:"K8s · Docker · Terraform",       online:true  },
  { id:11, name:"Hana Sayed",        initials:"HS", title:"UX Researcher",             connected:false, mutual:1,  x:0.68, y:0.88, size:28, color:"#f59e0b", ring:"#fcd34d", orbitR:7,  orbitSpeed:0.035, desc:"Usability Testing · Figma",       online:false },
  { id:12, name:"Bassem Yousef",     initials:"BY", title:"Engineering Manager",       connected:false, mutual:6,  x:0.32, y:0.12, size:36, color:"#10b981", ring:"#6ee7b7", orbitR:10, orbitSpeed:0.022, desc:"Fawry · 8yr exp · Mentoring",    online:true  },
];

function launchRocket(ctx, from, to, color, onDone) {
  let t = 0;
  const dur = 90;
  const animate = () => {
    t++;
    if (t > dur) { onDone?.(); return; }
    const p = t / dur;
    const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    
    const cx = (from.x + to.x) / 2 - (to.y - from.y) * 0.3;
    const cy = (from.y + to.y) / 2 + (to.x - from.x) * 0.3;
    const x = (1 - ease) ** 2 * from.x + 2 * (1 - ease) * ease * cx + ease ** 2 * to.x;
    const y = (1 - ease) ** 2 * from.y + 2 * (1 - ease) * ease * cy + ease ** 2 * to.y;
    const px = (1 - Math.max(0, ease - 0.01)) ** 2 * from.x + 2 * (1 - Math.max(0, ease - 0.01)) * Math.max(0, ease - 0.01) * cx + Math.max(0, ease - 0.01) ** 2 * to.x;
    const py = (1 - Math.max(0, ease - 0.01)) ** 2 * from.y + 2 * (1 - Math.max(0, ease - 0.01)) * Math.max(0, ease - 0.01) * cy + Math.max(0, ease - 0.01) ** 2 * to.y;
    const angle = Math.atan2(y - py, x - px);
    
    ctx.beginPath();
    ctx.moveTo(px, py); ctx.lineTo(x, y);
    ctx.strokeStyle = `${color}66`; ctx.lineWidth = 2; ctx.stroke();
    
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -4); ctx.lineTo(-3, 0); ctx.lineTo(-5, 4); ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    ctx.restore();
    
    const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
    g.addColorStop(0, `${color}88`); g.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

export default function Network() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [connected, setConnected] = useState(new Set(USERS.filter(u => u.connected).map(u => u.id)));
  const [rockets, setRockets] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [sentMsgs, setSentMsgs] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [hoverId, setHoverId] = useState(null);
  const [exploreAnim, setExploreAnim] = useState(null);
  const anglesRef = useRef(USERS.map(u => Math.random() * Math.PI * 2));
  const mePos = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef(null);

  
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;
    const ctx = canvas.getContext("2d");
    const octx = overlay.getContext("2d");
    let id;

    const resize = () => {
      [canvas, overlay].forEach(c => { c.width = c.offsetWidth; c.height = c.offsetHeight; });
    };
    resize();
    window.addEventListener("resize", resize);

    
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      tw: Math.random() * 5 + 2,
    }));
    
    const nebulas = Array.from({ length: 4 }, () => ({
      x: Math.random(), y: Math.random(),
      rx: 0.15 + Math.random() * 0.2, ry: 0.1 + Math.random() * 0.15,
      color: ["#00d2c844", "#0077aa33", "#7b61ff22", "#003344aa"][Math.floor(Math.random() * 4)],
    }));

    const draw = (ts) => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      octx.clearRect(0, 0, W, H);

      
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      
      nebulas.forEach(n => {
        const g = ctx.createRadialGradient(n.x * W, n.y * H, 0, n.x * W, n.y * H, n.rx * W);
        g.addColorStop(0, n.color); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.ellipse(n.x * W, n.y * H, n.rx * W, n.ry * H, 0, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });

      
      stars.forEach(s => {
        const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(ts * 0.001 + s.a * s.tw));
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkle * (0.2 + s.a * 0.5)})`; ctx.fill();
      });

      
      const mx = mePos.current.x * W, my = mePos.current.y * H;

      
      [80, 130, 180].forEach(r => {
        ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,210,200,0.05)"; ctx.lineWidth = 1; ctx.setLineDash([3, 8]); ctx.stroke(); ctx.setLineDash([]);
      });

      
      USERS.forEach((u, i) => {
        const isConn = connected.has(u.id);
        const ang = anglesRef.current[i];
        const ux = u.x * W, uy = u.y * H;

        if (isConn) {
          
          const grad = ctx.createLinearGradient(mx, my, ux, uy);
          grad.addColorStop(0, `${u.color}44`); grad.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(ux, uy);
          ctx.strokeStyle = grad; ctx.lineWidth = 0.8; ctx.setLineDash([4, 8]);
          ctx.stroke(); ctx.setLineDash([]);
        }

        
        anglesRef.current[i] = ang + u.orbitSpeed * 0.5;
        const moonX = ux + Math.cos(anglesRef.current[i]) * u.orbitR;
        const moonY = uy + Math.sin(anglesRef.current[i]) * u.orbitR * 0.4;

        
        const glowR = u.size * (isConn ? 1.8 : 1.2);
        const glow = ctx.createRadialGradient(ux, uy, 0, ux, uy, glowR);
        glow.addColorStop(0, `${u.color}${isConn ? "55" : "22"}`);
        glow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(ux, uy, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();

        
        const planetG = ctx.createRadialGradient(ux - u.size * 0.3, uy - u.size * 0.3, 0, ux, uy, u.size / 2);
        if (isConn) {
          planetG.addColorStop(0, "#ffffff");
          planetG.addColorStop(0.3, u.color);
          planetG.addColorStop(1, u.color + "88");
        } else {
          planetG.addColorStop(0, "#223344");
          planetG.addColorStop(0.5, "#0a1a22");
          planetG.addColorStop(1, "#050d14");
        }
        ctx.beginPath(); ctx.arc(ux, uy, u.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = planetG; ctx.fill();

        
        if (isConn) {
          ctx.beginPath(); ctx.ellipse(ux, uy, u.size / 2 + 6, u.size / 6, 0.3, 0, Math.PI * 2);
          ctx.strokeStyle = `${u.ring}55`; ctx.lineWidth = 2; ctx.stroke();
        }

        
        if (!isConn) {
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.font = `bold ${u.size * 0.35}px Rajdhani,sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("?", ux, uy);
        } else {
          
          ctx.fillStyle = "#fff";
          ctx.font = `bold ${u.size * 0.3}px Rajdhani,sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(u.initials, ux, uy);
        }

        
        if (u.online) {
          ctx.beginPath(); ctx.arc(ux + u.size * 0.35, uy + u.size * 0.35, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#22c55e"; ctx.fill();
          ctx.strokeStyle = BG; ctx.lineWidth = 1.5; ctx.stroke();
        }

        
        if (hoverId === u.id) {
          const lw = ctx.measureText(u.name).width + 20;
          octx.fillStyle = "rgba(3,11,18,0.9)";
          octx.fillRect(ux - lw / 2, uy - u.size / 2 - 36, lw, 24);
          octx.strokeStyle = u.color + "88"; octx.lineWidth = 1;
          octx.strokeRect(ux - lw / 2, uy - u.size / 2 - 36, lw, 24);
          octx.fillStyle = u.color;
          octx.font = "bold 11px Rajdhani,sans-serif";
          octx.textAlign = "center"; octx.textBaseline = "middle";
          octx.fillText(u.name, ux, uy - u.size / 2 - 24);
        }

        
        if (isConn) {
          ctx.beginPath(); ctx.arc(moonX, moonY, 3, 0, Math.PI * 2);
          ctx.fillStyle = u.ring + "bb"; ctx.fill();
        }
      });

      
      
      [80, 55, 35, 22].forEach((r, i) => {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, r);
        g.addColorStop(0, `rgba(0,210,200,${[0.06, 0.1, 0.2, 0.9][i]})`);
        g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      
      const pulse = 22 + Math.sin(ts * 0.003) * 3;
      ctx.beginPath(); ctx.arc(mx, my, pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,210,200,${0.4 + Math.sin(ts * 0.003) * 0.15})`;
      ctx.lineWidth = 1.5; ctx.stroke();
      
      const meG = ctx.createRadialGradient(mx - 7, my - 7, 0, mx, my, 20);
      meG.addColorStop(0, "#fff"); meG.addColorStop(0.3, CYAN); meG.addColorStop(1, "#004455");
      ctx.beginPath(); ctx.arc(mx, my, 20, 0, Math.PI * 2);
      ctx.fillStyle = meG; ctx.fill();
      
      ctx.fillStyle = "#000"; ctx.font = "bold 9px Rajdhani,sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("YOU", mx, my - 3); ctx.fillText("∞", mx, my + 5);

      id = requestAnimationFrame(draw);
    };
    id = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, [connected, hoverId]);

  
  const hitTest = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const W = canvas.width, H = canvas.height;
    for (const u of USERS) {
      const ux = u.x * W, uy = u.y * H;
      const d = Math.hypot(mx - ux, my - uy);
      if (d < u.size / 2 + 8) return u;
    }
    return null;
  }, []);

  const handleMouseMove = useCallback((e) => {
    const u = hitTest(e);
    setHoverId(u ? u.id : null);
    canvasRef.current.style.cursor = u ? "pointer" : "default";
  }, [hitTest]);

  const handleClick = useCallback((e) => {
    const u = hitTest(e);
    if (u) setSelected(u);
  }, [hitTest]);

  
  const sendRocket = (target) => {
    if (!msgText.trim()) return;
    const canvas = canvasRef.current;
    const W = canvas.width, H = canvas.height;
    const from = { x: mePos.current.x * W, y: mePos.current.y * H };
    const to   = { x: target.x * W, y: target.y * H };
    const ctx = canvas.getContext("2d");
    launchRocket(ctx, from, to, target.color, () => {
      setSentMsgs(m => ({ ...m, [target.id]: [...(m[target.id] || []), msgText] }));
    });
    setMsgText("");
  };

  
  const explore = (user) => {
    setExploreAnim(user.id);
    setTimeout(() => {
      setConnected(c => new Set([...c, user.id]));
      setExploreAnim(null);
    }, 1800);
  };

  const filtered = USERS.filter(u => {
    const matchFilter = filter === "all" || (filter === "connected" && connected.has(u.id)) || (filter === "explore" && !connected.has(u.id));
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ height: "100vh", background: BG, fontFamily: "'Barlow',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https:
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,210,200,0.3); }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes explode { 0%{transform:scale(1);opacity:1} 50%{transform:scale(2.5);opacity:0.6} 100%{transform:scale(4);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .fu { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      {}
      <nav style={{ height: 52, background: "rgba(3,11,18,0.97)", borderBottom: "1px solid rgba(0,210,200,0.1)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, position: "relative", zIndex: 20 }}>
        <div style={{ position: "absolute", bottom: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.3),transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>
            <span style={{ color: "#fff" }}>TALENT</span><span style={{ color: CYAN }}>FLOW</span>
          </button>
          <div style={{ width: 1, height: 16, background: "rgba(0,210,200,0.2)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "3px", color: CYAN }}>🌌 NETWORK UNIVERSE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search planets…"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,200,0.18)", padding: "6px 32px 6px 12px", fontSize: 12, color: "#fff", outline: "none", width: 200 }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>⌕</span>
          </div>
          {["all", "connected", "explore"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "5px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", background: filter === f ? "rgba(0,210,200,0.12)" : "transparent", border: `1px solid ${filter === f ? CYAN : "rgba(0,210,200,0.15)"}`, color: filter === f ? CYAN : "rgba(255,255,255,0.35)", cursor: "pointer" }}>
              {f === "all" ? "🌌 All" : f === "connected" ? "🪐 Explored" : "🔭 Discover"}
            </button>
          ))}
          <button onClick={() => navigate("/dashboard")} style={{ border: "1px solid rgba(0,210,200,0.2)", color: CYAN, background: "transparent", padding: "5px 16px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>← Back</button>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            onMouseMove={handleMouseMove} onClick={handleClick} />
          <canvas ref={overlayRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />

          {}
          <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", gap: 16, background: "rgba(3,11,18,0.85)", border: "1px solid rgba(0,210,200,0.12)", padding: "10px 16px", backdropFilter: "blur(8px)" }}>
            {[
              { dot: CYAN, label: "You (Origin Star)" },
              { dot: "#7b61ff", label: "Explored (Connected)" },
              { dot: "#334155", label: "Unexplored Planet" },
              { dot: "#22c55e", label: "Online Now" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.dot }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>{l.label}</span>
              </div>
            ))}
          </div>

          {}
          <div style={{ position: "absolute", top: 16, left: 20, display: "flex", gap: 12 }}>
            {[
              { val: connected.size, label: "Explored", color: CYAN },
              { val: USERS.length - connected.size, label: "Undiscovered", color: "rgba(255,255,255,0.3)" },
              { val: USERS.filter(u => u.online).length, label: "Online Now", color: "#22c55e" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(3,11,18,0.85)", border: "1px solid rgba(0,210,200,0.1)", padding: "8px 14px", backdropFilter: "blur(8px)" }}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 22, color: s.color, margin: 0, lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", margin: "3px 0 0", textTransform: "uppercase" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {}
          {exploreAnim && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 48, animation: "explode 1.8s ease forwards" }}>🚀</div>
            </div>
          )}
        </div>

        {}
        <div style={{ width: 280, borderLeft: "1px solid rgba(0,210,200,0.1)", display: "flex", flexDirection: "column", background: "rgba(3,11,18,0.6)", backdropFilter: "blur(12px)", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(0,210,200,0.08)" }}>
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0 }}>
              {filter === "connected" ? "🪐 Your Network" : filter === "explore" ? "🔭 Discover" : "🌌 All Planets"}
            </p>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {filtered.map(u => (
              <button key={u.id} onClick={() => setSelected(u)}
                style={{ width: "100%", textAlign: "left", padding: "12px 16px", background: selected?.id === u.id ? "rgba(0,210,200,0.08)" : "transparent", border: "none", borderBottom: "1px solid rgba(0,210,200,0.05)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "background 0.2s" }}
                onMouseEnter={e => { if (selected?.id !== u.id) e.currentTarget.style.background = "rgba(0,210,200,0.04)"; }}
                onMouseLeave={e => { if (selected?.id !== u.id) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: connected.has(u.id) ? `linear-gradient(135deg,${u.color},${u.color}88)` : "rgba(30,50,60,0.8)", border: `1.5px solid ${connected.has(u.id) ? u.color + "66" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: connected.has(u.id) ? "#fff" : "rgba(255,255,255,0.2)", flexShrink: 0, fontFamily: "'Rajdhani',sans-serif", position: "relative" }}>
                  {connected.has(u.id) ? u.initials : "?"}
                  {u.online && <span style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", background: "#22c55e", border: "1.5px solid #030b12" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: connected.has(u.id) ? "#fff" : "rgba(255,255,255,0.35)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {connected.has(u.id) ? u.name : "Unknown Planet"}
                  </p>
                  <p style={{ fontSize: 11, color: connected.has(u.id) ? u.color : "rgba(255,255,255,0.2)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {connected.has(u.id) ? u.title : `${u.mutual} mutual connections`}
                  </p>
                </div>
                {connected.has(u.id) && <span style={{ width: 6, height: 6, borderRadius: "50%", background: u.color, flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {}
      {selected && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "flex-end", pointerEvents: "none" }}>
          <div className="fu" style={{ width: 380, height: "100%", background: "rgba(3,11,18,0.98)", borderLeft: `1px solid ${selected.color}44`, backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", overflow: "hidden", pointerEvents: "all", boxShadow: `-20px 0 60px rgba(0,0,0,0.5)` }}>

            {}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(0,210,200,0.1)", flexShrink: 0 }}>
              <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                {connected.has(selected.id) ? "🪐 Explored Planet" : "🔭 Unknown Planet"}
              </p>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

              {}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ position: "relative" }}>
                  {}
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      position: "absolute", inset: -i * 12, borderRadius: "50%",
                      border: `1px solid ${selected.color}${["44", "22", "11"][i - 1]}`,
                      animation: `spin ${8 + i * 4}s linear infinite`,
                    }} />
                  ))}
                  <div style={{ width: 96, height: 96, borderRadius: "50%", background: connected.has(selected.id) ? `radial-gradient(circle at 35% 35%, #fff, ${selected.color}, ${selected.color}66)` : "radial-gradient(circle at 35% 35%, #1a3040, #0a1a22, #050d14)", border: `2px solid ${selected.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: connected.has(selected.id) ? "#fff" : "rgba(255,255,255,0.15)", fontFamily: "'Rajdhani',sans-serif", position: "relative" }}>
                    {connected.has(selected.id) ? selected.initials : "?"}
                    {selected.online && connected.has(selected.id) && (
                      <span style={{ position: "absolute", bottom: 4, right: 4, width: 12, height: 12, borderRadius: "50%", background: "#22c55e", border: "2px solid #030b12", animation: "pulse 2s ease-in-out infinite" }} />
                    )}
                  </div>
                  {}
                  {connected.has(selected.id) && (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotateX(60deg)", width: 120, height: 120, borderRadius: "50%", border: `2px solid ${selected.color}33`, pointerEvents: "none" }} />
                  )}
                </div>
              </div>

              {connected.has(selected.id) ? (
                <>
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 22, color: "#fff", margin: "0 0 4px", textAlign: "center" }}>{selected.name}</p>
                  <p style={{ fontSize: 13, color: selected.color, textAlign: "center", marginBottom: 6 }}>{selected.title}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 20 }}>{selected.desc}</p>

                  {}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                    {[
                      { label: "Mutual Connections", val: selected.mutual },
                      { label: "Status", val: selected.online ? "🟢 Online" : "⚫ Offline" },
                    ].map(s => (
                      <div key={s.label} style={{ background: "rgba(0,210,200,0.04)", border: "1px solid rgba(0,210,200,0.1)", padding: "10px 12px", textAlign: "center" }}>
                        <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 18, color: CYAN, margin: 0 }}>{s.val}</p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", margin: "3px 0 0", textTransform: "uppercase" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {}
                  {sentMsgs[selected.id]?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>Rocket Messages Sent</p>
                      {sentMsgs[selected.id].map((m, i) => (
                        <div key={i} style={{ padding: "8px 12px", background: `rgba(${selected.color.slice(1).match(/.{2}/g).map(h => parseInt(h, 16)).join(",")},0.08)`, border: `1px solid ${selected.color}22`, marginBottom: 6 }}>
                          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0 }}>🚀 {m}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {}
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>Send Rocket Message</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={msgText} onChange={e => setMsgText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendRocket(selected)}
                        placeholder="Write a message…"
                        style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,200,0.18)", padding: "9px 12px", fontSize: 12, color: "#fff", outline: "none", fontFamily: "inherit" }} />
                      <button onClick={() => sendRocket(selected)}
                        style={{ background: selected.color, color: "#000", border: "none", padding: "9px 14px", fontSize: 14, cursor: "pointer", fontWeight: 900 }}>🚀</button>
                    </div>
                  </div>

                  {}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, background: "rgba(0,210,200,0.08)", border: `1px solid rgba(0,210,200,0.25)`, color: CYAN, padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer" }}>
                      💬 Message
                    </button>
                    <button style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer" }}>
                      👤 Profile
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {}
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 20, color: "rgba(255,255,255,0.3)", textAlign: "center", margin: "0 0 6px" }}>Unknown Planet</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", marginBottom: 20 }}>{selected.mutual} mutual connections detected</p>

                  {}
                  <div style={{ background: "rgba(0,210,200,0.04)", border: "1px solid rgba(0,210,200,0.1)", padding: 16, marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", color: CYAN, textTransform: "uppercase", marginBottom: 12 }}>Signals Detected</p>
                    {["Professional signals detected", `${selected.mutual} mutual orbital connections`, "Career trajectory analysis: Compatible", "Awaiting first contact"].map((sig, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: CYAN, opacity: 0.4 + i * 0.15, animation: `pulse ${1.5 + i * 0.3}s ease-in-out infinite`, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{sig}</span>
                      </div>
                    ))}
                  </div>

                  {}
                  <button onClick={() => explore(selected)}
                    disabled={exploreAnim !== null}
                    style={{ width: "100%", background: `linear-gradient(135deg,rgba(0,210,200,0.2),rgba(0,119,170,0.2))`, border: `1px solid ${CYAN}`, color: CYAN, padding: "14px", fontSize: 13, fontWeight: 900, letterSpacing: "3px", textTransform: "uppercase", cursor: exploreAnim ? "not-allowed" : "pointer", fontFamily: "'Rajdhani',sans-serif", marginBottom: 10, transition: "all 0.3s" }}
                    onMouseEnter={e => { if (!exploreAnim) e.currentTarget.style.background = "rgba(0,210,200,0.15)"; }}
                    onMouseLeave={e => e.currentTarget.style.background = `linear-gradient(135deg,rgba(0,210,200,0.2),rgba(0,119,170,0.2))`}>
                    {exploreAnim === selected.id ? "🚀 Launching…" : "🚀 Explore Planet"}
                  </button>

                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.6 }}>
                    Send a connection request to reveal this planet and add them to your network universe.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}