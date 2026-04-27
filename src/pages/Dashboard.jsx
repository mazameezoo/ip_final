import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jobsApi, postsApi } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const CYAN = "#00d2c8";
const BG   = "#030b12";


const mapPost = (p, currentUserId) => {
  const created = p.createdAt ? new Date(p.createdAt) : null;
  let time = "now";
  if (created) {
    const sec = Math.floor((Date.now() - created.getTime()) / 1000);
    if (sec < 60)         time = "just now";
    else if (sec < 3600)  time = `${Math.floor(sec / 60)}m`;
    else if (sec < 86400) time = `${Math.floor(sec / 3600)}h`;
    else if (sec < 604800) time = `${Math.floor(sec / 86400)}d`;
    else                  time = `${Math.floor(sec / 604800)}w`;
  }
  const a = p.author || {};
  const fullName = `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.email || "Unknown";
  const role = a.role === "employer"
    ? `${a.role.charAt(0).toUpperCase() + a.role.slice(1)}${a.company ? ` at ${a.company}` : ""}`
    : (a.role ? a.role.charAt(0).toUpperCase() + a.role.slice(1) : "Member");
  const likeIds = (p.likes || []).map(x => typeof x === "string" ? x : x?._id?.toString?.() || x?.toString?.());
  const liked = currentUserId ? likeIds.includes(currentUserId.toString()) : false;
  return {
    id:        p._id,
    author:    fullName,
    authorId:  a._id,
    role,
    time,
    likes:     likeIds.length,
    liked,
    comments:  (p.comments || []).length,
    shares:    p.shares || 0,
    content:   p.content,
    tag:       p.tag,
    saved:     false,
    rawComments: (p.comments || []).map(c => ({
      _id: c._id,
      text: c.text,
      author: c.author
        ? `${c.author.firstName || ""} ${c.author.lastName || ""}`.trim() || c.author.email
        : "Unknown",
    })),
  };
};


const mapJob = (j) => {
  const created = j.createdAt ? new Date(j.createdAt) : null;
  let posted = "recently";
  if (created) {
    const days = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0)        posted = "today";
    else if (days === 1)  posted = "1d ago";
    else if (days < 7)    posted = `${days}d ago`;
    else if (days < 30)   posted = `${Math.floor(days / 7)}w ago`;
    else                  posted = `${Math.floor(days / 30)}mo ago`;
  }
  return {
    _id:      j._id,
    role:     j.title,
    company:  j.company,
    location: j.location,
    type:     j.type,
    posted,
    raw:      j,
  };
};

const ThemeCtx = createContext({ dark: true });
const useTheme = () => useContext(ThemeCtx);
const t = (dark, d, l) => dark ? d : l;

const ParticlesBg = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let id;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.5,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,210,200,0.65)"; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 140) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,210,200,${0.12 * (1 - d / 140)})`;
          ctx.lineWidth = 0.7; ctx.stroke();
        }
      }));
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
};

const ME = {
  name: "Mazen Mohamed",
  title: "Full-Stack Developer",
  location: "New Cairo, Cairo",
  school: "The British University in Egypt",
  connections: 312,
  viewers: 7,
  photo: null,
};

const Avatar = ({ name, size = 40, online }) => {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const isMe = name === ME.name;
  const photo = isMe ? ME.photo : null;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg,${CYAN},#0077aa)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 800, color: "#fff",
        fontFamily: "'Rajdhani',sans-serif", overflow: "hidden",
        position: "relative",
      }}>
        {photo
          ? <img src={photo} alt={name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          : initials
        }
      </div>
      {online && <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: "#22c55e", border: `2px solid ${BG}` }} />}
    </div>
  );
};

