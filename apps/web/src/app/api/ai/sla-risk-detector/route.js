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

    // Fetch SLA metrics for trend analysis
    const slaHistory = await sql`
      SELECT * FROM sla_metrics 
      ORDER BY metric_date DESC 
      LIMIT 30
    `;

    // Fetch customer SLA targets
    const customers = await sql`SELECT * FROM customers`;

    // Fetch open tickets and their SLA status
    const tickets = await sql`
      SELECT 
        t.*,
        c.name as customer_name,
        c.sla_target_uptime
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.status != 'Closed'
      ORDER BY t.sla_deadline ASC
    `;

    // Calculate risk metrics - handle empty data gracefully
    const latestSLA = slaHistory[0] || {
      uptime_percentage: 0,
      compliance_percentage: 0,
      data_integrity_percentage: 0,
      capacity_utilization_percentage: 0,
    };

    const avgUptime =
      slaHistory.length > 0
        ? slaHistory.reduce(
            (sum, m) => sum + parseFloat(m.uptime_percentage || 0),
            0,
          ) / slaHistory.length
        : 0;

    const uptimeTrend =
      slaHistory.length > 1
        ? parseFloat(slaHistory[0].uptime_percentage || 0) -
          parseFloat(slaHistory[7]?.uptime_percentage || 0)
        : 0;

    const atRiskTickets = tickets.filter((t) => {
      if (!t.sla_deadline) return false;
      const timeToDeadline = new Date(t.sla_deadline) - new Date();
      const hoursToDeadline = timeToDeadline / (1000 * 60 * 60);
      return hoursToDeadline < 4 && t.status !== "Resolved";
    });

    const breachedTickets = tickets.filter((t) => t.sla_breach);

    const riskData = {
      current_uptime: parseFloat(latestSLA.uptime_percentage || 0),
      uptime_trend: uptimeTrend.toFixed(2),
      avg_uptime_30d: avgUptime.toFixed(2),
      compliance_rate: parseFloat(latestSLA.compliance_percentage || 0),
      data_integrity: parseFloat(latestSLA.data_integrity_percentage || 0),
      capacity_utilization: parseFloat(
        latestSLA.capacity_utilization_percentage || 0,
      ),
      at_risk_tickets: atRiskTickets.length,
      breached_tickets: breachedTickets.length,
      total_open_tickets: tickets.length,
      critical_tickets: tickets.filter((t) => t.severity === "Critical").length,
    };

    // Handle case where there's no data yet
    if (
      slaHistory.length === 0 &&
      tickets.length === 0 &&
      customers.length === 0
    ) {
      return Response.json({
        analysis: `**OVERALL RISK LEVEL**
[Low - No Data Available]

**SYSTEM STATUS**
The InfraHub system is newly initialized with no historical data yet. This is normal for a new deployment.

**RECOMMENDED ACTIONS**
1. Begin monitoring infrastructure assets and recording SLA metrics
2. Create customer records with SLA targets
3. Start tracking tickets and incidents
4. Allow 7-14 days for meaningful trend analysis

**NEXT STEPS**
Once data begins flowing into the system, AI-powered risk detection will automatically analyze:
- Uptime trends and patterns
- SLA compliance risks
- Ticket resolution performance
- Capacity utilization alerts`,
        riskData,
        atRiskTickets: [],
      });
    }

    const prompt = `You are an AI SLA Risk Management System for e-Portal InfraHub. Analyze the current SLA health and predict risks.

Current SLA Metrics:
- Current Uptime: ${riskData.current_uptime}%
- 7-Day Uptime Trend: ${riskData.uptime_trend}% ${uptimeTrend > 0 ? "improving" : "declining"}
- 30-Day Average: ${riskData.avg_uptime_30d}%
- Compliance Rate: ${riskData.compliance_rate}%
- Data Integrity: ${riskData.data_integrity}%
- Capacity Utilization: ${riskData.capacity_utilization}%

Ticket Status:
- Total Open Tickets: ${riskData.total_open_tickets}
- Critical Tickets: ${riskData.critical_tickets}
- At Risk of SLA Breach (<4h): ${riskData.at_risk_tickets}
- Already Breached: ${riskData.breached_tickets}

Customer SLA Targets:
${customers.length > 0 ? customers.map((c) => `- ${c.name} (${c.tier}): ${c.sla_target_uptime}% uptime target`).join("\n") : "- No customers configured yet"}

Provide a comprehensive SLA risk assessment:

**OVERALL RISK LEVEL**
[Critical/High/Medium/Low with justification]

**IMMEDIATE THREATS** (Next 24-48 hours)
[List specific SLA metrics or tickets at risk of breach]

**TREND ANALYSIS**
[Are things getting better or worse? Specific concerns?]

**PREDICTED SLA BREACHES**
[Which customer SLAs are at risk in the next 7-14 days?]

**RECOMMENDED ACTIONS** (Priority Order)
[Specific actions to prevent breaches - be actionable and time-bound]

**ESCALATION REQUIREMENTS**
[Which issues require immediate management attention?]

Be specific, data-driven, and actionable. Format with markdown.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
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
    const analysis = data.choices[0].message.content;

    return Response.json({
      analysis,
      riskData,
      atRiskTickets: atRiskTickets.map((t) => ({
        id: t.id,
        number: t.ticket_number,
        title: t.title,
        customer: t.customer_name,
        deadline: t.sla_deadline,
      })),
    });
  } catch (error) {
    console.error("Error in SLA risk detector:", error);
    console.error("Error stack:", error.stack);
    return Response.json(
      { error: error.message || "Failed to analyze SLA risks" },
      { status: 500 },
    );
  }
}
