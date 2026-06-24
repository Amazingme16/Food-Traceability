"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  QrCode,
  History,
  TrendingUp,
  FileSpreadsheet,
  Globe,
  Layers,
  MapPin,
  Clock,
  User,
  LogOut,
  ExternalLink,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface BatchEvent {
  id: number;
  stage: string;
  actorWallet: string;
  txHash: string;
  timestamp: string;
}

interface Batch {
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
    role: string;
  };
  events: BatchEvent[];
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Create Batch Form State
  const [productName, setProductName] = useState("");
  const [origin, setOrigin] = useState("");
  const [batchIdentifier, setBatchIdentifier] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [fertilizerUsed, setFertilizerUsed] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Update Stage State
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateStage, setUpdateStage] = useState("Processing");
  const [stageUpdatingBatch, setStageUpdatingBatch] = useState<any>(null);

  // Stage transition inputs
  const [cleaning, setCleaning] = useState("");
  const [packaging, setPackaging] = useState("");
  const [qualityCheck, setQualityCheck] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [temperature, setTemperature] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [shelfDate, setShelfDate] = useState("");
  const [salesInfo, setSalesInfo] = useState("");

  const renderEventDetails = (event: any) => {
    if (!event.details) return null;
    try {
      const details = JSON.parse(event.details);
      if (Object.keys(details).length === 0) return null;
      
      return (
        <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 font-mono flex flex-col gap-1.5 shadow-inner">
          {details.cleaning && (
            <div><span className="font-bold text-slate-400">CLEANING:</span> <span className="text-slate-700 font-sans">{details.cleaning}</span></div>
          )}
          {details.packaging && (
            <div><span className="font-bold text-slate-400">PACKAGING:</span> <span className="text-slate-700 font-sans">{details.packaging}</span></div>
          )}
          {details.qualityCheck && (
            <div><span className="font-bold text-slate-400">QUALITY CHECK:</span> <span className="text-emerald-700 font-sans font-semibold">✓ {details.qualityCheck}</span></div>
          )}
          {details.vehicleInfo && (
            <div><span className="font-bold text-slate-400">VEHICLE INFO:</span> <span className="text-slate-700 font-sans">{details.vehicleInfo}</span></div>
          )}
          {details.temperature && (
            <div><span className="font-bold text-slate-400">TEMPERATURE:</span> <span className="text-indigo-600 font-semibold">{details.temperature}</span></div>
          )}
          {details.pickupDate && (
            <div><span className="font-bold text-slate-400">PICKUP DATE:</span> <span className="text-slate-700 font-sans">{new Date(details.pickupDate).toLocaleString()}</span></div>
          )}
          {details.deliveryDate && (
            <div><span className="font-bold text-slate-400">DELIVERY DATE:</span> <span className="text-slate-700 font-sans">{new Date(details.deliveryDate).toLocaleString()}</span></div>
          )}
          {details.arrivalDate && (
            <div><span className="font-bold text-slate-400">ARRIVED AT STORE:</span> <span className="text-slate-700 font-sans">{new Date(details.arrivalDate).toLocaleString()}</span></div>
          )}
          {details.shelfDate && (
            <div><span className="font-bold text-slate-400">DISPLAYED ON SHELF:</span> <span className="text-slate-700 font-sans">{new Date(details.shelfDate).toLocaleString()}</span></div>
          )}
          {details.salesInfo && (
            <div><span className="font-bold text-slate-400">RETAIL STATUS:</span> <span className="text-slate-700 font-sans">{details.salesInfo}</span></div>
          )}
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // Check Auth
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchBatches(token);
  }, []);

  const fetchBatches = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/batches", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to load batches");
      }
      const data = await res.json();
      setBatches(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching batches.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreateLoading(true);
    setCreateSuccess(false);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productName, origin, batchIdentifier, plantingDate, harvestDate, fertilizerUsed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create batch");
      }

      setProductName("");
      setOrigin("");
      setBatchIdentifier("");
      setPlantingDate("");
      setHarvestDate("");
      setFertilizerUsed("");
      setCreateSuccess(true);
      
      // Auto close success message and refetch
      setTimeout(() => setCreateSuccess(false), 3000);
      
      if (token) fetchBatches(token);
    } catch (err: any) {
      setError(err.message || "Could not create batch");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStage = async (batchId: number) => {
    setError("");
    setUpdatingId(batchId);

    const token = localStorage.getItem("token");
    try {
      let details: Record<string, any> = {};
      if (updateStage === "Processing") {
        details = { cleaning, qualityCheck };
      } else if (updateStage === "Packaged") {
        details = { packaging, qualityCheck };
      } else if (updateStage === "Shipped") {
        details = { vehicleInfo, temperature, pickupDate, deliveryDate };
      } else if (updateStage === "Delivered") {
        details = { arrivalDate, shelfDate, salesInfo };
      }

      const res = await fetch(`http://localhost:3001/batches/${batchId}/stage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage: updateStage, details }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update supply chain stage");
      }

      // Clear input fields
      setCleaning("");
      setPackaging("");
      setQualityCheck("");
      setVehicleInfo("");
      setTemperature("");
      setPickupDate("");
      setDeliveryDate("");
      setArrivalDate("");
      setShelfDate("");
      setSalesInfo("");
      setStageUpdatingBatch(null);

      if (token) fetchBatches(token);
      // If modal is open for this batch, update its events
      if (selectedBatch && selectedBatch.id === batchId) {
        fetchBatchDetails(batchId);
      }
    } catch (err: any) {
      setError(err.message || "Could not update stage");
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchBatchDetails = async (batchId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/batches/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedBatch(data);
      }
    } catch (err) {
      console.error("Error fetching details", err);
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

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="font-semibold text-emerald-600">{user.role}</span>
              <span>•</span>
              <span className="font-mono text-slate-400 select-all truncate max-w-[200px] sm:max-w-none">
                {user.walletAddress}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 font-medium text-sm px-4 py-2 rounded-xl transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl flex items-center gap-2 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Creator panel (Only Farmers can create) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {user.role === "Farmer" ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="text-emerald-600 h-5 w-5" />
                  Create Food Batch
                </h2>
                <p className="text-xs text-slate-500">
                  Register a new harvested product on the blockchain.
                </p>
              </div>

              {createSuccess && (
                <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-emerald-100">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Batch created successfully on blockchain!</span>
                </div>
              )}

              <form onSubmit={handleCreateBatch} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Tomatoes"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Origin farm/details</label>
                  <input
                    type="text"
                    placeholder="e.g. Green Valley Farm, Block B"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Batch SKU/Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. TOM-2026-001"
                    value={batchIdentifier}
                    onChange={(e) => setBatchIdentifier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Planting Date</label>
                    <input
                      type="date"
                      value={plantingDate}
                      onChange={(e) => setPlantingDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Harvest Date</label>
                    <input
                      type="date"
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Fertilizer Used</label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Compost, NPK 5-5-5"
                    value={fertilizerUsed}
                    onChange={(e) => setFertilizerUsed(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Broadcasting Tx...
                    </>
                  ) : (
                    "Publish to Ledger"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-base">Actor Workspace</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                As a <strong className="text-emerald-400">{user.role}</strong>, you can track and transition supply chain stages for active crop batches. Select a batch from the ledger list to transition its logistics stage.
              </p>
              <div className="border-t border-slate-700/50 pt-4 flex flex-col gap-2">
                <h4 className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Authorized Stages</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["Processing", "Packaged", "Shipped", "Delivered"].map((stg) => (
                    <span key={stg} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {stg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ledger List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="text-slate-500 h-5 w-5" />
              Traceability Ledger
            </h2>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {batches.length} Batches
            </span>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="text-sm text-slate-500">Querying chain state...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-2">
              <FileSpreadsheet className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700 mt-2">No Batches Found</p>
              <p className="text-xs text-slate-400">Farmers can use the creation panel to publish the first food batch.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {batches.map((batch) => {
                const latestEvent = batch.events[0]; // descending order in list
                const currentStage = latestEvent ? latestEvent.stage : "Harvested";

                return (
                  <div
                    key={batch.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{batch.productName}</span>
                        <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getStageColor(currentStage)}`}>
                          {currentStage}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500">
                        <p className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-slate-400" />
                          <span>ID: {batch.batchIdentifier}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate max-w-[120px]">{batch.origin}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>Farmer: {batch.creator.name}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                      {/* Action selector for supply chain actors */}
                      {user.role !== "Consumer" && currentStage !== "Delivered" && (
                        <button
                          onClick={() => {
                            setStageUpdatingBatch(batch);
                            if (currentStage === "Harvested") setUpdateStage("Processing");
                            else if (currentStage === "Processing") setUpdateStage("Packaged");
                            else if (currentStage === "Packaged") setUpdateStage("Shipped");
                            else if (currentStage === "Shipped") setUpdateStage("Delivered");
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 shadow-sm"
                        >
                          Update Stage
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => fetchBatchDetails(batch.id)}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center"
                        title="QR & History Details"
                      >
                        <QrCode className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 flex flex-col gap-6 relative">
            <button
              onClick={() => setSelectedBatch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-semibold text-lg"
            >
              ✕
            </button>

            <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">{selectedBatch.productName}</h3>
              <p className="text-xs text-slate-500">Batch Identifier: {selectedBatch.batchIdentifier}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-slate-100 pb-6">
              {/* QR Code */}
              <div className="flex flex-col items-center gap-2 border border-slate-100 rounded-xl p-3 bg-slate-50 w-full sm:w-auto shrink-0">
                {selectedBatch.qrCode ? (
                  <img src={selectedBatch.qrCode} alt="QR Code" className="h-32 w-32 object-contain" />
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center text-slate-400 text-xs">Generating...</div>
                )}
                <a
                  href={`/trace/${selectedBatch.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Public Trace Page
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Quick Details */}
              <div className="flex flex-col gap-2 text-xs text-slate-600 w-full">
                <div className="flex justify-between border-b border-slate-50 py-1">
                  <span className="font-medium text-slate-400">Creation Date:</span>
                  <span>{new Date(selectedBatch.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 py-1">
                  <span className="font-medium text-slate-400">Origin:</span>
                  <span>{selectedBatch.origin}</span>
                </div>
                {selectedBatch.plantingDate && (
                  <div className="flex justify-between border-b border-slate-50 py-1">
                    <span className="font-medium text-slate-400">Planting Date:</span>
                    <span>{selectedBatch.plantingDate}</span>
                  </div>
                )}
                {selectedBatch.harvestDate && (
                  <div className="flex justify-between border-b border-slate-50 py-1">
                    <span className="font-medium text-slate-400">Harvest Date:</span>
                    <span>{selectedBatch.harvestDate}</span>
                  </div>
                )}
                {selectedBatch.fertilizerUsed && (
                  <div className="flex justify-between border-b border-slate-50 py-1">
                    <span className="font-medium text-slate-400">Fertilizer Used:</span>
                    <span>{selectedBatch.fertilizerUsed}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-50 py-1">
                  <span className="font-medium text-slate-400">Genesis Farmer:</span>
                  <span>{selectedBatch.creator?.name}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-slate-50 py-1">
                  <span className="font-medium text-slate-400">Genesis Blockchain Tx:</span>
                  <span className="font-mono text-[10px] text-slate-500 break-all select-all">
                    {selectedBatch.blockchainTxHash || "Syncing to block..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline history */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <History className="h-4 w-4" />
                Supply Chain Timeline
              </h4>

              {selectedBatch.events && selectedBatch.events.length > 0 ? (
                <div className="relative border-l border-slate-200 ml-3 pl-5 flex flex-col gap-6 py-2">
                  {selectedBatch.events.map((event: any, idx: number) => (
                    <div key={event.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-600 shadow-sm" />
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-slate-900">{event.stage}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <span>By wallet:</span>
                          <span className="text-slate-600 break-all font-semibold">{event.actorWallet}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <span>Tx:</span>
                          <span className="text-slate-500 select-all truncate max-w-[250px]">{event.txHash}</span>
                        </p>
                        {renderEventDetails(event)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No stage transitions recorded yet.</p>
              )}
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={() => setSelectedBatch(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Stage Modal */}
      {stageUpdatingBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 flex flex-col gap-6 relative animate-in fade-in-50 zoom-in-95 duration-150">
            <button
              onClick={() => setStageUpdatingBatch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-semibold text-lg"
            >
              ✕
            </button>

            <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Update Supply Chain Stage</h3>
              <p className="text-xs text-slate-500">
                Updating ledger for <strong className="text-slate-700">{stageUpdatingBatch.productName}</strong> ({stageUpdatingBatch.batchIdentifier})
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Transition Stage</label>
                <select
                  value={updateStage}
                  onChange={(e) => setUpdateStage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="Processing">Processing (Cleaning, Quality Check)</option>
                  <option value="Packaged">Packaged (Packaging type, Quality check)</option>
                  <option value="Shipped">Shipped (Logistics vehicle, Temperature, Timestamps)</option>
                  <option value="Delivered">Delivered (Retail Store arrival & display shelf info)</option>
                </select>
              </div>

              {/* Dynamic input fields based on updateStage */}
              {updateStage === "Processing" && (
                <div className="flex flex-col gap-4 border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cleaning Process Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Triple-washed, UV sanitized"
                      value={cleaning}
                      onChange={(e) => setCleaning(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Quality Inspection Status</label>
                    <input
                      type="text"
                      placeholder="e.g. Passed grade sorting check"
                      value={qualityCheck}
                      onChange={(e) => setQualityCheck(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {updateStage === "Packaged" && (
                <div className="flex flex-col gap-4 border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Packaging Material / Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Biodegradable fiber tray (500g)"
                      value={packaging}
                      onChange={(e) => setPackaging(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Packaging Quality Check</label>
                    <input
                      type="text"
                      placeholder="e.g. Air-tight sealing verified"
                      value={qualityCheck}
                      onChange={(e) => setQualityCheck(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {updateStage === "Shipped" && (
                <div className="flex flex-col gap-4 border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Information / Truck ID</label>
                    <input
                      type="text"
                      placeholder="e.g. Refrigerated Truck TRK-084"
                      value={vehicleInfo}
                      onChange={(e) => setVehicleInfo(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Cargo Temperature</label>
                      <input
                        type="text"
                        placeholder="e.g. 4.5°C"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Pickup Date</label>
                      <input
                        type="datetime-local"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Estimated Delivery Date</label>
                    <input
                      type="datetime-local"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {updateStage === "Delivered" && (
                <div className="flex flex-col gap-4 border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Arrival Date & Time</label>
                      <input
                        type="datetime-local"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Display Shelf Date</label>
                      <input
                        type="datetime-local"
                        value={shelfDate}
                        onChange={(e) => setShelfDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Display/Retail Sales Info</label>
                    <input
                      type="text"
                      placeholder="e.g. Displayed in Section A (Organics), SKU tags attached"
                      value={salesInfo}
                      onChange={(e) => setSalesInfo(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
              <button
                onClick={() => setStageUpdatingBatch(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStage(stageUpdatingBatch.id)}
                disabled={updatingId === stageUpdatingBatch.id}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                {updatingId === stageUpdatingBatch.id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  "Record Event"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
