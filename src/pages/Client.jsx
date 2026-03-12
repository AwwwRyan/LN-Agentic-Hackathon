import { useState, useEffect, useRef } from 'react';
import { Bot, Plus, Package, Clock, CheckCircle, Truck, Zap, TrendingDown, ArrowRight, Factory, ChevronRight, BarChart2, Bell, Settings, X, Calendar, MapPin, Search } from 'lucide-react';
function LocationAutocomplete({ placeholder, onChange }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLocations = async (text) => {
    if (!text) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://production.lorri.in/api/apiuser/autocomplete?suggest=${encodeURIComponent(text)}&limit=20&searchFields=new_locations`, {
        headers: {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "origin": "https://www.lorri.ai",
          "referer": "https://www.lorri.ai/"
        }
      });
      const data = await response.json();
      if (data && data.value) {
        setSuggestions(data.value);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Failed to fetch locations", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query && isOpen) {
        fetchLocations(query);
      } else if (!query) {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  return (
    <div style={{ position: 'relative' }} ref={wrapperRef}>
      <MapPin size={16} color="#A0A09A" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
      <input
        type="text"
        className="form-input"
        style={{ paddingLeft: 42 }}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => { if (query) setIsOpen(true); }}
      />

      {isOpen && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="autocomplete-item"
              onClick={() => {
                setQuery(item.location.suggestion || item.location_name);
                setIsOpen(false);
                if (onChange) onChange(item);
              }}
            >
              <div className="autocomplete-icon-wrap">
                <MapPin size={14} />
              </div>
              <div style={{ lineHeight: 1.4, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111110', letterSpacing: '-0.01em' }}>
                  {item.location?.location || item.location_name}
                </div>
                <div style={{ fontSize: 11, color: '#9A9A90', marginTop: 2 }}>
                  {item.location?.suggestion || item.location_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TRUCK_TYPES = [
  "12 WHEELER OPEN BODY TRUCK",
  "14 WHEELER OPEN BODY TRUCK",
  "15/16 MT",
  "17 FT CANTER",
  "19 FT CANTER",
  "20 FT SINGLE AXLE CONTAINER",
  "20/21 MT",
  "22 FT REEFER TRUCK",
  "23 MT",
  "24 FT REEFER TRUCK",
  "25 MT",
  "27 MT",
  "31 MT",
  "32 FT MULTI AXLE CONTAINER",
  "32 FT MULTI AXLE REEFER CONTAINER",
  "32 FT SINGLE AXLE CONTAINER",
  "32 FT SINGLE AXLE HQ CONTAINER",
  "40 FT MULTI AXLE CONTAINER",
  "6 MT OPEN BODY",
  "6 MT REEFER",
  "6 WHEELER OPEN BODY TRUCK",
  "7.5 MT",
  "9 MT",
  "TATA 207 REEFER",
  "TATA 407 REEFER"
];

export default function Client() {
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [btnHovered, setBtnHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agentStrategy, setAgentStrategy] = useState('autonomous');
  const cardRef = useRef(null);

  useEffect(() => {
    const handleMouse = (e) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAF8', minHeight: '100vh', color: '#111110' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --orange: #E8571A; --orange-light: #F97316;
          --orange-pale: #FFF3EE; --orange-border: #FDDCCC;
          --cream: #FAFAF8; --ink: #111110;
          --stone-100: #EBEBЕ5; --stone-200: #E0E0D8;
          --stone-400: #9A9A90; --stone-600: #5A5A52;
          --stone-800: #2A2A24;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pulse-ring {
          0%,100%{box-shadow:0 0 0 0 rgba(232,87,26,0.3), 0 4px 20px rgba(232,87,26,0.28)}
          50%{box-shadow:0 0 0 8px rgba(232,87,26,0), 0 4px 20px rgba(232,87,26,0.28)}
        }
        @keyframes dot-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes shimmer {
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }

        .anim { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        .d1{animation-delay:0.05s} .d2{animation-delay:0.12s}
        .d3{animation-delay:0.2s} .d4{animation-delay:0.3s}
        .d5{animation-delay:0.4s} .d6{animation-delay:0.5s}

        .section-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: #E8571A;
        }
        .section-label::before { content:''; width:20px; height:1.5px; background:#E8571A; }

        /* PRIMARY BUTTON */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 12px 24px; background: #E8571A; color: white;
          border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600; border-radius: 100px;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 2px 14px rgba(232,87,26,0.28);
          letter-spacing: -0.01em; position: relative; overflow: hidden;
        }
        .btn-primary::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg,rgba(255,255,255,0.15),transparent);
          opacity:0; transition:opacity 0.2s;
        }
        .btn-primary:hover { background:#D44E15; transform:translateY(-3px) scale(1.03); box-shadow:0 10px 28px rgba(232,87,26,0.4); }
        .btn-primary:hover::after { opacity:1; }
        .btn-primary:active { transform:translateY(-1px) scale(1.01); }

        /* ICON BUTTON */
        .icon-btn {
          width:38px; height:38px; border-radius:10px; border:1px solid #E0E0D8;
          background:white; display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          color:#9A9A90;
        }
        .icon-btn:hover { border-color:#E8571A; color:#E8571A; transform:scale(1.1); box-shadow:0 4px 12px rgba(232,87,26,0.15); }

        /* STAT CARD — stronger shadow so it lifts off #FAFAF8 */
        .stat-card {
          background: white;
          border: 1px solid #E8E8E2;
          border-radius: 20px;
          padding: 28px 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
          position: relative; overflow: hidden; cursor: default;
        }
        .stat-card::before {
          content:''; position:absolute; bottom:0; left:0; right:0; height:0;
          background:linear-gradient(0deg, rgba(232,87,26,0.04), transparent);
          transition: height 0.4s;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 56px rgba(0,0,0,0.11), 0 4px 12px rgba(0,0,0,0.06);
          border-color: #FDDCCC;
        }
        .stat-card:hover::before { height:100%; }

        .stat-number {
          font-family:'Playfair Display', serif;
          font-size:42px; font-weight:900; line-height:1;
          color:#E8571A; letter-spacing:-0.02em;
          transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .stat-card:hover .stat-number { transform:scale(1.06); }

        /* MAIN CARD — visible resting shadow */
        .main-card {
          background: white;
          border: 1px solid #E8E8E2;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .main-card:hover {
          box-shadow: 0 12px 48px rgba(0,0,0,0.11), 0 3px 10px rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }

        .card-header {
          background:#FAFAF8; border-bottom:1px solid #F0EFE9;
          padding:18px 24px; display:flex; align-items:center; gap:10px;
        }

        /* EMPTY STATE */
        .empty-state {
          border:1.5px dashed #E0E0D8; border-radius:16px;
          padding:56px 24px; display:flex; flex-direction:column;
          align-items:center; justify-content:center; text-align:center;
          background:#FAFAF8; transition: all 0.3s;
        }
        .empty-state:hover { border-color:#FDDCCC; background:#FFF8F5; }

        .empty-icon {
          width:60px; height:60px; background:white; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          border:1px solid #E0E0D8; margin-bottom:18px;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .empty-state:hover .empty-icon {
          transform:scale(1.12) translateY(-4px);
          border-color:#FDDCCC; box-shadow:0 8px 24px rgba(232,87,26,0.12);
        }
        .empty-state:hover .empty-icon svg { color:#E8571A !important; }

        /* AI CARD */
        .ai-card {
          background:#111110; border-radius:24px; overflow:hidden;
          position:relative; padding:32px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.14);
        }

        /* STEP ITEM */
        .step-item {
          display:flex; align-items:flex-start; gap:12px;
          padding:10px 12px; border-radius:12px;
          transition: all 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
          cursor:default;
        }
        .step-item:hover { background:rgba(255,255,255,0.06); transform:translateX(4px); }

        .step-check {
          width:22px; height:22px; border-radius:50%;
          border:1.5px solid rgba(232,87,26,0.4);
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; margin-top:1px;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .step-item:hover .step-check {
          background:rgba(232,87,26,0.15); border-color:#E8571A;
          transform:scale(1.15); box-shadow:0 0 0 4px rgba(232,87,26,0.1);
        }

        /* HINT CARD */
        .hint-card {
          background: white;
          border: 1px solid #FDDCCC;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex; gap: 14px; align-items: flex-start;
          box-shadow: 0 2px 12px rgba(232,87,26,0.08), 0 1px 4px rgba(0,0,0,0.04);
          transition: all 0.25s;
          cursor: default;
        }
        .hint-card:hover {
          box-shadow: 0 8px 28px rgba(232,87,26,0.13), 0 2px 8px rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }

        /* QUICK LINKS CARD */
        .quick-links-card {
          background: white;
          border: 1px solid #E8E8E2;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.3s;
        }
        .quick-links-card:hover {
          box-shadow: 0 6px 28px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.04);
        }

        /* LIVE DOT */
        .live-dot {
          width:7px; height:7px; border-radius:50%;
          background:#E8571A; animation:dot-blink 1.4s ease-in-out infinite;
          flex-shrink:0;
        }

        /* FLOAT BOT */
        .float-bot { animation:float 3.5s ease-in-out infinite; }

        /* SHIMMER TAG */
        .shimmer-tag {
          background:linear-gradient(90deg,#E8571A,#F97316,#E8571A);
          background-size:200% auto;
          animation:shimmer 2.5s linear infinite;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
        }

        .bg-dot-pattern {
          background-image:radial-gradient(circle,#D4D4CC 1px,transparent 1px);
          background-size:28px 28px;
        }

        /* PULSE RING on new btn */
        .pulse-ring { animation: pulse-ring 2.5s ease-in-out infinite; }

        /* MODAL ANIMATIONS */
        @keyframes modalOverlayFade { 
          from { opacity: 0; backdrop-filter: blur(0px); } 
          to { opacity: 1; backdrop-filter: blur(8px); } 
        }
        @keyframes modalContentPop { 
          0% { opacity: 0; transform: scale(0.95) translateY(20px); } 
          100% { opacity: 1; transform: scale(1) translateY(0); } 
        }

        .modal-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(17, 17, 16, 0.4);
          display: flex; align-items: center; justify-content: center;
          animation: modalOverlayFade 0.3s forwards;
          padding: 24px;
        }

        .modal-content {
          background: white; border-radius: 24px;
          width: 100%; max-width: 600px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 24px 80px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08);
          animation: modalContentPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          border: 1px solid #EBEBЕ5;
        }
        
        .modal-content::-webkit-scrollbar { width: 6px; }
        .modal-content::-webkit-scrollbar-track { background: transparent; }
        .modal-content::-webkit-scrollbar-thumb { background: #E0E0D8; border-radius: 10px; }

        .form-group { margin-bottom: 20px; }
        .form-label {
          display: block; font-size: 12px; font-weight: 600; 
          color: #5A5A52; margin-bottom: 8px; text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .form-input {
          width: 100%; padding: 14px 16px; border-radius: 12px;
          border: 1.5px solid #EBEBЕ5; background: #FAFAF8;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: #111110; transition: all 0.2s;
        }
        .form-input:focus {
          outline: none; border-color: #E8571A; background: white;
          box-shadow: 0 0 0 4px rgba(232,87,26,0.1);
        }
        .form-input::placeholder { color: #A0A09A; }

        .radio-group {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .radio-card {
          border: 1.5px solid #EBEBЕ5; border-radius: 12px;
          padding: 16px; cursor: pointer; transition: all 0.2s;
          display: flex; gap: 12px; background: #FAFAF8;
        }
        .radio-card:hover { border-color: #FDDCCC; background: #FFF3EE; }
        .radio-card.selected {
          border-color: #E8571A; background: #FFF3EE;
          box-shadow: 0 4px 12px rgba(232,87,26,0.1);
        }
        .radio-dot {
          width: 18px; height: 18px; border-radius: 50%;
          border: 1.5px solid #C0BFB8; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 2px;
        }
        .radio-card.selected .radio-dot { border-color: #E8571A; }
        .radio-card.selected .radio-dot::after {
          content: ''; width: 10px; height: 10px; background: #E8571A; border-radius: 50%;
        }

        .autocomplete-dropdown {
          position: absolute; top: 100%; left: 0; right: 0;
          background: white; border: 1px solid #EBEBЕ5; border-radius: 12px;
          margin-top: 6px; box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          max-height: 260px; overflow-y: auto; z-index: 1000;
        }
        .autocomplete-dropdown::-webkit-scrollbar { width: 6px; }
        .autocomplete-dropdown::-webkit-scrollbar-track { background: transparent; }
        .autocomplete-dropdown::-webkit-scrollbar-thumb { background: #E0E0D8; border-radius: 10px; }
        
        .autocomplete-item {
          padding: 12px 16px; transition: background 0.2s;
          border-bottom: 1px solid #F0EFE9; display: flex; align-items: flex-start; gap: 12px;
          cursor: pointer;
        }
        .autocomplete-item:last-child { border-bottom: none; }
        .autocomplete-item:hover { background: #FAFAF8; }
        .autocomplete-icon-wrap {
          width: 28px; height: 28px; background: #FFF3EE; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #E8571A; border: 1px solid #FDDCCC;
        }

      `}</style>


      {/* ── MAIN ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px 80px', position: 'relative' }}>

        {/* Subtle dot bg */}
        <div className="bg-dot-pattern" style={{ position: 'fixed', inset: 0, opacity: 0.25, pointerEvents: 'none', zIndex: 0 }}></div>
        {/* Ambient glow */}
        <div style={{ position: 'fixed', top: '20%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(249,115,22,0.07),transparent 70%)', pointerEvents: 'none', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── HEADER ── */}
          <div className="anim d1" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="section-label" style={{ marginBottom: 10 }}>Manufacturer Dashboard</div>
              <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 900, letterSpacing: '-0.025em', color: '#111110', lineHeight: 1.1 }}>
                Manage <span style={{ fontStyle: 'italic', color: '#E8571A' }}>Freight</span> Requests
              </h1>
              <p style={{ fontSize: 15, color: '#9A9A90', marginTop: 8, fontWeight: 400 }}>Oversee AI negotiations and track your savings in real-time.</p>
            </div>

            <button
              className="btn-primary pulse-ring"
              onClick={() => setIsModalOpen(true)}
              onMouseOver={() => setBtnHovered(true)}
              onMouseOut={() => setBtnHovered(false)}
            >
              <Plus size={17} style={{ transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)', transform: btnHovered ? 'rotate(90deg)' : 'rotate(0)' }} />
              New Shipment Request
              <ArrowRight size={14} style={{ opacity: btnHovered ? 1 : 0, transform: btnHovered ? 'translateX(0)' : 'translateX(-6px)', transition: 'all 0.2s' }} />
            </button>
          </div>

          {/* ── STAT STRIP ── */}
          {/* <div className="anim d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Savings', val: '₹0', sub: '0% this month', icon: <TrendingDown size={16} /> },
              { label: 'Active Agents', val: '0', sub: 'Ready to deploy', icon: <Zap size={16} /> },
              { label: 'Negotiations', val: '0', sub: 'Lifetime total', icon: <BarChart2 size={16} /> },
              { label: 'Avg Reduction', val: '—', sub: 'vs manual rates', icon: <CheckCircle size={16} /> },
            ].map((s, i) => (
              <div key={i} className="stat-card"
                onMouseOver={() => setHoveredStat(i)}
                onMouseOut={() => setHoveredStat(null)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: '#9A9A90', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em' }}>{s.label}</div>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: hoveredStat === i ? '#FFF3EE' : '#F5F5F0', border: `1px solid ${hoveredStat === i ? '#FDDCCC' : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: hoveredStat === i ? '#E8571A' : '#C0BFB8', transition: 'all 0.3s' }}>
                    {s.icon}
                  </div>
                </div>
                <div className="stat-number">{s.val}</div>
                <div style={{ fontSize: 12, color: i === 0 ? '#E8571A' : '#9A9A90', fontWeight: 500, marginTop: 8 }}>{s.sub}</div>
              </div>
            ))}
          </div> */}

          {/* ── GRID ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Active Requests card */}
              <div className="main-card anim d3">
                <div className="card-header">
                  <div style={{ width: 32, height: 32, background: '#FFF3EE', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #FDDCCC' }}>
                    <Package size={16} color="#E8571A" />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#111110', letterSpacing: '-0.01em' }}>Active Requests</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="live-dot"></div>
                    <span style={{ fontSize: 11, color: '#9A9A90', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Live</span>
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Clock size={26} color="#C0BFB8" />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2A2A24', marginBottom: 6, letterSpacing: '-0.01em' }}>No Active Negotiations</h3>
                    <p style={{ fontSize: 13, color: '#9A9A90', maxWidth: 320, lineHeight: 1.65 }}>
                      Create a new shipment request to let the AI agent start negotiating with transporters automatically.
                    </p>
                    <button className="btn-primary" style={{ marginTop: 20, padding: '10px 22px', fontSize: 13 }}>
                      <Plus size={15} /> Start a Request
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="main-card anim d4">
                <div className="card-header">
                  <div style={{ width: 32, height: 32, background: '#FFF3EE', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #FDDCCC' }}>
                    <BarChart2 size={16} color="#E8571A" />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#111110', letterSpacing: '-0.01em' }}>Recent Activity</span>
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Mumbai → Delhi', 'Pune → Bangalore', 'Chennai → Hyderabad'].map((route, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, background: '#FAFAF8', border: '1px solid #EBEBЕ5', transition: 'all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)', cursor: 'default', opacity: 0.45 }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = '#FDDCCC'; e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.opacity = '0.65'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = '#EBEBЕ5'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.opacity = '0.45'; }}>
                      <div style={{ width: 34, height: 34, background: '#F0EFE9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Truck size={14} color="#C0BFB8" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#9A9A90' }}>{route}</div>
                        <div style={{ fontSize: 11, color: '#C0BFB8', marginTop: 2 }}>No data yet</div>
                      </div>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: '#F5F5F0', color: '#C0BFB8', fontWeight: 600, border: '1px solid #E0E0D8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* AI card */}
              <div className="ai-card anim d3" ref={cardRef}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(232,87,26,0.18), transparent 65%)`, pointerEvents: 'none', borderRadius: 24, transition: 'background 0.1s' }}></div>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,87,26,0.22),transparent 70%)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', bottom: -40, left: 0, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(249,115,22,0.08),transparent 70%)', pointerEvents: 'none' }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                    <div className="float-bot" style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.12)', borderRadius: 16, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
                      <Bot size={28} color="#F97316" />
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(232,87,26,0.15)', border: '1px solid rgba(232,87,26,0.3)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8571A', animation: 'dot-blink 1.4s ease-in-out infinite', display: 'inline-block' }}></span>
                      <span className="shimmer-tag">Ready</span>
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.2 }}>
                    AI Negotiator <span style={{ fontStyle: 'italic', color: '#F97316' }}>Active</span>
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>
                    Once a request is created, your agent will automatically handle the entire negotiation pipeline.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      'Negotiate with multiple transporters in parallel',
                      'Adapt pricing based on real-time capacity',
                      'Recommend the objectively best option',
                    ].map((item, idx) => (
                      <div key={idx} className="step-item"
                        onMouseOver={() => setHoveredStep(idx)}
                        onMouseOut={() => setHoveredStep(null)}>
                        <div className="step-check">
                          <CheckCircle size={13} color="#E8571A" />
                        </div>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, fontWeight: 400 }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 24, height: 1, background: 'rgba(255,255,255,0.08)' }}></div>
                  <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avg Resolution</div>
                      <div style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>Under 5 min</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, background: 'rgba(232,87,26,0.15)', border: '1px solid rgba(232,87,26,0.3)', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(232,87,26,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'rgba(232,87,26,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                      <Zap size={14} color="#F97316" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#F97316' }}>View Docs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Human-in-the-loop hint */}
              <div className="hint-card anim d4">
                <div style={{ width: 3, alignSelf: 'stretch', background: 'linear-gradient(180deg,#E8571A,#F97316)', borderRadius: 100, flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2A2A24', marginBottom: 6, letterSpacing: '-0.01em' }}>Human-in-the-loop</div>
                  <p style={{ fontSize: 12, color: '#9A9A90', lineHeight: 1.65 }}>
                    You retain full control. The agent delivers an executive summary via <strong style={{ color: '#5A5A52' }}>Email or WhatsApp</strong>. A single tap finalizes the recommended contract.
                  </p>
                </div>
              </div>

              {/* Quick links */}
              <div className="quick-links-card anim d5">
                {[
                  { label: 'Client Portal', icon: <Factory size={15} />, sub: 'Manage requests' },
                  { label: 'Transporter Portal', icon: <Truck size={15} />, sub: 'Carrier management' },
                  { label: 'Analytics', icon: <BarChart2 size={15} />, sub: 'View performance' },
                ].map((link, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < 2 ? '1px solid #F0EFE9' : 'none', cursor: 'pointer', transition: 'all 0.2s', background: 'white' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#FFF8F5'; e.currentTarget.style.paddingLeft = '22px'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.paddingLeft = '18px'; }}>
                    <div style={{ width: 32, height: 32, background: '#FFF3EE', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8571A', border: '1px solid #FDDCCC', flexShrink: 0 }}>
                      {link.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2A24' }}>{link.label}</div>
                      <div style={{ fontSize: 11, color: '#9A9A90' }}>{link.sub}</div>
                    </div>
                    <ChevronRight size={14} color="#C0BFB8" />
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAF8', position: 'sticky', top: 0, zIndex: 10, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #E8571A, #F97316)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(232,87,26,0.25)' }}>
                  <Package size={20} color="white" />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 900, color: '#111110', letterSpacing: '-0.01em', lineHeight: 1.1 }}>New Shipment Request</h2>
                  <div style={{ fontSize: 13, color: '#9A9A90', fontWeight: 500, marginTop: 4 }}>Initialize AI-driven procurement</div>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px' }}>

              <div style={{ display: 'flex', gap: 20 }}>
                <div className="form-group" style={{ flex: 1, position: 'relative', zIndex: 12 }}>
                  <label className="form-label">Origin Location</label>
                  <LocationAutocomplete placeholder="e.g. Mumbai, Maharashtra" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A9A90' }}>
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1, position: 'relative', zIndex: 11 }}>
                  <label className="form-label">Destination</label>
                  <LocationAutocomplete placeholder="e.g. Delhi, NCR" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Truck Type</label>
                  <select defaultValue="" className="form-input" style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23A0A09A%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '10px auto' }}>
                    <option value="" disabled>Select truck type</option>
                    {TRUCK_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Weight Capacity (Tons)</label>
                  <input type="number" className="form-input" placeholder="e.g. 15" min="1" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Date of Placement</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} color="#A0A09A" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="date" className="form-input" style={{ paddingLeft: 42, color: '#5A5A52' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Max Target Budget (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#5A5A52', fontWeight: 600 }}>₹</span>
                    <input type="number" className="form-input" style={{ paddingLeft: 36 }} placeholder="Maximum willing to pay" />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Agent Strategy</label>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#E8571A', background: '#FFF3EE', padding: '4px 10px', borderRadius: 100 }}>Recommended</span>
                </div>

                <div className="radio-group">
                  <div
                    className={`radio-card ${agentStrategy === 'autonomous' ? 'selected' : ''}`}
                    onClick={() => setAgentStrategy('autonomous')}
                  >
                    <div className="radio-dot"></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111110', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Bot size={15} color="#E8571A" /> Autonomous AI
                      </div>
                      <div style={{ fontSize: 12, color: '#9A9A90', lineHeight: 1.5 }}>
                        Agent manages all rounds of counter-offers and selects the winner.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`radio-card ${agentStrategy === 'manual' ? 'selected' : ''}`}
                    onClick={() => setAgentStrategy('manual')}
                  >
                    <div className="radio-dot"></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111110', marginBottom: 2 }}>
                        Manual Assistance
                      </div>
                      <div style={{ fontSize: 12, color: '#9A9A90', lineHeight: 1.5 }}>
                        Agent collects first round of quotes. You approve all counter-offers.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 24 }}>
                <label className="form-label">Target Transporters (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#A0A09A" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" className="form-input" style={{ paddingLeft: 42 }} placeholder="Search or select transporters to invite..." />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {['BlueLine Logistics', 'FastMove Co.', 'Broadcast to All'].map((tag, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                      border: i === 2 ? '1px dashed #E8571A' : '1px solid #EBEBЕ5',
                      color: i === 2 ? '#E8571A' : '#5A5A52',
                      background: i === 2 ? '#FFF3EE' : 'white',
                      cursor: 'pointer'
                    }}>
                      {tag} {i !== 2 && <X size={12} color="#A0A09A" />}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid #EBEBЕ5', background: 'white', display: 'flex', justifyContent: 'flex-end', gap: 12, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
              <button className="btn-outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => setIsModalOpen(false)}>
                Submit to Agent <Zap size={15} />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}