const Btn = ({ children, onClick, outline, small, full }) => (
  <button onClick={onClick}
    style={{
      ...(outline
        ? { border: `1px solid ${CYAN}`, color: CYAN, background: "transparent" }
        : { background: CYAN, color: "#000", border: "none" }),
      padding: small ? "5px 14px" : "9px 22px",
      fontSize: small ? 11 : 13,
      fontWeight: 700,
      letterSpacing: "2px",
      textTransform: "uppercase",
      cursor: "pointer",
      width: full ? "100%" : undefined,
      transition: "all 0.2s",
      fontFamily: "'Rajdhani',sans-serif",
    }}>
    {children}
  </button>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(5,15,26,0.88)",
    border: "1px solid rgba(0,210,200,0.14)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 0 40px rgba(0,210,200,0.04), 0 8px 32px rgba(0,0,0,0.3)",
    borderRadius: 3,
    ...style,
  }}>{children}</div>
);

const GlowCard = ({ children, style = {} }) => (
  <div style={{ position: "relative", ...style }}>
    <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.5),transparent)", zIndex: 1 }} />
    <Card style={{ width: "100%", height: "100%" }}>{children}</Card>
  </div>
);

const SL = ({ children }) => (
  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", color: "rgba(255,255,255,0.35)", marginBottom: 14, textTransform: "uppercase" }}>{children}</p>
);

const Divider = () => <div style={{ height: 1, background: "rgba(0,210,200,0.08)", margin: "12px 0" }} />;

const POSTS_INIT = [];

const CONNECTIONS = [
  { name: "Emam Awad",       role: "HE Leader | MAEd | 10+ Years Teaching",     mutual: 12 },
  { name: "Mohamed Elsayed", role: "Senior Frontend Engineer | React & Next.js", mutual: 5  },
  { name: "Nour Hassan",     role: "Product Manager at Careem",                  mutual: 8  },
];

const JOBS = []

const TRENDS = ["#ReactJS", "#OpenToWork", "#AITools", "#WebDev", "#EgyptTech"];
const NAV_ITEMS = ["Home", "Network", "Jobs", "Messaging", "Notifications"];

