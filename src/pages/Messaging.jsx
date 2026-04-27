import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const CYAN = "#00d2c8";
const BG   = "#030b12";

const Particles = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let id;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.4 + 0.4,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,210,200,0.45)"; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(0,210,200,${0.07*(1-d/110)})`; ctx.lineWidth = 0.6; ctx.stroke(); }
      }));
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
};

const ME = { id: 0, name: "Mazen Mohamed", initials: "MM" };

const CONTACTS = [
  { id: 1, name: "Ahmed Kamal",       initials: "AK", role: "DevOps Engineer",        online: true,  color: "#00d2c8", unread: 2,
    messages: [
      { id: 1, from: "them", text: "Hey! Just saw your profile on TalentFlow.", time: "10:02 AM", read: true },
      { id: 2, from: "me",   text: "Thanks Ahmed! Appreciate you reaching out.", time: "10:04 AM", read: true },
      { id: 3, from: "them", text: "Are you open to a new role? We have something interesting at Instabug.", time: "10:05 AM", read: true },
      { id: 4, from: "me",   text: "Actually yes, I've been exploring opportunities. What's the stack?", time: "10:07 AM", read: true },
      { id: 5, from: "them", text: "React + Node.js + AWS. Senior level, great team. Let me know if you want a call!", time: "10:09 AM", read: false },
    ]
  },
  { id: 2, name: "Sara Ahmed",        initials: "SA", role: "UX Designer at Vodafone", online: true,  color: "#00a8ff", unread: 0,
    messages: [
      { id: 1, from: "them", text: "Hi Mazen! I loved your post about design thinking.", time: "Yesterday", read: true },
      { id: 2, from: "me",   text: "Thank you Sara! Your UX work is always inspiring.", time: "Yesterday", read: true },
      { id: 3, from: "them", text: "Would you be up for a collaboration on a side project?", time: "Yesterday", read: true },
    ]
  },
  { id: 3, name: "Nour Hassan",       initials: "NH", role: "Product Manager at Careem", online: false, color: "#22c55e", unread: 1,
    messages: [
      { id: 1, from: "me",   text: "Hey Nour, connected! I'm a big fan of Careem's product decisions.", time: "Mon", read: true },
      { id: 2, from: "them", text: "Thanks! We actually have a PM opening too if you know anyone 😄", time: "Mon", read: false },
    ]
  },
  { id: 4, name: "Tarek Hamdi",       initials: "TH", role: "Cloud Architect GCP/AWS",  online: false, color: "#7b61ff", unread: 0,
    messages: [
      { id: 1, from: "them", text: "Great AWS post. How long did you study for the exam?", time: "Sun", read: true },
      { id: 2, from: "me",   text: "About 3 months of consistent studying!", time: "Sun", read: true },
    ]
  },
  { id: 5, name: "Dina Ramadan",      initials: "DR", role: "ML Engineer at Instabug",  online: true,  color: "#f97316", unread: 0,
    messages: [
      { id: 1, from: "them", text: "Your vision transformer post was spot on.", time: "Sat", read: true },
    ]
  },
];

const EMOJIS = ["👍","❤️","😂","🔥","🎉","🚀","💯","😮"];

const Avatar = ({ initials, color, size = 40, online, pulse }) => (
  <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg,${color},${color}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.32, fontWeight: 900, color: "#fff",
      fontFamily: "'Rajdhani',sans-serif",
      boxShadow: pulse ? `0 0 16px ${color}66` : "none",
    }}>{initials}</div>
    {online !== undefined && (
      <span style={{
        position: "absolute", bottom: 0, right: 0,
        width: size * 0.28, height: size * 0.28, borderRadius: "50%",
        background: online ? "#22c55e" : "rgba(255,255,255,0.15)",
        border: `2px solid ${BG}`,
        ...(online && pulse ? { animation: "onlinePulse 2s ease-in-out infinite" } : {}),
      }} />
    )}
  </div>
);

