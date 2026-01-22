import React, { useState } from "react";
import { fetchAPI } from "../api/api.js";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await fetchAPI("auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      switch (data.user.role.toLowerCase()) {
        case "seo":
          window.location.href = "/seo-dashboard";
          break;
        case "manager":
        case "hr":
          window.location.href = "/manager-dashboard";
          break;
        case "employee":
          window.location.href = "/employee-dashboard";
          break;
        case "client":
          window.location.href = "/client-dashboard";
          break;
        default:
          window.location.href = "/dashboard";
          break;
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login to OfficeSphere</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
