import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, Star, ArrowRight, MapPin, TrendingUp, TrendingDown, LogIn, Truck, Award, Zap, Users } from 'lucide-react';

const TRANSPORTERS = [
  { id: 1, initials: 'BL', name: 'BlueLine Logistics', trips: 1240, lanes: ['Mumbai → Delhi', 'Pune → Bangalore'], rating: 4.9, rate: 45000, delta: -8, tag: 'Top Rated', tagColor: 'orange' },
  { id: 2, initials: 'FT', name: 'FastHaul Transport', trips: 856, lanes: ['Chennai → Hyderabad', 'Mumbai → Ahmedabad'], rating: 4.7, rate: 48500, delta: +2, tag: null, tagColor: null },
  { id: 3, initials: 'GC', name: 'GreenRoad Carriers', trips: 2100, lanes: ['Delhi → Kolkata', 'Mumbai → Delhi'], rating: 4.8, rate: 42000, delta: -5, tag: 'Most Active', tagColor: 'green' },
  { id: 4, initials: 'SL', name: 'SpeedCargo Logistics', trips: 432, lanes: ['Bangalore → Chennai', 'Pune → Hyderabad'], rating: 4.5, rate: 38000, delta: -11, tag: 'Best Value', tagColor: 'purple' },
  { id: 5, initials: 'BF', name: 'Bharat Freight Movers', trips: 1543, lanes: ['Delhi → Mumbai', 'Kolkata → Chennai'], rating: 4.6, rate: 51000, delta: +3, tag: null, tagColor: null },
  { id: 6, initials: 'RT', name: 'Rivigo Technologies', trips: 980, lanes: ['Pune → Delhi', 'Mumbai → Hyderabad'], rating: 4.8, rate: 44500, delta: -6, tag: 'AI Preferred', tagColor: 'blue' },
];

const TAG_STYLES = {
  orange: { bg: '#FFF3EE', color: '#C2571A', border: '#FDDCCC' },
  green: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  purple: { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
  blue: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
};

function StarBar({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ height: 3, width: 18, borderRadius: 2, background: i <= Math.round(rating) ? '#E8571A' : '#E8E8E2' }} />
      ))}
    </div>
  );
}