const TypingDots = ({ color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>
    {[0,1,2].map(i => (
      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: color, animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
    ))}
  </div>
);

const Bubble = ({ msg, isMe, contactColor, onReact, reactions = [] }) => {
  const [showEmoji, setShowEmoji] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 10, marginBottom: 6, animation: "msgIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
      onMouseEnter={() => setShowEmoji(true)}
      onMouseLeave={() => setShowEmoji(false)}>

      {}
      {showEmoji && (
        <div style={{
          position: "absolute", [isMe ? "right" : "left"]: 60,
          background: "rgba(3,11,18,0.95)", border: "1px solid rgba(0,210,200,0.2)",
          borderRadius: 24, padding: "6px 10px", display: "flex", gap: 6,
          backdropFilter: "blur(12px)", zIndex: 10,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.15s ease",
        }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => { onReact(msg.id, e); setShowEmoji(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, transition: "transform 0.1s" }}
              onMouseEnter={ev => ev.currentTarget.style.transform = "scale(1.3)"}
              onMouseLeave={ev => ev.currentTarget.style.transform = "scale(1)"}>
              {e}
            </button>
          ))}
        </div>
      )}

      {}
      <div style={{ maxWidth: "68%", position: "relative" }}>
        <div style={{
          padding: "11px 16px",
          background: isMe
            ? `linear-gradient(135deg,${CYAN},#0097a7)`
            : "rgba(255,255,255,0.06)",
          border: isMe ? "none" : "1px solid rgba(255,255,255,0.08)",
          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          color: isMe ? "#000" : "rgba(255,255,255,0.85)",
          fontSize: 14, lineHeight: 1.6,
          boxShadow: isMe ? `0 4px 20px ${CYAN}33` : "none",
          position: "relative",
        }}>
          {msg.text}
        </div>

        {}
        {reactions.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: isMe ? "flex-end" : "flex-start", flexWrap: "wrap" }}>
            {reactions.map((r, i) => (
              <span key={i} style={{ fontSize: 14, background: "rgba(0,210,200,0.1)", border: "1px solid rgba(0,210,200,0.2)", borderRadius: 12, padding: "2px 7px" }}>{r}</span>
            ))}
          </div>
        )}

        {}
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", margin: "4px 0 0", textAlign: isMe ? "right" : "left", letterSpacing: 0.5 }}>
          {msg.time} {isMe && <span style={{ color: msg.read ? CYAN : "rgba(255,255,255,0.3)" }}>{msg.read ? "✓✓" : "✓"}</span>}
        </p>
      </div>
    </div>
  );
};