const PostCard = ({ post, onUpdate, onLike, onComment }) => {
  const [expanded, setExpanded] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const submit = async () => {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      await onComment(post.id, commentText.trim());
      setCommentText("");
    } catch (err) {
      alert("Failed to comment: " + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <GlowCard style={{ marginBottom: 14 }}>
      <div style={{ padding: "18px 18px 12px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Avatar name={post.author} size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: "#fff", letterSpacing: 0.5 }}>{post.author}</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{post.role}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 2 }}>{post.time}</p>
        </div>
        <button style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", fontSize: 20, cursor: "pointer", paddingTop: 2 }}>···</button>
      </div>

      <div style={{ padding: "0 18px 14px" }}>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.78)" }}>
          {expanded ? post.content : post.content.slice(0, 140) + (post.content.length > 140 ? "…" : "")}
          {post.content.length > 140 && (
            <button onClick={() => setExpanded(e => !e)} style={{ color: CYAN, background: "none", border: "none", fontWeight: 700, cursor: "pointer", marginLeft: 4, fontSize: 14 }}>
              {expanded ? "less" : "more"}
            </button>
          )}
        </p>
        {post.tag && (
          <span style={{ display: "inline-block", marginTop: 10, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", border: `1px solid ${CYAN}`, color: CYAN, textTransform: "uppercase" }}>
            #{post.tag}
          </span>
        )}
      </div>

      <div style={{ padding: "8px 18px", display: "flex", gap: 16, fontSize: 12, color: "rgba(255,255,255,0.3)", borderTop: "1px solid rgba(0,210,200,0.07)", borderBottom: "1px solid rgba(0,210,200,0.07)" }}>
        <span>👍 {post.likes}</span>
        <span>💬 {post.comments}</span>
        <span>↗ {post.shares}</span>
      </div>

      <div style={{ display: "flex", padding: "2px 8px" }}>
        {[
          { icon: post.liked ? "💙" : "👍", label: post.liked ? "Liked" : "Like",  action: () => onLike(post.id) },
          { icon: "💬",                       label: "Comment",                      action: () => setCommenting(c => !c) },
          { icon: "↗",                        label: "Share",                        action: () => {} },
          { icon: post.saved ? "🔖" : "🏷",  label: post.saved ? "Saved" : "Save", action: () => onUpdate(post.id, { saved: !post.saved }) },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            className="dash-action-btn"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 4px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.32)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = CYAN}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.32)"}>
            <span>{btn.icon}</span><span className="dash-action-label">{btn.label}</span>
          </button>
        ))}
      </div>

      {commenting && (
        <div style={{ padding: "12px 18px 14px", borderTop: "1px solid rgba(0,210,200,0.07)" }}>
          {(post.rawComments || []).map((c, i) => (
            <div key={c._id || i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <Avatar name={c.author} size={28} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: CYAN, marginBottom: 2 }}>{c.author}</p>
                <div style={{ padding: "8px 12px", fontSize: 12, background: "rgba(0,210,200,0.06)", color: "rgba(255,255,255,0.7)", borderRadius: 2 }}>{c.text}</div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Avatar name={ME.name} size={32} />
            <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="Add a comment…"
              disabled={submittingComment}
              style={{ flex: 1, background: "transparent", border: "1px solid rgba(0,210,200,0.25)", padding: "8px 12px", fontSize: 13, color: "#fff", outline: "none" }} />
            <button onClick={submit} disabled={submittingComment} style={{ padding: "8px 16px", background: CYAN, border: "none", fontWeight: 900, fontSize: 12, color: "#000", cursor: submittingComment ? "wait" : "pointer", opacity: submittingComment ? 0.6 : 1 }}>→</button>
          </div>
        </div>
      )}
    </GlowCard>
  );
};

const LeftSidebar = ({ me }) => {
  const navigate = useNavigate();
  const [following, setFollowing] = useState([false, false, false]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <GlowCard>
        <div style={{ height: 72, background: "linear-gradient(135deg,#001a1f,#004455)", position: "relative", overflow: "hidden", borderRadius: "3px 3px 0 0" }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", background: "rgba(0,210,200,0.5)", left: `${i * 11}%`, top: `${15 + (i % 4) * 20}%` }} />
          ))}
          <div style={{ position: "absolute", bottom: -24, left: 20 }}>
            <Avatar name={me.name} size={56} online />
          </div>
        </div>
        <div style={{ padding: "32px 20px 18px" }}>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 18, color: "#fff", letterSpacing: 1 }}>{me.name}</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{me.title}</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{me.location}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>{me.school}</p>
          <Divider />
          {[["Profile viewers", me.viewers], ["Connections", me.connections]].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
              <span style={{ fontWeight: 800, color: CYAN }}>{val}</span>
            </div>
          ))}
          <div style={{ marginTop: 12 }}><Btn outline small full onClick={() => navigate("/analytics")}>View Analytics</Btn></div>
        </div>
      </GlowCard>

      <Card style={{ padding: 18 }}>
        <SL>Add to your feed</SL>
        {CONNECTIONS.map((c, i) => (
          <div key={c.name} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < CONNECTIONS.length - 1 ? 14 : 0 }}>
            <Avatar name={c.name} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{c.role}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>{c.mutual} mutual</p>
            </div>
            <button onClick={() => setFollowing(f => f.map((v, j) => j === i ? !v : v))}
              style={following[i]
                ? { background: CYAN, color: "#000", border: `1px solid ${CYAN}`, width: 28, height: 28, fontWeight: 700, fontSize: 14, cursor: "pointer", flexShrink: 0, borderRadius: 2 }
                : { background: "transparent", color: CYAN, border: `1px solid ${CYAN}`, width: 28, height: 28, fontWeight: 700, fontSize: 18, cursor: "pointer", flexShrink: 0, borderRadius: 2 }}>
              {following[i] ? "✓" : "+"}
            </button>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 18 }}>
        <SL>Trending</SL>
        {TRENDS.map((tr, i) => (
          <div key={tr} style={{ padding: "9px 0", borderBottom: i < TRENDS.length - 1 ? "1px solid rgba(0,210,200,0.07)" : "none" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: CYAN, cursor: "pointer", letterSpacing: 1 }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.65"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>{tr}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

const RightSidebar = ({ jobs = [], loading = false }) => {
  const [applied, setApplied] = useState([]);
  return (
    <GlowCard>
      <div style={{ padding: 22 }}>
        <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 18, color: "#fff", letterSpacing: 2, marginBottom: 18, textTransform: "uppercase" }}>
          Jobs <span style={{ color: CYAN }}>For You</span>
        </p>
        {loading && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: "20px 0" }}>Loading jobs…</p>
        )}
        {!loading && jobs.length === 0 && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>No jobs available yet.</p>
        )}
        {!loading && jobs.map((j, i) => (
          <div key={j._id || j.role} style={{ marginBottom: i < jobs.length - 1 ? 18 : 0, paddingBottom: i < jobs.length - 1 ? 18 : 0, borderBottom: i < jobs.length - 1 ? "1px solid rgba(0,210,200,0.08)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 3, height: 36, background: CYAN, opacity: 0.6, flexShrink: 0, borderRadius: 2 }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: "#fff", letterSpacing: 0.5 }}>{j.role}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: CYAN, marginTop: 1 }}>{j.company}</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 3, paddingLeft: 11 }}>
              {j.location} ·{" "}
              <span style={{ border: "1px solid rgba(0,210,200,0.3)", padding: "1px 6px", fontSize: 10, letterSpacing: 1, color: "rgba(0,210,200,0.7)" }}>{j.type}</span>
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 10, paddingLeft: 11 }}>{j.posted}</p>
            <button onClick={() => setApplied(a => a.includes(i) ? a : [...a, i])}
              style={applied.includes(i)
                ? { background: CYAN, color: "#000", border: `1px solid ${CYAN}`, padding: "6px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", width: "100%", transition: "all 0.2s" }
                : { background: "transparent", color: CYAN, border: `1px solid ${CYAN}`, padding: "6px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", width: "100%", transition: "all 0.2s" }}>
              {applied.includes(i) ? "✓ Applied" : "Quick Apply"}
            </button>
          </div>
        ))}
      </div>
    </GlowCard>
  );
};