export default function Transporter() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState(null);

  const filtered = TRANSPORTERS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.lanes.some(l => l.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F6F2', minHeight: '100vh', color: '#111110' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rowSlide { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }

        .page-anim { animation: fadeUp 0.5s ease both; }
        .d1{animation-delay:.05s} .d2{animation-delay:.12s} .d3{animation-delay:.2s}

        .section-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: .12em;
          text-transform: uppercase; color: #E8571A;
        }
        .section-label::before { content:''; width: 18px; height: 1.5px; background: #E8571A; }

        /* search */
        .search-wrap input {
          width: 100%; padding: 11px 11px 11px 42px;
          background: white; border: 1px solid #E8E8E2;
          border-radius: 10px; font-size: 13px; font-family: 'DM Sans', sans-serif;
          color: #111110; outline: none; transition: border-color .2s;
        }
        .search-wrap input:focus { border-color: #E8571A; }
        .search-wrap input::placeholder { color: #C0BFB8; }

        .filter-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 11px 18px; background: white; border: 1px solid #E8E8E2;
          border-radius: 10px; font-size: 12px; font-weight: 600;
          color: #9A9A90; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all .2s; white-space: nowrap; letter-spacing: .03em;
        }
        .filter-btn:hover { border-color: #E8571A; color: #E8571A; }

        /* ── TRANSPORTER ROW ── */
        .t-row {
          display: grid;
          grid-template-columns: 48px 1fr 120px 140px 36px;
          align-items: center;
          gap: 0 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #F0EFE9;
          cursor: pointer;
          transition: background .15s;
          position: relative;
          animation: rowSlide 0.4s ease both;
          background: white;
        }
        .t-row:last-child { border-bottom: none; }
        .t-row:hover { background: #FFF8F5; }

        .t-row::before {
          content:''; position:absolute; left:0; top:10px; bottom:10px;
          width:3px; background:linear-gradient(180deg,#E8571A,#F97316);
          border-radius:0 3px 3px 0;
          transform:scaleY(0); transition:transform .22s cubic-bezier(.34,1.56,.64,1);
          transform-origin:center;
        }
        .t-row:hover::before { transform:scaleY(1); }

        .t-initials {
          width: 42px; height: 42px; border-radius: 12px;
          background: #F5F5F0; border: 1px solid #E8E8E2;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: #5A5A52; letter-spacing: .04em;
          transition: all .25s cubic-bezier(.34,1.56,.64,1);
        }
        .t-row:hover .t-initials {
          background:#FFF3EE; border-color:#FDDCCC;
          color:#E8571A; transform: scale(1.05);
        }
        .t-name {
          font-size: 15px; font-weight: 800; color: #1A1A16;
          letter-spacing: -.01em; transition: color .15s;
        }
        .t-row:hover .t-name { color:#E8571A; }

        /* Login button */
        .login-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px 16px; border-radius: 10px;
          border: 1px solid #E8E8E2; background: white;
          color: #5A5A52; font-size: 12px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all .2s cubic-bezier(.34,1.56,.64,1);
          letter-spacing: .02em; white-space: nowrap; width: 100%;
        }
        .t-row:hover .login-btn {
          background: white; border-color: #E8571A; color: #E8571A;
          box-shadow: 0 4px 12px rgba(232,87,26,.12);
        }

        .t-arrow { color: #C0BFB8; transition: all .15s; }
        .t-row:hover .t-arrow { color: #E8571A; transform: translateX(3px); }

        /* ── BENTO STAT CARDS ── */
        .bento-card {
          background: white; border: 1px solid #E8E8E2; border-radius: 16px;
          padding: 22px 22px; transition: all .3s cubic-bezier(.25,.46,.45,.94);
          position: relative; overflow: hidden;
        }
        .bento-card:hover { transform: translateY(-3px); border-color: #FDDCCC; box-shadow: 0 12px 36px rgba(232,87,26,.08); }
        .bento-num {
          font-family: 'Playfair Display', serif; font-size: 36px;
          font-weight: 900; color: #E8571A; letter-spacing: -.02em; line-height:1;
        }
        .bento-label { font-size:11px; font-weight:600; color:#C0BFB8; text-transform:uppercase; letter-spacing:.1em; }
        .bento-sub { font-size:12px; color:#9A9A90; margin-top:4px; }

        /* table header */
        .col-header {
          font-size:10px; font-weight:700; color:#C0BFB8;
          letter-spacing:.1em; text-transform:uppercase;
        }

        /* ── MAIN CARD SHELL ── */
        .main-card {
          background: white; border: 1px solid #E8E8E2; border-radius: 20px;
          overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,.06);
        }
        .card-header {
          padding: 18px 22px; border-bottom: 1px solid #F0EFE9;
          background: #FAFAF8; display:flex; align-items:center; gap:10px;
        }
        .card-icon {
          width:32px; height:32px; border-radius:9px;
          background:#FFF3EE; border:1px solid #FDDCCC;
          display:flex; align-items:center; justify-content:center;
        }
      `}</style>

      {/* ── NAV ── */}
      {/* <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 56, background: 'rgba(247,246,242,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E8E8E2' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, border: '1px solid #1c1a16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'serif', fontSize: 13, fontWeight: 700, color: '#1c1a16' }}>L</span>
            </div>
            <span style={{ fontSize: 11, letterSpacing: '.16em', color: '#9A9A90', textTransform: 'uppercase' }}>Lorri.ai</span>
          </button>
          <span style={{ color: '#E8E8E2', fontSize: 16, margin: '0 4px' }}>·</span>
          <span style={{ fontSize: 11, letterSpacing: '.12em', color: '#C0BFB8', textTransform: 'uppercase' }}>Transporter Directory</span>
        </div>
        <span style={{ fontSize: 11, letterSpacing: '.1em', color: '#C0BFB8', textTransform: 'uppercase', fontFamily: 'monospace' }}>{TRANSPORTERS.length} verified</span>
      </nav> */}

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '44px 40px 80px' }}>

        {/* ── PAGE TITLE ── */}
        <div className="page-anim d1" style={{ marginBottom: 36, paddingBottom: 36, borderBottom: '1px solid #EDECE8' }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Network</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(30px,4vw,48px)', fontWeight: 900, color: '#111110', letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 10 }}>
            Transporter <span style={{ fontStyle: 'italic', color: '#E8571A' }}>Directory</span>
          </h1>
          <p style={{ fontSize: 14, color: '#9A9A90', maxWidth: 480, lineHeight: 1.7 }}>
            Browse our verified logistics network. The AI agent actively negotiates with these partners to secure your best rates.
          </p>
        </div>

        {/* ── BENTO STATS ── */}
        {/* <div className="page-anim d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { icon: <Truck size={16} color="#E8571A" />, num: '6+', label: 'Verified Carriers', sub: 'Active on network' },
            { icon: <Star size={16} color="#E8571A" />, num: '4.7', label: 'Avg Rating', sub: 'Across all carriers' },
            { icon: <Users size={16} color="#E8571A" />, num: '7.1K+', label: 'Total Trips', sub: 'Combined experience' },
            { icon: <Award size={16} color="#E8571A" />, num: '11%', label: 'Best Savings', sub: 'vs market rate' },
          ].map((s, i) => (
            <div key={i} className="bento-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div className="bento-label">{s.label}</div>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FFF3EE', border: '1px solid #FDDCCC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
              </div>
              <div className="bento-num">{s.num}</div>
              <div className="bento-sub">{s.sub}</div>
            </div>
          ))}
        </div> */}

        {/* ── SEARCH + FILTERS ── */}
        <div className="page-anim d3" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div className="search-wrap" style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#C0BFB8' }} />
            <input
              type="text"
              placeholder="Search by name or lane..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="filter-btn"><SlidersHorizontal size={14} />Filters</button>
          <button className="filter-btn"><ArrowUpDown size={14} />Sort</button>
        </div>

        {/* ── TABLE ── */}
        <div className="main-card page-anim d3" style={{ animationDelay: '.22s' }}>

          {/* Card header */}
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="card-icon"><Truck size={15} color="#E8571A" /></div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111110', letterSpacing: '-.01em' }}>Carriers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: '#C0BFB8', fontWeight: 500 }}>Showing {filtered.length} of {TRANSPORTERS.length}</span>
              <div style={{ width: 1, height: 14, background: '#E8E8E2' }} />
              <button style={{ fontSize: 11, color: '#E8571A', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '.03em' }}>
                View All <ChevronRightIcon />
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 120px 140px 36px', gap: '0 16px', padding: '12px 24px', borderBottom: '1px solid #F0EFE9', background: '#FAFAF8' }}>
            {['', 'Carrier Details', 'Avg Rating', '', ''].map((h, i) => (
              <div key={i} className="col-header">{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((t, i) => {
            return (
              <div
                key={t.id}
                className="t-row"
                style={{ animationDelay: `${0.25 + i * 0.06}s` }}
                onMouseOver={() => setHovered(i)}
                onMouseOut={() => setHovered(null)}
              >
                {/* Initials */}
                <div><div className="t-initials">{t.initials}</div></div>

                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="t-name">{t.name}</div>
                </div>

                {/* Rating */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Star size={13} style={{ fill: '#E8571A', color: '#E8571A' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A16' }}>{t.rating}</span>
                  </div>
                  <StarBar rating={t.rating} />
                </div>

                {/* Login button */}
                <div>
                  <button className="login-btn">
                    <LogIn size={13} style={{ flexShrink: 0 }} />
                    Login
                  </button>
                </div>

                {/* Arrow */}
                {/* <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 8 }}>
                  <ChevronRightIcon className="t-arrow" />
                </div> */}

              </div>
            );
          })}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#FAFAF8', borderTop: '1px solid #F0EFE9' }}>
            <span style={{ fontSize: 11, color: '#C0BFB8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Showing {filtered.length} carriers</span>
            <button style={{ fontSize: 12, fontWeight: 700, color: '#E8571A', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '.03em' }}>
              Load More <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}