import { useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import alphaLogo from "../assets/images/alpha-loggo.png";

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function ResourcesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="module-page">
      <div className="mobile-top-header">
        <div className="mobile-top-header-logo">
          <img src={alphaLogo} alt="ALPHA by HYBR" className="mobile-top-header-logo-img" />
        </div>
        <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          <HamburgerIcon />
        </button>
      </div>
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />
      <StudentSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="module-main">
        <div style={{
          background: "#fff",
          padding: 80,
          borderRadius: 16,
          textAlign: "center",
          color: "#666",
          marginTop: 24,
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
          <h1 style={{ fontFamily: "Raleway", fontSize: 28, color: "#000", margin: "0 0 12px 0" }}>
            My Resources
          </h1>
          <p style={{ fontFamily: "Montserrat", fontSize: 14, margin: 0 }}>
            Coming soon — your downloadable templates, guides, and reference materials will live here.
          </p>
        </div>
      </main>
    </div>
  );
}