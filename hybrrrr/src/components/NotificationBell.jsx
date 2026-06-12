import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const bellRef = useRef();
  const dropdownRef = useRef();

  const load = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch (err) {
      console.error("Notifications load failed:", err);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleClick = async (n) => {
    if (!n.is_read) {
      await api.patch(`/notifications/${n.id}/read`);
    }
    if (n.link) {
      if (n.link.startsWith("http")) {
        window.open(n.link, "_blank");
      } else {
        navigate(n.link);
      }
    }
    setOpen(false);
    load();
  };

  const markAll = async () => {
    await api.patch("/notifications/read-all");
    load();
  };

  const getDropdownPosition = () => {
    if (!bellRef.current) return { top: 60, left: 60 };
    const rect = bellRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left,
    };
  };

  return (
    <>
      <button
        ref={bellRef}
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        title="Notifications"
      >
        <BellIcon />
        {unread > 0 && (
          <span style={{
            position: "absolute",
            top: -2,
            right: -2,
            background: "#C0392B",
            color: "#fff",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 6px",
            minWidth: 18,
            textAlign: "center",
            border: "2px solid #000",
            lineHeight: 1.2,
            fontFamily: "Montserrat, sans-serif",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            ...getDropdownPosition(),
            width: 360,
            maxHeight: 480,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            zIndex: 99999,
            overflow: "hidden",
            color: "#000",
          }}
        >
          {/* ── HEADER ── */}
          <div style={{
            padding: "16px 18px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #f0f9e8, #fff)",
          }}>
            <h3 style={{
              fontFamily: "Raleway, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              margin: 0,
              color: "#000",
            }}>
              🔔 Notifications
            </h3>
            {unread > 0 && (
              <button
                onClick={markAll}
                style={{
                  background: "none",
                  border: "none",
                  color: "#196AB4",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* ── LIST ── */}
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: 40,
                textAlign: "center",
                color: "#888",
                fontFamily: "Montserrat, sans-serif",
                fontSize: 13,
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔕</div>
                No notifications yet.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid #f5f5f5",
                    cursor: "pointer",
                    background: n.is_read ? "#fff" : "#f0f9e8",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={(e) => e.currentTarget.style.background = n.is_read ? "#fff" : "#f0f9e8"}
                >
                  <div style={{ display: "flex", alignItems: "start", gap: 10 }}>
                    {!n.is_read && (
                      <span style={{
                        width: 8,
                        height: 8,
                        background: "#8DC540",
                        borderRadius: "50%",
                        marginTop: 6,
                        flexShrink: 0,
                      }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Title — Raleway */}
                      <div style={{
                        fontFamily: "Raleway, sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#000",
                        marginBottom: 4,
                        lineHeight: 1.3,
                      }}>
                        {n.title}
                      </div>
                      {/* Message — Montserrat */}
                      {n.message && (
                        <div style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: 12,
                          color: "#666",
                          lineHeight: 1.5,
                        }}>
                          {n.message}
                        </div>
                      )}
                      {/* Time — Montserrat */}
                      <div style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 10,
                        color: "#999",
                        marginTop: 6,
                      }}>
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}