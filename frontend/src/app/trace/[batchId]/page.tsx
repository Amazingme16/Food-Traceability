"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  Clock,
  User,
  Layers,
  Search,
  ExternalLink,
  ChevronLeft,
  Loader2,
  Calendar,
  History,
  AlertCircle
} from "lucide-react";

interface BatchEvent {
  id: number;
  stage: string;
  actorWallet: string;
  txHash: string;
  details?: string;
  timestamp: string;
}

interface BatchDetails {
  id: number;
  productName: string;
  origin: string;
  batchIdentifier: string;
  createdBy: number;
  blockchainTxHash?: string;
  plantingDate?: string;
  harvestDate?: string;
  fertilizerUsed?: string;
  createdAt: string;
  creator: {
    name: string;
    email: string;
    role: string;
  };
  events: BatchEvent[];
}

interface TraceResponse {
  batch: BatchDetails;
  verificationStatus: string;
  isMock: boolean;
}

export default function TraceBatch() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.batchId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<TraceResponse | null>(null);

  useEffect(() => {
    if (batchId) {
      fetchTraceDetails();
    }
  }, [batchId]);

  const fetchTraceDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`http://localhost:3001/trace/${batchId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Batch not found. Please verify the Batch ID or SKU.");
        }
        throw new Error("Could not retrieve traceability timeline.");
      }
      const traceData = await res.json();
      setData(traceData);
    } catch (err: any) {
      setError(err.message || "Failed to connect to blockchain API.");
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Harvested":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Processing":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Packaged":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Delivered":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Querying decentralized ledger...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md w-full mx-auto my-16 px-4 flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-900">Trace Failed</h2>
          <p className="text-sm text-slate-500">{error || "No data returned."}</p>
          <div className="flex flex-col w-full gap-2 mt-2">
            <button
              onClick={() => router.push("/")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors w-full"
            >
              Back to Home
            </button>
            <button
              onClick={fetchTraceDetails}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm py-2.5 rounded-lg transition-colors w-full"
            >
              Retry Query
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { batch, verificationStatus, isMock } = data;
  
  // Logical order of stages to display as visual progress nodes
  const trackStages = ["Harvested", "Processing", "Packaged", "Shipped", "Delivered"];
  const currentStageIndex = batch.events ? Math.max(...batch.events.map(e => trackStages.indexOf(e.stage))) : 0;
  const currentStageName = trackStages[currentStageIndex] || "Harvested";

  const getStageMetadata = (stage: string) => {
    switch (stage) {
      case "Harvested":
        return {
          title: "Harvest & Origin",
          actor: "Farmer",
          color: "text-emerald-600 border-emerald-500 bg-emerald-500",
          icon: "🌱"
        };
      case "Processing":
        return {
          title: "Food Processing",
          actor: "Processing Company",
          color: "text-indigo-600 border-indigo-500 bg-indigo-500",
          icon: "🏭"
        };
      case "Packaged":
        return {
          title: "Safety Packaging",
          actor: "Processing Company",
          color: "text-purple-600 border-purple-500 bg-purple-500",
          icon: "📦"
        };
      case "Shipped":
        return {
          title: "Cold Logistics",
          actor: "Transport Company",
          color: "text-blue-600 border-blue-500 bg-blue-500",
          icon: "🚛"
        };
      case "Delivered":
        return {
          title: "Retail Store shelf",
          actor: "Retail Store",
          color: "text-amber-600 border-amber-500 bg-amber-500",
          icon: "🏪"
        };
      default:
        return {
          title: stage,
          actor: "Actor",
          color: "text-slate-600 border-slate-500 bg-slate-500",
          icon: "🔗"
        };
    }
  };

  const renderEventDetails = (event: any) => {
    if (!event.details) return null;
    try {
      const details = JSON.parse(event.details);
      if (Object.keys(details).length === 0) return null;
      
      return (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600 font-sans">
          {details.cleaning && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Cleaning Method</span>
              <span className="font-semibold text-slate-800">{details.cleaning}</span>
            </div>
          )}
          {details.packaging && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Packaging Material</span>
              <span className="font-semibold text-slate-800">{details.packaging}</span>
            </div>
          )}
          {details.qualityCheck && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Quality Inspection</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-0.5">✓ {details.qualityCheck}</span>
            </div>
          )}
          {details.vehicleInfo && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Logistics Vehicle</span>
              <span className="font-semibold text-slate-800">{details.vehicleInfo}</span>
            </div>
          )}
          {details.temperature && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Cold Chain Temp</span>
              <span className="font-bold text-blue-600">{details.temperature}</span>
            </div>
          )}
          {details.pickupDate && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Cargo Handover Time</span>
              <span className="font-semibold text-slate-800">{new Date(details.pickupDate).toLocaleString()}</span>
            </div>
          )}
          {details.deliveryDate && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Est. Retail Arrival</span>
              <span className="font-semibold text-slate-800">{new Date(details.deliveryDate).toLocaleString()}</span>
            </div>
          )}
          {details.arrivalDate && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Store Receipt Date</span>
              <span className="font-semibold text-slate-800">{new Date(details.arrivalDate).toLocaleString()}</span>
            </div>
          )}
          {details.shelfDate && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Shelf Display Date</span>
              <span className="font-semibold text-slate-800">{new Date(details.shelfDate).toLocaleString()}</span>
            </div>
          )}
          {details.salesInfo && (
            <div className="flex flex-col sm:col-span-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Store Location / Sales info</span>
              <span className="font-semibold text-slate-800">{details.salesInfo}</span>
            </div>
          )}
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider"
        >
          <ChevronLeft className="h-4 w-4" />
          Track Another Item
        </button>

        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full px-4 py-1.5 text-xs font-extrabold shadow-sm animate-pulse">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{verificationStatus}</span>
        </div>
      </div>

      {/* Interactive Visual Supply Chain Map */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Live Supply Chain Map
          </span>
          <h2 className="text-xl font-black text-slate-900">Decentralized Journey Progress</h2>
        </div>

        {/* Process Map Line */}
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 md:gap-2 w-full mt-4 pb-4">
          {/* Connector bars */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -translate-y-1/2 hidden md:block z-0" />
          <div 
            className="absolute top-1/2 left-4 h-1 bg-emerald-500 -translate-y-1/2 hidden md:block z-0 transition-all duration-500" 
            style={{ width: `${(currentStageIndex / (trackStages.length - 1)) * 95}%` }}
          />

          {trackStages.map((stg, index) => {
            const hasOccurred = batch.events?.some(e => e.stage === stg) || (stg === "Harvested");
            const isLatest = stg === currentStageName;
            const meta = getStageMetadata(stg);

            return (
              <div 
                key={stg} 
                className={`relative flex flex-row md:flex-col items-center gap-4 md:gap-3 w-full md:w-auto z-10 ${
                  hasOccurred ? "opacity-100" : "opacity-40"
                }`}
              >
                {/* Node Ring */}
                <div 
                  className={`h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold border-4 transition-all duration-300 shadow ${
                    isLatest 
                      ? "bg-white border-emerald-500 scale-125 ring-8 ring-emerald-50 text-emerald-600" 
                      : hasOccurred 
                        ? "bg-emerald-600 border-white text-white" 
                        : "bg-slate-100 border-slate-200 text-slate-400"
                  }`}
                >
                  {isLatest && !hasOccurred ? "⏳" : meta.icon}
                </div>

                <div className="flex flex-col md:items-center text-left md:text-center">
                  <span className="text-xs font-black text-slate-900 leading-tight">{stg}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{meta.actor}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Summary Profile */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -right-16 -top-16 h-48 w-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-6 relative z-10">
          <div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">🍅 Verified Food Product</span>
            <h1 className="text-3xl font-black mt-3 tracking-tight">{batch.productName}</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              SKU CODE: <span className="font-semibold text-slate-200 select-all">{batch.batchIdentifier}</span>
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl px-4 py-3 flex flex-col gap-1 font-mono text-[10px] text-slate-400">
            <span className="uppercase text-[9px] font-black tracking-widest text-slate-500">Decentralized Status</span>
            <span className="text-white text-xs font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Verifiable Blockchain Record
            </span>
          </div>
        </div>

        {/* Detailed Fact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 relative z-10">
          <div className="flex flex-col gap-1 border-l-2 border-emerald-500 pl-4 py-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Genesis Origin</span>
            <span className="text-sm font-bold text-slate-100">{batch.origin}</span>
            <span className="text-[10px] text-slate-400 italic">Farmer: {batch.creator.name}</span>
          </div>

          <div className="flex flex-col gap-1 border-l-2 border-emerald-500 pl-4 py-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Growing Cycle</span>
            <span className="text-sm font-bold text-slate-100">
              Planted: <span className="font-normal text-slate-300">{batch.plantingDate || "N/A"}</span>
            </span>
            <span className="text-xs font-bold text-slate-100">
              Harvested: <span className="font-normal text-slate-300">{batch.harvestDate || "N/A"}</span>
            </span>
          </div>

          <div className="flex flex-col gap-1 border-l-2 border-emerald-500 pl-4 py-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Growing Additives</span>
            <span className="text-sm font-bold text-slate-100">{batch.fertilizerUsed || "None Recorded"}</span>
            <span className="text-[10px] text-slate-400 italic">Tested & Verified safe</span>
          </div>
        </div>

        {/* Ledger Transaction Link */}
        {batch.blockchainTxHash && (
          <div className="mt-8 bg-slate-800/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Blockchain Genesis Tx Hash</span>
              <span className="text-slate-300 break-all select-all font-semibold max-w-[450px]">{batch.blockchainTxHash}</span>
            </div>
            {!isMock && (
              <a
                href={`https://amoy.polygonscan.com/tx/${batch.blockchainTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors tracking-wide shrink-0"
              >
                Scan block
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Safety Logs Timeline */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
          <History className="h-5 w-5 text-emerald-600" />
          Chronological Safety Journey Log
        </h2>

        {batch.events && batch.events.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 sm:pl-8 flex flex-col gap-8 py-2">
            {batch.events.map((event, idx) => {
              const isLatest = idx === batch.events.length - 1;
              const meta = getStageMetadata(event.stage);

              return (
                <div key={event.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <span
                    className={`absolute -left-[35px] sm:-left-[43px] top-1 h-5 w-5 rounded-full border-4 border-white shadow transition-all ${
                      isLatest ? "bg-emerald-600 scale-125 ring-4 ring-emerald-50" : "bg-slate-300"
                    }`}
                  />

                  <div className="flex flex-col gap-2 bg-slate-50/40 hover:bg-slate-50 border border-slate-200/40 hover:border-slate-200 rounded-2xl p-5 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900">{event.stage}</span>
                        <span className="text-[10px] bg-slate-200/70 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-300/40">
                          {meta.actor}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {/* Rich serialized event parameters */}
                    {renderEventDetails(event)}

                    {/* Verification Ledger metadata */}
                    <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-1 font-mono text-[9px] text-slate-400 mt-2">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-400 uppercase tracking-wide">Actor Cryptographic Signature:</span>
                        <span className="text-slate-700 font-semibold break-all select-all">
                          {event.actorWallet}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2 mt-1">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="font-extrabold text-slate-400 uppercase tracking-wide">Block Ledger Tx Hash:</span>
                          <span className="text-slate-600 break-all select-all font-semibold">{event.txHash}</span>
                        </div>
                        {!isMock && (
                          <a
                            href={`https://amoy.polygonscan.com/tx/${event.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 shrink-0 font-bold hover:underline flex items-center gap-0.5 ml-2 uppercase"
                          >
                            Verify Scan
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400 italic">No supply chain transactions recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
}
