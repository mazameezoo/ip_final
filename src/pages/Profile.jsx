import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { profileApi } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const CYAN = "#00d2c8";
const BG = "#030b12";
const FONTS_URL = "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;600;700&family=Rajdhani:wght@700;900&display=swap";

const PARTICLE_COUNT = 55;
const PARTICLE_LINK_DIST = 110;

const DEFAULT_INFO = {
  name:        "Mazen Mohamed",
  headline:    "Full-Stack Developer",
  location:    "New Cairo, Cairo, Egypt",
  school:      "The British University in Egypt",
  about:       "Passionate full-stack developer specialising in React, Node.js, and cloud-native architecture. I love turning complex problems into elegant, fast products.",
  connections: 289,
  followers:   312,
  openToWork:  true,
};

const DEFAULT_EXP = [
  { id: 1, title: "Full-Stack Developer", company: "Freelance", period: "2023 – Present", desc: "Building web applications for clients across the MENA region with React, Next.js and Node.js." },
  { id: 2, title: "Frontend Intern",      company: "Instabug",  period: "2022 – 2023",    desc: "Contributed to the main product dashboard and cut load time by 30%." },
];

const DEFAULT_EDU = [
  { id: 1, school: "The British University in Egypt", degree: "BSc Computer Science", period: "2020 – 2024" },
];

const DEFAULT_SKILLS = [
  { name: "React",      pct: 92 }, { name: "TypeScript", pct: 85 },
  { name: "Node.js",    pct: 80 }, { name: "Next.js",    pct: 78 },
  { name: "PostgreSQL", pct: 70 }, { name: "Docker",     pct: 65 },
  { name: "AWS",        pct: 60 }, { name: "Python",     pct: 55 },
];

