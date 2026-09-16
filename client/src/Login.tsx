import { useState } from "react";
import { login } from "./api";

export function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const token = await login(email, password);
      onLogin(token);
    } catch {
      setError("Login failed. Check your email and password.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Admin Login</h2>
      <div>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">Log in</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
