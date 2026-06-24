"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passwordHash: password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-16 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-slate-900">Actor Sign In</h2>
          <p className="text-sm text-slate-500">Sign in to create food batches or update supply stages.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 rounded-lg px-3 py-2 transition-all">
              <Mail className="text-slate-400 h-4.5 w-4.5" />
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-slate-800 text-sm ml-2.5"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 rounded-lg px-3 py-2 transition-all">
              <KeyRound className="text-slate-400 h-4.5 w-4.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-slate-800 text-sm ml-2.5"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-emerald-600 font-semibold hover:underline">
            Register as an Actor
          </a>
        </div>
      </div>

      {/* Demo Credentials Tips */}
      <div className="mt-6 bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Demo Accounts</h4>
        <div className="text-xs text-slate-600 flex flex-col gap-1">
          <p><strong>Farmer:</strong> farmer@test.com / password123</p>
          <p><strong>Processor:</strong> processor@test.com / password123</p>
          <p><strong>Logistics:</strong> logistics@test.com / password123</p>
        </div>
      </div>
    </div>
  );
}
