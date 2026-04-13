"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Server,
  HardDrive,
  Cloud,
  Activity,
  Users,
  ShieldCheck,
  Search,
  Bell,
  MoreHorizontal,
  ChevronRight,
  Database,
  Cpu,
  LayoutGrid,
  Settings,
  HelpCircle,
  AlertCircle,
  Plus,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Bot,
} from "lucide-react";
import {
  AIInfrastructureChat,
  MentorBotModal,
  PredictiveMaintenanceModal,
  SLARiskPanel,
  SmartAlertsModal,
  RunbookGeneratorModal,
} from "@/components/AIFeatures";
import { TicketDetailModal } from "@/components/TicketDetailModal";
import { InfrastructureDetailModal } from "@/components/InfrastructureDetailModal";

const ProgressRing = ({ value, label, color, size = 48 }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-gray-100"
            strokeWidth="3"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            style={{ stroke: color }}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-gray-900">
            {value}%
          </span>
        </div>
      </div>
      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const isHealthy =
    status === "Operational" || status === "Healthy" || status === "100%";
  const displayStatus = status === "Operational" ? "Healthy" : status;
  return (
    <div className="bg-white border border-gray-200 rounded-full px-2.5 py-0.5 text-xs text-gray-700 inline-flex items-center gap-1.5">
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          isHealthy
            ? "bg-green-500"
            : status === "Warning"
              ? "bg-orange-500"
              : status === "Critical"
                ? "bg-red-500"
                : "bg-gray-500"
        }`}
      />
      {displayStatus}
    </div>
  );
};

const OutlinePill = ({ children, icon: Icon }) => (
  <div className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 inline-flex items-center gap-1.5">
    {Icon && <Icon size={12} className="text-gray-400" />}
    {children}
  </div>
);

const SoftActionPill = ({ children, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
  >
    {Icon && <Icon size={14} />}
    {children}
  </button>
);

export default function InfraDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [alertsShown, setAlertsShown] = useState({});
  const [showAIChat, setShowAIChat] = useState(false);
  const [showMentorBot, setShowMentorBot] = useState(false);
  const [showPredictiveMaintenance, setShowPredictiveMaintenance] =
    useState(false);
  const [showSmartAlerts, setShowSmartAlerts] = useState(false);
  const [showRunbookGenerator, setShowRunbookGenerator] = useState(false);

  const queryClient = useQueryClient();

  const tabs = [
    "Overview",
    "Infrastructure",
    "Ticket Queue",
    "SLA Health",
    "Engineering",
  ];

  // Check environment mutation
  const checkEnvironment = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/check-env");
      if (!response.ok) throw new Error("Failed to check environment");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.openai_configured) {
        toast.success(`✅ ${data.message}\nKey: ${data.openai_key_preview}`);
      } else {
        toast.error(`❌ ${data.message}`);
      }
      console.log("Environment check:", data);
    },
    onError: (error) => {
      toast.error(`Environment check failed: ${error.message}`);
    },
  });

  // Seed database mutation
  const seedDatabase = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/seed", { method: "POST" });
      if (!response.ok) throw new Error("Failed to seed database");
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      // Refresh all queries
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Fetch infrastructure assets
  const { data: infrastructureData } = useQuery({
    queryKey: ["infrastructure"],
    queryFn: async () => {
      const response = await fetch("/api/infrastructure/list");
      if (!response.ok) throw new Error("Failed to fetch infrastructure");
      return response.json();
    },
  });

  // Fetch tickets
  const { data: ticketsData } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const response = await fetch("/api/tickets/list");
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
  });

  // Fetch SLA metrics
  const { data: slaData } = useQuery({
    queryKey: ["sla-metrics"],
    queryFn: async () => {
      const response = await fetch("/api/sla-metrics/list");
      if (!response.ok) throw new Error("Failed to fetch SLA metrics");
      return response.json();
    },
  });

  // Fetch documentation
  const { data: docsData } = useQuery({
    queryKey: ["documentation"],
    queryFn: async () => {
      const response = await fetch("/api/documentation/list");
      if (!response.ok) throw new Error("Failed to fetch documentation");
      return response.json();
    },
  });

  const systemHealth = infrastructureData?.assets || [];
  const activeTickets = ticketsData?.tickets?.slice(0, 5) || [];
  const slaMetrics = slaData?.metrics?.[0] || {
    uptime_percentage: 0,
    compliance_percentage: 0,
    data_integrity_percentage: 0,
    capacity_utilization_percentage: 0,
  };
  const documents = docsData?.documents || [];

  const kpis = [
    {
      label: "Uptime",
      value: Math.round(parseFloat(slaMetrics.uptime_percentage) || 0),
      color: "#10B981",
    },
    {
      label: "Compliance",
      value: Math.round(parseFloat(slaMetrics.compliance_percentage) || 0),
      color: "#3B82F6",
    },
    {
      label: "Integrity",
      value: Math.round(parseFloat(slaMetrics.data_integrity_percentage) || 0),
      color: "#8B5CF6",
    },
    {
      label: "Capacity",
      value: Math.round(
        parseFloat(slaMetrics.capacity_utilization_percentage) || 0,
      ),
      color: "#F59E0B",
    },
  ];

  const kpiStats = [
    {
      label: "Active Clients",
      value: "12",
      trend: "+2",
      trendType: "positive",
    },
    {
      label: "Open Tickets",
      value: activeTickets.length,
      trend: "-3",
      trendType: "positive",
    },
    {
      label: "Assets Online",
      value: systemHealth.length,
      trend: "100%",
      trendType: "positive",
    },
    {
      label: "SLA Breaches",
      value: ticketsData?.tickets?.filter((t) => t.sla_breach).length || 0,
      trend: "0",
      trendType: "positive",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-['Inter'] text-gray-900">
      {/* Top Navigation */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <img
                src="https://ucarecdn.com/de2d25ea-faff-4f86-be40-55ab3d18ff2c/ePortalTechReliability.png"
                alt="e-Portal Tech Reliability"
                className="h-10 w-auto"
              />
            </div>

            <nav className="hidden md:flex items-center h-16">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 h-full flex items-center text-sm transition-all relative ${
                    activeTab === tab
                      ? "text-gray-900 font-medium border-b-2 border-blue-600 -mb-[1px]"
                      : "text-gray-500 font-normal border-b-2 border-transparent hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Assistant Button */}
            <button
              onClick={() => setShowAIChat(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <Sparkles size={16} />
              AI Assistant
            </button>
            {/* Check API Key Button */}
            <button
              onClick={() => checkEnvironment.mutate()}
              disabled={checkEnvironment.isPending}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              {checkEnvironment.isPending ? "Checking..." : "Check API Key"}
            </button>
            {/* Seed Database Button */}
            <button
              onClick={() => seedDatabase.mutate()}
              disabled={seedDatabase.isPending}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <Database size={16} />
              {seedDatabase.isPending ? "Seeding..." : "Seed Data"}
            </button>
            {/* Smart Alerts Button */}
            <button
              onClick={() => setShowSmartAlerts(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-full text-sm font-medium hover:bg-yellow-100 transition-colors"
            >
              <AlertTriangle size={16} />
              Smart Alerts
            </button>

            <div className="relative group hidden sm:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search cluster, server, ticket..."
                className="bg-gray-50 border border-gray-200 rounded-sm py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all"
              />
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
              <span className="text-xs font-semibold text-gray-600">SE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <OutlinePill icon={Cloud}>Multi-Cloud Ops</OutlinePill>
              <OutlinePill icon={Activity}>SLA Active</OutlinePill>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Infrastructure Overview
            </h1>
            <p className="text-gray-500 mt-1">
              SI Senior Engineering Dashboard for e-Portal environment.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPredictiveMaintenance(true)}
              className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-sm hover:bg-orange-100 transition-colors flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Predictive AI
            </button>
            <button
              onClick={() => setShowRunbookGenerator(true)}
              className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-sm hover:bg-purple-100 transition-colors flex items-center gap-2"
            >
              <BookOpen size={16} />
              Generate Runbook
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors">
              Generate Report
            </button>
            <SoftActionPill icon={Plus}>Provision Resource</SoftActionPill>
          </div>
        </div>

        {/* KPI Rings & Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6 flex flex-wrap justify-center gap-8 lg:justify-between items-center">
            {kpis.slice(0, 2).map((kpi) => (
              <ProgressRing
                key={kpi.label}
                value={kpi.value}
                label={kpi.label}
                color={kpi.color}
              />
            ))}
            {kpis.slice(2, 4).map((kpi) => (
              <ProgressRing
                key={kpi.label}
                value={kpi.value}
                label={kpi.label}
                color={kpi.color}
              />
            ))}
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpiStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
              >
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </span>
                  <span
                    className={`text-xs font-medium ${stat.trendType === "positive" ? "text-green-600" : "text-gray-500"}`}
                  >
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* System Health Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Global Cluster Health
                </h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View Node Map
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemHealth.map((system) => (
                  <div
                    key={system.id}
                    onClick={() => setSelectedAsset(system)}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                        {system.asset_type === "Server" && (
                          <Cpu size={20} className="text-gray-600" />
                        )}
                        {system.asset_type === "Storage" && (
                          <HardDrive size={20} className="text-gray-600" />
                        )}
                        {system.asset_type === "Cloud" && (
                          <Cloud size={20} className="text-gray-600" />
                        )}
                        {system.asset_type === "Backup" && (
                          <Database size={20} className="text-gray-600" />
                        )}
                        {system.asset_type === "HCI" && (
                          <Server size={20} className="text-gray-600" />
                        )}
                      </div>
                      <StatusPill status={system.status} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {system.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <LayoutGrid size={12} /> {system.location || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Activity size={12} />{" "}
                          {parseFloat(system.uptime_percentage || 0).toFixed(2)}
                          % Uptime
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Active Operations Section */}
            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Current L3 Ticket Queue
                  </h2>
                  <p className="text-sm text-gray-500">
                    Infrastructure & Advanced Support Issues
                  </p>
                </div>
                <SoftActionPill icon={MoreHorizontal}>
                  Manage All
                </SoftActionPill>
              </div>
              <div className="divide-y divide-gray-100">
                {activeTickets.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No active tickets
                  </div>
                ) : (
                  activeTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-xs font-mono text-gray-400 w-16">
                          {ticket.ticket_number}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {ticket.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-tight ${
                                ticket.severity === "Critical"
                                  ? "bg-red-50 text-red-600"
                                  : ticket.severity === "High"
                                    ? "bg-orange-50 text-orange-600"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {ticket.severity}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                              {ticket.status}
                            </span>
                            {ticket.sla_breach && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-bold bg-red-100 text-red-700">
                                SLA BREACH
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-gray-300 group-hover:text-gray-500 transition-colors"
                      />
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Engineer Profile Card */}
            <div className="bg-[#F9FAFB] rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  JD
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">John Doe</h3>
                  <p className="text-xs text-gray-500">
                    SI Senior Computing Engineer
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Shift Status</span>
                  <StatusPill status="Healthy" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Assigned Tasks</span>
                  <span className="font-semibold text-gray-900">08 Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Mentorship Pool</span>
                  <span className="font-semibold text-gray-900">
                    03 Juniors
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button className="flex-1 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-sm hover:bg-gray-50 transition-colors">
                  Workload
                </button>
                <button
                  onClick={() => setShowMentorBot(true)}
                  className="flex-1 py-2 bg-purple-600 text-white text-sm font-medium rounded-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Bot size={16} />
                  AI Mentor
                </button>
              </div>
            </div>

            {/* AI SLA Risk Monitor - Automated Panel */}
            <SLARiskPanel />

            {/* Resources & Docs */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Engineering Assets
              </h2>
              <div className="space-y-3">
                {documents.slice(0, 4).map((doc) => (
                  <button
                    key={doc.id}
                    className="w-full flex items-center justify-between group p-2 -mx-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {doc.category === "Security Protocol" && (
                        <ShieldCheck
                          size={16}
                          className="text-gray-400 group-hover:text-blue-600"
                        />
                      )}
                      {doc.category === "Deployment Guide" && (
                        <Database
                          size={16}
                          className="text-gray-400 group-hover:text-blue-600"
                        />
                      )}
                      {doc.category === "Vendor Escalation" && (
                        <HelpCircle
                          size={16}
                          className="text-gray-400 group-hover:text-blue-600"
                        />
                      )}
                      {doc.category === "Runbook" && (
                        <Settings
                          size={16}
                          className="text-gray-400 group-hover:text-blue-600"
                        />
                      )}
                      {![
                        "Security Protocol",
                        "Deployment Guide",
                        "Vendor Escalation",
                        "Runbook",
                      ].includes(doc.category) && (
                        <Settings
                          size={16}
                          className="text-gray-400 group-hover:text-blue-600"
                        />
                      )}
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">
                        {doc.title}
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Background Section Styling (Design System Requirement) */}
      <section className="bg-[#F9FAFB] border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
            Technical Planning & Alignment
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-8">
            Contributing to e-Portal's technology strategy through data-driven
            infrastructure planning and proactive vendor collaboration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <OutlinePill icon={Users}>Mentor 03 Juniors</OutlinePill>
            <OutlinePill icon={Database}>DR Strategy 2026</OutlinePill>
            <OutlinePill icon={Settings}>Global Policy v4.2</OutlinePill>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img
              src="https://ucarecdn.com/de2d25ea-faff-4f86-be40-55ab3d18ff2c/ePortalTechReliability.png"
              alt="e-Portal Tech Reliability"
              className="h-8 w-auto"
            />
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            © 2026 e-Portal Systems SI Group
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Internal Portal
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Compliance Hub
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              System Status
            </a>
          </div>
        </div>
      </footer>

      {/* All Modals */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {selectedAsset && (
        <InfrastructureDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}

      {/* All AI Modals */}
      {showAIChat && (
        <AIInfrastructureChat onClose={() => setShowAIChat(false)} />
      )}
      {showMentorshipModal && (
        <MentorBotModal onClose={() => setShowMentorshipModal(false)} />
      )}
      {showPredictiveMaintenance && (
        <PredictiveMaintenanceModal
          onClose={() => setShowPredictiveMaintenance(false)}
        />
      )}
      {showSmartAlerts && (
        <SmartAlertsModal onClose={() => setShowSmartAlerts(false)} />
      )}
      {showRunbookGenerator && (
        <RunbookGeneratorModal onClose={() => setShowRunbookGenerator(false)} />
      )}
    </div>
  );
}
