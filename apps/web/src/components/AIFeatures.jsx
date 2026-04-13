import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  X,
  Sparkles,
  Bot,
  TrendingUp,
  FileText,
  Zap,
  Shield,
  AlertTriangle,
  BookOpen,
  Copy,
} from "lucide-react";

// AI Infrastructure Chat Component
export const AIInfrastructureChat = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setMessages([...messages, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/infrastructure-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Sparkles size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Infrastructure Intelligence
              </h2>
              <p className="text-sm text-gray-500">
                Ask anything about your infrastructure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">
                Ask me anything about your infrastructure:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() =>
                    setQuery("Which servers are approaching capacity?")
                  }
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700"
                >
                  Capacity status?
                </button>
                <button
                  onClick={() => setQuery("Show me critical tickets")}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700"
                >
                  Critical tickets
                </button>
                <button
                  onClick={() => setQuery("What are the SLA risks?")}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700"
                >
                  SLA risks
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-blue-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot size={16} className="text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about infrastructure health, tickets, capacity..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles size={16} />
              Ask AI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// AI Mentor Bot Component
export const MentorBotModal = ({ onClose }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI infrastructure mentor. I can help you learn about VMware, storage, networking, cloud, and more. What would you like to learn today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("General Infrastructure");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { role: "user", content: question };
    setMessages([...messages, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/mentor-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          topic,
          conversationHistory: messages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error("Failed to get mentor response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      toast.error("Failed to get mentor response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Bot size={20} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  AI Mentor Bot
                </h2>
                <p className="text-sm text-gray-500">
                  Learn infrastructure engineering
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
          >
            <option>General Infrastructure</option>
            <option>VMware vSphere</option>
            <option>Storage SAN/NAS</option>
            <option>Backup & DR</option>
            <option>Cloud (AWS/Azure)</option>
            <option>Linux Administration</option>
            <option>Networking</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-purple-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Bot size={16} className="text-purple-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your mentor a question..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              Ask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Predictive Maintenance Modal
export const PredictiveMaintenanceModal = ({ onClose }) => {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/ai/predictive-maintenance", {
          method: "POST",
        });
        if (!response.ok) throw new Error("Failed to generate analysis");
        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (error) {
        toast.error("Failed to generate predictive analysis");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Predictive Maintenance Advisor
              </h2>
              <p className="text-sm text-gray-500">
                AI-powered failure prediction and prevention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <TrendingUp
                size={48}
                className="mx-auto text-gray-300 mb-4 animate-pulse"
              />
              <p className="text-gray-500">
                Analyzing infrastructure metrics...
              </p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                {analysis}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-sm hover:bg-gray-50"
          >
            Close
          </button>
          <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-sm hover:bg-orange-700">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Incident Report Modal
export const IncidentReportModal = ({ ticketId, onClose }) => {
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/ai/incident-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId }),
        });
        if (!response.ok) throw new Error("Failed to generate report");
        const data = await response.json();
        setReport(data.report);
      } catch (error) {
        toast.error("Failed to generate incident report");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [ticketId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(report);
    toast.success("Report copied to clipboard");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              AI-Generated Incident Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <FileText
                size={48}
                className="mx-auto text-gray-300 mb-4 animate-pulse"
              />
              <p className="text-gray-500">
                Generating professional incident report...
              </p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-mono">
                {report}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-sm hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-sm hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};

// AI Ticket Assistant Hook for existing modals
export const useTicketAI = (ticket) => {
  const [aiAnalysis, setAIAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTicket = async (action) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/ticket-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket, action }),
      });
      if (!response.ok) throw new Error("Failed to analyze ticket");
      const data = await response.json();

      setAIAnalysis(data.response);
      toast.success("AI analysis complete");
      return data.response;
    } catch (error) {
      toast.error("Failed to analyze ticket");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { aiAnalysis, isAnalyzing, analyzeTicket };
};

