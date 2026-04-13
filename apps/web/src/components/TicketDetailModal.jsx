"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  X,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Sparkles,
  FileText,
  TrendingUp,
  Loader,
} from "lucide-react";
import { IncidentReportModal } from "@/components/AIFeatures";

export function TicketDetailModal({ ticket, onClose }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [assignedEngineer, setAssignedEngineer] = useState(
    ticket.assigned_engineer || "",
  );
  const [resolutionNotes, setResolutionNotes] = useState(
    ticket.resolution_notes || "",
  );

  const queryClient = useQueryClient();

  // Update ticket mutation
  const updateTicket = useMutation({
    mutationFn: async (updates) => {
      const response = await fetch("/api/tickets/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticket.id,
          ...updates,
        }),
      });
      if (!response.ok) throw new Error("Failed to update ticket");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tickets"]);
      toast.success("Ticket updated successfully");
    },
    onError: () => {
      toast.error("Failed to update ticket");
    },
  });

  // AI Ticket Analysis
  const analyzeTicket = async (action) => {
    setIsAnalyzing(true);
    setAiAnalysis("");

    try {
      const response = await fetch("/api/ai/ticket-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket, action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze ticket");
      }

      const data = await response.json();
      setAiAnalysis(data.response);

      // Auto-fill resolution notes if action was "generate_resolution"
      if (action === "generate_resolution" && data.response) {
        setResolutionNotes(data.response);
      }
    } catch (error) {
      toast.error(error.message);
      setAiAnalysis(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    updateTicket.mutate({
      status,
      assigned_engineer: assignedEngineer || null,
      resolution_notes: resolutionNotes || null,
      resolved_at: status === "Resolved" ? new Date().toISOString() : null,
      closed_at: status === "Closed" ? new Date().toISOString() : null,
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-700 border-red-300";
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Low":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 text-blue-700";
      case "In Progress":
        return "bg-yellow-50 text-yellow-700";
      case "Waiting Vendor":
        return "bg-purple-50 text-purple-700";
      case "Resolved":
        return "bg-green-50 text-green-700";
      case "Closed":
        return "bg-gray-50 text-gray-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-gray-400">
                  {ticket.ticket_number}
                </span>
                <div
                  className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getSeverityColor(ticket.severity)}`}
                >
                  {ticket.severity}
                </div>
                {ticket.sla_breach && (
                  <div className="px-2 py-1 rounded text-xs font-bold uppercase bg-red-100 text-red-700 border border-red-300">
                    SLA BREACH
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {ticket.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Created {new Date(ticket.created_at).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {ticket.assigned_engineer || "Unassigned"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Ticket Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {ticket.description || "No description provided"}
                </p>
              </div>

              {/* AI Analysis Section */}
              <div className="border border-blue-200 rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    AI Assistant
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => analyzeTicket("troubleshoot")}
                    disabled={isAnalyzing}
                    className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <TrendingUp size={14} />
                    Troubleshoot
                  </button>
                  <button
                    onClick={() => analyzeTicket("suggest_severity")}
                    disabled={isAnalyzing}
                    className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <AlertCircle size={14} />
                    Suggest Severity
                  </button>
                  <button
                    onClick={() => analyzeTicket("generate_resolution")}
                    disabled={isAnalyzing}
                    className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle size={14} />
                    Generate Resolution
                  </button>
                  <button
                    onClick={() => setShowIncidentReport(true)}
                    className="px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-sm hover:bg-orange-700 flex items-center gap-2"
                  >
                    <FileText size={14} />
                    Incident Report
                  </button>
                </div>

                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-blue-600 mb-3">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-sm">AI is analyzing...</span>
                  </div>
                )}

                {aiAnalysis && (
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {aiAnalysis}
                    </p>
                  </div>
                )}
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 block">
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter resolution details..."
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Time to Resolve */}
              {ticket.time_to_resolve_hours && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Resolved in {ticket.time_to_resolve_hours} hours
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Status & Actions */}
            <div className="space-y-6">
              {/* Status Update */}
              <div>
                <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-medium ${getStatusColor(status)}`}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting Vendor">Waiting Vendor</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Assigned Engineer */}
              <div>
                <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 block">
                  Assigned Engineer
                </label>
                <input
                  type="text"
                  value={assignedEngineer}
                  onChange={(e) => setAssignedEngineer(e.target.value)}
                  placeholder="Enter engineer name"
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* SLA Deadline */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  SLA Deadline
                </h4>
                <p className="text-sm text-gray-900 font-medium">
                  {new Date(ticket.sla_deadline).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.floor(
                    (new Date(ticket.sla_deadline) - new Date()) /
                      (1000 * 60 * 60),
                  )}{" "}
                  hours remaining
                </p>
              </div>

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Metadata
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ticket ID</span>
                    <span className="text-gray-900 font-mono">{ticket.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {ticket.resolved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Resolved</span>
                      <span className="text-gray-900">
                        {new Date(ticket.resolved_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {ticket.closed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Closed</span>
                      <span className="text-gray-900">
                        {new Date(ticket.closed_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={updateTicket.isPending}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateTicket.isPending ? (
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

      {/* Incident Report Modal */}
      {showIncidentReport && (
        <IncidentReportModal
          ticketId={ticket.id}
          onClose={() => setShowIncidentReport(false)}
        />
      )}
    </>
  );
}
