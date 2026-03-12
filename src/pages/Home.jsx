import { ArrowRight, Bot, Zap, CheckCircle2, Factory, Truck, TrendingDown, Clock, Users, AlertTriangle, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAF8', color: '#1a1a1a', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --orange: #E8571A; --orange-light: #F97316;
          --orange-pale: #FFF3EE; --orange-border: #FDDCCC;
          --cream: #FAFAF8; --ink: #111110;
          --stone-50: #F5F5F0; --stone-100: #EBEBЕ5;
          --stone-200: #E0E0D8; --stone-400: #9A9A90;
          --stone-600: #5A5A52; --stone-800: #2A2A24;
        }

        .nav-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 100px;
          color: #5A5A52; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; text-decoration: none;
          letter-spacing: -0.01em;
        }
        .nav-pill:hover { background: #F0EFE9; color: #111110; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 28px; background: #E8571A; color: white;
          border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 600; border-radius: 100px;
          transition: all 0.25s; letter-spacing: -0.01em;
          box-shadow: 0 2px 16px rgba(232,87,26,0.25);
        }
        .btn-primary:hover { background: #D44E15; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(232,87,26,0.35); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 28px; background: white; color: #2A2A24;
          border: 1.5px solid #E0E0D8; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
          border-radius: 100px; transition: all 0.25s; letter-spacing: -0.01em;
        }
        .btn-outline:hover { border-color: #E8571A; color: #E8571A; transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.08); }

        .section-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: #E8571A;
        }
        .section-label::before { content: ''; width: 24px; height: 1.5px; background: #E8571A; }

        .hero-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(52px, 7vw, 96px);
          font-weight: 900; line-height: 1.0;
          letter-spacing: -0.03em; color: #111110;
        }
        .italic-orange { font-style: italic; color: #E8571A; }

        .card-hover { transition: transform 0.25s, box-shadow 0.25s; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.1); }

        .console-row {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; border-radius: 12px;
          background: #FAFAF8; border: 1px solid #EBEBЕ5;
          transition: border-color 0.2s;
        }
        .console-row:hover { border-color: #FDDCCC; }

        .pill-tag {
          display: inline-flex; align-items: center;
          padding: 4px 12px; border-radius: 100px; font-size: 11px;
          font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
        }

        .feature-card {
          background: white; border: 1px solid #EBEBЕ5; border-radius: 20px;
          padding: 28px 24px; position: relative; overflow: hidden;
          transition: all 0.3s;
        }
        .feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 3px; background: linear-gradient(90deg, #E8571A, #F97316);
          transform: scaleX(0); transform-origin: left; transition: transform 0.4s;
        }
        .feature-card:hover::before { transform: scaleX(1); }
        .feature-card:hover { border-color: #FDDCCC; box-shadow: 0 12px 40px rgba(232,87,26,0.08); }

        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 52px; font-weight: 900; line-height: 1;
          color: #E8571A; letter-spacing: -0.02em;
        }

        .problem-card {
          background: white; border: 1px solid #EBEBЕ5; border-radius: 14px;
          padding: 18px 20px; transition: all 0.25s; display: flex; gap: 14px; align-items: flex-start;
        }
        .problem-card:hover { border-color: #FDDCCC; box-shadow: 0 6px 24px rgba(0,0,0,0.06); }

        .ticker-track {
          display: flex; gap: 0;
          animation: slide 28s linear infinite;
          width: max-content;
        }
        @keyframes slide { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        .bg-dot-pattern {
          background-image: radial-gradient(circle, #D4D4CC 1px, transparent 1px);
          background-size: 28px 28px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim { animation: fadeUp 0.7s ease forwards; }
        .d1 { animation-delay: 0.05s; opacity: 0; }
        .d2 { animation-delay: 0.15s; opacity: 0; }
        .d3 { animation-delay: 0.25s; opacity: 0; }
        .d4 { animation-delay: 0.4s; opacity: 0; }
        .d5 { animation-delay: 0.55s; opacity: 0; }

        .cta-card {
          background: #111110; border-radius: 28px; overflow: hidden;
          position: relative; padding: 72px 80px;
        }
        .cta-card::before {
          content: ''; position: absolute; top: -120px; right: -80px;
          width: 480px; height: 480px; border-radius: 50%;
          background: radial-gradient(circle, rgba(232,87,26,0.25), transparent 70%);
          pointer-events: none;
        }

        /* ── COMBINED SECTION DIVIDER ── */
        .vs-divider {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 8px; padding: 0 8px;
        }
        .vs-line { flex: 1; width: 1px; background: linear-gradient(180deg, transparent, #E0E0D8 30%, #E0E0D8 70%, transparent); }
        .vs-badge {
          width: 36px; height: 36px; border-radius: 50%;
          background: white; border: 1.5px solid #E0E0D8;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #9A9A90;
          letter-spacing: 0.04em; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="bg-dot-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}></div>
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,87,26,0.07), transparent 70%)', pointerEvents: 'none' }}></div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div className="section-label anim d1" style={{ marginBottom: 20 }}>AI-Powered Logistics Platform</div>
              <h1 className="hero-headline anim d2" style={{ marginBottom: 24, fontSize: 'clamp(44px, 6vw, 84px)' }}>
                Negotiate<br />Freight <span className="italic-orange">Rates,</span><br />Effortlessly.
              </h1>
              <p className="anim d3" style={{ fontSize: 16, color: '#5A5A52', lineHeight: 1.72, marginBottom: 32, maxWidth: 470, fontWeight: 400 }}>
                Intelligent AI agents handle your carrier negotiations in parallel — securing optimal rates in minutes, not days. Built for modern procurement teams.
              </p>
              <div className="anim d4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
                <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
                  <Factory size={15} />Client Portal<ArrowRight size={14} />
                </button>
                <button className="btn-outline" style={{ padding: '12px 24px', fontSize: 14 }}>
                  <Truck size={15} />Transporter Login
                </button>
              </div>
              <div className="anim d5" style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 28, borderTop: '1px solid #E0E0D8' }}>
                <div style={{ display: 'flex' }}>
                  {['#D4A574', '#9B7E5C', '#C4956A', '#8B6347'].map((c, i) => (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i ? -10 : 0, boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}></div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2A24' }}>Trusted by 200+ logistics teams</div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                    {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: '#E8571A', fontSize: 13 }}>★</span>)}
                    <span style={{ fontSize: 12, color: '#9A9A90', marginLeft: 6 }}>4.9 / 5.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="anim d3">
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E0E0D8', boxShadow: '0 24px 80px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAF8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8571A' }}></div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#5A5A52', letterSpacing: '0.04em' }}>Live Negotiation — Mumbai → Delhi</span>
                  </div>
                  <span className="pill-tag" style={{ background: '#FFF3EE', color: '#E8571A', border: '1px solid #FDDCCC', fontSize: 10, padding: '3px 9px' }}>● Active</span>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { carrier: 'Express Logistics', quote: '₹48,200', counter: '₹44,500', status: 'Accepted', color: '#E8571A', bg: '#FFF3EE', border: '#FDDCCC', pct: '-7.7%' },
                    { carrier: 'FastMove Co.', quote: '₹51,000', counter: '₹46,200', status: 'Countered', color: '#9A9A90', bg: '#F5F5F0', border: '#E0E0D8', pct: '-9.4%' },
                    { carrier: 'Cargo Direct', quote: '₹55,800', counter: '₹48,900', status: 'Pending', color: '#C0BFB8', bg: '#F5F5F0', border: '#E0E0D8', pct: '-12.4%' },
                    { carrier: 'RoadFirst Ltd', quote: '₹49,500', counter: '₹45,800', status: 'Countered', color: '#9A9A90', bg: '#F5F5F0', border: '#E0E0D8', pct: '-7.5%' },
                  ].map((row, i) => (
                    <div key={i} className="console-row" style={{ padding: '10px 13px' }}>
                      <div style={{ width: 30, height: 30, background: '#F5F5F0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Truck size={13} color="#9A9A90" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#2A2A24' }}>{row.carrier}</div>
                        <div style={{ fontSize: 10, color: '#9A9A90', marginTop: 2 }}>
                          {row.quote} <span style={{ color: '#D4D4CC', margin: '0 3px' }}>→</span> <span style={{ color: '#E8571A', fontWeight: 600 }}>{row.counter}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                        <span className="pill-tag" style={{ background: row.bg, color: row.color, border: `1px solid ${row.border}`, fontSize: 10, padding: '2px 8px' }}>{row.status}</span>
                        <span style={{ fontSize: 10, color: '#E8571A', fontWeight: 700 }}>{row.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ margin: '0 16px 16px', padding: '12px 16px', background: 'linear-gradient(135deg, #FFF3EE, #FFF8F5)', border: '1px solid #FDDCCC', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#9A9A90', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Projected savings</div>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 900, color: '#E8571A', lineHeight: 1.2 }}>₹4,300</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#9A9A90', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Time elapsed</div>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 900, color: '#2A2A24', lineHeight: 1.2 }}>3m 42s</div>
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', right: '-4rem', bottom: '-2rem', background: 'linear-gradient(135deg, #E8571A, #F97316)', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 28px rgba(232,87,26,0.4)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
                <Zap size={15} color="white" />
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Avg Resolution</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>Under 5 minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid #E0E0D8', borderBottom: '1px solid #E0E0D8', background: '#F5F5F0', padding: '16px 0' }}>
        <div className="ticker-track">
          {Array(2).fill(['Parallel AI Negotiations', 'Real-Time Counter-Offers', 'Smart Carrier Matching', 'WhatsApp Approvals', '1-Click Confirmation', 'Lane Analytics', 'Cost Benchmarking', 'Procurement Automation']).flat().map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '0 40px', fontSize: 13, fontWeight: 600, color: '#9A9A90', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#E8571A', fontSize: 8 }}>◆</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      {/* <section style={{ padding: '100px 0', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label" style={{ marginBottom: 20, justifyContent: 'center' }}>By the Numbers</div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-0.025em', color: '#111110', lineHeight: 1.1 }}>
              Results that <span className="italic-orange">speak</span> for themselves
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              ['₹2.4Cr+', 'Freight costs saved across all clients'],
              ['10,000+', 'Negotiations completed on platform'],
              ['< 5 min', 'Average resolution time per shipment'],
              ['28%', 'Average rate reduction vs manual'],
            ].map(([num, label], i) => (
              <div key={i} style={{ padding: '36px 32px', background: '#FAFAF8', border: '1px solid #EBEBЕ5', borderRadius: 20 }} className="card-hover">
                <div className="stat-number">{num}</div>
                <div style={{ marginTop: 12, fontSize: 14, color: '#9A9A90', lineHeight: 1.6, fontWeight: 400 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── PROBLEM + SOLUTION COMBINED ── */}
      <section style={{ padding: '100px 0', background: '#FAFAF8', borderTop: '1px solid #E0E0D8', }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label" style={{ marginBottom: 16, justifyContent: 'center' }}>The Full Picture</div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 900, letterSpacing: '-0.025em', color: '#111110', lineHeight: 1.1 }}>
              From <span className="italic-orange">problem</span> to solution,<br />in one view.
            </h2>
          </div>

          {/* Three-column layout: Problem | Divider | Solution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 1fr', gap: 0, alignItems: 'stretch' }}>

            {/* ── LEFT: PROBLEM ── */}
            <div style={{ background: 'white', borderRadius: '20px 0 0 20px', border: '1px solid #EBEBЕ5', borderRight: 'none', padding: '44px 40px', boxShadow: '0 4px 20px rgba(167, 154, 149, 0.4)' }}>
              <div style={{ marginBottom: 32 }}>
                <div className="section-label" style={{ marginBottom: 14 }}>The Problem</div>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(24px, 2.5vw, 34px)', fontWeight: 900, letterSpacing: '-0.025em', color: '#111110', lineHeight: 1.1, marginBottom: 12 }}>
                  Manual procurement<br />is <span className="italic-orange">quietly expensive.</span>
                </h3>
                <p style={{ fontSize: 14, color: '#9A9A90', lineHeight: 1.7, fontWeight: 400, maxWidth: 360 }}>
                  Traditional freight negotiations with LSPs are slow, sequential, and inconsistent. Your team's time is too valuable for phone tag with carriers.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: <Clock size={17} />, title: 'Frustratingly sequential', detail: 'Each carrier call takes 15–45 minutes of back-and-forth' },
                  { icon: <TrendingDown size={17} />, title: 'Value left on the table', detail: 'Human fatigue and bias lead to suboptimal pricing decisions' },
                  { icon: <AlertTriangle size={17} />, title: 'Delays kill leverage', detail: '24–72hr response windows eliminate your negotiating power' },
                  { icon: <Users size={17} />, title: 'Scaling means hiring', detail: 'Every 10% volume increase demands new procurement headcount' },
                ].map((item, i) => (
                  <div key={i} className="problem-card">
                    <div style={{ width: 36, height: 36, background: '#FFF3EE', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8571A', flexShrink: 0, border: '1px solid #FDDCCC' }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2A24', marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: '#9A9A90', lineHeight: 1.55 }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CENTRE DIVIDER ── */}
            <div className="vs-divider">
              <div className="vs-line"></div>
              <div className="vs-badge">VS</div>
              <div className="vs-line"></div>
            </div>

            {/* ── RIGHT: SOLUTION ── */}
            <div style={{ background: '#111110', borderRadius: '0 20px 20px 0', border: '1px solid #2A2A24', padding: '44px 40px', position: 'relative', overflow: 'hidden' }}>
              {/* Glow orb */}
              <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,87,26,0.22), transparent 70%)', pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', bottom: -60, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%)', pointerEvents: 'none' }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E8571A', marginBottom: 14 }}>
                    <span style={{ width: 20, height: 1.5, background: '#E8571A', display: 'inline-block' }}></span>
                    The Solution
                  </div>
                  <h3 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(24px, 2.5vw, 34px)', fontWeight: 900, letterSpacing: '-0.025em', color: 'white', lineHeight: 1.1, marginBottom: 12 }}>
                    Meet your AI<br /><span style={{ fontStyle: 'italic', color: '#F97316' }}>procurement agent.</span>
                  </h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontWeight: 400, maxWidth: 360 }}>
                    Orchestrate complex multi-party negotiations simultaneously, arriving at the optimal rate in minutes instead of days.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { title: 'Parallel Negotiation', desc: 'Engage dozens of transporters at once. No queue, no wait.', icon: <Zap size={18} />, n: '01' },
                    { title: 'Adaptive Pricing', desc: 'Counter-offers that evolve with real-time carrier responses.', icon: <Bot size={18} />, n: '02' },
                    { title: 'Optimised Selection', desc: 'Carrier matching by price, lane history, and reliability.', icon: <CheckCircle2 size={18} />, n: '03' },
                    { title: 'Human in the Loop', desc: 'WhatsApp summary. One tap to confirm. Full control.', icon: <ArrowRight size={18} />, n: '04' },
                  ].map((f, i) => (
                    <div key={i} className="feature-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 18px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>{f.n}</div>
                      <div style={{ width: 38, height: 38, background: 'rgba(232,87,26,0.15)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316', marginBottom: 14, border: '1px solid rgba(232,87,26,0.25)' }}>
                        {f.icon}
                      </div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 6, letterSpacing: '-0.01em' }}>{f.title}</h4>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontWeight: 400 }}>{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 0 100px', background: 'white', borderTop: '1px solid #E0E0D8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div className="cta-card">
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 48 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E8571A', marginBottom: 24 }}>
                  <span style={{ width: 20, height: 1.5, background: '#E8571A', display: 'inline-block' }}></span>
                  Get Started Today
                </div>
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(36px, 4vw, 58px)', fontWeight: 900, color: 'white', letterSpacing: '-0.025em', lineHeight: 1.0, marginBottom: 20 }}>
                  Ready to automate<br />your <span style={{ fontStyle: 'italic', color: '#F97316' }}>freight?</span>
                </h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 440, lineHeight: 1.7, fontWeight: 400 }}>
                  Join 200+ procurement teams who've eliminated manual negotiation and consistently secure better rates.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 14, flexDirection: 'column' }}>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', background: 'linear-gradient(135deg, #E8571A, #F97316)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 15, fontWeight: 600, borderRadius: 100, transition: 'all 0.25s', boxShadow: '0 4px 20px rgba(232,87,26,0.4)', letterSpacing: '-0.01em' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,87,26,0.5)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,87,26,0.4)'; }}>
                  <Factory size={17} />Client Portal<ArrowRight size={15} />
                </button>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 15, fontWeight: 600, borderRadius: 100, transition: 'all 0.25s', letterSpacing: '-0.01em' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}>
                  <Truck size={17} />Transporter Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'white', borderTop: '1px solid #E0E0D8', padding: '40px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #E8571A, #F97316)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={14} color="white" />
            </div>
            <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 18, color: '#111110', letterSpacing: '-0.02em' }}>FreightAI</span>
          </div>
          <div style={{ fontSize: 13, color: '#C0BFB8' }}>© 2026 FreightAI. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: '#9A9A90', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.02em', transition: 'color 0.2s' }}
                onMouseOver={e => e.currentTarget.style.color = '#E8571A'}
                onMouseOut={e => e.currentTarget.style.color = '#9A9A90'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}