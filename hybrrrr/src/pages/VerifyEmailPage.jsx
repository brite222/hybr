import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/login.css";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed.");
      });
  }, [searchParams]);

  return (
    <div className="login-page">
      <div className="login-right" style={{ gridColumn: "1 / -1" }}>
        <div className="login-form-wrap" style={{ textAlign: "center" }}>
          {status === "verifying" && <h1 className="login-title">Verifying...</h1>}
          {status === "success" && (
            <>
              <h1 className="login-title" style={{ color: "#8DC540" }}>✓ Verified!</h1>
              <p className="login-subtitle">{message}</p>
              <Link to="/login" className="login-submit" style={{ textAlign: "center", textDecoration: "none", display: "inline-block" }}>
                Go to Login
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <h1 className="login-title" style={{ color: "#ff6b6b" }}>✗ Failed</h1>
              <p className="login-subtitle">{message}</p>
              <Link to="/register" className="login-link">Try registering again</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}