"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, Leaf, Truck, ArrowRight } from "lucide-react";

export default function Home() {
  const [searchId, setSearchId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      router.push(`/trace/${searchId.trim()}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center gap-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl flex flex-col gap-6 items-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-none">
          Trace Your Food’s Journey <br />
          <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Immutably Verified
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl">
          Track ingredients from the farm harvest to processing, shipping, and retail stages. Powered by Polygon blockchain and PostgreSQL ledger syncing.
        </p>

        {/* Trace Lookup Form */}
        <form onSubmit={handleSearch} className="w-full max-w-lg mt-4">
          <div className="relative flex items-center bg-white border border-slate-300 focus-within:border-emerald-500 rounded-full p-1.5 shadow-sm transition-all focus-within:shadow">
            <Search className="text-slate-400 ml-4 h-5 w-5" />
            <input
              type="text"
              placeholder="Enter Batch ID (e.g. 1 or BATCH-123)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-slate-800 px-3 py-2.5 text-sm"
              required
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-6 py-2.5 rounded-full transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              Trace Product
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Leaf className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">1. Harvest & Registration</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Farmers register a new crop batch with origin data, planting date, harvest date, and fertilizer used, signing it immutably on the decentralized ledger.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">2. Supply Chain Audit Updates</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Processors record cleaning & packaging; transporters log vehicle info, temperature (e.g. 4°C), and handovers; retailers record shelf placement details.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">3. Immutable Consumer Auditing</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Consumers scan QR codes to instantly trace the entire history, verifying safety parameters and cryptographic transaction hashes for zero-tamper trust.
          </p>
        </div>
      </div>
    </div>
  );
}
