"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  X,
  Server,
  AlertTriangle,
  CheckCircle,
  Cpu,
  HardDrive,
  Activity,
  Calendar,
  Wrench,
  Sparkles,
  Loader,
} from "lucide-react";

export function InfrastructureDetailModal({ asset, onClose }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [status, setStatus] = useState(asset.status);
  const [cpuUsage, setCpuUsage] = useState(asset.cpu_usage || 0);
  const [memoryUsage, setMemoryUsage] = useState(asset.memory_usage || 0);
  const [storageUsage, setStorageUsage] = useState(asset.storage_usage || 0);
  const [notes, setNotes] = useState(asset.notes || "");

  const queryClient = useQueryClient();

  // Update asset mutation
  const updateAsset = useMutation({
    mutationFn: async (updates) => {
      const response = await fetch("/api/infrastructure/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: asset.id,
          ...updates,
        }),
      });
      if (!response.ok) throw new Error("Failed to update asset");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["infrastructure"]);
      toast.success("Asset updated successfully");
    },
    onError: () => {
      toast.error("Failed to update asset");
    },
  });

  // AI Predictive Maintenance
  const analyzeMaintenance = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("");

    try {
      const response = await fetch("/api/ai/predictive-maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze maintenance");
      }

      const data = await response.json();
      setAiAnalysis(data.response);
    } catch (error) {
      toast.error(error.message);
      setAiAnalysis(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    updateAsset.mutate({
      status,
      cpu_usage: parseFloat(cpuUsage),
      memory_usage: parseFloat(memoryUsage),
      storage_usage: parseFloat(storageUsage),
      notes,
      updated_at: new Date().toISOString(),
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Operational":
        return <CheckCircle className="text-green-600" size={20} />;
      case "Warning":
        return <AlertTriangle className="text-yellow-600" size={20} />;
      case "Critical":
        return <AlertTriangle className="text-red-600" size={20} />;
      case "Maintenance":
        return <Wrench className="text-blue-600" size={20} />;
      default:
        return <Server className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Operational":
        return "bg-green-50 text-green-700 border-green-300";
      case "Warning":
        return "bg-yellow-50 text-yellow-700 border-yellow-300";
      case "Critical":
        return "bg-red-50 text-red-700 border-red-300";
      case "Maintenance":
        return "bg-blue-50 text-blue-700 border-blue-300";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300";
    }
  };

  const getUsageColor = (usage) => {
    if (usage >= 90) return "text-red-600";
    if (usage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Server className="text-blue-600" size={24} />
              <span className="text-sm font-mono text-gray-400">
                {asset.asset_type}
              </span>
              <div
                className={`px-2 py-1 rounded text-xs font-bold uppercase border flex items-center gap-1 ${getStatusColor(status)}`}
              >
                {getStatusIcon(status)}
                {status}
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {asset.name}
            </h2>
            <p className="text-sm text-gray-500">
              {asset.model && `${asset.model} • `}
              {asset.vendor && `${asset.vendor} • `}
              {asset.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Column - Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resource Usage */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Resource Usage
              </h3>
              <div className="space-y-4">
                {/* CPU Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu size={16} className="text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">
                        CPU Usage
                      </label>
                    </div>
                    <span
                      className={`text-sm font-bold ${getUsageColor(cpuUsage)}`}
                    >
                      {cpuUsage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cpuUsage}
                    onChange={(e) => setCpuUsage(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Memory Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-purple-600" />
                      <label className="text-sm font-medium text-gray-700">
                        Memory Usage
                      </label>
                    </div>
                    <span
                      className={`text-sm font-bold ${getUsageColor(memoryUsage)}`}
                    >
                      {memoryUsage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={memoryUsage}
                    onChange={(e) => setMemoryUsage(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Storage Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <HardDrive size={16} className="text-green-600" />
                      <label className="text-sm font-medium text-gray-700">
                        Storage Usage
                      </label>
                    </div>
                    <span
                      className={`text-sm font-bold ${getUsageColor(storageUsage)}`}
                    >
                      {storageUsage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={storageUsage}
                    onChange={(e) => setStorageUsage(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Uptime */}
            {asset.uptime_percentage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Uptime
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {asset.uptime_percentage}%
                  </span>
                </div>
              </div>
            )}

            {/* AI Predictive Maintenance */}
            <div className="border border-purple-200 rounded-lg bg-purple-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  AI Predictive Maintenance
                </h3>
              </div>

              <button
                onClick={analyzeMaintenance}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 mb-3"
              >
                {isAnalyzing ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wrench size={14} />
                    Predict Maintenance Needs
                  </>
                )}
              </button>

              {aiAnalysis && (
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {aiAnalysis}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 block">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this asset..."
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Right Column - Status & Metadata */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-medium ${getStatusColor(status)}`}
              >
                <option value="Operational">Operational</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Maintenance Info */}
            {(asset.last_maintenance_date || asset.next_maintenance_date) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-blue-600" />
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Maintenance Schedule
                  </h4>
                </div>
                <div className="space-y-2 text-sm">
                  {asset.last_maintenance_date && (
                    <div>
                      <span className="text-gray-500">Last Maintenance:</span>
                      <p className="text-gray-900 font-medium">
                        {new Date(
                          asset.last_maintenance_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {asset.next_maintenance_date && (
                    <div>
                      <span className="text-gray-500">Next Maintenance:</span>
                      <p className="text-gray-900 font-medium">
                        {new Date(
                          asset.next_maintenance_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Support Contract */}
            {asset.support_contract_expires && (
              <div
                className={`border rounded-lg p-4 ${
                  new Date(asset.support_contract_expires) <
                  new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    ? "bg-orange-50 border-orange-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Support Contract
                </h4>
                <p className="text-sm text-gray-900 font-medium">
                  Expires:{" "}
                  {new Date(
                    asset.support_contract_expires,
                  ).toLocaleDateString()}
                </p>
                {new Date(asset.support_contract_expires) <
                  new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Expiring within 90 days
                  </p>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Asset Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Asset ID</span>
                  <span className="text-gray-900 font-mono">{asset.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-900">{asset.asset_type}</span>
                </div>
                {asset.vendor && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vendor</span>
                    <span className="text-gray-900">{asset.vendor}</span>
                  </div>
                )}
                {asset.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="text-gray-900">{asset.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(asset.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={updateAsset.isPending}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updateAsset.isPending ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
