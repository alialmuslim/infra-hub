import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
        },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { generateRules } = body;

    // Fetch recent alerts/issues from tickets and infrastructure
    const recentTickets = await sql`
      SELECT * FROM tickets 
      WHERE created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
    `;

    const assets = await sql`
      SELECT * FROM infrastructure_assets
      WHERE status IN ('Warning', 'Critical')
      OR cpu_usage > 80
      OR memory_usage > 80
      OR storage_usage > 85
    `;

    const slaMetrics = await sql`
      SELECT * FROM sla_metrics 
      ORDER BY metric_date DESC 
      LIMIT 7
    `;

    // Analyze patterns
    const ticketPatterns = recentTickets.reduce((acc, t) => {
      const key = `${t.asset_id}_${t.severity}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const repeatingIssues = Object.entries(ticketPatterns)
      .filter(([_, count]) => count > 2)
      .map(([key, count]) => {
        const [assetId] = key.split("_");
        const tickets = recentTickets.filter(
          (t) => t.asset_id === parseInt(assetId),
        );
        return {
          assetId,
          count,
          titles: tickets.map((t) => t.title),
        };
      });

    const prompt = `You are an AI Alert Management System for e-Portal InfraHub. Analyze patterns and ${generateRules ? "generate smart alerting rules" : "prioritize current alerts"}.

Recent Activity (Last 7 Days):
- Total Tickets: ${recentTickets.length}
- Critical Severity: ${recentTickets.filter((t) => t.severity === "Critical").length}
- High Severity: ${recentTickets.filter((t) => t.severity === "High").length}
- Repeating Issues: ${repeatingIssues.length} assets with 3+ tickets

High-Risk Infrastructure:
- Warning Status: ${assets.filter((a) => a.status === "Warning").length} assets
- Critical Status: ${assets.filter((a) => a.status === "Critical").length} assets
- High CPU (>80%): ${assets.filter((a) => parseFloat(a.cpu_usage || 0) > 80).length}
- High Memory (>80%): ${assets.filter((a) => parseFloat(a.memory_usage || 0) > 80).length}
- High Storage (>85%): ${assets.filter((a) => parseFloat(a.storage_usage || 0) > 85).length}

Repeating Problems:
${repeatingIssues
  .slice(0, 5)
  .map((r) => `- Asset ID ${r.assetId}: ${r.count} tickets - "${r.titles[0]}"`)
  .join("\n")}

SLA Trend:
- Latest Uptime: ${slaMetrics[0]?.uptime_percentage || "N/A"}%
- Latest Compliance: ${slaMetrics[0]?.compliance_percentage || "N/A"}%

${
  generateRules
    ? `
Generate intelligent alerting rules:

**PROACTIVE ALERT RULES**
[Create 5-7 smart rules that predict problems before they cause outages]

**THRESHOLD RECOMMENDATIONS**
[Specific metric thresholds for each rule - be precise]

**ESCALATION LOGIC**
[When to auto-escalate to senior engineers or management]

**NOISE REDUCTION**
[Rules to suppress duplicate/low-priority alerts]

**AUTOMATION TRIGGERS**
[What automated actions should each alert trigger?]

Format as actionable alert configurations.
`
    : `
Prioritize and triage current alerts:

**CRITICAL - IMMEDIATE ACTION** (Next 1 hour)
[Most urgent issues requiring immediate attention]

**HIGH - URGENT** (Next 4 hours)
[Important issues that need quick resolution]

**MEDIUM - SCHEDULED** (Next 24 hours)
[Issues to address during business hours]

**LOW - MONITORING** (Ongoing watch)
[Trends to monitor but not urgent]

**FALSE POSITIVES / NOISE**
[Alerts that can be safely ignored or suppressed]

For each alert category, specify what action to take and who should handle it.
`
}

Be specific with metric names, thresholds, and actions.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: generateRules ? 0.6 : 0.3,
        max_tokens: 1800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(
        `OpenAI API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    return Response.json({
      result,
      summary: {
        totalTickets: recentTickets.length,
        highRiskAssets: assets.length,
        repeatingIssues: repeatingIssues.length,
      },
    });
  } catch (error) {
    console.error("Error in smart alerts:", error);
    return Response.json(
      { error: error.message || "Failed to generate alerts" },
      { status: 500 },
    );
  }
}