// SLA Risk Detector Panel
export const SLARiskPanel = () => {
  const [analysis, setAnalysis] = useState("");
  const [riskLevel, setRiskLevel] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [showFull, setShowFull] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiskAnalysis = async () => {
      try {
        const response = await fetch("/api/ai/sla-risk-detector", {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch risk analysis");
        }

        setAnalysis(data.analysis);

        // Extract risk level from analysis
        const match = data.analysis.match(
          /\*\*OVERALL RISK LEVEL\*\*\s*\n\[(.*?)\]/,
        );
        if (match) {
          setRiskLevel(match[1].split(" ")[0]);
        }
        setError(null);
      } catch (error) {
        console.error("SLA risk detection error:", error);
        setError(error.message);
        setRiskLevel("Error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskAnalysis();
    // Refresh every 15 minutes
    const interval = setInterval(fetchRiskAnalysis, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level) => {
    if (level === "Error") return "text-gray-600 bg-gray-50 border-gray-200";
    if (level.includes("Critical"))
      return "text-red-600 bg-red-50 border-red-200";
    if (level.includes("High"))
      return "text-orange-600 bg-orange-50 border-orange-200";
    if (level.includes("Medium"))
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <>
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">
              AI SLA Risk Monitor
            </h2>
          </div>
          {!isLoading && (
            <div
              className={`px-2 py-1 rounded-full text-xs font-bold border ${getRiskColor(riskLevel)}`}
            >
              {riskLevel}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-6">
            <Sparkles
              size={32}
              className="mx-auto text-gray-300 mb-2 animate-pulse"
            />
            <p className="text-xs text-gray-500">Analyzing SLA metrics...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <AlertTriangle size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-xs text-gray-500 mb-2">{error}</p>
            {error.includes("API key") && (
              <p className="text-xs text-gray-400">
                Configure OPENAI_API_KEY to enable AI features
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-600 mb-4 line-clamp-3">
              {analysis.split("\n").slice(2, 5).join(" ")}
            </div>
            <button
              onClick={() => setShowFull(true)}
              className="w-full py-2 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
            >
              <Zap size={14} />
              View Full Risk Analysis
            </button>
          </>
        )}
      </section>

      {showFull && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  AI SLA Risk Analysis
                </h2>
              </div>
              <button
                onClick={() => setShowFull(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                {analysis}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Smart Alerts Modal
export const SmartAlertsModal = ({ onClose }) => {
  const [alertAnalysis, setAlertAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState("triage"); // triage or rules

  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/ai/smart-alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ generateRules: mode === "rules" }),
        });
        if (!response.ok) throw new Error("Failed to fetch alerts");
        const data = await response.json();
        setAlertAnalysis(data.result);
      } catch (error) {
        toast.error("Failed to generate alert analysis");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [mode]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-yellow-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  AI Smart Alerts
                </h2>
                <p className="text-sm text-gray-500">
                  Intelligent alert prioritization and rule generation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMode("triage")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                mode === "triage"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Current Alert Triage
            </button>
            <button
              onClick={() => setMode("rules")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                mode === "rules"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Generate Alert Rules
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <AlertTriangle
                size={48}
                className="mx-auto text-gray-300 mb-4 animate-pulse"
              />
              <p className="text-gray-500">Analyzing alert patterns...</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {alertAnalysis}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-sm hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(alertAnalysis);
              toast.success("Alert analysis copied to clipboard");
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-sm hover:bg-yellow-700 flex items-center justify-center gap-2"
          >
            <Copy size={16} />
            Copy Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

// Runbook Generator Modal
export const RunbookGeneratorModal = ({ onClose }) => {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("General");
  const [ticketPattern, setTicketPattern] = useState("");
  const [runbook, setRunbook] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic && !ticketPattern) {
      toast.error("Please provide a topic or ticket pattern");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/runbook-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, category, ticketPattern }),
      });

      if (!response.ok) throw new Error("Failed to generate runbook");

      const data = await response.json();
      setRunbook(data.runbook);
      toast.success("Runbook generated successfully");
    } catch (error) {
      toast.error("Failed to generate runbook");
    } finally {
      setIsLoading(false);
    }
  };

  const copyRunbook = () => {
    navigator.clipboard.writeText(runbook);
    toast.success("Runbook copied to clipboard");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                AI Runbook Generator
              </h2>
              <p className="text-sm text-gray-500">
                Create operational procedures from ticket patterns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {!runbook ? (
          <form onSubmit={handleGenerate} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Runbook Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., VMware vMotion Failure Recovery"
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>General</option>
                <option>VMware</option>
                <option>Storage</option>
                <option>Backup</option>
                <option>Networking</option>
                <option>Cloud</option>
                <option>Security</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Or Generate from Ticket Pattern (Optional)
              </label>
              <input
                type="text"
                value={ticketPattern}
                onChange={(e) => setTicketPattern(e.target.value)}
                placeholder="e.g., Storage latency, Backup failure, VM unresponsive"
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                AI will analyze similar resolved tickets and create a runbook
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!topic && !ticketPattern)}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              {isLoading ? "Generating Runbook..." : "Generate Runbook"}
            </button>
          </form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                  {runbook}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setRunbook("")}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-sm hover:bg-gray-50"
              >
                Generate Another
              </button>
              <button
                onClick={copyRunbook}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-sm hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                Copy Runbook
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
