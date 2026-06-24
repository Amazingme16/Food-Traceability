"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, KeyRound, Wallet, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Farmer");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let finalWallet = walletAddress;
      if (!finalWallet) {
        const array = new Uint8Array(20);
        for (let i = 0; i < 20; i++) array[i] = Math.floor(Math.random() * 256);
        finalWallet = "0x" + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      }

      const res = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          passwordHash: password,
          role,
          walletAddress: finalWallet,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
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
    <div className="max-w-md w-full mx-auto my-12 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-slate-900 font-display">Actor Registration</h2>
          <p className="text-sm text-slate-500">Create an account to join the decentralized food supply chain.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Full Name / Organization</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 rounded-lg px-3 py-2 transition-all">
              <User className="text-slate-400 h-4.5 w-4.5" />
              <input
                type="text"
                placeholder="e.g. Green Valley Farm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-slate-800 text-sm ml-2.5"
                required
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
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

          {/* Role Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Supply Chain Role</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 rounded-lg px-3 py-2 transition-all">
              <ShieldCheck className="text-slate-400 h-4.5 w-4.5" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-slate-800 text-sm ml-2.5 cursor-pointer"
              >
                <option value="Farmer">Farmer (Create batches)</option>
                <option value="Processor">Processor (Update stage)</option>
                <option value="Logistics">Logistics (Update stage)</option>
                <option value="Retailer">Retailer (Update stage)</option>
                <option value="Consumer">Consumer (Read-only)</option>
              </select>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Web3 Wallet Address (Optional)
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 rounded-lg px-3 py-2 transition-all">
              <Wallet className="text-slate-400 h-4.5 w-4.5" />
              <input
                type="text"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-slate-800 text-sm ml-2.5 font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Leave blank to auto-assign a demo account wallet for gasless operations.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Register Account"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-600 font-semibold hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