const DEFAULT_CERTS = [
  { id: 1, name: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", year: "2023" },
  { id: 2, name: "Meta Front-End Developer Certificate", issuer: "Meta / Coursera",    year: "2022" },
];

const ANALYTICS = [
  { icon: "👁", label: "Profile views",       val: "47",    note: "Past 7 days",  up: true  },
  { icon: "🔍", label: "Search appearances",  val: "128",   note: "Past 7 days",  up: true  },
  { icon: "↗",  label: "Post impressions",    val: "2,341", note: "Past 30 days", up: false },
];

const LANGUAGES = [
  { lang: "Arabic",  level: "Native",       pct: 100 },
  { lang: "English", level: "Professional", pct: 85  },
];

const QUICK_ACTIONS = ["Add section", "Enhance profile", "Resources", "Get a resume"];

const loadProfile = () => {
  try { return JSON.parse(localStorage.getItem("tf_profile") || "{}"); }
  catch { return {}; }
};

const skillPctForIndex = (i) => Math.max(40, 92 - i * 5);

const Particles = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let id;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: PARTICLE_COUNT }, () => ({
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
        ctx.fillStyle = "rgba(0,210,200,0.6)"; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < PARTICLE_LINK_DIST) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,210,200,${0.1 * (1 - d / PARTICLE_LINK_DIST)})`;
          ctx.lineWidth = 0.6; ctx.stroke();
        }
      }));
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
};

const GlassCard = ({ children, className = "", style = {} }) => (
  <div className={className} style={{
    background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)",
    backdropFilter: "blur(16px)", borderRadius: 3,
    boxShadow: "0 0 40px rgba(0,210,200,0.04), 0 8px 32px rgba(0,0,0,0.35)",
    position: "relative", ...style,
  }}>
    <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.4),transparent)" }} />
    {children}
  </div>
);

const ST = ({ children }) => (
  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>{children}</p>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
    <div style={{ width: "100%", maxWidth: 520, margin: "0 16px", background: "rgba(3,11,18,0.99)", border: "1px solid rgba(0,210,200,0.2)", borderRadius: 3, boxShadow: "0 0 60px rgba(0,210,200,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid rgba(0,210,200,0.1)" }}>
        <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: "#fff", letterSpacing: "3px", textTransform: "uppercase" }}>{title}</p>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </div>
  </div>
);

const Field = ({ label, value, onChange, multiline, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 7 }}>{label}</p>
    {multiline
      ? <textarea value={value} onChange={onChange} rows={4} placeholder={placeholder}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,200,0.18)", padding: "10px 14px", fontSize: 13, color: "#fff", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
      : <input value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,200,0.18)", padding: "10px 14px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
    }
  </div>
);

const SaveBtn = ({ onClick, onDelete }) => (
  <div style={{ display: "flex", justifyContent: onDelete ? "space-between" : "flex-end", marginTop: 8 }}>
    {onDelete && (
      <button onClick={onDelete} style={{ color: "#ff5555", background: "none", border: "1px solid rgba(255,85,85,0.3)", padding: "7px 16px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>Delete</button>
    )}
    <button onClick={onClick} style={{ background: CYAN, color: "#000", border: "none", padding: "9px 26px", fontSize: 11, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif" }}>Save Changes</button>
  </div>
);

const SkillTag = ({ children }) => (
  <span style={{ border: "1px solid rgba(0,210,200,0.22)", color: CYAN, padding: "5px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "1px", display: "inline-block" }}>{children}</span>
);

const EditPen = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "none", border: "1px solid rgba(0,210,200,0.2)", color: "rgba(0,210,200,0.55)", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, transition: "all 0.2s" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = CYAN; e.currentTarget.style.color = CYAN; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,210,200,0.2)"; e.currentTarget.style.color = "rgba(0,210,200,0.55)"; }}>
    ✎
  </button>
);

const AddBtn = ({ onClick, label = "+ Add" }) => (
  <button onClick={onClick} style={{ background: "transparent", border: "1px solid rgba(0,210,200,0.25)", color: CYAN, padding: "5px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>{label}</button>
);

const Bar = ({ pct }) => (
  <div style={{ height: 3, background: "rgba(0,210,200,0.12)", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${CYAN},#0077aa)`, borderRadius: 2 }} />
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const photoRef = useRef(null);
  const bannerRef = useRef(null);
  const { user } = useAuth();

  const [photo, setPhoto]   = useState(null);
  const [banner, setBanner] = useState(null);
  const [modal, setModal]   = useState(null);
  const [ed, setEd]         = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const [info, setInfo] = useState({
    name:        DEFAULT_INFO.name,
    headline:    DEFAULT_INFO.headline,
    location:    DEFAULT_INFO.location,
    school:      DEFAULT_INFO.school,
    about:       DEFAULT_INFO.about,
    connections: DEFAULT_INFO.connections,
    followers:   DEFAULT_INFO.followers,
    openToWork:  DEFAULT_INFO.openToWork,
  });

  const [exp, setExp]       = useState([]);
  const [edu, setEdu]       = useState([]);
  const [skills, setSkills] = useState([]);
  const [links, setLinks]   = useState([]);
  const [certs, setCerts]   = useState(DEFAULT_CERTS);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await profileApi.getMe();
        if (cancelled) return;
        const fullName = data.user
          ? `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim()
          : DEFAULT_INFO.name;
        setInfo(prev => ({
          ...prev,
          name:     fullName || prev.name,
          headline: data.headline || prev.headline,
          location: data.location || prev.location,
          school:   data.school   || prev.school,
          about:    data.about    || prev.about,
        }));
        setExp((data.experience || []).map(e => ({ id: e._id, title: e.title, company: e.company, period: e.period, desc: "" })));
        setEdu((data.education  || []).map(e => ({ id: e._id, school: e.school, degree: e.degree, period: e.year || "" })));
        setSkills((data.skills || []).map((s, i) => ({ name: s, pct: skillPctForIndex(i) })));
        setLinks((data.links || []).map(l => ({ id: l._id, title: l.title, url: l.url })));
      } catch (err) {
        console.error("Failed to load profile:", err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  const open  = (key, data) => { setEd(data); setModal(key); };
  const close = () => setModal(null);

  const handleBannerUpload = (e) => {
    const f = e.target.files[0];
    if (f) setBanner(URL.createObjectURL(f));
  };

  const handlePhotoUpload = (e) => {
    const f = e.target.files[0];
    if (f) setPhoto(URL.createObjectURL(f));
  };

  const saveInfo = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await profileApi.updateMe({
        headline: ed.headline || "",
        location: ed.location || "",
        school:   ed.school   || "",
      });
      setInfo(p => ({ ...p, ...ed }));
      close();
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAbout = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await profileApi.updateMe({ about: ed.about || "" });
      setInfo(p => ({ ...p, about: ed.about }));
      close();
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addExp = async () => {
    if (!ed.title || saving) return;
    setSaving(true);
    try {
      const created = await profileApi.addExperience({ title: ed.title, company: ed.company || "", period: ed.period || "" });
      setExp(ex => [{ id: created._id, title: ed.title, company: ed.company || "", period: ed.period || "", desc: ed.desc || "" }, ...ex]);
      close();
    } catch (err) {
      alert("Failed to add: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateExp = () => {
    setExp(ex => ex.map(e => e.id === ed.id ? { ...ed } : e));
    close();
  };

  const deleteExp = async () => {
    const previous = exp;
    setExp(ex => ex.filter(e => e.id !== ed.id));
    close();
    try {
      await profileApi.deleteExperience(ed.id);
    } catch (err) {
      setExp(previous);
      alert("Failed to delete: " + err.message);
    }
  };

  const addEdu = async () => {
    if (!ed.school || saving) return;
    setSaving(true);
    try {
      const created = await profileApi.addEducation({ degree: ed.degree || "", school: ed.school, year: ed.period || "" });
      setEdu(ed2 => [...ed2, { id: created._id, school: ed.school, degree: ed.degree || "", period: ed.period || "" }]);
      close();
    } catch (err) {
      alert("Failed to add: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateEdu = () => {
    setEdu(ed2 => ed2.map(e => e.id === ed.id ? { ...ed } : e));
    close();
  };

  const deleteEdu = async () => {
    const previous = edu;
    setEdu(ed2 => ed2.filter(e => e.id !== ed.id));
    close();
    try {
      await profileApi.deleteEducation(ed.id);
    } catch (err) {
      setEdu(previous);
      alert("Failed to delete: " + err.message);
    }
  };

  const saveSkills = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const newNames = ed.skills.split(",").map(s => s.trim()).filter(Boolean);
      const currentNames = skills.map(s => s.name);
      const toAdd    = newNames.filter(n => !currentNames.includes(n));
      const toRemove = currentNames.filter(n => !newNames.includes(n));
      for (const name of toAdd) {
        await profileApi.addSkill(name);
      }
      for (const name of toRemove) {
        await profileApi.deleteSkill(name);
      }
      setSkills(newNames.map((name, i) => ({ name, pct: skillPctForIndex(i) })));
      close();
    } catch (err) {
      alert("Failed to save skills: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addCert = () => { if (ed.name) setCerts(c => [...c, { id: Date.now(), ...ed }]); close(); };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Barlow',sans-serif" }}>
      <style>{`
        @import url('${FONTS_URL}');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,210,200,0.3); }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2) !important; }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        .fs { animation: fadeSlide 0.4s ease forwards; }

        .profile-page    { padding: 28px 20px; }
        .profile-banner  { height: 180px; }
        .profile-card-pad { padding: 0 28px 24px; }
        .profile-card-inner { padding: 24px; }
        .profile-card-inner-sm { padding: 22px; }
        .profile-name    { font-size: 30px; }
        .profile-grid    { display: grid; grid-template-columns: 1fr 340px; gap: 16px; }
        .profile-photo-row { margin-top: -48px; }
        .profile-actions   { gap: 8px; }

        @media (max-width: 768px) {
          .profile-page    { padding: 16px 12px; }
          .profile-banner  { height: 120px; }
          .profile-card-pad { padding: 0 16px 18px; }
          .profile-card-inner { padding: 18px; }
          .profile-card-inner-sm { padding: 16px; }
          .profile-name    { font-size: 24px; }
          .profile-grid    { grid-template-columns: 1fr; gap: 14px; }
          .profile-photo-row { margin-top: -36px; }
          .profile-actions { width: 100%; }
          .profile-actions button { flex: 1; min-width: 110px; }
        }

        @media (max-width: 480px) {
          .profile-name    { font-size: 22px; }
          .profile-banner  { height: 100px; }
        }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}><Particles /></div>

      <Navbar variant="dashboard" />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }} className="fs profile-page">

        <GlassCard style={{ marginBottom: 16, overflow: "hidden" }}>

          <div className="profile-banner" style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#001520,#003344,#001520)" }}>
            {banner
              ? <img src={banner} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <Particles />
            }
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${CYAN},transparent)` }} />
            <button onClick={() => bannerRef.current?.click()} style={{ position: "absolute", top: 12, right: 12, background: "rgba(3,11,18,0.75)", border: "1px solid rgba(0,210,200,0.3)", color: CYAN, padding: "5px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", backdropFilter: "blur(8px)" }}>
              📷 Banner
            </button>
            <input ref={bannerRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBannerUpload} />
          </div>

          <div className="profile-card-pad">
            <div className="profile-photo-row" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>

              <div style={{ position: "relative" }}>
                <div style={{ width: 96, height: 96, borderRadius: "50%", border: `4px solid ${BG}`, overflow: "hidden", background: `linear-gradient(135deg,${CYAN},#0077aa)`, position: "relative", flexShrink: 0 }}>
                  {photo
                    ? <img src={photo} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 32, color: "#fff" }}>MM</div>
                  }
                  <button onClick={() => photoRef.current?.click()}
                    style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", border: "none", cursor: "pointer", color: "#fff", fontSize: 24, transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.55)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}>
                    📷
                  </button>
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
                <span style={{ position: "absolute", bottom: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "#22c55e", border: `3px solid ${BG}` }} />
              </div>

              <div className="profile-actions" style={{ display: "flex", flexWrap: "wrap" }}>
                {info.openToWork && (
                  <span style={{ border: `1px solid ${CYAN}`, color: CYAN, padding: "7px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
                    ● Open to Work
                  </span>
                )}
                <button onClick={() => navigate("/edit-profile")} style={{ background: CYAN, color: "#000", border: "none", padding: "8px 22px", fontSize: 11, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                  Edit Profile
                </button>
                <button style={{ border: "1px solid rgba(0,210,200,0.25)", color: "rgba(255,255,255,0.55)", background: "transparent", padding: "8px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                  Share
                </button>
              </div>
            </div>

            <p className="profile-name" style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, color: "#fff", letterSpacing: 1, lineHeight: 1 }}>{info.name}</p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 5 }}>{info.headline}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{info.location} · {info.school}</p>

            <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
              {[["Connections", info.connections], ["Followers", info.followers], ["Profile views this week", "47"]].map(([k, v]) => (
                <div key={k}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: CYAN, fontFamily: "'Rajdhani',sans-serif" }}>{v} </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{k}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              {QUICK_ACTIONS.map(t => (
                <button key={t} style={{ background: "rgba(0,210,200,0.07)", border: "1px solid rgba(0,210,200,0.18)", color: "rgba(255,255,255,0.55)", padding: "6px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "1px", cursor: "pointer", borderRadius: 20 }}>{t}</button>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="profile-grid">

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <GlassCard>
              <div className="profile-card-inner">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <ST>About</ST>
                  <EditPen onClick={() => open("about", { about: info.about })} />
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.85, color: "rgba(255,255,255,0.65)" }}>{info.about}</p>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="profile-card-inner">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <ST>Experience</ST>
                  <AddBtn onClick={() => open("addExp", { title: "", company: "", period: "", desc: "" })} />
                </div>
                {exp.map((e, i) => (
                  <div key={e.id} style={{ display: "flex", gap: 16, marginBottom: i < exp.length - 1 ? 22 : 0, paddingBottom: i < exp.length - 1 ? 22 : 0, borderBottom: i < exp.length - 1 ? "1px solid rgba(0,210,200,0.07)" : "none" }}>
                    <div style={{ width: 44, height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: "rgba(0,210,200,0.08)", border: "1px solid rgba(0,210,200,0.15)", borderRadius: 3 }}>💼</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: 0.5 }}>{e.title}</p>
                          <p style={{ fontSize: 13, color: CYAN, fontWeight: 600, marginTop: 2 }}>{e.company}</p>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2, letterSpacing: 1 }}>{e.period}</p>
                        </div>
                        <EditPen onClick={() => open("editExp", { ...e })} />
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8, lineHeight: 1.7 }}>{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="profile-card-inner">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <ST>Education</ST>
                  <AddBtn onClick={() => open("addEdu", { school: "", degree: "", period: "" })} />
                </div>
                {edu.map((e, i) => (
                  <div key={e.id} style={{ display: "flex", gap: 16, marginBottom: i < edu.length - 1 ? 18 : 0 }}>
                    <div style={{ width: 44, height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: "rgba(0,210,200,0.08)", border: "1px solid rgba(0,210,200,0.15)", borderRadius: 3 }}>🎓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>{e.school}</p>
                          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{e.degree}</p>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2, letterSpacing: 1 }}>{e.period}</p>
                        </div>
                        <EditPen onClick={() => open("editEdu", { ...e })} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="profile-card-inner">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <ST>Certifications</ST>
                  <AddBtn onClick={() => open("addCert", { name: "", issuer: "", year: "" })} />
                </div>
                {certs.map((c, i) => (
                  <div key={c.id} style={{ display: "flex", gap: 16, marginBottom: i < certs.length - 1 ? 18 : 0, paddingBottom: i < certs.length - 1 ? 18 : 0, borderBottom: i < certs.length - 1 ? "1px solid rgba(0,210,200,0.07)" : "none" }}>
                    <div style={{ width: 44, height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: "rgba(0,210,200,0.08)", border: "1px solid rgba(0,210,200,0.15)", borderRadius: 3 }}>🏆</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff" }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: CYAN, marginTop: 2 }}>{c.issuer}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>Issued {c.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <GlassCard>
              <div className="profile-card-inner-sm">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <ST>Skills</ST>
                  <EditPen onClick={() => open("skills", { skills: skills.map(s => s.name).join(", ") })} />
                </div>
                {skills.map(s => (
                  <div key={s.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: CYAN, fontWeight: 700 }}>{s.pct}%</p>
                    </div>
                    <Bar pct={s.pct} />
                  </div>
                ))}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(0,210,200,0.07)", display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skills.map(s => <SkillTag key={s.name}>{s.name}</SkillTag>)}
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="profile-card-inner-sm">
                <ST>Analytics</ST>
                {ANALYTICS.map((a, i) => (
                  <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < ANALYTICS.length - 1 ? 16 : 0, paddingBottom: i < ANALYTICS.length - 1 ? 16 : 0, borderBottom: i < ANALYTICS.length - 1 ? "1px solid rgba(0,210,200,0.07)" : "none" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{a.label}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 1 }}>{a.note}</p>
                    </div>
                    <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 22, color: CYAN }}>{a.val}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="profile-card-inner-sm">
                <ST>Status</ST>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Open to work</p>
                  <button onClick={() => setInfo(p => ({ ...p, openToWork: !p.openToWork }))}
                    style={{ width: 44, height: 24, borderRadius: 12, background: info.openToWork ? CYAN : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
                    <span style={{ position: "absolute", top: 3, left: info.openToWork ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.25s", display: "block" }} />
                  </button>
                </div>
                {info.openToWork && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>Recruiters can see you're open to new opportunities.</p>}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="profile-card-inner-sm">
                <ST>Languages</ST>
                {LANGUAGES.map(l => (
                  <div key={l.lang} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{l.lang}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: CYAN, border: "1px solid rgba(0,210,200,0.25)", padding: "2px 8px" }}>{l.level}</span>
                    </div>
                    <Bar pct={l.pct} />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {modal === "info" && (
        <Modal title="Edit Profile Info" onClose={close}>
          <Field label="Full Name"  value={ed.name}     onChange={e => setEd(d => ({ ...d, name: e.target.value }))} />
          <Field label="Headline"   value={ed.headline} onChange={e => setEd(d => ({ ...d, headline: e.target.value }))} />
          <Field label="Location"   value={ed.location} onChange={e => setEd(d => ({ ...d, location: e.target.value }))} />
          <Field label="School"     value={ed.school}   onChange={e => setEd(d => ({ ...d, school: e.target.value }))} />
          <SaveBtn onClick={saveInfo} />
        </Modal>
      )}

      {modal === "about" && (
        <Modal title="Edit About" onClose={close}>
          <Field label="About" value={ed.about} onChange={e => setEd(d => ({ ...d, about: e.target.value }))} multiline />
          <SaveBtn onClick={saveAbout} />
        </Modal>
      )}

      {modal === "addExp" && (
        <Modal title="Add Experience" onClose={close}>
          <Field label="Job Title"   value={ed.title}   onChange={e => setEd(d => ({ ...d, title: e.target.value }))}   placeholder="e.g. Frontend Developer" />
          <Field label="Company"     value={ed.company} onChange={e => setEd(d => ({ ...d, company: e.target.value }))} placeholder="e.g. Instabug" />
          <Field label="Period"      value={ed.period}  onChange={e => setEd(d => ({ ...d, period: e.target.value }))}  placeholder="e.g. 2022 – Present" />
          <Field label="Description" value={ed.desc}    onChange={e => setEd(d => ({ ...d, desc: e.target.value }))}    multiline placeholder="Describe your role…" />
          <SaveBtn onClick={addExp} />
        </Modal>
      )}

      {modal === "editExp" && (
        <Modal title="Edit Experience" onClose={close}>
          <Field label="Job Title"   value={ed.title}   onChange={e => setEd(d => ({ ...d, title: e.target.value }))} />
          <Field label="Company"     value={ed.company} onChange={e => setEd(d => ({ ...d, company: e.target.value }))} />
          <Field label="Period"      value={ed.period}  onChange={e => setEd(d => ({ ...d, period: e.target.value }))} />
          <Field label="Description" value={ed.desc}    onChange={e => setEd(d => ({ ...d, desc: e.target.value }))} multiline />
          <SaveBtn onClick={updateExp} onDelete={deleteExp} />
        </Modal>
      )}

      {modal === "addEdu" && (
        <Modal title="Add Education" onClose={close}>
          <Field label="School" value={ed.school} onChange={e => setEd(d => ({ ...d, school: e.target.value }))} placeholder="e.g. Cairo University" />
          <Field label="Degree" value={ed.degree} onChange={e => setEd(d => ({ ...d, degree: e.target.value }))} placeholder="e.g. BSc Computer Science" />
          <Field label="Period" value={ed.period} onChange={e => setEd(d => ({ ...d, period: e.target.value }))} placeholder="e.g. 2020 – 2024" />
          <SaveBtn onClick={addEdu} />
        </Modal>
      )}

      {modal === "editEdu" && (
        <Modal title="Edit Education" onClose={close}>
          <Field label="School" value={ed.school} onChange={e => setEd(d => ({ ...d, school: e.target.value }))} />
          <Field label="Degree" value={ed.degree} onChange={e => setEd(d => ({ ...d, degree: e.target.value }))} />
          <Field label="Period" value={ed.period} onChange={e => setEd(d => ({ ...d, period: e.target.value }))} />
          <SaveBtn onClick={updateEdu} onDelete={deleteEdu} />
        </Modal>
      )}

      {modal === "skills" && (
        <Modal title="Edit Skills" onClose={close}>
          <Field label="Skills (comma separated)" value={ed.skills} onChange={e => setEd(d => ({ ...d, skills: e.target.value }))} placeholder="React, TypeScript, Node.js…" />
          <SaveBtn onClick={saveSkills} />
        </Modal>
      )}

      {modal === "addCert" && (
        <Modal title="Add Certification" onClose={close}>
          <Field label="Certificate Name"     value={ed.name}   onChange={e => setEd(d => ({ ...d, name: e.target.value }))}   placeholder="e.g. AWS Certified Developer" />
          <Field label="Issuing Organization" value={ed.issuer} onChange={e => setEd(d => ({ ...d, issuer: e.target.value }))} placeholder="e.g. Amazon Web Services" />
          <Field label="Year"                 value={ed.year}   onChange={e => setEd(d => ({ ...d, year: e.target.value }))}   placeholder="e.g. 2023" />
          <SaveBtn onClick={addCert} />
        </Modal>
      )}
    </div>
  );
}