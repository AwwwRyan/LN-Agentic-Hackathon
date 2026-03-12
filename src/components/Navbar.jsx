import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const middleLinks = [
    { to: '/platform', label: 'PLATFORM' },
    { to: '/transporters', label: 'TRANSPORTERS' },
    { to: '/about', label: 'ABOUT' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

        .nav-root {
          position: sticky; top: 0; z-index: 100;
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow 0.3s, background 0.3s;
        }
        .nav-root.scrolled {
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        }
        .nav-inner {
          width: 100%;
          padding: 0 32px; height: 64px;
          display: flex; align-items: center;
          justify-content: space-between;
          gap: 0;
        }

        /* Logo — far left */
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0;
          margin-right: auto;
        }
        .nav-logo-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #E8571A, #F97316);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(232,87,26,0.3);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .nav-logo:hover .nav-logo-icon {
          transform: scale(1.12) rotate(-6deg);
        }
        .nav-logo-text {
          font-family: 'Playfair Display', serif;
          font-weight: 700; font-size: 20px;
          letter-spacing: -0.02em; color: #111110;
          transition: color 0.2s;
        }
        .nav-logo:hover .nav-logo-text { color: #E8571A; }

        /* Center links (home only) — absolutely centered in viewport */
        .nav-center {
          position: absolute;
          left: 50%; transform: translateX(-50%);
          display: flex; align-items: center;
        }
        .nav-mid-link {
          position: relative;
          display: inline-flex; align-items: center;
          padding: 0 18px; height: 64px;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(90,90,82,0.7); text-decoration: none;
          transition: color 0.2s;
        }
        .nav-mid-link::after {
          content: '';
          position: absolute; bottom: 0;
          left: 18px; right: 18px;
          height: 2px; background: #E8571A;
          transform: scaleX(0);
          transition: transform 0.25s ease;
        }
        .nav-mid-link:hover { color: #111110; }
        .nav-mid-link:hover::after { transform: scaleX(1); }
        .nav-mid-link.active { color: #111110; font-weight: 700; }
        .nav-mid-link.active::after { transform: scaleX(1); }

        /* Right buttons — far right */
        .nav-right {
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0;
          margin-left: auto;
        }

        .btn-client {
          display: inline-flex; align-items: center;
          padding: 9px 22px;
          border: 1.5px solid rgba(90,90,82,0.25);
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          letter-spacing: -0.01em;
          color: #5A5A52; text-decoration: none;
          background: transparent;
          transition: all 0.2s;
        }
        .btn-client:hover {
          border-color: #E8571A;
          color: #E8571A;
          background: #FFF3EE;
        }
        .btn-client.active {
          border-color: #E8571A;
          color: #E8571A;
          background: #FFF3EE;
        }

        .btn-transporter {
          display: inline-flex; align-items: center;
          padding: 10px 22px;
          background: #E8571A; color: white;
          border: none; border-radius: 100px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          letter-spacing: -0.01em; text-decoration: none;
          box-shadow: 0 2px 14px rgba(232,87,26,0.28);
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .btn-transporter:hover {
          background: #D44E15;
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 24px rgba(232,87,26,0.4);
        }
        .btn-transporter:active { transform: translateY(0) scale(1); }
      `}</style>

      <nav
        className={`nav-root${scrolled ? ' scrolled' : ''}`}
        style={{
          background: scrolled ? 'rgba(250,250,248,0.92)' : 'rgba(250,250,248,0.80)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(224,224,216,0.65)',
          position: 'sticky',
        }}
      >
        <div className="nav-inner">

          {/* Logo — far left */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">
              <Truck size={17} color="white" />
            </div>
            <span className="nav-logo-text">FreightAI</span>
          </Link>

          {/* Center links — absolutely centered, home only */}
          {isHome && (
            <div className="nav-center">
              {middleLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-mid-link${location.pathname === to ? ' active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Buttons — far right */}
          <div className="nav-right">
            <Link
              to="/client"
              className={`btn-client${location.pathname === '/client' ? ' active' : ''}`}
            >
              Client
            </Link>
            <Link
              to="/transporter"
              className={`btn-transporter${location.pathname === '/transporter' ? ' active' : ''}`}
            >
              Transporter
            </Link>
          </div>

        </div>
      </nav>
    </>
  );
}