export default function Messaging() {
  const navigate = useNavigate();
  const [contacts,     setContacts]    = useState(CONTACTS);
  const [activeId,     setActiveId]    = useState(1);
  const [input,        setInput]       = useState("");
  const [search,       setSearch]      = useState("");
  const [typing,       setTyping]      = useState(false);
  const [reactions,    setReactions]   = useState({});
  const [infoOpen,     setInfoOpen]    = useState(false);
  const endRef     = useRef(null);
  const inputRef   = useRef(null);
  const typingTimer = useRef(null);

  const active    = contacts.find(c => c.id === activeId);
  const filtered  = contacts.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages]);

  
  const simulateResponse = useCallback((contactId) => {
    setTyping(true);
    const delay = 1200 + Math.random() * 800;
    typingTimer.current = setTimeout(() => {
      setTyping(false);
      const responses = [
        "That's great to hear! Let's definitely connect.",
        "Sounds interesting! Can you share more details?",
        "Absolutely! I'll send you the details shortly.",
        "Wow, that's impressive! Keep up the great work.",
        "Thanks for sharing! I'll check it out.",
        "Let's schedule a call to discuss this further.",
      ];
      const text = responses[Math.floor(Math.random() * responses.length)];
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setContacts(prev => prev.map(c => c.id === contactId
        ? { ...c, messages: [...c.messages, { id: Date.now(), from: "them", text, time: now, read: false }] }
        : c
      ));
    }, delay);
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !active) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setContacts(prev => prev.map(c => c.id === activeId
      ? { ...c, messages: [...c.messages, { id: Date.now(), from: "me", text: input.trim(), time: now, read: false }] }
      : c
    ));
    setInput("");
    inputRef.current?.focus();
    if (active.online) simulateResponse(activeId);
  };

  const handleReact = (msgId, emoji) => {
    setReactions(r => ({ ...r, [msgId]: [...(r[msgId] || []), emoji] }));
  };

  const selectContact = (id) => {
    setActiveId(id);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setInfoOpen(false);
  };

  const totalUnread = contacts.reduce((a, c) => a + c.unread, 0);

  return (
    <div style={{ height: "100vh", background: BG, fontFamily: "'Barlow',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https:
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,210,200,0.3); border-radius: 2px; }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px) scale(0.95)} to{opacity:1;transform:none} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes onlinePulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 4px rgba(34,197,94,0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:none} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,210,200,0.15)} 50%{box-shadow:0 0 40px rgba(0,210,200,0.35)} }
        .contact-item:hover { background: rgba(0,210,200,0.06) !important; }
      `}</style>

      <Particles />

      {}
      <nav style={{ height: 54, background: "rgba(3,11,18,0.97)", borderBottom: "1px solid rgba(0,210,200,0.1)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", flexShrink: 0, position: "relative", zIndex: 20 }}>
        <div style={{ position: "absolute", bottom: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.3),transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>
            <span style={{ color: "#fff" }}>TALENT</span><span style={{ color: CYAN }}>FLOW</span>
          </button>
          <div style={{ width: 1, height: 14, background: "rgba(0,210,200,0.2)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "3px", color: CYAN, textTransform: "uppercase" }}>Messages</span>
          {totalUnread > 0 && (
            <span style={{ background: CYAN, color: "#000", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>{totalUnread}</span>
          )}
        </div>
        <button onClick={() => navigate("/dashboard")} style={{ border: "1px solid rgba(0,210,200,0.2)", color: "rgba(255,255,255,0.4)", background: "transparent", padding: "5px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
          ← Back
        </button>
      </nav>

      {}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", zIndex: 1 }}>

        {}
        <div style={{ width: 300, borderRight: "1px solid rgba(0,210,200,0.1)", display: "flex", flexDirection: "column", background: "rgba(3,11,18,0.7)", backdropFilter: "blur(12px)", flexShrink: 0 }}>

          {}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,210,200,0.08)" }}>
            <div style={{ position: "relative" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations…"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,200,0.15)", padding: "9px 36px 9px 14px", fontSize: 12, color: "#fff", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = "rgba(0,210,200,0.15)"} />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>⌕</span>
            </div>
          </div>

          {}
          <div style={{ padding: "12px 16px 8px", borderBottom: "1px solid rgba(0,210,200,0.06)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>Online Now</p>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {contacts.filter(c => c.online).map(c => (
                <div key={c.id} onClick={() => selectContact(c.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", flexShrink: 0 }}>
                  <Avatar initials={c.initials} color={c.color} size={38} online pulse />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", maxWidth: 44, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{c.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map(c => (
              <div key={c.id} onClick={() => selectContact(c.id)} className="contact-item"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid rgba(0,210,200,0.05)", background: activeId === c.id ? `rgba(0,210,200,0.09)` : "transparent", borderLeft: activeId === c.id ? `3px solid ${c.color}` : "3px solid transparent", transition: "all 0.2s", position: "relative", animation: "slideRight 0.3s ease forwards" }}>
                <Avatar initials={c.initials} color={c.color} size={42} online={c.online} pulse={c.online && c.unread > 0} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                    <p style={{ fontSize: 13, fontWeight: c.unread > 0 ? 800 : 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{c.name}</p>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{c.messages[c.messages.length - 1]?.time}</span>
                  </div>
                  <p style={{ fontSize: 12, color: c.unread > 0 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: c.unread > 0 ? 600 : 400 }}>
                    {c.messages[c.messages.length - 1]?.from === "me" ? "You: " : ""}{c.messages[c.messages.length - 1]?.text}
                  </p>
                </div>
                {c.unread > 0 && (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: CYAN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#000", flexShrink: 0, animation: "glow 2s ease-in-out infinite" }}>
                    {c.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {}
        {active ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {}
            <div style={{ height: 64, borderBottom: "1px solid rgba(0,210,200,0.1)", display: "flex", alignItems: "center", padding: "0 20px", gap: 14, background: "rgba(3,11,18,0.6)", backdropFilter: "blur(12px)", flexShrink: 0, position: "relative" }}>
              {}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${active.color}33,transparent)` }} />

              <Avatar initials={active.initials} color={active.color} size={44} online={active.online} pulse={active.online} />
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 17, color: "#fff", margin: 0, letterSpacing: 0.5 }}>{active.name}</p>
                <p style={{ fontSize: 12, color: typing ? CYAN : active.online ? "#22c55e" : "rgba(255,255,255,0.3)", margin: 0, transition: "color 0.3s" }}>
                  {typing ? "typing…" : active.online ? "● Online" : "○ Offline"}
                </p>
              </div>

              {}
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { icon: "📞", label: "Call" },
                  { icon: "🎙", label: "Voice" },
                  { icon: "📷", label: "Video" },
                  { icon: "ℹ", label: "Info", action: () => setInfoOpen(v => !v) },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    style={{ width: 36, height: 36, background: infoOpen && a.label === "Info" ? "rgba(0,210,200,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${infoOpen && a.label === "Info" ? "rgba(0,210,200,0.4)" : "rgba(0,210,200,0.12)"}`, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, transition: "all 0.2s" }}
                    title={a.label}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,210,200,0.12)"; e.currentTarget.style.borderColor = "rgba(0,210,200,0.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = infoOpen && a.label === "Info" ? "rgba(0,210,200,0.15)" : "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = infoOpen && a.label === "Info" ? "rgba(0,210,200,0.4)" : "rgba(0,210,200,0.12)"; }}>
                    {a.icon}
                  </button>
                ))}
              </div>
            </div>

            {}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

              {}
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
                {}
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(0,210,200,0.08)" }} />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 1, padding: "3px 10px", border: "1px solid rgba(0,210,200,0.1)" }}>Today</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(0,210,200,0.08)" }} />
                </div>

                {active.messages.map(m => (
                  <div key={m.id} style={{ position: "relative" }}>
                    <Bubble
                      msg={m}
                      isMe={m.from === "me"}
                      contactColor={active.color}
                      onReact={handleReact}
                      reactions={reactions[m.id] || []}
                    />
                  </div>
                ))}

                {}
                {typing && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 4, animation: "fadeUp 0.3s ease" }}>
                    <Avatar initials={active.initials} color={active.color} size={32} />
                    <TypingDots color={active.color} />
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {}
              {infoOpen && (
                <div style={{ width: 260, borderLeft: "1px solid rgba(0,210,200,0.1)", background: "rgba(3,11,18,0.8)", backdropFilter: "blur(12px)", padding: 20, overflowY: "auto", animation: "slideRight 0.25s ease" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingBottom: 18, borderBottom: "1px solid rgba(0,210,200,0.08)", marginBottom: 18 }}>
                    <Avatar initials={active.initials} color={active.color} size={64} online={active.online} pulse={active.online} />
                    <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 17, color: "#fff", margin: 0 }}>{active.name}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, textAlign: "center" }}>{active.role}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: active.online ? "#22c55e" : "rgba(255,255,255,0.3)", border: `1px solid ${active.online ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`, padding: "3px 10px" }}>
                      {active.online ? "● Online" : "○ Offline"}
                    </span>
                  </div>

                  {[
                    { label: "Messages", val: active.messages.length },
                    { label: "Connection", val: "1st" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(0,210,200,0.07)" }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: CYAN }}>{s.val}</span>
                    </div>
                  ))}

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    <button style={{ background: CYAN, color: "#000", border: "none", padding: "10px", fontSize: 11, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>View Profile</button>
                    <button style={{ background: "transparent", border: "1px solid rgba(0,210,200,0.25)", color: CYAN, padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>Mute</button>
                    <button style={{ background: "transparent", border: "1px solid rgba(255,85,85,0.25)", color: "#ff5555", padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>Block</button>
                  </div>
                </div>
              )}
            </div>

            {}
            <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(0,210,200,0.1)", background: "rgba(3,11,18,0.8)", backdropFilter: "blur(12px)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {}
                <div style={{ display: "flex", gap: 6 }}>
                  {["😊","📎"].map(ic => (
                    <button key={ic} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,200,0.12)", borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(0,210,200,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                      {ic}
                    </button>
                  ))}
                </div>

                {}
                <div style={{ flex: 1, position: "relative" }}>
                  <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder={`Message ${active.name.split(" ")[0]}…`}
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,210,200,0.18)", padding: "12px 18px", fontSize: 14, color: "#fff", outline: "none", borderRadius: 24, fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s" }}
                    onFocus={e => { e.target.style.borderColor = CYAN; e.target.style.boxShadow = `0 0 0 3px rgba(0,210,200,0.08)`; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(0,210,200,0.18)"; e.target.style.boxShadow = "none"; }} />
                </div>

                {}
                <button onClick={sendMessage} disabled={!input.trim()}
                  style={{ width: 44, height: 44, background: input.trim() ? CYAN : "rgba(0,210,200,0.15)", border: "none", borderRadius: "50%", cursor: input.trim() ? "pointer" : "not-allowed", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s", boxShadow: input.trim() ? `0 0 16px rgba(0,210,200,0.4)` : "none", transform: input.trim() ? "scale(1.05)" : "scale(1)", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke={input.trim() ? "#000" : CYAN} strokeWidth="2" strokeLinecap="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() ? "#000" : CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {}
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 8, textAlign: "center", letterSpacing: 1 }}>
                Press <kbd style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 3, fontSize: 10 }}>Enter</kbd> to send · Hover a message to react
              </p>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
            <span style={{ fontSize: 64, opacity: 0.2 }}>💬</span>
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 22, color: "rgba(255,255,255,0.2)", letterSpacing: 2 }}>SELECT A CONVERSATION</p>
          </div>
        )}
      </div>
    </div>
  );
}