const ThemeToggle = ({ dark, setDark }) => (
  <button onClick={() => setDark(d => !d)}
    style={{ border: `1px solid ${CYAN}`, color: CYAN, background: "transparent", padding: "6px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif" }}>
    {dark ? "☀ Light" : "🌙 Dark"}
  </button>
);

export default function Dashboard() {
  const [dark, setDark] = useState(true);
  const [activeNav, setActiveNav] = useState("Home");
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postText, setPostText] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [notifications, setNotifications] = useState(9);
  const [messages, setMessages] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Top");
  const [composing, setComposing] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { from: "them", text: "Hey, are you available for a quick chat?" },
    { from: "me",   text: "Sure! What's up?" },
  ]);
  const [jobs,        setJobs]        = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  const { user } = useAuth();
  const currentUserId = user?._id;

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const data = await jobsApi.getAll();
        if (!cancelled) setJobs(data.map(mapJob));
      } catch (err) {
        console.error("Failed to load jobs:", err.message);
      } finally {
        if (!cancelled) setJobsLoading(false);
      }
    };
    fetchJobs();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const sortParam = sortBy === "Top" ? "top" : "recent";
        const data = await postsApi.getAll(sortParam);
        if (!cancelled) setPosts(data.map(p => mapPost(p, currentUserId)));
      } catch (err) {
        console.error("Failed to load posts:", err.message);
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    };
    fetchPosts();
    return () => { cancelled = true; };
  }, [sortBy, currentUserId]);

  const navigate = useNavigate();
  const updatePost = (id, ch) => setPosts(ps => ps.map(p => p.id === id ? { ...p, ...ch } : p));

  const submitPost = async () => {
    if (!postText.trim() || submittingPost) return;
    setSubmittingPost(true);
    try {
      const created = await postsApi.create({ content: postText.trim(), tag: null });
      const mapped = mapPost(created, currentUserId);
      setPosts(ps => [mapped, ...ps]);
      setPostText("");
      setComposing(false);
    } catch (err) {
      alert("Failed to post: " + err.message);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handlePostLike = async (id) => {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
    try {
      await postsApi.toggleLike(id);
    } catch (err) {
      setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
      alert("Failed to like: " + err.message);
    }
  };

  const handlePostComment = async (id, text) => {
    const newComment = await postsApi.addComment(id, text);
    const commentObj = {
      _id: newComment._id,
      text: newComment.text,
      author: newComment.author
        ? `${newComment.author.firstName || ""} ${newComment.author.lastName || ""}`.trim() || newComment.author.email
        : (user ? `${user.firstName} ${user.lastName}`.trim() : "You"),
    };
    setPosts(ps => ps.map(p => p.id === id ? {
      ...p,
      comments: p.comments + 1,
      rawComments: [...(p.rawComments || []), commentObj],
    } : p));
  };

  const sendChat = () => { if (!chatMsg.trim()) return; setChatHistory(h => [...h, { from: "me", text: chatMsg }]); setChatMsg(""); };

  const filteredPosts = searchQuery ? posts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()) || p.author.toLowerCase().includes(searchQuery.toLowerCase())) : posts;

  return (
    <ThemeCtx.Provider value={{ dark }}>
      <div style={{ minHeight: "100vh", background: dark ? BG : "#f0fdff", fontFamily: "'Barlow',sans-serif", position: "relative" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Rajdhani:wght@600;700;900&display=swap');
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb { background: rgba(0,210,200,0.3); }
          @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
          .fi { animation: fadeIn 0.3s ease forwards; }
          input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22) !important; }

          /* Layout classes */
          .dash-shell      { padding: 28px 28px; }
          .dash-nav-row    { padding: 0 28px; height: 58px; gap: 20px; }
          .dash-search     { max-width: 320px; flex: 1; }
          .dash-nav-items  { display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center; }
          .dash-nav-right  { display: flex; align-items: center; gap: 10px; }
          .dash-stat-bar   { padding: 0 28px; }
          .dash-stat-list  { display: flex; gap: 48px; }
          .dash-home-grid  { display: grid; grid-template-columns: 300px 1fr 320px; gap: 22px; align-items: flex-start; }
          .dash-feed-grid  { display: grid; grid-template-columns: 1fr 340px; gap: 22px; align-items: flex-start; }
          .dash-msg-card   { display: flex; height: 520px; }
          .dash-msg-side   { width: 240px; border-right: 1px solid rgba(0,210,200,0.1); overflow-y: auto; flex-shrink: 0; }
          .dash-section-title { font-family: 'Rajdhani',sans-serif; font-weight: 900; font-size: 34px; color: ${CYAN}; letter-spacing: 2px; margin-bottom: 22px; }
          .dash-action-label { display: inline; }

          /* Tablet */
          @media (max-width: 1024px) {
            .dash-home-grid  { grid-template-columns: 1fr 320px; }
            .dash-feed-grid  { grid-template-columns: 1fr 320px; }
            .dash-shell      { padding: 22px 18px; }
            .dash-nav-row    { padding: 0 16px; gap: 12px; }
            .dash-search     { max-width: 220px; }
          }

          /* Mobile */
          @media (max-width: 768px) {
            .dash-shell      { padding: 16px 12px; }
            .dash-nav-row    { padding: 0 12px; height: 54px; gap: 8px; }
            .dash-search     { display: none; }
            .dash-stat-bar   { display: none !important; }
            .dash-home-grid  { grid-template-columns: 1fr; gap: 14px; }
            .dash-feed-grid  { grid-template-columns: 1fr; gap: 14px; }
            .dash-section-title { font-size: 26px; margin-bottom: 16px; }
            .dash-msg-card   { flex-direction: column; height: auto; }
            .dash-msg-side   { width: 100%; max-height: 200px; border-right: none; border-bottom: 1px solid rgba(0,210,200,0.1); }
            .dash-action-label { display: none; }
            .dash-hide-mobile { display: none !important; }
            .dash-nav-items  { gap: 0; }
            .dash-nav-items button { padding: 8px 8px !important; font-size: 10px !important; letter-spacing: 1px !important; }
            .dash-sidebar-desktop-only { display: none !important; }
          }

          @media (max-width: 480px) {
            .dash-section-title { font-size: 22px; }
            .dash-nav-items button { padding: 8px 4px !important; font-size: 9px !important; }
            .dash-nav-right .dash-post-job-btn { display: none; }
          }
        `}</style>

        {dark && <ParticlesBg />}

        <nav style={{ position: "sticky", top: 0, zIndex: 50, background: dark ? "rgba(3,11,18,0.96)" : "rgba(255,255,255,0.97)", borderBottom: `1px solid ${dark ? "rgba(0,210,200,0.12)" : "#a5f3fc"}`, backdropFilter: "blur(16px)" }}>
          {dark && <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,200,0.45),transparent)" }} />}
          <div className="dash-nav-row" style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center" }}>
            <div style={{ flexShrink: 0, fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>
              <span style={{ color: dark ? "#fff" : "#111" }}>TALENT</span><span style={{ color: CYAN }}>FLOW</span>
            </div>
            <div className="dash-search" style={{ position: "relative" }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search posts, people…"
                style={{ width: "100%", background: dark ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${dark ? "rgba(0,210,200,0.2)" : "#67e8f9"}`, padding: "8px 36px 8px 14px", fontSize: 13, color: dark ? "#fff" : "#111", outline: "none" }} />
              {searchQuery && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: CYAN, fontSize: 15 }}>⌕</span>}
            </div>
            <div className="dash-nav-items">
              {NAV_ITEMS.map(n => (
                <button key={n} onClick={() => {
                  if (n === "Network") { navigate("/network"); return; }
                  if (n === "Messaging") { navigate("/messaging"); return; }
                  setActiveNav(n); if (n === "Notifications") setNotifications(0); if (n === "Messaging") setMessages(0);
                }}
                  style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: activeNav === n ? CYAN : (dark ? "rgba(255,255,255,0.38)" : "#9ca3af"), background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}>
                  {n}
                  {n === "Notifications" && notifications > 0 && <span style={{ position: "absolute", top: 4, right: 2, width: 17, height: 17, background: CYAN, borderRadius: "50%", fontSize: 9, fontWeight: 900, color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>{notifications}</span>}
                  {n === "Messaging"     && messages > 0      && <span style={{ position: "absolute", top: 4, right: 2, width: 17, height: 17, background: CYAN, borderRadius: "50%", fontSize: 9, fontWeight: 900, color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>{messages}</span>}
                  {activeNav === n && <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: CYAN }} />}
                </button>
              ))}
            </div>
            <div className="dash-nav-right">
              <div className="dash-hide-mobile"><ThemeToggle dark={dark} setDark={setDark} /></div>
              <button onClick={() => navigate("/employer-login")} className="dash-post-job-btn" style={{ background: CYAN, color: "#000", border: "none", padding: "8px 18px", fontSize: 11, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>Post a Job</button>
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={() => navigate("/profile")}>
                <Avatar name={ME.name} size={36} online />
              </button>
            </div>
          </div>
        </nav>

        <div className="dash-stat-bar" style={{ position: "relative", overflow: "hidden", padding: "10px 0", borderBottom: `1px solid ${dark ? "rgba(0,210,200,0.1)" : "#a5f3fc"}`, background: dark ? "rgba(3,11,18,0.75)" : "linear-gradient(90deg,#e0f7fa,#b2ebf2,#e0f7fa)" }}>
          <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "3.5px", color: CYAN, textTransform: "uppercase" }}>· Job Board & Applicant Tracking System ·</p>
            <div className="dash-stat-list">
              {[["12,400+", "Active Listings"], ["98K", "Hired"]].map(([val, lbl]) => (
                <div key={lbl} style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 24, color: CYAN, lineHeight: 1 }}>{val}</p>
                  <p style={{ fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", color: dark ? "rgba(255,255,255,0.28)" : "#0891b2", marginTop: 2 }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-shell" style={{ maxWidth: 1600, margin: "0 auto" }}>

          {activeNav === "Home" && (
            <div className="dash-home-grid">
              <div className="dash-sidebar-desktop-only"><LeftSidebar me={ME} /></div>
              <div>
                <GlowCard style={{ marginBottom: 16 }}>
                  <div style={{ padding: 18, display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <Avatar name={ME.name} size={44} online />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {!composing ? (
                        <button onClick={() => setComposing(true)}
                          style={{ width: "100%", textAlign: "left", padding: "11px 16px", background: "transparent", border: "1px solid rgba(0,210,200,0.14)", fontSize: 14, color: "rgba(255,255,255,0.28)", cursor: "pointer" }}>
                          Start a post…
                        </button>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <textarea autoFocus value={postText} onChange={e => setPostText(e.target.value)}
                            placeholder="What do you want to talk about?" rows={3}
                            style={{ width: "100%", background: "transparent", border: "1px solid rgba(0,210,200,0.35)", padding: "10px 14px", fontSize: 14, color: "#fff", outline: "none", resize: "none" }} />
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => { setComposing(false); setPostText(""); }}
                              style={{ padding: "6px 14px", fontSize: 12, border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.35)", background: "transparent", cursor: "pointer" }}>Cancel</button>
                            <Btn small onClick={submitPost} disabled={submittingPost}>{submittingPost ? "Posting…" : "Post"}</Btn>
                          </div>
                        </div>
                      )}
                      {!composing && (
                        <div style={{ display: "flex", gap: 22, marginTop: 12, flexWrap: "wrap" }}>
                          {[["📹", "Video"], ["📷", "Photo"], ["✍", "Article"]].map(([ico, lbl]) => (
                            <button key={lbl} onClick={() => setComposing(true)}
                              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.32)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.color = CYAN}
                              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.32)"}>
                              <span>{ico}</span>{lbl}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </GlowCard>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                  <p style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>Feed</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Top", "Recent"].map(s => (
                      <button key={s} onClick={() => setSortBy(s)}
                        style={sortBy === s
                          ? { background: CYAN, color: "#000", border: `1px solid ${CYAN}`, padding: "5px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }
                          : { background: "transparent", color: "rgba(255,255,255,0.38)", border: "1px solid rgba(0,210,200,0.18)", padding: "5px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {postsLoading && (
                  <Card style={{ padding: 36, textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Loading posts…</p>
                  </Card>
                )}

                {!postsLoading && filteredPosts.length === 0 && (
                  <Card style={{ padding: 36, textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.28)" }}>
                      {searchQuery ? "No posts match your search." : "No posts yet. Be the first to share something!"}
                    </p>
                  </Card>
                )}
                {!postsLoading && filteredPosts.map(p => <div key={p.id} className="fi"><PostCard post={p} onUpdate={updatePost} onLike={handlePostLike} onComment={handlePostComment} /></div>)}
              </div>
              <div className="dash-sidebar-desktop-only" style={{ position: "sticky", top: 80 }}><RightSidebar jobs={jobs} loading={jobsLoading} /></div>
            </div>
          )}

          {activeNav === "Network" && (
            <div className="fi" style={{ maxWidth: 760, margin: "0 auto" }}>
              <h2 className="dash-section-title">MY NETWORK</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[...CONNECTIONS, { name: "Dina Ramadan", role: "Machine Learning Engineer at Instabug", mutual: 3 }, { name: "Omar Sharaf", role: "Backend Developer | Node.js & Go", mutual: 11 }].map(c => (
                  <GlowCard key={c.name} style={{ padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
                    <Avatar name={c.name} size={54} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 17, color: "#fff" }}>{c.name}</p>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{c.role}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 2 }}>{c.mutual} mutual connections</p>
                    </div>
                    <Btn outline small>Connect</Btn>
                  </GlowCard>
                ))}
              </div>
            </div>
          )}

          {activeNav === "Jobs" && (
            <div className="fi" style={{ maxWidth: 760, margin: "0 auto" }}>
              <h2 className="dash-section-title" style={{ lineHeight: 1 }}>
                FIND THE RIGHT<br /><span style={{ color: "#fff" }}>TALENT.</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {jobsLoading && (
                  <div style={{ background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)", padding: 30, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 1 }}>
                    Loading jobs…
                  </div>
                )}
                {!jobsLoading && jobs.length === 0 && (
                  <div style={{ background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)", padding: 30, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 1 }}>
                    No jobs available yet. Check back soon.
                  </div>
                )}
                {!jobsLoading && jobs.map(j => (
                  <div key={j._id || j.role} className="fi" style={{ background: "rgba(5,15,26,0.9)", border: "1px solid rgba(0,210,200,0.13)", borderRadius: 3, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 19, color: "#fff" }}>{j.role}</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: CYAN, marginTop: 3 }}>{j.company}</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 5 }}>
                          {j.location} · <span style={{ border: "1px solid rgba(0,210,200,0.28)", padding: "1px 7px", fontSize: 10, letterSpacing: 1 }}>{j.type}</span>
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>{j.posted}</p>
                      </div>
                      <button onClick={() => navigate("/apply", { state: { job: j } })} style={{ background: CYAN, color: "#000", border: "none", padding: "8px 18px", fontSize: 11, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}>Apply →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === "Messaging" && (
            <div className="fi" style={{ maxWidth: 900, margin: "0 auto" }}>
              <h2 className="dash-section-title">MESSAGING</h2>
              <GlowCard className="dash-msg-card">
                <div className="dash-msg-side">
                  {CONNECTIONS.map((c, i) => (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer", borderBottom: "1px solid rgba(0,210,200,0.06)", background: i === 0 ? "rgba(0,210,200,0.07)" : "transparent" }}>
                      <Avatar name={c.name} size={38} online={i === 0} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Hey, are you available?</p>
                      </div>
                      {i === 0 && <span style={{ width: 8, height: 8, borderRadius: "50%", background: CYAN, flexShrink: 0 }} />}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 360 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid rgba(0,210,200,0.1)" }}>
                    <Avatar name={CONNECTIONS[0].name} size={38} online />
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{CONNECTIONS[0].name}</p>
                      <p style={{ fontSize: 11, color: CYAN }}>Online</p>
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                    {chatHistory.map((m, i) => (
                      m.from === "them"
                        ? <div key={i} style={{ display: "flex", gap: 10 }}><Avatar name={CONNECTIONS[0].name} size={30} /><div style={{ padding: "9px 14px", fontSize: 13, background: "rgba(0,210,200,0.08)", color: "rgba(255,255,255,0.75)", maxWidth: "70%", borderRadius: 2 }}>{m.text}</div></div>
                        : <div key={i} style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><div style={{ padding: "9px 14px", fontSize: 13, background: CYAN, color: "#000", maxWidth: "70%", borderRadius: 2, fontWeight: 600 }}>{m.text}</div><Avatar name={ME.name} size={30} /></div>
                    ))}
                  </div>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(0,210,200,0.1)", display: "flex", gap: 10 }}>
                    <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
                      style={{ flex: 1, background: "transparent", border: "1px solid rgba(0,210,200,0.22)", padding: "9px 14px", fontSize: 13, color: "#fff", outline: "none", minWidth: 0 }} placeholder="Write a message…" />
                    <button onClick={sendChat} style={{ padding: "9px 20px", background: CYAN, border: "none", fontWeight: 900, fontSize: 12, letterSpacing: "2px", color: "#000", cursor: "pointer", textTransform: "uppercase", flexShrink: 0 }}>Send →</button>
                  </div>
                </div>
              </GlowCard>
            </div>
          )}

          {activeNav === "Notifications" && (
            <div className="fi" style={{ maxWidth: 660, margin: "0 auto" }}>
              <h2 className="dash-section-title">NOTIFICATIONS</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Mansour Montaser liked your comment", "You have 3 new connection requests", "Sara Ahmed shared your post", "Your profile was viewed 7 times this week", "New job alert: React Developer at Instabug"].map((n, i) => (
                  <GlowCard key={n} className="fi" style={{ padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 22 }}>{["👍", "🤝", "↗", "👁", "💼"][i]}</span>
                    <p style={{ flex: 1, fontSize: 14, color: "rgba(255,255,255,0.72)" }}>{n}</p>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", whiteSpace: "nowrap" }}>just now</span>
                  </GlowCard>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid rgba(0,210,200,0.07)", marginTop: 48, padding: "18px 0" }}>
          <p style={{ textAlign: "center", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>
            TALENTFLOW · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
