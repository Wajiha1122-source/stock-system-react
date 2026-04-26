import { useState } from "react";
import API from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!username || !password) {
      setMsg("Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMsg(data.message || "Invalid login");
        return;
      }

      if (data.role === "manager") {
        window.location.href = "/manager";
      } else {
        window.location.href = "/owner";
      }

    } catch (err) {
      setMsg("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", background: "linear-gradient(135deg, #f5f1e6, #d8cfc4)", fontFamily: "Arial" }}
    >
      <div
        className="login-card"
        style={{
          width: "360px",
          background: "#fffdf7",
          borderRadius: "14px",
          padding: "25px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          border: "1px solid #e6dfd2"
        }}
      >
        <h3 className="text-center mb-3" style={{ color: "#556b2f", fontWeight: "bold" }}>
          Stock System
        </h3>

        <input
          className="form-control mb-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          className="btn w-100 text-white"
          onClick={login}
          disabled={loading}
          style={{ background: "#556b2f" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-danger mt-2 text-center">{msg}</p>
      </div>
    </div>
  );
}